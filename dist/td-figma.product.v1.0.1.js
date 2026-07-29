/* TD_Figma_Product_Page_GTM_v1.0.1.html */
(function () {
  'use strict';

  var VERSION = '1.0.1';
  var RETRY_LIMIT = 28;
  var state = {
    mode: '',
    initialized: false,
    retryCount: 0,
    retryTimer: null,
    favObserver: null,
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
            attrs[j].name === 'id') {
          nodes[i].removeAttribute(attrs[j].name);
        }
      }
      classes = toArray(nodes[i].classList);
      for (j = 0; j < classes.length; j += 1) {
        if (/^ng-(?:hide|show|enter|leave|animate)/.test(classes[j])) { nodes[i].classList.remove(classes[j]); }
      }
      if (nodes[i].style && nodes[i].style.display === 'none') { nodes[i].style.display = ''; }
    }
    return root;
  }

  function cloneElement(source) {
    if (!source) { return null; }
    return cleanClone(source.cloneNode(true));
  }

  function appendClonedChildren(target, source, excludedSelectors) {
    var children;
    var child;
    var excluded;
    var i;
    var j;
    if (!target || !source) { return; }
    children = toArray(source.children);
    for (i = 0; i < children.length; i += 1) {
      excluded = false;
      for (j = 0; j < excludedSelectors.length; j += 1) {
        if (children[i].matches && children[i].matches(excludedSelectors[j])) { excluded = true; break; }
      }
      if (!excluded) {
        child = cloneElement(children[i]);
        if (child) { target.appendChild(child); }
      }
    }
  }

  function setCloneExpanded(group, expanded) {
    var header = safeQuery('.tdpp-v1-clone-header', group);
    var panel = safeQuery('.tdpp-v1-clone-panel', group);
    var icon = safeQuery('.tdpp-v1-clone-icon', group);
    group.setAttribute('data-tdpp-v1-expanded', expanded ? 'true' : 'false');
    if (header) { header.setAttribute('aria-expanded', expanded ? 'true' : 'false'); }
    if (panel) {
      if (expanded) { panel.removeAttribute('hidden'); }
      else { panel.setAttribute('hidden', 'hidden'); }
    }
    if (icon) {
      icon.classList.toggle('rotate-to-top', expanded);
      icon.classList.toggle('rotate-to-bottom', !expanded);
    }
  }

  function createCloneGroup(type, title, source, openByDefault) {
    var group = document.createElement('div');
    var header = document.createElement('button');
    var titleNode = document.createElement('span');
    var iconWrap = document.createElement('span');
    var icon = document.createElement('i');
    var panel = document.createElement('div');
    var body = document.createElement('div');
    var sourceBody;
    var sourcePromotion;
    var cloned;

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

    if (type === 'promotion') {
      sourcePromotion = source.matches && source.matches('.salepage-promotion') ? source : safeQuery('.salepage-promotion', source);
      appendClonedChildren(body, sourcePromotion || source, ['.salepage-promotion-caption', '.salepage-promotion-more', '.salepage-divider']);
    } else if (type === 'feature' || (type === 'related' && source.classList && source.classList.contains('collapse-group'))) {
      sourceBody = safeQuery('.collapse-body', source);
      if (sourceBody) { appendClonedChildren(body, sourceBody, []); }
      else {
        cloned = cloneElement(source);
        if (cloned) { body.appendChild(cloned); }
      }
    } else {
      cloned = cloneElement(source);
      if (cloned) { body.appendChild(cloned); }
    }

    panel.appendChild(body);
    group.appendChild(header);
    group.appendChild(panel);
    header.addEventListener('click', function () {
      setCloneExpanded(group, group.getAttribute('data-tdpp-v1-expanded') !== 'true');
    });
    setCloneExpanded(group, !!openByDefault);
    return group;
  }

  function markOriginalHidden(source) {
    if (source) { source.setAttribute('data-tdpp-v1-original-block', 'hidden'); }
  }

  function getCollapseStack() {
    var anchor;
    var stack;
    if (state.collapseStack && document.documentElement.contains(state.collapseStack)) { return state.collapseStack; }
    anchor = state.mode === 'desktop' ? safeQuery('.salepage-top-right .detail-info-wrapper') : safeQuery('.salepage-info');
    if (!anchor || !anchor.parentNode) { return null; }
    stack = document.createElement('div');
    stack.className = 'tdpp-v1-collapse-stack';
    stack.setAttribute('data-tdpp-v1-collapse-stack', state.mode);
    anchor.parentNode.insertBefore(stack, anchor.nextSibling);
    state.collapseStack = stack;
    return stack;
  }

  function findSources() {
    var payment = safeQuery('#SalePageIndexController .payment-group:not([data-tdpp-v1-original-block])');
    var shipping = safeQuery('#SalePageIndexController .shipping-group:not([data-tdpp-v1-original-block])');
    var promotion;
    var feature;
    var related;
    if (state.mode === 'desktop') {
      promotion = safeQuery('.salepage-top-left .salepage-promotion:not([data-tdpp-v1-original-block])');
      feature = safeQuery('.salepage-top-right .collapse-group[ng-if="SalePageIndexCtrl.IsShowProductFeature"]:not([data-tdpp-v1-original-block])');
      related = safeQuery('.salepage-top-right .collapse-group[ng-if="SalePageIndexCtrl.IsFirstRender"]:not([data-tdpp-v1-original-block])');
    } else {
      promotion = safeQuery('section[ng-if*="FilteredPromotionList"]:not([data-tdpp-v1-original-block])');
      feature = safeQuery('.collapse-group[ng-if="SalePageIndexCtrl.IsShowProductFeature"]:not([data-tdpp-v1-original-block])');
      related = safeQuery('.salepage-related-category-list:not([data-tdpp-v1-original-block])');
    }
    return { promotion: promotion, payment: payment, shipping: shipping, feature: feature, related: related };
  }

  function ensureCloneCollapses() {
    var stack = getCollapseStack();
    var sources;
    var specs;
    var source;
    var group;
    var i;
    var combined;
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
      if (safeQuery('[data-tdpp-v1-clone-collapse="' + specs[i].type + '"]', stack)) { continue; }
      source = sources[specs[i].type];
      if (!source) { continue; }
      group = createCloneGroup(specs[i].type, specs[i].title, source, specs[i].open);
      stack.appendChild(group);
      markOriginalHidden(source);
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
    return safeQueryAll('[data-tdpp-v1-clone-collapse]', stack).length > 0;
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

  function ensureEnhancements() {
    ensureCloneCollapses();
    markReviewWrappers();
    buildFavProxy();
    if (state.retryCount < RETRY_LIMIT) {
      state.retryCount += 1;
      window.clearTimeout(state.retryTimer);
      state.retryTimer = window.setTimeout(ensureEnhancements, 250);
    }
  }

  function pushReadyEvent() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'td_product_page_ready', td_product_page_version: VERSION, td_product_page_mode: state.mode });
  }

  function initialize() {
    var mode;
    if (state.initialized) { return; }
    mode = detectMode();
    if (!mode || !safeQuery('#SalePageIndexController') || !safeQuery('h1.salepage-title')) {
      if (state.retryCount < RETRY_LIMIT) {
        state.retryCount += 1;
        state.retryTimer = window.setTimeout(initialize, 250);
      }
      return;
    }
    state.retryCount = 0;
    setMode(mode);
    ensureEnhancements();
    state.initialized = true;
    pushReadyEvent();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initialize, { once: true }); }
  else { initialize(); }
  window.setTimeout(initialize, 0);
}());
