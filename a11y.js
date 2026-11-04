/* Flowli - shared accessibility layer (all pages):
   popups behave as dialogs (Esc closes, focus moves in, stays in, and returns),
   a pause button for the moving text strip, keyboard access to the swipe carousel. */
(function () {
  'use strict';

  var OVERLAYS = '.a11y-overlay, .lead-overlay, .demo-overlay, .ff-overlay, .flowli-modal-overlay';
  var CLOSERS = '.a11y-close, .lead-popup-close, .demo-close, .ff-close, .modal-close, [aria-label="סגור"]';
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function visible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  function isOpen(ov) {
    return ov.classList.contains('open') || ov.classList.contains('show');
  }
  function focusables(ov) {
    return Array.prototype.filter.call(ov.querySelectorAll(FOCUSABLE), visible);
  }

  var lastFocus = new WeakMap();
  var uid = 0;

  function setupDialog(ov) {
    var box = ov.firstElementChild && ov.firstElementChild.matches('script, style') ? ov : (ov.firstElementChild || ov);
    if (!box.hasAttribute('role')) box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    if (!box.hasAttribute('aria-labelledby') && !box.hasAttribute('aria-label')) {
      var h = box.querySelector('h1, h2, h3, h4');
      if (h) {
        if (!h.id) h.id = 'dlg-title-' + (++uid);
        box.setAttribute('aria-labelledby', h.id);
      }
    }
    var wasOpen = isOpen(ov);
    new MutationObserver(function () {
      var now = isOpen(ov);
      if (now === wasOpen) return;
      wasOpen = now;
      if (now) onOpen(ov); else onClose(ov);
    }).observe(ov, { attributes: true, attributeFilter: ['class'] });
  }

  function onOpen(ov) {
    if (!ov.contains(document.activeElement)) lastFocus.set(ov, document.activeElement);
    setTimeout(function () {
      if (ov.contains(document.activeElement)) return;
      var list = focusables(ov);
      var first = list.filter(function (el) { return !el.matches(CLOSERS); })[0] || list[0];
      if (first) first.focus({ preventScroll: true });
    }, 60);
  }

  function onClose(ov) {
    var back = lastFocus.get(ov);
    if (back && document.contains(back) && back.focus) back.focus({ preventScroll: true });
  }

  function openDialog() {
    var all = document.querySelectorAll(OVERLAYS);
    for (var i = all.length - 1; i >= 0; i--) if (isOpen(all[i])) return all[i];
    return null;
  }

  document.addEventListener('keydown', function (e) {
    var ov = openDialog();
    if (!ov) return;
    if (e.key === 'Escape') {
      var c = ov.querySelector(CLOSERS);
      if (c) c.click();
      if (isOpen(ov)) { ov.classList.remove('open'); ov.classList.remove('show'); }
      document.body.style.overflow = '';
      return;
    }
    if (e.key !== 'Tab') return;
    var list = focusables(ov);
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (!ov.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function setupTicker(wrap) {
    var track = wrap.querySelector('.ticker-track');
    if (!track || wrap.querySelector('.ticker-pause')) return;
    wrap.removeAttribute('aria-hidden');
    track.setAttribute('aria-hidden', 'true');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ticker-pause';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'עצירת הטקסט הנע');
    b.textContent = '❚❚';
    b.addEventListener('click', function () {
      var paused = wrap.classList.toggle('is-paused');
      b.setAttribute('aria-pressed', paused ? 'true' : 'false');
      b.setAttribute('aria-label', paused ? 'הפעלת הטקסט הנע' : 'עצירת הטקסט הנע');
      b.textContent = paused ? '▶' : '❚❚';
    });
    wrap.appendChild(b);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(OVERLAYS), setupDialog);
    Array.prototype.forEach.call(document.querySelectorAll('.ticker-wrap'), setupTicker);

    /* swipe carousel: reachable and scrollable with the keyboard */
    Array.prototype.forEach.call(document.querySelectorAll('.moment-grid'), function (g) {
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'region');
      if (!g.hasAttribute('aria-label')) g.setAttribute('aria-label', 'דוגמאות, אפשר לגלול הצידה');
    });
    /* the dots repeat the swipe; hidden from screen readers, so not focusable either */
    Array.prototype.forEach.call(document.querySelectorAll('[aria-hidden="true"]'), function (el) {
      Array.prototype.forEach.call(el.querySelectorAll(FOCUSABLE), function (f) { f.setAttribute('tabindex', '-1'); });
    });

    var main = document.getElementById('main') || document.querySelector('main');
    if (main && !main.id) main.id = 'main';
    if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  }

  /* the dots are drawn by the page's own script after load */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
  window.addEventListener('load', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[aria-hidden="true"]'), function (el) {
      Array.prototype.forEach.call(el.querySelectorAll(FOCUSABLE), function (f) { f.setAttribute('tabindex', '-1'); });
    });
  });
})();
