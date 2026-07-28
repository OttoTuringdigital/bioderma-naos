/* TD_Figma_Category_Sidebar_GTM_v1.0.2.html */
(function () {
  'use strict';

  var VERSION = '1.0.2';
  var DATA_KEY = 'categorySidebar';
  var ROOT_ID = 'tdsb-v1-root';
  var ROLE = 'data-tdsb-v1-role';
  var state = {
    dataset: null,
    mode: '',
    modeLocked: false,
    variant: 'category',
    root: null,
    portals: {},
    native: {},
    retryTimer: null,
    retryCount: 0,
    syncFrame: null,
    resizeObserver: null,
    stabilizeTimers: [],
    nativeSidebarMinHeight: null,
    cleanup: [],
    popup: null,
    popupTrigger: null,
    draftUrl: null,
    mediaQuery: null,
    destroyed: false
  };

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function trim(value) {
    return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
  }

  function normalizeText(value) {
    return trim(value).replace(/\s+/g, '');
  }

  function create(tagName, className, attributes) {
    var element = document.createElement(tagName);
    var key;
    if (className) { element.className = className; }
    attributes = attributes || {};
    for (key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        element.setAttribute(key, attributes[key]);
      }
    }
    return element;
  }

  function safeQuery(selector, context) {
    try { return (context || document).querySelector(selector); } catch (error) { return null; }
  }

  function directText(element) {
    var output = '';
    var nodes = element ? element.childNodes : [];
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].nodeType === 3) { output += nodes[i].nodeValue; }
    }
    return normalizeText(output || (element && element.textContent) || '');
  }

  function findExactText(text, selector) {
    var nodes = toArray(document.querySelectorAll(selector || 'body *'));
    var expected = normalizeText(text);
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].children.length === 0 && normalizeText(nodes[i].textContent) === expected) {
        return nodes[i];
      }
    }
    return null;
  }

  function containsAllText(element, texts) {
    var value = normalizeText(element && element.innerText);
    var i;
    if (!value) { return false; }
    for (i = 0; i < texts.length; i += 1) {
      if (value.indexOf(normalizeText(texts[i])) === -1) { return false; }
    }
    return true;
  }

  function getDataset() {
    return window.TDFigmaData && window.TDFigmaData[DATA_KEY] ? window.TDFigmaData[DATA_KEY] : null;
  }

  function getSettings() {
    return (state.dataset && state.dataset.settings) || {};
  }

  function pushEvent(name, detail) {
    var payload = detail || {};
    window.dataLayer = window.dataLayer || [];
    payload.event = name;
    payload.td_sidebar_version = VERSION;
    window.dataLayer.push(payload);
  }

  function currentUrl() {
    try { return new URL(window.location.href); } catch (error) { return null; }
  }

  function splitValues(value) {
    var output = [];
    var seen = {};
    var input = String(value || '').split(',');
    var item;
    var i;
    for (i = 0; i < input.length; i += 1) {
      item = trim(input[i]);
      if (item && !seen[item]) { seen[item] = true; output.push(item); }
    }
    return output;
  }

  function getItemValues(item) {
    return splitValues(item && item.searchParams);
  }

  function hasAllValues(url, item) {
    var current;
    var desired;
    var i;
    if (!url || !item || !item.searchKeyword) { return false; }
    current = splitValues(url.searchParams.get(item.searchKeyword));
    desired = getItemValues(item);
    if (!desired.length) { return false; }
    for (i = 0; i < desired.length; i += 1) {
      if (current.indexOf(desired[i]) === -1) { return false; }
    }
    return true;
  }

  function resetPageParameters(url) {
    var parameters = getSettings().resetPageParameters || [];
    var i;
    for (i = 0; i < parameters.length; i += 1) { url.searchParams.delete(parameters[i]); }
  }

  function toggleUrlItem(url, item, forceState) {
    var current;
    var desired;
    var checked;
    var next = [];
    var i;
    if (!url || !item || !item.searchKeyword) { return url; }
    current = splitValues(url.searchParams.get(item.searchKeyword));
    desired = getItemValues(item);
    checked = hasAllValues(url, item);
    if (typeof forceState === 'boolean') { checked = !forceState; }
    if (checked) {
      for (i = 0; i < current.length; i += 1) {
        if (desired.indexOf(current[i]) === -1) { next.push(current[i]); }
      }
    } else {
      next = current.slice();
      for (i = 0; i < desired.length; i += 1) {
        if (next.indexOf(desired[i]) === -1) { next.push(desired[i]); }
      }
    }
    if (next.length) { url.searchParams.set(item.searchKeyword, next.join(',')); }
    else { url.searchParams.delete(item.searchKeyword); }
    resetPageParameters(url);
    return url;
  }

  function applyUrl(url, source) {
    if (!url) { return; }
    pushEvent('td_sidebar_change', { td_sidebar_source: source || 'unknown' });
    window.location.assign(url.toString());
  }

  function detectVariant() {
    var sort = findNativeSort();
    var text = normalizeText(sort && sort.textContent);
    var body = normalizeText(document.body && document.body.innerText);
    if (text.indexOf('相關度') !== -1 || body.indexOf('搜尋：') !== -1 || body.indexOf('搜尋結果') !== -1) {
      return 'search';
    }
    return 'category';
  }

  function findDesktopSidebar() {
    var heading = findExactText('適用年齡', 'div,span,strong');
    var current = heading;
    var best = null;
    var rect;
    var level = 0;
    while (current && current !== document.body && level < 8) {
      if (containsAllText(current, ['適用年齡', '價格區間', '付款方式', '運送方式'])) {
        rect = current.getBoundingClientRect();
        if (rect.width >= 170 && rect.width <= 340 && rect.height >= 300) {
          best = current;
          break;
        }
        if (!best && current.childElementCount >= 4) { best = current; }
      }
      current = current.parentElement;
      level += 1;
    }
    if (best) { return best; }

    var candidates = toArray(document.querySelectorAll('div'));
    var score;
    var bestScore = 0;
    var i;
    for (i = 0; i < candidates.length; i += 1) {
      score = 0;
      rect = candidates[i].getBoundingClientRect();
      if (rect.width >= 170 && rect.width <= 340) { score += 4; }
      if (rect.height >= 400) { score += 2; }
      if (containsAllText(candidates[i], ['適用年齡', '價格區間'])) { score += 5; }
      if (containsAllText(candidates[i], ['付款方式', '運送方式'])) { score += 4; }
      if (score > bestScore) { bestScore = score; best = candidates[i]; }
    }
    return bestScore >= 9 ? best : null;
  }

  function findNativeSort() {
    var select = safeQuery('div.Select');
    var options = state.dataset && state.dataset.sortMode && state.dataset.sortMode.content || [];
    var labels = [];
    var nodes;
    var text;
    var i;
    var j;
    if (select) { return select; }
    for (i = 0; i < options.length; i += 1) { labels.push(normalizeText(options[i].label)); }
    nodes = toArray(document.querySelectorAll('body div,body button,body span'));
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].children.length > 2) { continue; }
      text = normalizeText(nodes[i].innerText);
      for (j = 0; j < labels.length; j += 1) {
        if (text === labels[j]) {
          if (nodes[i].parentElement && nodes[i].parentElement.getBoundingClientRect().width >= 100) {
            return nodes[i].parentElement;
          }
          return nodes[i];
        }
      }
    }
    return null;
  }

  function findMobileControls() {
    var exact = findExactText('篩選', 'span,div,button');
    var current = exact;
    var rect;
    var level = 0;
    while (current && current !== document.body && level < 5) {
      rect = current.getBoundingClientRect();
      if (rect.width >= 220 && rect.height >= 30 && rect.height <= 100) { return current; }
      current = current.parentElement;
      level += 1;
    }
    return exact && exact.parentElement ? exact.parentElement : exact;
  }

  function findProductCount() {
    var nodes = toArray(document.querySelectorAll('body div,body span,body p'));
    var text;
    var rect;
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].children.length) { continue; }
      text = normalizeText(nodes[i].textContent);
      if (!/^共\d+(項|件)商品$/.test(text)) { continue; }
      rect = nodes[i].getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) { return nodes[i]; }
    }
    return null;
  }

  function findProductCountRow(count) {
    var current = count;
    var rect;
    var countRect = count && count.getBoundingClientRect();
    var level = 0;
    while (current && current !== document.body && level < 4) {
      rect = current.getBoundingClientRect();
      if (countRect && rect.width >= countRect.width + 80 && rect.height >= countRect.height && rect.height <= 100) {
        return current;
      }
      current = current.parentElement;
      level += 1;
    }
    return count && count.parentElement ? count.parentElement : count;
  }

  function isRendered(element) {
    var rect;
    var style;
    if (!element || !document.documentElement.contains(element)) { return false; }
    rect = element.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) { return false; }
    style = window.getComputedStyle ? window.getComputedStyle(element) : null;
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
  }

  function detectLayoutMode() {
    var desktopSidebar = findDesktopSidebar();
    var mobileControls = findMobileControls();
    var productCount = findProductCount();
    var desktopVisible = isRendered(desktopSidebar);
    var mobileVisible = isRendered(mobileControls) && isRendered(productCount);
    if (state.modeLocked && (state.mode === 'desktop' || state.mode === 'mobile')) { return state.mode; }
    if (desktopVisible) { return 'desktop'; }
    if (mobileVisible) { return 'mobile'; }
    return window.innerWidth >= Number(getSettings().desktopMinWidth || 992) ? 'desktop' : 'mobile';
  }

  function findNativeSelected() {
    var heading = findExactText('已選擇篩選條件', 'div,span,strong');
    var current = heading;
    var rect;
    var level = 0;
    while (current && current !== document.body && level < 4) {
      rect = current.getBoundingClientRect();
      if (rect.width >= 300 && rect.height >= 25 && rect.height <= 220) { return current; }
      current = current.parentElement;
      level += 1;
    }
    return heading && heading.parentElement ? heading.parentElement : null;
  }

  function markBreadcrumb() {
    var ol = safeQuery('ol');
    if (ol) { ol.setAttribute('data-tdsb-v1-breadcrumb', 'true'); state.native.breadcrumb = ol; }
  }

  function ensureRoot() {
    if (state.root && document.documentElement.contains(state.root)) { return state.root; }
    state.root = document.getElementById(ROOT_ID);
    if (!state.root && document.body) {
      state.root = create('div', '', { id: ROOT_ID, 'data-tdsb-v1-version': VERSION });
      document.body.appendChild(state.root);
    }
    return state.root;
  }

  function portal(name) {
    var root = ensureRoot();
    var element;
    if (!root) { return null; }
    if (state.portals[name] && document.documentElement.contains(state.portals[name])) { return state.portals[name]; }
    element = create('div', '', { 'data-tdsb-v1-portal': name });
    root.appendChild(element);
    state.portals[name] = element;
    return element;
  }

  function setPortalRect(name, anchor, options) {
    var target = state.portals[name];
    var rect;
    var width;
    var height;
    if (!target || !anchor || !document.documentElement.contains(anchor)) {
      if (target) { target.style.display = 'none'; target.removeAttribute('data-tdsb-v1-positioned'); }
      return;
    }
    rect = anchor.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) { target.style.display = 'none'; target.removeAttribute('data-tdsb-v1-positioned'); return; }
    options = options || {};
    width = options.width || rect.width;
    height = options.height || rect.height;
    target.style.display = 'block';
    target.setAttribute('data-tdsb-v1-positioned', 'true');
    target.style.left = Math.round(rect.left + window.pageXOffset + (options.offsetX || 0)) + 'px';
    target.style.top = Math.round(rect.top + window.pageYOffset + (options.offsetY || 0)) + 'px';
    target.style.width = Math.round(width) + 'px';
    if (options.autoHeight) { target.style.height = 'auto'; }
    else { target.style.height = Math.round(height) + 'px'; }
  }

  function scheduleSync() {
    if (state.syncFrame) { return; }
    state.syncFrame = window.requestAnimationFrame(function () {
      state.syncFrame = null;
      syncPortals();
    });
  }

  function syncDesktopLayoutHeight() {
    var anchor = state.native.sidebar;
    var sidebar = state.portals.sidebar && state.portals.sidebar.querySelector('.tdsb-v1-sidebar');
    var height;
    if (!anchor || !sidebar) { return; }
    height = Math.ceil(Math.max(sidebar.scrollHeight || 0, sidebar.getBoundingClientRect().height || 0));
    if (height < 1) { return; }
    if (!state.nativeSidebarMinHeight || state.nativeSidebarMinHeight.element !== anchor) {
      state.nativeSidebarMinHeight = {
        element: anchor,
        value: anchor.style.getPropertyValue('min-height'),
        priority: anchor.style.getPropertyPriority('min-height')
      };
    }
    anchor.style.setProperty('min-height', height + 'px', 'important');
  }

  function restoreDesktopLayoutHeight() {
    var original = state.nativeSidebarMinHeight;
    if (!original || !original.element) { return; }
    if (original.value) { original.element.style.setProperty('min-height', original.value, original.priority || ''); }
    else { original.element.style.removeProperty('min-height'); }
    state.nativeSidebarMinHeight = null;
  }

  function syncMobileControls() {
    var target = state.portals['mobile-controls'];
    var anchor = state.native.mobileControls;
    var rect;
    var viewportWidth;
    var leftPadding;
    var rightPadding;
    var verticalPadding;
    var top;
    var height;
    if (!target || !anchor || !document.documentElement.contains(anchor)) {
      if (target) { target.style.display = 'none'; target.removeAttribute('data-tdsb-v1-positioned'); }
      return;
    }
    rect = anchor.getBoundingClientRect();
    viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (rect.width < 1 || rect.height < 1 || viewportWidth < 1) {
      target.style.display = 'none';
      target.removeAttribute('data-tdsb-v1-positioned');
      return;
    }
    verticalPadding = state.variant === 'search' ? 10 : 0;
    leftPadding = state.variant === 'search' ? 10 : Math.max(0, Math.round(rect.left));
    rightPadding = state.variant === 'search' ? 10 : Math.max(0, Math.round(viewportWidth - rect.right));
    top = rect.top + window.pageYOffset - verticalPadding;
    height = rect.height + verticalPadding * 2;
    target.style.display = 'block';
    target.setAttribute('data-tdsb-v1-positioned', 'true');
    target.style.left = Math.round(window.pageXOffset) + 'px';
    target.style.top = Math.round(top) + 'px';
    target.style.width = Math.round(viewportWidth) + 'px';
    target.style.height = Math.round(height) + 'px';
    target.style.padding = verticalPadding + 'px ' + rightPadding + 'px ' + verticalPadding + 'px ' + leftPadding + 'px';
    target.style.backgroundColor = '#ffffff';
  }

  function syncMobileSort() {
    var target = state.portals.sort;
    var count = state.native.productCount;
    var row = state.native.productCountRow;
    var rowRect;
    var countRect;
    var width;
    var top;
    if (!target || !count || !row || !document.documentElement.contains(count) || !document.documentElement.contains(row)) {
      if (target) { target.style.display = 'none'; target.removeAttribute('data-tdsb-v1-positioned'); }
      return;
    }
    rowRect = row.getBoundingClientRect();
    countRect = count.getBoundingClientRect();
    if (rowRect.width < 1 || countRect.height < 1) {
      target.style.display = 'none';
      target.removeAttribute('data-tdsb-v1-positioned');
      return;
    }
    width = Math.min(160, Math.max(135, Math.round(rowRect.width * 0.46)));
    top = countRect.top + Math.round((countRect.height - 38) / 2);
    if (top < rowRect.top) { top = rowRect.top; }
    if (state.variant === 'search') { top -= 8; }
    target.style.display = 'block';
    target.setAttribute('data-tdsb-v1-positioned', 'true');
    target.style.left = Math.round(rowRect.right + window.pageXOffset - width) + 'px';
    target.style.top = Math.round(top + window.pageYOffset) + 'px';
    target.style.width = Math.round(width) + 'px';
    target.style.height = 'auto';
  }

  function clearStabilizeTimers() {
    var i;
    for (i = 0; i < state.stabilizeTimers.length; i += 1) { window.clearTimeout(state.stabilizeTimers[i]); }
    state.stabilizeTimers = [];
  }

  function scheduleStabilizedSync() {
    var delays = [0, 60, 180, 360, 700, 1200, 2000];
    var i;
    clearStabilizeTimers();
    for (i = 0; i < delays.length; i += 1) {
      state.stabilizeTimers.push(window.setTimeout(scheduleSync, delays[i]));
    }
  }

  function syncPortals() {
    var sortWidth;
    if (state.mode === 'desktop') {
      setPortalRect('sidebar', state.native.sidebar, { autoHeight: true });
      syncDesktopLayoutHeight();
      sortWidth = state.native.sort ? Math.min(180, Math.max(135, state.native.sort.getBoundingClientRect().width)) : 160;
      setPortalRect('sort', state.native.sort, { width: sortWidth, autoHeight: true });
      setPortalRect('selected', state.native.selected, { autoHeight: true });
    } else {
      syncMobileControls();
      syncMobileSort();
    }
  }

  function currentWorkingUrl() {
    return state.mode === 'mobile' && state.draftUrl ? state.draftUrl : currentUrl();
  }

  function updateAllCheckedStates() {
    var url = currentWorkingUrl();
    var buttons = toArray(document.querySelectorAll('[data-tdsb-v1-keyword]'));
    var item;
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      item = {
        searchKeyword: buttons[i].getAttribute('data-tdsb-v1-keyword'),
        searchParams: buttons[i].getAttribute('data-tdsb-v1-params')
      };
      buttons[i].setAttribute('aria-checked', hasAllValues(url, item) ? 'true' : 'false');
    }
    updatePriceDisplays();
  }

  function createToggleOption(item) {
    var button = create('button', 'tdsb-v1-option', {
      type: 'button', role: 'checkbox', 'aria-checked': 'false',
      'data-tdsb-v1-keyword': item.searchKeyword || '',
      'data-tdsb-v1-params': item.searchParams == null ? '' : String(item.searchParams)
    });
    var check = create('span', 'tdsb-v1-check', { 'aria-hidden': 'true' });
    var label = create('span', 'tdsb-v1-option-label');
    label.textContent = item.label || '';
    button.appendChild(check); button.appendChild(label);
    button.addEventListener('click', function () {
      var url = currentWorkingUrl();
      if (!url) { return; }
      toggleUrlItem(url, item);
      if (state.mode === 'mobile') { state.draftUrl = url; updateAllCheckedStates(); }
      else { applyUrl(url, 'filter'); }
    });
    return button;
  }

  function createLinkOption(item, series) {
    var link = create('a', 'tdsb-v1-link-option', { href: item.linkUrl || '#' });
    if (series) {
      var copy = create('span', 'tdsb-v1-series-copy');
      var title = create('span', 'tdsb-v1-series-label');
      var english = create('span', 'tdsb-v1-series-english');
      var description = create('span', 'tdsb-v1-series-description');
      title.textContent = item.label || '';
      english.textContent = item.englishName || '';
      description.textContent = item.description || '';
      copy.appendChild(title); title.appendChild(english); copy.appendChild(description); link.appendChild(copy);
      link.style.setProperty('--tdsb-v1-accent', item.accentColor || '#006aa6');
    } else { link.textContent = item.label || ''; }
    if (!item.linkUrl) {
      link.removeAttribute('href');
      link.setAttribute('role', 'button');
    }
    return link;
  }

  function getPriceConfig(group) {
    var content = group && group.content || [];
    var minimum = 0;
    var maximum = 5000;
    var i;
    for (i = 0; i < content.length; i += 1) {
      if (content[i].searchKeyword === 'minPrice') { minimum = Number(content[i].searchParams); }
      if (content[i].searchKeyword === 'maxPrice') { maximum = Number(content[i].searchParams); }
    }
    return { min: isNaN(minimum) ? 0 : minimum, max: isNaN(maximum) ? 5000 : maximum };
  }

  function priceValues(url, config) {
    var low = Number(url && url.searchParams.get('minPrice'));
    var high = Number(url && url.searchParams.get('maxPrice'));
    if (isNaN(low)) { low = config.min; }
    if (isNaN(high)) { high = config.max; }
    low = Math.max(config.min, Math.min(low, config.max));
    high = Math.max(low, Math.min(high, config.max));
    return { low: low, high: high };
  }

  function formatMoney(value) {
    try { return Number(value).toLocaleString('zh-TW'); } catch (error) { return String(value); }
  }

  function writePriceToUrl(url, config, low, high) {
    if (low <= config.min) { url.searchParams.delete('minPrice'); }
    else { url.searchParams.set('minPrice', String(low)); }
    if (high >= config.max) { url.searchParams.delete('maxPrice'); }
    else { url.searchParams.set('maxPrice', String(high)); }
    resetPageParameters(url);
  }

  function createPriceRange(group) {
    var config = getPriceConfig(group);
    var url = currentWorkingUrl() || currentUrl();
    var values = priceValues(url, config);
    var wrap = create('div', 'tdsb-v1-price', { 'data-tdsb-v1-price': 'true' });
    var copy = create('div', 'tdsb-v1-price-copy');
    var lowCopy = create('span', '', { 'data-tdsb-v1-price-low': 'true' });
    var highCopy = create('span', '', { 'data-tdsb-v1-price-high': 'true' });
    var track = create('div', 'tdsb-v1-price-track');
    var low = create('input', 'tdsb-v1-range', { type: 'range', min: config.min, max: config.max, step: getSettings().priceStep || 100, value: values.low, 'aria-label': '最低價格' });
    var high = create('input', 'tdsb-v1-range', { type: 'range', min: config.min, max: config.max, step: getSettings().priceStep || 100, value: values.high, 'aria-label': '最高價格' });
    low.setAttribute('data-tdsb-v1-range', 'low'); high.setAttribute('data-tdsb-v1-range', 'high');
    wrap.setAttribute('data-tdsb-v1-price-min', String(config.min)); wrap.setAttribute('data-tdsb-v1-price-max', String(config.max));
    copy.appendChild(lowCopy); copy.appendChild(highCopy); track.appendChild(low); track.appendChild(high); wrap.appendChild(copy); wrap.appendChild(track);
    function update(commit) {
      var lowValue = Number(low.value);
      var highValue = Number(high.value);
      if (lowValue > highValue) {
        if (document.activeElement === low) { lowValue = highValue; low.value = String(lowValue); }
        else { highValue = lowValue; high.value = String(highValue); }
      }
      lowCopy.textContent = 'NT$' + formatMoney(lowValue);
      highCopy.textContent = 'NT$' + formatMoney(highValue);
      track.style.setProperty('--tdsb-low', ((lowValue - config.min) / (config.max - config.min) * 100) + '%');
      track.style.setProperty('--tdsb-high', ((highValue - config.min) / (config.max - config.min) * 100) + '%');
      if (commit) {
        var next = currentWorkingUrl();
        writePriceToUrl(next, config, lowValue, highValue);
        if (state.mode === 'mobile') { state.draftUrl = next; }
        else { applyUrl(next, 'price'); }
      }
    }
    low.addEventListener('input', function () { update(false); });
    high.addEventListener('input', function () { update(false); });
    low.addEventListener('change', function () { update(true); });
    high.addEventListener('change', function () { update(true); });
    update(false);
    return wrap;
  }

  function createGroup(group, forceOpen) {
    var section = create('section', 'tdsb-v1-group', { 'data-tdsb-v1-group': group.id || '' });
    var open = typeof forceOpen === 'boolean' ? forceOpen : group.defaultOpen !== false;
    var button = create('button', 'tdsb-v1-group-button', { type: 'button', 'aria-expanded': open ? 'true' : 'false' });
    var title = create('span', 'tdsb-v1-group-title');
    var icon = create('i', 'tdsb-v1-group-icon ico ' + (open ? 'ico-subtract' : 'ico-add'), { 'aria-hidden': 'true' });
    var panel = create('div', 'tdsb-v1-panel');
    var inner = create('div', 'tdsb-v1-panel-inner');
    var content = group.content || [];
    var i;
    title.textContent = group.label || '';
    button.appendChild(title); button.appendChild(icon); panel.appendChild(inner); section.appendChild(button); section.appendChild(panel);
    section.setAttribute('data-open', open ? 'true' : 'false');
    if (group.itemType === 'priceRange') { inner.appendChild(createPriceRange(group)); }
    else {
      for (i = 0; i < content.length; i += 1) {
        if (group.itemType === 'toggleGroup') { inner.appendChild(createToggleOption(content[i])); }
        else if (group.itemType === 'seriesLink') { inner.appendChild(createLinkOption(content[i], true)); }
        else { inner.appendChild(createLinkOption(content[i], false)); }
      }
    }
    button.addEventListener('click', function () {
      var next = section.getAttribute('data-open') !== 'true';
      section.setAttribute('data-open', next ? 'true' : 'false');
      button.setAttribute('aria-expanded', next ? 'true' : 'false');
      icon.className = 'tdsb-v1-group-icon ico ' + (next ? 'ico-subtract' : 'ico-add');
      scheduleSync();
      window.setTimeout(scheduleSync, 320);
    });
    return section;
  }

  function groupsFor(panelName) {
    var groups = state.dataset.menuItems || [];
    var output = [];
    var i;
    for (i = 0; i < groups.length; i += 1) {
      if (!panelName || groups[i].mobilePanel === panelName) { output.push(groups[i]); }
    }
    return output;
  }

  function buildSidebar() {
    var host = portal('sidebar');
    var sidebar = create('aside', 'tdsb-v1-sidebar', { 'aria-label': '商品分類與篩選' });
    var groups = groupsFor('');
    var i;
    host.innerHTML = '';
    for (i = 0; i < groups.length; i += 1) { sidebar.appendChild(createGroup(groups[i])); }
    host.appendChild(sidebar);
    updateAllCheckedStates();
  }

  function availableSortOptions() {
    var options = state.dataset.sortMode && state.dataset.sortMode.content || [];
    var output = [];
    var showFor;
    var i;
    for (i = 0; i < options.length; i += 1) {
      showFor = options[i].showFor || ['category', 'search'];
      if (showFor.indexOf(state.variant) !== -1) { output.push(options[i]); }
    }
    return output;
  }

  function selectedSortOption(options) {
    var url = currentUrl();
    var parameter = getSettings().sortParameter || 'sortMode';
    var value = url && url.searchParams.get(parameter);
    var nativeText = normalizeText(state.native.sort && state.native.sort.textContent);
    var i;
    for (i = 0; i < options.length; i += 1) {
      if (String(options[i].searchParams) === value) { return options[i]; }
    }
    for (i = 0; i < options.length; i += 1) {
      if (nativeText.indexOf(normalizeText(options[i].label)) !== -1) { return options[i]; }
    }
    return options[0] || { label: '' };
  }

  function buildSort() {
    var host = portal('sort');
    var options = availableSortOptions();
    var selected = selectedSortOption(options);
    var wrap = create('div', 'tdsb-v1-sort', { 'data-open': 'false' });
    var button = create('button', 'tdsb-v1-sort-button', { type: 'button', 'aria-expanded': 'false', 'aria-haspopup': 'listbox' });
    var list = create('div', 'tdsb-v1-sort-list', { role: 'listbox' });
    var item;
    var i;
    host.innerHTML = '';
    button.textContent = selected.label || '';
    for (i = 0; i < options.length; i += 1) {
      item = create('button', 'tdsb-v1-sort-option', { type: 'button', role: 'option', 'aria-selected': options[i] === selected ? 'true' : 'false' });
      item.textContent = options[i].label || '';
      (function (option) {
        item.addEventListener('click', function () {
          var url = currentUrl();
          var parameter = option.searchKeyword || getSettings().sortParameter || 'sortMode';
          if (url) {
            url.searchParams.set(parameter, option.searchParams);
            resetPageParameters(url);
            applyUrl(url, 'sort');
          }
        });
      }(options[i]));
      list.appendChild(item);
    }
    button.addEventListener('click', function () {
      var open = wrap.getAttribute('data-open') !== 'true';
      wrap.setAttribute('data-open', open ? 'true' : 'false');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    wrap.appendChild(button); wrap.appendChild(list); host.appendChild(wrap);
  }

  function selectedItems(url) {
    var groups = state.dataset.menuItems || [];
    var output = [];
    var group;
    var item;
    var i;
    var j;
    for (i = 0; i < groups.length; i += 1) {
      group = groups[i];
      if (group.itemType !== 'toggleGroup') { continue; }
      for (j = 0; j < (group.content || []).length; j += 1) {
        item = group.content[j];
        if (hasAllValues(url, item)) { output.push({ group: group, item: item }); }
      }
    }
    return output;
  }

  function buildSelected() {
    var host = portal('selected');
    var url = currentUrl();
    var selected = selectedItems(url);
    var wrap = create('div', 'tdsb-v1-selected');
    var chips = create('div', 'tdsb-v1-selected-chips');
    var chip;
    var icon;
    var i;
    host.innerHTML = '';
    for (i = 0; i < selected.length; i += 1) {
      chip = create('button', 'tdsb-v1-chip', { type: 'button' });
      chip.appendChild(document.createTextNode(selected[i].item.label || ''));
      icon = create('i', 'tdsb-v1-chip-icon ico ico-subtract', { 'aria-hidden': 'true' });
      chip.appendChild(icon);
      (function (item) {
        chip.addEventListener('click', function () {
          var next = currentUrl();
          toggleUrlItem(next, item, false);
          applyUrl(next, 'chip-remove');
        });
      }(selected[i].item));
      chips.appendChild(chip);
    }
    if (selected.length) {
      var clear = create('button', 'tdsb-v1-clear-all', { type: 'button' });
      clear.textContent = state.dataset.text.clearAll || '清除所有篩選';
      clear.addEventListener('click', function () { clearManagedFilters(currentUrl(), true); });
      wrap.appendChild(chips);
      wrap.appendChild(clear);
    }
    host.appendChild(wrap);
  }

  function clearManagedFilters(url, navigate) {
    var groups = state.dataset.menuItems || [];
    var parameters = {};
    var i;
    var j;
    for (i = 0; i < groups.length; i += 1) {
      for (j = 0; j < (groups[i].content || []).length; j += 1) {
        if (groups[i].content[j].searchKeyword) { parameters[groups[i].content[j].searchKeyword] = true; }
      }
    }
    parameters.minPrice = true; parameters.maxPrice = true;
    for (i in parameters) {
      if (Object.prototype.hasOwnProperty.call(parameters, i)) { url.searchParams.delete(i); }
    }
    resetPageParameters(url);
    if (navigate) { applyUrl(url, 'clear'); }
    return url;
  }

  function filterSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"/></svg>';
  }

  function buildMobileControls() {
    var host = portal('mobile-controls');
    var wrap = create('div', 'tdsb-v1-mobile-controls');
    var category = create('button', 'tdsb-v1-mobile-control', { type: 'button' });
    var filter = create('button', 'tdsb-v1-mobile-control', { type: 'button' });
    host.innerHTML = '';
    category.innerHTML = '<span>' + (state.dataset.text.categoryButton || '分類') + '</span>' + filterSvg();
    filter.innerHTML = '<span>' + (state.dataset.text.filterButton || '篩選') + '</span>' + filterSvg();
    category.addEventListener('click', function () { openPopup('category', category); });
    filter.addEventListener('click', function () { openPopup('filter', filter); });
    wrap.appendChild(category); wrap.appendChild(filter); host.appendChild(wrap);
  }

  function focusable(container) {
    return toArray(container.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'));
  }

  function closePopup(commit) {
    var popup = state.popup;
    var delay = getSettings().popupAnimationMilliseconds || 300;
    if (!popup) { return; }
    if (commit && state.draftUrl) { applyUrl(state.draftUrl, 'mobile-confirm'); return; }
    popup.setAttribute('data-visible', 'false');
    document.documentElement.removeAttribute('data-tdsb-v1-scroll-lock');
    window.setTimeout(function () {
      if (popup.parentNode) { popup.parentNode.removeChild(popup); }
      state.popup = null;
      state.draftUrl = null;
      if (state.popupTrigger && state.popupTrigger.focus) { state.popupTrigger.focus(); }
      state.popupTrigger = null;
    }, delay);
  }

  function openPopup(panelName, trigger) {
    var overlay;
    var sheet;
    var header;
    var title;
    var close;
    var body;
    var actions;
    var clear;
    var confirm;
    var groups = groupsFor(panelName);
    var i;
    if (state.popup) { closePopup(false); }
    state.draftUrl = currentUrl();
    state.popupTrigger = trigger;
    overlay = create('div', 'tdsb-v1-overlay', { role: 'presentation', 'data-visible': 'false' });
    sheet = create('section', 'tdsb-v1-sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': panelName === 'category' ? '分類' : '篩選' });
    header = create('div', 'tdsb-v1-sheet-header');
    title = create('div', 'tdsb-v1-sheet-title');
    close = create('button', 'tdsb-v1-sheet-close', { type: 'button', 'aria-label': state.dataset.text.close || '關閉' });
    body = create('div', 'tdsb-v1-sheet-body');
    actions = create('div', 'tdsb-v1-sheet-actions');
    clear = create('button', 'tdsb-v1-action tdsb-v1-action--clear', { type: 'button' });
    confirm = create('button', 'tdsb-v1-action tdsb-v1-action--confirm', { type: 'button' });
    title.textContent = panelName === 'category' ? (state.dataset.text.categoryButton || '分類') : (state.dataset.text.filterButton || '篩選');
    close.textContent = '×'; clear.textContent = state.dataset.text.clearButton || '清除篩選'; confirm.textContent = state.dataset.text.confirmButton || '確認';
    for (i = 0; i < groups.length; i += 1) { body.appendChild(createGroup(groups[i], i === 0)); }
    close.addEventListener('click', function () { closePopup(false); });
    clear.addEventListener('click', function () {
      clearManagedFilters(state.draftUrl, false);
      updateAllCheckedStates();
      var ranges = toArray(body.querySelectorAll('[data-tdsb-v1-price="true"]'));
      var r;
      var low;
      var high;
      for (r = 0; r < ranges.length; r += 1) {
        low = ranges[r].querySelector('[data-tdsb-v1-range="low"]');
        high = ranges[r].querySelector('[data-tdsb-v1-range="high"]');
        if (low) { low.value = ranges[r].getAttribute('data-tdsb-v1-price-min'); low.dispatchEvent(new Event('input')); }
        if (high) { high.value = ranges[r].getAttribute('data-tdsb-v1-price-max'); high.dispatchEvent(new Event('input')); }
      }
    });
    confirm.addEventListener('click', function () { closePopup(true); });
    overlay.addEventListener('mousedown', function (event) { if (event.target === overlay) { closePopup(false); } });
    sheet.addEventListener('keydown', function (event) {
      var items;
      var first;
      var last;
      if (event.key === 'Escape') { event.preventDefault(); closePopup(false); return; }
      if (event.key === 'Tab') {
        items = focusable(sheet); first = items[0]; last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    header.appendChild(title); header.appendChild(close); actions.appendChild(clear); actions.appendChild(confirm); sheet.appendChild(header); sheet.appendChild(body); sheet.appendChild(actions); overlay.appendChild(sheet); document.body.appendChild(overlay);
    state.popup = overlay;
    document.documentElement.setAttribute('data-tdsb-v1-scroll-lock', 'true');
    updateAllCheckedStates();
    window.requestAnimationFrame(function () { overlay.setAttribute('data-visible', 'true'); close.focus(); });
    pushEvent('td_sidebar_popup_open', { td_sidebar_panel: panelName });
  }

  function updatePriceDisplays() {
    var wraps = toArray(document.querySelectorAll('[data-tdsb-v1-price="true"]'));
    var url = currentWorkingUrl();
    var config;
    var values;
    var low;
    var high;
    var track;
    var i;
    for (i = 0; i < wraps.length; i += 1) {
      config = { min: Number(wraps[i].getAttribute('data-tdsb-v1-price-min')), max: Number(wraps[i].getAttribute('data-tdsb-v1-price-max')) };
      values = priceValues(url, config);
      low = wraps[i].querySelector('[data-tdsb-v1-range="low"]');
      high = wraps[i].querySelector('[data-tdsb-v1-range="high"]');
      track = wraps[i].querySelector('.tdsb-v1-price-track');
      if (low && document.activeElement !== low) { low.value = String(values.low); }
      if (high && document.activeElement !== high) { high.value = String(values.high); }
      if (wraps[i].querySelector('[data-tdsb-v1-price-low]')) { wraps[i].querySelector('[data-tdsb-v1-price-low]').textContent = 'NT$' + formatMoney(values.low); }
      if (wraps[i].querySelector('[data-tdsb-v1-price-high]')) { wraps[i].querySelector('[data-tdsb-v1-price-high]').textContent = 'NT$' + formatMoney(values.high); }
      if (track && config.max > config.min) {
        track.style.setProperty('--tdsb-low', ((values.low - config.min) / (config.max - config.min) * 100) + '%');
        track.style.setProperty('--tdsb-high', ((values.high - config.min) / (config.max - config.min) * 100) + '%');
      }
    }
  }

  function clearNativeMarks() {
    var key;
    restoreDesktopLayoutHeight();
    if (state.native.sidebar) { state.native.sidebar.removeAttribute('data-tdsb-v1-native-sidebar'); }
    if (state.native.sort) { state.native.sort.removeAttribute('data-tdsb-v1-native-sort'); }
    if (state.native.selected) { state.native.selected.removeAttribute('data-tdsb-v1-native-selected'); }
    if (state.native.mobileControls) { state.native.mobileControls.removeAttribute('data-tdsb-v1-native-mobile-controls'); }
    if (state.native.breadcrumb) { state.native.breadcrumb.removeAttribute('data-tdsb-v1-breadcrumb'); }
    state.native = {};
    for (key in state.portals) {
      if (Object.prototype.hasOwnProperty.call(state.portals, key) && state.portals[key]) { state.portals[key].innerHTML = ''; state.portals[key].style.display = 'none'; state.portals[key].removeAttribute('data-tdsb-v1-positioned'); }
    }
  }

  function locateNative() {
    state.native.sort = findNativeSort();
    state.native.selected = findNativeSelected();
    if (state.mode === 'desktop') {
      state.native.sidebar = findDesktopSidebar();
      if (!state.native.sidebar || !state.native.sort) { return false; }
    } else {
      state.native.mobileControls = findMobileControls();
      state.native.productCount = findProductCount();
      state.native.productCountRow = findProductCountRow(state.native.productCount);
      if (!state.native.mobileControls || !state.native.productCount || !state.native.productCountRow) { return false; }
    }
    return true;
  }

  function mount() {
    clearNativeMarks();
    state.dataset = getDataset();
    if (!state.dataset || !document.body) { return false; }
    state.mode = detectLayoutMode();
    state.variant = detectVariant();
    if (!locateNative()) { return false; }
    state.modeLocked = true;
    ensureRoot();
    document.documentElement.setAttribute('data-tdsb-v1-active', 'true');
    document.documentElement.setAttribute('data-tdsb-v1-mode', state.mode);
    if (state.mode === 'desktop') {
      buildSidebar(); buildSort(); buildSelected(); markBreadcrumb();
      state.native.sidebar.setAttribute('data-tdsb-v1-native-sidebar', 'hidden');
      state.native.sort.setAttribute('data-tdsb-v1-native-sort', 'hidden');
      if (state.native.selected) { state.native.selected.setAttribute('data-tdsb-v1-native-selected', 'hidden'); }
    } else {
      buildMobileControls(); buildSort();
      state.native.mobileControls.setAttribute('data-tdsb-v1-native-mobile-controls', 'hidden');
      if (state.native.sort) { state.native.sort.setAttribute('data-tdsb-v1-native-sort', 'hidden'); }
    }
    scheduleSync();
    scheduleStabilizedSync();
    if (window.ResizeObserver) {
      if (state.resizeObserver) { state.resizeObserver.disconnect(); }
      state.resizeObserver = new ResizeObserver(scheduleSync);
      if (state.native.sidebar) { state.resizeObserver.observe(state.native.sidebar); }
      if (state.native.sort) { state.resizeObserver.observe(state.native.sort); }
      if (state.native.mobileControls) { state.resizeObserver.observe(state.native.mobileControls); }
      if (state.native.selected) { state.resizeObserver.observe(state.native.selected); }
      if (state.native.productCountRow) { state.resizeObserver.observe(state.native.productCountRow); }
    }
    pushEvent('td_sidebar_ready', { td_sidebar_mode: state.mode, td_sidebar_variant: state.variant });
    return true;
  }

  function retryMount() {
    var settings;
    if (state.destroyed) { return; }
    state.dataset = getDataset();
    settings = (state.dataset && state.dataset.settings) || {};
    if (mount()) { state.retryCount = 0; return; }
    state.retryCount += 1;
    if (state.retryCount < Number(settings.maximumStartupAttempts || 80)) {
      window.clearTimeout(state.retryTimer);
      state.retryTimer = window.setTimeout(retryMount, Number(settings.retryIntervalMilliseconds || 100));
    }
  }

  function refresh() {
    clearStabilizeTimers();
    state.retryCount = 0;
    window.clearTimeout(state.retryTimer);
    retryMount();
  }

  function onResize() {
    var nextMode = detectLayoutMode();
    if (nextMode !== state.mode) { refresh(); }
    else { scheduleSync(); }
  }

  function onWindowLoad() {
    scheduleStabilizedSync();
  }

  function onResourceLoad(event) {
    var target = event && event.target;
    if (target && target.tagName && String(target.tagName).toLowerCase() === 'img') { scheduleStabilizedSync(); }
  }

  function bind() {
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('orientationchange', refresh);
    window.addEventListener('load', onWindowLoad);
    window.addEventListener('pageshow', onWindowLoad);
    document.addEventListener('load', onResourceLoad, true);
    document.addEventListener('td-sidebar-dataset-ready', refresh);
    document.addEventListener('click', function (event) {
      var sort = safeQuery('#' + ROOT_ID + ' .tdsb-v1-sort[data-open="true"]');
      if (sort && !sort.contains(event.target)) {
        sort.setAttribute('data-open', 'false');
        var button = sort.querySelector('.tdsb-v1-sort-button');
        if (button) { button.setAttribute('aria-expanded', 'false'); }
      }
    });
  }

  function destroy() {
    state.destroyed = true;
    state.modeLocked = false;
    window.clearTimeout(state.retryTimer);
    clearStabilizeTimers();
    if (state.syncFrame) { window.cancelAnimationFrame(state.syncFrame); }
    if (state.resizeObserver) { state.resizeObserver.disconnect(); }
    if (state.popup) { closePopup(false); }
    clearNativeMarks();
    document.documentElement.removeAttribute('data-tdsb-v1-active');
    document.documentElement.removeAttribute('data-tdsb-v1-mode');
    document.documentElement.removeAttribute('data-tdsb-v1-scroll-lock');
    if (state.root && state.root.parentNode) { state.root.parentNode.removeChild(state.root); }
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', scheduleSync);
    window.removeEventListener('orientationchange', refresh);
    window.removeEventListener('load', onWindowLoad);
    window.removeEventListener('pageshow', onWindowLoad);
    document.removeEventListener('load', onResourceLoad, true);
    document.removeEventListener('td-sidebar-dataset-ready', refresh);
  }

  if (window.TDSidebarV1 && typeof window.TDSidebarV1.destroy === 'function') {
    window.TDSidebarV1.destroy();
  }
  window.TDSidebarV1 = { version: VERSION, refresh: refresh, destroy: destroy };
  bind();
  refresh();
}());
