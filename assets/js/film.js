/* Brand film: lazy load, autoplay muted when visible, pause when away, tap to play/pause, sound toggle. */
(function () {
  var v = document.getElementById("filmVideo"), pb = document.getElementById("filmPlay"), sb = document.getElementById("filmSnd");
  if (!v || !pb || !sb) return;
  var frame = v.parentNode, loaded = false, visible = false, userPaused = false;
  function load() { if (loaded) return; loaded = true; v.preload = "auto"; v.src = v.getAttribute("data-src"); try { v.load() } catch (e) {} }
  function state() {
    frame.classList.toggle("is-paused", v.paused);
    frame.classList.toggle("is-sound", !v.muted);
  }
  function play() { load(); var p = v.play(); if (p && p.catch) p.catch(function () { state() }); }
  function sync() { if (visible && !userPaused && !document.hidden) play(); else if (loaded && !v.paused) { v.pause() } state() }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; if (visible) load(); sync() }) }, { threshold: 0.35, rootMargin: "200px 0px" }).observe(frame);
  } else { visible = true; sync() }
  pb.addEventListener("click", function () { if (v.paused) { userPaused = false; play() } else { userPaused = true; v.pause() } state() });
  v.addEventListener("click", function () { pb.click() });
  sb.addEventListener("click", function () { v.muted = !v.muted; if (!v.muted && v.paused) { userPaused = false; play() } state() });
  ["play", "pause", "volumechange", "ended", "playing"].forEach(function (n) { v.addEventListener(n, state) });
  document.addEventListener("visibilitychange", sync);
  setInterval(function () { if (visible && !userPaused && !document.hidden && loaded && v.paused) play() }, 1500);
  state();
})();
