// ==UserScript==
// @name         www.bioderma-naos.com.tw - 20260901 - 全站事件
// @namespace    http://tampermonkey.net/
// @version      2026-09-01
// @description  try to take over the world!
// @author       You
// @match        https://www.bioderma-naos.com.tw/*
// @icon         https://icons.duckduckgo.com/ip2/bioderma-naos.com.tw.ico
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /*
   * BIODERMA dataLayer event binding
   * - All state/config is scoped inside this IIFE.
   * - Add / edit / delete rules in CONFIG and CLICK_RULES / EXPOSURE_RULES.
   * - Any td_* field not explicitly supplied is pushed as undefined.
   */

  var U;
  var CONFIG = {
    exposureThreshold: 0.5,
    mobileMaxWidth: 767,
    allowTextFallbackForAlt: false,
    pageRules: {
      home: function(pathname) { return pathname === '/' || pathname === ''; },
      category: function(pathname) { return pathname.indexOf('/SalePageCategory/') !== -1; },
      salePage: function(pathname) { return pathname.indexOf('/SalePage/Index/') !== -1; }
    },
    home: {
      memberMainBlockIndex: 0,
      memberBenefitBlockIndex: 1,
      memberCategoryBlockIndex: 3,
      guessProductBlockIndex: 6,
      seriesProductBlockIndexes: [8, 10, 12, 14],
      seriesProductActions: [
        'Atoderm 舒益修護系列',
        'Sensibio 舒敏修護系列',
        'Hydrabio 藍繃帶保濕系列',
        'Sebium 3D水楊酸系列'
      ],
      memberBenefitsByHref: [
        { contains: '/v2/VipMember/Profile', action: '填寫會員資料送$100' },
        { contains: '/v2/LineAuth/Auth', action: '綁定Line好友送$100' },
        { contains: '/page/CRM3', action: '想會員生日禮最高$1000元' }
      ],
      memberCategoriesByHref: [
        { contains: '/SalePageCategory/391828', action: 'NO.1神級卸妝水' },
        { contains: '/SalePageCategory/391845', action: '#B3乾敏沐浴油' },
        { contains: '/SalePage/Index/10677464', action: '#超耐曬' }
      ],
      seriesBanners: [
        { contains: '/SalePageCategory/391835', action: 'Atoderm 舒益修護系列' },
        { contains: '/SalePageCategory/391832', action: 'Sensibio 舒敏修護系列' },
        { contains: '/SalePageCategory/391833', action: 'Hydrabio 藍繃帶保濕系列' },
        { contains: '/SalePageCategory/391834', action: 'Sebium 3D水楊酸系列' }
      ]
    },
    categorySidebarHeadings: [
      '商品分類', '產品分類', '產品系列', '產品類別', 'NO.1 卸妝水', '獨家活動',
      '適用年齡', '肌膚需求', '價格區間', '付款方式'
    ],
    productRecommendationLabels: {
      BrowseHistory: '瀏覽記錄',
      CategoryHot: '本分類熱銷',
      ShopHot: '全站排行'
    }
  };

  var pageType = getPageType();
  var exposureObserver = null;
  var exposureState = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var observedRuleKeys = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var youtubeLastClick = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var youtubePlayerState = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var youtubeKnown = [];
  var scanTimer = null;

  function getPageType() {
    /* data-bioderma-page-type is only for the packaged offline snapshots; production uses URL rules. */
    var forced = document.documentElement && document.documentElement.getAttribute('data-bioderma-page-type');
    if (forced === 'home' || forced === 'category' || forced === 'salePage' || forced === 'other') return forced;
    var path = window.location.pathname || '/';
    if (CONFIG.pageRules.category(path)) return 'category';
    if (CONFIG.pageRules.salePage(path)) return 'salePage';
    if (CONFIG.pageRules.home(path)) return 'home';
    return 'other';
  }

  function isPage(allowed) {
    if (!allowed || !allowed.length || allowed.indexOf('all') !== -1) return true;
    return allowed.indexOf(pageType) !== -1;
  }

  function pushEvent(eventName, fields) {
    fields = fields || {};
    window.dataLayer = window.dataLayer || [];
    // console.table({
    window.dataLayer.push({
      'event': 'cusevent',
      'event_name': eventName,
      'td_imp': Object.prototype.hasOwnProperty.call(fields, 'td_imp') ? fields.td_imp : U,
      'td_click': Object.prototype.hasOwnProperty.call(fields, 'td_click') ? fields.td_click : U,
      'td_action': Object.prototype.hasOwnProperty.call(fields, 'td_action') ? fields.td_action : U,
      'td_position': Object.prototype.hasOwnProperty.call(fields, 'td_position') ? fields.td_position : U,
      'td_product': Object.prototype.hasOwnProperty.call(fields, 'td_product') ? fields.td_product : U,
      'td_version': Object.prototype.hasOwnProperty.call(fields, 'td_version') ? fields.td_version : U
    });
  }

  function compactText(el) {
    if (!el) return U;
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text || U;
  }

  function getHref(el) {
    if (!el) return '';
    return el.getAttribute('href') || el.href || '';
  }

  function closest(el, selector) {
    if (!el || el.nodeType !== 1) return null;
    if (el.closest) return el.closest(selector);
    while (el) {
      if (matches(el, selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function matches(el, selector) {
    if (!el || el.nodeType !== 1) return false;
    var fn = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
    return fn ? fn.call(el, selector) : false;
  }

  function isInside(el, selector) {
    return !!closest(el, selector);
  }

  function isMobile() {
    /* The site serves separate desktop/mobile DOMs (not RWD), so prefer DOM signatures over viewport width. */
    if (document.querySelector('[data-qe-id="body-mobile-toolbox-container"]')) return true;
    if (document.querySelector('[data-qe-id="body-desktop-toolbox-container"]')) return false;
    if (document.querySelector('.slide-push-menu') && !document.querySelector('.headerA__nav-menu-main')) return true;
    if (document.querySelector('.headerA__nav-menu-main')) return false;
    return window.innerWidth <= CONFIG.mobileMaxWidth;
  }

  function getAlt(el) {
    if (!el) return U;
    var alt = el.getAttribute && el.getAttribute('alt');
    if (alt && alt.trim()) return alt.trim();
    var img = el.querySelector && el.querySelector('img[alt]');
    if (img) {
      alt = img.getAttribute('alt');
      if (alt && alt.trim()) return alt.trim();
    }
    if (CONFIG.allowTextFallbackForAlt) return compactText(el);
    return U;
  }

  function getProductName(el) {
    if (!el) return U;
    var holder = closest(el, '[data-product-name]') || (el.querySelector && el.querySelector('[data-product-name]'));
    if (holder) {
      var dataName = holder.getAttribute('data-product-name');
      if (dataName && dataName.trim()) return dataName.trim();
    }
    var img = matches(el, 'img') ? el : (el.querySelector && el.querySelector('img[alt]'));
    if (img) {
      var alt = img.getAttribute('alt');
      if (alt && alt.trim() && !/^(Visa|MasterCard|JCB|Apple Pay|7-11|familymart|hilife)$/i.test(alt.trim())) return alt.trim();
    }
    var titleEl = (el.querySelector && el.querySelector('.product-card-title, .product-name, [class*="product-title"], [class*="product-name"]')) || null;
    return titleEl ? compactText(titleEl) : U;
  }

  /* Home product events 5/7/9/11/13:
   * td_product MUST come from [data-qe-id="body-meta-field-text"] only.
   * Do not use image alt / generic product title as a fallback.
   * Product cards may split the clickable image/text into sibling links, so
   * walk upward while the container still belongs to the same SalePage URL.
   */
  function querySelectorDeep(root, selector) {
    if (!root) return null;
    if (root.nodeType === 1 && matches(root, selector)) return root;

    var direct = null;
    try { direct = root.querySelector ? root.querySelector(selector) : null; } catch (e) { direct = null; }
    if (direct) return direct;

    /* NineYi product modules may render card details in an open shadowRoot.
     * Search only shadow roots below the current product scope. */
    var descendants = [];
    try { descendants = root.querySelectorAll ? root.querySelectorAll('*') : []; } catch (e2) { descendants = []; }
    for (var i = 0; i < descendants.length; i++) {
      if (!descendants[i].shadowRoot) continue;
      var found = querySelectorDeep(descendants[i].shadowRoot, selector);
      if (found) return found;
    }
    if (root.nodeType === 1 && root.shadowRoot) return querySelectorDeep(root.shadowRoot, selector);
    return null;
  }

  function getHomeProductName(el) {
    if (!el) return U;
    var clickedHref = getHref(closest(el, 'a')) || '';

    function fromScope(scope) {
      var meta = querySelectorDeep(scope, '[data-qe-id="body-meta-field-text"]');
      return compactText(meta) || U;
    }

    var direct = fromScope(el);
    if (direct) return direct;

    var node = el.parentElement;
    for (var depth = 0; node && depth < 8; depth++, node = node.parentElement) {
      var links = node.querySelectorAll ? node.querySelectorAll('a[href*="/SalePage/Index/"]') : [];
      var distinct = {};
      for (var i = 0; i < links.length; i++) {
        var href = getHref(links[i]);
        if (href) distinct[href] = true;
      }
      var hrefs = Object.keys(distinct);
      if (hrefs.length > 1 && (!clickedHref || hrefs.some(function(href) { return href !== clickedHref; }))) break;

      var value = fromScope(node);
      if (value) return value;

      if (matches(node, '.layout-center > *')) break;
    }
    return U;
  }

  function getHomeCenterBlock(el) {
    var center = closest(el, '.layout-center');
    if (!center) return null;
    var node = el;
    while (node && node.parentElement !== center) node = node.parentElement;
    if (!node) return null;
    var children = Array.prototype.filter.call(center.children, function(child) { return child.nodeType === 1; });
    return { element: node, index: children.indexOf(node) };
  }

  function matchHrefMap(href, map) {
    for (var i = 0; i < map.length; i++) {
      if (href.indexOf(map[i].contains) !== -1) return map[i];
    }
    return null;
  }

  function findHeaderNavAnchor(target) {
    var a = closest(target, 'a');
    if (!a) return null;
    if (isInside(a, 'footer, #layoutFooter, .layout-footer-wrapper')) return null;
    /* Do not exclude .headerA__top as a whole: on the current desktop
     * home/category header, .headerA__nav-menu-main is nested inside it.
     * Non-navigation controls are excluded explicitly below. */
    if (matches(a, '.logo-link') || isInside(a, '.headerA__logo')) return null;
    if (matches(a, '.ns-search-btn, .searchkeyword')) return null;
    if (isInside(a, '.toolbox__container, .toolbox__nails, .toolbox__popover, .ns-tool-box')) return null;

    /* Desktop navigation: support both the current headerA DOM and legacy nav wrappers. */
    if (isInside(a, '.headerA__nav-menu-main, .layout-nav-menu.nav-main-menu, .nav-main-menu')) return a;

    /* Mobile menu content. */
    if (isInside(a, '.nav-slide-push-content.collapse-menu, .collapse-menu-ul')) return a;

    /* Mobile social buttons live outside the collapse-menu content. */
    if (isInside(a, '.nav-slide-push-bottom .social-ul') && socialLabelFromAnchor(a)) return a;

    return null;
  }

  function getFirstLayerNavText(a) {
    var node = a;
    while (node && node !== document.body) {
      if (node.tagName === 'LI' && node.parentElement) {
        var parentClass = node.parentElement.className || '';
        if ((' ' + parentClass + ' ').indexOf(' nav-menu-ul ') !== -1 || (' ' + parentClass + ' ').indexOf(' collapse-menu-ul ') !== -1) {
          var direct = null;
          for (var i = 0; i < node.children.length; i++) {
            if (node.children[i].tagName === 'A') {
              direct = node.children[i];
              break;
            }
            /* Legacy desktop product-page header wraps the first-layer anchor
             * in .custom-link-menu, while submenu choices are li.link-row. */
            if (matches(node.children[i], '.custom-link-menu')) {
              direct = node.children[i].querySelector && node.children[i].querySelector('a.nav-menu-link');
              if (direct) break;
            }
          }
          return compactText(direct) || compactText(a);
        }
      }
      node = node.parentElement;
    }
    return compactText(a);
  }

  function socialLabelFromAnchor(a) {
    var href = getHref(a).toLowerCase();
    var text = (compactText(a) || '').toLowerCase();
    if (href.indexOf('facebook.com') !== -1 || text === 'facebook' || text === 'fb') return 'FB';
    if (href.indexOf('instagram.com') !== -1 || text === 'instagram' || text === 'ig') return 'IG';
    if (href.indexOf('line.me') !== -1 || href.indexOf('/lineauth/') !== -1 || text === 'line') return 'Line';
    return U;
  }

  function findVisibleSearchInput(button) {
    var selectors = ['#ns-search-input', '.ns-search-input', 'input[type="search"]', 'input[name*="search" i]'];
    var root = closest(button, 'header, .layout-header, .search-container, [class*="search"]') || document;
    var candidates = [];
    for (var i = 0; i < selectors.length; i++) {
      try { candidates = candidates.concat(Array.prototype.slice.call(root.querySelectorAll(selectors[i]))); } catch (e) {}
    }
    if (!candidates.length && root !== document) {
      for (var j = 0; j < selectors.length; j++) {
        try { candidates = candidates.concat(Array.prototype.slice.call(document.querySelectorAll(selectors[j]))); } catch (e2) {}
      }
    }
    for (var k = 0; k < candidates.length; k++) {
      if (isElementVisible(candidates[k]) && (candidates[k].value || '').trim()) return candidates[k];
    }
    for (var m = 0; m < candidates.length; m++) {
      if ((candidates[m].value || '').trim()) return candidates[m];
    }
    return null;
  }

  function isElementVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var rect = el.getBoundingClientRect();
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    return rect.width > 0 && rect.height > 0 && (!style || (style.display !== 'none' && style.visibility !== 'hidden'));
  }

  function findFooterGroupTitle(a) {
    var known = ['關於我們', '關於品牌', '購物說明', '會員服務', '客服服務', '客服資訊'];
    var node = a.parentElement;
    for (var depth = 0; node && depth < 7; depth++, node = node.parentElement) {
      for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        if (child.contains && child.contains(a)) continue;
        var text = compactText(child);
        if (text && known.indexOf(text) !== -1) return text;
      }
      var heading = node.querySelector && node.querySelector('h1,h2,h3,h4,h5,[class*="title"],[class*="caption"]');
      var headingText = compactText(heading);
      if (headingText && known.indexOf(headingText) !== -1) return headingText;
    }
    return U;
  }

  function findCategorySidebarPosition(el) {
    /* Category-tree clicks should prefer the outer category block title over nested labels like 產品系列. */
    if (matches(el, 'a') && getHref(el).indexOf('/SalePageCategory/') !== -1) {
      var categoryNode = el.parentElement;
      for (var cd = 0; categoryNode && cd < 10; cd++, categoryNode = categoryNode.parentElement) {
        if (isInside(categoryNode, 'header, .layout-header, .slide-push-menu, footer')) return U;
        var categoryAll = categoryNode.querySelectorAll ? categoryNode.querySelectorAll('*') : [];
        for (var ci = 0; ci < categoryAll.length && ci < 160; ci++) {
          var categoryText = compactText(categoryAll[ci]);
          if (categoryText === '商品分類' || categoryText === '產品分類') return categoryText;
        }
      }
    }

    var node = el.parentElement;
    for (var depth = 0; node && depth < 9; depth++, node = node.parentElement) {
      if (isInside(node, 'header, .layout-header, .slide-push-menu, footer')) return U;
      var all = node.querySelectorAll ? node.querySelectorAll('*') : [];
      for (var i = 0; i < all.length && i < 80; i++) {
        if (all[i].contains && all[i].contains(el)) continue;
        var text = compactText(all[i]);
        if (text && CONFIG.categorySidebarHeadings.indexOf(text) !== -1) return text;
      }
      var own = compactText(node.firstElementChild);
      if (own && CONFIG.categorySidebarHeadings.indexOf(own) !== -1) return own;
    }
    return U;
  }

  function isCategorySidebarChoice(el) {
    if (!el || isInside(el, 'header, .layout-header, .slide-push-menu, footer')) return false;
    if (matches(el, 'label') && el.querySelector('input[type="checkbox"], input[type="radio"]')) return true;
    if (matches(el, 'a') && getHref(el).indexOf('/SalePageCategory/') !== -1) {
      return !!findCategorySidebarPosition(el);
    }
    if (matches(el, '[id*="menu-item"] button')) {
      return !!findCategorySidebarPosition(el);
    }
    return false;
  }

  function getRecommendationPosition(a) {
    var href = getHref(a);
    if (href.indexOf('garefersrc=BrowseHistory') !== -1) return CONFIG.productRecommendationLabels.BrowseHistory;
    if (href.indexOf('garefersrc=HotsaleInCategory') !== -1 || href.indexOf('garefersrc=HotsaleOverall') !== -1) {
      var section = closest(a, '.salepage-recommend, .salepage-recommendation, .recommend-product-list, .slider-product-list, .panel, section') || document;
      var active = section.querySelector && section.querySelector('.active .panel-title, .actived .panel-title, .active .recommend-caption, .actived .recommend-caption, .panel-heading-li.active, .panel-heading-li.actived, .slider-nav-li.active, .slider-nav-li.actived');
      var t = compactText(active);
      if (t && t.indexOf('全站排行') !== -1) return CONFIG.productRecommendationLabels.ShopHot;
      if (t && t.indexOf('本分類熱銷') !== -1) return CONFIG.productRecommendationLabels.CategoryHot;
      var selected = document.querySelector('.panel-heading-li.active .panel-title, .panel-heading-li.actived .panel-title, .slider-nav-li.active .recommend-caption, .slider-nav-li.actived .recommend-caption');
      t = compactText(selected);
      if (t && t.indexOf('全站排行') !== -1) return CONFIG.productRecommendationLabels.ShopHot;
      return CONFIG.productRecommendationLabels.CategoryHot;
    }
    return U;
  }

  function buildHomeProductFields(a) {
    var block = getHomeCenterBlock(a);
    var fields = { td_click: 1, td_product: getHomeProductName(a), td_version: 0 };
    if (block && block.index === CONFIG.home.guessProductBlockIndex) {
      fields.td_action = '猜你會喜歡';
    } else if (block) {
      var seriesIndex = CONFIG.home.seriesProductBlockIndexes.indexOf(block.index);
      if (seriesIndex !== -1) fields.td_action = CONFIG.home.seriesProductActions[seriesIndex];
    }
    return fields;
  }

  /* --------------------------- CLICK RULES ---------------------------
   * Manual maintenance: add/edit/remove one object. `match` returns the
   * element that represents the event; `fields` returns the td_* payload.
   */
  var CLICK_RULES = [
    {
      id: '1-1', pages: ['all'], eventName: 'td_nav',
      match: function(target) { return closest(target, '.headerA__top > a[data-qe-id="top_message"], .headerA__top a[data-qe-id="top_message"]'); },
      fields: function(el) { return { td_action: compactText(el), td_position: '跑馬燈', td_version: 0 }; }
    },
    {
      id: '1-2', pages: ['all'], eventName: 'td_nav',
      match: function(target) { return closest(target, 'a.logo-link'); },
      fields: function() { return { td_position: 'logo', td_version: 0 }; }
    },
    {
      id: '1-3', pages: ['all'], eventName: 'td_nav_search',
      match: function(target) {
        var btn = closest(target, '.ns-search-btn, a.searchkeyword, [data-qe-id="header-search-icon"], a.ns-search-link');
        if (!btn) return null;
        return findVisibleSearchInput(btn) ? btn : target;
      },
      fields: function(el) {
        var input = findVisibleSearchInput(el);
        return { td_action: input ? (input.value || '').trim() : el.innerText.trim(), td_position: '導行列', td_version: 0 };
      }
    },
    {
      id: '1-4', pages: ['all'], eventName: 'td_nav',
      match: function(target) {
        var btn = closest(target, '.ns-search-btn, a.searchkeyword, [data-qe-id="header-search-icon"], a.ns-search-link');
        if (btn) return null;
      
        var mobileSocial = closest(target, '.nav-slide-push-bottom .social-ul a');
        if (mobileSocial && socialLabelFromAnchor(mobileSocial)) return mobileSocial;

        /* Current desktop home/category header uses anchors. Legacy desktop
         * sale-page dropdown items are clickable li.link-row elements. */
        var legacyDesktopRow = closest(target, '.layout-nav-menu.nav-main-menu li.link-row, .nav-main-menu li.link-row');
        if (legacyDesktopRow) return legacyDesktopRow;

        var desktopNav = closest(target, '.headerA__nav-menu-main a, .layout-nav-menu.nav-main-menu a, .nav-main-menu a');
        if (desktopNav) return findHeaderNavAnchor(desktopNav);

        return findHeaderNavAnchor(target);
      },
      fields: function(a) {
        var social = socialLabelFromAnchor(a);
        if (social) return { td_action: social, td_position: '導行列_第一層', td_version: 0 };
        var first = isMobile() ? (getComputedStyle(a.closest('li')).backgroundColor.match(/rgb\(240, 240, 240\)/) ? '第二層' : '第一層') : ( a.querySelector('.ico-chevron-down') ? '第一層' : a.closest('div:has(.ico-close)') ? '第三層' : '第二層');
        return {
          td_action: compactText(a),
          td_position: (isMobile() ? '手機_導行列_' : '桌機_導行列_') + (first || ''),
          td_version: 0
        };
      }
    },
    {
      id: '1-5', pages: ['all'], eventName: 'td_nav',
      match: function(target) {
        return closest(target,
          '.toolbox__container a.toolbox__button, ' +
          '.toolbox__nails a.toolbox__button, ' +
          '.toolbox__popover a.toolbox__button'
        );
      },
      fields: function(a) { return { td_action: getAlt(a), td_position: '懸浮側邊Bar', td_version: 0 }; }
    },
    {
      id: '2-click', pages: ['home'], eventName: 'td_home_bn',
      match: function(target) { return closest(target, '.headerA__bottom a.image-banner'); },
      fields: function(a) { return { td_click: 1, td_action: getAlt(a), td_position: 'BN', td_version: 0 }; }
    },
    {
      id: '3-1-click', pages: ['home'], eventName: 'td_home_section',
      match: function(target) {
        var a = closest(target, '.layout-center a');
        var block = a && getHomeCenterBlock(a);
        return (a && block && block.index === CONFIG.home.memberMainBlockIndex && getHref(a).indexOf('/page/CRM3') !== -1) ? a : null;
      },
      fields: function() { return { td_click: 1, td_action: '更多會員福利', td_position: '會員福利', td_version: 0 }; }
    },
    {
      id: '3-2', pages: ['home'], eventName: 'td_home_section',
      match: function(target) {
        var a = closest(target, '.layout-center a');
        var block = a && getHomeCenterBlock(a);
        return (a && block && block.index === CONFIG.home.memberBenefitBlockIndex && matchHrefMap(getHref(a), CONFIG.home.memberBenefitsByHref)) ? a : null;
      },
      fields: function(a) { return { td_click: 1, td_action: matchHrefMap(getHref(a), CONFIG.home.memberBenefitsByHref).action, td_position: '會員福利', td_version: 0 }; }
    },
    {
      id: '3-3', pages: ['home'], eventName: 'td_home_section',
      match: function(target) {
        var a = closest(target, '.layout-center a');
        var block = a && getHomeCenterBlock(a);
        return (a && block && block.index === CONFIG.home.memberCategoryBlockIndex && matchHrefMap(getHref(a), CONFIG.home.memberCategoriesByHref)) ? a : null;
      },
      fields: function(a) { return { td_click: 1, td_action: matchHrefMap(getHref(a), CONFIG.home.memberCategoriesByHref).action, td_position: '會員福利', td_version: 0 }; }
    },
    {
      id: '6/8/10/12-click', pages: ['home'], eventName: 'td_home_bn',
      match: function(target) {
        var a = closest(target, '.layout-center a');
        return (a && matchHrefMap(getHref(a), CONFIG.home.seriesBanners)) ? a : null;
      },
      fields: function(a) { return { td_click: 1, td_action: matchHrefMap(getHref(a), CONFIG.home.seriesBanners).action, td_version: 0 }; }
    },
    {
      id: '5/7/9/11/13', pages: ['home'], eventName: 'td_home_product',
      match: function(target) {
        var a = closest(target, '.layout-center a[href*="/SalePage/Index/"]');
        if (!a) return null;
        var block = getHomeCenterBlock(a);
        if (!block) return null;
        if (block.index === CONFIG.home.memberCategoryBlockIndex) return null;
        if (block.index === CONFIG.home.guessProductBlockIndex || CONFIG.home.seriesProductBlockIndexes.indexOf(block.index) !== -1) return a;
        return null;
      },
      fields: function(a) { return buildHomeProductFields(a); }
    },
    {
      id: '14-1', pages: ['all'], eventName: 'td_footer',
      match: function(target) {
        var a = closest(target, 'footer a, #layoutFooter a, .layout-footer-wrapper a');
        return (a && socialLabelFromAnchor(a)) ? a : null;
      },
      fields: function(a) { return { td_action: socialLabelFromAnchor(a), td_version: 0 }; }
    },
    {
      id: '14-2', pages: ['all'], eventName: 'td_footer',
      match: function(target) {
        var a = closest(target, 'footer a, #layoutFooter a, .layout-footer-wrapper a');
        if (!a || socialLabelFromAnchor(a)) return null;
        return compactText(a) ? a : null;
      },
      fields: function(a) {
        return {
          td_action: compactText(a),
          td_position: isMobile() ? U : a.closest('.footer-menu-content').parentNode.querySelector('div').innerText.trim(),
          td_version: 0
        };
      }
    },
    {
      id: '15', pages: ['category'], eventName: 'td_category_sidebar',
      match: function(target) {
        var label = closest(target, 'label');
        if (label && isCategorySidebarChoice(label)) return label;
        var a = closest(target, 'a');
        if (a && isCategorySidebarChoice(a)) return a;
        
        var button = closest(target, '#modal-root button, #modal-root span')
        if(button) return button;
        
        return null;
      },
      fields: function(el) { return { td_action: compactText(el), td_position: findCategorySidebarPosition(el), td_version: 0 }; }
    },
    {
      id: '16-category-click', pages: ['category'], eventName: 'td_category_bn',
      match: function(target) {
        var a = closest(target, 'a');
        if (!a || isInside(a, 'header, .layout-header, footer')) return null;
        return (getHref(a).indexOf('/site/campaign') !== -1 && a.querySelector('img[alt]')) ? a : null;
      },
      fields: function(a) { return { td_click: 1, td_action: getAlt(a), td_position: document.title || U, td_version: 0 }; }
    },
    {
      id: '16-sale-tab', pages: ['salePage'], eventName: 'td_salepage_tab',
      match: function(target) {
        var a = closest(target, 'a.nav-tab-link');
        if (!a) return null;
        var t = compactText(a);
        return (t === '詳細說明' || t === '商品規格' || t === '相關推薦') ? a : null;
      },
      fields: function(a) { return { td_action: compactText(a), td_version: 0 }; }
    },
    {
      id: '16-1', pages: ['salePage'], eventName: 'td_salepage_sidebar',
      match: function(target) { return closest(target, '.ns-tool-box .tool-box-link, [id*="chat-button"]'); },
      fields: function(a) { return { td_action: ( ( a.id.match(/chat-button/) ? 'Easychat' : a.href.match(/facebook/) ? 'FB' : a.href.match(/instagram/) ? 'IG' : undefined ) || getAlt(a) ) }; }
    },
    {
      id: '16-2', pages: ['salePage'], eventName: 'td_salepage_sidebar',
      match: function(target) { return closest(target, 'ns-tool-box .browsing-image-link img'); },
      fields: function(img) { return { td_product: getAlt(img) }; }
    },
    {
      id: '17/18', pages: ['salePage'], eventName: 'td_salepage_product',
      match: function(target) {
        var a = closest(target, 'a[href*="garefersrc=BrowseHistory"]:not(ns-tool-box a[href*="garefersrc=BrowseHistory"]), a[href*="garefersrc=HotsaleInCategory"], a[href*="garefersrc=HotsaleOverall"]');
        return a;
      },
      fields: function(a) { return { td_position: getRecommendationPosition(a), td_product: getProductName(a), td_version: 0 }; }
    }
  ];

  /* ------------------------- EXPOSURE RULES ------------------------- */
  var EXPOSURE_RULES = [
    {
      id: '2-imp', pages: ['home'], eventName: 'td_home_bn',
      selector: '.headerA__bottom a.image-banner img[alt]',
      filter: function(img) { return !!closest(img, '.headerA__bottom'); },
      fields: function(img) { return { td_imp: 1, td_action: getAlt(img), td_position: 'BN', td_version: 0 }; }
    },
    {
      id: '3-1-imp', pages: ['home'], eventName: 'td_home_section',
      selector: '.layout-center a img',
      filter: function(el) {
        var a = closest(el, 'a') || el;
        var block = getHomeCenterBlock(a);
        return !!(block && block.index === CONFIG.home.memberMainBlockIndex && getHref(a).indexOf('/page/CRM3') !== -1);
      },
      fields: function() { return { td_imp: 1, td_position: '會員福利', td_version: 0 }; }
    },
    {
      id: '6/8/10/12-imp', pages: ['home'], eventName: 'td_home_bn',
      selector: '.layout-center a img',
      filter: function(el) {
        var a = closest(el, 'a') || el;
        return !!matchHrefMap(getHref(a), CONFIG.home.seriesBanners);
      },
      fields: function(el) {
        var a = closest(el, 'a') || el;
        return { td_imp: 1, td_action: matchHrefMap(getHref(a), CONFIG.home.seriesBanners).action, td_version: 0 };
      }
    },
    {
      id: '16-category-imp', pages: ['category'], eventName: 'td_category_bn',
      selector: 'a[href*="/site/campaign"] img[alt]',
      filter: function(img) { return !isInside(img, 'header, .layout-header, footer'); },
      fields: function(img) { return { td_imp: 1, td_action: getAlt(img), td_position: document.title || U, td_version: 0 }; }
    }
  ];

  function onDocumentClick(evt) {
    var target = evt.target && evt.target.nodeType === 1 ? evt.target : (evt.target && evt.target.parentElement);
    if (!target) return;

    /* composedPath keeps delegated click binding working when a clickable
     * element is rendered inside an open Shadow DOM. Each rule still fires
     * at most once for the same native click. */
    var candidates = [target];
    if (evt.composedPath) {
      try {
        candidates = evt.composedPath().filter(function(node) { return node && node.nodeType === 1; });
        if (!candidates.length) candidates = [target];
      } catch (e0) { candidates = [target]; }
    }

    for (var i = 0; i < CLICK_RULES.length; i++) {
      var rule = CLICK_RULES[i];
      if (!isPage(rule.pages)) continue;
      var matched = null;
      for (var c = 0; c < candidates.length && !matched; c++) {
        try { matched = rule.match(candidates[c]); } catch (e) { matched = null; }
      }
      if (matched) {
        var fields = {};
        try { fields = rule.fields ? rule.fields(matched, evt) : {}; } catch (e2) { fields = {}; }
        pushEvent(rule.eventName, fields);
      }
    }
  }

  function initExposureObserver() {
    if ('IntersectionObserver' in window) {
      exposureObserver = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var meta = entry.target.__biodermaExposureRules || [];
          for (var j = 0; j < meta.length; j++) {
            var key = meta[j].id;
            var stateKey = '__biodermaExposureState_' + key;
            var wasVisible = exposureState ? !!((exposureState.get(entry.target) || {})[key]) : !!entry.target[stateKey];
            var isVisible50 = entry.isIntersecting && entry.intersectionRatio >= CONFIG.exposureThreshold;
            if (isVisible50 && !wasVisible) {
              var fields;
              try { fields = meta[j].fields(entry.target); } catch (e) { fields = {}; }
              pushEvent(meta[j].eventName, fields);
              setExposureState(entry.target, key, true);
            } else if (!isVisible50 && wasVisible) {
              setExposureState(entry.target, key, false);
            }
          }
        }
      }, { threshold: [0, CONFIG.exposureThreshold, 1] });
    }
    scanExposureRules();
  }

  function setExposureState(el, key, value) {
    if (exposureState) {
      var obj = exposureState.get(el) || {};
      obj[key] = value;
      exposureState.set(el, obj);
    } else {
      el['__biodermaExposureState_' + key] = value;
    }
  }

  function alreadyObserved(el, ruleId) {
    if (observedRuleKeys) {
      var obj = observedRuleKeys.get(el) || {};
      if (obj[ruleId]) return true;
      obj[ruleId] = true;
      observedRuleKeys.set(el, obj);
      return false;
    }
    var key = '__biodermaObserved_' + ruleId;
    if (el[key]) return true;
    el[key] = true;
    return false;
  }

  function scanExposureRules() {
    for (var i = 0; i < EXPOSURE_RULES.length; i++) {
      var rule = EXPOSURE_RULES[i];
      if (!isPage(rule.pages)) continue;
      var elements = [];
      try { elements = document.querySelectorAll(rule.selector); } catch (e) { elements = []; }
      for (var j = 0; j < elements.length; j++) {
        var el = elements[j];
        if (rule.filter && !rule.filter(el)) continue;
        if (alreadyObserved(el, rule.id)) continue;
        el.__biodermaExposureRules = el.__biodermaExposureRules || [];
        el.__biodermaExposureRules.push(rule);
        if (exposureObserver) {
          exposureObserver.observe(el);
        } else {
          bindFallbackExposure(el, rule);
        }
      }
    }
    if (pageType === 'home') scanYoutube();
  }

  function bindFallbackExposure(el, rule) {
    var active = false;
    function check() {
      var rect = el.getBoundingClientRect();
      var visibleW = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      var visibleH = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      var ratio = rect.width && rect.height ? (visibleW * visibleH) / (rect.width * rect.height) : 0;
      if (ratio >= CONFIG.exposureThreshold && !active) {
        active = true;
        pushEvent(rule.eventName, rule.fields(el));
      } else if (ratio < CONFIG.exposureThreshold) {
        active = false;
      }
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    setTimeout(check, 0);
  }

  function initMutationScan() {
    if (!('MutationObserver' in window)) return;
    var observer = new MutationObserver(function() {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(function() { scanExposureRules(); }, 80);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function initPageLoadAndScroll() {
    pushEvent('td_version_imp', { td_version: 0 });
    var sent = { 0: true, 25: false, 50: false, 75: false, 100: false };
    pushEvent('td_scroll', { td_action: '0%', td_version: 0 });
    function checkScroll() {
      var doc = document.documentElement;
      var body = document.body;
      var top = window.pageYOffset || doc.scrollTop || (body && body.scrollTop) || 0;
      var viewport = window.innerHeight || doc.clientHeight || 0;
      var height = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0, doc.offsetHeight, body ? body.offsetHeight : 0);
      var max = Math.max(0, height - viewport);
      var pct = max === 0 ? 100 : (top / max) * 100;
      var milestones = [25, 50, 75, 100];
      for (var i = 0; i < milestones.length; i++) {
        var m = milestones[i];
        if (!sent[m] && pct >= m) {
          sent[m] = true;
          pushEvent('td_scroll', { td_action: m + '%', td_version: 0 });
        }
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    setTimeout(checkScroll, 0);
  }

  /* YouTube is the only iframe exception requested. No other iframe is inspected/bound. */
  function isYoutubeFrame(frame) {
    var src = (frame.getAttribute('src') || '').toLowerCase();
    return src.indexOf('youtube.com/embed') !== -1 || src.indexOf('youtube-nocookie.com/embed') !== -1 || !!closest(frame, '.react-player');
  }

  function youtubeTitle(frame) {
    var t = (frame.getAttribute('title') || '').trim();
    return t || U;
  }

  function pushYoutube(frame, kind) {
    var title = youtubeTitle(frame);
    var fields = { td_action: title ? ('影片標題：' + title) : U, td_version: 0 };
    if (kind === 'imp') fields.td_imp = 1;
    if (kind === 'click') fields.td_click = 1;
    pushEvent('td_home_video', fields);
  }

  function youtubeClick(frame) {
    var now = Date.now();
    var last = youtubeLastClick ? (youtubeLastClick.get(frame) || 0) : (frame.__biodermaYoutubeLastClick || 0);
    if (now - last < 650) return;
    if (youtubeLastClick) youtubeLastClick.set(frame, now); else frame.__biodermaYoutubeLastClick = now;
    pushYoutube(frame, 'click');
  }

  function scanYoutube() {
    var frames = document.querySelectorAll('iframe');
    for (var i = 0; i < frames.length; i++) {
      var frame = frames[i];
      if (!isYoutubeFrame(frame) || frame.__biodermaYoutubeBound) continue;
      frame.__biodermaYoutubeBound = true;
      youtubeKnown.push(frame);

      var impRule = {
        id: '4-youtube-' + i,
        pages: ['home'], eventName: 'td_home_video',
        fields: function(el) {
          return { td_imp: 1, td_action: youtubeTitle(el) ? ('影片標題：' + youtubeTitle(el)) : U, td_version: 0 };
        }
      };
      frame.__biodermaExposureRules = frame.__biodermaExposureRules || [];
      frame.__biodermaExposureRules.push(impRule);
      if (exposureObserver) exposureObserver.observe(frame); else bindFallbackExposure(frame, impRule);

      frame.addEventListener('load', function(evt) {
        try {
          evt.currentTarget.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'bioderma-dl' }), '*');
        } catch (e) {}
      });
      try { frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'bioderma-dl' }), '*'); } catch (e2) {}
    }
  }

  function initYoutubeClickSupport() {
    window.addEventListener('message', function(evt) {
      var frame = null;
      for (var i = 0; i < youtubeKnown.length; i++) {
        if (youtubeKnown[i].contentWindow === evt.source) { frame = youtubeKnown[i]; break; }
      }
      if (!frame) return;
      var data = evt.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { return; }
      }
      if (!data) return;
      if (data.event === 'onStateChange' || data.event === 'infoDelivery') {
        var state = data.info;
        if (data.event === 'infoDelivery' && data.info && typeof data.info.playerState !== 'undefined') state = data.info.playerState;
        if (state === 1 || state === 2) {
          var lastState = youtubePlayerState ? youtubePlayerState.get(frame) : frame.__biodermaYoutubePlayerState;
          if (state !== lastState) {
            if (youtubePlayerState) youtubePlayerState.set(frame, state); else frame.__biodermaYoutubePlayerState = state;
            if (frame.__biodermaYoutubeEverFocused) youtubeClick(frame);
          }
        }
      }
    });

    window.addEventListener('blur', function() {
      setTimeout(function() {
        var active = document.activeElement;
        if (active && active.tagName === 'IFRAME' && isYoutubeFrame(active)) {
          active.__biodermaYoutubeEverFocused = true;
          youtubeClick(active);
        }
      }, 0);
    });
  }

  function init() {
    document.addEventListener('click', onDocumentClick, true);
    initPageLoadAndScroll();
    initExposureObserver();
    initYoutubeClickSupport();
    initMutationScan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


