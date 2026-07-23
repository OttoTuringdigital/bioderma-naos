/* TD Figma global JS Bundle v1.1.3 */

/* ===== TD_Figma_All_Pages_Core_Style_GTM_v1.3.5.html ===== */
(function(){window.TDFigmaStyleReady=window.TDFigmaStyleReady||{};window.TDFigmaStyleReady.allPages="1.3.5";}());

/* ===== TD_Figma_All_Pages_ProductCard_Style_GTM_v1.0.1.html ===== */
(function () {
  window.TDFigmaStyleReady = window.TDFigmaStyleReady || {};
  window.TDFigmaStyleReady.allPagesProductCard = '1.0.1';
}());

/* ===== TD_Figma_All_Pages_Core_Utility_GTM_v1.0.0.html ===== */
(function () {
  'use strict';

  if (window.TDFigmaCore && window.TDFigmaCore.version) {
    if (window.TDFigmaCore.jobs) {
      window.TDFigmaCore.jobs.flush();
    }
    return;
  }

  var VERSION = '1.0.0';
  var startedJobs = {};

  function createElement(tagName, className) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    return element;
  }

  function query(selector, context) {
    try {
      return (context || document).querySelector(selector);
    } catch (error) {
      return null;
    }
  }

  function closest(element, selector, boundary) {
    var current = element;
    while (current && current.nodeType === 1) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      if (boundary && current === boundary) {
        break;
      }
      current = current.parentElement;
    }
    return null;
  }

  function insertAfter(referenceNode, newNode) {
    var parent = referenceNode && referenceNode.parentNode;
    if (!parent) {
      return false;
    }
    if (referenceNode.nextSibling) {
      parent.insertBefore(newNode, referenceNode.nextSibling);
    } else {
      parent.appendChild(newNode);
    }
    return true;
  }

  function sanitizeUrl(url) {
    var value = String(url || '').replace(/^\s+|\s+$/g, '');
    if (!value || /^(javascript|data|vbscript):/i.test(value)) {
      return '';
    }
    return value;
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function pushEvent(eventName, values, versionField, version) {
    var payload = values || {};
    window.dataLayer = window.dataLayer || [];
    payload.event = eventName;
    if (versionField) {
      payload[versionField] = version || VERSION;
    }
    window.dataLayer.push(payload);
  }

  function registerJob(job) {
    var queue;
    var i;
    if (!job || !job.key || typeof job.start !== 'function') {
      return;
    }
    queue = window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
    for (i = 0; i < queue.length; i += 1) {
      if (queue[i] && queue[i].key === job.key) {
        flushJobs();
        return;
      }
    }
    queue.push(job);
    flushJobs();
  }

  function flushJobs() {
    var queue = window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
    var job;
    var i;
    for (i = 0; i < queue.length; i += 1) {
      job = queue[i];
      if (!job || startedJobs[job.key]) {
        continue;
      }
      try {
        if (!job.ready || job.ready()) {
          startedJobs[job.key] = true;
          job.start(window.TDFigmaCore);
        }
      } catch (error) {
        startedJobs[job.key] = false;
        window.setTimeout(flushJobs, 50);
      }
    }
  }

  window.TDFigmaCore = {
    version: VERSION,
    dom: {
      createElement: createElement,
      query: query,
      closest: closest,
      insertAfter: insertAfter
    },
    url: {
      sanitize: sanitizeUrl
    },
    text: {
      normalize: normalizeText,
      escapeHtml: escapeHtml
    },
    events: {
      push: pushEvent
    },
    jobs: {
      register: registerJob,
      flush: flushJobs
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'td_figma_core_ready',
    td_figma_core_version: VERSION
  });

  flushJobs();
}());

/* ===== TD_Figma_All_Pages_Navigation_GTM_v3.1.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-navigation-v310',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.allPages && window.TDFigmaData.allPages.navigation);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.allPages.navigation;
function mapSimpleLinks(items) {
var output = [];
var i;
for (i = 0; i < (items || []).length; i += 1) {
output.push({
label: items[i].label || '',
href: items[i].linkUrl || ''
});
}
return output;
}
function mapCards(items) {
var output = [];
var i;
for (i = 0; i < (items || []).length; i += 1) {
output.push({
image: items[i].imageUrl || '',
title: items[i].title || '',
sub: items[i].subtitle || '',
href: items[i].linkUrl || ''
});
}
return output;
}
function mapCardLinks(items) {
var cards = mapCards(items);
var output = [];
var i;
for (i = 0; i < cards.length; i += 1) {
if (!cards[i].title) {
continue;
}
output.push({
label: cards[i].title,
href: cards[i].href
});
}
return output;
}
var MENU_ITEMS = SOURCE_DATA.menuItems || [];
function findMenuItem(menuId) {
var i;
for (i = 0; i < MENU_ITEMS.length; i += 1) {
if ((MENU_ITEMS[i].id || '') === menuId) {
return MENU_ITEMS[i];
}
}
return {};
}
function getMenuContent(menuId) {
var item = findMenuItem(menuId);
return item && item.content ? item.content : {};
}
var FEATURED_CONTENT = getMenuContent('featured');
var NEEDS_CONTENT = getMenuContent('needs');
var TYPES_CONTENT = getMenuContent('types');
var SERIES_CONTENT = getMenuContent('series');
var MEMBER_CONTENT = getMenuContent('member');
var CLASSROOM_CONTENT = getMenuContent('classroom');
var ABOUT_CONTENT = getMenuContent('about');
var FEATURED_PRIMARY_CARDS =
FEATURED_CONTENT.primaryCards || [];
var FEATURED_SECONDARY_CARDS =
FEATURED_CONTENT.secondaryCards || [];
var CONFIG = {
desktopMaxWidth:
(SOURCE_DATA.desktopLayout && SOURCE_DATA.desktopLayout.maximumWidth) ||
'929px',
logo: SOURCE_DATA.logo || ''
};
var DATA = {
menus: MENU_ITEMS.map(function (item) {
return {
id: item.id || '',
label: item.label || '',
href: item.linkUrl || '',
kind: item.panelType || '',
width: item.panelWidthPixels
};
}),
featured: {
primaryCard: mapCards(
FEATURED_PRIMARY_CARDS.slice(0, 1)
)[0] || {
image: '',
title: '',
sub: '',
href: ''
},
primaryLinks: mapCardLinks(
FEATURED_PRIMARY_CARDS.slice(1)
),
secondaryCards: mapCards(
FEATURED_SECONDARY_CARDS.slice(0, 4)
),
secondaryLinks: mapCardLinks(
FEATURED_SECONDARY_CARDS.slice(4)
)
},
needs: mapSimpleLinks(
NEEDS_CONTENT.links || []
),
types: mapSimpleLinks(
TYPES_CONTENT.links || []
),
member: mapSimpleLinks(
MEMBER_CONTENT.links || []
),
about: mapSimpleLinks(
ABOUT_CONTENT.links || []
),
series: (
SERIES_CONTENT.seriesItems || []
).map(function (item) {
return {
zh: item.displayName || '',
en: item.englishName || '',
desc: item.description || '',
color: item.accentColor || '',
href: item.linkUrl || ''
};
}),
medical: mapCards(
SERIES_CONTENT.recommendedProducts || []
),
articles: mapCards(
CLASSROOM_CONTENT.articleCards || []
),
social: (SOURCE_DATA.socialLinks || []).map(function (item) {
return {
id: item.id || '',
label: item.label || '',
href: item.linkUrl || ''
};
})
};
var closest = Core.dom.closest;
var escapeHtml = Core.text.escapeHtml;
var VERSION = '3.1.0';
var LOAD_ATTR = 'data-tdfn-v1-loaded';
if (document.documentElement.getAttribute(LOAD_ATTR) === VERSION) {
return;
}
document.documentElement.setAttribute(LOAD_ATTR, VERSION);
var STYLE_ID = 'tdfn-v1-style-v135';
var PORTAL_ID = 'tdfn-v1-desktop-portal';
var MOBILE_PORTAL_ID = 'tdfn-v1-mobile-portal';
var DESKTOP_SELECTOR = '.nav-menu-ul';
var DESKTOP_HOST_SELECTORS = ['.headerA__top', '.layout-nav-menu.nav-main-menu'];
var DESKTOP_HOST_QUERY = DESKTOP_HOST_SELECTORS.join(',');
var MOBILE_SELECTORS = ['.nav-slide-push-container', '.aside-section-container'];
var MOBILE_SELECTOR_QUERY = MOBILE_SELECTORS.join(',');
var BREAKPOINT = 992;
var HEADER_TOP_EXTRA_SPACE = 20;
var HEADER_BOTTOM_EXTRA_SPACE = 0;
var HEADER_TOTAL_EXTRA_SPACE =
HEADER_TOP_EXTRA_SPACE + HEADER_BOTTOM_EXTRA_SPACE;
var HEADER_SPACING_ATTRIBUTE = 'data-tdfn-v1-header-spacing';
var HEADER_BASE_ATTRIBUTE = 'data-tdfn-v1-header-base-ready';
var HEADER_TOP_BASE_ATTRIBUTE =
'data-tdfn-v1-header-top-base-ready';
var HEADER_BOTTOM_ATTRIBUTE = 'data-tdfn-v1-header-bottom-reserve';
var state = {
desktopRoot: null,
desktopSource: null,
desktopHost: null,
mobileRoot: null,
mobileSource: null,
mobilePortal: null,
mobileDrawer: null,
mobileDrawerObserver: null,
mobileSyncFrame: null,
mobileSyncUntil: 0,
mountTimer: null,
portal: null,
activeDesktopId: '',
desktopCloseTimer: null,
portalCloseTimer: null,
mobilePanelId: '',
mobileCarouselSuppressUntil: 0,
mobileCarouselDrag: {
active: false,
axis: '',
carousel: null,
track: null,
startX: 0,
startY: 0,
deltaX: 0,
startIndex: 0,
step: 0,
maxIndex: 0,
moved: false
},
observer: null
};
function injectStyle() {}
function getItemLabel(item) {
if (typeof item === 'string') {
return item;
}
return item && (item.label || item.title || item.zh) ? (item.label || item.title || item.zh) : '';
}
function getItemHref(item) {
return item && typeof item === 'object' && item.href ? item.href : '#';
}
function isPlaceholderHref(href) {
return !href || href === '#';
}
function chevronDown() {
return '<svg class="tdfn-v1-d-chevron" viewBox="0 0 10 7" aria-hidden="true"><path d="M1 1.25 5 5.25 9 1.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function chevronRight() {
return '<svg class="tdfn-v1-m-right" viewBox="0 0 7 12" aria-hidden="true"><path d="M1 1 6 6 1 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function backArrow() {
return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.75 4.5 7.25 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function smallArrow(direction) {
var path = direction === 'prev' ? 'M6.5 3 3.5 6 6.5 9' : 'M3.5 3 6.5 6 3.5 9';
return '<svg viewBox="0 0 10 12" width="10" height="12" aria-hidden="true"><path d="'+path+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function socialIcons() {
var icons = {
facebook: '<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="currentColor"/><path d="M17.2 9.1h2.4V5.3c-.42-.06-1.85-.18-3.55-.18-3.5 0-5.9 2.14-5.9 6.08v3.4H6.2v4.25h3.95V29h4.84V18.85h4.04l.64-4.25h-4.68v-2.98c0-1.23.33-2.52 2.21-2.52Z" fill="#fff" transform="scale(.72) translate(5.8 3.6)"/></svg>',
instagram: '<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="currentColor"/><rect x="7.2" y="7.2" width="15.6" height="15.6" rx="4.2" fill="none" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="3.7" fill="none" stroke="#fff" stroke-width="2"/><circle cx="20.5" cy="9.8" r="1.2" fill="#fff"/></svg>',
line: '<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="currentColor"/><path d="M23.4 14.3c0-4-3.8-7.2-8.4-7.2s-8.4 3.2-8.4 7.2c0 3.55 3 6.52 7.05 7.08.27.06.65.18.74.42.08.22.05.56.03.78l-.12.74c-.04.22-.17.86.73.47.9-.38 4.86-2.86 6.63-4.9 1.23-1.35 1.74-2.73 1.74-4.6Z" fill="#fff"/><text x="15" y="16.7" text-anchor="middle" font-size="5.2" font-family="Arial,sans-serif" font-weight="700" fill="currentColor">LINE</text></svg>'
};
var html = [];
var i;
var item;
for (i = 0; i < DATA.social.length; i += 1) {
item = DATA.social[i];
html.push(
'<a class="tdfn-v1-social-link" href="' + escapeHtml(getItemHref(item)) + '" ' +
'data-tdfn-link data-menu="social" data-label="' + escapeHtml(item.label) + '" ' +
'aria-label="' + escapeHtml(item.label) + '">' +
(icons[item.id] || '') +
'</a>'
);
}
return html.join('');
}
function track(eventName, data) {
Core.events.push(eventName, data, 'td_nav_version', VERSION);
}
function copyAttributes(source, target) {
var i;
var attr;
for (i = 0; i < source.attributes.length; i += 1) {
attr = source.attributes[i];
if (attr.name !== 'data-tdfn-v1' && attr.name !== 'style') {
target.setAttribute(attr.name, attr.value);
}
}
}
function createReplacement(source, mode) {
var tagName = source && source.tagName ? source.tagName.toLowerCase() : 'div';
var target = document.createElement(tagName);
copyAttributes(source, target);
target.setAttribute('data-tdfn-v1', mode);
target.setAttribute('data-tdfn-version', VERSION);
return target;
}
function renderDesktopRoot() {
var html = [];
var i;
var menu;
for (i = 0; i < DATA.menus.length; i += 1) {
menu = DATA.menus[i];
html.push(
'<li class="tdfn-v1-d-item" data-tdfn-d-item="'+escapeHtml(menu.id)+'">' +
'<button class="tdfn-v1-d-trigger" type="button" data-tdfn-d-trigger="'+escapeHtml(menu.id)+'" aria-expanded="false" aria-haspopup="true">' +
'<span>'+escapeHtml(menu.label)+'</span>'+chevronDown() +
'</button>' +
'</li>'
);
}
return html.join('');
}
function renderCompact(items, menuId) {
var html = ['<div class="tdfn-v1-panel tdfn-v1-compact">'];
var i;
var item;
var label;
for (i = 0; i < items.length; i += 1) {
item = items[i];
label = getItemLabel(item);
html.push(
'<a class="tdfn-v1-compact-link" href="' + escapeHtml(getItemHref(item)) + '" ' +
'data-tdfn-link data-menu="' + escapeHtml(menuId) + '" data-label="' + escapeHtml(label) + '">' +
escapeHtml(label) +
'</a>'
);
}
html.push('</div>');
return html.join('');
}
function renderFeaturedTextLinks(links, mobile, groupName) {
var html = [];
var i;
var item;
var wrapperClass = mobile ?
'tdfn-v1-m-featured-links' :
'tdfn-v1-featured-text-links';
var listClass = mobile ?
'tdfn-v1-m-featured-link-list' :
'tdfn-v1-featured-link-list';
var linkClass = mobile ?
'tdfn-v1-m-featured-text-link' :
'tdfn-v1-featured-text-link';
if (!links || !links.length) {
return '';
}
html.push(
'<div class="' + wrapperClass + '" data-tdfn-featured-links="' +
escapeHtml(groupName || '') + '"><div class="' + listClass + '">'
);
for (i = 0; i < links.length; i += 1) {
item = links[i];
if (!item.label) {
continue;
}
html.push(
'<a class="' + linkClass + '" href="' +
escapeHtml(getItemHref(item)) +
'" data-tdfn-link data-menu="featured" data-label="' +
escapeHtml(item.label) + '">' +
escapeHtml(item.label) +
'</a>'
);
}
html.push('</div></div>');
return html.join('');
}
function renderFeaturedCard(item, extraClass) {
if (!item) {
return '';
}
return (
'<a class="tdfn-v1-card-link ' + (extraClass || '') + '" href="' +
escapeHtml(getItemHref(item)) +
'" data-tdfn-link data-menu="featured" data-label="' +
escapeHtml(item.title || '') + '">' +
(
item.image ?
'<img class="tdfn-v1-card-image" src="' +
escapeHtml(item.image) +
'" alt="' + escapeHtml(item.title || '') + '">' :
''
) +
(
item.title ?
'<h4 class="tdfn-v1-card-title">' +
escapeHtml(item.title) +
'</h4>' :
''
) +
(
item.sub ?
'<p class="tdfn-v1-card-sub">' +
escapeHtml(item.sub) +
'</p>' :
''
) +
'</a>'
);
}
function renderFeaturedDesktop() {
var primaryCard = DATA.featured.primaryCard;
var primaryLinks = DATA.featured.primaryLinks || [];
var secondaryCards = DATA.featured.secondaryCards || [];
var secondaryLinks = DATA.featured.secondaryLinks || [];
var primaryBodyClass = 'tdfn-v1-featured-primary-body';
var secondaryBodyClass = 'tdfn-v1-featured-secondary-body';
var html = [
'<div class="tdfn-v1-panel tdfn-v1-mega">',
'<div class="tdfn-v1-mega-inner tdfn-v1-featured-grid' +
(secondaryLinks.length ? ' has-secondary-links' : '') +
'">'
];
var i;
if (primaryLinks.length) {
primaryBodyClass += ' has-text-links';
}
if (secondaryLinks.length) {
secondaryBodyClass += ' has-text-links';
}
html.push(
'<section class="tdfn-v1-featured-primary">',
'<h3 class="tdfn-v1-section-title">全館活動</h3>',
'<div class="' + primaryBodyClass + '">',
renderFeaturedCard(
primaryCard,
'tdfn-v1-featured-primary-card'
),
renderFeaturedTextLinks(
primaryLinks,
false,
'primary'
),
'</div></section>',
'<section class="tdfn-v1-featured-secondary">',
'<h3 class="tdfn-v1-section-title">超值組合</h3>',
'<div class="' + secondaryBodyClass + '">',
'<div class="tdfn-v1-featured-combos">'
);
for (i = 0; i < secondaryCards.length; i += 1) {
html.push(
renderFeaturedCard(
secondaryCards[i],
'tdfn-v1-featured-secondary-card'
)
);
}
html.push(
'</div>',
renderFeaturedTextLinks(
secondaryLinks,
false,
'secondary'
),
'</div></section>',
'</div></div>'
);
return html.join('');
}
function renderSeriesList(mobile) {
var html = [];
var i;
var item;
var cls = mobile ? 'tdfn-v1-m-series-link' : 'tdfn-v1-series-link';
var nameCls = mobile ? 'tdfn-v1-m-series-name' : 'tdfn-v1-series-name';
var descCls = mobile ? 'tdfn-v1-m-series-desc' : 'tdfn-v1-series-desc';
for (i = 0; i < DATA.series.length; i += 1) {
item = DATA.series[i];
html.push('<a class="'+cls+'" href="'+escapeHtml(getItemHref(item))+'" data-tdfn-link data-menu="series" data-label="'+escapeHtml(item.zh+' '+item.en)+'"><span class="'+nameCls+'">'+escapeHtml(item.zh)+' <span class="tdfn-v1-series-en" style="color:'+escapeHtml(item.color)+'">'+escapeHtml(item.en)+'</span></span><span class="'+descCls+'">'+escapeHtml(item.desc)+'</span></a>');
}
return html.join('');
}
function renderMedicalCards(mobile) {
var html = [];
var i;
var item;
var imageCls = mobile ? 'tdfn-v1-m-carousel-image' : 'tdfn-v1-product-image';
var wrapperCls = mobile ? 'tdfn-v1-m-carousel-card' : 'tdfn-v1-card-link';
var titleCls = mobile ? 'tdfn-v1-m-product-title' : 'tdfn-v1-card-title';
var subCls = mobile ? 'tdfn-v1-m-product-sub' : 'tdfn-v1-card-sub';
for (i = 0; i < DATA.medical.length; i += 1) {
item = DATA.medical[i];
html.push('<a class="'+wrapperCls+'" href="'+escapeHtml(getItemHref(item))+'" data-tdfn-link data-menu="series" data-label="'+escapeHtml(item.title)+'"><img class="'+imageCls+'" src="'+escapeHtml(item.image)+'" alt="'+escapeHtml(item.title)+'"><h4 class="'+titleCls+'">'+escapeHtml(item.title)+'</h4>'+(item.sub ? '<p class="'+subCls+'">'+escapeHtml(item.sub)+'</p>' : '')+'</a>');
}
return html.join('');
}
function renderSeriesDesktop() {
return '<div class="tdfn-v1-panel tdfn-v1-mega"><div class="tdfn-v1-mega-inner tdfn-v1-series-grid"><section><div class="tdfn-v1-series-list">'+renderSeriesList(false)+'</div></section><div class="tdfn-v1-series-divider" aria-hidden="true"></div><section><h3 class="tdfn-v1-section-title">醫療專售</h3><div class="tdfn-v1-products-grid">'+renderMedicalCards(false)+'</div></section></div></div>';
}
function renderClassroomDesktop() {
var html = ['<div class="tdfn-v1-panel tdfn-v1-mega"><div class="tdfn-v1-mega-inner tdfn-v1-classroom-grid">'];
var i;
var item;
for (i = 0; i < DATA.articles.length; i += 1) {
item = DATA.articles[i];
html.push('<a class="tdfn-v1-card-link" href="'+escapeHtml(getItemHref(item))+'" data-tdfn-link data-menu="classroom" data-label="'+escapeHtml(item.title)+'"><img class="tdfn-v1-article-image" src="'+escapeHtml(item.image)+'" alt="'+escapeHtml(item.title)+'"><h4 class="tdfn-v1-card-title">'+escapeHtml(item.title)+'</h4><p class="tdfn-v1-card-sub">'+escapeHtml(item.sub)+'</p></a>');
}
html.push('</div></div>');
return html.join('');
}
function getMenu(id) {
var i;
for (i = 0; i < DATA.menus.length; i += 1) {
if (DATA.menus[i].id === id) {
return DATA.menus[i];
}
}
return null;
}
function renderDesktopPanel(id) {
if (id === 'featured') {
return renderFeaturedDesktop();
}
if (id === 'series') {
return renderSeriesDesktop();
}
if (id === 'classroom') {
return renderClassroomDesktop();
}
if (id === 'needs') {
return renderCompact(DATA.needs, id);
}
if (id === 'types') {
return renderCompact(DATA.types, id);
}
if (id === 'member') {
return renderCompact(DATA.member, id);
}
return renderCompact(DATA.about, id);
}
function ensurePortal() {
if (state.portal && document.documentElement.contains(state.portal)) {
return state.portal;
}
state.portal = document.getElementById(PORTAL_ID);
if (!state.portal) {
state.portal = document.createElement('div');
state.portal.id = PORTAL_ID;
state.portal.setAttribute('aria-hidden', 'true');
document.body.appendChild(state.portal);
}
return state.portal;
}
function clearDesktopTimer() {
if (state.desktopCloseTimer) {
window.clearTimeout(state.desktopCloseTimer);
state.desktopCloseTimer = null;
}
}
function updateDesktopActive(id) {
var items;
var i;
var itemId;
var trigger;
if (!state.desktopRoot) {
return;
}
items = state.desktopRoot.querySelectorAll('[data-tdfn-d-item]');
for (i = 0; i < items.length; i += 1) {
itemId = items[i].getAttribute('data-tdfn-d-item');
trigger = items[i].querySelector('[data-tdfn-d-trigger]');
if (itemId === id) {
items[i].classList.add('is-active');
if (trigger) {
trigger.setAttribute('aria-expanded', 'true');
}
} else {
items[i].classList.remove('is-active');
if (trigger) {
trigger.setAttribute('aria-expanded', 'false');
}
}
}
}
function positionDesktopPortal(menuId, trigger) {
var portal = ensurePortal();
var menu = getMenu(menuId);
var rect;
var width;
var left;
var maxLeft;
if (!menu || !trigger) {
return;
}
rect = trigger.getBoundingClientRect();
portal.style.top = Math.round(rect.bottom) + 'px';
portal.style.maxHeight = Math.max(180, window.innerHeight - Math.round(rect.bottom) - 8) + 'px';
if (menu.kind === 'mega') {
portal.classList.remove('is-compact');
portal.classList.add('is-mega');
portal.style.left = '0px';
portal.style.width = '100vw';
} else {
width = menu.width || 155;
left = rect.left + (rect.width / 2) - (width / 2);
maxLeft = Math.max(8, window.innerWidth - width - 8);
left = Math.max(8, Math.min(left, maxLeft));
portal.classList.remove('is-mega');
portal.classList.add('is-compact');
portal.style.left = Math.round(left) + 'px';
portal.style.width = width + 'px';
}
}
function openDesktop(menuId, trigger) {
var portal;
var menu;
if (window.innerWidth < BREAKPOINT) {
return;
}
menu = getMenu(menuId);
if (!menu) {
return;
}
clearDesktopTimer();
portal = ensurePortal();
portal.innerHTML = renderDesktopPanel(menuId);
portal.setAttribute('data-active-menu', menuId);
portal.setAttribute('aria-hidden', 'false');
positionDesktopPortal(menuId, trigger);
updateDesktopActive(menuId);
state.activeDesktopId = menuId;
window.requestAnimationFrame(function () {
portal.classList.add('is-open');
});
track('td_nav_menu_open', { td_nav_device: 'desktop', td_nav_menu: menuId });
}
function closeDesktop(immediate) {
var portal = state.portal;
clearDesktopTimer();
state.activeDesktopId = '';
updateDesktopActive('');
if (!portal) {
return;
}
portal.classList.remove('is-open');
portal.setAttribute('aria-hidden', 'true');
if (immediate) {
portal.innerHTML = '';
return;
}
window.setTimeout(function () {
if (!state.activeDesktopId && portal) {
portal.innerHTML = '';
}
}, 240);
}
function scheduleDesktopClose() {
clearDesktopTimer();
state.desktopCloseTimer = window.setTimeout(function () {
closeDesktop(false);
}, 120);
}
function bindDesktop(root) {
root.addEventListener('mouseover', function (event) {
var trigger = closest(event.target, '[data-tdfn-d-trigger]', root);
if (trigger) {
if (event.relatedTarget && trigger.contains(event.relatedTarget)) {
return;
}
openDesktop(trigger.getAttribute('data-tdfn-d-trigger'), trigger);
}
});
root.addEventListener('focusin', function (event) {
var trigger = closest(event.target, '[data-tdfn-d-trigger]', root);
if (trigger) {
openDesktop(trigger.getAttribute('data-tdfn-d-trigger'), trigger);
}
});
root.addEventListener('mouseleave', scheduleDesktopClose);
root.addEventListener('mouseenter', clearDesktopTimer);
root.addEventListener('click', function (event) {
var trigger = closest(event.target, '[data-tdfn-d-trigger]', root);
var id;
if (!trigger) {
return;
}
event.preventDefault();
id = trigger.getAttribute('data-tdfn-d-trigger');
if (state.activeDesktopId === id && state.portal && state.portal.classList.contains('is-open')) {
closeDesktop(false);
} else {
openDesktop(id, trigger);
}
});
}
function renderMobileMain() {
var html = ['<div class="tdfn-v1-m-panel is-main" data-tdfn-m-main><div class="tdfn-v1-m-main-list">'];
var i;
var menu;
for (i = 0; i < DATA.menus.length; i += 1) {
menu = DATA.menus[i];
html.push('<button class="tdfn-v1-m-main-link" type="button" data-tdfn-m-open="'+escapeHtml(menu.id)+'"><span class="tdfn-v1-m-main-label">'+escapeHtml(menu.label)+'</span>'+chevronRight()+'</button>');
}
html.push('</div><div class="tdfn-v1-socials">'+socialIcons()+'</div></div>');
return html.join('');
}
function renderMobileHeading(title) {
return '<div class="tdfn-v1-m-heading"><button class="tdfn-v1-m-sub-close" type="button" data-tdfn-m-close aria-label="返回主選單">'+backArrow()+'</button><h2 class="tdfn-v1-m-title">'+escapeHtml(title)+'</h2></div>';
}
function renderMobileSimple(id, title, items) {
var html = ['<div class="tdfn-v1-m-content">' + renderMobileHeading(title) + '<div class="tdfn-v1-m-sublist">'];
var i;
var item;
var label;
for (i = 0; i < items.length; i += 1) {
item = items[i];
label = getItemLabel(item);
html.push(
'<a class="tdfn-v1-m-sub-link" href="' + escapeHtml(getItemHref(item)) + '" ' +
'data-tdfn-link data-menu="' + escapeHtml(id) + '" data-label="' + escapeHtml(label) + '">' +
escapeHtml(label) +
'</a>'
);
}
html.push('</div></div>');
return html.join('');
}
function renderMobileFeatured() {
var primaryCard = DATA.featured.primaryCard;
var primaryLinks = DATA.featured.primaryLinks || [];
var secondaryCards = DATA.featured.secondaryCards || [];
var secondaryLinks = DATA.featured.secondaryLinks || [];
var html = [
'<div class="tdfn-v1-m-content">',
renderMobileHeading('全館活動')
];
var i;
var item;
if (primaryCard && primaryCard.title) {
html.push(
'<a class="tdfn-v1-m-feature-card" href="' +
escapeHtml(getItemHref(primaryCard)) +
'" data-tdfn-link data-menu="featured" data-label="' +
escapeHtml(primaryCard.title) + '">',
(
primaryCard.image ?
'<img class="tdfn-v1-m-feature-image" src="' +
escapeHtml(primaryCard.image) +
'" alt="' + escapeHtml(primaryCard.title) + '">' :
''
),
'<h3 class="tdfn-v1-m-feature-title">' +
escapeHtml(primaryCard.title) +
'</h3>',
(
primaryCard.sub ?
'<p class="tdfn-v1-m-feature-sub">' +
escapeHtml(primaryCard.sub) +
'</p>' :
''
),
'</a>'
);
}
html.push(
renderFeaturedTextLinks(
primaryLinks,
true,
'primary'
),
'<section class="tdfn-v1-m-block">',
'<h3 class="tdfn-v1-m-section-title">超值組合</h3>'
);
if (secondaryCards.length) {
html.push(
'<div class="tdfn-v1-m-carousel" data-tdfn-carousel="featured">',
'<button class="tdfn-v1-m-carousel-button is-prev" type="button" data-tdfn-carousel-prev aria-label="上一個">' +
smallArrow('prev') +
'</button>',
'<div class="tdfn-v1-m-carousel-track" data-tdfn-carousel-track>'
);
for (i = 0; i < secondaryCards.length; i += 1) {
item = secondaryCards[i];
html.push(
'<a class="tdfn-v1-m-carousel-card" href="' +
escapeHtml(getItemHref(item)) +
'" data-tdfn-link data-menu="featured" data-label="' +
escapeHtml(item.title) + '">' +
(
item.image ?
'<img class="tdfn-v1-m-carousel-image" src="' +
escapeHtml(item.image) +
'" alt="' + escapeHtml(item.title) + '">' :
''
) +
'<h4 class="tdfn-v1-m-product-title">' +
escapeHtml(item.title) +
'</h4>' +
(
item.sub ?
'<p class="tdfn-v1-m-product-sub">' +
escapeHtml(item.sub) +
'</p>' :
''
) +
'</a>'
);
}
html.push(
'</div>',
'<button class="tdfn-v1-m-carousel-button is-next" type="button" data-tdfn-carousel-next aria-label="下一個">' +
smallArrow('next') +
'</button>',
'</div>'
);
}
html.push(
renderFeaturedTextLinks(
secondaryLinks,
true,
'secondary'
),
'</section></div>'
);
return html.join('');
}
function renderMobileSeries() {
return '<div class="tdfn-v1-m-content">'+renderMobileHeading('系列找產品')+'<div>'+renderSeriesList(true)+'</div><div class="tdfn-v1-m-divider"></div><section><h3 class="tdfn-v1-m-section-title">醫療專售</h3><div class="tdfn-v1-m-carousel" data-tdfn-carousel="medical"><button class="tdfn-v1-m-carousel-button is-prev" type="button" data-tdfn-carousel-prev aria-label="上一個">'+smallArrow('prev')+'</button><div class="tdfn-v1-m-carousel-track" data-tdfn-carousel-track>'+renderMedicalCards(true)+'</div><button class="tdfn-v1-m-carousel-button is-next" type="button" data-tdfn-carousel-next aria-label="下一個">'+smallArrow('next')+'</button></div></section></div>';
}
function renderMobileClassroom() {
var html = ['<div class="tdfn-v1-m-content">'+renderMobileHeading('貝膚小教室')+'<div class="tdfn-v1-m-articles">'];
var i;
var item;
for (i = 0; i < DATA.articles.length; i += 1) {
item = DATA.articles[i];
html.push('<a class="tdfn-v1-m-article" href="'+escapeHtml(getItemHref(item))+'" data-tdfn-link data-menu="classroom" data-label="'+escapeHtml(item.title)+'"><img class="tdfn-v1-m-article-image" src="'+escapeHtml(item.image)+'" alt="'+escapeHtml(item.title)+'"><div><h3 class="tdfn-v1-m-article-title">'+escapeHtml(item.title)+'</h3><p class="tdfn-v1-m-article-sub">'+escapeHtml(item.sub)+'</p></div></a>');
}
html.push('</div></div>');
return html.join('');
}
function renderMobilePanel(id) {
if (id === 'featured') {
return renderMobileFeatured();
}
if (id === 'needs') {
return renderMobileSimple(id, '依肌膚需求', DATA.needs);
}
if (id === 'types') {
return renderMobileSimple(id, '產品類型', DATA.types);
}
if (id === 'series') {
return renderMobileSeries();
}
if (id === 'member') {
return renderMobileSimple(id, '會員福利', DATA.member);
}
if (id === 'classroom') {
return renderMobileClassroom();
}
return renderMobileSimple(id, '關於品牌', DATA.about);
}
function getCarouselPoint(event) {
var source = event;
if (event.touches && event.touches.length) {
source = event.touches[0];
} else if (event.changedTouches && event.changedTouches.length) {
source = event.changedTouches[0];
}
return {
x: source.clientX || 0,
y: source.clientY || 0
};
}
function getCarouselMetrics(carousel) {
var track = carousel ? carousel.querySelector('[data-tdfn-carousel-track]') : null;
var cards = track ? track.children : [];
var style;
var gap;
var step;
if (!track || !cards.length) {
return null;
}
style = window.getComputedStyle(track);
gap = parseFloat(style.columnGap || style.gap || '15') || 15;
step = cards[0].getBoundingClientRect().width + gap;
return {
track: track,
cards: cards,
step: step,
maxIndex: Math.max(0, cards.length - 1)
};
}
function resetMobileCarouselDrag() {
var drag = state.mobileCarouselDrag;
if (drag.carousel) {
drag.carousel.classList.remove('is-dragging');
}
if (drag.track) {
drag.track.style.cursor = '';
drag.track.style.transition = '';
}
drag.active = false;
drag.axis = '';
drag.carousel = null;
drag.track = null;
drag.startX = 0;
drag.startY = 0;
drag.deltaX = 0;
drag.startIndex = 0;
drag.step = 0;
drag.maxIndex = 0;
drag.moved = false;
}
function initCarousel(carousel) {
var track;
var images;
var i;
if (!carousel || carousel.getAttribute('data-tdfn-carousel-ready') === '1') {
return;
}
carousel.setAttribute('data-tdfn-carousel-ready', '1');
carousel.setAttribute('data-index', '0');
carousel.style.touchAction = 'pan-y';
carousel.style.webkitUserSelect = 'none';
carousel.style.userSelect = 'none';
track = carousel.querySelector('[data-tdfn-carousel-track]');
if (track) {
track.style.cursor = 'grab';
}
images = carousel.querySelectorAll('img');
for (i = 0; i < images.length; i += 1) {
images[i].setAttribute('draggable', 'false');
}
updateCarousel(carousel);
}
function updateCarousel(carousel) {
var metrics = getCarouselMetrics(carousel);
var track;
var prev;
var next;
var index;
if (!metrics) {
return;
}
track = metrics.track;
prev = carousel.querySelector('[data-tdfn-carousel-prev]');
next = carousel.querySelector('[data-tdfn-carousel-next]');
index = parseInt(carousel.getAttribute('data-index'), 10) || 0;
index = Math.max(0, Math.min(index, metrics.maxIndex));
if (
!state.mobileCarouselDrag.active ||
state.mobileCarouselDrag.carousel !== carousel
) {
track.style.transition = '';
}
track.style.transform = 'translateX(' + (-index * metrics.step) + 'px)';
carousel.setAttribute('data-index', String(index));
if (prev) {
prev.disabled = index <= 0;
}
if (next) {
next.disabled = index >= metrics.maxIndex;
}
}
function moveCarousel(button, direction) {
var carousel = closest(button, '[data-tdfn-carousel]', state.mobileRoot);
var index;
if (!carousel) {
return;
}
resetMobileCarouselDrag();
index = parseInt(carousel.getAttribute('data-index'), 10) || 0;
carousel.setAttribute('data-index', String(index + direction));
updateCarousel(carousel);
}
function startMobileCarouselDrag(event) {
var root = state.mobileRoot;
var carousel;
var metrics;
var point;
var drag = state.mobileCarouselDrag;
if (
!root ||
window.innerWidth >= BREAKPOINT ||
(event.type === 'mousedown' && event.button !== 0)
) {
return;
}
if (
closest(event.target, '[data-tdfn-carousel-prev]', root) ||
closest(event.target, '[data-tdfn-carousel-next]', root)
) {
return;
}
carousel = closest(event.target, '[data-tdfn-carousel]', root);
if (!carousel) {
return;
}
metrics = getCarouselMetrics(carousel);
if (!metrics || metrics.maxIndex <= 0) {
return;
}
if (drag.active) {
resetMobileCarouselDrag();
}
point = getCarouselPoint(event);
drag.active = true;
drag.axis = '';
drag.carousel = carousel;
drag.track = metrics.track;
drag.startX = point.x;
drag.startY = point.y;
drag.deltaX = 0;
drag.startIndex = parseInt(carousel.getAttribute('data-index'), 10) || 0;
drag.startIndex = Math.max(0, Math.min(drag.startIndex, metrics.maxIndex));
drag.step = metrics.step;
drag.maxIndex = metrics.maxIndex;
drag.moved = false;
carousel.classList.add('is-dragging');
metrics.track.style.transition = 'none';
metrics.track.style.cursor = 'grabbing';
}
function moveMobileCarouselDrag(event) {
var drag = state.mobileCarouselDrag;
var point;
var deltaX;
var deltaY;
var displayDelta;
var base;
if (!drag.active || !drag.carousel || !drag.track) {
return;
}
point = getCarouselPoint(event);
deltaX = point.x - drag.startX;
deltaY = point.y - drag.startY;
if (!drag.axis) {
if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 6) {
return;
}
if (Math.abs(deltaY) > Math.abs(deltaX)) {
resetMobileCarouselDrag();
return;
}
drag.axis = 'x';
}
if (drag.axis !== 'x') {
return;
}
if (event.cancelable) {
event.preventDefault();
}
displayDelta = deltaX;
if (
(drag.startIndex <= 0 && displayDelta > 0) ||
(drag.startIndex >= drag.maxIndex && displayDelta < 0)
) {
displayDelta *= 0.35;
}
drag.deltaX = deltaX;
drag.moved = Math.abs(deltaX) > 8;
base = -drag.startIndex * drag.step;
drag.track.style.transform = 'translateX(' + (base + displayDelta) + 'px)';
}
function endMobileCarouselDrag() {
var drag = state.mobileCarouselDrag;
var carousel;
var startIndex;
var targetIndex;
var deltaX;
var threshold;
var direction = '';
var moved;
if (!drag.active || !drag.carousel) {
return;
}
carousel = drag.carousel;
startIndex = drag.startIndex;
targetIndex = startIndex;
deltaX = drag.deltaX;
threshold = Math.max(28, drag.step * 0.14);
moved = drag.axis === 'x' && drag.moved;
if (moved && deltaX <= -threshold && startIndex < drag.maxIndex) {
targetIndex = startIndex + 1;
direction = 'next';
} else if (moved && deltaX >= threshold && startIndex > 0) {
targetIndex = startIndex - 1;
direction = 'prev';
}
if (moved) {
state.mobileCarouselSuppressUntil = new Date().getTime() + 250;
}
resetMobileCarouselDrag();
carousel.setAttribute('data-index', String(targetIndex));
updateCarousel(carousel);
if (direction) {
track('td_nav_carousel_drag', {
td_nav_device: 'mobile',
td_nav_carousel: carousel.getAttribute('data-tdfn-carousel') || '',
td_nav_direction: direction,
td_nav_index: targetIndex
});
}
}
function openMobilePanel(id) {
var root = state.mobileRoot;
var stage;
var main;
var old;
var panel;
var carousels;
var i;
if (!root) {
return;
}
stage = root.querySelector('.tdfn-v1-m-stage');
main = root.querySelector('[data-tdfn-m-main]');
old = root.querySelector('[data-tdfn-m-subpanel]');
if (!stage || !main) {
return;
}
if (old) {
old.parentNode.removeChild(old);
}
panel = document.createElement('div');
panel.className = 'tdfn-v1-m-panel';
panel.setAttribute('data-tdfn-m-subpanel', id);
panel.innerHTML = renderMobilePanel(id);
stage.appendChild(panel);
panel.offsetWidth;
main.classList.add('is-behind');
panel.classList.add('is-active');
panel.scrollTop = 0;
state.mobilePanelId = id;
carousels = panel.querySelectorAll('[data-tdfn-carousel]');
for (i = 0; i < carousels.length; i += 1) {
initCarousel(carousels[i]);
}
track('td_nav_menu_open', { td_nav_device: 'mobile', td_nav_menu: id });
}
function closeMobilePanel() {
var root = state.mobileRoot;
var main;
var panel;
resetMobileCarouselDrag();
if (!root || !state.mobilePanelId) {
return false;
}
main = root.querySelector('[data-tdfn-m-main]');
panel = root.querySelector('[data-tdfn-m-subpanel]');
state.mobilePanelId = '';
if (main) {
main.classList.remove('is-behind');
}
if (panel) {
panel.classList.remove('is-active');
panel.classList.add('is-leaving');
window.setTimeout(function () {
if (panel.parentNode) {
panel.parentNode.removeChild(panel);
}
}, 320);
}
return true;
}
function bindMobile(root) {
root.addEventListener('mousedown', startMobileCarouselDrag, false);
root.addEventListener('touchstart', startMobileCarouselDrag, false);
root.addEventListener('touchmove', moveMobileCarouselDrag, { passive: false });
root.addEventListener('touchend', endMobileCarouselDrag, false);
root.addEventListener('touchcancel', endMobileCarouselDrag, false);
root.addEventListener('click', function (event) {
var open = closest(event.target, '[data-tdfn-m-open]', root);
var close = closest(event.target, '[data-tdfn-m-close]', root);
var prev = closest(event.target, '[data-tdfn-carousel-prev]', root);
var next = closest(event.target, '[data-tdfn-carousel-next]', root);
var carouselCard = closest(event.target, '.tdfn-v1-m-carousel-card', root);
if (
carouselCard &&
new Date().getTime() < state.mobileCarouselSuppressUntil
) {
event.preventDefault();
event.stopPropagation();
return;
}
if (close) {
event.preventDefault();
event.stopPropagation();
closeMobilePanel();
return;
}
if (open) {
event.preventDefault();
openMobilePanel(open.getAttribute('data-tdfn-m-open'));
return;
}
if (prev) {
event.preventDefault();
moveCarousel(prev, -1);
return;
}
if (next) {
event.preventDefault();
moveCarousel(next, 1);
}
});
}
function matches(element, selector) {
var fn = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
return fn ? fn.call(element, selector) : false;
}
function queryByPriority(selectors, scope) {
var root = scope || document;
var i;
var result;
for (i = 0; i < selectors.length; i += 1) {
result = root.querySelector(selectors[i]);
if (result) {
return result;
}
}
return null;
}
function findDesktopHost(source) {
var host;
if (source) {
host = closest(source, DESKTOP_HOST_QUERY, null);
if (host) {
return host;
}
}
return queryByPriority(DESKTOP_HOST_SELECTORS, document);
}
function findMobileSource() {
return queryByPriority(MOBILE_SELECTORS, document);
}
function numericPixel(value, fallback) {
var parsed = parseFloat(value);
return isNaN(parsed) ? fallback : parsed;
}
function setPropertyIfChanged(element, property, value) {
if (!element || !element.style) {
return;
}
if (element.style.getPropertyValue(property) !== value) {
element.style.setProperty(property, value);
}
}
function syncReactHeaderSpacing() {
var headers = document.querySelectorAll('header.headerA');
var header;
var top;
var topRect;
var topComputed;
var topBaseHeight;
var bottom;
var baseOffset;
var computed;
var i;
for (i = 0; i < headers.length; i += 1) {
header = headers[i];
top = header.querySelector('.headerA__top');
if (
top &&
top.getAttribute(HEADER_TOP_BASE_ATTRIBUTE) !== 'true'
) {
topRect = top.getBoundingClientRect();
topBaseHeight = topRect && topRect.height ?
topRect.height :
0;
if (!topBaseHeight && window.getComputedStyle) {
topComputed = window.getComputedStyle(top);
topBaseHeight = numericPixel(
topComputed ? topComputed.height : '',
0
);
}
if (!topBaseHeight) {
topBaseHeight = 100;
}
setPropertyIfChanged(
header,
'--tdfn-v1-header-top-base-height',
Math.round(topBaseHeight) + 'px'
);
top.setAttribute(HEADER_TOP_BASE_ATTRIBUTE, 'true');
}
setPropertyIfChanged(
header,
'--tdfn-v1-header-top-space',
HEADER_TOP_EXTRA_SPACE + 'px'
);
setPropertyIfChanged(
header,
'--tdfn-v1-header-bottom-space',
HEADER_BOTTOM_EXTRA_SPACE + 'px'
);
setPropertyIfChanged(
header,
'--tdfn-v1-header-total-space',
HEADER_TOTAL_EXTRA_SPACE + 'px'
);
if (
header.getAttribute(HEADER_SPACING_ATTRIBUTE) !== 'react'
) {
header.setAttribute(HEADER_SPACING_ATTRIBUTE, 'react');
}
bottom = header.querySelector('.headerA__bottom');
if (!bottom) {
continue;
}
if (bottom.getAttribute(HEADER_BASE_ATTRIBUTE) !== 'true') {
baseOffset = numericPixel(bottom.style.paddingTop, -1);
if (baseOffset < 0) {
computed = window.getComputedStyle ?
window.getComputedStyle(bottom) :
null;
baseOffset = numericPixel(
computed ? computed.paddingTop : '',
0
);
}
setPropertyIfChanged(
bottom,
'--tdfn-v1-header-base-offset',
Math.round(baseOffset) + 'px'
);
bottom.setAttribute(HEADER_BASE_ATTRIBUTE, 'true');
}
if (
bottom.getAttribute(HEADER_BOTTOM_ATTRIBUTE) !== 'true'
) {
bottom.setAttribute(HEADER_BOTTOM_ATTRIBUTE, 'true');
}
}
}
function syncAngularHeaderSpacing() {
var official = document.getElementById('officialHeader');
var layout;
var rect;
var computed;
var baseHeight;
if (!official) {
return;
}
layout = official.querySelector('.layout-header');
if (!layout) {
return;
}
if (official.getAttribute(HEADER_BASE_ATTRIBUTE) !== 'true') {
rect = layout.getBoundingClientRect();
baseHeight = rect && rect.height ? rect.height : 0;
if (!baseHeight && window.getComputedStyle) {
computed = window.getComputedStyle(layout);
baseHeight = numericPixel(computed.height, 0);
}
if (!baseHeight) {
baseHeight = 100;
}
setPropertyIfChanged(
official,
'--tdfn-v1-header-base-height',
Math.round(baseHeight) + 'px'
);
official.setAttribute(HEADER_BASE_ATTRIBUTE, 'true');
}
setPropertyIfChanged(
official,
'--tdfn-v1-header-top-space',
HEADER_TOP_EXTRA_SPACE + 'px'
);
setPropertyIfChanged(
official,
'--tdfn-v1-header-bottom-space',
HEADER_BOTTOM_EXTRA_SPACE + 'px'
);
setPropertyIfChanged(
official,
'--tdfn-v1-header-total-space',
HEADER_TOTAL_EXTRA_SPACE + 'px'
);
if (
official.getAttribute(HEADER_SPACING_ATTRIBUTE) !== 'angular'
) {
official.setAttribute(HEADER_SPACING_ATTRIBUTE, 'angular');
}
}
function swapHeaderIconClass(selector, oldClass, newClass) {
var icons = document.querySelectorAll(selector);
var icon;
var i;
for (i = 0; i < icons.length; i += 1) {
icon = icons[i];
if (icon.classList.contains(oldClass)) {
icon.classList.remove(oldClass);
}
if (!icon.classList.contains(newClass)) {
icon.classList.add(newClass);
}
}
}
function syncHeaderIcons() {
swapHeaderIconClass(
'i.ico-user',
'ico-user',
'ico-user-fill'
);
swapHeaderIconClass(
'i.ico-shopping',
'ico-shopping',
'ico-shopping-fill'
);
}
function syncHeaderLogo() {
var logoUrl = CONFIG.logo || '';
var logos;
var logo;
var i;
if (!logoUrl) {
return;
}
logos = document.querySelectorAll(
'[data-qe-id="header-logo-img"]'
);
for (i = 0; i < logos.length; i += 1) {
logo = logos[i];
if (logo.getAttribute('src') !== logoUrl) {
logo.setAttribute('src', logoUrl);
}
if (logo.hasAttribute('srcset')) {
logo.removeAttribute('srcset');
}
if (logo.hasAttribute('data-src')) {
logo.setAttribute('data-src', logoUrl);
}
if (logo.hasAttribute('data-lazy-src')) {
logo.setAttribute('data-lazy-src', logoUrl);
}
logo.setAttribute(
'data-tdfn-v1-logo-applied',
'true'
);
}
}
function syncHeaderVisuals() {
syncHeaderIcons();
syncHeaderLogo();
}
function syncHeaderTopSpacing() {
syncReactHeaderSpacing();
syncAngularHeaderSpacing();
}
function syncDesktopGeometry() {
var root = state.desktopRoot;
var source = state.desktopSource;
var rect;
if (!root || !source || !document.documentElement.contains(source) || window.innerWidth < BREAKPOINT) {
return;
}
rect = source.getBoundingClientRect();
if (!rect.width || !rect.height) {
return;
}
root.style.setProperty('--tdfn-v1-desktop-top', Math.round(rect.top) + 'px');
root.style.setProperty('--tdfn-v1-desktop-left', Math.round(rect.left) + 'px');
root.style.setProperty('--tdfn-v1-desktop-width', Math.round(rect.width) + 'px');
root.style.setProperty('--tdfn-v1-desktop-height', Math.round(rect.height) + 'px');
}
function mountDesktop(source) {
var host = findDesktopHost(source);
var root;
if (!source || !host) {
return;
}
if (state.desktopSource && state.desktopSource !== source && document.documentElement.contains(state.desktopSource)) {
state.desktopSource.removeAttribute('data-tdfn-v1-original-desktop');
}
source.setAttribute('data-tdfn-v1-original-desktop', 'hidden');
state.desktopSource = source;
state.desktopHost = host;
root = host.querySelector('[data-tdfn-v1="desktop"]');
if (!root && state.desktopRoot && document.documentElement.contains(state.desktopRoot)) {
root = state.desktopRoot;
host.appendChild(root);
}
if (!root) {
root = document.createElement('ul');
root.className = 'tdfn-v1-desktop-root';
root.setAttribute('data-tdfn-v1', 'desktop');
root.setAttribute('data-tdfn-version', VERSION);
root.setAttribute('aria-label', '全站導覽');
root.innerHTML = renderDesktopRoot();
host.appendChild(root);
bindDesktop(root);
}
state.desktopRoot = root;
syncDesktopGeometry();
window.requestAnimationFrame(syncDesktopGeometry);
}
function ensureMobilePortal() {
var portal = document.getElementById(MOBILE_PORTAL_ID);
var root;
if (!portal) {
portal = document.createElement('div');
portal.id = MOBILE_PORTAL_ID;
portal.setAttribute('aria-label', '手機版全站導覽');
document.body.appendChild(portal);
}
root = portal.querySelector('[data-tdfn-v1="mobile"]');
if (!root) {
root = document.createElement('div');
root.setAttribute('data-tdfn-v1', 'mobile');
root.setAttribute('data-tdfn-version', VERSION);
root.innerHTML =
'<div class="tdfn-v1-m-stage">' +
renderMobileMain() +
'</div>';
portal.appendChild(root);
bindMobile(root);
}
state.mobilePortal = portal;
state.mobileRoot = root;
return portal;
}
function findMobileDrawer(source) {
if (!source) {
return null;
}
return closest(
source,
'.slide-push-menu__left,.aside-section-container',
null
);
}
function isMobileDrawerOpen(drawer, source) {
var rect;
var computed;
if (
window.innerWidth >= BREAKPOINT ||
!source ||
!document.documentElement.contains(source)
) {
return false;
}
if (
drawer &&
drawer.classList &&
drawer.classList.contains('slide-push-menu__left--open')
) {
return true;
}
rect = source.getBoundingClientRect();
computed = window.getComputedStyle ?
window.getComputedStyle(source) :
null;
if (
computed &&
(
computed.display === 'none' ||
computed.visibility === 'hidden'
)
) {
return false;
}
return (
rect.width > 0 &&
rect.height > 0 &&
rect.right > 0 &&
rect.left < window.innerWidth
);
}
function syncMobilePortal() {
var source = state.mobileSource;
var portal = state.mobilePortal;
var drawer = state.mobileDrawer;
var rect;
if (!source || !portal) {
return;
}
if (!document.documentElement.contains(source)) {
portal.style.display = 'none';
scheduleMountAll();
return;
}
rect = source.getBoundingClientRect();
portal.style.top = Math.round(rect.top) + 'px';
portal.style.left = Math.round(rect.left) + 'px';
portal.style.width = Math.round(rect.width) + 'px';
portal.style.height = Math.round(rect.height) + 'px';
portal.style.display = isMobileDrawerOpen(drawer, source) ?
'block' :
'none';
}
function runMobilePortalSync(duration) {
state.mobileSyncUntil =
new Date().getTime() + (duration || 420);
if (state.mobileSyncFrame) {
return;
}
function frame() {
state.mobileSyncFrame = null;
syncMobilePortal();
if (new Date().getTime() < state.mobileSyncUntil) {
state.mobileSyncFrame =
window.requestAnimationFrame(frame);
}
}
state.mobileSyncFrame =
window.requestAnimationFrame(frame);
}
function bindMobileDrawer(drawer) {
if (state.mobileDrawer === drawer) {
return;
}
if (state.mobileDrawerObserver) {
state.mobileDrawerObserver.disconnect();
state.mobileDrawerObserver = null;
}
state.mobileDrawer = drawer;
if (!drawer || !window.MutationObserver) {
return;
}
state.mobileDrawerObserver =
new MutationObserver(function () {
runMobilePortalSync(420);
});
state.mobileDrawerObserver.observe(drawer, {
attributes: true,
attributeFilter: ['class', 'style']
});
}
function mountMobile(source) {
var portal;
var drawer;
if (!source) {
return;
}
if (
state.mobileSource &&
state.mobileSource !== source &&
document.documentElement.contains(state.mobileSource)
) {
state.mobileSource.removeAttribute(
'data-tdfn-v1-native-mobile'
);
}
state.mobileSource = source;
source.setAttribute(
'data-tdfn-v1-native-mobile',
'hidden'
);
portal = ensureMobilePortal();
drawer = findMobileDrawer(source);
bindMobileDrawer(drawer);
syncMobilePortal();
return portal;
}
function findDesktopSource() {
var hosts = [];
var candidates;
var preferred;
var best = null;
var bestScore = -1;
var i;
var item;
var score;
var rect;
var host;
for (i = 0; i < DESKTOP_HOST_SELECTORS.length; i += 1) {
host = document.querySelector(DESKTOP_HOST_SELECTORS[i]);
if (host) {
hosts.push(host);
}
}
for (i = 0; i < hosts.length; i += 1) {
preferred = hosts[i].querySelector('.headerA__nav-menu-main > .nav-menu-ul');
if (!preferred) {
preferred = hosts[i].querySelector('.headerA__nav-menu-main .nav-menu-ul');
}
if (!preferred) {
preferred = hosts[i].querySelector('.nav-menu-ul');
}
if (preferred && preferred.getAttribute('data-tdfn-v1') !== 'desktop') {
return preferred;
}
}
candidates = document.querySelectorAll(DESKTOP_SELECTOR);
for (i = 0; i < candidates.length; i += 1) {
item = candidates[i];
if (item.getAttribute('data-tdfn-v1') === 'desktop' || closest(item, MOBILE_SELECTOR_QUERY, null)) {
continue;
}
score = 0;
if (item.tagName && item.tagName.toLowerCase() === 'ul') {
score += 100;
}
if (closest(item, '.headerA__nav-menu-main', null)) {
score += 200;
}
if (closest(item, '.layout-nav-menu.nav-main-menu', null)) {
score += 200;
}
rect = item.getBoundingClientRect();
if (rect.width >= 500) {
score += 40;
}
if (item.children && item.children.length) {
score += 10;
}
if (score > bestScore) {
best = item;
bestScore = score;
}
}
return best;
}
function mountAll() {
syncHeaderVisuals();
syncHeaderTopSpacing();
var desktop = findDesktopSource();
var mobile = findMobileSource();
if (desktop) {
mountDesktop(desktop);
}
if (mobile) {
mountMobile(mobile);
} else if (state.mobilePortal) {
state.mobilePortal.style.display = 'none';
}
}
function scheduleMountAll() {
if (state.mountTimer) {
return;
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mountAll();
}, 60);
}
function bindGlobalEvents() {
window.addEventListener('mousemove', moveMobileCarouselDrag, false);
window.addEventListener('mouseup', endMobileCarouselDrag, false);
document.addEventListener('click', function (event) {
var menuControl = closest(
event.target,
'[data-qe-id="header-menu-icon"],' +
'[data-qe-id="drawer-close-icon"],' +
'.slide-push-menu__backdrop',
null
);
var link = closest(event.target, '[data-tdfn-link]', null);
if (menuControl) {
scheduleMountAll();
runMobilePortalSync(500);
}
if (!link) {
return;
}
if (isPlaceholderHref(link.getAttribute('href'))) {
event.preventDefault();
}
track('td_nav_link_click', {
td_nav_device: window.innerWidth < BREAKPOINT ? 'mobile' : 'desktop',
td_nav_menu: link.getAttribute('data-menu') || '',
td_nav_label: link.getAttribute('data-label') || '',
td_nav_href: link.getAttribute('href') || ''
});
}, false);
document.addEventListener('keydown', function (event) {
if (event.key === 'Escape' || event.keyCode === 27) {
if (!closeMobilePanel()) {
closeDesktop(false);
}
}
});
window.addEventListener('resize', function () {
resetMobileCarouselDrag();
closeDesktop(true);
syncHeaderTopSpacing();
syncDesktopGeometry();
scheduleMountAll();
runMobilePortalSync(420);
if (state.mobileRoot) {
var carousels = state.mobileRoot.querySelectorAll('[data-tdfn-carousel]');
var i;
for (i = 0; i < carousels.length; i += 1) {
updateCarousel(carousels[i]);
}
}
});
window.addEventListener('scroll', function (event) {
var target = event.target;
if (
state.portal &&
(
target === state.portal ||
state.portal.contains(target)
)
) {
return;
}
syncDesktopGeometry();
if (state.activeDesktopId) {
closeDesktop(true);
}
}, true);
}
function bindPortalEvents() {
var portal = ensurePortal();
portal.addEventListener('mouseenter', clearDesktopTimer);
portal.addEventListener('mouseleave', scheduleDesktopClose);
}
function startObserver() {
if (state.observer || !window.MutationObserver) {
return;
}
state.observer = new MutationObserver(function () {
scheduleMountAll();
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function init() {
injectStyle();
mountAll();
bindPortalEvents();
bindGlobalEvents();
startObserver();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
})();
    }
  };

  window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
  window.TDFigmaPendingJobs.push(job);

  if (window.TDFigmaCore && window.TDFigmaCore.jobs) {
    window.TDFigmaCore.jobs.flush();
  }
}());

/* ===== TD_Figma_All_Pages_Search_GTM_v2.0.1.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-search-v201',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.allPages && window.TDFigmaData.allPages.search);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.allPages.search;
var HOT_KEYWORDS = (SOURCE_DATA.hotKeywords || []).map(function (item) {
return {
label: item.text || '',
href: item.linkUrl || ''
};
});
var closest = Core.dom.closest;
var escapeHtml = Core.text.escapeHtml;
var VERSION = '2.0.1';
var LOAD_ATTR = 'data-tdfs-v1-loaded';
var STYLE_ID = 'tdfs-v1-style-v107';
var TARGET_ATTR = 'data-tdfs-v1-search-target';
var BOX_ATTR = 'data-tdfs-v1-search-box';
var HOTKEY_ID = 'tdfs-v1-search-hotkeys';
var MOBILE_EXCLUDE_SELECTOR = '.nav-slide-push-container, .aside-section-container, #hsearch';
var DESKTOP_VARIANTS = [
{
name: 'product',
searchBoxSelector: '.search-box',
targetSelector: '.nav-interaction-ul',
requiredChildSelector: ''
},
{
name: 'default',
searchBoxSelector: '.nav-search-box',
targetSelector: '.nav-menu-ul',
requiredChildSelector: '.nav-shopping-cart'
}
];
var state = {
searchBox: null,
target: null,
hotkeys: null,
observer: null,
mountTimer: null,
mobileCloseTimer: null
};
if (document.documentElement.getAttribute(LOAD_ATTR) === VERSION) {
return;
}
document.documentElement.setAttribute(LOAD_ATTR, VERSION);
function injectStyle() {}
function getItemHref(item) {
return item && item.href ? item.href : '#';
}
function isDesktopCandidate(element) {
return !!element && !closest(element, MOBILE_EXCLUDE_SELECTOR);
}
function findDesktopMount() {
var variant;
var targets;
var boxes;
var target;
var searchBox;
var i;
var j;
for (i = 0; i < DESKTOP_VARIANTS.length; i += 1) {
variant = DESKTOP_VARIANTS[i];
targets = document.querySelectorAll(variant.targetSelector);
boxes = document.querySelectorAll(variant.searchBoxSelector);
target = null;
searchBox = null;
for (j = 0; j < targets.length; j += 1) {
if (!isDesktopCandidate(targets[j])) {
continue;
}
if (variant.requiredChildSelector && !targets[j].querySelector(variant.requiredChildSelector)) {
continue;
}
target = targets[j];
break;
}
for (j = 0; j < boxes.length; j += 1) {
if (isDesktopCandidate(boxes[j])) {
searchBox = boxes[j];
break;
}
}
if (target && searchBox) {
return {
variant: variant.name,
target: target,
searchBox: searchBox
};
}
}
return null;
}
function clearPreviousDesktopMarkers(currentTarget, currentSearchBox) {
var targets = document.querySelectorAll('[' + TARGET_ATTR + '="true"]');
var boxes = document.querySelectorAll('[' + BOX_ATTR + ']');
var i;
for (i = 0; i < targets.length; i += 1) {
if (targets[i] !== currentTarget) {
targets[i].removeAttribute(TARGET_ATTR);
}
}
for (i = 0; i < boxes.length; i += 1) {
if (boxes[i] !== currentSearchBox) {
boxes[i].removeAttribute(BOX_ATTR);
}
}
}
function renderHotkeys() {
var html = [];
var i;
var item;
for (i = 0; i < HOT_KEYWORDS.length; i += 1) {
item = HOT_KEYWORDS[i];
html.push(
'<a href="' + escapeHtml(getItemHref(item)) + '" data-tdfs-v1-hotkey="' + escapeHtml(item.label) + '">' +
escapeHtml(item.label) +
'</a>'
);
}
return html.join('');
}
function bindHotkeyScroller(hotkeys) {
var wheelHandler;
if (!hotkeys || hotkeys.getAttribute('data-tdfs-v1-wheel-bound') === 'true') {
return;
}
wheelHandler = function (event) {
var delta;
if (hotkeys.scrollWidth <= hotkeys.clientWidth) {
return;
}
if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
return;
}
delta = event.deltaY;
hotkeys.scrollLeft += delta;
event.preventDefault();
};
try {
hotkeys.addEventListener('wheel', wheelHandler, { passive: false });
} catch (error) {
hotkeys.addEventListener('wheel', wheelHandler, false);
}
hotkeys.setAttribute('data-tdfs-v1-wheel-bound', 'true');
}
function mountDesktopSearch() {
var mount = findDesktopMount();
var target;
var searchBox;
var hotkeys;
if (!mount) {
return false;
}
target = mount.target;
searchBox = mount.searchBox;
clearPreviousDesktopMarkers(target, searchBox);
target.setAttribute(TARGET_ATTR, 'true');
searchBox.setAttribute(BOX_ATTR, mount.variant);
if (searchBox.parentNode !== target || target.firstElementChild !== searchBox) {
target.insertBefore(searchBox, target.firstChild);
}
hotkeys = document.getElementById(HOTKEY_ID);
if (!hotkeys) {
hotkeys = document.createElement('li');
hotkeys.id = HOTKEY_ID;
hotkeys.setAttribute('data-tdfs-v1-hotkeys', 'desktop');
hotkeys.innerHTML = renderHotkeys();
}
if (hotkeys.parentNode !== target || hotkeys.previousElementSibling !== searchBox) {
target.insertBefore(hotkeys, searchBox.nextSibling);
}
bindHotkeyScroller(hotkeys);
state.searchBox = searchBox;
state.target = target;
state.hotkeys = hotkeys;
return true;
}
function track(eventName, data) {
Core.events.push(eventName, data, 'td_search_version', VERSION);
}
function bindEvents() {
document.addEventListener('click', function (event) {
var hotkey = closest(event.target, '[data-tdfs-v1-hotkey]');
var keyword;
if (!hotkey) {
return;
}
keyword = hotkey.getAttribute('data-tdfs-v1-hotkey') || '';
track('td_search_hotkey_click', {
td_search_device: 'desktop',
td_search_keyword: keyword,
td_search_href: hotkey.getAttribute('href') || ''
});
}, false);
}
function bindMobileCloseAnimation() {
document.addEventListener('click', function (event) {
var closeButton = closest(event.target, '#hsearch .close-full-screen-btn');
var wrapper;
var originalTarget;
var closeDelay = 310;
if (!closeButton) {
return;
}
if (closeButton.getAttribute('data-tdfs-v1-close-replay') === 'true') {
closeButton.removeAttribute('data-tdfs-v1-close-replay');
return;
}
wrapper = closest(closeButton, '#hsearch .wrapper');
if (!wrapper || wrapper.classList.contains('tdfs-v1-closing')) {
return;
}
event.preventDefault();
event.stopPropagation();
if (event.stopImmediatePropagation) {
event.stopImmediatePropagation();
}
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
closeDelay = 20;
}
originalTarget = event.target && event.target.nodeType === 1 ? event.target : closeButton;
wrapper.classList.add('tdfs-v1-closing');
if (state.mobileCloseTimer) {
window.clearTimeout(state.mobileCloseTimer);
}
state.mobileCloseTimer = window.setTimeout(function () {
state.mobileCloseTimer = null;
closeButton.setAttribute('data-tdfs-v1-close-replay', 'true');
if (originalTarget && typeof originalTarget.click === 'function') {
originalTarget.click();
} else if (typeof closeButton.click === 'function') {
closeButton.click();
}
window.setTimeout(function () {
wrapper.classList.remove('tdfs-v1-closing');
}, 80);
}, closeDelay);
}, true);
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mountDesktopSearch();
}, 60);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
scheduleMount();
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function init() {
injectStyle();
bindEvents();
bindMobileCloseAnimation();
mountDesktopSearch();
observeDom();
}
init();
})();
    }
  };

  window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
  window.TDFigmaPendingJobs.push(job);

  if (window.TDFigmaCore && window.TDFigmaCore.jobs) {
    window.TDFigmaCore.jobs.flush();
  }
}());

/* ===== TD_Figma_All_Pages_Footer_GTM_v2.0.1.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-footer-v201',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.allPages && window.TDFigmaData.allPages.footer);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.allPages.footer;
function mapFooterSection(section) {
return {
title: (section || {}).heading || '',
items: ((section || {}).links || []).map(function (item) {
return {
label: item.text || '',
href: item.linkUrl || ''
};
})
};
}
var CONTENT = {
about: mapFooterSection(SOURCE_DATA.brandSection),
member: mapFooterSection(SOURCE_DATA.memberSection),
skin: mapFooterSection(SOURCE_DATA.skinNeedsSection),
contact: {
phone: {
label: ((SOURCE_DATA.contact || {}).phone || {}).displayText || '',
href: ((SOURCE_DATA.contact || {}).phone || {}).linkUrl || ''
},
offer: {
label:
((SOURCE_DATA.contact || {}).firstPurchaseOffer || {}).text || '',
href:
((SOURCE_DATA.contact || {}).firstPurchaseOffer || {}).linkUrl || ''
},
social: (SOURCE_DATA.contact || {}).socialLinks || {}
},
legal: (SOURCE_DATA.legalLinks || []).map(function (item) {
return {
label: item.text || '',
href: item.linkUrl || ''
};
})
};
Object.keys(CONTENT.contact.social).forEach(function (key) {
var item = CONTENT.contact.social[key] || {};
CONTENT.contact.social[key] = {
label: item.label || '',
href: item.linkUrl || ''
};
});
var normalizeText = Core.text.normalize;
var escapeHtml = Core.text.escapeHtml;
var VERSION = '2.0.1';
var ROOT_ATTRIBUTE = 'data-tdff-v1';
var ORIGINAL_ATTRIBUTE = 'data-tdff-v1-original-footer';
var TARGET_SELECTOR = '.layout-footer';
var FALLBACK_FOOTER_SELECTOR =
'footer.layout-footer-wrapper,footer[class*="layout-footer-wrapper"]';
var GLOBAL_KEY = '__TD_FIGMA_FOOTER_V1__';
var state = {
observer: null,
renderTimer: null
};
if (window[GLOBAL_KEY]) {
if (typeof window[GLOBAL_KEY].render === 'function') {
window[GLOBAL_KEY].render();
}
return;
}
function collectOriginalLinks(source) {
var result = {
text: {},
social: {},
phone: 'tel:0277289768'
};
var anchors = source.querySelectorAll('a[href], area[href]');
var i;
var anchor;
var href;
var text;
for (i = 0; i < anchors.length; i += 1) {
anchor = anchors[i];
href = anchor.getAttribute('href') || '';
text = normalizeText(anchor.textContent || anchor.innerText || '');
if (text && !result.text[text]) {
result.text[text] = href;
}
if (/^tel:/i.test(href)) {
result.phone = href;
}
if (/facebook\.com/i.test(href)) {
result.social.facebook = href;
}
if (/instagram\.com/i.test(href)) {
result.social.instagram = href;
}
if (/line\.me|lin\.ee/i.test(href)) {
result.social.line = href;
}
}
return result;
}
function resolveHref(linkMap, text, fallback) {
var key = normalizeText(text);
return linkMap.text[key] || fallback || '#';
}
function getContentLabel(item) {
return typeof item === 'string' ? item : (item && item.label) || '';
}
function getContentHref(item, linkMap, fallbackText, fallbackHref) {
var configuredHref = item && typeof item === 'object' ? item.href : '';
var text = getContentLabel(item) || fallbackText || '';
if (configuredHref) {
return configuredHref;
}
return resolveHref(linkMap, text, fallbackHref || '#');
}
function phoneIcon() {
return [
'<svg class="tdff-v1-phone-icon" viewBox="0 0 24 24" aria-hidden="true">',
'<path fill="currentColor" d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>',
'</svg>'
].join('');
}
function socialIcon(type) {
if (type === 'facebook') {
return [
'<svg viewBox="0 0 30 30" aria-hidden="true">',
'<circle cx="15" cy="15" r="15" fill="#fff"/>',
'<path fill="#0b396a" d="M16.9 9.2h2V6.1c-.35-.05-1.55-.16-2.97-.16-2.94 0-4.96 1.8-4.96 5.1v2.85H7.64v3.47h3.33V26h4.08v-8.64h3.2l.51-3.47h-3.71v-2.5c0-1 .27-1.69 1.85-1.69Z"/>',
'</svg>'
].join('');
}
if (type === 'instagram') {
return [
'<svg viewBox="0 0 30 30" aria-hidden="true">',
'<circle cx="15" cy="15" r="15" fill="#fff"/>',
'<rect x="8.5" y="8.5" width="13" height="13" rx="4" fill="none" stroke="#0b396a" stroke-width="2"/>',
'<circle cx="15" cy="15" r="3.2" fill="none" stroke="#0b396a" stroke-width="2"/>',
'<circle cx="19.4" cy="10.7" r="1.15" fill="#0b396a"/>',
'</svg>'
].join('');
}
return [
'<svg viewBox="0 0 30 30" aria-hidden="true">',
'<circle cx="15" cy="15" r="15" fill="#fff"/>',
'<path fill="#0b396a" d="M23.1 14.2c0-3.65-3.66-6.62-8.16-6.62-4.5 0-8.16 2.97-8.16 6.62 0 3.27 2.9 6 6.82 6.52.27.06.63.18.72.42.08.22.05.56.03.78l-.11.74c-.03.22-.17.86.71.47.88-.37 4.75-2.8 6.48-4.79 1.2-1.32 1.67-2.66 1.67-4.16Z"/>',
'<text x="15" y="16.1" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.2" font-weight="700" fill="#fff">LINE</text>',
'</svg>'
].join('');
}
function arrowIcon() {
return [
'<svg viewBox="0 0 7 11" aria-hidden="true">',
'<path d="M1 1l5 4.5L1 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
'</svg>'
].join('');
}
function makeAnchor(className, text, href, extraAttributes) {
return '<a class="' + className + '" href="' + escapeHtml(href || '#') + '"' + (extraAttributes || '') + '>' + escapeHtml(text) + '</a>';
}
function desktopColumn(section, linkMap) {
var html = [];
var i;
html.push('<section class="tdff-v1-desktop-column">');
html.push('<h2 class="tdff-v1-desktop-heading">' + escapeHtml(section.title) + '</h2>');
html.push('<ul class="tdff-v1-desktop-list">');
for (i = 0; i < section.items.length; i += 1) {
html.push('<li>' + makeAnchor(
'tdff-v1-desktop-link',
getContentLabel(section.items[i]),
getContentHref(section.items[i], linkMap, getContentLabel(section.items[i]), '#'),
' data-tdff-v1-link="' + escapeHtml(getContentLabel(section.items[i])) + '"'
) + '</li>');
}
html.push('</ul>');
html.push('</section>');
return html.join('');
}
function socialMarkup(linkMap) {
var types = ['facebook', 'instagram', 'line'];
var html = [];
var i;
var item;
var href;
html.push('<div class="tdff-v1-socials" aria-label="社群媒體">');
for (i = 0; i < types.length; i += 1) {
item = CONTENT.contact.social[types[i]];
href = item.href || linkMap.social[types[i]] || '#';
html.push('<a class="tdff-v1-social-link" href="' + escapeHtml(href) + '" aria-label="' + escapeHtml(item.label) + '" data-tdff-v1-social="' + types[i] + '">' + socialIcon(types[i]) + '</a>');
}
html.push('</div>');
return html.join('');
}
function contactMarkup(linkMap, mobile) {
var html = [];
var offer = CONTENT.contact.offer;
var offerHref = getContentHref(offer, linkMap, offer.label, '#');
html.push('<div class="' + (mobile ? 'tdff-v1-mobile-contact' : 'tdff-v1-contact') + '">');
html.push('<div class="tdff-v1-hours"><span>10:00～17:00</span><span class="tdff-v1-days"><span>星期一</span><span class="tdff-v1-days-dot" aria-hidden="true"></span><span>星期五</span></span></div>');
html.push(socialMarkup(linkMap));
html.push(makeAnchor('tdff-v1-offer', offer.label, offerHref, ' data-tdff-v1-link="' + escapeHtml(offer.label) + '"'));
html.push('</div>');
return html.join('');
}
function legalMarkup(linkMap) {
var html = [];
var i;
html.push('<div class="tdff-v1-bottom">');
html.push('<nav class="tdff-v1-legal" aria-label="頁尾政策連結">');
for (i = 0; i < CONTENT.legal.length; i += 1) {
if (i > 0) {
html.push('<span class="tdff-v1-legal-separator" aria-hidden="true"></span>');
}
html.push(makeAnchor(
'tdff-v1-legal-link',
getContentLabel(CONTENT.legal[i]),
getContentHref(CONTENT.legal[i], linkMap, getContentLabel(CONTENT.legal[i]), '#'),
' data-tdff-v1-link="' + escapeHtml(getContentLabel(CONTENT.legal[i])) + '"'
));
}
html.push('</nav>');
html.push('<div class="tdff-v1-copyright">© 2026 by 台灣諾奧思有限公司</div>');
html.push('</div>');
return html.join('');
}
function mobileAccordionItem(key, section, linkMap) {
var html = [];
var i;
var panelId = 'tdff-v1-panel-' + key;
html.push('<section class="tdff-v1-accordion-item" data-tdff-v1-accordion-item="' + key + '">');
html.push('<button class="tdff-v1-accordion-trigger" type="button" aria-expanded="false" aria-controls="' + panelId + '" data-tdff-v1-accordion-trigger="' + key + '">');
html.push('<span class="tdff-v1-accordion-title">' + escapeHtml(section.title) + '</span>');
html.push('<span class="tdff-v1-accordion-arrow">' + arrowIcon() + '</span>');
html.push('</button>');
html.push('<div class="tdff-v1-accordion-panel" id="' + panelId + '" aria-hidden="true">');
html.push('<div class="tdff-v1-accordion-panel-inner"><ul class="tdff-v1-mobile-list">');
for (i = 0; i < section.items.length; i += 1) {
html.push('<li>' + makeAnchor(
'tdff-v1-mobile-link',
getContentLabel(section.items[i]),
getContentHref(section.items[i], linkMap, getContentLabel(section.items[i]), '#'),
' data-tdff-v1-link="' + escapeHtml(getContentLabel(section.items[i])) + '"'
) + '</li>');
}
html.push('</ul></div></div>');
html.push('</section>');
return html.join('');
}
function buildFooter(linkMap) {
var root = document.createElement('footer');
var html = [];
root.className = 'tdff-v1-root';
root.setAttribute(ROOT_ATTRIBUTE, 'footer');
root.setAttribute('data-tdff-version', VERSION);
root.setAttribute('aria-label', '網站頁尾');
html.push('<div class="tdff-v1-desktop">');
html.push('<div class="tdff-v1-desktop-main">');
html.push('<div class="tdff-v1-desktop-columns">');
html.push(desktopColumn(CONTENT.about, linkMap));
html.push(desktopColumn(CONTENT.member, linkMap));
html.push(desktopColumn(CONTENT.skin, linkMap));
html.push('</div>');
html.push(contactMarkup(linkMap, false));
html.push('</div>');
html.push('<div class="tdff-v1-divider"></div>');
html.push(legalMarkup(linkMap));
html.push('</div>');
html.push('<div class="tdff-v1-mobile">');
html.push('<div class="tdff-v1-accordion">');
html.push(mobileAccordionItem('about', CONTENT.about, linkMap));
html.push(mobileAccordionItem('member', CONTENT.member, linkMap));
html.push(mobileAccordionItem('skin', CONTENT.skin, linkMap));
html.push('</div>');
html.push(contactMarkup(linkMap, true));
html.push('<div class="tdff-v1-divider"></div>');
html.push(legalMarkup(linkMap));
html.push('</div>');
root.innerHTML = html.join('');
return root;
}
function track(eventName, data) {
Core.events.push(eventName, data, 'td_footer_version', VERSION);
}
function shouldPreventPlaceholder(anchor) {
var href = anchor.getAttribute('href') || '';
return href === '#' || href === '';
}
function bindFooter(root) {
root.addEventListener('click', function (event) {
var trigger = event.target.closest ? event.target.closest('[data-tdff-v1-accordion-trigger]') : null;
var anchor = event.target.closest ? event.target.closest('a') : null;
var items;
var item;
var panel;
var isOpen;
var i;
if (trigger && root.contains(trigger)) {
item = trigger.parentNode;
isOpen = item.classList.contains('is-open');
items = root.querySelectorAll('.tdff-v1-accordion-item');
for (i = 0; i < items.length; i += 1) {
items[i].classList.remove('is-open');
items[i].querySelector('.tdff-v1-accordion-trigger').setAttribute('aria-expanded', 'false');
panel = items[i].querySelector('.tdff-v1-accordion-panel');
panel.setAttribute('aria-hidden', 'true');
}
if (!isOpen) {
item.classList.add('is-open');
trigger.setAttribute('aria-expanded', 'true');
item.querySelector('.tdff-v1-accordion-panel').setAttribute('aria-hidden', 'false');
}
track('td_footer_accordion_toggle', {
td_footer_section: trigger.getAttribute('data-tdff-v1-accordion-trigger'),
td_footer_state: isOpen ? 'close' : 'open'
});
return;
}
if (anchor && root.contains(anchor)) {
if (shouldPreventPlaceholder(anchor)) {
event.preventDefault();
}
track('td_footer_link_click', {
td_footer_label: anchor.getAttribute('data-tdff-v1-link') || anchor.getAttribute('aria-label') || normalizeText(anchor.textContent),
td_footer_href: anchor.getAttribute('href') || ''
});
}
});
}
function hasAncestorMatching(element, selector) {
var current = element ? element.parentNode : null;
while (current && current.nodeType === 1) {
if (
current.matches &&
current.matches(selector)
) {
return true;
}
current = current.parentNode;
}
return false;
}
function hideOriginalFooter(footer) {
if (!footer || footer.getAttribute(ROOT_ATTRIBUTE) === 'footer') {
return;
}
footer.setAttribute(ORIGINAL_ATTRIBUTE, 'hidden');
footer.setAttribute('aria-hidden', 'true');
footer.setAttribute('hidden', 'hidden');
if (footer.style && footer.style.setProperty) {
footer.style.setProperty('display', 'none', 'important');
}
}
function getOriginalFooters(container, preferredFooter) {
var result = [];
var footers;
var i;
if (preferredFooter) {
result.push(preferredFooter);
return result;
}
footers = container.querySelectorAll(
'footer:not([' + ROOT_ATTRIBUTE + '])'
);
for (i = 0; i < footers.length; i += 1) {
result.push(footers[i]);
}
return result;
}
function findExistingFooter(container) {
var children = container ? container.children : [];
var i;
var child;
for (i = 0; i < children.length; i += 1) {
child = children[i];
if (
child.tagName &&
child.tagName.toLowerCase() === 'footer' &&
child.getAttribute(ROOT_ATTRIBUTE) === 'footer'
) {
return child;
}
}
return null;
}
function insertFooter(container, originalFooter, footer) {
if (
originalFooter &&
originalFooter.parentNode === container
) {
if (originalFooter.nextSibling) {
container.insertBefore(footer, originalFooter.nextSibling);
} else {
container.appendChild(footer);
}
return;
}
container.appendChild(footer);
}
function renderContainer(container, preferredFooter) {
var existing;
var originals;
var linkSource;
var linkMap;
var footer;
var i;
if (!container) {
return null;
}
existing = findExistingFooter(container);
originals = getOriginalFooters(container, preferredFooter);
linkSource = preferredFooter || originals[0] || container;
for (i = 0; i < originals.length; i += 1) {
hideOriginalFooter(originals[i]);
}
if (existing) {
return existing;
}
linkMap = collectOriginalLinks(linkSource);
footer = buildFooter(linkMap);
bindFooter(footer);
insertFooter(container, preferredFooter, footer);
return footer;
}
function renderFallbackFooters() {
var fallbackFooters = document.querySelectorAll(
FALLBACK_FOOTER_SELECTOR
);
var allFooters;
var footer;
var parent;
var i;
var matched = 0;
for (i = 0; i < fallbackFooters.length; i += 1) {
footer = fallbackFooters[i];
if (
footer.getAttribute(ROOT_ATTRIBUTE) === 'footer' ||
hasAncestorMatching(footer, TARGET_SELECTOR)
) {
continue;
}
parent = footer.parentNode;
if (parent && parent.nodeType === 1) {
renderContainer(parent, footer);
matched += 1;
}
}
if (matched > 0) {
return;
}
allFooters = document.querySelectorAll(
'footer:not([' + ROOT_ATTRIBUTE + '])'
);
if (allFooters.length === 1) {
footer = allFooters[0];
if (!hasAncestorMatching(footer, TARGET_SELECTOR)) {
parent = footer.parentNode;
if (parent && parent.nodeType === 1) {
renderContainer(parent, footer);
}
}
}
}
function render() {
var containers = document.querySelectorAll(TARGET_SELECTOR);
var i;
for (i = 0; i < containers.length; i += 1) {
renderContainer(containers[i], null);
}
renderFallbackFooters();
}
function scheduleRender() {
if (state.renderTimer) {
window.clearTimeout(state.renderTimer);
}
state.renderTimer = window.setTimeout(function () {
state.renderTimer = null;
render();
}, 60);
}
function observe() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
scheduleRender();
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function init() {
window[GLOBAL_KEY] = {
version: VERSION,
render: render
};
render();
observe();
}
init();
})();
    }
  };

  window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
  window.TDFigmaPendingJobs.push(job);

  if (window.TDFigmaCore && window.TDFigmaCore.jobs) {
    window.TDFigmaCore.jobs.flush();
  }
}());

/* ===== TD_Figma_All_Pages_ProductCard_GTM_v1.0.1.html ===== */
(function () {
  'use strict';

  var VERSION = '1.0.1';
  var ROLE_ATTRIBUTE = 'data-tdpc-v1-role';
  var INJECTED_ATTRIBUTE = 'data-tdpc-v1-injected';
  var DATA_KEY = 'allPagesProductCard';
  var state = {
    observer: null,
    timer: null,
    isApplying: false,
    clickBound: false,
    readyTracked: false,
    startupTimer: null,
    startupAttempts: 0
  };

  function getDataset() {
    return window.TDFigmaData &&
      window.TDFigmaData[DATA_KEY]
      ? window.TDFigmaData[DATA_KEY]
      : null;
  }

  function setRole(element, role) {
    if (element && element.nodeType === 1) {
      element.setAttribute(ROLE_ATTRIBUTE, role);
    }
  }

  function trimText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function pixelValue(value, fallback) {
    var number = parseFloat(value);

    if (isNaN(number)) {
      number = fallback;
    }

    return String(number) + 'px';
  }

  function applyLegacyLayoutVariables(card, dataset) {
    var layout = dataset.legacyCardLayout || {};

    if (!card) {
      return;
    }

    card.style.setProperty(
      '--tdpc-v1-legacy-corner-min-height',
      pixelValue(layout.cornerLabelMinHeightPixels, 22)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-corner-font-size',
      pixelValue(layout.cornerLabelFontSizePixels, 10)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-corner-line-height',
      pixelValue(layout.cornerLabelLineHeightPixels, 14)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-corner-padding-y',
      pixelValue(layout.cornerLabelPaddingVerticalPixels, 3)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-corner-padding-x',
      pixelValue(layout.cornerLabelPaddingHorizontalPixels, 6)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-row-height',
      pixelValue(layout.tagRowHeightPixels, 26)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-font-size',
      pixelValue(layout.tagFontSizePixels, 10)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-line-height',
      pixelValue(layout.tagLineHeightPixels, 14)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-padding-y',
      pixelValue(layout.tagPaddingVerticalPixels, 3)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-padding-x',
      pixelValue(layout.tagPaddingHorizontalPixels, 6)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-tag-gap',
      pixelValue(layout.tagGapPixels, 4)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-side-padding',
      pixelValue(layout.contentSidePaddingPixels, 4)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-price-gap',
      pixelValue(layout.priceGapPixels, 4)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-original-price-font-size',
      pixelValue(layout.originalPriceFontSizePixels, 10)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-original-price-line-height',
      pixelValue(layout.originalPriceLineHeightPixels, 16)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-sale-price-font-size',
      pixelValue(layout.salePriceFontSizePixels, 13)
    );
    card.style.setProperty(
      '--tdpc-v1-legacy-sale-price-line-height',
      pixelValue(layout.salePriceLineHeightPixels, 18)
    );
  }

  function matchesCornerRule(productName, rule) {
    var name = trimText(productName).toLowerCase();
    var keywords = rule.productNameKeywords || [];
    var mode = rule.matchMode || 'containsAny';
    var matchedCount = 0;
    var keyword;
    var i;

    if (!name || !rule) {
      return false;
    }

    if (mode === 'regex') {
      try {
        return new RegExp(
          rule.pattern,
          rule.regexFlags || 'i'
        ).test(productName);
      } catch (error) {
        return false;
      }
    }

    if (!keywords.length) {
      return false;
    }

    for (i = 0; i < keywords.length; i += 1) {
      keyword = trimText(keywords[i]).toLowerCase();
      if (!keyword) {
        continue;
      }

      if (mode === 'exact' && name === keyword) {
        return true;
      }

      if (name.indexOf(keyword) !== -1) {
        matchedCount += 1;
        if (mode === 'containsAny') {
          return true;
        }
      }
    }

    return mode === 'containsAll' &&
      matchedCount === keywords.length;
  }

  function findCornerRule(productName, dataset) {
    var rules = dataset.cornerLabelRules || [];
    var i;

    for (i = 0; i < rules.length; i += 1) {
      if (matchesCornerRule(productName, rules[i])) {
        return rules[i];
      }
    }

    return null;
  }

  function updateCornerLabel(card, media, productName, dataset) {
    var existing = card.querySelector(
      '[' + ROLE_ATTRIBUTE + '="corner-label"]'
    );
    var rule = findCornerRule(productName, dataset);
    var label;

    if (!rule || !media) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      card.removeAttribute('data-tdpc-v1-corner-rule-id');
      return;
    }

    label = existing;
    if (!label) {
      label = document.createElement('span');
      label.setAttribute(ROLE_ATTRIBUTE, 'corner-label');
      label.setAttribute(INJECTED_ATTRIBUTE, 'true');
      label.setAttribute('aria-hidden', 'true');
      media.appendChild(label);
    }

    label.textContent = rule.labelText || '';
    label.style.setProperty(
      '--tdpc-v1-corner-background',
      rule.backgroundColor || '#5FA9D4'
    );
    label.style.setProperty(
      '--tdpc-v1-corner-text',
      rule.textColor || '#FFFFFF'
    );
    label.style.setProperty(
      '--tdpc-v1-corner-border',
      rule.borderColor ||
        rule.backgroundColor ||
        '#5FA9D4'
    );

    card.setAttribute(
      'data-tdpc-v1-corner-rule-id',
      rule.id || ''
    );
  }

  function updateFavoriteState(favoriteButton) {
    var icon;
    var active = false;

    if (!favoriteButton) {
      return;
    }

    icon = favoriteButton.querySelector('i');
    if (icon) {
      active = String(icon.className || '')
        .indexOf('heart-fill') !== -1;
    }

    favoriteButton.setAttribute(
      'data-tdpc-v1-favorite-state',
      active ? 'active' : 'default'
    );
  }

  function directChildren(element) {
    var output = [];
    var children = element ? element.children : [];
    var i;

    for (i = 0; i < children.length; i += 1) {
      output.push(children[i]);
    }

    return output;
  }

  function markModernOriginalTagGroups(details, title) {
    var children = directChildren(details);
    var group;
    var tags;
    var i;
    var j;

    for (i = 0; i < children.length; i += 1) {
      group = children[i];

      if (
        group === title ||
        group.getAttribute(INJECTED_ATTRIBUTE) === 'true' ||
        group.getAttribute(ROLE_ATTRIBUTE) === 'product-tag-row' ||
        !group.children ||
        !group.children.length
      ) {
        continue;
      }

      setRole(group, 'original-tag-group');
      tags = directChildren(group);

      for (j = 0; j < tags.length; j += 1) {
        setRole(tags[j], 'original-tag');
      }
    }
  }

  function findProductTagRule(productName, dataset) {
    var rules = dataset.productTagRules || [];
    var i;

    for (i = 0; i < rules.length; i += 1) {
      if (matchesCornerRule(productName, rules[i])) {
        return rules[i];
      }
    }

    return null;
  }

  function normalizeProductTag(tag) {
    if (typeof tag === 'string') {
      return {
        text: tag,
        backgroundColor: '#FFFFFF',
        textColor: '#0B396A',
        borderColor: '#0B396A'
      };
    }

    return tag || {};
  }

  function buildProductTagSignature(rule) {
    var tags = rule && rule.tags ? rule.tags : [];
    var normalized;
    var parts = [];
    var i;

    for (i = 0; i < tags.length; i += 1) {
      normalized = normalizeProductTag(tags[i]);
      parts.push([
        normalized.text || '',
        normalized.backgroundColor || '',
        normalized.textColor || '',
        normalized.borderColor || ''
      ].join('|'));
    }

    return parts.join('||');
  }

  function updateProductTagRow(card, details, title, productName, dataset) {
    var behavior = dataset.behavior || {};
    var row = details
      ? details.querySelector(
          '[' + ROLE_ATTRIBUTE + '="product-tag-row"]'
        )
      : null;
    var rule = findProductTagRule(productName, dataset);
    var tags = rule && rule.tags ? rule.tags : [];
    var signature = buildProductTagSignature(rule);
    var normalized;
    var tagElement;
    var i;

    if (!details || !title) {
      return;
    }

    /*
     * 清除上一版曾插入的雙標籤占位元素。
     */
    (function removeOldPlaceholders() {
      var oldPlaceholders = details.querySelectorAll(
        '[data-tdpc-v1-placeholder="true"]'
      );
      var index;

      for (index = 0; index < oldPlaceholders.length; index += 1) {
        if (oldPlaceholders[index].parentNode) {
          oldPlaceholders[index].parentNode.removeChild(
            oldPlaceholders[index]
          );
        }
      }
    }());

    if (
      !tags.length &&
      behavior.reserveEmptyProductTagRow === false
    ) {
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
      }
      return;
    }

    if (!row) {
      row = document.createElement('div');
      row.setAttribute(ROLE_ATTRIBUTE, 'product-tag-row');
      row.setAttribute(INJECTED_ATTRIBUTE, 'true');
      row.setAttribute('aria-label', '商品標籤');
      details.insertBefore(row, title);
    } else if (row.nextSibling !== title) {
      details.insertBefore(row, title);
    }

    if (
      row.getAttribute('data-tdpc-v1-tag-signature') === signature
    ) {
      return;
    }

    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }

    for (i = 0; i < tags.length; i += 1) {
      normalized = normalizeProductTag(tags[i]);

      if (!normalized.text) {
        continue;
      }

      tagElement = document.createElement('span');
      tagElement.setAttribute(ROLE_ATTRIBUTE, 'product-tag');
      tagElement.setAttribute(INJECTED_ATTRIBUTE, 'true');
      tagElement.textContent = normalized.text;
      tagElement.style.setProperty(
        '--tdpc-v1-product-tag-background',
        normalized.backgroundColor || '#FFFFFF'
      );
      tagElement.style.setProperty(
        '--tdpc-v1-product-tag-text',
        normalized.textColor || '#0B396A'
      );
      tagElement.style.setProperty(
        '--tdpc-v1-product-tag-border',
        normalized.borderColor || '#0B396A'
      );
      row.appendChild(tagElement);
    }

    row.setAttribute(
      'data-tdpc-v1-tag-signature',
      signature
    );
    card.setAttribute(
      'data-tdpc-v1-product-tag-rule-id',
      rule && rule.id ? rule.id : ''
    );
  }

  function findDirectRoleChild(parent, role, includePlaceholder) {
    var children = parent ? parent.children : [];
    var child;
    var i;

    for (i = 0; i < children.length; i += 1) {
      child = children[i];

      if (
        child.getAttribute(ROLE_ATTRIBUTE) === role &&
        (
          includePlaceholder ||
          child.getAttribute('data-tdpc-v1-placeholder') !== 'true'
        )
      ) {
        return child;
      }
    }

    return null;
  }

  function removeDirectPlaceholders(parent, role) {
    var children = parent ? parent.children : [];
    var child;
    var removeList = [];
    var i;

    for (i = 0; i < children.length; i += 1) {
      child = children[i];

      if (
        child.getAttribute(ROLE_ATTRIBUTE) === role &&
        child.getAttribute('data-tdpc-v1-placeholder') === 'true'
      ) {
        removeList.push(child);
      }
    }

    for (i = 0; i < removeList.length; i += 1) {
      if (removeList[i].parentNode) {
        removeList[i].parentNode.removeChild(removeList[i]);
      }
    }
  }

  function ensureModernTagSlot(details, title, role, position) {
    var realGroup;
    var placeholder;

    if (!details || !title) {
      return null;
    }

    realGroup = findDirectRoleChild(details, role, false);

    if (realGroup) {
      removeDirectPlaceholders(details, role);
      return realGroup;
    }

    placeholder = findDirectRoleChild(details, role, true);

    if (placeholder) {
      return placeholder;
    }

    placeholder = document.createElement('div');
    placeholder.setAttribute(ROLE_ATTRIBUTE, role);
    placeholder.setAttribute(INJECTED_ATTRIBUTE, 'true');
    placeholder.setAttribute('data-tdpc-v1-placeholder', 'true');
    placeholder.setAttribute('aria-hidden', 'true');

    if (position === 'before') {
      details.insertBefore(placeholder, title);
    } else if (title.nextSibling) {
      details.insertBefore(placeholder, title.nextSibling);
    } else {
      details.appendChild(placeholder);
    }

    return placeholder;
  }

  function ensureModernTagSlots(details, title, dataset) {
    var behavior = dataset.behavior || {};

    if (behavior.reserveEmptyTagSlots === false) {
      removeDirectPlaceholders(details, 'rank-tags');
      removeDirectPlaceholders(details, 'feature-tags');
      return;
    }

    ensureModernTagSlot(
      details,
      title,
      'rank-tags',
      'before'
    );

    ensureModernTagSlot(
      details,
      title,
      'feature-tags',
      'after'
    );
  }

  function processModernCard(card, dataset) {
    var selectors = dataset.selectors.modern || {};
    var wrapper;
    var media;
    var frame;
    var productImage;
    var productBadge;
    var title;
    var details;
    var content;
    var salePrice;
    var originalPrice;
    var prices;
    var footer;
    var favoriteButton;
    var cartButton;
    var actions;
    var favoriteWrapper;
    var cartWrapper;
    var productName;

    title = card.querySelector(selectors.productTitle);
    favoriteButton = card.querySelector(
      selectors.favoriteButton
    );
    cartButton = card.querySelector(selectors.cartButton);
    media = card.querySelector(selectors.mediaContainer);

    if (!title || !favoriteButton || !cartButton || !media) {
      return false;
    }

    wrapper = card.querySelector(selectors.wrapper) ||
      card.firstElementChild;
    frame = card.querySelector(selectors.imageFrame);
    productImage = card.querySelector(selectors.productImage);
    productBadge = card.querySelector(
      selectors.productBadgeImage
    );
    salePrice = card.querySelector(selectors.salePrice);
    originalPrice = card.querySelector(
      selectors.originalPrice
    );

    details = title.parentElement;
    content = details ? details.parentElement : null;
    prices = salePrice
      ? salePrice.parentElement
      : (
        originalPrice
          ? originalPrice.parentElement
          : null
      );
    footer = prices ? prices.parentElement : null;
    actions = cartButton.parentElement
      ? cartButton.parentElement.parentElement
      : null;
    favoriteWrapper = favoriteButton.parentElement;
    cartWrapper = cartButton.parentElement;

    card.setAttribute(
      'data-tdpc-v1-card-type',
      'modern'
    );
    card.setAttribute('data-tdpc-v1-version', VERSION);

    setRole(card, 'card');
    setRole(wrapper, 'wrapper');
    setRole(media, 'media');
    setRole(frame, 'image-frame');
    setRole(productImage, 'product-image');
    setRole(productBadge, 'product-badge');
    setRole(content, 'content');
    setRole(details, 'details');
    setRole(title, 'title');
    setRole(footer, 'footer');
    setRole(prices, 'prices');
    setRole(originalPrice, 'original-price');
    setRole(salePrice, 'sale-price');
    setRole(actions, 'actions');
    setRole(favoriteWrapper, 'favorite-wrapper');
    setRole(cartWrapper, 'cart-wrapper');
    setRole(favoriteButton, 'favorite-button');
    setRole(cartButton, 'cart-button');

    productName = trimText(
      title.textContent ||
      (
        productImage
          ? productImage.alt
          : ''
      )
    );

    card.setAttribute(
      'data-tdpc-v1-product-name',
      productName
    );

    cartButton.setAttribute(
      'data-tdpc-v1-cart-label',
      (
        dataset.text &&
        dataset.text.purchaseButtonText
      ) || '立即購買'
    );

    markModernOriginalTagGroups(details, title);
    updateProductTagRow(
      card,
      details,
      title,
      productName,
      dataset
    );
    updateCornerLabel(
      card,
      media,
      productName,
      dataset
    );
    updateFavoriteState(favoriteButton);

    return true;
  }

  function processLegacyCard(card, dataset) {
    var selectors = dataset.selectors.legacy || {};
    var media;
    var productImage;
    var productBadge;
    var title;
    var featureTagGroup;
    var featureTag;
    var priceBlock;
    var salePrice;
    var salePriceContainer;
    var originalPrice;
    var productName;

    media = card.querySelector(selectors.mediaContainer);
    title = card.querySelector(selectors.productTitle);
    priceBlock = card.querySelector(selectors.priceBlock);

    if (!media || !title || !priceBlock) {
      return false;
    }

    productImage = card.querySelector(selectors.productImage);
    productBadge = card.querySelector(
      selectors.productBadgeImage
    );
    featureTagGroup = card.querySelector(
      selectors.featureTagGroup
    );
    featureTag = card.querySelector(selectors.featureTag);
    salePrice = card.querySelector(selectors.salePrice);
    salePriceContainer = selectors.salePriceContainer
      ? card.querySelector(selectors.salePriceContainer)
      : null;
    if (!salePriceContainer && salePrice) {
      salePriceContainer = salePrice.parentElement;
    }
    originalPrice = card.querySelector(
      selectors.originalPrice
    );

    card.setAttribute(
      'data-tdpc-v1-card-type',
      'legacy'
    );
    card.setAttribute('data-tdpc-v1-version', VERSION);
    applyLegacyLayoutVariables(card, dataset);

    setRole(card, 'card');
    setRole(media, 'media');
    setRole(productImage, 'product-image');
    setRole(productBadge, 'product-badge');
    setRole(title, 'legacy-title');
    setRole(
      featureTagGroup,
      'original-tag-group'
    );
    setRole(featureTag, 'original-tag');
    setRole(priceBlock, 'legacy-prices');
    setRole(
      salePriceContainer,
      'legacy-sale-price-container'
    );
    setRole(salePrice, 'legacy-sale-price');
    setRole(originalPrice, 'legacy-original-price');

    productName = trimText(
      title.textContent ||
      card.getAttribute('data-product-name') ||
      (
        productImage
          ? productImage.alt
          : ''
      )
    );

    card.setAttribute(
      'data-tdpc-v1-product-name',
      productName
    );

    updateProductTagRow(
      card,
      title.parentElement,
      title,
      productName,
      dataset
    );

    updateCornerLabel(
      card,
      media,
      productName,
      dataset
    );

    return true;
  }

  function collectCards(selector) {
    if (!selector) {
      return [];
    }

    return document.querySelectorAll(selector);
  }

  function disconnectObserver() {
    if (state.observer) {
      state.observer.disconnect();
    }
  }

  function scheduleApply(delay) {
    if (state.timer) {
      window.clearTimeout(state.timer);
    }

    state.timer = window.setTimeout(function () {
      state.timer = null;
      apply();
    }, Number(delay || 0));
  }

  function connectObserver(dataset) {
    var debounce = Number(
      dataset.behavior &&
      dataset.behavior.mutationDebounceMilliseconds ||
      100
    );

    if (!window.MutationObserver) {
      return;
    }

    if (!state.observer) {
      state.observer = new MutationObserver(
        function (mutations) {
          var mutation;
          var shouldApply = false;
          var i;

          for (i = 0; i < mutations.length; i += 1) {
            mutation = mutations[i];

            if (
              mutation.type === 'childList' &&
              (
                mutation.addedNodes.length ||
                mutation.removedNodes.length
              )
            ) {
              shouldApply = true;
              break;
            }
          }

          if (shouldApply) {
            scheduleApply(debounce);
          }
        }
      );
    }

    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function trackReady(modernCount, legacyCount) {
    if (
      state.readyTracked ||
      (!modernCount && !legacyCount)
    ) {
      return;
    }

    state.readyTracked = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'td_all_pages_product_card_ready',
      td_all_pages_product_card_version: VERSION,
      td_all_pages_product_card_modern_count: modernCount,
      td_all_pages_product_card_legacy_count: legacyCount
    });
  }

  function apply() {
    var dataset = getDataset();
    var selectors;
    var modernCards;
    var legacyCards;
    var modernCount = 0;
    var legacyCount = 0;
    var i;

    if (!dataset || state.isApplying) {
      return false;
    }

    selectors = dataset.selectors || {};
    state.isApplying = true;
    disconnectObserver();

    try {
      modernCards = collectCards(
        selectors.modern &&
        selectors.modern.card
      );

      for (i = 0; i < modernCards.length; i += 1) {
        if (processModernCard(modernCards[i], dataset)) {
          modernCount += 1;
        }
      }

      legacyCards = collectCards(
        selectors.legacy &&
        selectors.legacy.card
      );

      for (i = 0; i < legacyCards.length; i += 1) {
        if (processLegacyCard(legacyCards[i], dataset)) {
          legacyCount += 1;
        }
      }

      trackReady(modernCount, legacyCount);
    } finally {
      state.isApplying = false;
      connectObserver(dataset);
    }

    return modernCount + legacyCount > 0;
  }

  function handleClick(event) {
    var dataset = getDataset();
    var selector;
    var favoriteButton;
    var delays;
    var i;

    if (
      !dataset ||
      !event.target ||
      !event.target.closest
    ) {
      return;
    }

    selector = dataset.selectors.modern &&
      dataset.selectors.modern.favoriteButton;

    if (!selector) {
      return;
    }

    favoriteButton = event.target.closest(selector);

    if (!favoriteButton) {
      return;
    }

    delays = (
      dataset.behavior &&
      dataset.behavior
        .favoriteStateRefreshDelaysMilliseconds
    ) || [0, 120, 320];

    for (i = 0; i < delays.length; i += 1) {
      (function (delay) {
        window.setTimeout(function () {
          updateFavoriteState(favoriteButton);
        }, Number(delay || 0));
      }(delays[i]));
    }
  }

  function bindEvents() {
    if (state.clickBound) {
      return;
    }

    document.addEventListener(
      'click',
      handleClick,
      true
    );
    state.clickBound = true;
  }

  function removeEnhancement(root) {
    var injected = root.querySelectorAll(
      '[' + INJECTED_ATTRIBUTE + '="true"]'
    );
    var marked = root.querySelectorAll(
      '[' + ROLE_ATTRIBUTE + '],' +
      '[data-tdpc-v1-card-type],' +
      '[data-tdpc-v1-version],' +
      '[data-tdpc-v1-product-name],' +
      '[data-tdpc-v1-corner-rule-id],' +
      '[data-tdpc-v1-product-tag-rule-id],' +
      '[data-tdpc-v1-tag-signature],' +
      '[data-tdpc-v1-cart-label],' +
      '[data-tdpc-v1-favorite-state]'
    );
    var i;

    for (i = injected.length - 1; i >= 0; i -= 1) {
      if (injected[i].parentNode) {
        injected[i].parentNode.removeChild(injected[i]);
      }
    }

    for (i = 0; i < marked.length; i += 1) {
      marked[i].removeAttribute(ROLE_ATTRIBUTE);
      marked[i].removeAttribute(
        'data-tdpc-v1-card-type'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-version'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-product-name'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-corner-rule-id'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-product-tag-rule-id'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-tag-signature'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-cart-label'
      );
      marked[i].removeAttribute(
        'data-tdpc-v1-favorite-state'
      );
    }
  }

  function destroy() {
    disconnectObserver();

    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }

    if (state.startupTimer) {
      window.clearInterval(state.startupTimer);
      state.startupTimer = null;
    }

    if (state.clickBound) {
      document.removeEventListener(
        'click',
        handleClick,
        true
      );
      state.clickBound = false;
    }

    removeEnhancement(document);
    state.readyTracked = false;
  }

  function startup() {
    var maximumAttempts = 120;
    var retryInterval = 100;
    var dataset = getDataset();

    if (dataset) {
      bindEvents();
      apply();
      return;
    }

    if (!state.startupTimer) {
      state.startupTimer = window.setInterval(
        function () {
          var currentDataset = getDataset();

          state.startupAttempts += 1;

          if (currentDataset) {
            window.clearInterval(
              state.startupTimer
            );
            state.startupTimer = null;
            bindEvents();
            apply();
            return;
          }

          if (
            state.startupAttempts >=
            maximumAttempts
          ) {
            window.clearInterval(
              state.startupTimer
            );
            state.startupTimer = null;
          }
        },
        retryInterval
      );
    }
  }

  window.TDFigmaAllPagesProductCard = {
    version: VERSION,
    apply: apply,
    retry: function () {
      scheduleApply(0);
    },
    destroy: destroy
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      startup,
      false
    );
  } else {
    startup();
  }

  window.addEventListener(
    'load',
    function () {
      scheduleApply(0);
    },
    false
  );
}());
