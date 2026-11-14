/* התפריט העליון: כפתור ☰ בטלפון, סימון הדף הנוכחי, וכפתור "בדיקת התאמה" */
(function () {
  var head = document.querySelector('.fx-head');
  if (!head) return;
  var btn = head.querySelector('.fx-burger');
  function setOpen(on) {
    head.classList.toggle('open', on);
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'סגירת התפריט' : 'פתיחת התפריט');
  }
  btn.addEventListener('click', function () { setOpen(!head.classList.contains('open')); });
  head.addEventListener('click', function (e) {
    if (e.target.closest('.fx-link, .fx-cta') || e.target.classList.contains('fx-dim')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && head.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (head.classList.contains('open') && !head.contains(e.target)) setOpen(false);
  });

  // הדף הנוכחי
  var path = location.pathname;
  var key = path.indexOf('/blog') === 0 ? 'blog' : path.indexOf('/work') === 0 ? 'work' : '';
  if (key) {
    var cur = head.querySelector('.fx-link[data-key="' + key + '"]');
    if (cur) cur.setAttribute('aria-current', 'page');
  }

  // בדף הבית "בדיקת התאמה" פותח את החלון של הדף; בבלוג flowli-form.js מטפל בזה לבד
  var cta = head.querySelector('.fx-cta');
  cta.addEventListener('click', function (e) {
    if (typeof window.openDemoModal === 'function') { e.preventDefault(); window.openDemoModal('nav'); }
  });
})();
