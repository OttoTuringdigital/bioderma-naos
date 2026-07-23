/* TD Figma home JS Bundle v1.2.1 */

/* ===== TD_Figma_Home_Style_GTM_v1.0.1.html ===== */
(function(){window.TDFigmaStyleReady=window.TDFigmaStyleReady||{};window.TDFigmaStyleReady.homePage="1.0.1";}());

/* ===== TD_Figma_Home_Slider_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-slider-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.heroSlider);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.heroSlider;
var CONTENT = {
slides: (SOURCE_DATA.slides || []).map(function (item) {
return {
id: item.id || '',
alt: item.imageAltText || '',
href: item.linkUrl || '',
desktopImage: item.desktopImageUrl || '',
mobileImage: item.mobileImageUrl || ''
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
rootId: 'tdhs-v1-root',
breakpoint: 992,
autoplayDelay: 3000,
autoplayDuration: 1000,
manualDuration: 300,
desktopWidth: 1200,
desktopHeight: 562,
mobileWidth: 375,
mobileHeight: 450,
desktopStartIndex: 0,
mobileStartIndex: 2,
dragThresholdRatio: 0.14,
mountDelay: 60
};
var state = {
root: null,
viewport: null,
track: null,
dots: null,
maskLeft: null,
maskRight: null,
mode: '',
slides: [],
index: 0,
position: 1,
slideWidth: 0,
animating: false,
paused: false,
autoplayTimer: null,
resizeTimer: null,
mountTimer: null,
observer: null,
suppressClick: false,
drag: {
active: false,
startX: 0,
deltaX: 0,
moved: false
}
};
function normalizeIndex(index, length) {
if (!length) {
return 0;
}
return ((index % length) + length) % length;
}
function isPlaceholderHref(href) {
return !href || href === '#' || /^javascript:/i.test(href);
}
function getMode() {
return window.innerWidth < CONFIG.breakpoint ? 'mobile' : 'desktop';
}
function getImage(slide, mode) {
if (mode === 'mobile') {
return slide.mobileImage || slide.desktopImage || '';
}
return slide.desktopImage || slide.mobileImage || '';
}
function getSlides(mode) {
var source = CONTENT.slides || [];
var available = [];
var startIndex;
var rotated = [];
var i;
var index;
for (i = 0; i < source.length; i += 1) {
if (getImage(source[i], mode)) {
available.push(source[i]);
}
}
if (!available.length) {
return [];
}
startIndex = mode === 'mobile' ? CONFIG.mobileStartIndex : CONFIG.desktopStartIndex;
startIndex = normalizeIndex(startIndex, available.length);
for (i = 0; i < available.length; i += 1) {
index = normalizeIndex(startIndex + i, available.length);
rotated.push(available[index]);
}
return rotated;
}
function getClientX(event) {
if (event.touches && event.touches.length) {
return event.touches[0].clientX;
}
if (event.changedTouches && event.changedTouches.length) {
return event.changedTouches[0].clientX;
}
return event.clientX;
}
function prefersReducedMotion() {
return !!(
window.matchMedia &&
window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
}
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_slider_version', VERSION);
}
function createStructure() {
var root = createElement('section', 'tdhs-v1-root');
var viewport = createElement('div', 'tdhs-v1-viewport');
var track = createElement('div', 'tdhs-v1-track');
var maskLeft = createElement('div', 'tdhs-v1-side-mask tdhs-v1-side-mask--left');
var maskRight = createElement('div', 'tdhs-v1-side-mask tdhs-v1-side-mask--right');
var dots = createElement('div', 'tdhs-v1-dots');
root.id = CONFIG.rootId;
root.setAttribute('data-tdhs-v1', VERSION);
root.setAttribute('role', 'region');
root.setAttribute('aria-roledescription', 'carousel');
root.setAttribute('aria-label', '首頁主視覺輪播');
viewport.setAttribute('data-tdhs-v1-viewport', '');
track.setAttribute('data-tdhs-v1-track', '');
dots.setAttribute('data-tdhs-v1-dots', '');
dots.setAttribute('role', 'tablist');
dots.setAttribute('aria-label', 'Slider 頁面');
maskLeft.setAttribute('aria-hidden', 'true');
maskRight.setAttribute('aria-hidden', 'true');
viewport.appendChild(track);
viewport.appendChild(maskLeft);
viewport.appendChild(maskRight);
viewport.appendChild(dots);
root.appendChild(viewport);
state.root = root;
state.viewport = viewport;
state.track = track;
state.dots = dots;
state.maskLeft = maskLeft;
state.maskRight = maskRight;
}
function createSlide(slide, logicalIndex, isClone) {
var item = createElement('article', 'tdhs-v1-slide');
var href = getSafeHref(slide.href);
var holder;
var image = createElement('img', 'tdhs-v1-image');
item.setAttribute('data-tdhs-v1-slide', String(logicalIndex));
item.setAttribute('aria-roledescription', 'slide');
item.setAttribute('aria-label', (logicalIndex + 1) + ' / ' + state.slides.length);
if (isClone) {
item.setAttribute('aria-hidden', 'true');
item.setAttribute('data-tdhs-v1-clone', 'true');
}
image.src = getImage(slide, state.mode);
image.alt = isClone ? '' : (slide.alt || '');
image.loading = logicalIndex <= 1 ? 'eager' : 'lazy';
image.decoding = 'async';
image.draggable = false;
if (href) {
holder = createElement('a', 'tdhs-v1-slide-link');
holder.href = href;
holder.setAttribute('data-tdhs-v1-link', slide.id || String(logicalIndex));
} else {
holder = createElement('div', 'tdhs-v1-slide-static');
}
holder.appendChild(image);
item.appendChild(holder);
return item;
}
function renderDots() {
var fragment = document.createDocumentFragment();
var button;
var i;
state.dots.innerHTML = '';
for (i = 0; i < state.slides.length; i += 1) {
button = createElement('button', 'tdhs-v1-dot');
button.type = 'button';
button.setAttribute('data-tdhs-v1-dot', String(i));
button.setAttribute('role', 'tab');
button.setAttribute('aria-label', '切換至第 ' + (i + 1) + ' 張');
fragment.appendChild(button);
}
state.dots.appendChild(fragment);
updateDots();
}
function renderSlides() {
var fragment = document.createDocumentFragment();
var lastIndex;
var i;
state.track.innerHTML = '';
if (!state.slides.length) {
return;
}
lastIndex = state.slides.length - 1;
fragment.appendChild(createSlide(state.slides[lastIndex], lastIndex, true));
for (i = 0; i < state.slides.length; i += 1) {
fragment.appendChild(createSlide(state.slides[i], i, false));
}
fragment.appendChild(createSlide(state.slides[0], 0, true));
state.track.appendChild(fragment);
state.index = 0;
state.position = 1;
renderDots();
updateLayout(false);
}
function updateDots() {
var buttons = state.dots ? state.dots.querySelectorAll('[data-tdhs-v1-dot]') : [];
var i;
for (i = 0; i < buttons.length; i += 1) {
if (i === state.index) {
buttons[i].classList.add('is-active');
buttons[i].setAttribute('aria-selected', 'true');
buttons[i].setAttribute('aria-current', 'true');
} else {
buttons[i].classList.remove('is-active');
buttons[i].setAttribute('aria-selected', 'false');
buttons[i].removeAttribute('aria-current');
}
}
}
function setTransition(duration) {
var actualDuration = prefersReducedMotion() ? 1 : duration;
state.track.style.transition =
'transform ' + actualDuration + 'ms cubic-bezier(0, 0, .58, 1)';
}
function getTranslateX(extraDelta) {
var viewportWidth = state.viewport.clientWidth || window.innerWidth;
var sideWidth = Math.max(0, (viewportWidth - state.slideWidth) / 2);
return sideWidth - (state.position * state.slideWidth) + (extraDelta || 0);
}
function setTransform(extraDelta) {
state.track.style.transform =
'translate3d(' + getTranslateX(extraDelta) + 'px, 0, 0)';
}
function updateLayout(animate) {
var viewportWidth;
var ratio;
var height;
var sideWidth;
var slides;
var i;
if (!state.root || !state.viewport) {
return;
}
viewportWidth = state.viewport.clientWidth || window.innerWidth;
if (state.mode === 'mobile') {
state.slideWidth = viewportWidth;
ratio = CONFIG.mobileHeight / CONFIG.mobileWidth;
} else {
state.slideWidth = Math.min(CONFIG.desktopWidth, viewportWidth);
ratio = CONFIG.desktopHeight / CONFIG.desktopWidth;
}
height = Math.round(state.slideWidth * ratio);
sideWidth = Math.max(0, (viewportWidth - state.slideWidth) / 2);
state.root.style.setProperty('--tdhs-v1-slide-width', state.slideWidth + 'px');
state.root.style.setProperty('--tdhs-v1-side-width', sideWidth + 'px');
state.viewport.style.height = height + 'px';
slides = state.track.querySelectorAll('.tdhs-v1-slide');
for (i = 0; i < slides.length; i += 1) {
slides[i].style.width = state.slideWidth + 'px';
slides[i].style.flexBasis = state.slideWidth + 'px';
}
setTransition(animate ? CONFIG.manualDuration : 0);
setTransform(0);
}
function rebuild() {
var nextMode = getMode();
state.mode = nextMode;
state.slides = getSlides(nextMode);
state.animating = false;
clearAutoplay();
renderSlides();
scheduleAutoplay();
trackEvent('td_home_slider_ready', {
td_slider_device: nextMode,
td_slider_count: state.slides.length
});
}
function clearAutoplay() {
if (state.autoplayTimer) {
window.clearTimeout(state.autoplayTimer);
state.autoplayTimer = null;
}
}
function scheduleAutoplay() {
clearAutoplay();
if (
!state.root ||
!state.slides.length ||
state.paused ||
document.hidden ||
CONFIG.autoplayDelay <= 0
) {
return;
}
state.autoplayTimer = window.setTimeout(function () {
goRelative(1, 'autoplay', CONFIG.autoplayDuration);
}, CONFIG.autoplayDelay);
}
function normalizeLoopPosition() {
var length = state.slides.length;
if (!length) {
return;
}
if (state.position === 0) {
state.position = length;
setTransition(0);
setTransform(0);
state.track.offsetHeight;
} else if (state.position === length + 1) {
state.position = 1;
setTransition(0);
setTransform(0);
state.track.offsetHeight;
}
}
function goRelative(direction, source, duration) {
var length = state.slides.length;
if (!length || state.animating) {
scheduleAutoplay();
return;
}
state.animating = true;
state.index = normalizeIndex(state.index + direction, length);
state.position += direction;
setTransition(duration);
setTransform(0);
updateDots();
trackEvent('td_home_slider_change', {
td_slider_device: state.mode,
td_slider_index: state.index,
td_slider_id: state.slides[state.index].id || '',
td_slider_source: source
});
}
function goTo(targetIndex, source) {
var length = state.slides.length;
var normalized;
if (!length || state.animating) {
return;
}
normalized = normalizeIndex(targetIndex, length);
if (normalized === state.index) {
scheduleAutoplay();
return;
}
clearAutoplay();
state.animating = true;
state.index = normalized;
state.position = normalized + 1;
setTransition(CONFIG.manualDuration);
setTransform(0);
updateDots();
trackEvent('td_home_slider_change', {
td_slider_device: state.mode,
td_slider_index: state.index,
td_slider_id: state.slides[state.index].id || '',
td_slider_source: source
});
}
function handleTransitionEnd(event) {
if (event.target !== state.track || event.propertyName !== 'transform') {
return;
}
normalizeLoopPosition();
state.animating = false;
scheduleAutoplay();
}
function startDrag(event) {
if (
state.animating ||
!state.slides.length ||
(event.type === 'mousedown' && event.button !== 0)
) {
return;
}
state.drag.active = true;
state.drag.startX = getClientX(event);
state.drag.deltaX = 0;
state.drag.moved = false;
state.root.classList.add('is-dragging');
clearAutoplay();
setTransition(0);
}
function moveDrag(event) {
if (!state.drag.active) {
return;
}
state.drag.deltaX = getClientX(event) - state.drag.startX;
if (Math.abs(state.drag.deltaX) > 8) {
state.drag.moved = true;
if (event.cancelable) {
event.preventDefault();
}
}
setTransform(state.drag.deltaX);
}
function endDrag() {
var threshold;
if (!state.drag.active) {
return;
}
threshold = state.slideWidth * CONFIG.dragThresholdRatio;
state.drag.active = false;
state.root.classList.remove('is-dragging');
if (state.drag.moved) {
state.suppressClick = true;
window.setTimeout(function () {
state.suppressClick = false;
}, 50);
}
if (state.drag.deltaX <= -threshold) {
state.drag.deltaX = 0;
goRelative(1, 'drag', CONFIG.manualDuration);
return;
}
if (state.drag.deltaX >= threshold) {
state.drag.deltaX = 0;
goRelative(-1, 'drag', CONFIG.manualDuration);
return;
}
state.drag.deltaX = 0;
setTransition(CONFIG.manualDuration);
setTransform(0);
scheduleAutoplay();
}
function handleRootClick(event) {
var dot = closest(event.target, '[data-tdhs-v1-dot]');
var link = closest(event.target, '[data-tdhs-v1-link]');
var index;
if (state.suppressClick) {
event.preventDefault();
event.stopPropagation();
return;
}
if (dot && state.root.contains(dot)) {
event.preventDefault();
index = parseInt(dot.getAttribute('data-tdhs-v1-dot'), 10);
trackEvent('td_home_slider_dot_click', {
td_slider_device: state.mode,
td_slider_index: index
});
goTo(index, 'dot');
return;
}
if (link && state.root.contains(link)) {
trackEvent('td_home_slider_click', {
td_slider_device: state.mode,
td_slider_index: state.index,
td_slider_id: link.getAttribute('data-tdhs-v1-link') || '',
td_slider_href: link.getAttribute('href') || ''
});
}
}
function handleMouseEnter() {
state.paused = true;
clearAutoplay();
}
function handleMouseLeave() {
state.paused = false;
scheduleAutoplay();
}
function handleVisibilityChange() {
if (document.hidden) {
clearAutoplay();
} else {
scheduleAutoplay();
}
}
function handleResize() {
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
}
state.resizeTimer = window.setTimeout(function () {
var nextMode = getMode();
state.resizeTimer = null;
if (nextMode !== state.mode) {
rebuild();
} else {
updateLayout(false);
}
}, 120);
}
function bindEvents() {
state.track.addEventListener('transitionend', handleTransitionEnd, false);
state.root.addEventListener('click', handleRootClick, false);
state.viewport.addEventListener('mousedown', startDrag, false);
state.viewport.addEventListener('touchstart', startDrag, false);
state.viewport.addEventListener('touchmove', moveDrag, { passive: false });
state.viewport.addEventListener('touchend', endDrag, false);
state.viewport.addEventListener('touchcancel', endDrag, false);
state.root.addEventListener('mouseenter', handleMouseEnter, false);
state.root.addEventListener('mouseleave', handleMouseLeave, false);
window.addEventListener('mousemove', moveDrag, false);
window.addEventListener('mouseup', endDrag, false);
window.addEventListener('resize', handleResize, false);
document.addEventListener('visibilitychange', handleVisibilityChange, false);
}
function unbindEvents() {
if (!state.root) {
return;
}
state.track.removeEventListener('transitionend', handleTransitionEnd, false);
state.root.removeEventListener('click', handleRootClick, false);
state.viewport.removeEventListener('mousedown', startDrag, false);
state.viewport.removeEventListener('touchstart', startDrag, false);
state.viewport.removeEventListener('touchmove', moveDrag, false);
state.viewport.removeEventListener('touchend', endDrag, false);
state.viewport.removeEventListener('touchcancel', endDrag, false);
state.root.removeEventListener('mouseenter', handleMouseEnter, false);
state.root.removeEventListener('mouseleave', handleMouseLeave, false);
window.removeEventListener('mousemove', moveDrag, false);
window.removeEventListener('mouseup', endDrag, false);
window.removeEventListener('resize', handleResize, false);
document.removeEventListener('visibilitychange', handleVisibilityChange, false);
}
function mount() {
var target = query(CONFIG.targetSelector);
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
rebuild();
}
if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
updateLayout(false);
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount();
}, CONFIG.mountDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
if (!state.root || !document.documentElement.contains(state.root)) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
clearAutoplay();
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
}
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
state.viewport = null;
state.track = null;
state.dots = null;
state.maskLeft = null;
state.maskRight = null;
}
function init() {
var existingModule = window.TDFigmaHomeSlider;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeSlider = {
version: VERSION,
destroy: destroy,
rebuild: rebuild
};
mount();
observeDom();
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

/* ===== TD_Figma_Home_Trust_Bar_GTM_v2.0.1.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-trust-bar-v201',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.trustBar);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.trustBar;
var CONTENT = {
items: (SOURCE_DATA.items || []).map(function (item) {
return {
id: item.id || '',
href: item.linkUrl || '',
imageUrl: item.imageUrl || '',
imageAltText: item.imageAltText || ''
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.1';
var CONFIG = {
targetSelector: '.layout-center',
sliderSelector: '#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdht-v1-root',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
observer: null,
mountTimer: null,
fallbackTimer: null
};
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_trust_bar_version', VERSION);
}
function createItem(item) {
var href = getSafeHref(item.href);
var imageUrl = getSafeHref(item.imageUrl);
var holder;
var image;
if (!imageUrl) {
return null;
}
holder = createElement(
href ? 'a' : 'div',
href ? 'tdht-v1-item tdht-v1-item-link' : 'tdht-v1-item'
);
image = createElement('img', 'tdht-v1-image');
if (href) {
holder.href = href;
holder.setAttribute('data-tdht-v1-link', item.id || '');
}
holder.setAttribute('data-tdht-v1-item', item.id || '');
image.src = imageUrl;
image.alt = item.imageAltText || '';
image.decoding = 'async';
holder.appendChild(image);
return holder;
}
function createStructure() {
var root = createElement('section', 'tdht-v1-root');
var inner = createElement('div', 'tdht-v1-inner');
var fragment = document.createDocumentFragment();
var items = CONTENT.items || [];
var i;
root.id = CONFIG.rootId;
root.setAttribute('data-tdht-v1', VERSION);
root.setAttribute('aria-label', '品牌信任保證');
for (i = 0; i < items.length; i += 1) {
var itemElement = createItem(items[i]);
if (itemElement) {
fragment.appendChild(itemElement);
}
}
inner.appendChild(fragment);
root.appendChild(inner);
state.root = root;
}
function handleClick(event) {
var link = closest(event.target, '[data-tdht-v1-link]');
if (!link || !state.root || !state.root.contains(link)) {
return;
}
trackEvent('td_home_trust_bar_click', {
td_trust_bar_item: link.getAttribute('data-tdht-v1-link') || '',
td_trust_bar_href: link.getAttribute('href') || ''
});
}
function bindEvents() {
if (state.root) {
state.root.addEventListener('click', handleClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleClick, false);
}
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var slider;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
slider = query(CONFIG.sliderSelector, target);
if (slider) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== slider
) {
insertAfter(slider, state.root);
}
return true;
}
if (allowFallback && state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
return true;
}
return false;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var slider = target ? query(CONFIG.sliderSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
slider &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== slider
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
}
function init() {
var existingModule = window.TDFigmaHomeTrustBar;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeTrustBar = {
version: VERSION,
destroy: destroy,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_trust_bar_ready', {
td_trust_bar_count: (CONTENT.items || []).length
});
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

/* ===== TD_Figma_Home_Skin_Carousel_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-skin-carousel-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.skinConditionCarousel);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.skinConditionCarousel;
var CONTENT = {
title: SOURCE_DATA.heading || '',
items: (SOURCE_DATA.cards || []).map(function (item) {
return {
id: item.id || '',
title: item.skinConditionName || '',
series: item.productSeriesName || '',
brand: item.productSeriesEnglishName || '',
color: item.accentColor || '',
href: item.linkUrl || '',
defaultImage: item.defaultImageUrl || '',
hoverImage: item.hoverImageUrl || '',
productImage: item.productImageUrl || '',
defaultPosition: item.defaultImagePosition || '50% 50%',
hoverPosition: item.hoverImagePosition || '50% 50%'
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdht-v1-root, [data-tdht-v1]',
sliderSelector: '#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhsc-v1-root',
breakpoint: 992,
desktopCanvasWidth: 1300,
desktopCanvasHeight: 527,
desktopVisibleCount: 5,
desktopStep: 255,
mobileCanvasWidth: 375,
mobileCanvasHeight: 395,
mobileItemsPerPage: 2,
mobileStep: 335,
transitionDuration: 300,
swipeThreshold: 42,
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
canvas: null,
viewport: null,
track: null,
prevButton: null,
nextButton: null,
mode: '',
index: 0,
maxIndex: 0,
scale: 1,
baseOffset: 0,
observer: null,
mountTimer: null,
fallbackTimer: null,
resizeTimer: null,
suppressClick: false,
drag: {
active: false,
startX: 0,
deltaX: 0,
moved: false
}
};
function getMode() {
return window.innerWidth < CONFIG.breakpoint ? 'mobile' : 'desktop';
}
function clamp(value, minimum, maximum) {
return Math.max(minimum, Math.min(maximum, value));
}
function getClientX(event) {
if (event.touches && event.touches.length) {
return event.touches[0].clientX;
}
if (event.changedTouches && event.changedTouches.length) {
return event.changedTouches[0].clientX;
}
return event.clientX;
}
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_skin_carousel_version', VERSION);
}
function createCard(item) {
var href = getSafeHref(item.href);
var card = createElement(href ? 'a' : 'div', 'tdhsc-v1-card');
var title = createElement('span', 'tdhsc-v1-card-title');
var visual = createElement('span', 'tdhsc-v1-visual');
var circle = createElement('span', 'tdhsc-v1-circle');
var defaultImage = createElement('img', 'tdhsc-v1-main-image tdhsc-v1-main-image--default');
var hoverImage = createElement('img', 'tdhsc-v1-main-image tdhsc-v1-main-image--hover');
var productImage = createElement('img', 'tdhsc-v1-product-image');
var series = createElement('span', 'tdhsc-v1-series');
var seriesName = createElement('span', 'tdhsc-v1-series-name');
var seriesBrand = createElement('span', 'tdhsc-v1-series-brand');
card.setAttribute('data-tdhsc-v1-item', item.id || '');
if (href) {
card.href = href;
card.setAttribute('data-tdhsc-v1-link', item.id || '');
}
title.textContent = item.title || '';
defaultImage.src = item.defaultImage || '';
defaultImage.alt = '';
defaultImage.loading = 'lazy';
defaultImage.decoding = 'async';
defaultImage.draggable = false;
defaultImage.style.objectPosition = item.defaultPosition || '50% 50%';
hoverImage.src = item.hoverImage || item.defaultImage || '';
hoverImage.alt = '';
hoverImage.loading = 'lazy';
hoverImage.decoding = 'async';
hoverImage.draggable = false;
hoverImage.style.objectPosition = item.hoverPosition || '50% 50%';
productImage.src = item.productImage || '';
productImage.alt = '';
productImage.loading = 'lazy';
productImage.decoding = 'async';
productImage.draggable = false;
seriesName.textContent = item.series || '';
seriesName.style.color = item.color || '#0b396a';
seriesBrand.textContent = item.brand || '';
seriesBrand.style.color = item.color || '#0b396a';
circle.appendChild(defaultImage);
circle.appendChild(hoverImage);
visual.appendChild(circle);
visual.appendChild(productImage);
series.appendChild(seriesName);
series.appendChild(seriesBrand);
card.appendChild(title);
card.appendChild(visual);
card.appendChild(series);
return card;
}
function createDesktopTrack() {
var fragment = document.createDocumentFragment();
var items = CONTENT.items || [];
var i;
for (i = 0; i < items.length; i += 1) {
fragment.appendChild(createCard(items[i]));
}
state.track.appendChild(fragment);
state.maxIndex = Math.max(0, items.length - CONFIG.desktopVisibleCount);
if (items.length < CONFIG.desktopVisibleCount) {
state.baseOffset =
(1200 - ((items.length * 180) + (Math.max(0, items.length - 1) * 75))) / 2;
} else {
state.baseOffset = 0;
}
}
function createMobileTrack() {
var fragment = document.createDocumentFragment();
var items = CONTENT.items || [];
var pageCount = Math.ceil(items.length / CONFIG.mobileItemsPerPage);
var page;
var start;
var end;
var i;
var j;
for (i = 0; i < pageCount; i += 1) {
page = createElement('div', 'tdhsc-v1-page');
start = i * CONFIG.mobileItemsPerPage;
end = Math.min(start + CONFIG.mobileItemsPerPage, items.length);
if (end - start === 1) {
page.classList.add('is-single');
}
for (j = start; j < end; j += 1) {
page.appendChild(createCard(items[j]));
}
fragment.appendChild(page);
}
state.track.appendChild(fragment);
state.maxIndex = Math.max(0, pageCount - 1);
state.baseOffset = 0;
}
function createStructure() {
var root = createElement('section', 'tdhsc-v1-root');
var canvas = createElement('div', 'tdhsc-v1-canvas');
var heading = createElement('header', 'tdhsc-v1-heading');
var title = createElement('h2', 'tdhsc-v1-title');
var carousel = createElement('div', 'tdhsc-v1-carousel');
var viewport = createElement('div', 'tdhsc-v1-viewport');
var track = createElement('div', 'tdhsc-v1-track');
var prevButton = createElement('button', 'tdhsc-v1-arrow tdhsc-v1-arrow--prev');
var nextButton = createElement('button', 'tdhsc-v1-arrow tdhsc-v1-arrow--next');
root.id = CONFIG.rootId;
root.setAttribute('data-tdhsc-v1', VERSION);
root.setAttribute('role', 'region');
root.setAttribute('aria-roledescription', 'carousel');
root.setAttribute('aria-label', CONTENT.title || '肌膚狀態導覽');
root.tabIndex = 0;
title.textContent = CONTENT.title || '';
prevButton.type = 'button';
prevButton.setAttribute('data-tdhsc-v1-action', 'prev');
prevButton.setAttribute('aria-label', '上一組');
nextButton.type = 'button';
nextButton.setAttribute('data-tdhsc-v1-action', 'next');
nextButton.setAttribute('aria-label', '下一組');
heading.appendChild(title);
viewport.appendChild(track);
carousel.appendChild(viewport);
carousel.appendChild(prevButton);
carousel.appendChild(nextButton);
canvas.appendChild(heading);
canvas.appendChild(carousel);
root.appendChild(canvas);
state.root = root;
state.canvas = canvas;
state.viewport = viewport;
state.track = track;
state.prevButton = prevButton;
state.nextButton = nextButton;
}
function render() {
state.mode = getMode();
state.index = 0;
state.track.innerHTML = '';
state.root.setAttribute('data-tdhsc-v1-mode', state.mode);
if (state.mode === 'mobile') {
createMobileTrack();
} else {
createDesktopTrack();
}
updateScale();
updatePosition(false);
updateButtons();
}
function updateScale() {
var containerWidth;
var baseWidth;
var baseHeight;
if (!state.root || !state.canvas) {
return;
}
containerWidth =
state.root.clientWidth ||
(state.root.parentNode && state.root.parentNode.clientWidth) ||
window.innerWidth;
if (state.mode === 'mobile') {
baseWidth = CONFIG.mobileCanvasWidth;
baseHeight = CONFIG.mobileCanvasHeight;
} else {
baseWidth = CONFIG.desktopCanvasWidth;
baseHeight = CONFIG.desktopCanvasHeight;
}
state.scale = Math.min(1, containerWidth / baseWidth);
state.root.style.height = Math.round(baseHeight * state.scale) + 'px';
state.canvas.style.transform = 'scale(' + state.scale + ')';
}
function getStep() {
return state.mode === 'mobile' ?
CONFIG.mobileStep :
CONFIG.desktopStep;
}
function getTranslateX(extraDelta) {
return state.baseOffset - (state.index * getStep()) + (extraDelta || 0);
}
function setTrackTransition(enabled) {
state.track.style.transitionDuration =
enabled ? CONFIG.transitionDuration + 'ms' : '0ms';
}
function updatePosition(animate, extraDelta) {
if (!state.track) {
return;
}
setTrackTransition(animate);
state.track.style.transform =
'translate3d(' + getTranslateX(extraDelta) + 'px, 0, 0)';
}
function updateButtons() {
var canMove = state.maxIndex > 0;
state.prevButton.disabled = !canMove || state.index <= 0;
state.nextButton.disabled = !canMove || state.index >= state.maxIndex;
state.prevButton.setAttribute(
'aria-disabled',
state.prevButton.disabled ? 'true' : 'false'
);
state.nextButton.setAttribute(
'aria-disabled',
state.nextButton.disabled ? 'true' : 'false'
);
}
function moveTo(nextIndex, source) {
var previousIndex = state.index;
state.index = clamp(nextIndex, 0, state.maxIndex);
if (state.index === previousIndex) {
updatePosition(true);
return;
}
updatePosition(true);
updateButtons();
trackEvent('td_home_skin_carousel_change', {
td_skin_carousel_device: state.mode,
td_skin_carousel_index: state.index,
td_skin_carousel_source: source || ''
});
}
function moveBy(direction, source) {
moveTo(state.index + direction, source);
}
function startDrag(event) {
if (
state.maxIndex <= 0 ||
(event.type === 'mousedown' && event.button !== 0)
) {
return;
}
state.drag.active = true;
state.drag.startX = getClientX(event);
state.drag.deltaX = 0;
state.drag.moved = false;
state.root.classList.add('is-dragging');
setTrackTransition(false);
}
function moveDrag(event) {
var delta;
if (!state.drag.active) {
return;
}
delta = getClientX(event) - state.drag.startX;
if (
(state.index <= 0 && delta > 0) ||
(state.index >= state.maxIndex && delta < 0)
) {
delta *= .35;
}
state.drag.deltaX = delta;
if (Math.abs(delta) > 6) {
state.drag.moved = true;
if (event.cancelable) {
event.preventDefault();
}
}
updatePosition(false, delta);
}
function endDrag() {
var delta;
if (!state.drag.active) {
return;
}
delta = state.drag.deltaX;
state.drag.active = false;
state.root.classList.remove('is-dragging');
if (state.drag.moved) {
state.suppressClick = true;
window.setTimeout(function () {
state.suppressClick = false;
}, 80);
}
state.drag.deltaX = 0;
if (delta <= -CONFIG.swipeThreshold) {
moveBy(1, 'swipe');
} else if (delta >= CONFIG.swipeThreshold) {
moveBy(-1, 'swipe');
} else {
updatePosition(true);
}
}
function handleClick(event) {
var actionButton = closest(event.target, '[data-tdhsc-v1-action]');
var link = closest(event.target, '[data-tdhsc-v1-link]');
var action;
if (state.suppressClick) {
event.preventDefault();
event.stopPropagation();
return;
}
if (actionButton && state.root.contains(actionButton)) {
event.preventDefault();
action = actionButton.getAttribute('data-tdhsc-v1-action');
if (action === 'prev') {
moveBy(-1, 'arrow');
} else if (action === 'next') {
moveBy(1, 'arrow');
}
return;
}
if (link && state.root.contains(link)) {
trackEvent('td_home_skin_carousel_item_click', {
td_skin_carousel_device: state.mode,
td_skin_carousel_item: link.getAttribute('data-tdhsc-v1-link') || '',
td_skin_carousel_href: link.getAttribute('href') || ''
});
}
}
function handleKeydown(event) {
if (event.key === 'ArrowLeft' || event.keyCode === 37) {
event.preventDefault();
moveBy(-1, 'keyboard');
} else if (event.key === 'ArrowRight' || event.keyCode === 39) {
event.preventDefault();
moveBy(1, 'keyboard');
}
}
function handleResize() {
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
}
state.resizeTimer = window.setTimeout(function () {
var nextMode = getMode();
state.resizeTimer = null;
if (nextMode !== state.mode) {
render();
} else {
updateScale();
updatePosition(false);
}
}, 120);
}
function bindEvents() {
state.root.addEventListener('click', handleClick, false);
state.root.addEventListener('keydown', handleKeydown, false);
state.viewport.addEventListener('mousedown', startDrag, false);
state.viewport.addEventListener('touchstart', startDrag, false);
state.viewport.addEventListener('touchmove', moveDrag, { passive: false });
state.viewport.addEventListener('touchend', endDrag, false);
state.viewport.addEventListener('touchcancel', endDrag, false);
window.addEventListener('mousemove', moveDrag, false);
window.addEventListener('mouseup', endDrag, false);
window.addEventListener('resize', handleResize, false);
}
function unbindEvents() {
if (!state.root) {
return;
}
state.root.removeEventListener('click', handleClick, false);
state.root.removeEventListener('keydown', handleKeydown, false);
state.viewport.removeEventListener('mousedown', startDrag, false);
state.viewport.removeEventListener('touchstart', startDrag, false);
state.viewport.removeEventListener('touchmove', moveDrag, false);
state.viewport.removeEventListener('touchend', endDrag, false);
state.viewport.removeEventListener('touchcancel', endDrag, false);
window.removeEventListener('mousemove', moveDrag, false);
window.removeEventListener('mouseup', endDrag, false);
window.removeEventListener('resize', handleResize, false);
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var slider;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
render();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
updateScale();
return true;
}
if (!allowFallback) {
return false;
}
slider = query(CONFIG.sliderSelector, target);
if (slider) {
insertAfter(slider, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
updateScale();
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
state.resizeTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
state.canvas = null;
state.viewport = null;
state.track = null;
state.prevButton = null;
state.nextButton = null;
}
function init() {
var existingModule = window.TDFigmaHomeSkinCarousel;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeSkinCarousel = {
version: VERSION,
destroy: destroy,
render: render,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_skin_carousel_ready', {
td_skin_carousel_count: (CONTENT.items || []).length
});
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

/* ===== TD_Figma_Home_Hot_Keywords_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-hot-keywords-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.hotKeywords);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.hotKeywords;
var CONTENT = {
title: SOURCE_DATA.heading || '',
items: (SOURCE_DATA.keywords || []).map(function (item) {
return {
id: item.id || '',
label: item.text || '',
href: item.linkUrl || ''
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdhsc-v1-root, [data-tdhsc-v1]',
fallbackAnchorSelector:
'#tdht-v1-root, [data-tdht-v1], #tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhk-v1-root',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
observer: null,
mountTimer: null,
fallbackTimer: null
};
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_hot_keywords_version', VERSION);
}
function createKeywordItem(item) {
var listItem = createElement('li', 'tdhk-v1-item');
var href = getSafeHref(item.href);
var chip = createElement(
href ? 'a' : 'span',
href ? 'tdhk-v1-chip' : 'tdhk-v1-chip-static'
);
chip.textContent = item.label || '';
chip.setAttribute('data-tdhk-v1-item', item.id || '');
if (href) {
chip.href = href;
chip.setAttribute('data-tdhk-v1-link', item.id || '');
}
listItem.appendChild(chip);
return listItem;
}
function createStructure() {
var root = createElement('section', 'tdhk-v1-root');
var inner = createElement('div', 'tdhk-v1-inner');
var heading = createElement('div', 'tdhk-v1-heading');
var title = createElement('h2', 'tdhk-v1-title');
var list = createElement('ul', 'tdhk-v1-list');
var fragment = document.createDocumentFragment();
var items = CONTENT.items || [];
var i;
root.id = CONFIG.rootId;
root.setAttribute('data-tdhk-v1', VERSION);
root.setAttribute('aria-label', '熱門關鍵字');
title.textContent = CONTENT.title || '';
for (i = 0; i < items.length; i += 1) {
fragment.appendChild(createKeywordItem(items[i]));
}
heading.appendChild(title);
list.appendChild(fragment);
inner.appendChild(heading);
inner.appendChild(list);
root.appendChild(inner);
state.root = root;
}
function handleClick(event) {
var link = closest(event.target, '[data-tdhk-v1-link]');
if (!link || !state.root || !state.root.contains(link)) {
return;
}
trackEvent('td_home_hot_keyword_click', {
td_hot_keyword_id: link.getAttribute('data-tdhk-v1-link') || '',
td_hot_keyword_label: link.textContent || '',
td_hot_keyword_href: link.getAttribute('href') || ''
});
}
function bindEvents() {
if (state.root) {
state.root.addEventListener('click', handleClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleClick, false);
}
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
}
function init() {
var existingModule = window.TDFigmaHomeHotKeywords;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeHotKeywords = {
version: VERSION,
destroy: destroy,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_hot_keywords_ready', {
td_hot_keywords_count: (CONTENT.items || []).length
});
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

/* ===== TD_Figma_Home_Exclusive_Offer_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-exclusive-offer-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.exclusiveOffer);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.exclusiveOffer;
var SOURCE_BANNER = SOURCE_DATA.campaignBanner || {};
var CONTENT = {
title: SOURCE_DATA.heading || '',
banner: {
id: SOURCE_BANNER.id || '',
alt: SOURCE_BANNER.imageAltText || '',
href: SOURCE_BANNER.linkUrl || '',
desktopImage: SOURCE_BANNER.desktopImageUrl || '',
mobileImage: SOURCE_BANNER.mobileImageUrl || '',
placeholderText: SOURCE_BANNER.placeholderText || ''
}
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var getSafeImageUrl = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdhk-v1-root, [data-tdhk-v1]',
fallbackAnchorSelector:
'#tdhsc-v1-root, [data-tdhsc-v1], ' +
'#tdht-v1-root, [data-tdht-v1], ' +
'#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdheo-v1-root',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
observer: null,
mountTimer: null,
fallbackTimer: null
};
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_exclusive_offer_version', VERSION);
}
function createBanner() {
var banner = CONTENT.banner || {};
var href = getSafeHref(banner.href);
var desktopImage = getSafeImageUrl(banner.desktopImage);
var mobileImage = getSafeImageUrl(banner.mobileImage);
var holder = createElement(
href ? 'a' : 'div',
href ? 'tdheo-v1-banner-link' : 'tdheo-v1-banner'
);
var picture;
var source;
var image;
var placeholder;
holder.setAttribute('data-tdheo-v1-banner', banner.id || '');
if (href) {
holder.href = href;
holder.setAttribute('data-tdheo-v1-link', banner.id || '');
}
if (desktopImage || mobileImage) {
picture = createElement('picture', 'tdheo-v1-picture');
if (mobileImage) {
source = document.createElement('source');
source.media = '(max-width: 991px)';
source.srcset = mobileImage;
picture.appendChild(source);
}
image = createElement('img', 'tdheo-v1-image');
image.src = desktopImage || mobileImage;
image.alt = banner.alt || '';
image.loading = 'lazy';
image.decoding = 'async';
picture.appendChild(image);
holder.appendChild(picture);
} else {
placeholder = createElement('span', 'tdheo-v1-placeholder');
placeholder.textContent = banner.placeholderText || '';
holder.appendChild(placeholder);
}
return holder;
}
function createStructure() {
var root = createElement('section', 'tdheo-v1-root');
var inner = createElement('div', 'tdheo-v1-inner');
var heading = createElement('div', 'tdheo-v1-heading');
var title = createElement('h2', 'tdheo-v1-title');
root.id = CONFIG.rootId;
root.setAttribute('data-tdheo-v1', VERSION);
root.setAttribute('aria-label', CONTENT.title || '官網限時活動');
title.textContent = CONTENT.title || '';
heading.appendChild(title);
inner.appendChild(heading);
inner.appendChild(createBanner());
root.appendChild(inner);
state.root = root;
}
function handleClick(event) {
var link = closest(event.target, '[data-tdheo-v1-link]');
if (!link || !state.root || !state.root.contains(link)) {
return;
}
trackEvent('td_home_exclusive_offer_click', {
td_exclusive_offer_id:
link.getAttribute('data-tdheo-v1-link') || '',
td_exclusive_offer_href:
link.getAttribute('href') || ''
});
}
function bindEvents() {
if (state.root) {
state.root.addEventListener('click', handleClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleClick, false);
}
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
}
function init() {
var existingModule = window.TDFigmaHomeExclusiveOffer;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeExclusiveOffer = {
version: VERSION,
destroy: destroy,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_exclusive_offer_ready', {
td_exclusive_offer_id:
(CONTENT.banner && CONTENT.banner.id) || ''
});
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

/* ===== TD_Figma_Home_Product_Tabs_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-product-tabs-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.productTabs);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.productTabs;
function adaptProduct(product) {
return {
id: product.id || '',
cornerLabels: (product.imageBadges || []).map(function (badge) {
return {
label: badge.text || '',
background: badge.backgroundColor || '',
color: badge.textColor || ''
};
}),
defaultImage: product.defaultImageUrl || '',
hoverImage: product.hoverImageUrl || '',
imageAlt: product.imageAltText || '',
tags: product.productTags || [],
name: product.productName || '',
originalPrice: product.originalPriceText || '',
salePrice: product.salePriceText || '',
href: product.linkUrl || '',
buttonLabel: product.purchaseButtonText || '立即購買',
desktopOrder: product.desktopDisplayOrder,
mobileOrder: product.mobileDisplayOrder,
bottomImageLabel: product.bottomImageLabel || null
};
}
var CONTENT = {
tabs: (SOURCE_DATA.tabs || []).map(function (tab) {
return {
id: tab.id || '',
desktopLabel: tab.desktopLabel || '',
mobileLabel: tab.mobileLabel || '',
products: (tab.products || []).map(adaptProduct)
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeHref = Core.url.sanitize;
var getSafeImageUrl = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdheo-v1-root, [data-tdheo-v1]',
fallbackAnchorSelector:
'#tdhk-v1-root, [data-tdhk-v1], ' +
'#tdhsc-v1-root, [data-tdhsc-v1], ' +
'#tdht-v1-root, [data-tdht-v1], ' +
'#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhpt-v1-root',
defaultTabId: SOURCE_DATA.defaultTabId || 'recommended',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
activeTabId: '',
observer: null,
mountTimer: null,
fallbackTimer: null
};
function findTab(tabId) {
var tabs = CONTENT.tabs || [];
var i;
for (i = 0; i < tabs.length; i += 1) {
if (tabs[i].id === tabId) {
return tabs[i];
}
}
return null;
}
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_product_tabs_version', VERSION);
}
function createCornerLabels(labels) {
var holder = createElement('div', 'tdhpt-v1-corner-labels');
var fragment = document.createDocumentFragment();
var label;
var item;
var i;
for (i = 0; i < labels.length; i += 1) {
item = labels[i] || {};
label = createElement('span', 'tdhpt-v1-corner-label');
label.textContent = item.label || '';
label.style.setProperty(
'--tdhpt-v1-badge-background',
item.background || '#55a9d5'
);
label.style.setProperty(
'--tdhpt-v1-badge-text-color',
item.color || '#ffffff'
);
fragment.appendChild(label);
}
holder.appendChild(fragment);
return holder;
}
function createBottomImageLabel(data) {
var item = data || {};
var desktopImageUrl = getSafeImageUrl(item.desktopImageUrl || '');
var mobileImageUrl = getSafeImageUrl(item.mobileImageUrl || '') || desktopImageUrl;
var picture;
var source;
var image;
if (!desktopImageUrl && !mobileImageUrl) {
return null;
}
picture = createElement('picture', 'tdhpt-v1-bottom-image-label');
if (mobileImageUrl) {
source = document.createElement('source');
source.media = '(max-width: 991px)';
source.srcset = mobileImageUrl;
picture.appendChild(source);
}
image = createElement('img', 'tdhpt-v1-bottom-image-label-image');
image.src = desktopImageUrl || mobileImageUrl;
image.alt = item.imageAltText || '';
image.loading = 'lazy';
image.decoding = 'async';
picture.appendChild(image);
return picture;
}
function createTags(tags) {
var holder = createElement('div', 'tdhpt-v1-tags');
var fragment = document.createDocumentFragment();
var tag;
var i;
for (i = 0; i < tags.length; i += 1) {
tag = createElement('span', 'tdhpt-v1-tag');
tag.textContent = tags[i] || '';
fragment.appendChild(tag);
}
holder.appendChild(fragment);
return holder;
}
function createProductCard(product, index) {
var card = createElement('article', 'tdhpt-v1-card');
var media = createElement('div', 'tdhpt-v1-media');
var defaultImage = createElement(
'img',
'tdhpt-v1-image tdhpt-v1-image--default'
);
var hoverImage = createElement(
'img',
'tdhpt-v1-image tdhpt-v1-image--hover'
);
var content = createElement('div', 'tdhpt-v1-content');
var name = createElement('h3', 'tdhpt-v1-name');
var price = createElement('div', 'tdhpt-v1-price');
var originalPrice = createElement('span', 'tdhpt-v1-original-price');
var salePrice = createElement('span', 'tdhpt-v1-sale-price');
var href = getSafeHref(product.href);
var buy = createElement(
href ? 'a' : 'span',
href ? 'tdhpt-v1-buy' : 'tdhpt-v1-buy-static'
);
var defaultImageUrl = getSafeImageUrl(product.defaultImage);
var hoverImageUrl = getSafeImageUrl(product.hoverImage) || defaultImageUrl;
var labels = product.cornerLabels || [];
var tags = product.tags || [];
var bottomImageLabel = createBottomImageLabel(product.bottomImageLabel);
card.setAttribute('data-tdhpt-v1-product', product.id || String(index));
card.style.setProperty(
'--tdhpt-v1-desktop-order',
String(product.desktopOrder || index + 1)
);
card.style.setProperty(
'--tdhpt-v1-mobile-order',
String(product.mobileOrder || index + 1)
);
defaultImage.src = defaultImageUrl;
defaultImage.alt = product.imageAlt || product.name || '';
defaultImage.loading = 'lazy';
defaultImage.decoding = 'async';
hoverImage.src = hoverImageUrl;
hoverImage.alt = '';
hoverImage.loading = 'lazy';
hoverImage.decoding = 'async';
hoverImage.setAttribute('aria-hidden', 'true');
media.appendChild(defaultImage);
media.appendChild(hoverImage);
if (labels.length) {
media.appendChild(createCornerLabels(labels));
}
if (bottomImageLabel) {
media.appendChild(bottomImageLabel);
}
if (tags.length) {
content.appendChild(createTags(tags));
}
name.textContent = product.name || '';
originalPrice.textContent = product.originalPrice || '';
salePrice.textContent = product.salePrice || '';
buy.textContent = product.buttonLabel || '立即購買';
if (href) {
buy.href = href;
buy.setAttribute('data-tdhpt-v1-product-link', product.id || String(index));
}
price.appendChild(originalPrice);
price.appendChild(salePrice);
content.appendChild(name);
content.appendChild(price);
content.appendChild(buy);
card.appendChild(media);
card.appendChild(content);
return card;
}
function createPanel(tab, tabIndex) {
var panel = createElement('div', 'tdhpt-v1-panel');
var grid = createElement('div', 'tdhpt-v1-grid');
var products = tab.products || [];
var fragment = document.createDocumentFragment();
var empty;
var i;
panel.id = 'tdhpt-v1-panel-' + tab.id;
panel.setAttribute('role', 'tabpanel');
panel.setAttribute('aria-labelledby', 'tdhpt-v1-tab-' + tab.id);
panel.setAttribute('data-tdhpt-v1-panel', tab.id);
if (products.length) {
for (i = 0; i < products.length; i += 1) {
fragment.appendChild(createProductCard(products[i], i));
}
grid.appendChild(fragment);
panel.appendChild(grid);
} else {
empty = createElement('div', 'tdhpt-v1-empty');
empty.textContent = '此分頁尚未設定商品';
panel.appendChild(empty);
}
if (tab.id === state.activeTabId) {
panel.classList.add('is-active');
} else {
panel.hidden = true;
}
return panel;
}
function createTabButton(tab, tabIndex) {
var button = createElement('button', 'tdhpt-v1-tab');
var desktopLabel = createElement('span', 'tdhpt-v1-tab-label-desktop');
var mobileLabel = createElement('span', 'tdhpt-v1-tab-label-mobile');
button.type = 'button';
button.id = 'tdhpt-v1-tab-' + tab.id;
button.setAttribute('role', 'tab');
button.setAttribute('data-tdhpt-v1-tab', tab.id);
button.setAttribute('aria-controls', 'tdhpt-v1-panel-' + tab.id);
button.setAttribute(
'aria-selected',
tab.id === state.activeTabId ? 'true' : 'false'
);
button.tabIndex = tab.id === state.activeTabId ? 0 : -1;
desktopLabel.textContent = tab.desktopLabel || tab.label || '';
mobileLabel.textContent =
tab.mobileLabel || tab.desktopLabel || tab.label || '';
button.appendChild(desktopLabel);
button.appendChild(mobileLabel);
if (tab.id === state.activeTabId) {
button.classList.add('is-active');
}
return button;
}
function createStructure() {
var root = createElement('section', 'tdhpt-v1-root');
var inner = createElement('div', 'tdhpt-v1-inner');
var tabsWrap = createElement('div', 'tdhpt-v1-tabs-wrap');
var tabs = createElement('div', 'tdhpt-v1-tabs');
var panels = createElement('div', 'tdhpt-v1-panels');
var tabData = CONTENT.tabs || [];
var tabFragment = document.createDocumentFragment();
var panelFragment = document.createDocumentFragment();
var defaultTab = findTab(CONFIG.defaultTabId);
var i;
state.activeTabId = defaultTab ?
defaultTab.id :
(tabData[0] ? tabData[0].id : '');
root.id = CONFIG.rootId;
root.setAttribute('data-tdhpt-v1', VERSION);
root.setAttribute('aria-label', '首頁推薦商品');
tabs.setAttribute('role', 'tablist');
tabs.setAttribute('aria-label', '商品分類分頁');
for (i = 0; i < tabData.length; i += 1) {
tabFragment.appendChild(createTabButton(tabData[i], i));
panelFragment.appendChild(createPanel(tabData[i], i));
}
tabs.appendChild(tabFragment);
panels.appendChild(panelFragment);
tabsWrap.appendChild(tabs);
inner.appendChild(tabsWrap);
inner.appendChild(panels);
root.appendChild(inner);
state.root = root;
}
function activateTab(tabId, focusTab) {
var tab = findTab(tabId);
var buttons;
var panels;
var button;
var panel;
var i;
if (!tab || tabId === state.activeTabId || !state.root) {
return;
}
state.activeTabId = tabId;
buttons = state.root.querySelectorAll('[data-tdhpt-v1-tab]');
panels = state.root.querySelectorAll('[data-tdhpt-v1-panel]');
for (i = 0; i < buttons.length; i += 1) {
button = buttons[i];
if (button.getAttribute('data-tdhpt-v1-tab') === tabId) {
button.classList.add('is-active');
button.setAttribute('aria-selected', 'true');
button.tabIndex = 0;
if (focusTab) {
button.focus();
}
} else {
button.classList.remove('is-active');
button.setAttribute('aria-selected', 'false');
button.tabIndex = -1;
}
}
for (i = 0; i < panels.length; i += 1) {
panel = panels[i];
if (panel.getAttribute('data-tdhpt-v1-panel') === tabId) {
panel.hidden = false;
panel.classList.remove('is-active');
panel.offsetHeight;
panel.classList.add('is-active');
} else {
panel.classList.remove('is-active');
panel.hidden = true;
}
}
trackEvent('td_home_product_tab_change', {
td_product_tab_id: tabId,
td_product_tab_label:
tab.desktopLabel || tab.mobileLabel || tab.label || ''
});
}
function moveTabFocus(currentButton, direction) {
var buttons = state.root.querySelectorAll('[data-tdhpt-v1-tab]');
var currentIndex = -1;
var targetIndex;
var i;
for (i = 0; i < buttons.length; i += 1) {
if (buttons[i] === currentButton) {
currentIndex = i;
break;
}
}
if (currentIndex < 0 || !buttons.length) {
return;
}
targetIndex = (currentIndex + direction + buttons.length) % buttons.length;
activateTab(
buttons[targetIndex].getAttribute('data-tdhpt-v1-tab'),
true
);
}
function handleClick(event) {
var tabButton = closest(event.target, '[data-tdhpt-v1-tab]');
var productLink = closest(event.target, '[data-tdhpt-v1-product-link]');
if (tabButton && state.root.contains(tabButton)) {
event.preventDefault();
activateTab(
tabButton.getAttribute('data-tdhpt-v1-tab'),
false
);
return;
}
if (productLink && state.root.contains(productLink)) {
trackEvent('td_home_product_click', {
td_product_tab_id: state.activeTabId,
td_product_id:
productLink.getAttribute('data-tdhpt-v1-product-link') || '',
td_product_href:
productLink.getAttribute('href') || ''
});
}
}
function handleKeydown(event) {
var tabButton = closest(event.target, '[data-tdhpt-v1-tab]');
if (!tabButton || !state.root.contains(tabButton)) {
return;
}
if (event.key === 'ArrowRight') {
event.preventDefault();
moveTabFocus(tabButton, 1);
} else if (event.key === 'ArrowLeft') {
event.preventDefault();
moveTabFocus(tabButton, -1);
} else if (event.key === 'Home') {
event.preventDefault();
activateTab(
state.root.querySelector('[data-tdhpt-v1-tab]')
.getAttribute('data-tdhpt-v1-tab'),
true
);
} else if (event.key === 'End') {
var buttons = state.root.querySelectorAll('[data-tdhpt-v1-tab]');
event.preventDefault();
activateTab(
buttons[buttons.length - 1].getAttribute('data-tdhpt-v1-tab'),
true
);
}
}
function bindEvents() {
if (!state.root) {
return;
}
state.root.addEventListener('click', handleClick, false);
state.root.addEventListener('keydown', handleKeydown, false);
}
function unbindEvents() {
if (!state.root) {
return;
}
state.root.removeEventListener('click', handleClick, false);
state.root.removeEventListener('keydown', handleKeydown, false);
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
state.activeTabId = '';
}
function init() {
var existingModule = window.TDFigmaHomeProductTabs;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeProductTabs = {
version: VERSION,
destroy: destroy,
mount: mount,
activateTab: activateTab
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_product_tabs_ready', {
td_product_tabs_count: (CONTENT.tabs || []).length,
td_product_tab_default: state.activeTabId
});
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

/* ===== TD_Figma_Home_User_Reviews_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-user-reviews-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.userReviews);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.userReviews;
function adaptReviewMedia(item) {
if ((item || {}).mediaType === 'youtube') {
return {
type: 'youtube',
url: item.videoUrl || '',
title: item.title || ''
};
}
return {
type: 'image',
src: (item || {}).imageUrl || '',
alt: (item || {}).imageAltText || '',
position: (item || {}).imagePosition || 'center'
};
}
var CONTENT = {
title: SOURCE_DATA.heading || '',
reviews: (SOURCE_DATA.items || []).map(function (review) {
return {
id: review.id || '',
leftImage: review.cardImageUrl || '',
leftImageAlt: review.cardImageAltText || '',
leftImagePosition: review.cardImagePosition || 'center',
stars: review.starRating,
age: review.ageText || '',
gender: review.genderText || '',
date: review.publishedDate || '',
skinCondition: review.skinConditionText || '',
review: review.reviewText || '',
modalAspectRatio: review.modalMediaAspectRatio || '3 / 4',
media: (review.modalMedia || []).map(adaptReviewMedia)
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeUrl = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdhpt-v1-root, [data-tdhpt-v1]',
fallbackAnchorSelector:
'#tdheo-v1-root, [data-tdheo-v1], ' +
'#tdhk-v1-root, [data-tdhk-v1], ' +
'#tdhsc-v1-root, [data-tdhsc-v1], ' +
'#tdht-v1-root, [data-tdht-v1], ' +
'#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhur-v1-root',
modalId: 'tdhur-v1-modal',
breakpoint: 992,
desktopCardWidth: 600,
desktopGap: 30,
desktopSpeed: 64,
mobileCardWidth: 190,
mobileGap: 20,
mobileSpeed: 32,
mountDelay: 60,
fallbackDelay: 3000,
closeDuration: 300
};
var state = {
root: null,
viewport: null,
track: null,
modal: null,
modalDialog: null,
modalClose: null,
modalMedia: null,
modalContent: null,
modalPreviousFocus: null,
reviews: [],
cycleReviews: [],
cycleWidth: 0,
offset: 0,
speed: 0,
paused: false,
modalOpen: false,
activeReview: null,
activeMediaIndex: 0,
animationFrame: null,
lastFrameTime: 0,
resizeTimer: null,
observer: null,
mountTimer: null,
fallbackTimer: null,
closeTimer: null
};
function clampNumber(value, minimum, maximum) {
var number = parseFloat(value);
if (isNaN(number)) {
number = minimum;
}
return Math.max(minimum, Math.min(maximum, number));
}
function getMode() {
return window.innerWidth < CONFIG.breakpoint ? 'mobile' : 'desktop';
}
function getCardMetrics() {
if (getMode() === 'mobile') {
return {
width: CONFIG.mobileCardWidth,
gap: CONFIG.mobileGap,
speed: CONFIG.mobileSpeed
};
}
return {
width: CONFIG.desktopCardWidth,
gap: CONFIG.desktopGap,
speed: CONFIG.desktopSpeed
};
}
function findReview(reviewId) {
var reviews = CONTENT.reviews || [];
var i;
for (i = 0; i < reviews.length; i += 1) {
if (reviews[i].id === reviewId) {
return reviews[i];
}
}
return null;
}
function getYouTubeId(url) {
var value = String(url || '');
var match = value.match(
/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
);
return match ? match[1] : '';
}
function prefersReducedMotion() {
return !!(
window.matchMedia &&
window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
}
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_user_reviews_version', VERSION);
}
function createStars(stars, className) {
var holder = createElement('span', className || 'tdhur-v1-stars');
var activeCount = Math.round(clampNumber(stars, 0, 5));
var star;
var i;
holder.setAttribute('aria-label', activeCount + ' 顆星');
for (i = 1; i <= 5; i += 1) {
star = createElement(
'span',
'tdhur-v1-star' + (i <= activeCount ? ' is-active' : '')
);
star.textContent = '★';
star.setAttribute('aria-hidden', 'true');
holder.appendChild(star);
}
return holder;
}
function createMediaCount(count) {
var holder = createElement('span', 'tdhur-v1-media-count');
holder.innerHTML =
'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
'<rect x="2" y="3" width="9" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
'<path d="M5 1.5h8.5A1.5 1.5 0 0 1 15 3v8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
'</svg>' +
'<span>' + count + '</span>';
return holder;
}
function createReviewCard(review, isClone) {
var card = createElement('button', 'tdhur-v1-card');
var media = createElement('span', 'tdhur-v1-card-media');
var image = createElement('img', 'tdhur-v1-card-image');
var content = createElement('span', 'tdhur-v1-card-content');
var meta = createElement('span', 'tdhur-v1-card-meta');
var person = createElement('span', 'tdhur-v1-person');
var date = createElement('span', 'tdhur-v1-date');
var skin = createElement('span', 'tdhur-v1-skin');
var reviewText = createElement('span', 'tdhur-v1-review');
var more = createElement('span', 'tdhur-v1-more');
var mediaItems = review.media || [];
card.type = 'button';
card.setAttribute('data-tdhur-v1-review', review.id || '');
card.setAttribute('aria-haspopup', 'dialog');
card.setAttribute(
'aria-label',
'開啟 ' +
(review.age || '') +
(review.gender ? ' ' + review.gender : '') +
' 的評論'
);
if (isClone) {
card.setAttribute('data-tdhur-v1-clone', 'true');
card.tabIndex = -1;
}
image.src = getSafeUrl(review.leftImage);
image.alt = review.leftImageAlt || '';
image.loading = 'lazy';
image.decoding = 'async';
image.style.objectPosition = review.leftImagePosition || 'center';
media.appendChild(image);
if (mediaItems.length > 1) {
media.appendChild(createMediaCount(mediaItems.length));
}
person.textContent =
(review.age || '') +
(review.gender ? ' ' + review.gender : '');
date.textContent = review.date || '';
skin.textContent = review.skinCondition || '';
reviewText.textContent = review.review || '';
more.textContent = 'MORE';
meta.appendChild(createStars(review.stars));
meta.appendChild(person);
meta.appendChild(date);
content.appendChild(meta);
content.appendChild(skin);
content.appendChild(reviewText);
content.appendChild(more);
card.appendChild(media);
card.appendChild(content);
return card;
}
function createCycle(reviews, isClone) {
var fragment = document.createDocumentFragment();
var i;
for (i = 0; i < reviews.length; i += 1) {
fragment.appendChild(createReviewCard(reviews[i], isClone));
}
return fragment;
}
function calculateCycleReviews() {
var reviews = CONTENT.reviews || [];
var metrics = getCardMetrics();
var viewportWidth = state.viewport ?
state.viewport.clientWidth :
window.innerWidth;
var baseWidth;
var repeats;
var cycle = [];
var i;
var j;
if (!reviews.length) {
return [];
}
baseWidth = reviews.length * (metrics.width + metrics.gap);
repeats = Math.max(
1,
Math.ceil(
(viewportWidth + metrics.width + metrics.gap) /
Math.max(1, baseWidth)
)
);
for (i = 0; i < repeats; i += 1) {
for (j = 0; j < reviews.length; j += 1) {
cycle.push(reviews[j]);
}
}
return cycle;
}
function renderMarquee() {
var metrics = getCardMetrics();
var cycleLength;
if (!state.track || !state.viewport) {
return;
}
state.reviews = CONTENT.reviews || [];
state.cycleReviews = calculateCycleReviews();
state.track.innerHTML = '';
state.track.appendChild(createCycle(state.cycleReviews, false));
state.track.appendChild(createCycle(state.cycleReviews, true));
cycleLength = state.cycleReviews.length;
state.cycleWidth = cycleLength * (metrics.width + metrics.gap);
state.speed = metrics.speed;
state.offset = Math.min(
state.cycleWidth / 3,
metrics.width * .38
);
applyTrackPosition();
}
function applyTrackPosition() {
if (!state.track) {
return;
}
state.track.style.transform =
'translate3d(' + (-state.offset) + 'px, 0, 0)';
}
function animateMarquee(timestamp) {
var delta;
if (!state.root || !state.track) {
return;
}
if (!state.lastFrameTime) {
state.lastFrameTime = timestamp;
}
delta = Math.min(100, timestamp - state.lastFrameTime);
state.lastFrameTime = timestamp;
if (
!state.paused &&
!state.modalOpen &&
!document.hidden &&
state.cycleWidth > 0 &&
!prefersReducedMotion()
) {
state.offset += state.speed * (delta / 1000);
while (state.offset >= state.cycleWidth) {
state.offset -= state.cycleWidth;
}
applyTrackPosition();
}
state.animationFrame = window.requestAnimationFrame(animateMarquee);
}
function startMarquee() {
stopMarquee();
state.lastFrameTime = 0;
state.animationFrame = window.requestAnimationFrame(animateMarquee);
}
function stopMarquee() {
if (state.animationFrame) {
window.cancelAnimationFrame(state.animationFrame);
state.animationFrame = null;
}
}
function createModalStructure() {
var modal = createElement('div', 'tdhur-v1-modal');
var dialog = createElement('div', 'tdhur-v1-modal-dialog');
var close = createElement('button', 'tdhur-v1-modal-close');
var media = createElement('div', 'tdhur-v1-modal-media');
var content = createElement('div', 'tdhur-v1-modal-content');
modal.id = CONFIG.modalId;
modal.setAttribute('data-tdhur-v1-modal', '');
modal.setAttribute('aria-hidden', 'true');
dialog.setAttribute('role', 'dialog');
dialog.setAttribute('aria-modal', 'true');
dialog.setAttribute('aria-label', '使用者評論詳情');
close.type = 'button';
close.setAttribute('data-tdhur-v1-close', '');
close.setAttribute('aria-label', '關閉評論');
dialog.appendChild(close);
dialog.appendChild(media);
dialog.appendChild(content);
modal.appendChild(dialog);
document.body.appendChild(modal);
state.modal = modal;
state.modalDialog = dialog;
state.modalClose = close;
state.modalMedia = media;
state.modalContent = content;
}
function createImageMedia(item) {
var image = createElement('img', 'tdhur-v1-modal-image');
image.src = getSafeUrl(item.src);
image.alt = item.alt || '';
image.decoding = 'async';
image.style.objectPosition = item.position || 'center';
return image;
}
function createYouTubeMedia(item) {
var youtubeId = getYouTubeId(item.url);
var iframe = createElement('iframe', 'tdhur-v1-modal-video');
iframe.title = item.title || 'YouTube 影片';
iframe.src = youtubeId ?
'https://www.youtube-nocookie.com/embed/' +
youtubeId +
'?rel=0&modestbranding=1' :
'';
iframe.allow =
'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
'gyroscope; picture-in-picture; web-share';
iframe.setAttribute('allowfullscreen', '');
return iframe;
}
function createModalDots(mediaItems) {
var dots = createElement('div', 'tdhur-v1-modal-dots');
var button;
var i;
for (i = 0; i < mediaItems.length; i += 1) {
button = createElement(
'button',
'tdhur-v1-modal-dot' +
(i === state.activeMediaIndex ? ' is-active' : '')
);
button.type = 'button';
button.setAttribute('data-tdhur-v1-media-index', String(i));
button.setAttribute('aria-label', '切換至第 ' + (i + 1) + ' 個媒體');
dots.appendChild(button);
}
return dots;
}
function createModalNav(direction) {
var button = createElement(
'button',
'tdhur-v1-modal-nav tdhur-v1-modal-nav--' + direction
);
button.type = 'button';
button.setAttribute('data-tdhur-v1-media-nav', direction);
button.setAttribute(
'aria-label',
direction === 'prev' ? '上一張' : '下一張'
);
return button;
}
function renderModalMedia() {
var review = state.activeReview;
var mediaItems = review ? (review.media || []) : [];
var item;
var stage;
if (!state.modalMedia) {
return;
}
state.modalMedia.innerHTML = '';
state.modalMedia.style.setProperty(
'--tdhur-v1-modal-ratio',
(review && review.modalAspectRatio) || '3 / 4'
);
if (!mediaItems.length) {
return;
}
state.activeMediaIndex =
(state.activeMediaIndex + mediaItems.length) % mediaItems.length;
item = mediaItems[state.activeMediaIndex] || {};
stage = createElement('div', 'tdhur-v1-modal-media-stage');
if (item.type === 'youtube') {
stage.appendChild(createYouTubeMedia(item));
} else {
stage.appendChild(createImageMedia(item));
}
state.modalMedia.appendChild(stage);
if (mediaItems.length > 1) {
state.modalMedia.appendChild(createModalNav('prev'));
state.modalMedia.appendChild(createModalNav('next'));
state.modalMedia.appendChild(createModalDots(mediaItems));
}
}
function renderModalContent() {
var review = state.activeReview;
var meta;
var person;
var date;
var skin;
var reviewText;
if (!state.modalContent || !review) {
return;
}
state.modalContent.innerHTML = '';
meta = createElement('div', 'tdhur-v1-modal-meta');
person = createElement('span', 'tdhur-v1-person');
date = createElement('span', 'tdhur-v1-date');
skin = createElement('div', 'tdhur-v1-modal-skin');
reviewText = createElement('p', 'tdhur-v1-modal-review');
person.textContent =
(review.age || '') +
(review.gender ? ' ' + review.gender : '');
date.textContent = review.date || '';
skin.textContent = review.skinCondition || '';
reviewText.textContent = review.review || '';
meta.appendChild(createStars(review.stars));
meta.appendChild(person);
meta.appendChild(date);
state.modalContent.appendChild(meta);
state.modalContent.appendChild(skin);
state.modalContent.appendChild(reviewText);
}
function openModal(reviewId, trigger) {
var review = findReview(reviewId);
if (!review) {
return;
}
if (!state.modal) {
createModalStructure();
}
if (state.closeTimer) {
window.clearTimeout(state.closeTimer);
state.closeTimer = null;
}
state.activeReview = review;
state.activeMediaIndex = 0;
state.modalPreviousFocus = trigger || document.activeElement;
state.modalOpen = true;
renderModalMedia();
renderModalContent();
state.modal.classList.add('is-mounted');
state.modal.setAttribute('aria-hidden', 'false');
document.body.classList.add('tdhur-v1-modal-open');
state.modal.offsetHeight;
state.modal.classList.add('is-open');
window.setTimeout(function () {
if (state.modalClose) {
state.modalClose.focus();
}
}, 30);
trackEvent('td_home_review_open', {
td_review_id: review.id || ''
});
}
function closeModal(source) {
if (!state.modal || !state.modalOpen) {
return;
}
state.modalOpen = false;
state.modal.classList.remove('is-open');
state.modal.setAttribute('aria-hidden', 'true');
document.body.classList.remove('tdhur-v1-modal-open');
if (state.closeTimer) {
window.clearTimeout(state.closeTimer);
}
state.closeTimer = window.setTimeout(function () {
if (state.modal) {
state.modal.classList.remove('is-mounted');
}
if (
state.modalPreviousFocus &&
typeof state.modalPreviousFocus.focus === 'function'
) {
state.modalPreviousFocus.focus();
}
state.activeReview = null;
state.activeMediaIndex = 0;
state.closeTimer = null;
}, CONFIG.closeDuration);
trackEvent('td_home_review_close', {
td_review_close_source: source || ''
});
}
function changeModalMedia(directionOrIndex) {
var mediaItems =
state.activeReview ?
(state.activeReview.media || []) :
[];
var nextIndex;
if (mediaItems.length < 2) {
return;
}
if (typeof directionOrIndex === 'number') {
nextIndex = directionOrIndex;
} else {
nextIndex =
state.activeMediaIndex +
(directionOrIndex === 'prev' ? -1 : 1);
}
state.activeMediaIndex =
(nextIndex + mediaItems.length) % mediaItems.length;
renderModalMedia();
trackEvent('td_home_review_media_change', {
td_review_id: state.activeReview.id || '',
td_review_media_index: state.activeMediaIndex,
td_review_media_type:
(mediaItems[state.activeMediaIndex] || {}).type || 'image'
});
}
function createStructure() {
var root = createElement('section', 'tdhur-v1-root');
var heading = createElement('div', 'tdhur-v1-heading');
var title = createElement('h2', 'tdhur-v1-title');
var viewport = createElement('div', 'tdhur-v1-viewport');
var track = createElement('div', 'tdhur-v1-track');
root.id = CONFIG.rootId;
root.setAttribute('data-tdhur-v1', VERSION);
root.setAttribute('aria-label', CONTENT.title || '好評推薦');
title.textContent = CONTENT.title || '';
heading.appendChild(title);
viewport.appendChild(track);
root.appendChild(heading);
root.appendChild(viewport);
state.root = root;
state.viewport = viewport;
state.track = track;
renderMarquee();
}
function handleRootClick(event) {
var card = closest(event.target, '[data-tdhur-v1-review]');
if (!card || !state.root || !state.root.contains(card)) {
return;
}
event.preventDefault();
openModal(
card.getAttribute('data-tdhur-v1-review'),
card
);
}
function handleModalClick(event) {
var close = closest(event.target, '[data-tdhur-v1-close]');
var nav = closest(event.target, '[data-tdhur-v1-media-nav]');
var dot = closest(event.target, '[data-tdhur-v1-media-index]');
if (close) {
event.preventDefault();
closeModal('button');
return;
}
if (nav) {
event.preventDefault();
changeModalMedia(nav.getAttribute('data-tdhur-v1-media-nav'));
return;
}
if (dot) {
event.preventDefault();
changeModalMedia(
parseInt(dot.getAttribute('data-tdhur-v1-media-index'), 10)
);
return;
}
if (event.target === state.modal) {
closeModal('backdrop');
}
}
function handleDocumentKeydown(event) {
if (!state.modalOpen) {
return;
}
if (event.key === 'Escape') {
event.preventDefault();
closeModal('escape');
} else if (event.key === 'ArrowLeft') {
event.preventDefault();
changeModalMedia('prev');
} else if (event.key === 'ArrowRight') {
event.preventDefault();
changeModalMedia('next');
}
}
function handleMouseEnter() {
state.paused = true;
}
function handleMouseLeave() {
state.paused = false;
}
function handleFocusIn() {
state.paused = true;
}
function handleFocusOut(event) {
if (
state.root &&
!state.root.contains(event.relatedTarget)
) {
state.paused = false;
}
}
function handleResize() {
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
}
state.resizeTimer = window.setTimeout(function () {
state.resizeTimer = null;
renderMarquee();
}, 150);
}
function bindEvents() {
if (!state.root) {
return;
}
state.root.addEventListener('click', handleRootClick, false);
state.root.addEventListener('mouseenter', handleMouseEnter, false);
state.root.addEventListener('mouseleave', handleMouseLeave, false);
state.root.addEventListener('focusin', handleFocusIn, false);
state.root.addEventListener('focusout', handleFocusOut, false);
window.addEventListener('resize', handleResize, false);
document.addEventListener('keydown', handleDocumentKeydown, false);
}
function bindModalEvents() {
if (state.modal) {
state.modal.addEventListener('click', handleModalClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleRootClick, false);
state.root.removeEventListener('mouseenter', handleMouseEnter, false);
state.root.removeEventListener('mouseleave', handleMouseLeave, false);
state.root.removeEventListener('focusin', handleFocusIn, false);
state.root.removeEventListener('focusout', handleFocusOut, false);
}
if (state.modal) {
state.modal.removeEventListener('click', handleModalClick, false);
}
window.removeEventListener('resize', handleResize, false);
document.removeEventListener('keydown', handleDocumentKeydown, false);
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
startMarquee();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
stopMarquee();
if (state.resizeTimer) {
window.clearTimeout(state.resizeTimer);
state.resizeTimer = null;
}
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.closeTimer) {
window.clearTimeout(state.closeTimer);
state.closeTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
document.body.classList.remove('tdhur-v1-modal-open');
if (state.modal && state.modal.parentNode) {
state.modal.parentNode.removeChild(state.modal);
}
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
state.viewport = null;
state.track = null;
state.modal = null;
state.modalDialog = null;
state.modalClose = null;
state.modalMedia = null;
state.modalContent = null;
state.modalOpen = false;
state.activeReview = null;
}
function init() {
var existingModule = window.TDFigmaHomeUserReviews;
if (existingModule && typeof existingModule.destroy === 'function') {
existingModule.destroy();
}
window.TDFigmaHomeUserReviews = {
version: VERSION,
destroy: destroy,
mount: mount,
openReview: openModal,
closeReview: closeModal
};
createModalStructure();
bindModalEvents();
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_user_reviews_ready', {
td_user_reviews_count: (CONTENT.reviews || []).length
});
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

/* ===== TD_Figma_Home_Product_Series_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-product-series-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.productSeries);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.productSeries;
var CONTENT = {
title: SOURCE_DATA.heading || '',
items: (SOURCE_DATA.items || []).map(function (item) {
return {
id: item.id || '',
label: item.seriesName || '',
href: item.linkUrl || '',
desktopImage: item.desktopImageUrl || '',
mobileImage: item.mobileImageUrl || '',
alt: item.imageAltText || '',
objectPosition: item.imagePosition || 'center'
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeUrl = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdhur-v1-root, [data-tdhur-v1]',
fallbackAnchorSelector:
'#tdhpt-v1-root, [data-tdhpt-v1], ' +
'#tdheo-v1-root, [data-tdheo-v1], ' +
'#tdhk-v1-root, [data-tdhk-v1], ' +
'#tdhsc-v1-root, [data-tdhsc-v1], ' +
'#tdht-v1-root, [data-tdht-v1], ' +
'#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhps-v1-root',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
observer: null,
mountTimer: null,
fallbackTimer: null
};
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_product_series_version', VERSION);
}
function createSeriesCard(item, index) {
var href = getSafeUrl(item.href);
var desktopImage = getSafeUrl(item.desktopImage);
var mobileImage = getSafeUrl(item.mobileImage) || desktopImage;
var holder = createElement(
href ? 'a' : 'div',
href ? 'tdhps-v1-card-link' : 'tdhps-v1-card'
);
var picture = createElement('picture', 'tdhps-v1-picture');
var source;
var image = createElement('img', 'tdhps-v1-image');
holder.setAttribute(
'data-tdhps-v1-item',
item.id || String(index)
);
holder.setAttribute(
'aria-label',
item.label || item.alt || '產品系列'
);
if (href) {
holder.href = href;
holder.setAttribute(
'data-tdhps-v1-link',
item.id || String(index)
);
}
if (mobileImage) {
source = document.createElement('source');
source.media = '(max-width: 991px)';
source.srcset = mobileImage;
picture.appendChild(source);
}
image.src = desktopImage || mobileImage;
image.alt = item.alt || item.label || '';
image.loading = index < 2 ? 'eager' : 'lazy';
image.decoding = 'async';
image.draggable = false;
image.style.objectPosition = item.objectPosition || 'center';
picture.appendChild(image);
holder.appendChild(picture);
return holder;
}
function createStructure() {
var root = createElement('section', 'tdhps-v1-root');
var inner = createElement('div', 'tdhps-v1-inner');
var heading = createElement('div', 'tdhps-v1-heading');
var title = createElement('h2', 'tdhps-v1-title');
var grid = createElement('div', 'tdhps-v1-grid');
var items = CONTENT.items || [];
var fragment = document.createDocumentFragment();
var i;
root.id = CONFIG.rootId;
root.setAttribute('data-tdhps-v1', VERSION);
root.setAttribute('aria-label', CONTENT.title || '產品系列');
root.setAttribute(
'data-tdhps-v1-odd',
items.length % 2 === 1 ? 'true' : 'false'
);
title.textContent = CONTENT.title || '';
for (i = 0; i < items.length; i += 1) {
fragment.appendChild(createSeriesCard(items[i], i));
}
heading.appendChild(title);
grid.appendChild(fragment);
inner.appendChild(heading);
inner.appendChild(grid);
root.appendChild(inner);
state.root = root;
}
function handleClick(event) {
var link = closest(event.target, '[data-tdhps-v1-link]');
if (!link || !state.root || !state.root.contains(link)) {
return;
}
trackEvent('td_home_product_series_click', {
td_product_series_id:
link.getAttribute('data-tdhps-v1-link') || '',
td_product_series_href:
link.getAttribute('href') || ''
});
}
function bindEvents() {
if (state.root) {
state.root.addEventListener('click', handleClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleClick, false);
}
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
}
function init() {
var existingModule = window.TDFigmaHomeProductSeries;
if (
existingModule &&
typeof existingModule.destroy === 'function'
) {
existingModule.destroy();
}
window.TDFigmaHomeProductSeries = {
version: VERSION,
destroy: destroy,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_product_series_ready', {
td_product_series_count: (CONTENT.items || []).length
});
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

/* ===== TD_Figma_Home_Member_Assurance_GTM_v2.0.0.html ===== */
(function () {
  'use strict';

  var job = {
    key: 'td-figma-home-member-assurance-v200',
    ready: function () {
      return !!(window.TDFigmaData && window.TDFigmaData.homePage && window.TDFigmaData.homePage.memberAssurance);
    },
    start: function () {
(function () {
'use strict';
var Core = window.TDFigmaCore;
var SOURCE_DATA = window.TDFigmaData.homePage.memberAssurance;
var HERO_DATA = SOURCE_DATA.memberBenefitsHero || {};
var ASSURANCE_DATA = SOURCE_DATA.authenticityAssurance || {};
var CONTENT = {
member: {
year: HERO_DATA.yearText || '',
title: HERO_DATA.heading || '',
buttonLabel: HERO_DATA.buttonText || '',
href: HERO_DATA.buttonLinkUrl || '',
desktopBackgroundImage: HERO_DATA.desktopBackgroundImageUrl || '',
mobileBackgroundImage: HERO_DATA.mobileBackgroundImageUrl || '',
benefits: (HERO_DATA.benefits || []).map(function (item) {
return {
id: item.id || '',
icon: item.iconName || '',
title: item.desktopTitle || '',
mobileTitle: item.mobileTitle || '',
description: item.description || '',
href: item.linkUrl || ''
};
})
},
assurance: {
title: ASSURANCE_DATA.desktopHeading || '',
mobileTitle: ASSURANCE_DATA.mobileHeading || '',
description: ASSURANCE_DATA.desktopDescription || '',
mobileDescription: ASSURANCE_DATA.mobileDescription || '',
buttonLabel: ASSURANCE_DATA.buttonText || '',
href: ASSURANCE_DATA.buttonLinkUrl || '',
desktopImage: ASSURANCE_DATA.desktopImageUrl || '',
mobileImage: ASSURANCE_DATA.mobileImageUrl || '',
imageAlt: ASSURANCE_DATA.imageAltText || ''
},
questions: (SOURCE_DATA.helpArticles || []).map(function (item) {
return {
id: item.id || '',
title: item.title || '',
description: item.description || '',
href: item.linkUrl || ''
};
})
};
var createElement = Core.dom.createElement;
var query = Core.dom.query;
var closest = Core.dom.closest;
var getSafeUrl = Core.url.sanitize;
var insertAfter = Core.dom.insertAfter;
var VERSION = '2.0.0';
var CONFIG = {
targetSelector: '.layout-center',
anchorSelector: '#tdhps-v1-root, [data-tdhps-v1]',
fallbackAnchorSelector:
'#tdhur-v1-root, [data-tdhur-v1], ' +
'#tdhpt-v1-root, [data-tdhpt-v1], ' +
'#tdheo-v1-root, [data-tdheo-v1], ' +
'#tdhk-v1-root, [data-tdhk-v1], ' +
'#tdhsc-v1-root, [data-tdhsc-v1], ' +
'#tdht-v1-root, [data-tdht-v1], ' +
'#tdhs-v1-root, [data-tdhs-v1]',
rootId: 'tdhma-v1-root',
mountDelay: 60,
fallbackDelay: 3000
};
var state = {
root: null,
observer: null,
mountTimer: null,
fallbackTimer: null
};
function trackEvent(eventName, values) {
Core.events.push(eventName, values, 'td_member_assurance_version', VERSION);
}
function getIconSvg(iconName) {
var icons = {
document:
'<svg viewBox="0 0 70 70" aria-hidden="true">' +
'<path d="M20 10h22l10 10v28a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z" fill="none" stroke="currentColor" stroke-width="3"/>' +
'<path d="M42 10v12h12M34 46l13-13 6 6-13 13-9 3 3-9Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>' +
'</svg>',
cake:
'<svg viewBox="0 0 70 70" aria-hidden="true">' +
'<path d="M17 34h36v24H17zM13 29h44v8H13z" fill="none" stroke="currentColor" stroke-width="3"/>' +
'<path d="M35 13v12M30 18h10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
'</svg>',
calendar:
'<svg viewBox="0 0 70 70" aria-hidden="true">' +
'<rect x="11" y="15" width="48" height="43" rx="5" fill="none" stroke="currentColor" stroke-width="3"/>' +
'<path d="M11 27h48M22 10v12M48 10v12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
'<text x="35" y="48" fill="currentColor" font-size="24" font-weight="700" text-anchor="middle">5</text>' +
'</svg>'
};
return icons[iconName] || icons.document;
}
function createOptionalLink(className, href, dataName, dataValue) {
var safeHref = getSafeUrl(href);
var element = createElement(
safeHref ? 'a' : 'div',
safeHref ?
(className + ' ' + className + '-link') :
className
);
if (safeHref) {
element.href = safeHref;
element.setAttribute(dataName, dataValue || '');
}
return element;
}
function createBenefit(item) {
var holder = createOptionalLink(
'tdhma-v1-benefit',
item.href,
'data-tdhma-v1-benefit-link',
item.id
);
var icon = createElement('span', 'tdhma-v1-benefit-icon');
var copy = createElement('span', 'tdhma-v1-benefit-copy');
var title = createElement('strong', 'tdhma-v1-benefit-title');
var description = createElement(
'span',
'tdhma-v1-benefit-description'
);
holder.setAttribute('data-tdhma-v1-benefit', item.id || '');
icon.innerHTML = getIconSvg(item.icon);
title.textContent =
window.innerWidth < 992 ?
(item.mobileTitle || item.title || '') :
(item.title || '');
description.textContent = item.description || '';
copy.appendChild(title);
copy.appendChild(description);
holder.appendChild(icon);
holder.appendChild(copy);
return holder;
}
function createMemberSection() {
var member = CONTENT.member || {};
var section = createElement('section', 'tdhma-v1-member');
var hero = createElement('div', 'tdhma-v1-member-hero');
var copy = createElement('div', 'tdhma-v1-member-copy');
var title = createElement('h2', 'tdhma-v1-member-title');
var year = createElement('span', 'tdhma-v1-member-year');
var titleText = createElement('span', 'tdhma-v1-member-title-text');
var button = createOptionalLink(
'tdhma-v1-member-button',
member.href,
'data-tdhma-v1-member-link',
'member'
);
var benefits = createElement('div', 'tdhma-v1-benefits');
var benefitItems = member.benefits || [];
var fragment = document.createDocumentFragment();
var i;
var desktopBackgroundImage = getSafeUrl(
member.desktopBackgroundImage ||
member.backgroundImage ||
member.benefitBackground ||
''
);
var mobileBackgroundImage = getSafeUrl(
member.mobileBackgroundImage ||
desktopBackgroundImage
);
section.style.setProperty(
'--tdhma-v1-member-bg-desktop',
'url("' + desktopBackgroundImage + '")'
);
section.style.setProperty(
'--tdhma-v1-member-bg-mobile',
'url("' + mobileBackgroundImage + '")'
);
year.textContent = member.year || '';
titleText.textContent = member.title || '';
button.textContent = member.buttonLabel || '';
title.appendChild(year);
title.appendChild(titleText);
copy.appendChild(title);
copy.appendChild(button);
hero.appendChild(copy);
for (i = 0; i < benefitItems.length; i += 1) {
fragment.appendChild(createBenefit(benefitItems[i]));
}
benefits.appendChild(fragment);
section.appendChild(hero);
section.appendChild(benefits);
return section;
}
function createAssurance() {
var data = CONTENT.assurance || {};
var section = createElement('section', 'tdhma-v1-assurance');
var title = createElement('h2', 'tdhma-v1-assurance-title');
var description = createElement(
'p',
'tdhma-v1-assurance-description'
);
var button = createOptionalLink(
'tdhma-v1-assurance-button',
data.href,
'data-tdhma-v1-assurance-link',
'assurance'
);
section.style.setProperty(
'--tdhma-v1-assurance-bg',
'url("' + getSafeUrl(data.desktopImage) + '")'
);
section.style.setProperty(
'--tdhma-v1-assurance-mobile-bg',
'url("' + getSafeUrl(data.mobileImage || data.desktopImage) + '")'
);
title.textContent =
window.innerWidth < 992 ?
(data.mobileTitle || data.title || '') :
(data.title || '');
description.textContent =
window.innerWidth < 992 ?
(data.mobileDescription || data.description || '') :
(data.description || '');
button.textContent = data.buttonLabel || '';
section.appendChild(title);
section.appendChild(description);
section.appendChild(button);
return section;
}
function createQuestion(item) {
var holder = createOptionalLink(
'tdhma-v1-question',
item.href,
'data-tdhma-v1-question-link',
item.id
);
var title = createElement('h3', 'tdhma-v1-question-title');
var description = createElement(
'p',
'tdhma-v1-question-description'
);
holder.setAttribute('data-tdhma-v1-question', item.id || '');
title.textContent = item.title || '';
description.textContent = item.description || '';
holder.appendChild(title);
holder.appendChild(description);
return holder;
}
function createStructure() {
var root = createElement('section', 'tdhma-v1-root');
var inner = createElement('div', 'tdhma-v1-inner');
var lower = createElement('div', 'tdhma-v1-lower');
var questions = createElement('div', 'tdhma-v1-questions');
var items = CONTENT.questions || [];
var fragment = document.createDocumentFragment();
var i;
root.id = CONFIG.rootId;
root.setAttribute('data-tdhma-v1', VERSION);
root.setAttribute('aria-label', '會員福利與安心選購');
for (i = 0; i < items.length; i += 1) {
fragment.appendChild(createQuestion(items[i]));
}
questions.appendChild(fragment);
lower.appendChild(createAssurance());
lower.appendChild(questions);
inner.appendChild(createMemberSection());
inner.appendChild(lower);
root.appendChild(inner);
state.root = root;
}
function handleClick(event) {
var member = closest(event.target, '[data-tdhma-v1-member-link]');
var assurance = closest(
event.target,
'[data-tdhma-v1-assurance-link]'
);
var benefit = closest(
event.target,
'[data-tdhma-v1-benefit-link]'
);
var question = closest(
event.target,
'[data-tdhma-v1-question-link]'
);
var payload;
if (!state.root) {
return;
}
if (member && state.root.contains(member)) {
payload = {
td_member_assurance_type: 'member',
td_member_assurance_id: 'member',
td_member_assurance_href: member.getAttribute('href') || ''
};
} else if (assurance && state.root.contains(assurance)) {
payload = {
td_member_assurance_type: 'assurance',
td_member_assurance_id: 'assurance',
td_member_assurance_href: assurance.getAttribute('href') || ''
};
} else if (benefit && state.root.contains(benefit)) {
payload = {
td_member_assurance_type: 'benefit',
td_member_assurance_id:
benefit.getAttribute('data-tdhma-v1-benefit-link') || '',
td_member_assurance_href:
benefit.getAttribute('href') || ''
};
} else if (question && state.root.contains(question)) {
payload = {
td_member_assurance_type: 'question',
td_member_assurance_id:
question.getAttribute('data-tdhma-v1-question-link') || '',
td_member_assurance_href:
question.getAttribute('href') || ''
};
}
if (payload) {
trackEvent('td_home_member_assurance_click', payload);
}
}
function bindEvents() {
if (state.root) {
state.root.addEventListener('click', handleClick, false);
}
}
function unbindEvents() {
if (state.root) {
state.root.removeEventListener('click', handleClick, false);
}
}
function mount(allowFallback) {
var target = query(CONFIG.targetSelector);
var anchor;
var fallbackAnchor;
if (!target) {
return false;
}
if (!state.root) {
createStructure();
bindEvents();
}
anchor = query(CONFIG.anchorSelector, target);
if (anchor) {
if (
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
) {
insertAfter(anchor, state.root);
}
return true;
}
if (!allowFallback) {
return false;
}
fallbackAnchor = query(CONFIG.fallbackAnchorSelector, target);
if (fallbackAnchor) {
insertAfter(fallbackAnchor, state.root);
} else if (state.root.parentNode !== target) {
target.insertBefore(state.root, target.firstChild);
}
return true;
}
function scheduleMount() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
}
state.mountTimer = window.setTimeout(function () {
state.mountTimer = null;
mount(false);
}, CONFIG.mountDelay);
}
function scheduleFallback() {
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
}
state.fallbackTimer = window.setTimeout(function () {
state.fallbackTimer = null;
mount(true);
}, CONFIG.fallbackDelay);
}
function observeDom() {
if (!window.MutationObserver || state.observer) {
return;
}
state.observer = new MutationObserver(function () {
var target = query(CONFIG.targetSelector);
var anchor = target ? query(CONFIG.anchorSelector, target) : null;
if (
!state.root ||
!document.documentElement.contains(state.root) ||
(
anchor &&
(
state.root.parentNode !== target ||
state.root.previousElementSibling !== anchor
)
)
) {
scheduleMount();
}
});
state.observer.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function destroy() {
if (state.mountTimer) {
window.clearTimeout(state.mountTimer);
state.mountTimer = null;
}
if (state.fallbackTimer) {
window.clearTimeout(state.fallbackTimer);
state.fallbackTimer = null;
}
if (state.observer) {
state.observer.disconnect();
state.observer = null;
}
unbindEvents();
if (state.root && state.root.parentNode) {
state.root.parentNode.removeChild(state.root);
}
state.root = null;
}
function init() {
var existingModule = window.TDFigmaHomeMemberAssurance;
if (
existingModule &&
typeof existingModule.destroy === 'function'
) {
existingModule.destroy();
}
window.TDFigmaHomeMemberAssurance = {
version: VERSION,
destroy: destroy,
mount: mount
};
mount(false);
scheduleFallback();
observeDom();
trackEvent('td_home_member_assurance_ready', {
td_member_benefit_count:
((CONTENT.member || {}).benefits || []).length,
td_member_question_count:
(CONTENT.questions || []).length
});
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
