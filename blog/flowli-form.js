/* Flowli - "בדיקת התאמה" form for blog articles.
   Opens in place so the reader never leaves the article. Any link carrying
   data-flowli-form="<source>" is intercepted; without JS the href still works
   and sends the reader to the homepage form instead. */
(function () {
  'use strict';

  var ENDPOINT = 'https://whuuevjoqitwslnykvgd.supabase.co/rest/v1/leads_website';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodXVldmpvcWl0d3NsbnlrdmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTk3NDQsImV4cCI6MjA5NDY5NTc0NH0.r_lxvPFY275H7ODxYGHs0-NvqfQd8_e3fKHYy4sgq34';

  var CSS = [
    '.ff-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:2000;align-items:center;justify-content:center;padding:20px}',
    '.ff-overlay.open{display:flex}',
    '.ff-modal{background:var(--cream,#FAFAF7);border-radius:20px;padding:34px 30px;max-width:420px;width:100%;position:relative;max-height:92vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.28)}',
    '.ff-close{position:absolute;inset-inline-end:16px;top:14px;background:none;border:0;font-size:20px;line-height:1;color:var(--muted,#5C5751);cursor:pointer;padding:4px}',
    '.ff-title{font-family:Inter,Heebo,sans-serif;font-weight:800;font-size:1.3rem;color:var(--ink,#1A1A1A);margin:0 0 8px}',
    '.ff-sub{font-size:.95rem;color:var(--muted,#5C5751);margin:0 0 20px;line-height:1.6}',
    '.ff-label{display:block;font-size:12.5px;color:var(--muted,#5C5751);margin:0 0 5px}',
    '.ff-field{width:100%;background:var(--bg,#EFEDE6);border:1.5px solid var(--bg-warm,#E8E4D6);border-radius:10px;padding:12px 14px;font-family:inherit;font-size:15px;color:var(--text,#2A2A2A);margin-bottom:14px}',
    '.ff-field:focus{outline:none;border-color:var(--orange,#F26B1F);box-shadow:0 0 0 3px rgba(242,107,31,.12)}',
    '.ff-consent{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--muted,#5C5751);margin:6px 0 18px;line-height:1.5}',
    '.ff-consent input{margin-top:3px;width:15px;height:15px;flex-shrink:0;cursor:pointer}',
    '.ff-submit{width:100%;background:var(--orange,#F26B1F);color:#fff;border:0;border-radius:10px;padding:14px;font-family:Inter,Heebo,sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:.2s}',
    '.ff-submit:disabled{opacity:.45;cursor:not-allowed}',
    '.ff-submit:not(:disabled):hover{background:var(--orange-deep,#D45A12)}',
    '.ff-note{font-size:11.5px;color:var(--muted,#5C5751);margin-top:12px;text-align:center}',
    '.ff-err{color:#B4341F;font-size:13px;margin-bottom:12px;display:none}',
    '.ff-done{text-align:center;padding:16px 0 6px}',
    '.ff-done .ff-title{margin-bottom:10px}',
    '@media(max-width:640px){.ff-modal{padding:28px 22px}}'
  ].join('');

  var HTML =
    '<div class="ff-modal" role="dialog" aria-modal="true" aria-labelledby="ffTitle">' +
      '<button class="ff-close" type="button" aria-label="סגירה">&#10005;</button>' +
      '<div id="ffForm">' +
        '<h2 class="ff-title" id="ffTitle">רוצים שאחזור אליכם?</h2>' +
        '<p class="ff-sub">משאירים פרטים ואחזור תוך יום עסקים אחד - בלי שיחת מכירה, רק כדי להבין אם ואיך אפשר לעזור.</p>' +
        '<div class="ff-err" id="ffErr"></div>' +
        '<label class="ff-label" for="ffName">שם מלא</label>' +
        '<input class="ff-field" id="ffName" type="text" autocomplete="name" placeholder="איך לקרוא לכם?">' +
        '<label class="ff-label" for="ffPhone">טלפון</label>' +
        '<input class="ff-field" id="ffPhone" type="tel" autocomplete="tel" placeholder="050-0000000">' +
        '<label class="ff-label" for="ffEmail">מייל</label>' +
        '<input class="ff-field" id="ffEmail" type="email" autocomplete="email" placeholder="name@email.com">' +
        '<label class="ff-consent"><input type="checkbox" id="ffConsent">' +
          '<span>אני מאשר/ת קבלת תכנים מקצועיים ועדכונים מ-Flowli ומסכים/ה ל' +
          '<a href="https://flowli.co.il/#privacy" target="_blank" rel="noopener">מדיניות הפרטיות</a>.</span>' +
        '</label>' +
        '<button class="ff-submit" id="ffSubmit" type="button" disabled>שלחו פרטים ←</button>' +
        '<div class="ff-note">🔒 הפרטים נשמרים בצורה מאובטחת. אפשר להסיר מהדיוור בכל עת.</div>' +
      '</div>' +
      '<div id="ffDone" class="ff-done" style="display:none">' +
        '<div style="font-size:38px;margin-bottom:6px">✅</div>' +
        '<h2 class="ff-title">קיבלתי!</h2>' +
        '<p class="ff-sub">אחזור אליכם בהקדם. אפשר להמשיך לקרוא.</p>' +
        '<button class="ff-submit" type="button" id="ffBack">חזרה למאמר</button>' +
      '</div>' +
    '</div>';

  var overlay, source = 'blog', lastFocus = null, scrollY = 0;

  function build() {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    overlay = document.createElement('div');
    overlay.className = 'ff-overlay';
    overlay.innerHTML = HTML;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector('.ff-close').addEventListener('click', close);
    document.getElementById('ffBack').addEventListener('click', close);
    document.getElementById('ffConsent').addEventListener('change', function () {
      document.getElementById('ffSubmit').disabled = !this.checked;
    });
    document.getElementById('ffSubmit').addEventListener('click', submit);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  function open(src) {
    source = src || 'blog';
    lastFocus = document.activeElement;
    scrollY = window.scrollY;            // locking the body can shift the page
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('ffName').focus({ preventScroll: true });
  }

  // closing returns the reader to exactly where they were - no navigation
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // the page sets scroll-behavior:smooth, which would animate the restore
    var root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollY);
    root.style.scrollBehavior = prev;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function submit() {
    var name = document.getElementById('ffName').value.trim();
    var phone = document.getElementById('ffPhone').value.trim();
    var email = document.getElementById('ffEmail').value.trim();
    var err = document.getElementById('ffErr');
    var btn = document.getElementById('ffSubmit');

    if (!name || !phone || !email) {
      err.textContent = 'שם, טלפון ומייל הם שדות חובה.';
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'שולח...';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: name, phone: phone, email: email || null,
        consent: true, source: source
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      document.getElementById('ffForm').style.display = 'none';
      document.getElementById('ffDone').style.display = 'block';
    }).catch(function (e) {
      err.textContent = 'לא הצלחנו לשמור כרגע. אפשר לכתוב לי בוואטסאפ במקום.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'שלחו פרטים ←';
      if (window.console) console.error('flowli form:', e);
    });
  }

  function init() {
    build();
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-flowli-form]');
      if (!t) return;
      e.preventDefault();
      open(t.getAttribute('data-flowli-form'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.openFlowliForm = function (src) { open(src); };
})();
