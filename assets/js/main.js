/* ============================================================
   NEXORA — interactions engine
   preloader · starfield · cursor · magnetic · tilt · reveal
   split-text · counters · nav · i18n/RTL · renderers · slider
   ============================================================ */
(() => {
"use strict";

/* ---------- helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const LANG_ORDER = Object.keys(NEXORA_I18N);

let currentLang = "en";
let billing = "monthly";
let slideIndex = 0;
let slideCount = 0;
let autoplayTimer = null;

const t = (k) => {
  const d = NEXORA_I18N[currentLang] || NEXORA_I18N.en;
  return d[k] !== undefined ? d[k] : (NEXORA_I18N.en[k] !== undefined ? NEXORA_I18N.en[k] : k);
};
const list = (k) => {
  const v = t(k);
  return Array.isArray(v) ? v : [];
};
const fmt = (v, dec) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ---------- gradient defs for icons ---------- */
function injectDefs() {
  const wrap = document.createElement("div");
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<svg width="0" height="0" style="position:absolute" focusable="false"><defs>' +
    '<linearGradient id="icoGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#7c5cff"/><stop offset=".55" stop-color="#c04dff"/><stop offset="1" stop-color="#00e5c7"/>' +
    "</linearGradient></defs></svg>";
  document.body.appendChild(wrap);
}

/* ---------- i18n core ---------- */
function applyStatic() {
  $$("[data-i18n]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n"));
    if (typeof val !== "string") return;
    if (val.includes("<")) el.innerHTML = val; else el.textContent = val;
  });
  $$("[data-i18n-attr]").forEach((el) => {
    (el.getAttribute("data-i18n-attr") || "").split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}

function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q && NEXORA_I18N[q.toLowerCase()]) return q.toLowerCase();
  } catch (e) { /* ignore */ }
  let saved = null;
  try { saved = localStorage.getItem("nexora_lang"); } catch (e) { /* private mode */ }
  if (saved && NEXORA_I18N[saved]) return saved;
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return NEXORA_I18N[nav] ? nav : "en";
}

function buildLangMenu() {
  const menu = $("#langMenu");
  if (!menu) return;
  menu.innerHTML = "";
  LANG_ORDER.forEach((code) => {
    const d = NEXORA_I18N[code];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lang-item" + (code === currentLang ? " active" : "");
    b.setAttribute("role", "option");
    b.innerHTML =
      '<span class="flag"></span><span class="lbl"></span>' +
      '<svg class="check" viewBox="0 0 24 24"><path d="M4 12l5 5L20 7"/></svg>';
    b.querySelector(".flag").textContent = d.meta.flag;
    b.querySelector(".lbl").textContent = d.meta.label;
    b.addEventListener("click", () => setLang(code));
    menu.appendChild(b);
  });
}

function setLang(code) {
  if (!NEXORA_I18N[code]) return;
  currentLang = code;
  const dict = NEXORA_I18N[code];

  document.documentElement.setAttribute("lang", dict.meta.htmlLang);
  document.documentElement.setAttribute("dir", dict.meta.dir);
  document.title = dict.meta.title;
  const md = $('meta[name="description"]');
  if (md) md.setAttribute("content", dict.meta.desc);
  try { localStorage.setItem("nexora_lang", code); } catch (e) { /* ignore */ }

  const lc = $("#langCurrent"); if (lc) lc.textContent = code.toUpperCase();
  const lm = $("#langMiniLabel"); if (lm) lm.textContent = dict.meta.label;

  buildLangMenu();
  applyStatic();
  renderServices();
  renderProcess();
  renderCases();
  renderResults();
  renderSlider();
  renderPricing();
  renderFaq();
  renderFooter();
  splitHero();
  closeLang();
}

/* ---------- split text ---------- */
function splitHero() {
  const title = $(".hero-title");
  if (!title) return;
  const rtl = document.documentElement.getAttribute("dir") === "rtl";
  title.classList.remove("split-done");
  title.classList.add("will-split");
  $$(".line", title).forEach((line, li) => {
    line.style.setProperty("--i", String(li));
    const text = line.textContent || "";
    if (rtl || prefersReduced) {
      line.textContent = text; // whole-line animation (keeps Arabic shaping)
    } else {
      const frag = document.createDocumentFragment();
      Array.from(text).forEach((ch, i) => {
        if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
        const s = document.createElement("span");
        s.className = "char";
        s.style.setProperty("--i", String(i));
        s.textContent = ch;
        frag.appendChild(s);
      });
      line.textContent = "";
      line.appendChild(frag);
    }
  });
  requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("split-done")));
}

/* ---------- reveal ---------- */
let revealIO = null;
function observeReveals() {
  if (!revealIO) {
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  }
  $$("[data-reveal]").forEach((el) => revealIO.observe(el));
}

/* ---------- counters ---------- */
let countIO = null;
const counted = new WeakSet();
function observeCounts() {
  if (!countIO) {
    countIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        countIO.unobserve(el);
        if (counted.has(el)) return;
        counted.add(el);
        animateCount(el);
      });
    }, { threshold: 0.5 });
  }
  $$("[data-count]").forEach((el) => countIO.observe(el));
}
function animateCount(el) {
  const target = parseFloat(el.dataset.count || "0");
  const dec = parseInt(el.dataset.decimals || "0", 10);
  const suf = el.dataset.suffix || "";
  if (prefersReduced) { el.textContent = fmt(target, dec) + suf; return; }
  const dur = 1700, start = performance.now();
  const step = (now) => {
    const p = clamp((now - start) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * e, dec) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- preloader ---------- */
function runPreloader() {
  const bar = $("#plBar"), pre = $("#preloader");
  if (!pre) { finishLoad(); return; }
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 16 + 5, 92);
    if (bar) bar.style.width = p + "%";
  }, 130);
  let fired = false;
  const done = () => {
    if (fired) return; fired = true;
    clearInterval(tick);
    if (bar) bar.style.width = "100%";
    setTimeout(finishLoad, 380);
  };
  window.addEventListener("load", done, { once: true });
  setTimeout(done, 2300);
}
function finishLoad() {
  document.body.classList.remove("is-loading");
  document.body.classList.add("loaded");
  const pre = $("#preloader"); if (pre) pre.classList.add("done");
  setTimeout(() => {
    const c = $(".console"); if (c) c.classList.add("animated");
    splitHero();
    observeReveals();
    observeCounts();
    startAutoplay();
  }, 260);
}

/* ---------- starfield ---------- */
function initStars() {
  const cv = $("#stars"); if (!cv) return;
  const ctx = cv.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, stars = [], raf = null, sy = 0;
  function size() {
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.max(1, w * DPR); cv.height = Math.max(1, h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.min(170, Math.floor((w * h) / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.7 + 0.15,
      s: Math.random() * 0.18 + 0.05, tw: Math.random() * Math.PI * 2
    }));
  }
  window.addEventListener("scroll", () => { sy = window.scrollY; }, { passive: true });
  function frame() {
    ctx.clearRect(0, 0, w, h);
    const now = performance.now() / 1000;
    ctx.fillStyle = "#cdd3ff";
    for (const s of stars) {
      s.y -= s.s; if (s.y < -4) s.y = h + 4;
      const tw = 0.55 + 0.45 * Math.sin(now * 1.7 + s.tw);
      ctx.globalAlpha = s.a * tw;
      ctx.beginPath();
      ctx.arc(s.x, s.y - sy * 0.06 * s.r, s.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  size();
  if (prefersReduced) { // single static frame
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#cdd3ff";
    for (const s of stars) { ctx.globalAlpha = s.a; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else { frame(); }
  window.addEventListener("resize", () => { size(); if (prefersReduced && !raf) { /* keep static */ } });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf && !prefersReduced) { raf = requestAnimationFrame(frame); }
  });
}

/* ---------- cursor ---------- */
function initCursor() {
  if (isTouch || prefersReduced) return;
  const cur = $("#cursor"); if (!cur) return;
  const dot = $(".cursor-dot", cur), ring = $(".cursor-ring", cur);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
  window.addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; cur.classList.remove("hidden"); }
    dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
  }, { passive: true });
  (function loop() {
    rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
    ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("mouseover", (e) => {
    const hit = e.target.closest && e.target.closest("a, button, [data-cursor], input, .faq-q, .case, .srv-card");
    cur.classList.toggle("hover", !!hit);
  });
  document.addEventListener("mousedown", () => cur.classList.add("down"));
  document.addEventListener("mouseup", () => cur.classList.remove("down"));
  document.documentElement.addEventListener("mouseleave", () => cur.classList.add("hidden"));
  document.documentElement.addEventListener("mouseenter", () => cur.classList.remove("hidden"));
}

/* ---------- magnetic + tilt ---------- */
function bindMagnetic(scope) {
  if (isTouch || prefersReduced) return;
  $$(".magnetic", scope || document).forEach((el) => {
    if (el._mag) return; el._mag = true;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.22).toFixed(1) + "px)";
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}
function bindTilt() {
  if (isTouch || prefersReduced) return;
  $$("[data-tilt], [data-tilt-soft]").forEach((el) => {
    const max = el.hasAttribute("data-tilt-soft") ? 5 : 9;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" + (px * max).toFixed(2) + "deg)";
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ---------- nav ---------- */
let mobileOpen = false;
function initNav() {
  const nav = $("#nav"), bar = $("#scrollBar");
  const burger = $("#burger"), menu = $("#mobileMenu");
  let lastY = 0, ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    if (y > 420 && y > lastY + 4 && !mobileOpen) nav.classList.add("hidden");
    else if (y < lastY - 4 || y <= 420) nav.classList.remove("hidden");
    lastY = y;
    if (bar) {
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (dh > 0 ? clamp((y / dh) * 100, 0, 100) : 0) + "%";
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  const setMenu = (open) => {
    mobileOpen = open;
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      $$(".mobile-links a", menu).forEach((a, i) => { a.style.transitionDelay = (0.06 + i * 0.06) + "s"; });
    }
  };
  burger.addEventListener("click", () => setMenu(!mobileOpen));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mobileOpen) setMenu(false); });

  // active section highlight
  const links = $$(".nav-links a");
  const byId = {};
  links.forEach((a) => { const id = (a.getAttribute("href") || "").slice(1); if (id) byId[id] = a; });
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("active"));
      const a = byId[en.target.id]; if (a) a.classList.add("active");
    });
  }, { rootMargin: "-38% 0px -55% 0px" });
  Object.keys(byId).forEach((id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });
}

/* ---------- language UI ---------- */
function initLangUI() {
  const wrap = $("#langWrap"), btn = $("#langBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }
  document.addEventListener("click", (e) => {
    if (wrap && !wrap.contains(e.target)) closeLang();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLang(); });
  const mini = $("#langMini");
  if (mini) mini.addEventListener("click", () => {
    const idx = LANG_ORDER.indexOf(currentLang);
    setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
  });
}
function closeLang() {
  const wrap = $("#langWrap"), btn = $("#langBtn");
  if (wrap) wrap.classList.remove("open");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

/* ---------- renderers ---------- */
const ICONS = [
  '<path d="M3 11l14-6v14L3 13v-2z"/><path d="M11.5 17.5l1 3.5"/><circle cx="18.5" cy="6.5" r="1.2"/>',
  '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  '<path d="M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4L12 3z"/>',
  '<path d="M4 8h12l-3-3"/><path d="M20 16H8l3 3"/>',
  '<circle cx="9" cy="8" r="3.4"/><circle cx="17" cy="9.5" r="2.6"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 14.5c2.8.3 5 2.6 5 5.5"/>',
  '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M3 20h18"/>'
];
const GLYPHS = ["Sk", "B2", "Fi", "Re", "Lo", "Ac"];
const AV_BG = [
  "linear-gradient(135deg,#7c5cff,#c04dff)",
  "linear-gradient(135deg,#00e5c7,#7c5cff)",
  "linear-gradient(135deg,#ff5da2,#c04dff)",
  "linear-gradient(135deg,#ffb547,#ff5da2)"
];
const SOCIALS = [
  { label: "X", path: "M17.7 3H21l-7.1 8.1L22.2 21h-6.6l-5.2-6.2L4.4 21H1.1l7.6-8.7L1.8 3h6.7l4.7 5.7L17.7 3zm-1.2 16h1.8L7.4 4.9H5.5L16.5 19z" },
  { label: "LinkedIn", path: "M6.5 8.8H3.2V21h3.3V8.8zM4.8 3a1.9 1.9 0 100 3.9 1.9 1.9 0 000-3.9zM13 8.8H9.8V21H13v-6.4c0-1.7.8-2.8 2.3-2.8 1.4 0 2 .9 2 2.8V21h3.3v-7.2c0-3.4-1.8-5.2-4.4-5.2-2 0-3 1.1-3.2 2.2V8.8z" },
  { label: "Instagram", path: "M12 2.2c3.2 0 3.6 0 4.9.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.81s-.01 3.55-.07 4.81c-.15 3.22-1.66 4.77-4.92 4.92-1.3.06-1.67.07-4.9.07s-3.6-.01-4.86-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.14 15.55 2.13 15.17 2.13 12s.01-3.55.07-4.81C2.35 3.97 3.87 2.42 7.13 2.27 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 2.2a4 4 0 110 8 4 4 0 010-8zm6.4-2.7a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" },
  { label: "YouTube", path: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" }
];

function renderServices() {
  const grid = $("#servicesGrid"); if (!grid) return;
  grid.innerHTML = "";
  list("services.items").forEach((s, i) => {
    const card = document.createElement("article");
    card.className = "srv-card";
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--d", (i * 0.07).toFixed(2) + "s");
    card.innerHTML =
      '<span class="srv-num"></span>' +
      '<span class="srv-ico"><svg viewBox="0 0 24 24">' + (ICONS[i] || ICONS[0]) + "</svg></span>" +
      "<h3></h3><p></p>" +
      '<div class="srv-tags"></div>';
    card.querySelector(".srv-num").textContent = String(i + 1).padStart(2, "0");
    card.querySelector("h3").textContent = s.t;
    card.querySelector("p").textContent = s.d;
    const tg = card.querySelector(".srv-tags");
    (s.tags || []).forEach((x) => { const sp = document.createElement("span"); sp.textContent = x; tg.appendChild(sp); });
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
    grid.appendChild(card);
  });
}

function renderProcess() {
  const box = $("#processList"); if (!box) return;
  $$(".step", box).forEach((n) => n.remove());
  list("process.steps").forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "step";
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
    el.innerHTML =
      '<span class="step-dot"></span>' +
      '<div class="step-body"><h3></h3><p></p><div class="step-kpis"></div></div>';
    el.querySelector(".step-dot").textContent = String(i + 1).padStart(2, "0");
    el.querySelector("h3").textContent = s.t;
    el.querySelector("p").textContent = s.d;
    const kp = el.querySelector(".step-kpis");
    (s.k || []).forEach((x) => { const sp = document.createElement("span"); sp.textContent = x; kp.appendChild(sp); });
    box.appendChild(el);
  });
}

function renderCases() {
  const grid = $("#casesGrid"); if (!grid) return;
  grid.innerHTML = "";
  list("work.cases").forEach((c, i) => {
    const el = document.createElement("article");
    el.className = "case c" + (i + 1);
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", ((i % 3) * 0.09).toFixed(2) + "s");
    el.innerHTML =
      '<div class="case-bg"><span class="case-glyph"></span></div>' +
      '<div class="case-body"><span class="case-tag"></span><h3></h3>' +
      '<div class="case-metrics"><span class="m1"></span><span class="m2"></span></div></div>';
    el.querySelector(".case-glyph").textContent = GLYPHS[i] || String(i + 1);
    el.querySelector(".case-tag").textContent = c.tag;
    el.querySelector("h3").textContent = c.title;
    el.querySelector(".m1").textContent = c.m1;
    el.querySelector(".m2").textContent = c.m2;
    grid.appendChild(el);
  });
}

function renderResults() {
  const ul = $("#resultsList"); if (!ul) return;
  ul.innerHTML = "";
  list("results.list").forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = '<span class="tick"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 7"/></svg></span><span class="txt"></span>';
    li.querySelector(".txt").innerHTML = item;
    ul.appendChild(li);
  });
}

function renderSlider() {
  const track = $("#sliderTrack"), dots = $("#sliderDots");
  if (!track || !dots) return;
  const items = list("testi.items");
  slideCount = items.length;
  track.innerHTML = ""; dots.innerHTML = "";
  items.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "slide";
    el.innerHTML =
      '<div class="slide-quote">&ldquo;</div>' +
      "<blockquote></blockquote>" +
      '<div class="slide-person"><span class="p-avatar"></span>' +
      "<div><strong></strong><small></small></div>" +
      '<span class="slide-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span></div>';
    el.querySelector("blockquote").textContent = s.q;
    el.querySelector(".p-avatar").textContent = (s.n || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
    el.querySelector(".p-avatar").style.background = AV_BG[i % AV_BG.length];
    el.querySelector("strong").textContent = s.n;
    el.querySelector("small").textContent = s.r;
    track.appendChild(el);
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Go to slide " + (i + 1));
    d.addEventListener("click", () => { goTo(i); restartAutoplay(); });
    dots.appendChild(d);
  });
  goTo(slideIndex, true);
}

function goTo(i, instant) {
  if (!slideCount) return;
  slideIndex = ((i % slideCount) + slideCount) % slideCount;
  const track = $("#sliderTrack"); if (!track) return;
  const dirMul = document.documentElement.getAttribute("dir") === "rtl" ? 1 : -1;
  if (instant) track.style.transition = "none";
  track.style.transform = "translateX(calc(" + (dirMul * slideIndex) + " * (100% + 22px)))";
  if (instant) { void track.offsetWidth; track.style.transition = ""; }
  $$("#sliderDots button").forEach((d, di) => d.classList.toggle("active", di === slideIndex));
}
function startAutoplay() {
  stopAutoplay();
  if (prefersReduced || !slideCount) return;
  autoplayTimer = setInterval(() => goTo(slideIndex + 1), 6000);
}
function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
function restartAutoplay() { stopAutoplay(); startAutoplay(); }
function initSliderControls() {
  const prev = $("#prevBtn"), next = $("#nextBtn"), box = $("#slider");
  if (prev) prev.addEventListener("click", () => { goTo(slideIndex - 1); restartAutoplay(); });
  if (next) next.addEventListener("click", () => { goTo(slideIndex + 1); restartAutoplay(); });
  if (box) {
    box.addEventListener("mouseenter", stopAutoplay);
    box.addEventListener("mouseleave", startAutoplay);
  }
}

function renderPricing() {
  const grid = $("#pricingGrid"); if (!grid) return;
  grid.innerHTML = "";
  list("pricing.plans").forEach((p, i) => {
    const el = document.createElement("article");
    el.className = "plan" + (i === 1 ? " featured" : "");
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
    const priceHtml = p.custom
      ? "<b>" + t("pricing.custom") + "</b>"
      : "<b>$" + fmt(billing === "monthly" ? p.m : p.a, 0) + "</b><span>" + t("pricing.per") + "</span>";
    el.innerHTML =
      (i === 1 ? '<span class="plan-badge"></span>' : "") +
      "<h3></h3><p class='plan-desc'></p>" +
      "<div class='plan-price'>" + priceHtml + "</div>" +
      "<ul class='plan-list'></ul>" +
      "<a href='#contact' class='btn " + (i === 1 ? "btn-primary" : "btn-ghost") + " magnetic'><span class='btxt'></span></a>";
    if (i === 1) el.querySelector(".plan-badge").textContent = t("pricing.badge");
    el.querySelector("h3").textContent = p.name;
    el.querySelector(".plan-desc").textContent = p.desc;
    const ulEl = el.querySelector(".plan-list");
    (p.f || []).forEach((f) => {
      const li = document.createElement("li");
      li.innerHTML = '<span class="tick"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 7"/></svg></span><span class="txt"></span>';
      li.querySelector(".txt").textContent = f;
      ulEl.appendChild(li);
    });
    el.querySelector(".btxt").textContent = t("pricing.cta");
    grid.appendChild(el);
  });
  bindMagnetic(grid);
}

function initBillingToggle() {
  $$(".toggle button").forEach((b) => {
    b.addEventListener("click", () => {
      if (b.classList.contains("active")) return;
      $$(".toggle button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      billing = b.dataset.billing || "monthly";
      renderPricing();
      observeReveals();
    });
  });
}

function renderFaq() {
  const box = $("#faqList"); if (!box) return;
  box.innerHTML = "";
  list("faq.items").forEach((f) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML =
      '<button type="button" class="faq-q" aria-expanded="false"><span class="q"></span><span class="faq-x"></span></button>' +
      '<div class="faq-a"><p></p></div>';
    item.querySelector(".q").textContent = f.q;
    item.querySelector(".faq-a p").textContent = f.a;
    const q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      $$(".faq-item.open", box).forEach((o) => {
        o.classList.remove("open");
        const oa = o.querySelector(".faq-a"), ob = o.querySelector(".faq-q");
        oa.style.maxHeight = oa.scrollHeight + "px";
        void oa.offsetHeight;
        oa.style.maxHeight = "0px";
        if (ob) ob.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
        setTimeout(() => { if (item.classList.contains("open")) a.style.maxHeight = "none"; }, 600);
      }
    });
    box.appendChild(item);
  });
}

function renderFooter() {
  const cols = $("#footerCols"); if (!cols) return;
  cols.innerHTML = "";
  ["footer.col1", "footer.col2", "footer.col3"].forEach((key) => {
    const col = t(key);
    if (!col || typeof col !== "object") return;
    const el = document.createElement("div");
    el.className = "fcol";
    el.innerHTML = "<h4></h4>";
    el.querySelector("h4").textContent = col.t || "";
    (col.links || []).forEach((l) => {
      const a = document.createElement("a");
      a.href = "#"; a.textContent = l;
      el.appendChild(a);
    });
    cols.appendChild(el);
  });
  const soc = $("#socials");
  if (soc && !soc.childElementCount) {
    SOCIALS.forEach((s) => {
      const a = document.createElement("a");
      a.href = "#"; a.setAttribute("aria-label", s.label);
      a.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + s.path + '"/></svg>';
      soc.appendChild(a);
    });
  }
}

/* ---------- form ---------- */
function initForm() {
  const form = $("#ctaForm"); if (!form) return;
  const input = $("#email"), msg = $("#formMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (input.value || "").trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (!ok) {
      input.classList.add("error");
      msg.textContent = t("cta.msgErr");
      msg.className = "form-msg err";
      input.focus();
      return;
    }
    input.classList.remove("error");
    msg.textContent = t("cta.msgOk");
    msg.className = "form-msg ok";
    input.value = "";
  });
  input.addEventListener("input", () => {
    input.classList.remove("error");
    if (msg.classList.contains("err")) { msg.textContent = ""; msg.className = "form-msg"; }
  });
}

/* ---------- misc ---------- */
function setYear() {
  const y = String(new Date().getFullYear());
  ["#year", "#yearMobile"].forEach((s) => { const el = $(s); if (el) el.textContent = y; });
}

/* ---------- scroll dot ---------- */
function initScrollDot() {
  const dot = $("#scrollDot"); if (!dot) return;
  let ticking = false;
  function update() {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    dot.style.setProperty("--p", p.toFixed(4));
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  injectDefs();
  setLang(initialLang());
  setYear();
  initNav();
  initLangUI();
  initSliderControls();
  initBillingToggle();
  initForm();
  initStars();
  initCursor();
  bindTilt();
  bindMagnetic();
  initScrollDot();
  runPreloader();
});

})();
