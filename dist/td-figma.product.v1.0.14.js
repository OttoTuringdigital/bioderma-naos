/* TD_Figma_Product_Page_GTM_v1.0.14.html */
(function () {
  'use strict';

  var VERSION = '1.0.14';
  var INIT_RETRY_LIMIT = 240;
  var SOURCE_RETRY_LIMIT = 100;
  var SOURCE_STABLE_REQUIRED = 4;
  var SOURCE_RETRY_DELAY = 200;
  var state = {
    mode: '',
    initialized: false,
    initRetryCount: 0,
    sourceRetryCount: 0,
    sourceStableCount: 0,
    sourceStableKey: '',
    initTimer: null,
    sourceTimer: null,
    favTimer: null,
    favRetryCount: 0,
    favObserver: null,
    originalFav: null,
    proxyFav: null,
    reviewTimer: null,
    reviewRetryCount: 0,
    reviewMoved: false,
    ratingTimer: null,
    ratingRetryCount: 0,
    collapseStack: null,
    collapseBuilt: false,
    readyEventSent: false
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
    if (!node || node.nodeType !== 1) { return; }
    node.classList.remove('ng-hide');
    node.classList.remove('ng-hide-animate');
    node.classList.remove('collapse-show');
    node.removeAttribute('hidden');
    if (node.style) {
      if (node.style.display === 'none') { node.style.removeProperty('display'); }
      if (node.style.visibility === 'hidden') { node.style.removeProperty('visibility'); }
      if (node.style.opacity === '0') { node.style.removeProperty('opacity'); }
    }
  }

  function cleanClone(root) {
    var nodes = [root].concat(toArray(safeQueryAll('*', root)));
    var attrs;
    var classes;
    var i;
    var j;
    for (i = 0; i < nodes.length; i += 1) {
      showCloneNode(nodes[i]);
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

  function appendCleanChildren(source, target) {
    var children;
    var clone;
    var i;
    if (!source || !target) { return; }
    children = toArray(source.childNodes);
    for (i = 0; i < children.length; i += 1) {
      clone = children[i].cloneNode(true);
      if (clone.nodeType === 1) { cleanClone(clone); }
      target.appendChild(clone);
    }
  }

  function copyLinkAttributes(source, target) {
    var attrs = ['href', 'target', 'rel', 'title'];
    var i;
    var value;
    if (!source || !target) { return; }
    for (i = 0; i < attrs.length; i += 1) {
      value = source.getAttribute(attrs[i]);
      if (value) { target.setAttribute(attrs[i], value); }
    }
  }

  function queryOriginal(selector) {
    var nodes = toArray(safeQueryAll(selector));
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (!closestBySelector(nodes[i], '[data-tdpp-v1-generated="true"]')) { return nodes[i]; }
    }
    return null;
  }

  function getTopLevelItems(root, selector) {
    var list;
    if (!root) { return []; }
    list = safeQuery('ul', root);
    return directChildrenBySelector(list, selector || 'li');
  }

  function findSources() {
    return {
      promotion: queryOriginal('.collapse-group.salepage-promotion'),
      payment: queryOriginal('#SalePageIndexController .payment-group'),
      shipping: queryOriginal('#SalePageIndexController .shipping-group'),
      feature: queryOriginal('[ng-if="SalePageIndexCtrl.IsShowProductFeature"]'),
      related: queryOriginal('[ng-if="SalePageIndexCtrl.IsFirstRender"]')
    };
  }

  function getSourceTitle(type, source) {
    var node = null;
    if (!source) { return ''; }
    if (type === 'promotion') { node = safeQuery('.salepage-promotion-caption', source); }
    if (type === 'payment' || type === 'shipping') { node = safeQuery('.payment-shipping-title', source); }
    if (type === 'feature') { node = safeQuery('.collapse-header-title', source); }
    if (type === 'related') { node = safeQuery('.collapse-header-title', source) || safeQuery('.related-category-list__title', source); }
    return normalizeText(node ? node.textContent : '');
  }

  function getSourceItems(type, source) {
    if (!source) { return []; }
    if (type === 'promotion') { return getTopLevelItems(source, 'li'); }
    if (type === 'payment') { return getTopLevelItems(source, 'li'); }
    if (type === 'shipping') { return getTopLevelItems(source, 'li'); }
    if (type === 'feature') {
      var featureList = safeQuery('.salepage-feature', source);
      return directChildrenBySelector(featureList, 'li');
    }
    if (type === 'related') { return toArray(safeQueryAll('.related-category-list__category-item-wrapper', source)); }
    return [];
  }

  function sourceIsReady(type, source) {
    var title = getSourceTitle(type, source);
    var items = getSourceItems(type, source);
    return !!source && !!title && items.length > 0;
  }

  function sourceSignature(type, source) {
    var items;
    var parts;
    var i;
    if (!source) { return type + ':missing'; }
    items = getSourceItems(type, source);
    parts = [type, getSourceTitle(type, source), String(items.length)];
    for (i = 0; i < items.length; i += 1) {
      parts.push(normalizeText(items[i].textContent));
    }
    return parts.join('|');
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
      panel.hidden = !expanded;
      panel.style.display = expanded ? 'block' : 'none';
    }
    if (icon) {
      icon.classList.toggle('rotate-to-top', expanded);
      icon.classList.toggle('rotate-to-bottom', !expanded);
    }
  }

  function setPaymentDetailExpanded(toggle, detail, expanded) {
    var icon = safeQuery('i', toggle);
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    detail.hidden = !expanded;
    detail.style.display = expanded ? 'block' : 'none';
    if (icon) {
      icon.classList.toggle('rotate-to-top', expanded);
      icon.classList.toggle('rotate-to-bottom', !expanded);
    }
  }

  function createCloneShell(type, title, openByDefault) {
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
    header.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        header.click();
      }
    });
    setCloneExpanded(group, !!openByDefault);
    return group;
  }

  function buildPromotionBody(body, source) {
    var items = getSourceItems('promotion', source);
    var list = document.createElement('ul');
    var sourceLink;
    var row;
    var li;
    var tag;
    var text;
    var clone;
    var i;
    list.className = 'tdpp-v1-promotion-list';
    for (i = 0; i < items.length; i += 1) {
      sourceLink = safeQuery('a', items[i]);
      row = document.createElement(sourceLink ? 'a' : 'div');
      row.className = 'salepage-promotion-wrapper tdpp-v1-promotion-row';
      if (sourceLink) { copyLinkAttributes(sourceLink, row); }
      tag = safeQuery('.tag-rectangle', items[i]);
      text = safeQuery('.salepage-promotion-title-wrapper', items[i]) || safeQuery('.salepage-promotion-title', items[i]);
      if (tag) {
        clone = cloneElement(tag);
        if (clone) { row.appendChild(clone); }
      }
      if (text) {
        clone = cloneElement(text);
        if (clone) { row.appendChild(clone); }
      } else {
        clone = document.createElement('span');
        clone.className = 'salepage-promotion-title-wrapper';
        clone.textContent = normalizeText(items[i].textContent).replace(normalizeText(tag ? tag.textContent : ''), '').replace(/^\s+|\s+$/g, '');
        row.appendChild(clone);
      }
      li = document.createElement('li');
      li.className = 'salepage-promotion-li tdpp-v1-promotion-item';
      li.appendChild(row);
      list.appendChild(li);
    }
    body.appendChild(list);
    return hasMeaningfulContent(list);
  }

  function createPaymentDetail(item, index) {
    var description = safeQuery('.payment-shipping-desc', item);
    var sourceToggle;
    var toggle;
    var detail;
    var icon;
    var label;
    if (!description || !normalizeText(description.textContent)) { return null; }
    sourceToggle = safeQuery('.payment-shipping-label', item);
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'payment-shipping-subtitle payment-shipping-label flex-align-center tdpp-v1-payment-detail-toggle';
    label = normalizeText(sourceToggle ? sourceToggle.textContent : '').replace(/\s+/g, ' ');
    toggle.appendChild(document.createTextNode(label || '相關說明'));
    icon = document.createElement('i');
    icon.className = 'ico ico-chevron-down rotate-to-bottom';
    icon.setAttribute('aria-hidden', 'true');
    toggle.appendChild(icon);

    detail = document.createElement('div');
    detail.id = 'tdpp-v1-payment-detail-' + index;
    detail.className = 'payment-shipping-desc tdpp-v1-payment-detail';
    detail.setAttribute('data-tdpp-v1-payment-detail', 'true');
    appendCleanChildren(description, detail);
    toggle.setAttribute('aria-controls', detail.id);
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
    return { toggle: toggle, detail: detail };
  }

  function buildPaymentBody(body, source) {
    var items = getSourceItems('payment', source);
    var list = document.createElement('ul');
    var li;
    var row;
    var text;
    var tag;
    var campaign;
    var detailParts;
    var clone;
    var i;
    list.className = 'payment-type-list tdpp-v1-payment-list';
    for (i = 0; i < items.length; i += 1) {
      li = document.createElement('li');
      li.className = 'payment-type-item tdpp-v1-payment-item';
      row = document.createElement('div');
      row.className = 'tdpp-v1-payment-main-row';
      text = directChildrenBySelector(items[i], 'span.payment-shipping-subtitle')[0] || safeQuery('span.payment-shipping-subtitle', items[i]);
      tag = directChildrenBySelector(items[i], 'div.pull-right')[0] || null;
      if (text) {
        clone = cloneElement(text);
        if (clone) { row.appendChild(clone); }
      }
      if (tag) {
        clone = cloneElement(tag);
        if (clone) { row.appendChild(clone); }
      }
      if (hasMeaningfulContent(row)) { li.appendChild(row); }
      detailParts = createPaymentDetail(items[i], i);
      if (detailParts) {
        li.appendChild(detailParts.toggle);
        li.appendChild(detailParts.detail);
      }
      campaign = safeQuery('.payment-campaign-tag__content', items[i]);
      if (campaign) {
        clone = cloneElement(campaign);
        if (clone) {
          clone.classList.add('tdpp-v1-payment-campaign');
          li.appendChild(clone);
        }
      }
      if (hasMeaningfulContent(li)) { list.appendChild(li); }
    }
    body.appendChild(list);
    return hasMeaningfulContent(list);
  }

  function buildShippingBody(body, source) {
    var items = getSourceItems('shipping', source);
    var list = document.createElement('ul');
    var li;
    var head;
    var title;
    var tag;
    var campaign;
    var secondary;
    var clone;
    var i;
    list.className = 'tdpp-v1-shipping-list';
    for (i = 0; i < items.length; i += 1) {
      li = document.createElement('li');
      li.className = 'shipping-li tdpp-v1-shipping-item';

      head = document.createElement('div');
      head.className = 'tdpp-v1-shipping-head';
      title = safeQuery('.payment-shipping-subtitle.payment-shipping-between', items[i]);
      tag = directChildrenBySelector(items[i], '.pull-right')[0] || safeQuery('.pull-right', items[i]);
      if (title) {
        clone = cloneElement(title);
        if (clone) { head.appendChild(clone); }
      }
      if (tag) {
        clone = cloneElement(tag);
        if (clone) { head.appendChild(clone); }
      }
      if (hasMeaningfulContent(head)) { li.appendChild(head); }

      campaign = safeQuery('.free-shipping-activity', items[i]);
      if (campaign) {
        clone = cloneElement(campaign);
        if (clone) {
          clone.classList.add('tdpp-v1-shipping-campaign');
          li.appendChild(clone);
        }
      }

      secondary = safeQuery('.payment-shipping-subtitle.payment-shipping-subtitle-secondary', items[i]);
      if (secondary) {
        clone = cloneElement(secondary);
        if (clone) {
          clone.classList.add('tdpp-v1-shipping-secondary');
          li.appendChild(clone);
        }
      }

      if (hasMeaningfulContent(li)) { list.appendChild(li); }
    }
    body.appendChild(list);
    return hasMeaningfulContent(list);
  }

  function buildFeatureBody(body, source) {
    var items = getSourceItems('feature', source);
    var list = document.createElement('ul');
    var sourceTitle;
    var clone;
    var cloneTitle;
    var i;
    list.className = 'salepage-feature tdpp-v1-feature-list';
    for (i = 0; i < items.length; i += 1) {
      sourceTitle = normalizeText(
        (safeQuery('.salepage-feature-title', items[i]) || {}).textContent || ''
      );

      /* 客戶新版：原「商品特色」長列表不再顯示。 */
      if (sourceTitle === '商品特色') { continue; }

      clone = cloneElement(items[i]);
      if (clone) {
        clone.classList.add('tdpp-v1-feature-item');

        /* 原「銷售重點」改名為新版「商品特色」。 */
        if (sourceTitle === '銷售重點') {
          cloneTitle = safeQuery('.salepage-feature-title', clone);
          if (cloneTitle) { cloneTitle.textContent = '商品特色'; }
        }

        list.appendChild(clone);
      }
    }
    body.appendChild(list);
    return hasMeaningfulContent(list);
  }

  function buildRelatedBody(body, source) {
    var items = getSourceItems('related', source);
    var list = document.createElement('div');
    var clone;
    var i;
    list.className = 'related-category-list tdpp-v1-related-list';
    for (i = 0; i < items.length; i += 1) {
      clone = cloneElement(items[i]);
      if (clone) {
        clone.classList.add('tdpp-v1-related-item');
        list.appendChild(clone);
      }
    }
    body.appendChild(list);
    return hasMeaningfulContent(list);
  }

  function populateBody(type, body, source) {
    if (type === 'promotion') { return buildPromotionBody(body, source); }
    if (type === 'payment') { return buildPaymentBody(body, source); }
    if (type === 'shipping') { return buildShippingBody(body, source); }
    if (type === 'feature') { return buildFeatureBody(body, source); }
    if (type === 'related') { return buildRelatedBody(body, source); }
    return false;
  }

  function getStackAnchor() {
    return state.mode === 'desktop' ? safeQuery('.salepage-top-right .detail-info-wrapper') : safeQuery('.salepage-info');
  }

  function getOriginalHideTarget(type, source) {
    if (!source) { return null; }
    if (type === 'payment' || type === 'shipping') {
      return closestBySelector(source, '.collapse-group') || source;
    }
    return source;
  }

  function markOriginalHidden(type, source) {
    var target = getOriginalHideTarget(type, source);
    if (target) { target.setAttribute('data-tdpp-v1-original-block', 'hidden'); }
  }

  function hideCurrentOriginals() {
    var sources = findSources();
    markOriginalHidden('promotion', sources.promotion);
    markOriginalHidden('payment', sources.payment);
    markOriginalHidden('shipping', sources.shipping);
    markOriginalHidden('feature', sources.feature);
    markOriginalHidden('related', sources.related);
  }

  function removeLegacyGeneratedStack() {
    var stacks = toArray(safeQueryAll('[data-tdpp-v1-collapse-stack]'));
    var i;
    for (i = 0; i < stacks.length; i += 1) {
      if (stacks[i].parentNode) { stacks[i].parentNode.removeChild(stacks[i]); }
    }
    toArray(safeQueryAll('[data-tdpp-v1-original-block="hidden"]')).forEach(function (node) {
      node.removeAttribute('data-tdpp-v1-original-block');
    });
  }

  function buildCollapseStack(sources) {
    var specs = [
      { type: 'promotion', fallback: '本商品適用活動', open: true },
      { type: 'feature', fallback: '商品特色', open: true },
      { type: 'related', fallback: '商品相關分類', open: false }
    ];
    var anchor = getStackAnchor();
    var stack;
    var source;
    var group;
    var body;
    var readyCount = 0;
    var i;
    if (!anchor || !anchor.parentNode) { return false; }

    removeLegacyGeneratedStack();
    stack = document.createElement('div');
    stack.className = 'tdpp-v1-collapse-stack';
    stack.setAttribute('data-tdpp-v1-collapse-stack', state.mode);
    stack.setAttribute('data-tdpp-v1-version', VERSION);
    stack.setAttribute('data-tdpp-v1-generated', 'true');

    for (i = 0; i < specs.length; i += 1) {
      source = sources[specs[i].type];
      if (!sourceIsReady(specs[i].type, source)) { continue; }
      group = createCloneShell(specs[i].type, getSourceTitle(specs[i].type, source) || specs[i].fallback, specs[i].open);
      body = safeQuery('.tdpp-v1-clone-body', group);
      if (populateBody(specs[i].type, body, source)) {
        group.setAttribute('data-tdpp-v1-clone-ready', 'true');
        stack.appendChild(group);
        markOriginalHidden(specs[i].type, source);
        readyCount += 1;
      }
    }

    /* 付款方式、運送方式新版完全隱藏，不產生替代 Collapse。 */
    markOriginalHidden('payment', sources.payment);
    markOriginalHidden('shipping', sources.shipping);

    if (!readyCount) { return false; }
    stack.setAttribute('data-tdpp-v1-ready-count', String(readyCount));
    anchor.parentNode.insertBefore(stack, anchor.nextSibling);
    state.collapseStack = stack;
    state.collapseBuilt = true;
    scheduleIntegrityChecks();
    return true;
  }

  function ensureStackAttached() {
    var anchor;
    if (!state.collapseStack) { return; }
    if (!document.documentElement.contains(state.collapseStack)) {
      anchor = getStackAnchor();
      if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(state.collapseStack, anchor.nextSibling); }
    }
    hideCurrentOriginals();
  }

  function scheduleIntegrityChecks() {
    [500, 1500, 3500, 7000].forEach(function (delay) {
      window.setTimeout(ensureStackAttached, delay);
    });
  }

  function pollStableSources() {
    var sources;
    var types = ['promotion', 'payment', 'shipping', 'feature', 'related'];
    var signatures = [];
    var presentCount = 0;
    var readyCount = 0;
    var anchor = getStackAnchor();
    var rect;
    var i;
    if (state.collapseBuilt) { return; }
    sources = findSources();
    for (i = 0; i < types.length; i += 1) {
      if (sources[types[i]]) { presentCount += 1; }
      if (sourceIsReady(types[i], sources[types[i]])) { readyCount += 1; }
      signatures.push(sourceSignature(types[i], sources[types[i]]));
    }
    if (anchor) {
      rect = anchor.getBoundingClientRect();
      signatures.push('anchor:' + Math.round(rect.width) + ':' + Math.round(rect.height) + ':' + (anchor.parentNode ? anchor.parentNode.childElementCount : 0));
    }
    if (signatures.join('||') === state.sourceStableKey) { state.sourceStableCount += 1; }
    else {
      state.sourceStableKey = signatures.join('||');
      state.sourceStableCount = 1;
    }

    if ((presentCount >= 4 && readyCount === presentCount && state.sourceStableCount >= SOURCE_STABLE_REQUIRED) ||
        state.sourceRetryCount >= SOURCE_RETRY_LIMIT) {
      if (buildCollapseStack(sources)) {
        markReviewWrappers();
        buildFavProxyWithRetry();
        pushReadyEvent();
        return;
      }
    }

    state.sourceRetryCount += 1;
    window.clearTimeout(state.sourceTimer);
    state.sourceTimer = window.setTimeout(pollStableSources, SOURCE_RETRY_DELAY);
  }

  function markReviewWrappers() {
    var wrappers = toArray(safeQueryAll('#SalePageIndexController .star-rate-wrapper'));
    var i;
    for (i = 0; i < wrappers.length; i += 1) {
      if (closestBySelector(wrappers[i], '.salepage-info')) { continue; }
      wrappers[i].setAttribute('data-tdpp-v1-review', 'true');
      if (safeQuery('.no-comment', wrappers[i])) {
        wrappers[i].setAttribute('data-tdpp-v1-no-comment', 'true');
      } else {
        wrappers[i].removeAttribute('data-tdpp-v1-no-comment');
      }
    }
  }

  function findRelocatableReviewWrapper() {
    var selector = state.mode === 'desktop'
      ? '#SalePageIndexController .salepage-middle-section .star-rate-wrapper'
      : '#SalePageIndexController .star-rate-wrapper';
    var wrappers = toArray(safeQueryAll(selector));
    var fallback = null;
    var i;
    for (i = 0; i < wrappers.length; i += 1) {
      if (closestBySelector(wrappers[i], '.salepage-info')) { continue; }
      if (closestBySelector(wrappers[i], '[data-tdpp-v1-generated="true"]')) { continue; }
      if (!fallback) { fallback = wrappers[i]; }
      if (safeQuery('.comment-block, .comment-block-title, .comment-block-heading', wrappers[i])) { return wrappers[i]; }
    }
    return fallback;
  }

  function moveReviewWrapper() {
    var anchor = safeQuery('#salepage-detail-info');
    var review = findRelocatableReviewWrapper();
    if (!anchor || !anchor.parentNode || !review || review === anchor) { return false; }
    if (review.parentNode !== anchor.parentNode || review.nextElementSibling !== anchor) {
      anchor.parentNode.insertBefore(review, anchor);
    }
    review.setAttribute('data-tdpp-v1-review', 'true');
    review.setAttribute('data-tdpp-v1-review-relocated', 'true');
    if (safeQuery('.no-comment', review)) {
      review.setAttribute('data-tdpp-v1-no-comment', 'true');
    } else {
      review.removeAttribute('data-tdpp-v1-no-comment');
    }
    state.reviewMoved = true;
    return true;
  }

  function moveReviewWrapperWithRetry() {
    if (moveReviewWrapper() || state.reviewRetryCount >= 80) { return; }
    state.reviewRetryCount += 1;
    window.clearTimeout(state.reviewTimer);
    state.reviewTimer = window.setTimeout(moveReviewWrapperWithRetry, 250);
  }


  function extractRatingScore(target) {
    var scoreNode = null;
    var text = '';
    var match;
    var score;
    if (!target) { return null; }
    scoreNode = safeQuery('.avrage', target);
    if (!scoreNode && target.classList && target.classList.contains('star-rate')) {
      scoreNode = safeQuery('.star-rate-summary-content .avrage', target) ||
        safeQuery('.star-rate-summary-content > span', target);
    }
    if (!scoreNode && target.classList && target.classList.contains('star-rate-summary-content')) {
      scoreNode = safeQuery(':scope > span.avrage', target) || safeQuery(':scope > span', target);
    }
    text = normalizeText((scoreNode || target).textContent).replace(/,/g, '.');
    match = text.match(/(?:^|[^0-9])([0-5](?:\.[0-9]+)?)(?=[^0-9]|$)/);
    if (!match) { return null; }
    score = Number(match[1]);
    if (!isFinite(score) || score < 0 || score > 5) { return null; }
    return score;
  }

  function ensureFiveStarDisplay(target) {
    var score = extractRatingScore(target);
    var filledCount;
    var group;
    var directChildren;
    var icon;
    var i;
    if (score === null) { return false; }
    filledCount = Math.max(1, Math.min(5, Math.ceil(score)));
    group = safeQuery(':scope > [data-tdpp-v1-rating-stars="true"]', target);
    directChildren = toArray(target.children);
    for (i = 0; i < directChildren.length; i += 1) {
      if (directChildren[i] !== group && directChildren[i].tagName === 'I' &&
          (directChildren[i].classList.contains('ico-star') || directChildren[i].classList.contains('ico-star-fill'))) {
        target.removeChild(directChildren[i]);
      }
    }
    if (!group) {
      group = document.createElement('span');
      group.className = 'tdpp-v1-rating-stars';
      group.setAttribute('data-tdpp-v1-rating-stars', 'true');
      group.setAttribute('aria-label', '評分 ' + score + '，滿分 5 分');
      target.insertBefore(group, target.firstChild);
    } else {
      group.setAttribute('aria-label', '評分 ' + score + '，滿分 5 分');
    }
    while (group.firstChild) { group.removeChild(group.firstChild); }
    for (i = 0; i < 5; i += 1) {
      icon = document.createElement('i');
      icon.className = 'ico ' + (i < filledCount ? 'ico-star-fill' : 'ico-star') + ' star-color';
      icon.setAttribute('aria-hidden', 'true');
      group.appendChild(icon);
    }
    target.setAttribute('data-tdpp-v1-rating-normalized', 'true');
    target.setAttribute('data-tdpp-v1-rating-score', String(score));
    target.setAttribute('data-tdpp-v1-rating-filled', String(filledCount));
    return true;
  }

  function ensureSingleSummaryStarDisplay(target) {
    var score = extractRatingScore(target);
    var group;
    var directChildren;
    var icon;
    var i;
    if (score === null || !target) { return false; }

    group = safeQuery(':scope > [data-tdpp-v1-rating-stars="true"]', target);
    directChildren = toArray(target.children);

    for (i = 0; i < directChildren.length; i += 1) {
      if (
        directChildren[i] !== group &&
        directChildren[i].tagName === 'I' &&
        (
          directChildren[i].classList.contains('ico-star') ||
          directChildren[i].classList.contains('ico-star-fill')
        )
      ) {
        target.removeChild(directChildren[i]);
      }
    }

    if (!group) {
      group = document.createElement('span');
      group.className = 'tdpp-v1-rating-stars tdpp-v1-rating-stars--summary';
      group.setAttribute('data-tdpp-v1-rating-stars', 'true');
      target.insertBefore(group, target.firstChild);
    }

    group.setAttribute('aria-label', '評分 ' + score + '，滿分 5 分');
    while (group.firstChild) { group.removeChild(group.firstChild); }

    icon = document.createElement('i');
    icon.className = 'ico ico-star-fill star-color';
    icon.setAttribute('aria-hidden', 'true');
    group.appendChild(icon);

    target.setAttribute('data-tdpp-v1-rating-normalized', 'true');
    target.setAttribute('data-tdpp-v1-rating-score', String(score));
    target.setAttribute('data-tdpp-v1-rating-filled', '1');
    target.setAttribute('data-tdpp-v1-rating-summary', 'single-star');
    return true;
  }

  function normalizeProductRatings() {
    var starRates = toArray(safeQueryAll('#SalePageIndexController .star-rate-wrapper .star-rate'));
    var summaries = toArray(safeQueryAll(
      '#SalePageIndexController [data-tdpp-v1-review="true"] .star-rate-summary-content,' +
      '#SalePageIndexController [data-tdpp-v1-review="true"] .star-with-comment'
    ));
    var topCount = 0;
    var summaryCount = 0;
    var i;

    for (i = 0; i < starRates.length; i += 1) {
      if (closestBySelector(starRates[i], '[data-tdpp-v1-generated="true"]')) { continue; }
      if (ensureFiveStarDisplay(starRates[i])) { topCount += 1; }
    }

    for (i = 0; i < summaries.length; i += 1) {
      if (closestBySelector(summaries[i], '.star-rate')) { continue; }
      if (closestBySelector(summaries[i], '[data-tdpp-v1-generated="true"]')) { continue; }
      if (ensureSingleSummaryStarDisplay(summaries[i])) { summaryCount += 1; }
    }

    return { top: topCount, summary: summaryCount };
  }

  function normalizeProductRatingsWithRetry() {
    var noCommentReview = safeQuery('#SalePageIndexController [data-tdpp-v1-review="true"] .no-comment');
    var result;
    var complete;
    if (noCommentReview) { return; }
    result = normalizeProductRatings();
    complete = result.top > 0 && result.summary > 0;
    if (complete || state.ratingRetryCount >= 80) { return; }
    state.ratingRetryCount += 1;
    window.clearTimeout(state.ratingTimer);
    state.ratingTimer = window.setTimeout(normalizeProductRatingsWithRetry, 250);
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
    target = state.mode === 'desktop' ? safeQuery('#SalePageIndexController .qty-wrapper') : safeQuery('.salepage-fix-bottom .salepage-btn');
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
      if (proxy.parentNode !== target || (addButton && proxy.nextSibling !== addButton)) { target.insertBefore(proxy, addButton || target.firstChild); }
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

  function buildFavProxyWithRetry() {
    if (buildFavProxy() || state.favRetryCount >= 40) { return; }
    state.favRetryCount += 1;
    window.clearTimeout(state.favTimer);
    state.favTimer = window.setTimeout(buildFavProxyWithRetry, 250);
  }

  function pushReadyEvent() {
    if (state.readyEventSent) { return; }
    state.readyEventSent = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'td_product_page_ready', td_product_page_version: VERSION, td_product_page_mode: state.mode });
  }

  function initialize() {
    var mode;
    if (state.initialized) {
      ensureStackAttached();
      moveReviewWrapperWithRetry();
      normalizeProductRatingsWithRetry();
      buildFavProxyWithRetry();
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
    markReviewWrappers();
    moveReviewWrapperWithRetry();
    normalizeProductRatingsWithRetry();
    buildFavProxyWithRetry();
    pollStableSources();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initialize, { once: true }); }
  else { initialize(); }
  window.addEventListener('load', initialize, { once: true });
  window.addEventListener('pageshow', function () { window.setTimeout(initialize, 0); });
  window.setTimeout(initialize, 0);
}());
