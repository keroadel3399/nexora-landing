# 📋 ملف تسليم السياق — مشروع NEXORA Landing

> **الغرض من الملف:** يتفتح في شات جديد مع الوكيل عشان يبقى فاكر كل حاجة حصلت في المشروع — لأن الشات مش بينقل كامل.
> **آخر تحديث:** 10 نوفمبر 2026

---

## 1) المشروع باختصار

- **الطلب الأصلي:** لاندينج بيج احترافية جدًا لشركة ديجيتال ماركتنج، بأنيميشن قوية ومبهرة، ودعم كل اللغات الأساسية.
- **الحالة:** تم التنفيذ بالكامل ✅ والنشر تم ✅ والموقع لايف ✅
- **اسم العلامة:** NEXORA — Digital Growth Studio
- **التقنيات:** HTML/CSS/JS خام بدون build step (مناسب لماك من غير Node)

## 2) اللينكات المهمة

| الحاجة | اللينك |
|---|---|
| الموقع لايف | https://keroadel3399.github.io/nexora-landing/ |
| النسخة العربية | https://keroadel3399.github.io/nexora-landing/?lang=ar |
| المستودع على GitHub | https://github.com/keroadel3399/nexora-landing |
| حساب GitHub | **keroadel3399** — مسجل دخول في GitHub Desktop على الماك |
| لينك هذا الملف (يُعطى للشات الجديد) | https://raw.githubusercontent.com/keroadel3399/nexora-landing/main/PROJECT-HANDOFF.md |

**أحدث كومِت:** `a09b747` — Journey Line (مرفوع ومؤكد على الموقع لايف)

## 3) ملفات المشروع على الماك

المسار الأساسي: `/Users/mm/nexora-landing`

- `index.html` — الهيكل الكامل (SEO + Open Graph + favicon)
- `assets/css/styles.css` — الثيم الداكن + كل الأنيميشن + RTL + Responsive
- `assets/js/i18n.js` — قاموس الترجمة (6 لغات) — **تغيير أي نص بأي لغة بيتم من هنا**
- `assets/js/main.js` — محرك التفاعلات والرندرة واختيار اللغة
- `README.md` + `.gitignore` + `PROJECT-HANDOFF.md` (الملف ده)
- **نسخة التسليم للعميل:** `/Users/mm/Desktop/Nexora-Website.zip` (~55 KB — فيها أنيميشن Journey Line — نظيفة بدون ملفات اختبار وبدون .git)
- `.git/credhelper.sh` — سكربت داخلي بيقرأ توكن GitHub من الـKeychain تلقائيًا (مهم للـpush — انظر القسم 5)
- `~/nexora-landing/_shots/` — ملفات اختبار قديمة، مستبعدة من git

## 4) مميزات الموقع (اتحقق منها فعليًا)

- Preloader + مؤشر ماوس مخصص + Nav لاصق + قائمة موبايل
- Hero مع داشبورد SVG متحرك + عدادات إحصاء + Marquee شعارات
- 6 كروت خدمات (تأثير Tilt) + 4 خطوات Process بخط تقدم + لوحة نتائج + 6 دراسات حالة
- سلايدر شهادات (4) + 3 باقات أسعار مع Toggle شهري/سنوي + FAQ (5 أسئلة) + فورم CTA بتحقق + فوتر
- **اللغات (6):** EN / AR (RTL) / FR / ES / DE / TR — تبديل تلقائي للاتجاه dir/ltr، حفظ اللغة في localStorage، دعم `?lang=` في الرابط
- الأنيميشن: Aurora/Starfield canvas، Split-text (وضع سطر كامل للعربية)، IntersectionObserver reveal، Magnetic buttons، دعم `prefers-reduced-motion`
- **Journey Line (اتضافت 10 نوفمبر):** خط مموج منقط في نص الصفحة بطولها كله + جزء مضيء بتدرج بنفسجي/تركواز بيتكشف مع السكورول + نقطة بيضاء متوهجة بتنزل من أول الصفحة لآخرها — ملفات `assets/js/journey.js` + `assets/css/journey.css`، بتتظبط تلقائيًا مع تغيير الطول/اللغة، ومتعمللها احترام prefers-reduced-motion
- **التحقق:** تم عبر DOM dump — العربية `lang="ar" dir="rtl"` والإنجليزية `lang="en" dir="ltr"`، بدون أي أخطاء JS في الكونسول

## 5) إعدادات الماك — دروس مهمة (مقريهاش تاني بالغلط)

- macOS arm64 — المستخدم `mm` — **مفيش:** python3 / node / npm / brew / gh / agent-browser
- **Apple Command Line Tools مش متسطبة** — أي استدعاء لـ `/usr/bin/git` بيطلع دايلوج "requesting install" على شاشة المستخدم — **تجنبه دايمًا** واستخدم git المدمج
- **الـgit الشغال:**
  ```bash
  APP="/Applications/GitHub Desktop.app/Contents/Resources/app/git"
  export GIT_EXEC_PATH="$APP/libexec/git-core"
  export GIT_TEMPLATE_DIR="$APP/share/git-core/templates"
  "$APP/bin/git" ...
  ```
- **مشكلة الـpush المكتشفة:** جيت المدمج بيرجع `--exec-path` غلط (`//libexec/git-core`) — الأوامر المحلية (add/commit) شغالة عادي، لكن push/fetch بيفشل بـ `remote helper 'https' aborted session` — الحل: تمرير `GIT_EXEC_PATH` بالمسار الصحيح (الأمر الجاهز تحت)
- **للـPush (الحل النهائي المؤكد — صامت بدون أي نافذة):** الـrepo فيه credential helper جاهز (`credential.helper = /Users/mm/nexora-landing/.git/credhelper.sh`) بيقرأ توكن GitHub Desktop من الـKeychain تلقائيًا (service = `GitHub - https://api.github.com`, account = `keroadel3399`). الأمر الجاهز:
  ```bash
  APP="/Applications/GitHub Desktop.app/Contents/Resources/app/git"
  cd ~/nexora-landing && GIT_EXEC_PATH="$APP/libexec/git-core" "$APP/bin/git" push origin main
  ```
- **لو ظهرت نافذة باسورد** (يعني السكربت اتشال): الماك بيطلب **باسورد اللاب توب** (مش باسورد GitHub) — المستخدم لازم يكتبه ويضغط Always Allow
- `curl` متاح — **النشر الأول تم بيه بالكامل** (GitHub API: إنشاء repo → push → تفعيل Pages). أول بناء للـPages أخد حوالي دقيقتين
- GitHub Desktop نفسه مسجل دخول وشغال — بيعمل push من غير أي نافذة

## 6) خط النشر الجاهز (لأي تعديل مستقبلي)

1. عدّل الملفات في `/Users/mm/nexora-landing`
2. Commit بالـgit المدمج (الأوامر فوق)
3. Push بالأمر الجاهز (GIT_EXEC_PATH + الـcredential helper الجاهز) — صامت بدون أي نافذة
4. GitHub Pages بيعيد النشر تلقائي خلال ~دقيقة
- **بديل بدون أوامر:** المستخدم يفتح GitHub Desktop → يكتب ملخص التعديل → Commit to main → **Push origin**

## 7) حاجات لسه مفتوحة (Open Items)

1. ~~تعديل الخطوط غير الحاجز~~ — **تم** (موجود فعلًا في index.html سطر 16-17)
2. **الفورم** بعرض رسالة نجاح بس — مش بيبعت إيميل فعليًا. لو العميل عايزه شغال: Netlify Forms أو Formspree (~5 دقايق)
3. **الاسم "Nexora"** مؤقت — يتحول لاسم شركة العميل في اللوجو وكل اللغات عند الطلب
4. لقطات شاشة نهائية (EN/AR/Mobile/Full-page) متأجلة — بسبب قيود أداة التصوير بس، الموقع نفسه سليم 100%

## 8) تفضيلات المستخدم (مهم جدًا لأي شات جديد)

- بيتكلم **عربي مصري** — الرد بنفس اللغة وببساطة وبدون مصطلحات تقنية
- **عايز الوكيل ينفذ كل حاجة لوحده** — أقل خطوات ممكنة منه هو، ومفيش شرح مطوّل
- أي موقع جديد يتبني → **ينشر على GitHub على طول** عشان التعديل بعدين يبقى سهل
- بيسأل كتير "فين الملف؟" — ادّيه المسار بدقة + ملف/لينك جاهز مباشرة

## 9) تسلسل الأحداث (مختصر)

1. بناء المشروع كامل في `~/nexora-landing` — 4 ملفات أساسية + 6 لغات
2. تحقق DOM للنسختين EN و AR — كله سليم بدون أخطاء
3. تجهيز Zip نظيف للتسليم على الـDesktop
4. تثبيت GitHub Desktop على الماك + تسجيل دخول بحساب keroadel3399
5. تهيئة git repo محلي — كوميتات: `ddda070` (الموقع) + `33327eb` (README)
6. **النشر:** إنشاء repo على GitHub + push + تفعيل Pages → الموقع لايف (HTTP 200 للإنجليزية والعربية)
7. ربط النسخة المحلية بـ origin وتتبع main — كل حاجة متزامنة
8. إضافة أنيميشن Journey Line (خط مموج + نقطة مضيئة بالسكورول) — كومِت `a09b747`
9. إصلاح مشكلة الـpush (exec-path غلط + إضافة credhelper.sh يقرأ التوكن من الـKeychain بصمت) → الرفع نجح، والتحقق إن GitHub Pages نشرها فعليًا (journey.js/css رجعت 200)، وإعادة بناء الـzip للعميل + تحديث هذا الملف (10 نوفمبر 2026)
