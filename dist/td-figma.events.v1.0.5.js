/* TD Figma Events Bundle v1.0.5 | config + runtime */
/* TD Figma Events Config v1.0.5
 * ------------------------------------------------------------
 * 維護方式：事件新增 / 修改 / 刪除，優先只改這個檔案的 rules。
 * engine 不需隨一般事件規格調整而修改。
 *
 * pages: all | home | category | product
 * trigger: page | scroll | click | impression
 * params 中未設定的欄位，Runtime 會固定送 undefined。
 * td_version 不需逐條設定，Runtime 永遠固定送 1。
 */
(function (window) {
  'use strict';

  window.TDFigmaEventsConfig = {
    version: '1.0.5',
    tdVersion: 1,
    impressionThreshold: 0.5,

    pageRules: {
      home: { type: 'exactPath', value: '/' },
      category: { type: 'pathContains', value: '/SalePageCategory/' },
      product: { type: 'pathContains', value: '/SalePage/Index/' }
    },

    navFirstLevelLabels: {
      featured: '本月主打',
      needs: '依肌膚需求',
      'needs-classroom': '依肌膚需求',
      series: '系列找產品',
      member: '會員福利',
      knowledge: '保養知識庫',
      'knowledge-article': '保養知識庫',
      classroom: '保養知識庫',
      about: '關於品牌',
      social: '社群'
    },

    socialShortLabels: {
      facebook: 'FB',
      instagram: 'IG',
      line: 'Line'
    },

    rules: [
      /* ========================================================
       * 全站
       * ====================================================== */
      {
        id: '1-a-version-impression',
        pages: ['all'],
        trigger: 'page',
        eventName: 'td_version_imp',
        params: {}
      },
      {
        id: '1-b-scroll',
        pages: ['all'],
        trigger: 'scroll',
        eventName: 'td_scroll',
        thresholds: [0, 25, 50, 75, 100],
        params: {
          td_action: { source: 'scrollPercent' }
        }
      },
      {
        id: '1-1-announcement',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav',
        selector: 'a[data-qe-id="top_message"]',
        predicate: 'announcementBar',
        params: {
          td_click: 1,
          td_action: { source: 'text' },
          td_position: '跑馬燈'
        }
      },
      {
        id: '1-2-logo',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav',
        selector: '.tdfh-v1-desktop-logo-link, .tdfn-v1-mobile-logo',
        params: {
          td_click: 1,
          td_position: 'logo'
        }
      },
      {
        id: '1-3-nav-search-submit',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav_search',
        selector: '.tdfs-v3-desktop-root .tdfs-v3-search-button, #hsearch .searchkeyword, #hsearch button[type="submit"], .nav-search-box .searchkeyword, .nav-search-box button[type="submit"], .search-box .searchkeyword, .search-box button[type="submit"], [data-tdfs-v1-submit], [data-tdfs-v3-submit]',
        predicate: 'searchSubmit',
        params: {
          td_click: 1,
          td_action: { source: 'searchKeyword' },
          td_position: '導行列'
        }
      },
      {
        id: '1-4-nav-search-hotkey',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav_search',
        selector: '[data-tdfs-v3-hotkey], [data-tdfs-v1-hotkey]',
        params: {
          td_click: 1,
          td_action: { source: 'searchHotKeyword' },
          td_position: '導行列'
        }
      },
      {
        id: '1-5-navigation-link',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav',
        selector: '[data-tdfn-link], [data-tdfn-d-trigger], [data-tdfn-d-child-open], [data-tdfn-d-knowledge-second], [data-tdfn-d-knowledge-third], [data-tdfn-m-open]',
        params: {
          td_click: 1,
          td_action: { source: 'navAction' },
          td_position: { source: 'navPosition' }
        }
      },
      {
        id: '1-6-floating-sidebar',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_nav',
        selector: '.toolbox__container a, .toolbox__container button, .toolbox__container [role="button"], .toolbox__container [data-tip], .toolbox__popover, .toolbox__nails, .toolbox__popover a, .toolbox__popover button, .toolbox__popover [role="button"], .toolbox__nails a, .toolbox__nails button, .toolbox__nails [role="button"], .toolbox__popover [class*="ico-"], .toolbox__nails [class*="ico-"], .ico-message',
        predicate: 'floatingSidebar',
        params: {
          td_click: 1,
          td_action: { source: 'floatingSidebarAction' },
          td_position: '懸浮側邊Bar'
        }
      },

      /* ========================================================
       * 首頁
       * ====================================================== */
      {
        id: '2-home-bn-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_bn',
        selector: '#tdhs-v1-root [data-tdhs-v1-slide]:not([data-tdhs-v1-clone="true"])',
        params: {
          td_imp: 1,
          td_action: { source: 'imageAlt' },
          td_position: 'BN'
        }
      },
      {
        id: '2-home-bn-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_bn',
        selector: '#tdhs-v1-root [data-tdhs-v1-link]',
        rejectClosest: '[data-tdhs-v1-clone="true"]',
        params: {
          td_click: 1,
          td_action: { source: 'imageAlt' },
          td_position: 'BN'
        }
      },
      {
        id: '3-member-benefit-tab-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_section',
        selector: '#tdht-v1-root [data-tdht-v1-item]',
        predicate: 'memberBenefitTrustItem',
        params: {
          td_imp: 1,
          td_action: '會員福利',
          td_position: 'tab'
        }
      },
      {
        id: '3-member-benefit-tab-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdht-v1-root [data-tdht-v1-link]',
        predicate: 'memberBenefitTrustItem',
        params: {
          td_click: 1,
          td_action: '會員福利',
          td_position: 'tab'
        }
      },
      {
        id: '4-skin-series-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_nav',
        selector: '#tdhsc-v1-root [data-tdhsc-v1-item]',
        params: {
          td_imp: 1,
          td_action: { source: 'childText', selector: '.tdhsc-v1-series-name' },
          td_position: { source: 'rootText', root: '#tdhsc-v1-root', selector: '.tdhsc-v1-title' }
        }
      },
      {
        id: '4-skin-series-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_nav',
        selector: '#tdhsc-v1-root [data-tdhsc-v1-link]',
        params: {
          td_click: 1,
          td_action: { source: 'childText', selector: '.tdhsc-v1-series-name' },
          td_position: { source: 'rootText', root: '#tdhsc-v1-root', selector: '.tdhsc-v1-title' }
        }
      },
      {
        id: '5-home-search-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_search',
        selector: '#tdhk-v1-root [data-tdhk-v1-item]',
        params: {
          td_imp: 1,
          td_action: { source: 'text' },
          td_position: { source: 'rootText', root: '#tdhk-v1-root', selector: '.tdhk-v1-title' }
        }
      },
      {
        id: '5-home-search-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_search',
        selector: '#tdhk-v1-root [data-tdhk-v1-link]',
        params: {
          td_click: 1,
          td_action: { source: 'text' },
          td_position: { source: 'rootText', root: '#tdhk-v1-root', selector: '.tdhk-v1-title' }
        }
      },
      {
        id: '6-exclusive-offer-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_bn',
        selector: '#tdheo-v1-root [data-tdheo-v1-banner]',
        params: {
          td_imp: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'rootText', root: '#tdheo-v1-root', selector: '.tdheo-v1-title' }
        }
      },
      {
        id: '6-exclusive-offer-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_bn',
        selector: '#tdheo-v1-root [data-tdheo-v1-link]',
        params: {
          td_click: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'rootText', root: '#tdheo-v1-root', selector: '.tdheo-v1-title' }
        }
      },
      {
        id: '7-home-product-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_product',
        selector: '#tdhpt-v1-root [data-tdhpt-v1-product-link]',
        params: {
          td_click: 1,
          td_action: '官網限時活動',
          td_position: { source: 'activeHomeProductTab' },
          td_product: { source: 'homeProductName' }
        }
      },
      {
        id: '8-review-section-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdhur-v1-root [data-tdhur-v1-review]:not([data-tdhur-v1-clone="true"])',
        params: {
          td_click: 1,
          td_action: { source: 'reviewMetaAction' },
          td_position: '好評推薦'
        }
      },
      {
        id: '9-product-series-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_section',
        selector: '#tdhps-v1-root [data-tdhps-v1-item]',
        params: {
          td_imp: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'rootText', root: '#tdhps-v1-root', selector: '.tdhps-v1-title' }
        }
      },
      {
        id: '9-product-series-click',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdhps-v1-root [data-tdhps-v1-link]',
        params: {
          td_click: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'rootText', root: '#tdhps-v1-root', selector: '.tdhps-v1-title' }
        }
      },
      {
        id: '10-member-assurance-imp',
        pages: ['home'],
        trigger: 'impression',
        eventName: 'td_home_section',
        selector: '#tdhma-v1-root',
        params: {
          td_imp: 1,
          td_action: '會員福利'
        }
      },
      {
        id: '10-1-more-member-benefits',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdhma-v1-root [data-tdhma-v1-member-link]',
        params: {
          td_click: 1,
          td_action: '更多會員福利',
          td_position: '會員福利'
        }
      },
      {
        id: '10-2-official-authenticity',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdhma-v1-root [data-tdhma-v1-assurance-link]',
        params: {
          td_click: 1,
          td_action: '點此查看官方正貨聲明',
          td_position: '會員福利'
        }
      },
      {
        id: '10-3-member-question',
        pages: ['home'],
        trigger: 'click',
        eventName: 'td_home_section',
        selector: '#tdhma-v1-root [data-tdhma-v1-question-link]',
        params: {
          td_click: 1,
          td_action: { source: 'childText', selector: '.tdhma-v1-question-title' },
          td_position: '會員福利'
        }
      },

      /* ========================================================
       * 全站 Footer
       * ====================================================== */
      {
        id: '11-1-footer-link',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_footer',
        selector: '.tdff-v1-root a:not(.tdff-v1-social-link)',
        predicate: 'footerSectionLink',
        params: {
          td_click: 1,
          td_action: { source: 'text' },
          td_position: { source: 'footerSectionTitle' }
        }
      },
      {
        id: '11-2-footer-social',
        pages: ['all'],
        trigger: 'click',
        eventName: 'td_footer',
        selector: '.tdff-v1-root .tdff-v1-social-link',
        params: {
          td_click: 1,
          td_action: { source: 'imageAlt' }
        }
      },

      /* ========================================================
       * 列表頁
       * ====================================================== */
      {
        id: '12-category-sidebar',
        pages: ['category'],
        trigger: 'click',
        eventName: 'td_category_sidebar',
        selector: '[data-tdsb-v1-keyword], .tdsb-v1-link-option',
        params: {
          td_click: 1,
          td_action: { source: 'categoryOptionLabel' },
          td_position: { source: 'categoryGroupTitle' }
        }
      },
      {
        id: '13-category-bn-imp',
        pages: ['category'],
        trigger: 'impression',
        eventName: 'td_category_bn',
        selector: 'a:not([class]):not(.tdfs-v3-hotkeys a):not(.social-ul a)',
        predicate: 'categoryBanner',
        observeTarget: 'self',
        waitFor: 'categoryBannerReplacement',
        params: {
          td_imp: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'documentTitle' }
        }
      },
      {
        id: '13-category-bn-click',
        pages: ['category'],
        trigger: 'click',
        eventName: 'td_category_bn',
        selector: 'a:not([class]):not(.tdfs-v3-hotkeys a):not(.social-ul a)',
        predicate: 'categoryBannerLink',
        params: {
          td_click: 1,
          td_action: { source: 'imageAlt' },
          td_position: { source: 'documentTitle' }
        }
      },

      /* ========================================================
       * 商品頁
       * ====================================================== */
      {
        id: '13-salepage-tab',
        pages: ['product'],
        trigger: 'click',
        eventName: 'td_salepage_tab',
        selector: '.nav-tab-link, .nav-tab [role="tab"], .slider-nav-ul-recommend a, .slider-nav-ul-recommend button, .panel-heading-recommend a, .panel-heading-recommend button, [data-tdpp-v1-recommend-tab]',
        predicate: 'productDetailTab',
        params: {
          td_click: 1,
          td_action: { source: 'productTabLabel' }
        }
      },
      {
        id: '14-salepage-sidebar',
        pages: ['product'],
        trigger: 'click',
        eventName: 'td_salepage_sidebar',
        selector: '.ns-tool-box a, .ns-tool-box button, .ns-tool-box [role="button"], .ns-tool-box img[alt]',
        rejectClosest: '[id*="easychat"]',
        params: {
          td_click: 1,
          td_action: { source: 'productSidebarAction' }
        }
      },
      {
        id: '14-easychat',
        pages: ['product'],
        trigger: 'click',
        eventName: 'td_salepage_sidebar',
        selector: '[id*="easychat"] [id*="chat-button"], [id*="easychat"][id*="chat-button"]',
        params: {
          td_click: 1,
          td_action: 'Easychat'
        }
      },
      {
        id: '15-interest-product',
        pages: ['product'],
        trigger: 'click',
        eventName: 'td_salepage_product',
        selector: '#tdppi-v1-root [data-tdppi-v1-card] a, #tdppi-v1-root [data-tdppi-v1-card] button',
        params: {
          td_click: 1,
          td_position: '你可能有興趣',
          td_product: { source: 'productRecommendationName' }
        }
      },
      {
        id: '16-shop-ranking-product',
        pages: ['product'],
        trigger: 'click',
        eventName: 'td_salepage_product',
        selector: '#SalePageIndexController [data-tdpp-v1-shop-ranking-only="true"] a, #SalePageIndexController .salepage-product-list a, #SalePageIndexController .slider-product-list:not(.salepage-browsing-history) a',
        predicate: 'shopRankingProduct',
        params: {
          td_click: 1,
          td_position: '全站排行',
          td_product: { source: 'productRecommendationName' }
        }
      }
    ]
  };
}(window));

/* TD Figma Events Runtime v1.0.5 | ES5 syntax */
(function (window, document) {
  'use strict';

  var CONFIG = window.TDFigmaEventsConfig;
  var VERSION = '1.0.5';
  var CATEGORY_BANNER_STATE_KEY = '__tdCategoryBannerReplaceState';
  var CATEGORY_BANNER_READY_EVENT = 'td:category-banner-ready';
  var CATEGORY_BANNER_READY_ATTR = 'data-td-category-banner-ready';
  var state = {
    pageTypes: [],
    activeRules: [],
    clickRules: [],
    impressionRules: [],
    scrollRules: [],
    observer: null,
    mutationObserver: null,
    scrollReached: {},
    initialized: false
  };

  if (!CONFIG || !CONFIG.rules) { return; }
  if (window.TDFigmaEvents && window.TDFigmaEvents.version === VERSION) { return; }

  function trim(value) {
    return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
  }

  function compactText(value) {
    return trim(value).replace(/\s+/g, ' ');
  }

  function normalizeText(value) {
    return compactText(value).replace(/\s+/g, '');
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function safeMatches(element, selector) {
    var fn;
    if (!element || element.nodeType !== 1 || !selector) { return false; }
    fn = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
    if (!fn) { return false; }
    try { return fn.call(element, selector); } catch (error) { return false; }
  }

  function safeQuery(selector, context) {
    try { return (context || document).querySelector(selector); } catch (error) { return null; }
  }

  function safeQueryAll(selector, context) {
    try { return toArray((context || document).querySelectorAll(selector)); } catch (error) { return []; }
  }

  function closest(element, selector, stopAt) {
    var current = element && element.nodeType === 3 ? element.parentElement : element;
    while (current && current !== stopAt && current !== document) {
      if (safeMatches(current, selector)) { return current; }
      current = current.parentElement;
    }
    return null;
  }

  function textOf(element) {
    return compactText(element && (element.textContent || element.innerText));
  }

  function firstNonEmpty(values) {
    var i;
    var value;
    for (i = 0; i < values.length; i += 1) {
      value = trim(values[i]);
      if (value) { return value; }
    }
    return undefined;
  }

  function imageAlt(element) {
    var image;
    var owner;
    var value;
    if (!element) { return undefined; }
    if (String(element.tagName || '').toLowerCase() === 'img') {
      value = trim(element.getAttribute('alt'));
      if (value) { return value; }
    }
    image = safeQuery('img[alt]', element);
    if (image && trim(image.getAttribute('alt'))) { return trim(image.getAttribute('alt')); }
    owner = closest(element, 'a,button,[role="button"]', null) || element;
    return firstNonEmpty([
      owner.getAttribute && owner.getAttribute('aria-label'),
      owner.getAttribute && owner.getAttribute('title'),
      owner.getAttribute && owner.getAttribute('data-label'),
      textOf(owner)
    ]);
  }

  function strictImageAlt(element) {
    var image;
    var value;
    if (!element) { return undefined; }
    if (String(element.tagName || '').toLowerCase() === 'img') {
      value = trim(element.getAttribute('alt'));
      if (value) { return value; }
    }
    image = safeQuery('img[alt]', element);
    if (image) {
      value = trim(image.getAttribute('alt'));
      if (value) { return value; }
    }
    return undefined;
  }

  function pageMatchesRule(pageName) {
    var path = window.location && window.location.pathname ? window.location.pathname : '/';
    var rule;
    if (pageName === 'all') { return true; }
    rule = CONFIG.pageRules && CONFIG.pageRules[pageName];
    if (!rule) { return false; }
    if (rule.type === 'exactPath') {
      if (path === rule.value) { return true; }
      if (rule.value === '/' && path === '') { return true; }
      return false;
    }
    if (rule.type === 'pathContains') { return path.indexOf(rule.value) !== -1; }
    return false;
  }

  function ruleIsActive(rule) {
    var pages = rule.pages || ['all'];
    var i;
    for (i = 0; i < pages.length; i += 1) {
      if (pageMatchesRule(pages[i])) { return true; }
    }
    return false;
  }

  function pushEvent(eventName, params) {
    var payload = {
      event: 'cusevent',
      event_name: eventName,
      td_imp: undefined,
      td_click: undefined,
      td_action: undefined,
      td_position: undefined,
      td_product: undefined,
      td_version: CONFIG.tdVersion
    };
    params = params || {};
    if (Object.prototype.hasOwnProperty.call(params, 'td_imp')) { payload.td_imp = params.td_imp; }
    if (Object.prototype.hasOwnProperty.call(params, 'td_click')) { payload.td_click = params.td_click; }
    if (Object.prototype.hasOwnProperty.call(params, 'td_action')) { payload.td_action = params.td_action; }
    if (Object.prototype.hasOwnProperty.call(params, 'td_position')) { payload.td_position = params.td_position; }
    if (Object.prototype.hasOwnProperty.call(params, 'td_product')) { payload.td_product = params.td_product; }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    return payload;
  }

  function getNavAction(element) {
    var menu = trim(element && element.getAttribute('data-menu')).toLowerCase();
    var label = trim(element && element.getAttribute('data-label'));
    var socialMap = CONFIG.socialShortLabels || {};
    var normalized;
    if (menu !== 'social') { return label || textOf(element) || undefined; }
    normalized = normalizeText(label).toLowerCase();
    if (normalized.indexOf('facebook') !== -1 || normalized === 'fb') { return socialMap.facebook || 'FB'; }
    if (normalized.indexOf('instagram') !== -1 || normalized === 'ig') { return socialMap.instagram || 'IG'; }
    if (normalized.indexOf('line') !== -1) { return socialMap.line || 'Line'; }
    return label || undefined;
  }

  function getNavDevice(element) {
    if (closest(element, '#tdfn-v1-mobile-portal, [data-tdfn-v1="mobile"]', null)) { return '手機'; }
    if (closest(element, '#tdfn-v1-desktop-portal, [data-tdfn-v1="desktop"]', null)) { return '桌機'; }
    return (window.innerWidth && window.innerWidth < 992) ? '手機' : '桌機';
  }

  function getNavPositionName(element) {
    var menu = trim(element && element.getAttribute && element.getAttribute('data-menu'));
    var label = trim(element && element.getAttribute && element.getAttribute('data-label'));
    var openValue;
    var menuId;
    var labelMap = CONFIG.navFirstLevelLabels || {};
    var mapped;

    /* First-level desktop trigger: the trigger id is the actual menu id. */
    if (element && element.getAttribute && element.getAttribute('data-tdfn-d-trigger') !== null) {
      menuId = trim(element.getAttribute('data-tdfn-d-trigger'));
      mapped = labelMap[menuId];
      return mapped || textOf(element) || menuId || undefined;
    }

    /* Mobile open buttons carry the current path. Their visible text is the
     * exact label of the level that the user clicked. */
    if (element && element.getAttribute && element.getAttribute('data-tdfn-m-open') !== null) {
      openValue = trim(element.getAttribute('data-tdfn-m-open'));
      menuId = openValue ? openValue.split('::')[0] : '';
      return textOf(element) || labelMap[menuId] || menuId || undefined;
    }

    /* Desktop nested expansion buttons do not carry data-label, but their
     * visible text is the actual layer name. */
    if (element && element.getAttribute && (
      element.getAttribute('data-tdfn-d-child-open') !== null ||
      element.getAttribute('data-tdfn-d-knowledge-second') !== null ||
      element.getAttribute('data-tdfn-d-knowledge-third') !== null
    )) {
      return textOf(element) || undefined;
    }

    /* Normal navigation links already expose their real label.  Use it
     * directly instead of the old fixed 第一層/第二層/第三層 strings. */
    if (label) { return getNavAction(element) || label; }

    mapped = labelMap[menu];
    return mapped || getNavAction(element) || textOf(element) || menu || undefined;
  }

  function getNavPosition(element) {
    var name = getNavPositionName(element);
    return getNavDevice(element) + '_導行列' + (name ? '_' + name : '');
  }

  function getSearchKeyword(element) {
    var roots = ['.tdfs-v3-desktop-root', '#hsearch', '.nav-search-box', '.search-box'];
    var inputSelectors = ['input[type="search"]', 'input[type="text"]', 'input:not([type])'];
    var root;
    var input;
    var i;
    var j;
    for (i = 0; i < roots.length; i += 1) {
      root = closest(element, roots[i], null) || safeQuery(roots[i]);
      if (!root) { continue; }
      for (j = 0; j < inputSelectors.length; j += 1) {
        input = safeQuery(inputSelectors[j], root);
        if (input && trim(input.value)) { return trim(input.value); }
      }
    }
    return undefined;
  }

  function getSearchHotKeyword(element) {
    return firstNonEmpty([
      element && element.getAttribute && element.getAttribute('data-tdfs-v3-hotkey'),
      element && element.getAttribute && element.getAttribute('data-tdfs-v1-hotkey'),
      textOf(element).replace(/^#/, '')
    ]);
  }

  function getHomeProductCard(element) {
    return closest(element, '[data-tdhpt-v1-product]', safeQuery('#tdhpt-v1-root'));
  }

  function getHomeProductName(element) {
    var card = getHomeProductCard(element);
    var name = card && safeQuery('.tdhpt-v1-name', card);
    return textOf(name) || undefined;
  }

  function getHomeProductAlt(element) {
    var card = getHomeProductCard(element);
    return imageAlt(card || element);
  }

  function getActiveHomeProductTab() {
    var root = safeQuery('#tdhpt-v1-root');
    var active = root && safeQuery('[data-tdhpt-v1-tab][aria-selected="true"], [data-tdhpt-v1-tab].is-active', root);
    var desktop;
    var mobile;
    if (!active) { return undefined; }
    desktop = safeQuery('.tdhpt-v1-tab-label-desktop', active);
    mobile = safeQuery('.tdhpt-v1-tab-label-mobile', active);
    return firstNonEmpty([textOf(desktop), textOf(mobile), textOf(active)]);
  }

  function getReviewMetaAction(element) {
    var card = closest(element, '[data-tdhur-v1-review]', safeQuery('#tdhur-v1-root')) || element;
    var date = card && safeQuery('.tdhur-v1-date', card);
    var person = card && safeQuery('.tdhur-v1-person', card);
    var skin = card && safeQuery('.tdhur-v1-skin', card);
    var dateText = textOf(date);
    var personText = textOf(person);
    var skinText = textOf(skin);
    var meta = [];
    if (dateText) { meta.push(dateText); }
    if (personText) { meta.push(personText); }
    if (skinText) { meta.push(skinText); }
    return meta.length ? meta.join('_') : undefined;
  }

  function getCategoryOptionLabel(element) {
    var option = closest(element, '[data-tdsb-v1-keyword], .tdsb-v1-link-option', null) || element;
    var label = safeQuery('.tdsb-v1-option-label, .tdsb-v1-series-label', option);
    return textOf(label) || textOf(option) || undefined;
  }

  function getCategoryGroupTitle(element) {
    var group = closest(element, '[data-tdsb-v1-group]', null);
    var title = group && safeQuery('.tdsb-v1-group-title', group);
    return textOf(title) || undefined;
  }

  function getFooterSectionTitle(element) {
    var item = closest(element, '.tdff-v1-accordion-item, .tdff-v1-desktop-column, .tdff-v1-column, .tdff-v1-section, nav', safeQuery('.tdff-v1-root'));
    var title;
    if (!item) { return undefined; }
    title = safeQuery('.tdff-v1-accordion-title, .tdff-v1-desktop-heading, .tdff-v1-column-title, .tdff-v1-title, h2, h3, h4, strong', item);
    return textOf(title) || undefined;
  }

  function getProductTabLabel(element) {
    var value = textOf(element);
    var normalized = normalizeText(value);
    if (normalized.indexOf('詳細說明') !== -1) { return '詳細說明'; }
    if (normalized.indexOf('相關推薦') !== -1) { return '相關推薦'; }
    return undefined;
  }

  function getProductSidebarAction(element) {
    var value = imageAlt(element);
    var normalized = normalizeText(value).toLowerCase();
    if (normalized.indexOf('facebook') !== -1 || normalized === 'fb') { return 'FB'; }
    if (normalized.indexOf('instagram') !== -1 || normalized === 'ig') { return 'IG'; }
    return value || undefined;
  }

  function getFloatingSidebarAction(element) {
    var current = element;
    var icon;
    var value;
    var normalized;
    var level = 0;
    while (current && current !== document.body && level < 6) {
      if (safeMatches(current, '.ico-message')) { return 'Easychat'; }
      current = current.parentElement;
      level += 1;
    }
    if (safeMatches(element, 'a,button,[role="button"]') && safeQuery('.ico-message', element)) { return 'Easychat'; }
    value = strictImageAlt(element);
    if (value) { return value; }
    icon = safeQuery('img[alt]', element);
    if (icon && trim(icon.getAttribute('alt'))) { return trim(icon.getAttribute('alt')); }
    normalized = normalizeText(String(element && element.className || '')).toLowerCase();
    if (normalized.indexOf('ico-message') !== -1) { return 'Easychat'; }
    return undefined;
  }

  function getRecommendationCard(element) {
    var card = closest(element, '[data-tdppi-v1-card], .product-card, li, .slider-li, .klee-slider-li', null);
    var current;
    var level = 0;
    if (card) { return card; }
    current = element;
    while (current && current !== document.body && level < 6) {
      if (safeQuery('.product-card-title, .tdhpt-v1-name, img.klee-slider-li-img, img.image-body', current)) { return current; }
      current = current.parentElement;
      level += 1;
    }
    return null;
  }

  function getProductRecommendationName(element) {
    var card = getRecommendationCard(element);
    var title;
    var img;
    if (!card) { return undefined; }
    title = safeQuery('.tdhpt-v1-name, .product-card-title, .slider-title, .product-name, [class*="product-title"]', card);
    if (textOf(title)) { return textOf(title); }
    img = safeQuery('img[alt]', card);
    if (img && trim(img.getAttribute('alt'))) { return trim(img.getAttribute('alt')); }
    return undefined;
  }

  function getRootText(descriptor) {
    var root = safeQuery(descriptor.root);
    var target = root && safeQuery(descriptor.selector, root);
    return textOf(target) || undefined;
  }

  function resolveValue(descriptor, element, context) {
    var target;
    var source;
    if (descriptor === null || descriptor === undefined) { return undefined; }
    if (typeof descriptor !== 'object') { return descriptor; }
    source = descriptor.source;
    if (source === 'scrollPercent') { return context && context.scrollPercent; }
    if (source === 'text') { return textOf(element) || undefined; }
    if (source === 'imageAlt') { return imageAlt(element); }
    if (source === 'strictImageAlt') { return strictImageAlt(element); }
    if (source === 'attr') { return trim(element && element.getAttribute(descriptor.name)) || undefined; }
    if (source === 'childText') {
      target = element && safeQuery(descriptor.selector, element);
      return textOf(target) || undefined;
    }
    if (source === 'rootText') { return getRootText(descriptor); }
    if (source === 'navAction') { return getNavAction(element); }
    if (source === 'navPosition') { return getNavPosition(element); }
    if (source === 'searchKeyword') { return getSearchKeyword(element); }
    if (source === 'searchHotKeyword') { return getSearchHotKeyword(element); }
    if (source === 'homeProductAlt') { return getHomeProductAlt(element); }
    if (source === 'activeHomeProductTab') { return getActiveHomeProductTab(); }
    if (source === 'homeProductName') { return getHomeProductName(element); }
    if (source === 'reviewMetaAction') { return getReviewMetaAction(element); }
    if (source === 'categoryOptionLabel') { return getCategoryOptionLabel(element); }
    if (source === 'categoryGroupTitle') { return getCategoryGroupTitle(element); }
    if (source === 'footerSectionTitle') { return getFooterSectionTitle(element); }
    if (source === 'documentTitle') { return trim(document.title) || undefined; }
    if (source === 'productTabLabel') { return getProductTabLabel(element); }
    if (source === 'productSidebarAction') { return getProductSidebarAction(element); }
    if (source === 'floatingSidebarAction') { return getFloatingSidebarAction(element); }
    if (source === 'productRecommendationName') { return getProductRecommendationName(element); }
    return undefined;
  }

  function resolveParams(rule, element, context) {
    var input = rule.params || {};
    var output = {};
    var keys = ['td_imp', 'td_click', 'td_action', 'td_position', 'td_product'];
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (Object.prototype.hasOwnProperty.call(input, keys[i])) {
        output[keys[i]] = resolveValue(input[keys[i]], element, context);
      }
    }
    return output;
  }

  function ensureNativeToolboxClickable() {
    var styleId = 'td-figma-events-native-toolbox-pointer-v105';
    var style;
    var css;
    if (document.getElementById && document.getElementById(styleId)) { return; }
    css = [
      'body.tdfh-v1-desktop-header-active header.headerA .toolbox__container,',
      'body.tdfh-v1-desktop-header-active #officialHeader .toolbox__container{pointer-events:auto!important;}',
      'body.tdfh-v1-desktop-header-active header.headerA .toolbox__container a,',
      'body.tdfh-v1-desktop-header-active header.headerA .toolbox__container button,',
      'body.tdfh-v1-desktop-header-active header.headerA .toolbox__container [role="button"],',
      'body.tdfh-v1-desktop-header-active header.headerA .toolbox__container [data-tip],',
      'body.tdfh-v1-desktop-header-active #officialHeader .toolbox__container a,',
      'body.tdfh-v1-desktop-header-active #officialHeader .toolbox__container button,',
      'body.tdfh-v1-desktop-header-active #officialHeader .toolbox__container [role="button"],',
      'body.tdfh-v1-desktop-header-active #officialHeader .toolbox__container [data-tip]{pointer-events:auto!important;}',
      '.toolbox__popover,.toolbox__nails,.toolbox__popover *,.toolbox__nails *{pointer-events:auto!important;}'
    ].join('');
    style = document.createElement('style');
    if (!style) { return; }
    style.id = styleId;
    style.type = 'text/css';
    if (style.appendChild && document.createTextNode) {
      style.appendChild(document.createTextNode(css));
    } else {
      style.textContent = css;
    }
    if ((document.head || document.documentElement).appendChild) {
      (document.head || document.documentElement).appendChild(style);
    }
  }

  function isDisplayed(element) {
    var rect;
    var style;
    if (!element || !document.documentElement.contains(element)) { return false; }
    rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
    if (!rect || rect.width <= 0 || rect.height <= 0) { return false; }
    try { style = window.getComputedStyle(element); } catch (error) { style = null; }
    if (style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)) { return false; }
    return true;
  }

  function findImageForCategoryBanner(element) {
    if (!element) { return null; }
    if (String(element.tagName || '').toLowerCase() === 'img') { return element; }
    return safeQuery('img[alt]', element);
  }

  function isCategoryBannerElement(element) {
    var image = findImageForCategoryBanner(element);
    var rect;
    var alt;
    if (!image || !isDisplayed(image)) { return false; }
    rect = image.getBoundingClientRect();
    alt = trim(image.getAttribute('alt'));
    if (!alt) { return false; }
    if (rect.width < 280 || rect.height < 70) { return false; }
    if (rect.height > Math.max(700, window.innerHeight * 0.9)) { return false; }
    return true;
  }

  function getCategoryBannerReplacementState() {
    return trim(window[CATEGORY_BANNER_STATE_KEY]).toLowerCase();
  }

  function ensureCategoryBannerReplacementPending() {
    var current;
    if (!pageMatchesRule('category')) { return; }
    current = getCategoryBannerReplacementState();
    if (!current) { window[CATEGORY_BANNER_STATE_KEY] = 'pending'; }
  }

  function isCategoryBannerReplacementReady(element) {
    var current = getCategoryBannerReplacementState();
    var image;
    if (current === 'ready' || current === 'ready-original') { return true; }
    if (current !== 'ready-replacement') { return false; }
    if (element && element.getAttribute && trim(element.getAttribute(CATEGORY_BANNER_READY_ATTR)) === '1') { return true; }
    image = findImageForCategoryBanner(element);
    return !!(image && image.getAttribute && trim(image.getAttribute(CATEGORY_BANNER_READY_ATTR)) === '1');
  }

  function impressionReady(rule, element) {
    if (!rule || rule.waitFor !== 'categoryBannerReplacement') { return true; }
    return isCategoryBannerReplacementReady(element);
  }

  function setupImpressionReadySignals() {
    if (!pageMatchesRule('category')) { return; }
    ensureCategoryBannerReplacementPending();
    window.addEventListener(CATEGORY_BANNER_READY_EVENT, function () {
      scanImpressions(document.documentElement);
    }, false);
  }

  function isFloatingSidebar(element) {
    var container = closest(element, '.toolbox__container, .toolbox__popover, .toolbox__nails', null);
    if (!container && safeMatches(element, '.ico-message')) {
      container = closest(element, '.toolbox__container, .toolbox__popover, .toolbox__nails', null) || element;
    }
    if (!container) { return false; }
    if (closest(element, '.ns-tool-box, #hsearch, .nav-search-box, .search-box', null)) { return false; }
    return true;
  }

  function isAnnouncementBar(element) {
    var qeId;
    if (!element) { return false; }
    qeId = trim(element.getAttribute && element.getAttribute('data-qe-id'));
    return qeId === 'top_message' && !!textOf(element);
  }

  function isMemberBenefitTrustItem(element) {
    var item = closest(element, '[data-tdht-v1-item]', safeQuery('#tdht-v1-root')) || element;
    var id = normalizeText(item && item.getAttribute('data-tdht-v1-item')).toLowerCase();
    var alt = normalizeText(imageAlt(item)).toLowerCase();
    var text = normalizeText(textOf(item)).toLowerCase();
    return id.indexOf('member') !== -1 || alt.indexOf('會員福利') !== -1 || text.indexOf('會員福利') !== -1;
  }

  function isSearchSubmit(element) {
    var text = normalizeText(textOf(element));
    var label = normalizeText(element && element.getAttribute('aria-label'));
    var cls = String(element && element.className || '');
    if (element && element.getAttribute && (element.getAttribute('data-tdfs-v1-submit') !== null || element.getAttribute('data-tdfs-v3-submit') !== null)) { return true; }
    if (/tdfs-v3-search-button|searchkeyword|search-btn|searchbutton|search-submit/i.test(cls)) { return true; }
    if (text.indexOf('搜尋') !== -1 || label.indexOf('搜尋') !== -1) { return true; }
    return false;
  }

  function isFooterSectionLink(element) {
    if (!element) { return false; }
    if (closest(element, '.tdff-v1-social', safeQuery('.tdff-v1-root'))) { return false; }
    return !!getFooterSectionTitle(element);
  }

  function isProductDetailTab(element) {
    return !!getProductTabLabel(element);
  }

  function isShopRankingProduct(element) {
    var root = closest(element, '.salepage-product-list, .slider-product-list', safeQuery('#SalePageIndexController'));
    var rankingRoot;
    var tabs;
    var i;
    var text;
    if (!root || closest(element, '#tdppi-v1-root', null) || closest(element, '.salepage-browsing-history', null)) { return false; }
    rankingRoot = root;
    if (rankingRoot.getAttribute('data-tdpp-v1-shop-ranking-only') === 'true') { return !!getProductRecommendationName(element); }
    tabs = safeQueryAll('.panel-heading-li, .slider-nav-li', rankingRoot);
    for (i = 0; i < tabs.length; i += 1) {
      text = normalizeText(textOf(tabs[i]));
      if (text.indexOf('全站排行') !== -1 && /actived|active/.test(String(tabs[i].className || ''))) {
        return !!getProductRecommendationName(element);
      }
    }
    return false;
  }

  function predicatePasses(name, element) {
    if (!name) { return true; }
    if (name === 'announcementBar') { return isAnnouncementBar(element); }
    if (name === 'floatingSidebar') { return isFloatingSidebar(element); }
    if (name === 'memberBenefitTrustItem') { return isMemberBenefitTrustItem(element); }
    if (name === 'searchSubmit') { return isSearchSubmit(element); }
    if (name === 'footerSectionLink') { return isFooterSectionLink(element); }
    if (name === 'categoryBanner') { return isCategoryBannerElement(element); }
    if (name === 'categoryBannerLink') { return isCategoryBannerElement(element); }
    if (name === 'productDetailTab') { return isProductDetailTab(element); }
    if (name === 'shopRankingProduct') { return isShopRankingProduct(element); }
    return true;
  }

  function ruleTextPasses(rule, element) {
    var text;
    if (!rule.containsText) { return true; }
    text = normalizeText(textOf(element));
    return text.indexOf(normalizeText(rule.containsText)) !== -1;
  }

  function findRuleTarget(start, rule) {
    var target = closest(start, rule.selector, null);
    if (!target) { return null; }
    if (rule.rejectClosest && closest(start, rule.rejectClosest, null)) { return null; }
    if (!ruleTextPasses(rule, target)) { return null; }
    if (!predicatePasses(rule.predicate, target)) { return null; }
    return target;
  }

  function handleClick(event) {
    var rule;
    var target;
    var i;
    for (i = 0; i < state.clickRules.length; i += 1) {
      rule = state.clickRules[i];
      target = findRuleTarget(event.target, rule);
      if (!target) { continue; }
      pushEvent(rule.eventName, resolveParams(rule, target, {}));
    }
  }

  function impressionStateFor(element, ruleId) {
    var states = element.__tdFigmaEventsImpressions;
    if (!states) {
      states = {};
      try { element.__tdFigmaEventsImpressions = states; } catch (error) { return null; }
    }
    if (!states[ruleId]) { states[ruleId] = { inside: false }; }
    return states[ruleId];
  }

  function visibleRatio(element) {
    var rect;
    var viewportWidth;
    var viewportHeight;
    var left;
    var top;
    var right;
    var bottom;
    var visibleWidth;
    var visibleHeight;
    var area;
    if (!element || !element.getBoundingClientRect || !isDisplayed(element)) { return 0; }
    rect = element.getBoundingClientRect();
    area = rect.width * rect.height;
    if (area <= 0) { return 0; }
    viewportWidth = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 0;
    viewportHeight = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 0;
    left = Math.max(0, rect.left);
    top = Math.max(0, rect.top);
    right = Math.min(viewportWidth, rect.right);
    bottom = Math.min(viewportHeight, rect.bottom);
    visibleWidth = Math.max(0, right - left);
    visibleHeight = Math.max(0, bottom - top);
    return Math.max(0, Math.min(1, (visibleWidth * visibleHeight) / area));
  }

  function evaluateImpressionNow(element, rule) {
    var itemState;
    var inside;
    var threshold = Number(CONFIG.impressionThreshold || 0.5);
    if (!element || !rule) { return; }
    itemState = impressionStateFor(element, rule.id);
    if (!itemState) { return; }
    inside = visibleRatio(element) >= threshold;
    if (inside && !itemState.inside) {
      if (impressionReady(rule, element) && predicatePasses(rule.predicate, element)) {
        pushEvent(rule.eventName, resolveParams(rule, element, {}));
        itemState.inside = true;
      }
    } else if (!inside) {
      itemState.inside = false;
    }
  }

  function observeElementForRule(element, rule) {
    var list;
    var i;
    var entry;
    if (!state.observer || !element || element.nodeType !== 1) { return; }
    if (!ruleTextPasses(rule, element)) { return; }
    list = element.__tdFigmaEventsImpRules;
    if (!list) {
      list = [];
      try { element.__tdFigmaEventsImpRules = list; } catch (error) { return; }
    }
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === rule.id) {
        evaluateImpressionNow(element, rule);
        return;
      }
    }
    entry = { id: rule.id, rule: rule };
    list.push(entry);
    impressionStateFor(element, rule.id);
    state.observer.observe(element);
    evaluateImpressionNow(element, rule);
  }

  function scanNodeForRule(node, rule) {
    var matches;
    var i;
    if (!node || node.nodeType !== 1) { return; }
    if (safeMatches(node, rule.selector)) { observeElementForRule(node, rule); }
    matches = safeQueryAll(rule.selector, node);
    for (i = 0; i < matches.length; i += 1) { observeElementForRule(matches[i], rule); }
  }

  function scanImpressions(node) {
    var i;
    var target = node || document.documentElement;
    for (i = 0; i < state.impressionRules.length; i += 1) {
      scanNodeForRule(target, state.impressionRules[i]);
    }
  }

  function handleIntersection(entries) {
    var threshold = Number(CONFIG.impressionThreshold || 0.5);
    var entry;
    var element;
    var refs;
    var ref;
    var itemState;
    var inside;
    var i;
    var j;
    for (i = 0; i < entries.length; i += 1) {
      entry = entries[i];
      element = entry.target;
      refs = element.__tdFigmaEventsImpRules || [];
      inside = entry.isIntersecting && entry.intersectionRatio >= threshold;
      for (j = 0; j < refs.length; j += 1) {
        ref = refs[j];
        itemState = impressionStateFor(element, ref.id);
        if (!itemState) { continue; }
        if (inside && !itemState.inside) {
          if (impressionReady(ref.rule, element) && predicatePasses(ref.rule.predicate, element)) {
            pushEvent(ref.rule.eventName, resolveParams(ref.rule, element, {}));
            itemState.inside = true;
          }
        } else if (!inside) {
          itemState.inside = false;
        }
      }
    }
  }

  function setupImpressions() {
    var root;
    if (!state.impressionRules.length || !window.IntersectionObserver) { return; }
    state.observer = new window.IntersectionObserver(handleIntersection, {
      threshold: [0, Number(CONFIG.impressionThreshold || 0.5), 1]
    });
    scanImpressions(document.documentElement);
    root = document.body || document.documentElement;
    if (window.MutationObserver && root) {
      state.mutationObserver = new window.MutationObserver(function (mutations) {
        var mutation;
        var i;
        var j;
        for (i = 0; i < mutations.length; i += 1) {
          mutation = mutations[i];
          if (mutation.type === 'attributes') {
            scanImpressions(mutation.target);
            if (mutation.target && mutation.target.parentElement) {
              scanImpressions(mutation.target.parentElement);
            }
          }
          for (j = 0; j < mutation.addedNodes.length; j += 1) {
            scanImpressions(mutation.addedNodes[j]);
          }
        }
      });
      if (pageMatchesRule('category')) {
        state.mutationObserver.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['src', 'srcset', 'alt', 'href', 'class', 'style', 'data-td-category-banner-ready']
        });
      } else {
        state.mutationObserver.observe(root, { childList: true, subtree: true });
      }
    }
  }

  function firePageRules() {
    var rule;
    var i;
    for (i = 0; i < state.activeRules.length; i += 1) {
      rule = state.activeRules[i];
      if (rule.trigger === 'page') { pushEvent(rule.eventName, resolveParams(rule, null, {})); }
    }
  }

  function getScrollProgress() {
    var doc = document.documentElement;
    var body = document.body;
    var height = Math.max(
      doc ? doc.scrollHeight : 0,
      doc ? doc.offsetHeight : 0,
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      window.innerHeight || 0
    );
    var bottom = (window.pageYOffset || (doc && doc.scrollTop) || (body && body.scrollTop) || 0) + (window.innerHeight || (doc && doc.clientHeight) || 0);
    if (!height) { return 0; }
    return Math.max(0, Math.min(100, (bottom / height) * 100));
  }

  function evaluateScroll() {
    var progress = getScrollProgress();
    var rule;
    var threshold;
    var key;
    var i;
    var j;
    for (i = 0; i < state.scrollRules.length; i += 1) {
      rule = state.scrollRules[i];
      for (j = 0; j < (rule.thresholds || []).length; j += 1) {
        threshold = Number(rule.thresholds[j]);
        key = rule.id + ':' + threshold;
        if (state.scrollReached[key]) { continue; }
        if (threshold === 0 || progress >= threshold) {
          state.scrollReached[key] = true;
          pushEvent(rule.eventName, resolveParams(rule, null, { scrollPercent: threshold + '%' }));
        }
      }
    }
  }

  function setupScroll() {
    var ticking = false;
    if (!state.scrollRules.length) { return; }
    function requestEvaluate() {
      if (ticking) { return; }
      ticking = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(function () { ticking = false; evaluateScroll(); });
      } else {
        window.setTimeout(function () { ticking = false; evaluateScroll(); }, 50);
      }
    }
    window.addEventListener('scroll', requestEvaluate, false);
    window.addEventListener('resize', requestEvaluate, false);
    window.addEventListener('load', requestEvaluate, false);
    evaluateScroll();
  }

  function collectRules() {
    var rules = CONFIG.rules || [];
    var rule;
    var i;
    for (i = 0; i < rules.length; i += 1) {
      rule = rules[i];
      if (!rule || !rule.id || !rule.eventName || !ruleIsActive(rule)) { continue; }
      state.activeRules.push(rule);
      if (rule.trigger === 'click') { state.clickRules.push(rule); }
      if (rule.trigger === 'impression') { state.impressionRules.push(rule); }
      if (rule.trigger === 'scroll') { state.scrollRules.push(rule); }
    }
  }

  function init() {
    if (state.initialized) { return; }
    state.initialized = true;
    collectRules();
    ensureNativeToolboxClickable();
    firePageRules();
    setupScroll();
    if (state.clickRules.length) { document.addEventListener('click', handleClick, true); }
    setupImpressionReadySignals();
    setupImpressions();
    window.TDFigmaEvents = {
      version: VERSION,
      configVersion: CONFIG.version,
      push: pushEvent,
      rescan: function () { scanImpressions(document.documentElement); },
      activeRuleIds: state.activeRules.map ? state.activeRules.map(function (rule) { return rule.id; }) : []
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    init();
  }
}(window, document));
