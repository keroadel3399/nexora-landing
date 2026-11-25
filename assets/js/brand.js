/* 7.arch: scripted smooth scroll for in-page anchors (webviews that ignore CSS smooth scroll) */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function go(y) {
    if (reduce) { window.scrollTo(0, y); return; }
    var s = window.pageYOffset, d = y - s, t0 = null, dur = Math.min(1100, 500 + Math.abs(d) * 0.25);
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      window.scrollTo(0, s + d * ease(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    go(el.getBoundingClientRect().top + window.pageYOffset - 70);
    if (history.replaceState) history.replaceState(null, '', id);
  });
})();

/* Reveal safety net: webviews can drop IntersectionObserver / animation events.
   Sample every 400ms, reveal anything in view, and always finish the hero. */
(function () {
  var t0 = Date.now();
  function sweep() {
    var vh = window.innerHeight || 800;
    var els = document.querySelectorAll('[data-reveal]:not(.visible)');
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) els[i].classList.add('visible');
    }
    var age = Date.now() - t0;
    var title = document.querySelector('.hero-title');
        if (age > 6500 && title) title.classList.add('force-done');
    if (age > 3000) {
      var hero = document.querySelectorAll('.hero [data-reveal]:not(.visible)');
      for (var j = 0; j < hero.length; j++) hero[j].classList.add('visible');
    }
  }
  setInterval(sweep, 400);
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('touchmove', sweep, { passive: true });
  window.addEventListener('load', sweep);
})();

/* Back-to-top button: appears after scrolling, smooth scroll back to the top */
(function () {
  var L = { en: 'Back to top', ar: 'ارجع لفوق', fr: 'Retour en haut', es: 'Volver arriba', de: 'Nach oben', tr: 'Yukarı çık' };
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'to-top';
  b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  function lab() { b.setAttribute('aria-label', L[(document.documentElement.lang || 'en').slice(0, 2)] || L.en); }
  lab();
  new MutationObserver(lab).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.body.appendChild(b);
  var on = false, pend = 0;
  function upd() {
    pend = 0;
    var y = window.pageYOffset || document.documentElement.scrollTop, want = y > (window.innerHeight || 800) * 0.8;
    if (want !== on) { on = want; b.classList.toggle('is-on', on); }
  }
  function req() { if (!pend) { pend = 1; requestAnimationFrame(upd); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('touchmove', req, { passive: true });
  setInterval(upd, 500);
  b.addEventListener('click', function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { window.scrollTo(0, 0); return; }
    var s = window.pageYOffset, t0 = null, dur = Math.min(1200, 500 + s * 0.12);
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, s * (1 - e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
