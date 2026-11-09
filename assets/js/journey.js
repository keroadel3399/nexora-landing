/* ============================================================
   NEXORA — journey line
   Wavy rail down the middle of the page; a glowing dot travels
   along it as you scroll, from the top of the page to the end.
   Vanilla JS · no dependencies · respects reduced motion
   ============================================================ */
(()=>{
"use strict";
if (window.__nexoraJourney) return;
window.__nexoraJourney = true;

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wrap = document.createElement("div");
wrap.className = "journey";
wrap.setAttribute("aria-hidden", "true");
wrap.innerHTML =
  '<svg class="journey-svg" aria-hidden="true">' +
  '<defs>' +
  '<linearGradient id="jGrad" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#7c5cff"/>' +
  '<stop offset=".5" stop-color="#c04dff"/>' +
  '<stop offset="1" stop-color="#00e5c7"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<path class="j-glow" fill="none"/>' +
  '<path class="j-base" fill="none"/>' +
  '<path class="j-prog" fill="none"/>' +
  '<circle class="j-halo" r="11"/>' +
  '<circle class="j-dot" r="5"/>' +
  '</svg>';
document.body.appendChild(wrap);

const svg  = wrap.querySelector("svg");
const glow = wrap.querySelector(".j-glow");
const base = wrap.querySelector(".j-base");
const prog = wrap.querySelector(".j-prog");
const dot  = wrap.querySelector(".j-dot");
const halo = wrap.querySelector(".j-halo");

let len = 0, raf = 0, resizeT = 0;

function build(){
  const W = Math.max(320, window.innerWidth);
  /* collapse the overlay while measuring so it can never inflate
     the measured document height (no feedback loops) */
  svg.setAttribute("height", "2");
  const H = Math.max(window.innerHeight * 1.5, document.documentElement.scrollHeight);
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);

  const cx  = W / 2;
  const amp = Math.round(Math.min(90, Math.max(38, W * .045)));
  const seg = Math.max(6, Math.round(H / 850));
  const step = H / seg;
  let d = "M " + cx + " 0";
  for (let i = 0; i < seg; i++){
    const dir = i % 2 ? -1 : 1;
    d += " C " + (cx + amp * dir) + " " + Math.round(i * step + step * .30) +
         ", "  + (cx + amp * dir) + " " + Math.round(i * step + step * .70) +
         ", "  + cx + " " + Math.round((i + 1) * step);
  }
  base.setAttribute("d", d);
  glow.setAttribute("d", d);
  prog.setAttribute("d", d);

  len = prog.getTotalLength();
  const dash = len + " " + len;
  glow.style.strokeDasharray = dash;
  prog.style.strokeDasharray = dash;
  update();
}

function update(){
  raf = 0;
  if (!len) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const p = max > 0
    ? Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset || 0) / max))
    : 0;
  const off = len * (1 - p);
  prog.style.strokeDashoffset = off;
  glow.style.strokeDashoffset = off;
  const pt = prog.getPointAtLength(len * p);
  const x = pt.x.toFixed(1), y = pt.y.toFixed(1);
  dot.setAttribute("cx", x);  dot.setAttribute("cy", y);
  halo.setAttribute("cx", x); halo.setAttribute("cy", y);
}

function schedule(){ if (!raf) raf = requestAnimationFrame(update); }
function scheduleBuild(){ clearTimeout(resizeT); resizeT = setTimeout(build, 160); }

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", scheduleBuild);

/* keep the rail in sync with content-height changes
   (language re-render, FAQ, images, ...) */
if ("ResizeObserver" in window){
  new ResizeObserver(scheduleBuild).observe(document.body);
}

build();
window.addEventListener("load", () => { build(); setTimeout(build, 900); });

if (reduced){
  /* static fully-drawn rail, no travelling dot */
  prog.style.strokeDashoffset = "0";
  glow.style.strokeDashoffset = "0";
  dot.style.display  = "none";
  halo.style.display = "none";
} else {
  schedule();
}
})();
