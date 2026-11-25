/* 71.arch: scripted smooth scroll for in-page anchors (webviews that ignore CSS smooth scroll) */
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
