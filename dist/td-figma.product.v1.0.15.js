/* TD_Figma_Product_Page_GTM_v1.0.15.html */
(function () {
  'use strict';

  var VERSION = '1.0.15';
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

/* TD_Figma_Product_Page_GTM_v1.0.15.html */
(function () {
  'use strict';

  var VERSION = '1.0.15';
  var SHEET_ID = '1RxPEEToUuTd5tXPMBpggUZtgfFCy0lRets4mwuMmDAc';
  var SHEET_TAB = '1844415232';
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/export?format=csv&id=' + SHEET_ID + '&gid=' + SHEET_TAB;
  var externalConfig = window.TDFigmaProductInterestConfig || {};
  var CONFIG = {
    desktopVisible: positiveInt(externalConfig.desktopVisible, 6),
    tabletVisible: positiveInt(externalConfig.tabletVisible, 4),
    mobileVisible: Math.max(2, positiveInt(externalConfig.mobileVisible, 2)),
    tabletBreakpoint: positiveInt(externalConfig.tabletBreakpoint, 1199),
    mobileBreakpoint: positiveInt(externalConfig.mobileBreakpoint, 991),
    title: String(externalConfig.title || '你可能有興趣'),
    retryLimit: positiveInt(externalConfig.retryLimit, 120),
    retryDelay: positiveInt(externalConfig.retryDelay, 250)
  };
  var state = {
    mode: '',
    rows: null,
    mounted: false,
    fetchStarted: false,
    fetchDone: false,
    retryCount: 0,
    retryTimer: null,
    nativeRetryCount: 0,
    nativeTimer: null,
    index: 0,
    visibleCount: 0,
    cardWidth: 0,
    gap: 0,
    resizeTimer: null,
    root: null,
    viewport: null,
    track: null,
    prev: null,
    next: null,
    touchStartX: null
  };

  function positiveInt(value, fallback) {
    var parsed = parseInt(value, 10);
    return isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function safeQuery(selector, context) {
    try { return (context || document).querySelector(selector); } catch (error) { return null; }
  }

  function safeQueryAll(selector, context) {
    try { return (context || document).querySelectorAll(selector); } catch (error) { return []; }
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function trim(value) {
    return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
  }

  function normalizeText(value) {
    return trim(String(value == null ? '' : value).replace(/\s+/g, ' '));
  }

  function isTrue(value) {
    var normalized = trim(value).toUpperCase();
    return normalized === 'TRUE' || normalized === '1' || normalized === 'YES' || normalized === 'Y';
  }

  function getQueryParam(name) {
    var params;
    var escaped;
    var match;
    try {
      if (window.URLSearchParams) {
        params = new URLSearchParams(window.location.search);
        return params.get(name);
      }
    } catch (error) {}
    escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\$&');
    match = String(window.location.search || '').match(new RegExp('(?:^|[?&])' + escaped + '=([^&]*)'));
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  function parseCSV(strData, strDelimiter, toObj) {
    strDelimiter = strDelimiter || ',';
    var objPattern = new RegExp(
      '(\\' + strDelimiter + '|\r?\n|\r|^)' +
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      '([^"\\' + strDelimiter + '\r\n]*))',
      'gi'
    );
    var arrData = [[]];
    var arrMatches = null;
    var strMatchedDelimiter;
    var strMatchedValue;
    while ((arrMatches = objPattern.exec(strData))) {
      strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) { arrData.push([]); }
      if (arrMatches[2] !== undefined) { strMatchedValue = arrMatches[2].replace(/""/g, '"'); }
      else { strMatchedValue = arrMatches[3]; }
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    if (!toObj) { return arrData; }
    if (!arrData.length) { return []; }
    var header = arrData.shift();
    return arrData.map(function (item) {
      var output = {};
      var i;
      for (i = 0; i < header.length; i += 1) { output[trim(header[i])] = item[i] == null ? '' : item[i]; }
      return output;
    });
  }

  function parseSheetDate(value, isEnd) {
    var text = trim(value);
    var match;
    var date;
    if (!text) { return isEnd ? Infinity : -Infinity; }
    match = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:[ T]+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
    if (match) {
      date = new Date(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1,
        parseInt(match[3], 10),
        parseInt(match[4] || '0', 10),
        parseInt(match[5] || '0', 10),
        parseInt(match[6] || '0', 10),
        0
      );
      return date.getTime();
    }
    date = new Date(text);
    return isNaN(date.getTime()) ? (isEnd ? Infinity : -Infinity) : date.getTime();
  }

  function targetMatches(row) {
    var target = trim(row['目標網址']).toLowerCase();
    var href = String(window.location.href || '').toLowerCase();
    if (!target) { return false; }
    return href.indexOf(target) !== -1;
  }

  function filterRows(rows) {
    var debug = getQueryParam('td_debug') === '1';
    var now = new Date().getTime();
    return rows.filter(function (row) {
      var preview = isTrue(row['預覽']);
      if (preview) {
        if (!debug) { return false; }
      } else {
        if (!isTrue(row['啟動'])) { return false; }
        if (!(parseSheetDate(row['開始日期'], false) <= now && now <= parseSheetDate(row['結束日期'], true))) { return false; }
      }
      return targetMatches(row);
    }).filter(function (row) {
      return !!(trim(row['商品連結']) && trim(row['商品名稱']) && trim(row['商品圖片']));
    });
  }

  function formatPrice(value) {
    var raw = trim(value).replace(/[^0-9.-]/g, '');
    var number = Number(raw);
    if (!raw || !isFinite(number)) { return trim(value); }
    try { return 'NT$' + Math.round(number).toLocaleString('en-US'); }
    catch (error) { return 'NT$' + Math.round(number); }
  }

  function splitLabels(value) {
    return String(value == null ? '' : value).split(/(?:\r?\n|\|+|；|;)+/).map(trim).filter(function (item) { return !!item; });
  }

  function createElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  function buildCornerLabels(row, media) {
    var labels = splitLabels(row['商品角標']);
    var holder;
    var i;
    if (!labels.length) { return; }
    holder = createElement('div', 'tdhpt-v1-corner-labels');
    for (i = 0; i < labels.length; i += 1) { holder.appendChild(createElement('span', 'tdhpt-v1-corner-label', labels[i])); }
    media.appendChild(holder);
  }

  function buildTags(row, content) {
    var tags = splitLabels(row['商品標籤']);
    var holder;
    var i;
    if (!tags.length) { return; }
    holder = createElement('div', 'tdhpt-v1-tags');
    for (i = 0; i < tags.length; i += 1) { holder.appendChild(createElement('span', 'tdhpt-v1-tag', tags[i])); }
    content.appendChild(holder);
  }

  function buildCard(row, index) {
    var card = createElement('article', 'tdhpt-v1-card tdppi-v1-card');
    var media = createElement('div', 'tdhpt-v1-media');
    var imageDefault = createElement('img', 'tdhpt-v1-image tdhpt-v1-image--default');
    var imageHover = createElement('img', 'tdhpt-v1-image tdhpt-v1-image--hover');
    var content = createElement('div', 'tdhpt-v1-content');
    var name = createElement('h3', 'tdhpt-v1-name', normalizeText(row['商品名稱']));
    var price = createElement('div', 'tdhpt-v1-price');
    var original = createElement('span', 'tdhpt-v1-original-price');
    var sale = createElement('span', 'tdhpt-v1-sale-price');
    var buy = createElement('a', 'tdhpt-v1-buy', '立即購買');
    var href = trim(row['商品連結']);
    var defaultSrc = trim(row['商品圖片']);
    var hoverSrc = trim(row['商品Hover圖片']) || defaultSrc;
    var originalText = formatPrice(row['商品原價']);
    var saleText = formatPrice(row['商品特價']);

    card.setAttribute('data-tdppi-v1-card', String(index));
    imageDefault.src = defaultSrc;
    imageDefault.alt = normalizeText(row['商品名稱']);
    imageDefault.loading = 'lazy';
    imageHover.src = hoverSrc;
    imageHover.alt = '';
    imageHover.loading = 'lazy';
    imageHover.setAttribute('aria-hidden', 'true');
    media.appendChild(imageDefault);
    media.appendChild(imageHover);
    buildCornerLabels(row, media);
    content.appendChild(media);
    buildTags(row, content);
    content.appendChild(name);
    if (originalText && (!saleText || originalText !== saleText)) { original.textContent = originalText; price.appendChild(original); }
    if (saleText || originalText) { sale.textContent = saleText || originalText; price.appendChild(sale); content.appendChild(price); }
    buy.href = href;
    buy.target = '_self';
    buy.setAttribute('aria-label', '立即購買 ' + normalizeText(row['商品名稱']));
    content.appendChild(buy);
    card.appendChild(content);
    return card;
  }

  function getMode() {
    var attr = document.documentElement.getAttribute('data-tdpp-v1-mode');
    if (attr === 'desktop' || attr === 'mobile') { return attr; }
    if (safeQuery('#sidemenu') && safeQuery('.salepage-top-left') && safeQuery('.salepage-top-right')) { return 'desktop'; }
    if (safeQuery('.salepage-fix-bottom .salepage-btn') || safeQuery('.slider-nav-ul-recommend')) { return 'mobile'; }
    return '';
  }

  function getInsertTarget() {
    state.mode = getMode();
    if (state.mode === 'desktop') { return safeQuery('#SalePageIndexController .salepage-product-list'); }
    if (state.mode === 'mobile') { return safeQuery('#SalePageIndexController .slider-product-list:not(.salepage-browsing-history)'); }
    return null;
  }

  function createArrow(direction) {
    var button = createElement('button', 'tdppi-v1-arrow tdppi-v1-arrow--' + direction);
    button.type = 'button';
    button.setAttribute('aria-label', direction === 'prev' ? '上一組商品' : '下一組商品');
    return button;
  }

  function buildRoot(rows) {
    var root = createElement('section', 'tdhpt-v1-root tdppi-v1-root');
    var inner = createElement('div', 'tdhpt-v1-inner');
    var tabsWrap = createElement('div', 'tdhpt-v1-tabs-wrap');
    var tabs = createElement('div', 'tdhpt-v1-tabs');
    var tab = createElement('button', 'tdhpt-v1-tab is-active');
    var desktopLabel = createElement('span', 'tdhpt-v1-tab-label-desktop', CONFIG.title);
    var mobileLabel = createElement('span', 'tdhpt-v1-tab-label-mobile', CONFIG.title);
    var panels = createElement('div', 'tdhpt-v1-panels tdppi-v1-panels');
    var panel = createElement('div', 'tdhpt-v1-panel is-active');
    var slider = createElement('div', 'tdppi-v1-slider');
    var viewport = createElement('div', 'tdppi-v1-viewport');
    var track = createElement('div', 'tdppi-v1-track');
    var prev = createArrow('prev');
    var next = createArrow('next');
    var i;

    root.id = 'tdppi-v1-root';
    root.setAttribute('data-tdppi-v1-root', 'true');
    root.setAttribute('data-tdppi-v1-version', VERSION);
    root.setAttribute('data-tdppi-v1-count', String(rows.length));
    tabs.setAttribute('role', 'tablist');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = -1;
    tab.appendChild(desktopLabel);
    tab.appendChild(mobileLabel);
    tabs.appendChild(tab);
    tabsWrap.appendChild(tabs);
    for (i = 0; i < rows.length; i += 1) { track.appendChild(buildCard(rows[i], i)); }
    viewport.appendChild(track);
    slider.appendChild(prev);
    slider.appendChild(viewport);
    slider.appendChild(next);
    panel.appendChild(slider);
    panels.appendChild(panel);
    inner.appendChild(tabsWrap);
    inner.appendChild(panels);
    root.appendChild(inner);
    state.root = root;
    state.viewport = viewport;
    state.track = track;
    state.prev = prev;
    state.next = next;
    return root;
  }

  function currentVisibleCount() {
    var width = window.innerWidth || document.documentElement.clientWidth || 1200;
    if (width <= CONFIG.mobileBreakpoint) { return CONFIG.mobileVisible; }
    if (width <= CONFIG.tabletBreakpoint) { return Math.max(2, CONFIG.tabletVisible); }
    return Math.max(2, CONFIG.desktopVisible);
  }

  function getGap() {
    return (window.innerWidth || 1200) <= CONFIG.mobileBreakpoint ? 25 : 26.6667;
  }

  function updateSliderLayout() {
    var cards;
    var viewportWidth;
    var count;
    var maxIndex;
    var translate;
    var i;
    if (!state.viewport || !state.track) { return; }
    cards = toArray(safeQueryAll('.tdppi-v1-card', state.track));
    if (!cards.length) { return; }
    viewportWidth = state.viewport.clientWidth || state.viewport.getBoundingClientRect().width;
    count = Math.min(currentVisibleCount(), cards.length);
    state.visibleCount = Math.max(1, count);
    state.gap = getGap();
    state.cardWidth = Math.max(1, (viewportWidth - state.gap * (state.visibleCount - 1)) / state.visibleCount);
    for (i = 0; i < cards.length; i += 1) { cards[i].style.flex = '0 0 ' + state.cardWidth + 'px'; }
    maxIndex = Math.max(0, cards.length - state.visibleCount);
    if (state.index > maxIndex) { state.index = maxIndex; }
    translate = state.index * (state.cardWidth + state.gap);
    state.track.style.transform = 'translate3d(' + (-translate) + 'px,0,0)';
    if (state.prev) {
      state.prev.disabled = state.index <= 0;
      state.prev.setAttribute('aria-hidden', maxIndex === 0 ? 'true' : 'false');
    }
    if (state.next) {
      state.next.disabled = state.index >= maxIndex;
      state.next.setAttribute('aria-hidden', maxIndex === 0 ? 'true' : 'false');
    }
    state.root.setAttribute('data-tdppi-v1-visible-count', String(state.visibleCount));
  }

  function moveSlider(direction) {
    var cards = toArray(safeQueryAll('.tdppi-v1-card', state.track));
    var maxIndex = Math.max(0, cards.length - state.visibleCount);
    var step = Math.max(1, state.visibleCount);
    if (direction > 0) { state.index = Math.min(maxIndex, state.index + step); }
    else { state.index = Math.max(0, state.index - step); }
    updateSliderLayout();
  }

  function bindSlider() {
    if (!state.root) { return; }
    state.prev.addEventListener('click', function () { moveSlider(-1); });
    state.next.addEventListener('click', function () { moveSlider(1); });
    state.viewport.addEventListener('touchstart', function (event) {
      state.touchStartX = event.touches && event.touches[0] ? event.touches[0].clientX : null;
    }, { passive: true });
    state.viewport.addEventListener('touchend', function (event) {
      var endX;
      var delta;
      if (state.touchStartX == null) { return; }
      endX = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : state.touchStartX;
      delta = endX - state.touchStartX;
      state.touchStartX = null;
      if (Math.abs(delta) < 35) { return; }
      moveSlider(delta < 0 ? 1 : -1);
    }, { passive: true });
    window.addEventListener('resize', function () {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = window.setTimeout(updateSliderLayout, 120);
    });
  }

  function mountInterestSlider() {
    var target;
    var root;
    if (state.mounted || !state.fetchDone || !state.rows || !state.rows.length) { return state.mounted; }
    target = getInsertTarget();
    if (!target || !target.parentNode) { return false; }
    if (safeQuery('#tdppi-v1-root')) { state.mounted = true; return true; }
    root = buildRoot(state.rows);
    target.parentNode.insertBefore(root, target);
    state.mounted = true;
    bindSlider();
    if (window.requestAnimationFrame) { window.requestAnimationFrame(updateSliderLayout); }
    else { window.setTimeout(updateSliderLayout, 0); }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'td_product_interest_ready',
      td_product_interest_version: VERSION,
      td_product_interest_count: state.rows.length,
      td_product_interest_mode: state.mode
    });
    return true;
  }

  function mountWithRetry() {
    if (mountInterestSlider() || state.retryCount >= CONFIG.retryLimit) { return; }
    state.retryCount += 1;
    window.clearTimeout(state.retryTimer);
    state.retryTimer = window.setTimeout(mountWithRetry, CONFIG.retryDelay);
  }

  function fetchSheet() {
    if (state.fetchStarted || !window.fetch) { return; }
    state.fetchStarted = true;
    fetch(SHEET_URL, { credentials: 'omit', cache: 'no-store' })
      .then(function (response) {
        if (!response || response.ok === false) { throw new Error('Google Sheet HTTP ' + (response ? response.status : 'unknown')); }
        return response.text();
      })
      .then(function (text) {
        state.rows = filterRows(parseCSV(text, ',', true));
        state.fetchDone = true;
        mountWithRetry();
      })
      .catch(function (error) {
        state.fetchDone = true;
        state.rows = [];
        if (getQueryParam('td_debug') === '1' && window.console && console.warn) {
          console.warn('[TD Product Interest] Google Sheet 載入失敗', error);
        }
      });
  }

  function hideCategoryTabAndSelectShop() {
    var mode = getMode();
    var root = mode === 'desktop'
      ? safeQuery('#SalePageIndexController .salepage-product-list')
      : safeQuery('#SalePageIndexController .slider-product-list:not(.salepage-browsing-history)');
    var items;
    var categoryItem = null;
    var shopItem = null;
    var shopLink;
    var i;
    var text;
    if (!root || !mode) { return false; }
    items = toArray(safeQueryAll(mode === 'desktop' ? '.panel-heading-li' : '.slider-nav-li', root));
    for (i = 0; i < items.length; i += 1) {
      text = normalizeText(items[i].textContent);
      if (text.indexOf('本分類熱銷') !== -1) { categoryItem = items[i]; }
      if (text.indexOf('全站排行') !== -1) { shopItem = items[i]; }
    }
    if (categoryItem) { categoryItem.setAttribute('data-tdpp-v1-category-tab-hidden', 'true'); }
    if (!shopItem) { return false; }
    shopLink = safeQuery('a', shopItem);
    if (!shopItem.classList.contains('actived') && shopLink) {
      shopLink.setAttribute('data-tdpp-v1-shop-tab-triggered', 'true');
      try { shopLink.click(); } catch (error) {}
    }
    root.setAttribute('data-tdpp-v1-shop-ranking-only', 'true');
    return !!categoryItem && shopItem.classList.contains('actived');
  }

  function nativeRankingWithRetry() {
    if (hideCategoryTabAndSelectShop() || state.nativeRetryCount >= 80) { return; }
    state.nativeRetryCount += 1;
    window.clearTimeout(state.nativeTimer);
    state.nativeTimer = window.setTimeout(nativeRankingWithRetry, 250);
  }

  function init() {
    fetchSheet();
    nativeRankingWithRetry();
    if (state.fetchDone) { mountWithRetry(); }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init, { once: true }); }
  else { init(); }
  window.addEventListener('load', init, { once: true });
  window.addEventListener('pageshow', function () { window.setTimeout(init, 0); });
  window.setTimeout(init, 0);
}());
