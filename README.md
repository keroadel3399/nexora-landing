# NEXORA — Digital Growth Studio

Professional digital-marketing landing page with strong animations and full multilingual support.

## ✨ Features
- **6 languages**: English, العربية (RTL), Français, Español, Deutsch, Türkçe
- Auto RTL/LTR switching + language saved in browser + shareable link (`?lang=ar`)
- Strong animations: aurora/starfield canvas, split-text, magnetic buttons, custom cursor, counters, tilt cards, reveal-on-scroll
- Dark theme, fully responsive, `prefers-reduced-motion` support
- Pure HTML/CSS/JS — no build step needed

## 🚀 Run locally
Just open `index.html` in any browser. That's it.

## 🌐 Deploy
- **Netlify Drop**: drag this folder to https://app.netlify.com/drop
- **GitHub Pages**: Settings → Pages → Branch `main` / root → Save

## 📁 Structure
```
index.html          — page structure (SEO + Open Graph included)
assets/css/styles.css  — theme, animations, RTL, responsive
assets/js/i18n.js   — translations dictionary (6 languages)
assets/js/main.js   — interactions & rendering engine
```

## ✏️ How to edit
- Texts/translations → `assets/js/i18n.js`
- Colors/theme → top of `assets/css/styles.css` (CSS variables)
- Sections/layout → `index.html`
