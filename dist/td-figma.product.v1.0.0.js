/* TD_Figma_Product_Page_GTM_v1.0.0.html */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var state = {
    mode: '',
    initialized: false,
    retryCount: 0,
    retryTimer: null,
    enhancementRetryCount: 0,
    enhancementTimer: null,
    favObserver: null,
    originalFav: null,
    proxyFav: null
  };

  function safeQuery(selector, context) {
    try { return (context || document).querySelector(selector); } catch (error) { return null; }
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
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

  function markCollapses() {
    var groups = toArray(document.querySelectorAll('#SalePageIndexController .collapse-group'));
    var text;
    var type;
    var i;
    for (i = 0; i < groups.length; i += 1) {
      text = normalizeText(groups[i].textContent);
      type = '';
      if (groups[i].classList.contains('salepage-promotion') || text.indexOf('本商品適用活動') !== -1) { type = 'promotion'; }
      else if (text.indexOf('付款與運送方式') !== -1) { type = 'shipping'; }
      else if (text.indexOf('商品特色') !== -1) { type = 'feature'; }
      else if (text.indexOf('商品相關分類') !== -1) { type = 'related'; }
      if (type) { groups[i].setAttribute('data-tdpp-v1-collapse', type); }
    }
  }

  function stripAngularAttributes(root) {
    var nodes = [root].concat(toArray(root.querySelectorAll('*')));
    var attrs;
    var i;
    var j;
    for (i = 0; i < nodes.length; i += 1) {
      attrs = toArray(nodes[i].attributes);
      for (j = 0; j < attrs.length; j += 1) {
        if (/^(?:data-)?ng-|^x-ng-|^ng:/.test(attrs[j].name) || attrs[j].name === 'data-ns-ga-event-track') {
          nodes[i].removeAttribute(attrs[j].name);
        }
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
    var original;
    var target;
    var proxy;
    if (safeQuery('[data-tdpp-v1-fav-proxy="true"]')) { return true; }
    original = safeQuery('#SalePageIndexController .price-wrapper [data-qe-id="body-add-to-wishlist-icon"]');
    if (!original) { return false; }
    target = state.mode === 'desktop'
      ? safeQuery('#SalePageIndexController .qty-wrapper')
      : safeQuery('#SalePageIndexController .salepage-fix-bottom .salepage-btn');
    if (!target) { return false; }

    proxy = original.cloneNode(true);
    stripAngularAttributes(proxy);
    proxy.removeAttribute('data-qe-id');
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

    if (state.mode === 'desktop') { target.appendChild(proxy); }
    else { target.insertBefore(proxy, target.firstChild); }
    original.setAttribute('data-tdpp-v1-original-fav', 'hidden');
    state.originalFav = original;
    state.proxyFav = proxy;
    syncFavState();

    if (window.MutationObserver) {
      state.favObserver = new MutationObserver(syncFavState);
      state.favObserver.observe(safeQuery('i', original) || original, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    return true;
  }

  function ensureEnhancements() {
    markCollapses();
    if (!buildFavProxy() && state.enhancementRetryCount < 20) {
      state.enhancementRetryCount += 1;
      state.enhancementTimer = window.setTimeout(ensureEnhancements, 250);
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
      if (state.retryCount < 32) {
        state.retryCount += 1;
        state.retryTimer = window.setTimeout(initialize, 250);
      }
      return;
    }
    setMode(mode);
    ensureEnhancements();
    state.initialized = true;
    pushReadyEvent();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initialize, { once: true }); }
  else { initialize(); }
  window.setTimeout(initialize, 0);
}());
