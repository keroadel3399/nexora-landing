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

/* rocket launch FX for back-to-top (compositor-only: transform + opacity) */
function __rkLaunch(b,Z,P){
  try{
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(b.__rk||!b.animate)return;b.__rk=1;
    if(!document.getElementById('rk-css')){var st=document.createElement('style');st.id='rk-css';st.textContent=
'.rk-ly{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:'+Z+'}'+
'.rk-fx{position:fixed;width:0;height:0;pointer-events:none;z-index:'+Z+'}'+
'.rk-fl{position:absolute;left:-11px;top:8px;width:22px;height:120px;transform-origin:50% 0;border-radius:11px 11px 50% 50%/8px 8px 100% 100%;background:linear-gradient(to bottom,var(--rk-a) 0%,var(--rk-b) 24%,var(--rk-c) 62%,transparent 100%);-webkit-filter:blur(1.4px);filter:blur(1.4px);will-change:transform;animation:rk-fl .12s ease-in-out infinite alternate}'+
'.rk-co{position:absolute;left:-5px;top:8px;width:10px;height:58px;transform-origin:50% 0;border-radius:5px 5px 50% 50%/4px 4px 100% 100%;background:linear-gradient(to bottom,#fff 0%,var(--rk-a) 55%,transparent 100%);will-change:transform;animation:rk-fl .09s ease-in-out infinite alternate}'+
'.rk-p{position:absolute;width:5px;height:5px;margin:-2px 0 0 -2px;border-radius:50%;background:var(--rk-b);opacity:0;will-change:transform,opacity;animation:rk-p var(--d) cubic-bezier(.2,.6,.4,1) forwards}'+
'.rk-p.s{width:2px;height:2px;background:var(--rk-a)}'+
'.rk-sh{position:absolute;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;border:1.5px solid var(--rk-b);opacity:0;will-change:transform,opacity;animation:rk-sh .6s cubic-bezier(.1,.6,.3,1) forwards}'+
'@keyframes rk-fl{from{transform:scale(.86,.88)}to{transform:scale(1.06,1.1)}}'+
'@keyframes rk-p{0%{opacity:.95;transform:translate3d(0,0,0) scale(1)}100%{opacity:0;transform:translate3d(var(--dx),var(--dy),0) scale(.2)}}'+
'@keyframes rk-sh{0%{opacity:.75;transform:scale(.6)}100%{opacity:0;transform:scale(2.6)}}';
    document.head.appendChild(st);}
    var r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,
        D=Math.max(260,r.top+120),T=820,
        css=function(e){e.style.setProperty('--rk-a',P[0]);e.style.setProperty('--rk-b',P[1]);e.style.setProperty('--rk-c',P[2])},
        ly=document.createElement('div');ly.className='rk-ly';css(ly);
    var fx=document.createElement('div');fx.className='rk-fx';css(fx);fx.style.left=cx+'px';fx.style.top=cy+'px';
    var fl=document.createElement('div');fl.className='rk-fl';var co=document.createElement('div');co.className='rk-co';
    fx.appendChild(fl);fx.appendChild(co);document.body.appendChild(ly);document.body.appendChild(fx);
    var ease='cubic-bezier(.5,.02,.85,.4)',anims=[];
    anims.push(b.animate([{transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:0},{transform:'translate3d(0,-'+(D*0.04)+'px,0) scale(1.06)',opacity:1,offset:.12},{transform:'translate3d(0,-'+D+'px,0) scale(1)',opacity:1,offset:.85},{transform:'translate3d(0,-'+(D*1.05)+'px,0) scale(1)',opacity:0,offset:1}],{duration:T,easing:ease,fill:'forwards'}));
    anims.push(fx.animate([{transform:'translate3d(0,0,0)',opacity:0,offset:0},{transform:'translate3d(0,-'+(D*0.04)+'px,0)',opacity:1,offset:.12},{transform:'translate3d(0,-'+D+'px,0)',opacity:1,offset:.85},{transform:'translate3d(0,-'+(D*1.05)+'px,0)',opacity:0,offset:1}],{duration:T,easing:ease,fill:'forwards'}));
    function put(cls,x,y,vars){var p=document.createElement('i');p.className=cls;p.style.left=x+'px';p.style.top=y+'px';for(var k in vars)p.style.setProperty(k,vars[k]);p.addEventListener('animationend',function(){if(p.parentNode)p.parentNode.removeChild(p)});ly.appendChild(p);return p}
    var sh=put('rk-sh',cx,cy,{});
    function puff(x,y,big){
      if(ly.childNodes.length>34)return;
      put('rk-p'+(Math.random()<.45?' s':''),x+(Math.random()-.5)*12,y,{'--dx':((Math.random()-.5)*(big?46:28)).toFixed(1)+'px','--dy':(40+Math.random()*(big?120:80)).toFixed(0)+'px','--d':((360+Math.random()*(big?520:340))|0)+'ms'});
    }
    for(var i=0;i<10;i++)puff(cx,cy+22,true);
    var t0=Date.now(),iv=setInterval(function(){
      var rr=b.getBoundingClientRect(),x=rr.left+rr.width/2,y=rr.top+rr.height/2+24;
      puff(x,y,false);puff(x,y+8,false);if(Math.random()<.5)puff(x,y,false);
      if(Date.now()-t0>T)end();
    },40),ended=0;
    function end(){
      if(ended)return;ended=1;clearInterval(iv);
      setTimeout(function(){
        anims.forEach(function(a){try{a.cancel()}catch(e){}});
        if(fx.parentNode)fx.parentNode.removeChild(fx);if(ly.parentNode)ly.parentNode.removeChild(ly);b.__rk=0;
      },80);
    }
  }catch(e){b.__rk=0}
}

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
    __rkLaunch(b, 219, ['#f6ffc2', '#c6ff00', 'rgba(198,255,0,.35)']);
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
