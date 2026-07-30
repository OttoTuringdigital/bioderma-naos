/* TD_Figma_Product_Page_GTM_v1.0.4.html */
(function () {
  'use strict';

  var VERSION = '1.0.4';
  var INIT_RETRY_LIMIT = 240;
  var STABILIZE_LIMIT = 120;
  var state = {
    mode: '',
    initialized: false,
    initRetryCount: 0,
    stabilizeCount: 0,
    initTimer: null,
    stabilizeTimer: null,
    refreshTimer: null,
    favObserver: null,
    contentObserver: null,
    observedController: null,
    originalFav: null,
    proxyFav: null,
    collapseStack: null
  };

  function safeQuery(selector, context) {
    try { return (context || document).querySelector(selector); } catch (error) { return null; }
  }

  function safeQueryAll(selector, context) {
    try { return (context || document).querySelectorAll(selector); } catch (error) { return []; }
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  }

  function closestBySelector(node, selector) {
    var current = node;
    while (current && current !== document) {
      if (current.matches && current.matches(selector)) { return current; }
      current = current.parentNode;
    }
    return null;
  }

  function directChildrenBySelector(node, selector) {
    var children = node ? toArray(node.children) : [];
    var output = [];
    var i;
    for (i = 0; i < children.length; i += 1) {
      if (children[i].matches && children[i].matches(selector)) { output.push(children[i]); }
    }
    return output;
  }

  function detectMode() {
    if (safeQuery('#sidemenu') && safeQuery('.salepage-top-left') && safeQuery('.salepage-top-right')) { return 'desktop'; }
    if (safeQuery('.salepage-fix-bottom .salepage-btn') || safeQuery('.slider-nav-ul-recommend')) { return 'mobile'; }
    return '';
  }

  function setMode(mode) {
    state.mode = mode;
    document.documentElement.setAttribute('data-tdpp-v1-active', 'true');
    document.documentElement.setAttribute('data-tdpp-v1-mode', mode);
    document.documentElement.setAttribute('data-tdpp-v1-version', VERSION);
  }

  function showCloneNode(node) {
    if (!node) { return; }
    node.classList.remove('ng-hide');
    node.classList.remove('ng-hide-animate');
    node.removeAttribute('hidden');
    if (node.style && node.style.display === 'none') { node.style.display = ''; }
  }

  function cleanClone(root) {
    var nodes = [root].concat(toArray(safeQueryAll('*', root)));
    var attrs;
    var classes;
    var i;
    var j;
    for (i = 0; i < nodes.length; i += 1) {
      attrs = toArray(nodes[i].attributes);
      for (j = 0; j < attrs.length; j += 1) {
        if (/^(?:data-)?ng-|^x-ng-|^ng:/.test(attrs[j].name) ||
            attrs[j].name === 'data-ns-ga-event-track' ||
            attrs[j].name === 'data-qe-id' ||
            attrs[j].name === 'id' ||
            attrs[j].name === 'onclick') {
          nodes[i].removeAttribute(attrs[j].name);
        }
      }
      classes = toArray(nodes[i].classList);
      for (j = 0; j < classes.length; j += 1) {
        if (/^ng-(?:enter|leave|animate)/.test(classes[j])) { nodes[i].classList.remove(classes[j]); }
      }
    }
    root.setAttribute('data-tdpp-v1-cloned-node', 'true');
    return root;
  }

  function cloneElement(source) {
    if (!source) { return null; }
    return cleanClone(source.cloneNode(true));
  }

  function sourceFingerprint(source) {
    var text;
    var hash = 2166136261;
    var i;
    if (!source) { return ''; }
    text = String(source.innerHTML || '') + '|' + normalizeText(source.textContent || '') + '|' + source.childElementCount;
    for (i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return String(hash >>> 0) + ':' + text.length;
  }

  function hasMeaningfulContent(node) {
    if (!node) { return false; }
    return normalizeText(node.textContent).length > 0 || safeQuery('img,svg,a[href]', node) !== null;
  }

  function setCloneExpanded(group, expanded) {
    var header = safeQuery('.tdpp-v1-clone-header', group);
    var panel = safeQuery('.tdpp-v1-clone-panel', group);
    var icon = safeQuery('.tdpp-v1-clone-icon', group);
    group.setAttribute('data-tdpp-v1-expanded', expanded ? 'true' : 'false');
    if (header) { header.setAttribute('aria-expanded', expanded ? 'true' : 'false'); }
    if (panel) {
      if (expanded) {
        panel.removeAttribute('hidden');
        panel.style.display = 'block';
      } else {
        panel.setAttribute('hidden', 'hidden');
        panel.style.display = 'none';
      }
    }
    if (icon) {
      icon.classList.toggle('rotate-to-top', expanded);
      icon.classList.toggle('rotate-to-bottom', !expanded);
    }
  }

  function setPaymentDetailExpanded(toggle, detail, expanded) {
    var icon = safeQuery('i', toggle);
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (expanded) {
      detail.removeAttribute('hidden');
      detail.style.display = 'block';
    } else {
      detail.setAttribute('hidden', 'hidden');
      detail.style.display = 'none';
    }
    if (icon) {
      icon.classList.toggle('rotate-to-top', expanded);
      icon.classList.toggle('rotate-to-bottom', !expanded);
    }
  }

  function preparePaymentItem(item, index) {
    var details = directChildrenBySelector(item, 'ul.payment-shipping-subtitle');
    var detail = null;
    var toggle = null;
    var i;
    var detailId;
    var icon;
    showCloneNode(item);
    item.classList.add('tdpp-v1-payment-item');

    for (i = 0; i < details.length; i += 1) {
      if (normalizeText(details[i].textContent)) {
        detail = details[i];
        break;
      }
      if (details[i].parentNode) { details[i].parentNode.removeChild(details[i]); }
    }

    toggle = safeQuery('a.payment-shipping-label', item);
    if (!detail) {
      if (toggle && !normalizeText(toggle.textContent)) { toggle.parentNode.removeChild(toggle); }
      return item;
    }

    detailId = 'tdpp-v1-payment-detail-' + index;
    showCloneNode(detail);
    if (toggle) { showCloneNode(toggle); }
    detail.id = detailId;
    detail.classList.add('tdpp-v1-payment-detail');
    detail.setAttribute('data-tdpp-v1-payment-detail', 'true');
    setPaymentDetailExpanded(toggle || document.createElement('span'), detail, false);

    if (toggle) {
      toggle.removeAttribute('href');
      toggle.classList.add('tdpp-v1-payment-detail-toggle');
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-controls', detailId);
      icon = safeQuery('i', toggle);
      if (icon) {
        icon.classList.remove('rotate-to-top');
        icon.classList.add('rotate-to-bottom');
      }
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setPaymentDetailExpanded(toggle, detail, toggle.getAttribute('aria-expanded') !== 'true');
      });
      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle.click();
        }
      });
      setPaymentDetailExpanded(toggle, detail, false);
    } else {
      detail.removeAttribute('hidden');
      detail.style.display = 'block';
    }
    return item;
  }

  function clonePromotionContent(body, source) {
    var promotion = source && source.matches && source.matches('.salepage-promotion') ? source : safeQuery('.salepage-promotion', source);
    var list = safeQuery('ul', promotion || source);
    var cloneList;
    var items;
    var clone;
    var i;
    if (!list) { return false; }
    cloneList = document.createElement('ul');
    cloneList.className = 'tdpp-v1-promotion-list';
    items = directChildrenBySelector(list, 'li.salepage-promotion-li');
    for (i = 0; i < items.length; i += 1) {
      clone = cloneElement(items[i]);
      if (clone) {
        showCloneNode(clone);
        cloneList.appendChild(clone);
      }
    }
    if (!hasMeaningfulContent(cloneList)) { return false; }
    body.appendChild(cloneList);
    return true;
  }

  function clonePaymentContent(body, source) {
    var sourceList = safeQuery('.payment-type-list', source) || safeQuery('ul', source);
    var list;
    var items;
    var clone;
    var i;
    if (!sourceList) { return false; }
    list = document.createElement('ul');
    list.className = 'payment-type-list tdpp-v1-payment-list';
    items = directChildrenBySelector(sourceList, 'li.payment-type-item');
    for (i = 0; i < items.length; i += 1) {
      clone = cloneElement(items[i]);
      if (clone) { list.appendChild(preparePaymentItem(clone, i)); }
    }
    if (!hasMeaningfulContent(list)) { return false; }
    body.appendChild(list);
    return true;
  }

  function cloneShippingContent(body, source) {
    var sourceList = safeQuery('ul', source);
    var list;
    var items;
    var clone;
    var i;
    if (!sourceList) { return false; }
    list = document.createElement('ul');
    list.className = 'tdpp-v1-shipping-list';
    items = directChildrenBySelector(sourceList, 'li.shipping-li');
    for (i = 0; i < items.length; i += 1) {
      clone = cloneElement(items[i]);
      if (clone) {
        showCloneNode(clone);
        list.appendChild(clone);
      }
    }
    if (!hasMeaningfulContent(list)) { return false; }
    body.appendChild(list);
    return true;
  }

  function cloneFeatureContent(body, source) {
    var sourceBody = safeQuery('.collapse-body', source);
    var children;
    var clone;
    var i;
    if (!sourceBody) { return false; }
    children = toArray(sourceBody.children);
    for (i = 0; i < children.length; i += 1) {
      clone = cloneElement(children[i]);
      if (clone) {
        showCloneNode(clone);
        body.appendChild(clone);
      }
    }
    return hasMeaningfulContent(body);
  }

  function cloneRelatedContent(body, source) {
    var sourceBody = source && source.classList && source.classList.contains('collapse-group') ? safeQuery('.collapse-body', source) : source;
    var related = safeQuery('.related-category-list', sourceBody || source) || sourceBody;
    var clone = cloneElement(related);
    if (!clone) { return false; }
    showCloneNode(clone);
    body.appendChild(clone);
    return hasMeaningfulContent(body);
  }

  function populateCloneBody(type, body, source) {
    if (type === 'promotion') { return clonePromotionContent(body, source); }
    if (type === 'payment') { return clonePaymentContent(body, source); }
    if (type === 'shipping') { return cloneShippingContent(body, source); }
    if (type === 'feature') { return cloneFeatureContent(body, source); }
    if (type === 'related') { return cloneRelatedContent(body, source); }
    return false;
  }

  function createCloneShell(type, title) {
    var group = document.createElement('div');
    var header = document.createElement('button');
    var titleNode = document.createElement('span');
    var iconWrap = document.createElement('span');
    var icon = document.createElement('i');
    var panel = document.createElement('div');
    var body = document.createElement('div');

    group.className = 'collapse-group tdpp-v1-clone-collapse';
    group.setAttribute('data-tdpp-v1-clone-collapse', type);
    group.setAttribute('data-tdpp-v1-generated', 'true');

    header.type = 'button';
    header.className = 'collapse-header tdpp-v1-clone-header';
    header.setAttribute('aria-controls', 'tdpp-v1-panel-' + type);
    titleNode.className = 'collapse-header-title tdpp-v1-clone-title';
    titleNode.textContent = title;
    iconWrap.className = 'collapse-header-right tdpp-v1-clone-icon-wrap';
    icon.className = 'ico ico-chevron-down tdpp-v1-clone-icon rotate-to-bottom';
    icon.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(icon);
    header.appendChild(titleNode);
    header.appendChild(iconWrap);

    panel.id = 'tdpp-v1-panel-' + type;
    panel.className = 'collapse-panel tdpp-v1-clone-panel';
    body.className = 'collapse-body tdpp-v1-clone-body';
    panel.appendChild(body);
    group.appendChild(header);
    group.appendChild(panel);

    header.addEventListener('click', function () {
      setCloneExpanded(group, group.getAttribute('data-tdpp-v1-expanded') !== 'true');
    });
    return group;
  }

  function refreshCloneGroup(group, type, source, openByDefault) {
    var oldBody = safeQuery('.tdpp-v1-clone-body', group);
    var panel = safeQuery('.tdpp-v1-clone-panel', group);
    var newBody = document.createElement('div');
    var expanded = group.getAttribute('data-tdpp-v1-expanded');
    var populated;
    newBody.className = 'collapse-body tdpp-v1-clone-body';
    populated = populateCloneBody(type, newBody, source);
    if (!populated) { return false; }
    if (oldBody && oldBody.parentNode) { oldBody.parentNode.replaceChild(newBody, oldBody); }
    else if (panel) { panel.appendChild(newBody); }
    group.setAttribute('data-tdpp-v1-source-fingerprint', sourceFingerprint(source));
    group.setAttribute('data-tdpp-v1-clone-ready', 'true');
    setCloneExpanded(group, expanded == null ? !!openByDefault : expanded === 'true');
    return true;
  }

  function markOriginalHidden(source) {
    if (source) { source.setAttribute('data-tdpp-v1-original-block', 'hidden'); }
  }

  function queryOriginal(selector) {
    var nodes = toArray(safeQueryAll(selector));
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (!closestBySelector(nodes[i], '[data-tdpp-v1-generated="true"]')) { return nodes[i]; }
    }
    return null;
  }

  function getCollapseStack() {
    var anchor;
    var stack;
    if (state.collapseStack && document.documentElement.contains(state.collapseStack)) { return state.collapseStack; }
    stack = safeQuery('[data-tdpp-v1-collapse-stack]');
    if (stack) {
      state.collapseStack = stack;
      return stack;
    }
    anchor = state.mode === 'desktop' ? safeQuery('.salepage-top-right .detail-info-wrapper') : safeQuery('.salepage-info');
    if (!anchor || !anchor.parentNode) { return null; }
    stack = document.createElement('div');
    stack.className = 'tdpp-v1-collapse-stack';
    stack.setAttribute('data-tdpp-v1-collapse-stack', state.mode);
    stack.setAttribute('data-tdpp-v1-generated', 'true');
    anchor.parentNode.insertBefore(stack, anchor.nextSibling);
    state.collapseStack = stack;
    return stack;
  }

  function findSources() {
    var payment = queryOriginal('#SalePageIndexController .payment-group');
    var shipping = queryOriginal('#SalePageIndexController .shipping-group');
    var promotion;
    var feature;
    var related;
    if (state.mode === 'desktop') {
      promotion = queryOriginal('.salepage-top-left .salepage-promotion') || queryOriginal('.salepage-promotion');
      feature = queryOriginal('.salepage-top-right .collapse-group[ng-if="SalePageIndexCtrl.IsShowProductFeature"]');
      related = queryOriginal('.salepage-top-right .collapse-group[ng-if="SalePageIndexCtrl.IsFirstRender"]') || queryOriginal('.salepage-top-right .salepage-related-category-list');
    } else {
      promotion = queryOriginal('section[ng-if*="FilteredPromotionList"]') || queryOriginal('.salepage-promotion');
      feature = queryOriginal('.collapse-group[ng-if="SalePageIndexCtrl.IsShowProductFeature"]');
      related = queryOriginal('.salepage-related-category-list');
    }
    return { promotion: promotion, payment: payment, shipping: shipping, feature: feature, related: related };
  }

  function ensureCloneCollapses() {
    var stack = getCollapseStack();
    var sources;
    var specs;
    var source;
    var group;
    var currentFingerprint;
    var i;
    var combined;
    var readyCount = 0;
    if (!stack) { return false; }
    sources = findSources();
    specs = [
      { type: 'promotion', title: '本商品適用活動', open: true },
      { type: 'payment', title: '付款方式', open: false },
      { type: 'shipping', title: '運送方式', open: false },
      { type: 'feature', title: '商品特色', open: false },
      { type: 'related', title: '商品相關分類', open: false }
    ];

    for (i = 0; i < specs.length; i += 1) {
      source = sources[specs[i].type];
      group = safeQuery('[data-tdpp-v1-clone-collapse="' + specs[i].type + '"]', stack);
      if (!source) {
        if (group && group.getAttribute('data-tdpp-v1-clone-ready') === 'true') { readyCount += 1; }
        continue;
      }
      currentFingerprint = sourceFingerprint(source);
      if (!group) {
        group = createCloneShell(specs[i].type, specs[i].title);
        stack.appendChild(group);
      }
      if (group.getAttribute('data-tdpp-v1-source-fingerprint') !== currentFingerprint ||
          !hasMeaningfulContent(safeQuery('.tdpp-v1-clone-body', group))) {
        refreshCloneGroup(group, specs[i].type, source, specs[i].open);
      } else if (!group.hasAttribute('data-tdpp-v1-expanded')) {
        setCloneExpanded(group, specs[i].open);
      }
      if (group.getAttribute('data-tdpp-v1-clone-ready') === 'true') {
        readyCount += 1;
        markOriginalHidden(source);
      }
    }

    for (i = 0; i < specs.length; i += 1) {
      group = safeQuery('[data-tdpp-v1-clone-collapse="' + specs[i].type + '"]', stack);
      if (group) { stack.appendChild(group); }
    }

    if (sources.payment && sources.shipping) {
      combined = closestBySelector(sources.payment, '.collapse-group');
      if (combined && combined === closestBySelector(sources.shipping, '.collapse-group')) {
        combined.setAttribute('data-tdpp-v1-original-block', 'hidden');
      }
    }
    stack.setAttribute('data-tdpp-v1-ready-count', String(readyCount));
    return readyCount > 0;
  }

  function markReviewWrappers() {
    var wrappers = toArray(safeQueryAll('#SalePageIndexController .star-rate-wrapper'));
    var i;
    for (i = 0; i < wrappers.length; i += 1) {
      if (!closestBySelector(wrappers[i], '.salepage-info')) {
        wrappers[i].setAttribute('data-tdpp-v1-review', 'true');
      }
    }
  }

  function isFavActive(original) {
    var icon = safeQuery('i', original);
    return !!(icon && (icon.classList.contains('ico-heart-fill') || icon.classList.contains('cms-primaryHeartBtnBgColor')));
  }

  function syncFavState() {
    var originalIcon;
    var proxyIcon;
    var active;
    if (!state.originalFav || !state.proxyFav) { return; }
    originalIcon = safeQuery('i', state.originalFav);
    proxyIcon = safeQuery('i', state.proxyFav);
    active = isFavActive(state.originalFav);
    state.proxyFav.setAttribute('data-tdpp-v1-fav-active', active ? 'true' : 'false');
    state.proxyFav.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (originalIcon && proxyIcon) { proxyIcon.className = originalIcon.className; }
  }

  function buildFavProxy() {
    var original = safeQuery('#SalePageIndexController .salepage-info .price-wrapper [data-qe-id="body-add-to-wishlist-icon"]');
    var target;
    var proxy;
    var addButton;
    if (!original) { return false; }
    target = state.mode === 'desktop'
      ? safeQuery('#SalePageIndexController .qty-wrapper')
      : safeQuery('.salepage-fix-bottom .salepage-btn');
    if (!target) { return false; }

    proxy = safeQuery('[data-tdpp-v1-fav-proxy="true"]');
    if (!proxy) {
      proxy = cloneElement(original);
      proxy.removeAttribute('href');
      proxy.classList.remove('pull-right');
      proxy.classList.add('tdpp-v1-fav-proxy');
      proxy.setAttribute('data-tdpp-v1-fav-proxy', 'true');
      proxy.setAttribute('data-tdpp-v1-generated', 'true');
      proxy.setAttribute('role', 'button');
      proxy.setAttribute('tabindex', '0');
      proxy.setAttribute('aria-label', '收藏商品');
      proxy.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (state.originalFav) { state.originalFav.click(); }
        window.setTimeout(syncFavState, 0);
        window.setTimeout(syncFavState, 120);
      });
      proxy.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          proxy.click();
        }
      });
    }

    if (state.mode === 'desktop') {
      if (proxy.parentNode !== target) { target.appendChild(proxy); }
    } else {
      addButton = safeQuery('.add-to-cart-btn', target);
      if (proxy.parentNode !== target || (addButton && proxy.nextSibling !== addButton)) {
        target.insertBefore(proxy, addButton || target.firstChild);
      }
    }
    target.setAttribute('data-tdpp-v1-has-fav-proxy', 'true');
    original.setAttribute('data-tdpp-v1-original-fav', 'hidden');
    state.originalFav = original;
    state.proxyFav = proxy;
    syncFavState();

    if (state.favObserver) { state.favObserver.disconnect(); }
    if (window.MutationObserver) {
      state.favObserver = new MutationObserver(syncFavState);
      state.favObserver.observe(safeQuery('i', original) || original, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    return true;
  }

  function scheduleEnhancements(delay) {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(ensureEnhancements, typeof delay === 'number' ? delay : 80);
  }

  function mutationIsGeneratedOnly(record) {
    var added = toArray(record.addedNodes);
    var i;
    if (closestBySelector(record.target, '[data-tdpp-v1-generated="true"]')) { return true; }
    if (!added.length) { return false; }
    for (i = 0; i < added.length; i += 1) {
      if (added[i].nodeType !== 1) { return false; }
      if (!(added[i].getAttribute && added[i].getAttribute('data-tdpp-v1-generated') === 'true')) { return false; }
    }
    return true;
  }

  function installContentObserver() {
    var controller = safeQuery('#SalePageIndexController');
    if (!window.MutationObserver || !controller) { return; }
    if (state.contentObserver && state.observedController === controller) { return; }
    if (state.contentObserver) { state.contentObserver.disconnect(); }
    state.observedController = controller;
    state.contentObserver = new MutationObserver(function (records) {
      var i;
      for (i = 0; i < records.length; i += 1) {
        if (!mutationIsGeneratedOnly(records[i])) {
          scheduleEnhancements(80);
          return;
        }
      }
    });
    state.contentObserver.observe(controller, { childList: true, subtree: true, characterData: true });
  }

  function ensureEnhancements() {
    if (!state.mode) { return; }
    document.documentElement.setAttribute('data-tdpp-v1-active', 'true');
    document.documentElement.setAttribute('data-tdpp-v1-mode', state.mode);
    document.documentElement.setAttribute('data-tdpp-v1-version', VERSION);
    ensureCloneCollapses();
    markReviewWrappers();
    buildFavProxy();
    installContentObserver();
    if (state.stabilizeCount < STABILIZE_LIMIT) {
      state.stabilizeCount += 1;
      window.clearTimeout(state.stabilizeTimer);
      state.stabilizeTimer = window.setTimeout(ensureEnhancements, 250);
    }
  }

  function pushReadyEvent() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'td_product_page_ready', td_product_page_version: VERSION, td_product_page_mode: state.mode });
  }

  function initialize() {
    var mode;
    if (state.initialized) {
      scheduleEnhancements(0);
      return;
    }
    mode = detectMode();
    if (!mode || !safeQuery('#SalePageIndexController') || !safeQuery('h1.salepage-title')) {
      if (state.initRetryCount < INIT_RETRY_LIMIT) {
        state.initRetryCount += 1;
        window.clearTimeout(state.initTimer);
        state.initTimer = window.setTimeout(initialize, 250);
      }
      return;
    }
    setMode(mode);
    state.initialized = true;
    state.stabilizeCount = 0;
    ensureEnhancements();
    pushReadyEvent();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initialize, { once: true }); }
  else { initialize(); }
  window.addEventListener('load', initialize, { once: true });
  window.addEventListener('pageshow', function () { window.setTimeout(initialize, 0); });
  window.setTimeout(initialize, 0);
}());
