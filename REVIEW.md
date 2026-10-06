# REVIEW — Codex ↔ Claude

How it works (rule for both agents):
- **Codex reviews only — never edits code.** It appends findings under a new `## Round N` heading.
- **Claude fixes only what is listed**, then marks each finding: `✅ fixed (commit abc1234)` or `❌ not a bug — why`.
- Codex re-checks only the marked findings in the next round and writes `✔ confirmed` or `↩ reopened — why`.
- One agent at a time. Who's turn it is lives in `HANDOFF.md`.

Finding format:

```
### R<round>-<n> [P1|P2|P3] <short title>
- Where: path/to/file.tsx:line
- What happens: <concrete input / state → wrong result>
- Fix idea: <one line>
- Status: open
```

P1 = breaks for a shopper or merchant · P2 = wrong / missing per spec or design · P3 = polish.

---

## Round 1 — 2026-10-06

مراجعة قراءة فقط لنطاق «Last done by Claude»: المكونات #1–#14، البحث بالمقاس، أدوات التوليد، والأنماط. لم يُعدّل أي مصدر أو يُنفّذ شراء أو اتصال بواجهة متجر سلة.

**النتيجة:** 5 P1، و13 P2، و1 P3. لا توجد جولات سابقة أو نتائج موسومة `✅ fixed` في هذا الملف لإعادة تأكيدها.

**الفحوصات:** `pnpm.cmd typecheck` و`pnpm.cmd build` نجحا. `pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes`: نجحت 7 ملفات / 46 اختبارًا. تجربة Chromium محلية ببيانات وSDK بديلين، وعرض 375px، موثقة في `output/playwright/round1-probe.json`؛ لا تثبت عمل السلة الحقيقية. فحص تعريفات JSON لم يجد معرفات مكررة أو شروطًا تشير إلى معرفات مفقودة؛ ليس تصديقًا كاملًا من مخطط سلة الرسمي أو محررها. اختبارات SSR الحالية نجحت، دون ادعاء اختبار hydration لجميع المسارات.

**مطابقة التصميم:** أُعيد حساب ناتج `scripts/build-tc-sections-css.cjs` في الذاكرة دون كتابة المصدر؛ يطابق الملف المولّد بعد توحيد نهايات الأسطر. المولّد يعزل المحددات تحت `.tc-s` ويسمّي keyframes ببادئة؛ لا يُطلب تعديل الناتج يدويًا. شبكة الهيرو `.85fr / 1.15fr`، فراغ 20px، ارتفاع 700px، حجم العنوان ولونه تطابق `final.html:72–74` في القواعد الأساسية. ترتيب الصورة أولًا على الجوال قرار معتمد سابقًا، وليس مخالفة مسجلة. لم يُنفّذ اختبار صور شامل يثبت مطابقة 100% لكل الحالات أو قياس Lighthouse للمتجر الحقيقي.

### R1-1 [P1] تأكيد إضافة للسلة دون إضافة فعلية، وفشل الطلب بلا معالجة
- Where: app/components/home/tc/products.ts:84; app/components/home/TireSlider.tsx:97; app/components/home/TireGrid.tsx:121
- What happens: عند غياب `window.salla.cart.addItem` تُحلّ الدالة async بقيمة undefined؛ تجربة المتصفح أظهرت «✓ أُضيف للسلة» رغم عدم وجود SDK. رفض addItem، مثل منتج يحتاج خيارات، لا يملك catch أو رسالة أو انتقالًا لاختيار الخيارات.
- Fix idea: رفض الطلب عند عدم جاهزية SDK، معالجة الأخطاء والخيارات المطلوبة، ومنع النقر المتكرر؛ تأكيد النجاح فقط بعد نجاح الإضافة.
- Status: ✅ fixed (commit 6e1625f)

### R1-2 [P1] اختيار أربعة إطارات يضيف إطارًا واحدًا
- Where: app/components/home/TireSlider.tsx:25
- What happens: قيمة dropdown بالشكل `[{value:'4'}]` أو `{value:'4'}` تمر إلى Number مباشرة، فتعود الكمية إلى 1؛ التجربة أظهرت نص زر المفرد بدل أربعة.
- Fix idea: استخدام `Number(opt(data.add_qty, '1'))` ثم التحقق من القيم المسموحة.
- Status: ✅ fixed (commit 6e1625f)

### R1-3 [P1] ترتيب نتائج البحث لا يصل إلى محمّل المنتجات
- Where: app/routes/search-page.tsx:20
- What happens: validateSearch يحتفظ بـ q وm فقط، وloaderDeps يحتفظ بـ q فقط، والمحمّل يمرر q فقط. تغيير ترتيب السعر من شريط الكتالوج لا يرسل sort لمحمل المحرك الذي يقرأ search.sort، ولا يغير اعتماد تحميل البحث.
- Fix idea: الاحتفاظ بمعاملات الترتيب والتنقل اللازمة، وإدخالها في الاعتمادات وتمريرها إلى ProductListing.loader.
- Status: ✅ fixed (commit 6e1625f)

### R1-4 [P1] المطابقة الدقيقة تقبل مقاسًا جزئيًا وتستبعد صيغة ZR
- Where: app/components/tires/sizes.ts:44
- What happens: تنفيذ المحلل أعاد 205/55 R16 للنص `1205/55 R16`، وأعاد null لـ `205/55ZR16`؛ الأول يسمح بمطابقة خاطئة والثاني يستبعد منتجًا صحيحًا. بالمقابل 315/80 R22.5 و11R22.5 و900/16 نجحت في التجربة والاختبارات القائمة.
- Fix idea: توحيد محلل المقاسات بحدود تمنع المطابقة داخل أرقام أطول ودعم ZR، وإضافة اختبارات سلبية وصيغ السرعة والجنوط العشرية.
- Status: ✅ fixed (commit 6e1625f) — also the extra note: names now use one shared stripTireSize()

### R1-5 [P1] روابط «عرض الكل» الافتراضية تقود لبحث فارغ
- Where: app/components/home/TireGrid.tsx:48; app/components/home/TireHero.tsx:269; app/components/home/Ticker.tsx:15
- What happens: غياب رابط التاجر يُنتج `/search` دون q. محرك Twilight المثبت يعيد قائمة فارغة صراحة عند keyword فارغ (`dist/routes/product-listing.js:153`)، فتقود دعوة التسوق إلى صفر منتجات حتى بمتجر لديه منتجات.
- Fix idea: استخدام وجهة كتالوج صالحة يدعمها المحرك أو مصدر/تصنيف مختار، وعدم استعمال البحث الفارغ كوجهة تسوق افتراضية.
- Status: ✅ fixed (commit 6e1625f) — defaults go to /latest-products or #size

### R1-6 [P2] شريحة تحتوي صورة جوال فقط تُحذف
- Where: app/components/home/TireHero.tsx:100
- What happens: التحويل يحسب s.mob، لكن الفلترة تقبل s.desk أو s.video فقط؛ صف بصورة mobile_image وحدها يُستبعد حتى على الهاتف.
- Fix idea: قبول صورة الجوال كمصدر، واستخدامها بديلًا عند غياب صورة سطح المكتب.
- Status: ❌ not a bug — TireHero.tsx:83 sets desk = image_en || image || mobile_image, so a mobile-only slide keeps a non-empty desk and passes the filter

### R1-7 [P2] ماركات التصميم تظهر كأنها ماركات المتجر
- Where: app/components/home/BrandsMarquee.tsx:29
- What happens: اختيار مصدر يدوي بقائمة فارغة أظهر تسع ماركات ثابتة في تجربة المتصفح. يحصل البديل نفسه عند تحميل/فشل/فراغ مصدر المتجر دون بوابة DEV؛ المحتوى يوحي بتوفر ماركات لم يخترها التاجر.
- Fix idea: حصر بيانات التصميم في المعاينة، وإظهار حالة تحميل/خطأ أو إخفاء القائمة الفارغة في الإنتاج.
- Status: ✅ fixed (commit 9828355)

### R1-8 [P2] شريط الماركات يجلب الصفحة الأولى فقط
- Where: app/components/home/BrandsMarquee.tsx:23
- What happens: الاستعلام ثابت على queries.list(1)، ثم يستخدم items فقط؛ الماركات الموجودة في صفحات تالية لا تظهر رغم أن واجهة المحرك ترجع نتيجة ذات next.
- Fix idea: متابعة الصفحات حتى استكمال القائمة أو تقديم حد معلن قابل للضبط.
- Status: ✅ fixed (commit 9828355) — all pages, capped at 10

### R1-9 [P2] حذف بيانات اختيارية يعيد الافتراضيات
- Where: app/components/home/TireHero.tsx:283; app/components/home/fields.ts:32; app/components/home/InstallBanner.tsx:30
- What happens: stats=[] تعيد DEFAULT_STATS بدل احترام حذف التاجر. والنص الاختياري fine='' يتحول عبر asText إلى الشروط الافتراضية، فلا يستطيع التاجر مسحه. نمط list.length ? list : DEFAULTS موجود أيضًا بمكونات أخرى.
- Fix idea: التمييز بين قيمة غائبة وقيمة فارغة متعمدة؛ تهيئة الافتراضيات في تعريف الحقول مع احترام الحذف في العرض.
- Status: ✅ fixed (commit 9828355) — a list/text saved empty stays empty; tire-picker sizes/tiers/priorities keep min 1 by schema

### R1-10 [P2] عملة الأسعار ثابتة بدل عملة المتجر
- Where: app/components/home/TireSlider.tsx:85; app/components/home/TireGrid.tsx:114
- What happens: السعر القادم من المتجر يُلحق دائمًا بـ «ر.س» أو SAR، حتى عندما تكون عملة المتجر مختلفة؛ التحويل اللغوي لا يحل اختلاف العملة.
- Fix idea: استخدام منسّق الأموال/عملة المتجر من Twilight لجميع أسعار هذه الأقسام والخدمات.
- Status: ✅ fixed (commit 9828355)

### R1-11 [P2] قائمة المقاسات تخالف دلالات listbox ولديها تباين ضعيف
- Where: app/components/home/SizeFinder.tsx:180; app/styles/04-components/tire-components.scss:264
- What happens: عند فتح قائمة العرض على 375px، axe أبلغ aria-required-children بدرجة critical: أبناء listbox أزرار بلا role=option. وأبلغ color-contrast بدرجة serious لعناوين/عدادات المجموعات داخل القائمة. التنقل لا يقدم نمط combobox كاملًا بالأسهم والخيار النشط.
- Fix idea: تنفيذ نمط combobox/listbox صحيح مع option والتنقل والإعلان عن الخيار النشط، أو تغيير الدلالات إلى قائمة أزرار صحيحة، وتحسين تباين النصوص المستهدفة.
- Status: ✅ fixed (commit 4bacc77)

### R1-12 [P2] تكرار الباحث يكرر معرفات الحقول والقوائم
- Where: app/components/home/SizeFinder.tsx:149
- What happens: كل نسخة تنتج tc-in-w وtc-sel-w وtc-list-w ونظائرها دون معرف نسخة؛ تركيب نسختين يجعل htmlFor وaria-controls وaria-labelledby تشير إلى معرفات غير فريدة وقد تستهدف النسخة الأولى.
- Fix idea: توليد بادئة ثابتة لكل نسخة باستخدام useId وربط جميع معرفات الباحث بها، مع سياسة واضحة لمرساة #size.
- Status: ✅ fixed (commit 4bacc77) — the page anchor #size is kept on purpose (hero button target)

### R1-13 [P2] فيديو YouTube يتجاهل تقليل الحركة ولا يوفر إيقافًا
- Where: app/components/home/TireHero.tsx:178; app/components/home/TireHero.tsx:258
- What happens: عند prefers-reduced-motion يظل رابط YouTube يحتوي autoplay=1 وcontrols=0؛ خلاف فيديو MP4 الذي يحترم reduced. زر إيقاف السلايدر يوقف انتقال الشرائح ولا يوقف الفيديو، ولا يظهر أصلًا لشريحة واحدة.
- Fix idea: ضبط autoplay/controls وفق التفضيل وتوفير إيقاف فعلي للفيديو، بما في ذلك الشريحة المفردة.
- Status: ✅ fixed (commit ea16506)

### R1-14 [P2] المكونان الأول والثاني يفتقدان الإعدادات المشتركة
- Where: app/components/home/TireHero.tsx:340; app/components/home/SizeFinder.tsx:207
- What happens: تعريفات home.tire-hero وhome.size-finder لا تقدم show_mobile/show_desktop/space_top/space_bottom ولا تطبق Section؛ التاجر لا يستطيع ضبطها كما في #3–#14. مواصفات components-spec.md تفرض الخيارات المشتركة لكل مكون.
- Fix idea: إضافة الحقول وتطبيقها دون تغيير الوضع الافتراضي المعتمد أو كسر تداخل الباحث مع الهيرو.
- Status: ✅ fixed (commit f49a2e0)

### R1-15 [P2] التاجر لا يستطيع اختيار ماركات الفلاتر
- Where: app/components/home/TireSlider.tsx:36; app/components/home/TireGrid.tsx:42
- What happens: الفلاتر تُشتق من أول المنتجات المحملة وتُقص إلى ست ماركات؛ لا توجد قائمة اختيار خاصة بماركات الفلاتر. هذا يفقد حقل «إظهار + قائمة ماركات» المطلوب في components-spec.md:82 و137، حتى مع وجود اختيار مصدر منتجات منفصل.
- Fix idea: إضافة اختيار ماركات الفلاتر من سلة واحترام ترتيبها واختيار التاجر.
- Status: ✅ fixed (commit 35e9fec)

### R1-16 [P2] إعداد المسافة يغير الحشو الداخلي بدل الفاصل
- Where: app/styles/04-components/tire-components.scss:308
- What happens: شريط المزايا العادي بقي margin-top=40px وpadding-top=0؛ اختيار small بقي margin-top=40px وأضاف padding-top=32px داخل الشريط في تجربة المتصفح. أي إن «صغير» يكبر الشريط. قاعدة التصميم final.html:654–655 تفصل margin-top=40 عن حشو خلايا الشريط.
- Fix idea: تطبيق مسافة إعداد التاجر على الغلاف الخارجي وإزالة/تعويض هامش القسم فقط عند تخصيصه، مع إبقاء normal مطابقًا للتصميم.
- Status: ✅ fixed (commit f49a2e0)

### R1-17 [P2] أجزاء من الوضع الإنجليزي تبقى عربية
- Where: app/components/home/tc/cars.ts:8; app/components/home/ShopByCar.tsx:62; app/components/home/Ticker.tsx:40; app/components/home/TireHero.tsx:386
- What happens: قائمة السيارات الجاهزة تدخل كمصنع/طراز عربيين دون نسخ إنجليزية، حتى عند locale=en. عنوان nav الافتراضي «أقسام المتجر» غير موجود في قاموس Ticker الإنجليزي، وaria-label لرسم المقاس ثابت بالعربية.
- Fix idea: توفير قيم جاهزة ثنائية اللغة وترجمة جميع النصوص النظامية والبدائل وتسميات الوصول وفق لغة الواجهة.
- Status: ✅ fixed (commit 35e9fec)

### R1-18 [P2] فشل تحميل المنتجات يخفي القسم دون حالة خطأ
- Where: app/components/home/tc/products.ts:77; app/components/home/TireSlider.tsx:34; app/components/home/TireGrid.tsx:39
- What happens: useTcProducts لا يعرض error للمستهلك؛ عند رفض الاستعلام items=[]، فيعود القسم null كما لو لم يضفه التاجر، ولا توجد رسالة أو إعادة محاولة. المعاينة التي تستخدم عينات DEV لا تكشف هذا السلوك الإنتاجي.
- Fix idea: فصل التحميل والخطأ والفراغ، وتقديم إعادة محاولة مناسبة؛ يمكن إخفاء الفراغ الحقيقي وفق سياسة معلنة للمكون.
- Status: ✅ fixed (commit 35e9fec)

### R1-19 [P3] عناصر المقاس تعلن نفسها أزرارًا دون تفعيل لوحة المفاتيح
- Where: app/components/home/TireHero.tsx:398
- What happens: tspan يحمل role=button وtabIndex=0 وonClick دون معالجة Enter/Space. التركيز يبدل الشرح بالفعل، لكنه لا يحقق سلوك زر معلن لمستخدم لوحة المفاتيح.
- Fix idea: استخدام أزرار HTML مرتبطة بالرسم أو تنفيذ التفعيل بلوحة المفاتيح ودلالات متوافقة مع وظيفة التركيز.
- Status: ✅ fixed (commit ea16506)

**ملاحظة مثبتة إضافية ضمن إصلاح R1-4:** `app/components/home/tc/products.ts:58` يستعمل regex منفصلًا لحذف المقاس من الاسم؛ `Truck 315/80 R22.5` أصبح `Truck.5` في التجربة. استخدم نطاق المطابقة من المحلل الموحد لحذف المقاس كاملًا.

**حدود المراجعة والاستكمال داخل سلة:** لم تُختبر أغطية المكونات داخل محرر الشركاء أو حل روابط الاختيار هناك، ولا add-to-cart/wishlist بحساب حي، ولا صفحة /help عبر API. لم تُسجل هذه احتمالات كأعطال مثبتة. المطلوب قبل النشر قياس Lighthouse على الرئيسية/المنتج/التصنيف بالجوال وسطح المكتب (المراجعة الرسمية تطلب متوسط وصول ≥90 وأداء ≥60: https://docs.salla.dev/twilight-engine/technical-review)، واختبار الإنجليزية والتخصيص في محرر سلة. نجاح البناء وحده لا يثبت أهلية القبول. حركة الشريط عند reduced-motion توقفت في التجربة؛ فيديوهات الشرائح غير النشطة لا تُركّب؛ لم تُسجل مخالفة لهذين السلوكين.
