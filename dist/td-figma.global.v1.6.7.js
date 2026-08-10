/* TD_Figma_All_Pages_Core_Style_GTM_v1.8.1.html */
(function(){window.TDFigmaStyleReady=window.TDFigmaStyleReady||{};window.TDFigmaStyleReady.allPages="1.8.0";}());

/* TD_Figma_All_Pages_ProductCard_Style_GTM_v1.0.5.html */
(function () {
  window.TDFigmaStyleReady = window.TDFigmaStyleReady || {};
  window.TDFigmaStyleReady.allPagesProductCard = '1.0.2';
}());

/* TD_Figma_All_Pages_Core_Utility_GTM_v1.3.0.html */
(function () {
  'use strict';

  if (window.TDFigmaCore && window.TDFigmaCore.version === '1.3.0') {
    if (window.TDFigmaCore.jobs) {
      window.TDFigmaCore.jobs.flush();
    }
    return;
  }

  var VERSION = '1.3.0';
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

  function createDesktopHeaderPortal() {
    var ROOT_ID = 'tdfh-v1-desktop-portal-root';
    var BACKGROUND_ID = 'tdfh-v1-desktop-background';
    var ACTIVE_CLASS = 'tdfh-v1-desktop-header-active';
    var HEADER_ATTRIBUTE = 'data-tdfh-v1-native-header';
    var entries = {};
    var root = null;
    var background = null;
    var backgroundEntry = null;
    var syncFrame = null;
    var listenersBound = false;
    var enabled = true;

    function ensureBackground() {
      if (background && document.documentElement.contains(background)) {
        return background;
      }
      background = document.getElementById(BACKGROUND_ID);
      if (!background && document.body) {
        background = document.createElement('div');
        background.id = BACKGROUND_ID;
        background.setAttribute('aria-hidden', 'true');
        document.body.appendChild(background);
      }
      return background;
    }

    function ensureRoot() {
      if (root && document.documentElement.contains(root)) {
        return root;
      }
      root = document.getElementById(ROOT_ID);
      if (!root && document.body) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        root.setAttribute('aria-hidden', 'false');
        document.body.appendChild(root);
      }
      ensureBackground();
      bindListeners();
      return root;
    }

    function getSlot(name) {
      var host = ensureRoot();
      var slot;
      if (!host) { return null; }
      slot = host.querySelector('[data-tdfh-v1-slot="' + name + '"]');
      if (!slot) {
        slot = document.createElement('div');
        slot.setAttribute('data-tdfh-v1-slot', name);
        host.appendChild(slot);
      }
      return slot;
    }

    function nativeAttribute(name) {
      return 'data-tdfh-v1-native-' + name;
    }

    function hideNative(entry) {
      if (entry && entry.anchor) {
        entry.anchor.setAttribute(entry.nativeAttribute, 'hidden');
      }
    }

    function showNative(entry) {
      if (entry && entry.anchor) {
        entry.anchor.removeAttribute(entry.nativeAttribute);
      }
    }

    function activateBackgroundNative() {
      if (backgroundEntry && backgroundEntry.anchor) {
        backgroundEntry.anchor.setAttribute(HEADER_ATTRIBUTE, 'interactive');
      }
    }

    function deactivateBackgroundNative() {
      if (backgroundEntry && backgroundEntry.anchor) {
        backgroundEntry.anchor.removeAttribute(HEADER_ATTRIBUTE);
      }
    }

    function normalizeRect(rect) {
      if (!rect) { return null; }
      return {
        top: Number(rect.top) || 0,
        left: Number(rect.left) || 0,
        width: Math.max(0, Number(rect.width) || 0),
        height: Math.max(0, Number(rect.height) || 0),
        right: Number(rect.right) || ((Number(rect.left) || 0) + (Number(rect.width) || 0)),
        bottom: Number(rect.bottom) || ((Number(rect.top) || 0) + (Number(rect.height) || 0))
      };
    }

    function resolveRect(entry) {
      var rect;
      if (!entry || !entry.anchor || !document.documentElement.contains(entry.anchor)) {
        return null;
      }
      if (entry.options && typeof entry.options.resolveRect === 'function') {
        rect = entry.options.resolveRect(entry.anchor, entry.element, entry.slot);
      }
      if (!rect) { rect = entry.anchor.getBoundingClientRect(); }
      return normalizeRect(rect);
    }

    function resolveBackgroundRect() {
      var rect;
      if (!backgroundEntry || !backgroundEntry.anchor ||
          !document.documentElement.contains(backgroundEntry.anchor)) {
        return null;
      }
      if (backgroundEntry.options &&
          typeof backgroundEntry.options.resolveRect === 'function') {
        rect = backgroundEntry.options.resolveRect(
          backgroundEntry.anchor,
          background
        );
      }
      if (!rect) { rect = backgroundEntry.anchor.getBoundingClientRect(); }
      return normalizeRect(rect);
    }

    function applyRect(entry, rect) {
      var slot = entry.slot;
      if (!slot || !rect || rect.width < 1 || rect.height < 1) {
        if (slot) { slot.style.display = 'none'; }
        return;
      }
      slot.style.display = 'block';
      slot.style.top = Math.round(rect.top) + 'px';
      slot.style.left = Math.round(rect.left) + 'px';
      slot.style.width = Math.round(rect.width) + 'px';
      slot.style.height = Math.round(rect.height) + 'px';
      if (entry.options && typeof entry.options.onSync === 'function') {
        entry.options.onSync(entry.element, rect, entry.anchor, slot);
      }
    }

    function applyBackgroundRect(rect) {
      var layer = ensureBackground();
      if (!layer || !rect || rect.width < 1 || rect.height < 1) {
        if (layer) { layer.style.display = 'none'; }
        return;
      }
      layer.style.display = 'block';
      layer.style.top = Math.round(rect.top) + 'px';
      layer.style.left = Math.round(rect.left) + 'px';
      layer.style.width = Math.round(rect.width) + 'px';
      layer.style.height = Math.round(rect.height) + 'px';
      if (backgroundEntry && backgroundEntry.options &&
          typeof backgroundEntry.options.onSync === 'function') {
        backgroundEntry.options.onSync(layer, rect, backgroundEntry.anchor);
      }
    }

    function hideLayers() {
      var name;
      if (root) { root.style.display = 'none'; }
      if (background) { background.style.display = 'none'; }
      for (name in entries) {
        if (Object.prototype.hasOwnProperty.call(entries, name) && entries[name].slot) {
          entries[name].slot.style.display = 'none';
        }
      }
    }

    function sync() {
      var name;
      var entry;
      var host;
      if (!enabled) {
        hideLayers();
        return;
      }
      host = ensureRoot();
      if (!host) { return; }
      host.style.display = 'block';
      applyBackgroundRect(resolveBackgroundRect());
      for (name in entries) {
        if (!Object.prototype.hasOwnProperty.call(entries, name)) { continue; }
        entry = entries[name];
        applyRect(entry, resolveRect(entry));
      }
    }

    function scheduleSync() {
      if (syncFrame) { return; }
      syncFrame = window.requestAnimationFrame(function () {
        syncFrame = null;
        sync();
      });
    }

    function bindListeners() {
      if (listenersBound) { return; }
      listenersBound = true;
      window.addEventListener('resize', scheduleSync, false);
      window.addEventListener('orientationchange', scheduleSync, false);
      window.addEventListener('scroll', scheduleSync, true);
      window.addEventListener('pageshow', scheduleSync, false);
      window.addEventListener('popstate', scheduleSync, false);
    }

    function unbindListeners() {
      if (!listenersBound) { return; }
      listenersBound = false;
      window.removeEventListener('resize', scheduleSync, false);
      window.removeEventListener('orientationchange', scheduleSync, false);
      window.removeEventListener('scroll', scheduleSync, true);
      window.removeEventListener('pageshow', scheduleSync, false);
      window.removeEventListener('popstate', scheduleSync, false);
    }

    function applyEnabledState() {
      var name;
      if (!document.body) { return; }
      if (enabled) {
        document.body.classList.add(ACTIVE_CLASS);
        activateBackgroundNative();
        for (name in entries) {
          if (Object.prototype.hasOwnProperty.call(entries, name)) {
            hideNative(entries[name]);
          }
        }
        scheduleSync();
      } else {
        document.body.classList.remove(ACTIVE_CLASS);
        deactivateBackgroundNative();
        for (name in entries) {
          if (Object.prototype.hasOwnProperty.call(entries, name)) {
            showNative(entries[name]);
          }
        }
        hideLayers();
      }
    }

    function setEnabled(value) {
      var next = value !== false;
      if (enabled === next) {
        if (enabled) { scheduleSync(); }
        return enabled;
      }
      enabled = next;
      applyEnabledState();
      return enabled;
    }

    function mountBackground(anchor, options) {
      if (!anchor || !document.body) { return false; }
      if (backgroundEntry && backgroundEntry.anchor !== anchor) {
        deactivateBackgroundNative();
      }
      backgroundEntry = { anchor: anchor, options: options || {} };
      ensureBackground();
      applyEnabledState();
      return true;
    }

    function unmountBackground() {
      deactivateBackgroundNative();
      backgroundEntry = null;
      if (background) { background.style.display = 'none'; }
      if (document.body) { document.body.classList.remove(ACTIVE_CLASS); }
    }

    function mount(name, element, anchor, options) {
      var slot;
      var entry;
      if (!name || !element || !anchor) { return false; }
      slot = getSlot(name);
      if (!slot) { return false; }
      entry = entries[name];
      if (entry && entry.anchor !== anchor) { showNative(entry); }
      if (element.parentNode !== slot) { slot.appendChild(element); }
      entry = {
        name: name,
        element: element,
        anchor: anchor,
        slot: slot,
        nativeAttribute: nativeAttribute(name),
        options: options || {}
      };
      entries[name] = entry;
      slot.setAttribute('data-tdfh-v1-mounted', 'true');
      if (enabled) { hideNative(entry); } else { showNative(entry); }
      scheduleSync();
      return true;
    }

    function unmount(name, removeElement) {
      var entry = entries[name];
      if (!entry) { return false; }
      showNative(entry);
      if (removeElement && entry.element && entry.element.parentNode) {
        entry.element.parentNode.removeChild(entry.element);
      }
      if (entry.slot && entry.slot.parentNode) {
        entry.slot.parentNode.removeChild(entry.slot);
      }
      delete entries[name];
      return true;
    }

    function destroy() {
      var name;
      for (name in entries) {
        if (Object.prototype.hasOwnProperty.call(entries, name)) {
          showNative(entries[name]);
        }
      }
      entries = {};
      deactivateBackgroundNative();
      backgroundEntry = null;
      if (syncFrame) {
        window.cancelAnimationFrame(syncFrame);
        syncFrame = null;
      }
      unbindListeners();
      if (background && background.parentNode) {
        background.parentNode.removeChild(background);
      }
      if (root && root.parentNode) { root.parentNode.removeChild(root); }
      if (document.body) { document.body.classList.remove(ACTIVE_CLASS); }
      background = null;
      root = null;
    }

    return {
      version: '1.3.0',
      mount: mount,
      unmount: unmount,
      mountBackground: mountBackground,
      unmountBackground: unmountBackground,
      setEnabled: setEnabled,
      isEnabled: function () { return enabled; },
      sync: sync,
      scheduleSync: scheduleSync,
      getRoot: ensureRoot,
      getSlot: getSlot,
      getBackground: ensureBackground,
      destroy: destroy
    };
  }

  if (
    window.TDFigmaDesktopHeaderPortal &&
    typeof window.TDFigmaDesktopHeaderPortal
      .destroy === 'function'
  ) {
    window.TDFigmaDesktopHeaderPortal
      .destroy();
  }

  window.TDFigmaDesktopHeaderPortal =
    createDesktopHeaderPortal();

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
    },
    desktopHeaderPortal: window.TDFigmaDesktopHeaderPortal
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'td_figma_core_ready',
    td_figma_core_version: VERSION
  });

  flushJobs();
}());

/* TD_Figma_All_Pages_Navigation_GTM_v5.2.0.html */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-navigation-v520',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.allPages && window.TDFigmaData.allPages.navigation && window.TDFigmaDesktopHeaderPortal);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var DesktopPortal = window.TDFigmaDesktopHeaderPortal;
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
var VERSION = '5.2.0';
var LOAD_ATTR = 'data-tdfn-v1-loaded';
if (document.documentElement.getAttribute(LOAD_ATTR) === VERSION) {
return;
}
document.documentElement.setAttribute(LOAD_ATTR, VERSION);
var STYLE_ID = 'tdfn-v1-style-v180';
var PORTAL_ID = 'tdfn-v1-desktop-portal';
var MOBILE_PORTAL_ID = 'tdfn-v1-mobile-portal';
var MOBILE_LOGO_URL = 'https://i.imgur.com/URvr7w5.png';
var MOBILE_LOGO_HREF = 'https://www.bioderma-naos.com.tw/';
var DESKTOP_SELECTOR = '.nav-menu-ul';
var DESKTOP_NAV_SLOT = 'navigation';
var DESKTOP_LOGO_SLOT = 'logo';
var BREAKPOINT = 992;
var DESKTOP_LOGO_WIDTH = 135;
var DESKTOP_NAV_WIDTH = 800;
var state = {
desktopRoot: null,
desktopSource: null,
desktopLogoRoot: null,
desktopLogoAnchor: null,
desktopHeaderAnchor: null,
mobileRoot: null,
mobilePortal: null,
mobileTrigger: null,
nativeMenuButton: null,
mobileMenuOpen: false,
mobilePreviousFocus: null,
mountRetryTimer: null,
mountRetryCount: 0,
layoutMode: '',
modeRetryTimers: [],
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
}
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
return '<i class="ico ico-chevron-down tdfn-v1-d-chevron" aria-hidden="true"></i>';
}
function chevronRight() {
return '<i class="ico ico-chevron-right tdfn-v1-m-right" aria-hidden="true"></i>';
}
function backArrow() {
return '<i class="ico ico-chevron-left" aria-hidden="true"></i>';
}
function smallArrow(direction) {
var iconClass = direction === 'prev' ?
'ico-chevron-left' :
'ico-chevron-right';
return '<i class="ico ' +
iconClass +
' tdfn-v1-m-carousel-icon" aria-hidden="true"></i>';
}
function socialIcons() {
var icons = {
facebook: 'ico-facebook',
instagram: 'ico-instagram',
line: 'ico-line'
};
var html = [];
var iconClass;
var i;
var item;
for (i = 0; i < DATA.social.length; i += 1) {
item = DATA.social[i];
iconClass = icons[item.id] || '';
html.push(
'<a class="tdfn-v1-social-link" href="' +
escapeHtml(getItemHref(item)) +
'" data-tdfn-link data-menu="social" data-label="' +
escapeHtml(item.label) +
'" aria-label="' +
escapeHtml(item.label) +
'">' +
(
iconClass ?
'<i class="ico ' +
iconClass +
'" aria-hidden="true"></i>' :
''
) +
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
function findDesktopLogoAnchor() {
var candidates = document.querySelectorAll('.logo-container');
var candidate;
var best = null;
var bestScore = -1;
var rect;
var score;
var i;
for (i = 0; i < candidates.length; i += 1) {
candidate = candidates[i];
if (!closest(candidate, 'header.headerA,#officialHeader', null)) {
continue;
}
rect = candidate.getBoundingClientRect();
score = rect.width * rect.height;
if (rect.width > 0 && rect.height > 0) {
score += 100000;
}
if (score > bestScore) {
best = candidate;
bestScore = score;
}
}
return best;
}
function findDesktopHeaderAnchor() {
var selectors = [
'header.headerA > .headerA__top.headerA__top--fix',
'header.headerA > .headerA__top',
'#officialHeader > #layout-header-fix',
'#officialHeader > .layout-header',
'#layout-header-fix',
'#officialHeader'
];
var anchor;
var rect;
var i;

for (i = 0; i < selectors.length; i += 1) {
anchor = document.querySelector(
selectors[i]
);

if (!anchor) {
continue;
}

rect = anchor.getBoundingClientRect();

if (
rect.width > 0 &&
rect.height > 0
) {
return anchor;
}
}

return null;
}
function ensureDesktopHeaderLayers() {
var anchor =
findDesktopHeaderAnchor();

if (
!anchor ||
!DesktopPortal ||
typeof DesktopPortal.mountBackground !==
'function'
) {
return false;
}

state.desktopHeaderAnchor = anchor;

DesktopPortal.mountBackground(
anchor,
{
resolveRect: function (
nativeHeader
) {
var rect =
nativeHeader.getBoundingClientRect();

return {
top: rect.top,
left: rect.left,
width: rect.width,
height: rect.height,
right: rect.right,
bottom: rect.bottom
};
}
}
);

return true;
}
function ensureDesktopLogoPortal() {
var anchor = findDesktopLogoAnchor();
var root = state.desktopLogoRoot;
var image;
if (!anchor || !CONFIG.logo || !DesktopPortal) {
return false;
}
if (!root || !document.documentElement.contains(root)) {
root = document.createElement('a');
root.className = 'tdfh-v1-desktop-logo-link';
root.href = 'https://www.bioderma-naos.com.tw/';
root.setAttribute('aria-label', '前往貝膚黛瑪首頁');
root.innerHTML = '<img class="tdfh-v1-desktop-logo-image" alt="BIODERMA 貝膚黛瑪">';
state.desktopLogoRoot = root;
}
image = root.querySelector('img');
if (image && image.getAttribute('src') !== CONFIG.logo) {
image.setAttribute('src', CONFIG.logo);
}
state.desktopLogoAnchor = anchor;
DesktopPortal.mount(
DESKTOP_LOGO_SLOT,
root,
anchor,
{
resolveRect: function (nativeAnchor) {
var rect = nativeAnchor.getBoundingClientRect();
return {
top: rect.top,
left: rect.left,
width: DESKTOP_LOGO_WIDTH,
height: rect.height,
right: rect.left + DESKTOP_LOGO_WIDTH,
bottom: rect.bottom
};
}
}
);
return true;
}
function syncHeaderVisuals() {
syncHeaderIcons();
}
function syncDesktopGeometry() {
if (DesktopPortal) {
DesktopPortal.scheduleSync();
}
}
function mountDesktop(source) {
var root = state.desktopRoot;
if (!source || !DesktopPortal) {
return false;
}
if (!root || !document.documentElement.contains(root)) {
root = document.createElement('ul');
root.className = 'tdfn-v1-desktop-root';
root.setAttribute('data-tdfn-v1', 'desktop');
root.setAttribute('data-tdfn-version', VERSION);
root.setAttribute('aria-label', '全站導覽');
root.innerHTML = renderDesktopRoot();
bindDesktop(root);
state.desktopRoot = root;
}
state.desktopSource = source;
DesktopPortal.mount(
DESKTOP_NAV_SLOT,
root,
source,
{
resolveRect: function (nativeAnchor) {
var rect = nativeAnchor.getBoundingClientRect();
return {
top: rect.top,
left: rect.left,
width: DESKTOP_NAV_WIDTH,
height: rect.height,
right: rect.left + DESKTOP_NAV_WIDTH,
bottom: rect.bottom
};
}
}
);
syncDesktopGeometry();
return true;
}
function isVisibleElement(element) {
var rect;
var computed;
if (!element || !document.documentElement.contains(element)) {
return false;
}
rect = element.getBoundingClientRect();
if (rect.width < 1 || rect.height < 1) {
return false;
}
if (window.getComputedStyle) {
computed = window.getComputedStyle(element);
if (
computed.display === 'none' ||
computed.visibility === 'hidden'
) {
return false;
}
}
return true;
}
function findNativeMenuButton() {
var buttons = document.querySelectorAll(
'.main-menu-btn:not([data-tdfn-v1-menu-trigger])'
);
var i;
for (i = 0; i < buttons.length; i += 1) {
if (isVisibleElement(buttons[i])) {
return buttons[i];
}
}
return null;
}
function isMobileLayout() {
if (window.innerWidth >= BREAKPOINT) {
return false;
}
if (isVisibleElement(state.mobileTrigger)) {
return true;
}
return !!findNativeMenuButton();
}
function setLayoutMode(mode) {
var mobile = mode === 'mobile';
state.layoutMode = mode;
if (document.body) {
document.body.classList.toggle(
'tdfn-v1-mobile-layout',
mobile
);
}
if (
DesktopPortal &&
typeof DesktopPortal.setEnabled === 'function'
) {
DesktopPortal.setEnabled(!mobile);
}
if (mobile) {
closeDesktop(true);
} else {
closeMobileMenu(true);
}
}
function clearModeRetryTimers() {
var i;
for (i = 0; i < state.modeRetryTimers.length; i += 1) {
window.clearTimeout(state.modeRetryTimers[i]);
}
state.modeRetryTimers = [];
}
function scheduleModeRetries() {
var delays = [80, 200, 450, 800];
var i;
clearModeRetryTimers();
for (i = 0; i < delays.length; i += 1) {
state.modeRetryTimers.push(
window.setTimeout(mountAll, delays[i])
);
}
}
function ensureMobileTrigger() {
var nativeButton;
var trigger;
if (
state.mobileTrigger &&
document.documentElement.contains(state.mobileTrigger) &&
state.nativeMenuButton &&
document.documentElement.contains(state.nativeMenuButton)
) {
return state.mobileTrigger;
}
nativeButton = findNativeMenuButton();
if (!nativeButton || !nativeButton.parentNode) {
return null;
}
if (
state.mobileTrigger &&
document.documentElement.contains(state.mobileTrigger) &&
state.nativeMenuButton === nativeButton
) {
return state.mobileTrigger;
}
if (
state.mobileTrigger &&
state.mobileTrigger.parentNode
) {
state.mobileTrigger.parentNode.removeChild(
state.mobileTrigger
);
}
if (
state.nativeMenuButton &&
state.nativeMenuButton !== nativeButton
) {
state.nativeMenuButton.removeAttribute(
'data-tdfn-v1-native-menu'
);
state.nativeMenuButton.removeAttribute('aria-hidden');
state.nativeMenuButton.removeAttribute('tabindex');
}
nativeButton.setAttribute(
'data-tdfn-v1-native-menu',
'hidden'
);
nativeButton.setAttribute('aria-hidden', 'true');
nativeButton.setAttribute('tabindex', '-1');
trigger = document.createElement('a');
trigger.className =
'main-menu-btn tdfn-v1-menu-trigger';
trigger.href = '#';
trigger.setAttribute(
'data-tdfn-v1-menu-trigger',
'true'
);
trigger.setAttribute('role', 'button');
trigger.setAttribute('aria-label', '開啟主選單');
trigger.setAttribute('aria-expanded', 'false');
trigger.setAttribute(
'aria-controls',
MOBILE_PORTAL_ID
);
trigger.innerHTML =
'<i class="ico ico-menu" aria-hidden="true"></i>';
trigger.addEventListener('click', function (event) {
event.preventDefault();
event.stopPropagation();
openMobileMenu();
}, false);
nativeButton.parentNode.insertBefore(
trigger,
nativeButton
);
state.nativeMenuButton = nativeButton;
state.mobileTrigger = trigger;
return trigger;
}
function ensureMobilePortal() {
var portal = document.getElementById(
MOBILE_PORTAL_ID
);
var root;
if (portal) {
state.mobilePortal = portal;
state.mobileRoot = portal.querySelector(
'[data-tdfn-v1="mobile"]'
);
return portal;
}
portal = document.createElement('div');
portal.id = MOBILE_PORTAL_ID;
portal.className = 'tdfn-v1-mobile-portal';
portal.setAttribute('aria-hidden', 'true');
portal.innerHTML =
'<button class="tdfn-v1-mobile-backdrop" ' +
'type="button" data-tdfn-mobile-close ' +
'aria-label="關閉主選單"></button>' +
'<aside class="tdfn-v1-mobile-drawer" ' +
'role="dialog" aria-modal="true" ' +
'aria-label="全站主選單">' +
'<header class="tdfn-v1-mobile-header">' +
'<a class="tdfn-v1-mobile-logo" href="' +
escapeHtml(MOBILE_LOGO_HREF) +
'" aria-label="前往貝膚黛瑪首頁">' +
'<img src="' +
escapeHtml(MOBILE_LOGO_URL) +
'" alt="BIODERMA 貝膚黛瑪">' +
'</a>' +
'<button class="tdfn-v1-mobile-close" ' +
'type="button" data-tdfn-mobile-close ' +
'aria-label="關閉主選單">' +
'<i class="ico ico-close" aria-hidden="true"></i>' +
'</button>' +
'</header>' +
'<div class="tdfn-v1-mobile-body">' +
'<div data-tdfn-v1="mobile" ' +
'data-tdfn-version="' +
escapeHtml(VERSION) +
'">' +
'<div class="tdfn-v1-m-stage">' +
renderMobileMain() +
'</div>' +
'</div>' +
'</div>' +
'</aside>';
document.body.appendChild(portal);
root = portal.querySelector(
'[data-tdfn-v1="mobile"]'
);
bindMobile(root);
portal.addEventListener('click', function (event) {
var close = closest(
event.target,
'[data-tdfn-mobile-close]',
portal
);
if (!close) {
return;
}
event.preventDefault();
closeMobileMenu();
}, false);
state.mobilePortal = portal;
state.mobileRoot = root;
return portal;
}
function resetMobileMenuPanel() {
var root = state.mobileRoot;
var main;
if (!root) {
return;
}
resetMobileCarouselDrag();
state.mobilePanelId = '';
root.innerHTML =
'<div class="tdfn-v1-m-stage">' +
renderMobileMain() +
'</div>';
main = root.querySelector(
'[data-tdfn-m-main]'
);
if (main) {
main.scrollTop = 0;
}
}
function openMobileMenu() {
var portal;
var trigger;
if (state.layoutMode !== 'mobile') {
return;
}
trigger = ensureMobileTrigger();
portal = ensureMobilePortal();
if (!trigger || !portal || state.mobileMenuOpen) {
return;
}
state.mobilePreviousFocus =
document.activeElement;
state.mobileMenuOpen = true;
portal.setAttribute('aria-hidden', 'false');
portal.offsetWidth;
portal.classList.add('is-open');
trigger.setAttribute('aria-expanded', 'true');
document.documentElement.classList.add(
'tdfn-v1-mobile-menu-open'
);
document.body.classList.add(
'tdfn-v1-mobile-menu-open'
);
}
function closeMobileMenu(silent) {
var portal = state.mobilePortal;
var trigger = state.mobileTrigger;
if (!state.mobileMenuOpen) {
return false;
}
state.mobileMenuOpen = false;
if (portal) {
portal.classList.remove('is-open');
portal.setAttribute('aria-hidden', 'true');
}
if (trigger) {
trigger.setAttribute('aria-expanded', 'false');
}
document.documentElement.classList.remove(
'tdfn-v1-mobile-menu-open'
);
document.body.classList.remove(
'tdfn-v1-mobile-menu-open'
);
window.setTimeout(resetMobileMenuPanel, 320);
if (
!silent &&
state.mobilePreviousFocus &&
typeof state.mobilePreviousFocus.focus === 'function'
) {
state.mobilePreviousFocus.focus();
}
state.mobilePreviousFocus = null;
return true;
}
function mountMobileMenu() {
ensureMobileTrigger();
ensureMobilePortal();
}
function findDesktopSource() {
var preferredSelectors = [
'.headerA__nav-menu-main > .nav-menu-ul',
'.layout-nav-menu.nav-main-menu > .nav-menu-ul'
];
var candidates;
var item;
var rect;
var score;
var best = null;
var bestScore = -1;
var i;
for (i = 0; i < preferredSelectors.length; i += 1) {
item = document.querySelector(preferredSelectors[i]);
if (item && item.getAttribute('data-tdfn-v1') !== 'desktop') {
return item;
}
}
candidates = document.querySelectorAll(DESKTOP_SELECTOR);
for (i = 0; i < candidates.length; i += 1) {
item = candidates[i];
if (
item.getAttribute('data-tdfn-v1') === 'desktop' ||
item.classList.contains('headerA__nav-menu-sub') ||
closest(item, '#tdfn-v1-mobile-portal,.slide-push-menu,.aside-section-container', null)
) {
continue;
}
score = 0;
if (closest(item, '.headerA__nav-menu-main,.layout-nav-menu.nav-main-menu', null)) {
score += 300;
}
rect = item.getBoundingClientRect();
if (rect.width >= 400 && rect.height > 0) {
score += 100;
}
score += item.children ? item.children.length : 0;
if (score > bestScore) {
best = item;
bestScore = score;
}
}
return best;
}
function mountAll() {
var mobile;
var desktop;
syncHeaderVisuals();
mobile = isMobileLayout();
setLayoutMode(
mobile ? 'mobile' : 'desktop'
);
if (mobile) {
mountMobileMenu();
return;
}
ensureDesktopHeaderLayers();
ensureDesktopLogoPortal();
desktop = findDesktopSource();
if (desktop) {
mountDesktop(desktop);
}
}
function bindGlobalEvents() {
window.addEventListener('mousemove', moveMobileCarouselDrag, false);
window.addEventListener('mouseup', endMobileCarouselDrag, false);
document.addEventListener('click', function (event) {
var link = closest(event.target, '[data-tdfn-link]', null);
if (!link) {
return;
}
if (isPlaceholderHref(link.getAttribute('href'))) {
event.preventDefault();
}
track('td_nav_link_click', {
td_nav_device: state.layoutMode === 'mobile' ? 'mobile' : 'desktop',
td_nav_menu: link.getAttribute('data-menu') || '',
td_nav_label: link.getAttribute('data-label') || '',
td_nav_href: link.getAttribute('href') || ''
});
if (
state.mobileMenuOpen &&
state.mobilePortal &&
state.mobilePortal.contains(link) &&
!isPlaceholderHref(link.getAttribute('href'))
) {
closeMobileMenu(true);
}
}, false);
document.addEventListener('keydown', function (event) {
if (event.key !== 'Escape' && event.keyCode !== 27) {
return;
}
if (state.mobileMenuOpen) {
if (!closeMobilePanel()) {
closeMobileMenu();
}
return;
}
closeDesktop(false);
});
window.addEventListener('resize', function () {
resetMobileCarouselDrag();
closeDesktop(true);
mountAll();
scheduleModeRetries();
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
function startMountRetries() {
function retry() {
state.mountRetryTimer = null;
state.mountRetryCount += 1;
mountAll();
if (state.mountRetryCount < 10) {
state.mountRetryTimer =
window.setTimeout(retry, 250);
}
}
state.mountRetryCount = 0;
retry();
}
function init() {
injectStyle();
bindPortalEvents();
bindGlobalEvents();
startMountRetries();
window.addEventListener('orientationchange', scheduleModeRetries);
window.addEventListener('pageshow', mountAll);
window.addEventListener('popstate', mountAll);
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

/* TD_Figma_All_Pages_Search_GTM_v3.1.0.html */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-search-v310',
    ready: function () {
      return !!(
        window.TDFigmaData &&
        window.TDFigmaData.allPages &&
        window.TDFigmaData.allPages.search &&
        window.TDFigmaDesktopHeaderPortal
      );
    },
    start: function () {
      (function () {
        'use strict';

        var Core = window.TDFigmaCore;
        var DesktopPortal = window.TDFigmaDesktopHeaderPortal;
        var SOURCE_DATA = window.TDFigmaData.allPages.search;
        var closest = Core.dom.closest;
        var escapeHtml = Core.text.escapeHtml;
        var VERSION = '3.1.0';
        var SLOT_NAME = 'search';
        var SEARCH_PATH = '/v2/Search';
        var SEARCH_ROW_HEIGHT = 32;
        var SEARCH_NAV_GAP = 6;
        var MOBILE_EXCLUDE_SELECTOR =
          '.nav-slide-push-container,' +
          '.aside-section-container,' +
          '#hsearch,' +
          '#tdfn-v1-mobile-portal';
        var HOT_KEYWORDS =
          (SOURCE_DATA.hotKeywords || []).map(
            function (item) {
              return {
                label: item.text || '',
                keyword: String(item.text || '')
                  .replace(/^#/, '')
              };
            }
          );
        var state = {
          root: null,
          anchor: null,
          variant: '',
          retryTimer: null,
          retryCount: 0,
          resizeTimer: null,
          mobileCloseTimer: null,
          nativeHotkeys: null
        };

        function injectStyle() {}

        function isDesktopCandidate(element) {
          return !!(
            element &&
            !closest(element, MOBILE_EXCLUDE_SELECTOR, null) &&
            closest(element, 'header.headerA,#officialHeader', null)
          );
        }

        function findDesktopAnchor() {
          var product = document.querySelectorAll('.search-box');
          var defaults = document.querySelectorAll('.nav-search-box');
          var i;
          for (i = 0; i < product.length; i += 1) {
            if (isDesktopCandidate(product[i])) {
              return {
                anchor: product[i],
                variant: 'product'
              };
            }
          }
          for (i = 0; i < defaults.length; i += 1) {
            if (isDesktopCandidate(defaults[i])) {
              return {
                anchor: defaults[i],
                variant: 'default'
              };
            }
          }
          return null;
        }

        function findDesktopNavigationAnchor() {
          var selectors = [
            '.headerA__nav-menu-main > .nav-menu-ul',
            '.layout-nav-menu.nav-main-menu > .nav-menu-ul'
          ];
          var candidates;
          var candidate;
          var rect;
          var i;

          for (i = 0; i < selectors.length; i += 1) {
            candidate = document.querySelector(selectors[i]);
            if (candidate) {
              rect = candidate.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                return candidate;
              }
            }
          }

          candidates = document.querySelectorAll('.nav-menu-ul');

          for (i = 0; i < candidates.length; i += 1) {
            candidate = candidates[i];

            if (
              closest(
                candidate,
                '#tdfn-v1-mobile-portal,.slide-push-menu,.aside-section-container',
                null
              )
            ) {
              continue;
            }

            rect = candidate.getBoundingClientRect();

            if (rect.width >= 400 && rect.height > 0) {
              return candidate;
            }
          }

          return null;
        }

        function findDesktopNavigationPortal() {
          var slot = document.querySelector(
            '#tdfh-v1-desktop-portal-root ' +
            '[data-tdfh-v1-slot="navigation"]'
          );
          var rect;

          if (!slot) {
            return null;
          }

          rect = slot.getBoundingClientRect();

          if (
            rect.width < 1 ||
            rect.height < 1 ||
            window.getComputedStyle(slot).display === 'none'
          ) {
            return null;
          }

          return slot;
        }

        function findNativeHotkeys(anchor) {
          var container;

          if (!anchor) {
            return null;
          }

          container = anchor.parentNode;

          if (!container || !container.querySelector) {
            return null;
          }

          return container.querySelector(
            '#tdfs-v1-search-hotkeys,[data-tdfs-v1-hotkeys="desktop"]'
          );
        }

        function syncNativeHotkeys(anchor) {
          var hotkeys = findNativeHotkeys(anchor);

          if (
            state.nativeHotkeys &&
            state.nativeHotkeys !== hotkeys
          ) {
            state.nativeHotkeys.removeAttribute(
              'data-tdfs-v3-native-hotkeys'
            );
          }

          state.nativeHotkeys = hotkeys;

          if (hotkeys) {
            hotkeys.setAttribute(
              'data-tdfs-v3-native-hotkeys',
              'hidden'
            );
          }
        }

        function restoreNativeHotkeys() {
          if (state.nativeHotkeys) {
            state.nativeHotkeys.removeAttribute(
              'data-tdfs-v3-native-hotkeys'
            );
          }
        }

        function isDesktopMode() {
          return !(
            DesktopPortal &&
            typeof DesktopPortal.isEnabled === 'function' &&
            !DesktopPortal.isEnabled()
          );
        }

        function searchUrl(keyword) {
          return SEARCH_PATH + '?q=' +
            encodeURIComponent(String(keyword || '').replace(/^\s+|\s+$/g, ''));
        }

        function renderHotkeys() {
          var html = [];
          var item;
          var i;
          for (i = 0; i < HOT_KEYWORDS.length; i += 1) {
            item = HOT_KEYWORDS[i];
            html.push(
              '<a href="' +
              escapeHtml(searchUrl(item.keyword)) +
              '" data-tdfs-v3-hotkey="' +
              escapeHtml(item.keyword) +
              '">' +
              escapeHtml(item.label) +
              '</a>'
            );
          }
          return html.join('');
        }

        function createRoot() {
          var root = document.createElement('div');
          root.className = 'tdfs-v3-desktop-root';
          root.setAttribute('data-tdfs-v3-version', VERSION);
          root.innerHTML =
            '<form class="tdfs-v3-search-form" role="search">' +
            '<div class="tdfs-v3-search-wrapper">' +
            '<input class="tdfs-v3-search-input" type="search" ' +
            'name="q" autocomplete="off" placeholder="搜尋商品" ' +
            'aria-label="搜尋商品">' +
            '<button class="tdfs-v3-search-button" type="submit" ' +
            'aria-label="搜尋">' +
            '<i class="ico ico-search" aria-hidden="true"></i>' +
            '</button>' +
            '</div>' +
            '</form>' +
            '<nav class="tdfs-v3-hotkeys" aria-label="熱門搜尋">' +
            renderHotkeys() +
            '</nav>';
          bindRoot(root);
          return root;
        }

        function track(eventName, data) {
          Core.events.push(
            eventName,
            data,
            'td_search_version',
            VERSION
          );
        }

        function bindRoot(root) {
          var form = root.querySelector('form');
          var hotkeys = root.querySelector('.tdfs-v3-hotkeys');
          form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.replace(/^\s+|\s+$/g, '') : '';
            event.preventDefault();
            if (!keyword) {
              if (input) {
                input.focus();
              }
              return;
            }
            track('td_search_submit', {
              td_search_device: 'desktop',
              td_search_keyword: keyword
            });
            window.location.assign(searchUrl(keyword));
          }, false);
          root.addEventListener('click', function (event) {
            var hotkey = closest(event.target, '[data-tdfs-v3-hotkey]', root);
            if (!hotkey) {
              return;
            }
            track('td_search_hotkey_click', {
              td_search_device: 'desktop',
              td_search_keyword: hotkey.getAttribute('data-tdfs-v3-hotkey') || '',
              td_search_href: hotkey.getAttribute('href') || ''
            });
          }, false);
          if (hotkeys) {
            hotkeys.addEventListener('wheel', function (event) {
              if (
                hotkeys.scrollWidth <= hotkeys.clientWidth ||
                Math.abs(event.deltaY) <= Math.abs(event.deltaX)
              ) {
                return;
              }
              hotkeys.scrollLeft += event.deltaY;
              event.preventDefault();
            }, { passive: false });
          }
        }

        function resolveSearchRect(anchor, root) {
          var anchorRect = anchor.getBoundingClientRect();
          var navigationPortal =
            findDesktopNavigationPortal();
          var navigationAnchor =
            findDesktopNavigationAnchor();
          var navigationRect;
          var inputWidth = Math.max(
            220,
            Math.min(
              300,
              Math.round(anchorRect.width || 280)
            )
          );
          var top;
          var left;
          var width;

          if (root) {
            root.style.setProperty(
              '--tdfs-v3-input-width',
              inputWidth + 'px'
            );
          }

          if (
            navigationPortal ||
            navigationAnchor
          ) {
            navigationRect =
              (
                navigationPortal ||
                navigationAnchor
              ).getBoundingClientRect();

            top = Math.max(
              0,
              Math.round(
                navigationRect.top -
                SEARCH_ROW_HEIGHT -
                SEARCH_NAV_GAP
              )
            );
            left = navigationRect.left;
            width = navigationRect.width;

            return {
              top: top,
              left: left,
              width: width,
              height: SEARCH_ROW_HEIGHT,
              right: left + width,
              bottom: top + SEARCH_ROW_HEIGHT
            };
          }

          return {
            top: Math.max(
              0,
              Math.round(
                anchorRect.top -
                SEARCH_ROW_HEIGHT -
                SEARCH_NAV_GAP
              )
            ),
            left: anchorRect.left,
            width: anchorRect.width,
            height: SEARCH_ROW_HEIGHT,
            right: anchorRect.right,
            bottom: anchorRect.top - SEARCH_NAV_GAP
          };
        }

        function mount() {
          var found;
          if (!isDesktopMode()) {
            restoreNativeHotkeys();
            return false;
          }
          found = findDesktopAnchor();
          if (!found || !DesktopPortal) {
            restoreNativeHotkeys();
            return false;
          }
          if (!state.root || !document.documentElement.contains(state.root)) {
            state.root = createRoot();
          }
          state.anchor = found.anchor;
          state.variant = found.variant;
          state.root.setAttribute(
            'data-tdfs-v3-variant',
            state.variant
          );
          syncNativeHotkeys(state.anchor);
          DesktopPortal.mount(
            SLOT_NAME,
            state.root,
            state.anchor,
            {
              resolveRect: resolveSearchRect
            }
          );
          return true;
        }

        function scheduleMount(delay) {
          if (state.resizeTimer) {
            window.clearTimeout(state.resizeTimer);
          }
          state.resizeTimer = window.setTimeout(function () {
            state.resizeTimer = null;
            mount();
          }, delay || 80);
        }

        function startRetries() {
          function retry() {
            state.retryTimer = null;
            state.retryCount += 1;
            mount();
            if (state.retryCount < 10) {
              state.retryTimer = window.setTimeout(retry, 250);
            }
          }
          retry();
        }

        function bindMobileCloseAnimation() {
          document.addEventListener('click', function (event) {
            var closeButton = closest(event.target, '#hsearch .close-full-screen-btn', null);
            var wrapper;
            var originalTarget;
            var closeDelay = 310;
            if (!closeButton) {
              return;
            }
            if (closeButton.getAttribute('data-tdfs-v3-close-replay') === 'true') {
              closeButton.removeAttribute('data-tdfs-v3-close-replay');
              return;
            }
            wrapper = closest(closeButton, '#hsearch .wrapper', null);
            if (!wrapper || wrapper.classList.contains('tdfs-v1-closing')) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) {
              event.stopImmediatePropagation();
            }
            if (
              window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
              closeDelay = 20;
            }
            originalTarget =
              event.target && event.target.nodeType === 1 ?
              event.target : closeButton;
            wrapper.classList.add('tdfs-v1-closing');
            if (state.mobileCloseTimer) {
              window.clearTimeout(state.mobileCloseTimer);
            }
            state.mobileCloseTimer = window.setTimeout(function () {
              state.mobileCloseTimer = null;
              closeButton.setAttribute('data-tdfs-v3-close-replay', 'true');
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

        function init() {
          injectStyle();
          bindMobileCloseAnimation();
          startRetries();
          window.addEventListener('resize', function () {
            scheduleMount(120);
          }, false);
          window.addEventListener('orientationchange', function () {
            scheduleMount(120);
          }, false);
          window.addEventListener('pageshow', mount, false);
          window.addEventListener('popstate', mount, false);
        }

        init();
      }());
    }
  };

  window.TDFigmaPendingJobs = window.TDFigmaPendingJobs || [];
  window.TDFigmaPendingJobs.push(job);

  if (window.TDFigmaCore && window.TDFigmaCore.jobs) {
    window.TDFigmaCore.jobs.flush();
  }
}());

/* TD_Figma_All_Pages_Footer_GTM_v3.0.0.html */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-footer-v300',
    ready: function () {
      return !!(
        window.TDFigmaData &&
        window.TDFigmaData.allPages &&
        window.TDFigmaData.allPages.footer
      );
    },
    start: function () {
      (function () {
        'use strict';

        var Core = window.TDFigmaCore;
        var SOURCE_DATA =
          window.TDFigmaData.allPages.footer;
        var escapeHtml = Core.text.escapeHtml;
        var sanitizeUrl = Core.url.sanitize;
        var closest = Core.dom.closest;

        var VERSION = '3.0.0';
        var ROOT_ID = 'td-figma-footer-root';
        var ROOT_ATTRIBUTE = 'data-tdff-v1';
        var GLOBAL_KEY = '__TD_FIGMA_FOOTER_V3__';

        var CONTENT = {
          about: mapSection(
            SOURCE_DATA.brandSection
          ),
          member: mapSection(
            SOURCE_DATA.memberSection
          ),
          skin: mapSection(
            SOURCE_DATA.skinNeedsSection
          ),
          offer: {
            label:
              (
                (
                  SOURCE_DATA.contact || {}
                ).firstPurchaseOffer || {}
              ).text || '',
            href:
              (
                (
                  SOURCE_DATA.contact || {}
                ).firstPurchaseOffer || {}
              ).linkUrl || ''
          },
          social:
            (
              SOURCE_DATA.contact || {}
            ).socialLinks || {},
          legal:
            SOURCE_DATA.legalLinks || []
        };

        var state = {
          root: null,
          retryTimer: null,
          retryCount: 0
        };

        if (window[GLOBAL_KEY]) {
          window[GLOBAL_KEY].mount();
          return;
        }

        function mapSection(section) {
          return {
            title:
              (section || {}).heading || '',
            items:
              (section || {}).links || []
          };
        }

        function cleanUrl(value) {
          return sanitizeUrl(value) || '#';
        }

        function anchorMarkup(
          className,
          label,
          href,
          attributes
        ) {
          return (
            '<a class="' +
            className +
            '" href="' +
            escapeHtml(cleanUrl(href)) +
            '"' +
            (attributes || '') +
            '>' +
            escapeHtml(label || '') +
            '</a>'
          );
        }

        function desktopColumn(section) {
          var html = [];
          var item;
          var i;

          html.push(
            '<section class="' +
            'tdff-v1-desktop-column">'
          );
          html.push(
            '<h2 class="' +
            'tdff-v1-desktop-heading">' +
            escapeHtml(section.title) +
            '</h2>'
          );
          html.push(
            '<ul class="' +
            'tdff-v1-desktop-list">'
          );

          for (
            i = 0;
            i < section.items.length;
            i += 1
          ) {
            item = section.items[i] || {};

            html.push(
              '<li>' +
              anchorMarkup(
                'tdff-v1-desktop-link',
                item.text || '',
                item.linkUrl || ''
              ) +
              '</li>'
            );
          }

          html.push('</ul>');
          html.push('</section>');

          return html.join('');
        }

        function socialMarkup() {
          var iconMap = {
            facebook: 'ico-facebook',
            instagram: 'ico-instagram',
            line: 'ico-line'
          };
          var types = [
            'facebook',
            'instagram',
            'line'
          ];
          var html = [];
          var item;
          var type;
          var i;

          html.push(
            '<div class="tdff-v1-socials" ' +
            'aria-label="社群媒體">'
          );

          for (
            i = 0;
            i < types.length;
            i += 1
          ) {
            type = types[i];
            item =
              CONTENT.social[type] || {};

            html.push(
              '<a class="' +
              'tdff-v1-social-link" href="' +
              escapeHtml(
                cleanUrl(item.linkUrl)
              ) +
              '" aria-label="' +
              escapeHtml(
                item.label || type
              ) +
              '">' +
              '<i class="ico ' +
              iconMap[type] +
              '" aria-hidden="true"></i>' +
              '</a>'
            );
          }

          html.push('</div>');

          return html.join('');
        }

        function contactMarkup(mobile) {
          var html = [];

          html.push(
            '<div class="' +
            (
              mobile ?
              'tdff-v1-mobile-contact' :
              'tdff-v1-contact'
            ) +
            '">'
          );

          html.push(
            '<div class="tdff-v1-hours">' +
            '<span>10:00～17:00</span>' +
            '<span class="tdff-v1-days">' +
            '<span>星期一</span>' +
            '<span class="tdff-v1-days-dot" ' +
            'aria-hidden="true"></span>' +
            '<span>星期五</span>' +
            '</span>' +
            '</div>'
          );

          html.push(socialMarkup());

          html.push(
            anchorMarkup(
              'tdff-v1-offer',
              CONTENT.offer.label,
              CONTENT.offer.href
            )
          );

          html.push('</div>');

          return html.join('');
        }

        function legalMarkup() {
          var html = [];
          var item;
          var i;

          html.push(
            '<div class="tdff-v1-bottom">'
          );
          html.push(
            '<nav class="tdff-v1-legal" ' +
            'aria-label="頁尾政策連結">'
          );

          for (
            i = 0;
            i < CONTENT.legal.length;
            i += 1
          ) {
            item = CONTENT.legal[i] || {};

            if (i > 0) {
              html.push(
                '<span class="' +
                'tdff-v1-legal-separator" ' +
                'aria-hidden="true"></span>'
              );
            }

            html.push(
              anchorMarkup(
                'tdff-v1-legal-link',
                item.text || '',
                item.linkUrl || ''
              )
            );
          }

          html.push('</nav>');
          html.push(
            '<div class="' +
            'tdff-v1-copyright">' +
            '© 2026 by 台灣諾奧思有限公司' +
            '</div>'
          );
          html.push('</div>');

          return html.join('');
        }

        function accordionItem(
          key,
          section
        ) {
          var panelId =
            'tdff-v1-panel-' + key;
          var html = [];
          var item;
          var i;

          html.push(
            '<section class="' +
            'tdff-v1-accordion-item" ' +
            'data-tdff-v1-accordion-item="' +
            key +
            '">'
          );

          html.push(
            '<button class="' +
            'tdff-v1-accordion-trigger" ' +
            'type="button" ' +
            'aria-expanded="false" ' +
            'aria-controls="' +
            panelId +
            '" data-tdff-v1-accordion-trigger>'
          );

          html.push(
            '<span class="' +
            'tdff-v1-accordion-title">' +
            escapeHtml(section.title) +
            '</span>'
          );

          html.push(
            '<span class="' +
            'tdff-v1-accordion-arrow">' +
            '<i class="ico ' +
            'ico-chevron-right" ' +
            'aria-hidden="true"></i>' +
            '</span>'
          );

          html.push('</button>');

          html.push(
            '<div class="' +
            'tdff-v1-accordion-panel" id="' +
            panelId +
            '" aria-hidden="true">'
          );

          html.push(
            '<div class="' +
            'tdff-v1-accordion-panel-inner">' +
            '<ul class="tdff-v1-mobile-list">'
          );

          for (
            i = 0;
            i < section.items.length;
            i += 1
          ) {
            item = section.items[i] || {};

            html.push(
              '<li>' +
              anchorMarkup(
                'tdff-v1-mobile-link',
                item.text || '',
                item.linkUrl || ''
              ) +
              '</li>'
            );
          }

          html.push('</ul></div></div>');
          html.push('</section>');

          return html.join('');
        }

        function buildFooter() {
          var root =
            document.createElement('footer');
          var html = [];

          root.id = ROOT_ID;
          root.className = 'tdff-v1-root';
          root.setAttribute(
            ROOT_ATTRIBUTE,
            'footer'
          );
          root.setAttribute(
            'data-tdff-version',
            VERSION
          );
          root.setAttribute(
            'aria-label',
            '網站頁尾'
          );

          html.push(
            '<div class="tdff-v1-desktop">'
          );
          html.push(
            '<div class="' +
            'tdff-v1-desktop-main">'
          );
          html.push(
            '<div class="' +
            'tdff-v1-desktop-columns">'
          );
          html.push(
            desktopColumn(CONTENT.about)
          );
          html.push(
            desktopColumn(CONTENT.member)
          );
          html.push(
            desktopColumn(CONTENT.skin)
          );
          html.push('</div>');
          html.push(contactMarkup(false));
          html.push('</div>');
          html.push(
            '<div class="tdff-v1-divider">' +
            '</div>'
          );
          html.push(legalMarkup());
          html.push('</div>');

          html.push(
            '<div class="tdff-v1-mobile">'
          );
          html.push(
            '<div class="tdff-v1-accordion">'
          );
          html.push(
            accordionItem(
              'about',
              CONTENT.about
            )
          );
          html.push(
            accordionItem(
              'member',
              CONTENT.member
            )
          );
          html.push(
            accordionItem(
              'skin',
              CONTENT.skin
            )
          );
          html.push('</div>');
          html.push(contactMarkup(true));
          html.push(
            '<div class="tdff-v1-divider">' +
            '</div>'
          );
          html.push(legalMarkup());
          html.push('</div>');

          root.innerHTML = html.join('');

          return root;
        }

        function bindFooter(root) {
          root.addEventListener(
            'click',
            function (event) {
              var trigger = closest(
                event.target,
                '[data-tdff-v1-accordion-trigger]',
                root
              );
              var item;
              var items;
              var panel;
              var isOpen;
              var i;

              if (!trigger) {
                return;
              }

              item = trigger.parentNode;
              isOpen =
                item.classList.contains(
                  'is-open'
                );
              items =
                root.querySelectorAll(
                  '.tdff-v1-accordion-item'
                );

              for (
                i = 0;
                i < items.length;
                i += 1
              ) {
                items[i].classList.remove(
                  'is-open'
                );
                items[i]
                  .querySelector(
                    '.tdff-v1-accordion-trigger'
                  )
                  .setAttribute(
                    'aria-expanded',
                    'false'
                  );
                panel = items[i]
                  .querySelector(
                    '.tdff-v1-accordion-panel'
                  );
                panel.setAttribute(
                  'aria-hidden',
                  'true'
                );
              }

              if (!isOpen) {
                item.classList.add(
                  'is-open'
                );
                trigger.setAttribute(
                  'aria-expanded',
                  'true'
                );
                item
                  .querySelector(
                    '.tdff-v1-accordion-panel'
                  )
                  .setAttribute(
                    'aria-hidden',
                    'false'
                  );
              }
            },
            false
          );
        }

        function insertAfter(
          reference,
          node
        ) {
          var parent =
            reference &&
            reference.parentNode;

          if (!parent) {
            return false;
          }

          if (reference.nextSibling) {
            parent.insertBefore(
              node,
              reference.nextSibling
            );
          } else {
            parent.appendChild(node);
          }

          return true;
        }

        function placeFooter(root) {
          var homeRoot =
            document.getElementById(
              'td-figma-home-root'
            );
          var appRoot =
            document.getElementById('root');
          var anchor = null;

          if (
            homeRoot &&
            homeRoot.parentNode ===
              document.body
          ) {
            anchor = homeRoot;
          } else if (
            appRoot &&
            appRoot.parentNode ===
              document.body
          ) {
            anchor = appRoot;
          }

          if (anchor) {
            if (
              root.parentNode !==
                document.body ||
              anchor.nextSibling !== root
            ) {
              insertAfter(anchor, root);
            }

            return true;
          }

          if (
            root.parentNode !==
              document.body
          ) {
            document.body.appendChild(root);
          }

          return true;
        }

        function ensureFooter() {
          var root =
            document.getElementById(
              ROOT_ID
            );

          document.body.classList.add(
            'tdff-v1-active'
          );

          if (!root) {
            root = buildFooter();
            bindFooter(root);
          }

          state.root = root;
          placeFooter(root);

          return root;
        }

        function mount() {
          if (!document.body) {
            return false;
          }

          ensureFooter();
          return true;
        }

        function startRetries() {
          function retry() {
            state.retryTimer = null;
            state.retryCount += 1;
            mount();

            if (state.retryCount < 10) {
              state.retryTimer =
                window.setTimeout(
                  retry,
                  250
                );
            }
          }

          retry();
        }

        window[GLOBAL_KEY] = {
          version: VERSION,
          mount: mount,
          getRoot: function () {
            return state.root;
          }
        };

        startRetries();

        window.addEventListener(
          'pageshow',
          mount
        );
        window.addEventListener(
          'popstate',
          mount
        );
      }());
    }
  };

  window.TDFigmaPendingJobs =
    window.TDFigmaPendingJobs || [];

  window.TDFigmaPendingJobs.push(job);

  if (
    window.TDFigmaCore &&
    window.TDFigmaCore.jobs
  ) {
    window.TDFigmaCore.jobs.flush();
  }
}());

/* TD_Figma_All_Pages_ProductCard_GTM_v1.0.4.html */
(function () {
  'use strict';

  var VERSION = '1.0.4';
  var ROLE_ATTRIBUTE = 'data-tdpc-v1-role';
  var INJECTED_ATTRIBUTE = 'data-tdpc-v1-injected';
  var DATA_KEY = 'allPagesProductCard';
  var LEGACY_PRODUCT_PAGE_CARD_SELECTOR =
    '#SalePageIndexController ' +
    'li.product-card.product-card-in-slider > ' +
    'a.product-list-link';
  var LEGACY_FALLBACK_SELECTORS = {
    mediaContainer: '.product-card-img-container, figure.image-frame',
    productImage: 'img.klee-slider-li-img, img.image-body',
    productBadgeImage: 'img.product-card-badge-img',
    productTitle: '.product-card-title',
    featureTagGroup: '.product-card-tag-block',
    featureTag: '.product-card-tag',
    priceBlock: '.product-card-price-block',
    salePriceContainer: '.product-card-price',
    salePrice: '.product-card-price span',
    originalPrice: '.product-card-suggest-price'
  };
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

  function extractProductId(card) {
    var directId;
    var href;
    var match;

    if (!card) {
      return '';
    }

    directId = trimText(
      card.getAttribute('data-product-id') || ''
    );

    if (/^\d+$/.test(directId)) {
      return directId;
    }

    href = card.getAttribute('href') ||
      card.getAttribute('ng-href') ||
      card.getAttribute('data-ng-href') ||
      '';

    match = String(href).match(
      /\/SalePage\/Index\/(\d+)(?=[/?#]|$)/i
    );

    return match ? match[1] : '';
  }

  function matchesLegacyNameRule(productName, rule) {
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

  function matchesProductRule(productId, productName, rule) {
    var pattern;

    if (!rule) {
      return false;
    }

    pattern = trimText(rule.productIdPattern || '');

    if (pattern) {
      if (!productId) {
        return false;
      }

      try {
        return new RegExp(
          '^(?:' + pattern + ')$',
          rule.regexFlags || ''
        ).test(productId);
      } catch (error) {
        return false;
      }
    }

    /*
     * 舊版 Dataset 相容：只有尚未改成 productIdPattern 的舊規則
     * 才會回退使用商品名稱，避免升級 Runtime 時既有 GTM Dataset
     * 立即失效。新版 Dataset v1.0.3 起應使用商品編號規則。
     */
    return matchesLegacyNameRule(productName, rule);
  }

  function findCornerRule(productId, productName, dataset) {
    var rules = dataset.cornerLabelRules || [];
    var i;

    for (i = 0; i < rules.length; i += 1) {
      if (
        matchesProductRule(
          productId,
          productName,
          rules[i]
        )
      ) {
        return rules[i];
      }
    }

    return null;
  }

  function updateCornerLabel(card, media, productId, productName, dataset) {
    var existing = card.querySelector(
      '[' + ROLE_ATTRIBUTE + '="corner-label"]'
    );
    var rule = findCornerRule(productId, productName, dataset);
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

  function findProductTagRule(productId, productName, dataset) {
    var rules = dataset.productTagRules || [];
    var i;

    for (i = 0; i < rules.length; i += 1) {
      if (
        matchesProductRule(
          productId,
          productName,
          rules[i]
        )
      ) {
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

  function updateProductTagRow(card, details, title, productId, productName, dataset) {
    var behavior = dataset.behavior || {};
    var row = details
      ? details.querySelector(
          '[' + ROLE_ATTRIBUTE + '="product-tag-row"]'
        )
      : null;
    var rule = findProductTagRule(productId, productName, dataset);
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

  function ensureLegacyCartButton(card, priceBlock, dataset) {
    var selector =
      '[' + ROLE_ATTRIBUTE + '="cart-button"]' +
      '[' + INJECTED_ATTRIBUTE + '="true"]';
    var cartButton = card ? card.querySelector(selector) : null;
    var parent = priceBlock ? priceBlock.parentNode : null;
    var label = (
      dataset.text &&
      dataset.text.purchaseButtonText
    ) || '立即購買';

    if (!card || !priceBlock || !parent) {
      return null;
    }

    if (!cartButton) {
      cartButton = document.createElement('span');
      cartButton.setAttribute(INJECTED_ATTRIBUTE, 'true');
      setRole(cartButton, 'cart-button');
    }

    cartButton.setAttribute(
      'data-tdpc-v1-cart-label',
      label
    );
    cartButton.textContent = label;

    if (priceBlock.nextElementSibling !== cartButton) {
      parent.insertBefore(cartButton, priceBlock.nextSibling);
    }

    return cartButton;
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
    var productId;

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

    productId = extractProductId(card);
    card.setAttribute(
      'data-tdpc-v1-product-id',
      productId
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
      productId,
      productName,
      dataset
    );
    updateCornerLabel(
      card,
      media,
      productId,
      productName,
      dataset
    );
    updateFavoriteState(favoriteButton);

    return true;
  }

  function joinSelectors(primary, fallback) {
    var first = trimText(primary);
    var second = trimText(fallback);

    if (!first) {
      return second;
    }

    if (!second || first.indexOf(second) !== -1) {
      return first;
    }

    return first + ', ' + second;
  }

  function queryLegacyElement(card, configured, fallback) {
    var element = null;

    if (!card) {
      return null;
    }

    if (configured) {
      try {
        element = card.querySelector(configured);
      } catch (error) {
        element = null;
      }
    }

    if (!element && fallback) {
      try {
        element = card.querySelector(fallback);
      } catch (fallbackError) {
        element = null;
      }
    }

    return element;
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
    var cartButton;
    var productName;
    var productId;

    media = queryLegacyElement(
      card,
      selectors.mediaContainer,
      LEGACY_FALLBACK_SELECTORS.mediaContainer
    );
    title = queryLegacyElement(
      card,
      selectors.productTitle,
      LEGACY_FALLBACK_SELECTORS.productTitle
    );
    priceBlock = queryLegacyElement(
      card,
      selectors.priceBlock,
      LEGACY_FALLBACK_SELECTORS.priceBlock
    );

    if (!media || !title || !priceBlock) {
      return false;
    }

    productImage = queryLegacyElement(
      card,
      selectors.productImage,
      LEGACY_FALLBACK_SELECTORS.productImage
    );
    productBadge = queryLegacyElement(
      card,
      selectors.productBadgeImage,
      LEGACY_FALLBACK_SELECTORS.productBadgeImage
    );
    featureTagGroup = queryLegacyElement(
      card,
      selectors.featureTagGroup,
      LEGACY_FALLBACK_SELECTORS.featureTagGroup
    );
    featureTag = queryLegacyElement(
      card,
      selectors.featureTag,
      LEGACY_FALLBACK_SELECTORS.featureTag
    );
    salePrice = queryLegacyElement(
      card,
      selectors.salePrice,
      LEGACY_FALLBACK_SELECTORS.salePrice
    );
    salePriceContainer = selectors.salePriceContainer
      ? queryLegacyElement(
        card,
        selectors.salePriceContainer,
        LEGACY_FALLBACK_SELECTORS.salePriceContainer
      )
      : null;
    if (!salePriceContainer && salePrice) {
      salePriceContainer = salePrice.parentElement;
    }
    originalPrice = queryLegacyElement(
      card,
      selectors.originalPrice,
      LEGACY_FALLBACK_SELECTORS.originalPrice
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

    cartButton = ensureLegacyCartButton(
      card,
      priceBlock,
      dataset
    );
    setRole(cartButton, 'cart-button');

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

    productId = extractProductId(card);
    card.setAttribute(
      'data-tdpc-v1-product-id',
      productId
    );

    updateProductTagRow(
      card,
      title.parentElement,
      title,
      productId,
      productName,
      dataset
    );

    updateCornerLabel(
      card,
      media,
      productId,
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
        joinSelectors(
          selectors.legacy &&
          selectors.legacy.card,
          LEGACY_PRODUCT_PAGE_CARD_SELECTOR
        )
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
