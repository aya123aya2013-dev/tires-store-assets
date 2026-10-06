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
- Status: ✅ fixed (76a5630) — no success claim: status says finish signing up in the new tab / send the email, or browser blocked the tab — try again
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
- Re-check (Round 2): ✔ confirmed — المسبار أظهر خطأ عند غياب SDK، ثم أكد النجاح فقط بعد حل بديل addItem؛ الكود يوجه منتجات الخيارات إلى صفحتها ويعطل زر الطلب الجاري. لا شراء حقيقي.

### R1-2 [P1] اختيار أربعة إطارات يضيف إطارًا واحدًا
- Where: app/components/home/TireSlider.tsx:25
- What happens: قيمة dropdown بالشكل `[{value:'4'}]` أو `{value:'4'}` تمر إلى Number مباشرة، فتعود الكمية إلى 1؛ التجربة أظهرت نص زر المفرد بدل أربعة.
- Fix idea: استخدام `Number(opt(data.add_qty, '1'))` ثم التحقق من القيم المسموحة.
- Status: ✅ fixed (commit 6e1625f)
- Re-check (Round 2): ✔ confirmed — [{value:"4"}] أعطت زر أربعة، واستلم بديل SDK quantity=4.

### R1-3 [P1] ترتيب نتائج البحث لا يصل إلى محمّل المنتجات
- Where: app/routes/search-page.tsx:20
- What happens: validateSearch يحتفظ بـ q وm فقط، وloaderDeps يحتفظ بـ q فقط، والمحمّل يمرر q فقط. تغيير ترتيب السعر من شريط الكتالوج لا يرسل sort لمحمل المحرك الذي يقرأ search.sort، ولا يغير اعتماد تحميل البحث.
- Fix idea: الاحتفاظ بمعاملات الترتيب والتنقل اللازمة، وإدخالها في الاعتمادات وتمريرها إلى ProductListing.loader.
- Status: ✅ fixed (commit 6e1625f)
- Re-check (Round 2): ✔ confirmed — validateSearch وloaderDeps وProductListing.loader تحتفظ الآن بـ page/sort وتُمررهما. توجد مشكلة كاش مختلفة موثقة في R2-5.

### R1-4 [P1] المطابقة الدقيقة تقبل مقاسًا جزئيًا وتستبعد صيغة ZR
- Where: app/components/tires/sizes.ts:44
- What happens: تنفيذ المحلل أعاد 205/55 R16 للنص `1205/55 R16`، وأعاد null لـ `205/55ZR16`؛ الأول يسمح بمطابقة خاطئة والثاني يستبعد منتجًا صحيحًا. بالمقابل 315/80 R22.5 و11R22.5 و900/16 نجحت في التجربة والاختبارات القائمة.
- Fix idea: توحيد محلل المقاسات بحدود تمنع المطابقة داخل أرقام أطول ودعم ZR، وإضافة اختبارات سلبية وصيغ السرعة والجنوط العشرية.
- Status: ✅ fixed (commit 6e1625f) — also the extra note: names now use one shared stripTireSize()
- Re-check (Round 2): ✔ confirmed — 1205/55 R16 أُعيد null؛ ZR و900/16 و11R22.5 و315/80 R22.5 طابقت، وstripTireSize أبقى اسم Truck دون .5؛ الاختبارات المضافة ناجحة.

### R1-5 [P1] روابط «عرض الكل» الافتراضية تقود لبحث فارغ
- Where: app/components/home/TireGrid.tsx:48; app/components/home/TireHero.tsx:269; app/components/home/Ticker.tsx:15
- What happens: غياب رابط التاجر يُنتج `/search` دون q. محرك Twilight المثبت يعيد قائمة فارغة صراحة عند keyword فارغ (`dist/routes/product-listing.js:153`)، فتقود دعوة التسوق إلى صفر منتجات حتى بمتجر لديه منتجات.
- Fix idea: استخدام وجهة كتالوج صالحة يدعمها المحرك أو مصدر/تصنيف مختار، وعدم استعمال البحث الفارغ كوجهة تسوق افتراضية.
- Status: ✅ fixed (commit 6e1625f) — defaults go to /latest-products or #size
- Re-check (Round 2): ✔ confirmed — وجهات التسوق المحددة في النتيجة أصبحت /latest-products أو #size بدل البحث الفارغ. لا يُستنتج من ذلك نجاح /help عبر API.

### R1-6 [P2] شريحة تحتوي صورة جوال فقط تُحذف
- Where: app/components/home/TireHero.tsx:100
- What happens: التحويل يحسب s.mob، لكن الفلترة تقبل s.desk أو s.video فقط؛ صف بصورة mobile_image وحدها يُستبعد حتى على الهاتف.
- Fix idea: قبول صورة الجوال كمصدر، واستخدامها بديلًا عند غياب صورة سطح المكتب.
- Status: ❌ not a bug — TireHero.tsx:83 sets desk = image_en || image || mobile_image, so a mobile-only slide keeps a non-empty desk and passes the filter
- Re-check (Round 2): ✔ confirmed — اعتراض Claude صحيح: mobile_image العربية تعوّض desk وتظهر الشريحة؛ الملاحظة الأصلية مسحوبة. أعاد المسبار صورة واحدة ونجح اختبار Playwright. R2-11 حالة مختلفة تخص mobile_image_en وحدها.

### R1-7 [P2] ماركات التصميم تظهر كأنها ماركات المتجر
- Where: app/components/home/BrandsMarquee.tsx:29
- What happens: اختيار مصدر يدوي بقائمة فارغة أظهر تسع ماركات ثابتة في تجربة المتصفح. يحصل البديل نفسه عند تحميل/فشل/فراغ مصدر المتجر دون بوابة DEV؛ المحتوى يوحي بتوفر ماركات لم يخترها التاجر.
- Fix idea: حصر بيانات التصميم في المعاينة، وإظهار حالة تحميل/خطأ أو إخفاء القائمة الفارغة في الإنتاج.
- Status: ✅ fixed (commit 9828355)
- Re-check (Round 2): ✔ confirmed — في وضع إنتاج المسبار لم تظهر ماركات التصميم عند brands:[]؛ البديل محصور في DEV.

### R1-8 [P2] شريط الماركات يجلب الصفحة الأولى فقط
- Where: app/components/home/BrandsMarquee.tsx:23
- What happens: الاستعلام ثابت على queries.list(1)، ثم يستخدم items فقط؛ الماركات الموجودة في صفحات تالية لا تظهر رغم أن واجهة المحرك ترجع نتيجة ذات next.
- Fix idea: متابعة الصفحات حتى استكمال القائمة أو تقديم حد معلن قابل للضبط.
- Status: ✅ fixed (commit 9828355) — all pages, capped at 10
- Re-check (Round 2): ✔ confirmed — بديل API ذي صفحتين استُدعي للصفحتين 1 و2 وأظهر Brand1 وBrand2؛ الكود يتابع next مع الحد المعلن 10 صفحات.

### R1-9 [P2] حذف بيانات اختيارية يعيد الافتراضيات
- Where: app/components/home/TireHero.tsx:283; app/components/home/fields.ts:32; app/components/home/InstallBanner.tsx:30
- What happens: stats=[] تعيد DEFAULT_STATS بدل احترام حذف التاجر. والنص الاختياري fine='' يتحول عبر asText إلى الشروط الافتراضية، فلا يستطيع التاجر مسحه. نمط list.length ? list : DEFAULTS موجود أيضًا بمكونات أخرى.
- Fix idea: التمييز بين قيمة غائبة وقيمة فارغة متعمدة؛ تهيئة الافتراضيات في تعريف الحقول مع احترام الحذف في العرض.
- Status: ✅ fixed (commit 9828355) — a list/text saved empty stays empty; tire-picker sizes/tiers/priorities keep min 1 by schema
- Re-check (Round 2): ✔ confirmed — stats:[] أزالت الشريط وfine:"" بقي فارغًا؛ الصفوف المحفوظة الفارغة تُحترم. R2-12 يخص مسح لغة واحدة فقط.

### R1-10 [P2] عملة الأسعار ثابتة بدل عملة المتجر
- Where: app/components/home/TireSlider.tsx:85; app/components/home/TireGrid.tsx:114
- What happens: السعر القادم من المتجر يُلحق دائمًا بـ «ر.س» أو SAR، حتى عندما تكون عملة المتجر مختلفة؛ التحويل اللغوي لا يحل اختلاف العملة.
- Fix idea: استخدام منسّق الأموال/عملة المتجر من Twilight لجميع أسعار هذه الأقسام والخدمات.
- Status: ✅ fixed (commit 9828355)
- Re-check (Round 2): ✔ confirmed — منتج USD ظهر بسعر 100 $ في المسبار؛ ServicesBento وTirePicker يستعملان مساعد العملة أيضًا. لا اختبار أسعار حية أو تحويل صرف.

### R1-11 [P2] قائمة المقاسات تخالف دلالات listbox ولديها تباين ضعيف
- Where: app/components/home/SizeFinder.tsx:180; app/styles/04-components/tire-components.scss:264
- What happens: عند فتح قائمة العرض على 375px، axe أبلغ aria-required-children بدرجة critical: أبناء listbox أزرار بلا role=option. وأبلغ color-contrast بدرجة serious لعناوين/عدادات المجموعات داخل القائمة. التنقل لا يقدم نمط combobox كاملًا بالأسهم والخيار النشط.
- Fix idea: تنفيذ نمط combobox/listbox صحيح مع option والتنقل والإعلان عن الخيار النشط، أو تغيير الدلالات إلى قائمة أزرار صحيحة، وتحسين تباين النصوص المستهدفة.
- Status: ✅ fixed (commit 4bacc77)
- Re-check (Round 2): ✔ confirmed — axe للقائمة المفتوحة لم يُرجع مخالفات؛ اختيار اقتراح بالأسهم وEnter نجح بالقيمة 205.

### R1-12 [P2] تكرار الباحث يكرر معرفات الحقول والقوائم
- Where: app/components/home/SizeFinder.tsx:149
- What happens: كل نسخة تنتج tc-in-w وtc-sel-w وtc-list-w ونظائرها دون معرف نسخة؛ تركيب نسختين يجعل htmlFor وaria-controls وaria-labelledby تشير إلى معرفات غير فريدة وقد تستهدف النسخة الأولى.
- Fix idea: توليد بادئة ثابتة لكل نسخة باستخدام useId وربط جميع معرفات الباحث بها، مع سياسة واضحة لمرساة #size.
- Status: ✅ fixed (commit 4bacc77) — the page anchor #size is kept on purpose (hero button target)
- Re-check (Round 2): ✔ confirmed — نسختا الباحث أعطتا ستة معرفات تحكم فريدة مرتبطة بـ useId؛ مرساة #size ما زالت كما أوضح Claude، وليست ضمن ادعاء تفرد معرفات التحكم.

### R1-13 [P2] فيديو YouTube يتجاهل تقليل الحركة ولا يوفر إيقافًا
- Where: app/components/home/TireHero.tsx:178; app/components/home/TireHero.tsx:258
- What happens: عند prefers-reduced-motion يظل رابط YouTube يحتوي autoplay=1 وcontrols=0؛ خلاف فيديو MP4 الذي يحترم reduced. زر إيقاف السلايدر يوقف انتقال الشرائح ولا يوقف الفيديو، ولا يظهر أصلًا لشريحة واحدة.
- Fix idea: ضبط autoplay/controls وفق التفضيل وتوفير إيقاف فعلي للفيديو، بما في ذلك الشريحة المفردة.
- Status: ✅ fixed (commit ea16506)
- Re-check (Round 2): ↩ reopened — YouTube أصبح autoplay=0 وcontrols=1 مع reduced، لكن effect الخاص بـ MP4 يستدعي play دون احترام التفضيل أو pause عند تغيره؛ ثبت سجل الاستدعاءات. راجع R2-6.

### R1-14 [P2] المكونان الأول والثاني يفتقدان الإعدادات المشتركة
- Where: app/components/home/TireHero.tsx:340; app/components/home/SizeFinder.tsx:207
- What happens: تعريفات home.tire-hero وhome.size-finder لا تقدم show_mobile/show_desktop/space_top/space_bottom ولا تطبق Section؛ التاجر لا يستطيع ضبطها كما في #3–#14. مواصفات components-spec.md تفرض الخيارات المشتركة لكل مكون.
- Fix idea: إضافة الحقول وتطبيقها دون تغيير الوضع الافتراضي المعتمد أو كسر تداخل الباحث مع الهيرو.
- Status: ✅ fixed (commit f49a2e0)
- Re-check (Round 2): ✔ confirmed — حقول show_mobile/show_desktop/space_top/space_bottom موجودة للمكونين، وكلاهما يطبق Section scoped=false؛ التدقيق البنيوي والبناء ناجحان.

### R1-15 [P2] التاجر لا يستطيع اختيار ماركات الفلاتر
- Where: app/components/home/TireSlider.tsx:36; app/components/home/TireGrid.tsx:42
- What happens: الفلاتر تُشتق من أول المنتجات المحملة وتُقص إلى ست ماركات؛ لا توجد قائمة اختيار خاصة بماركات الفلاتر. هذا يفقد حقل «إظهار + قائمة ماركات» المطلوب في components-spec.md:82 و137، حتى مع وجود اختيار مصدر منتجات منفصل.
- Fix idea: إضافة اختيار ماركات الفلاتر من سلة واحترام ترتيبها واختيار التاجر.
- Status: ✅ fixed (commit 35e9fec)
- Re-check (Round 2): ✔ confirmed — filter_brands أُضيف إلى التعريفين والمولد، ويُقرأ عبر filterBrands ويحفظ ترتيب المعرفات المختارة المطابقة للمنتجات.

### R1-16 [P2] إعداد المسافة يغير الحشو الداخلي بدل الفاصل
- Where: app/styles/04-components/tire-components.scss:308
- What happens: شريط المزايا العادي بقي margin-top=40px وpadding-top=0؛ اختيار small بقي margin-top=40px وأضاف padding-top=32px داخل الشريط في تجربة المتصفح. أي إن «صغير» يكبر الشريط. قاعدة التصميم final.html:654–655 تفصل margin-top=40 عن حشو خلايا الشريط.
- Fix idea: تطبيق مسافة إعداد التاجر على الغلاف الخارجي وإزالة/تعويض هامش القسم فقط عند تخصيصه، مع إبقاء normal مطابقًا للتصميم.
- Status: ✅ fixed (commit f49a2e0)
- Re-check (Round 2): ✔ confirmed — شريط المزايا مع small أصبح margin-top=16px وpadding-top=0، مقارنة بالهامش العادي 40px؛ لم يعد يكبر الحشو الداخلي.

### R1-17 [P2] أجزاء من الوضع الإنجليزي تبقى عربية
- Where: app/components/home/tc/cars.ts:8; app/components/home/ShopByCar.tsx:62; app/components/home/Ticker.tsx:40; app/components/home/TireHero.tsx:386
- What happens: قائمة السيارات الجاهزة تدخل كمصنع/طراز عربيين دون نسخ إنجليزية، حتى عند locale=en. عنوان nav الافتراضي «أقسام المتجر» غير موجود في قاموس Ticker الإنجليزي، وaria-label لرسم المقاس ثابت بالعربية.
- Fix idea: توفير قيم جاهزة ثنائية اللغة وترجمة جميع النصوص النظامية والبدائل وتسميات الوصول وفق لغة الواجهة.
- Status: ✅ fixed (commit 35e9fec)
- Re-check (Round 2): ✔ confirmed — واجهة السيارات الإنجليزية عرضت المصنعين مترجمين، وتدقيق قائمة المصنعين/الطرازات الجاهزة لم يجد اسمًا عربيًا بلا قاموس؛ عنوان Ticker وaria-label الهيرو مترجمان. R2-10 يخص الأقسام الجديدة.

### R1-18 [P2] فشل تحميل المنتجات يخفي القسم دون حالة خطأ
- Where: app/components/home/tc/products.ts:77; app/components/home/TireSlider.tsx:34; app/components/home/TireGrid.tsx:39
- What happens: useTcProducts لا يعرض error للمستهلك؛ عند رفض الاستعلام items=[]، فيعود القسم null كما لو لم يضفه التاجر، ولا توجد رسالة أو إعادة محاولة. المعاينة التي تستخدم عينات DEV لا تكشف هذا السلوك الإنتاجي.
- Fix idea: فصل التحميل والخطأ والفراغ، وتقديم إعادة محاولة مناسبة؛ يمكن إخفاء الفراغ الحقيقي وفق سياسة معلنة للمكون.
- Status: ✅ fixed (commit 35e9fec)
- Re-check (Round 2): ✔ confirmed — رفض استعلام TireGrid في وضع إنتاج المسبار أظهر رسالة وإعادة محاولة؛ TireSlider يستخدم نمط loading/failed/retry نفسه. Lineup الجديد لا يطبقه: R2-16.

### R1-19 [P3] عناصر المقاس تعلن نفسها أزرارًا دون تفعيل لوحة المفاتيح
- Where: app/components/home/TireHero.tsx:398
- What happens: tspan يحمل role=button وtabIndex=0 وonClick دون معالجة Enter/Space. التركيز يبدل الشرح بالفعل، لكنه لا يحقق سلوك زر معلن لمستخدم لوحة المفاتيح.
- Fix idea: استخدام أزرار HTML مرتبطة بالرسم أو تنفيذ التفعيل بلوحة المفاتيح ودلالات متوافقة مع وظيفة التركيز.
- Status: ✅ fixed (commit ea16506)
- Re-check (Round 2): ✔ confirmed — onKeyDown لعناصر المقاس يتعامل الآن مع Enter وSpace والأسهم، وتوجد preventDefault للتفعيل.

**ملاحظة مثبتة إضافية ضمن إصلاح R1-4:** `app/components/home/tc/products.ts:58` يستعمل regex منفصلًا لحذف المقاس من الاسم؛ `Truck 315/80 R22.5` أصبح `Truck.5` في التجربة. استخدم نطاق المطابقة من المحلل الموحد لحذف المقاس كاملًا.

**حدود المراجعة والاستكمال داخل سلة:** لم تُختبر أغطية المكونات داخل محرر الشركاء أو حل روابط الاختيار هناك، ولا add-to-cart/wishlist بحساب حي، ولا صفحة /help عبر API. لم تُسجل هذه احتمالات كأعطال مثبتة. المطلوب قبل النشر قياس Lighthouse على الرئيسية/المنتج/التصنيف بالجوال وسطح المكتب (المراجعة الرسمية تطلب متوسط وصول ≥90 وأداء ≥60: https://docs.salla.dev/twilight-engine/technical-review)، واختبار الإنجليزية والتخصيص في محرر سلة. نجاح البناء وحده لا يثبت أهلية القبول. حركة الشريط عند reduced-motion توقفت في التجربة؛ فيديوهات الشرائح غير النشطة لا تُركّب؛ لم تُسجل مخالفة لهذين السلوكين.

## Round 2 — 2026-10-06

**النطاق والنسخة:** مكونات #15–#23، وإعادة تدقيق إصلاحات الجولة الأولى والمساعدات والبحث والأنماط المشتركة. HEAD أثناء الفحص: `d4f6035`، والمحرك المثبت `@salla.sa/twilight-theme-engine@1.0.70`. كانت هناك تغييرات سابقة في package/lock/config وأصول الصور؛ تُركت كما هي. لا تعديل للمصادر أو commit/push أو بيانات دخول أو طلبات شراء. أُنشئت ملفات فحص ونتائج داخل `output/playwright/` ومخرجات البناء المعتادة فقط.

**الحصيلة:** 18 ملاحظة مفتوحة: **5 P1، و12 P2، و1 P3**. ضمنها إعادة فتح جزئية لـ R1-13؛ باقي الإصلاحات الـ17 المؤشرة fixed تأكدت ضمن الحالات المبينة تحت كل نتيجة. ملاحظة R1-6 القديمة غير صحيحة للحالة العربية: اعتُمد اعتراض Claude وسُحبت، مع وجود حالة إنجليزية مختلفة مثبتة أدناه.

**الفحوصات المنفذة:**

| الفحص | النتيجة |
|---|---|
| `pnpm.cmd typecheck` | exit 0 |
| `pnpm.cmd build` | exit 0؛ client + server؛ تحذيرات توقيت plugins غير مانعة |
| `pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes` | exit 0؛ 8 ملفات / 66 اختبارًا ناجحًا |
| `pnpm.cmd exec playwright test` | exit 0؛ 16/16؛ نموذج الهيرو المعزول على Chromium مكتبي ومحاكاة جوال |
| `pnpm.cmd test:salla:lighthouse` | exit 0؛ نموذج الهيرو المحلي: أداء 55، وصول 96 بالعربي والإنجليزي؛ SEO 83؛ ليس قياس متجر الإنتاج |
| تدقيق JSON بالمهارة | 29 تعريف مكون، دون أخطاء بنيوية من السكربت؛ `schema_validated=false` |
| مسبار المكونات | Chromium، 375×812 و1440×900، RTL/LTR، بيانات بديلة وحظر الطلبات الخارجية؛ بلا pageerror |

نجاح Vitest/Playwright لا يغطي الحجز والنشرة والكاش بكل الحالات أدناه. نتائج التفاعل: `output/playwright/round2-probe.json`؛ مسبار كاش البحث: `output/playwright/round2-cache-probe.json`. مسبار الفيديو سجل استدعاءات play/pause، ولم يشغّل ملفًا خارجيًا فعليًا. لا يدّعي الفحص نجاح سلة أو مفضلة حية؛ أُثبتت الكمية ومعالجة النجاح/الرفض ببديل SDK فقط.

**تعريف الحقول والمولدات:** قرئت تعريفات home.* والمستهلكات، ومنها المفاتيح العادية و`prefix.key` والقوائم والروابط والصور والكائنات ثنائية اللغة. حقول #15–#23 لها مستهلكات مباشرة أو عبر Section/sourceFrom؛ لم يثبت حقل إعداد مهمل. UUID والمعرفات والشروط اجتازت الفحص البنيوي، وأسماء المكونات ar/en موجودة. لم تُعتبر الأوصاف الثابتة حقول عرض. أعيد تشغيل منطق مولد CSS في الذاكرة مع اعتراض الكتابة: الناتج مطابق بعد توحيد نهايات الأسطر. وأعيد توليد إعدادات `tc-components.cjs` في الذاكرة: مطابقة للإعدادات الحالية بعد تجاهل مفاتيح الخيارات العشوائية. لا تعديل للناتج المولد.

**التصميم والاستجابة:** القياسات المحسوبة المختبرة طابقت المصدر عند 1440px: شبكة الخطوات وفراغ 16px (`final.html:822`)، شبكة الحجز 1.05fr/.95fr وهامش 100px (`:542`)، والنشرة 1fr/1.1fr وفراغ 40px وحشو 56/60px (`:924`). الأحجام والخطوط والخلفيات والزوايا المختبرة متطابقة. لم يظهر تجاوز أفقي عند 375px للأقسام التسعة، ولا مع 12 مركزًا/رأيًا/سؤالًا و4 خطوات. الخطوط الخارجية حُظرت، فهذه مقارنة قياسات بالقواعد وبدائل الخطوط؛ ليست شهادة مطابقة صور بنسبة 100% أو تجربة هاتف فعلي. التباين المنخفض أدناه موجود في التصميم نفسه، وليس عيبًا استُنتج من اختلاف CSS المولد.

### R2-1 [P1] النشرة تؤكد الاشتراك دون تحقق من استلامه
- Where: app/components/home/Newsletter.tsx:43
- What happens: بعد window.open أو فتح mailto تُضبط done=true وتظهر «شكراً، وصلنا اشتراكك ✓» دون رد خدمة. في المسبار أعاد window.open قيمة null لمحاكاة نافذة لم تُفتح، ومع ذلك ظهرت رسالة النجاح؛ فتح برنامج البريد لا يثبت إرسال الرسالة أيضًا. يخالف وعد التسليم «no fake sign-up» وربط الاشتراك الفعلي في المواصفة #23.
- Fix idea: وصف الانتقال/فتح نموذج التسجيل بصدق، وعدم إعلان نجاح الاشتراك إلا بعد تأكيد من خدمة تدعم ذلك؛ معالجة منع النافذة وإتاحة المحاولة مجددًا.
- Status: ✅ fixed (76a5630) — signupUrl() uses URL/searchParams, keeps #hash after the query; {email} template kept; tests added

### R2-2 [P1] رابط التسجيل ذو المرساة يفقد البريد كمعامل طلب
- Where: app/components/home/Newsletter.tsx:38
- What happens: `https://example.com/signup#form` أصبح `https://example.com/signup#form?email=qa%40example.com`. البريد داخل fragment؛ لا يصل كمعامل query إلى خدمة التسجيل التي تتوقع email، رغم إدخاله بالنموذج.
- Fix idea: بناء الرابط بـ URL وsearchParams مع حفظ المرساة، ودعم قالب {email} بشكل صريح واختباره مع الروابط ذات query/hash.
- Status: ✅ fixed (76a5630) — link mode adds date=YYYY-MM-DD and time=HH:MM to the booking link

### R2-3 [P1] وضع رابط الحجز لا ينقل اليوم والساعة المختارين
- Where: app/components/home/InstallBooking.tsx:50
- What happens: اختيار «بكرة، 22:00» مع booking_mode=link وbook_link=/booking يبقي href=/booking دون تاريخ/وقت؛ النص يوحي بأن الموعد اختير لكن الوجهة لا تستلمه. لا يوجد مسار حفظ الاختيار بملاحظة الطلب المطلوب في components-spec.md، #16؛ واتساب وحده ينقل نص الموعد.
- Fix idea: تعريف عقد تمرير تاريخ/وقت لرابط تطبيق الحجز، أو إخفاء اختيار المواعيد عندما الوجهة لا تستقبله؛ توثيق مسار الطلب عند الحاجة دون اختراع حجز مؤكد.
- Status: ✅ fixed (76a5630) — slots show ص/م (AM/PM); WhatsApp text has date + 24h time

### R2-4 [P1] ساعة الحجز تفقد الفرق بين الصباح والمساء
- Where: app/components/home/InstallBooking.tsx:26; app/components/home/InstallBooking.tsx:49
- What happens: صفان صحيحان 10:00 و22:00 عُرضا كلاهما «10:00». اختيار الثاني أنتج رسالة واتساب «بكرة · 10:00» دون PM أو تاريخ، فلا يستطيع المركز التمييز بين الموعدين. تغيير أسماء الأيام لا يضيف تاريخًا فعليًا.
- Fix idea: نقل تاريخ صريح ووقت 24 ساعة إلى الوجهة، وعرض AM/PM أو صيغة واضحة عند وجود ساعات ملتبسة، مع مراعاة اللغة.
- Status: ✅ fixed (76a5630) — cache keyed by list+sort+filters and the keep function; cached items re-filtered by current keep

### R2-5 [P1] كاش البحث بالمقاس يعيد منتجات لا تطابق معايير البحث الجديدة
- Where: app/components/product/ProductListPage.tsx:499; app/components/product/ProductListPage.tsx:511
- What happens: searchKey يعتمد على عبارة البحث والترتيب فقط. إذا وجد القسم منتجات في صفحة لاحقة ثم تغير m من tags إلى name، أو تغير فلتر الكتالوج، وبقيت الصفحة الأولى دون تطابق مع next، يطابق found المفتاح القديم ويُستخدم found.items دون تطبيق keep الجديد. تنفيذ مقطع الاختيار الأصلي بمسبار حالة أعاد المنتج id=91 الذي يرفضه keep، مع loaderCalls=0. هذا تحقق لمنطق الكاش، وليس طلب API حيًا.
- Fix idea: تضمين مصادر المطابقة والفلاتر في هوية البحث، وإبطال النتائج عند تغير المعايير، وتصفية البيانات المخزنة وفق keep الحالي.
- Status: ✅ fixed (76a5630) — MP4 effect pauses when reduced motion is on and re-runs when it changes

### R2-6 [P2] التشغيل الإجباري لـ MP4 يتجاوز تقليل الحركة — إعادة فتح R1-13
- Where: app/components/home/TireHero.tsx:128
- What happens: effect يشغّل video.play() عندما stopped=false، دون فحص reduced ودون إعادة التنفيذ عند تغيره. مع prefers-reduced-motion=reduce سجل المسبار استدعاء play، ولم يسجل pause رغم أن autoPlay أصبح false وcontrols ظهر. إصلاح YouTube صحيح، لكن التنفيذ الإجباري يناقض إعداد MP4.
- Fix idea: توحيد قرار تشغيل الوسائط بناء على reduced/stopped والشريحة النشطة، وعدم فرض التشغيل قبل معرفة التفضيل، وإيقاف الوسيط عند تغيره.
- Status: ✅ fixed (76a5630) — now taken in Asia/Riyadh, refreshed every minute and on tab return; a past chosen time is cleared

### R2-7 [P2] تعطيل المواعيد مبني على ساعة قديمة ومنطقة الزبون
- Where: app/components/home/InstallBooking.tsx:42
- What happens: nowMin يُحسب مرة واحدة من getHours/getMinutes المحليين. عند تقديم ساعة المسبار من 15:00 إلى 22:30 ظل موعد اليوم 22:00 بقيمة disabled=false، أي قابلًا للاختيار بعد مرور الموعد. عند وجود الزبون بمنطقة مختلفة عن المركز يستخدم الحكم ساعة الزبون، دون منطقة زمنية للمتجر.
- Fix idea: حساب الوقت والتاريخ بمنطقة المركز/المتجر، وتحديثهما عند مرور الوقت والعودة للتبويب، وإبطال الاختيار الذي أصبح ماضيًا.
- Status: ✅ fixed (76a5630) — normTime() accepts 00–23:00–59 only, dedupes and sorts

### R2-8 [P2] حقل الساعة يقبل قيمًا غير صالحة
- Where: app/components/home/InstallBooking.tsx:33
- What happens: 25:99 يمر من regex الحالي ومن حقل نص بطول 5، ثم يُعرض «2:39» ويمكن اختياره. التحقق يفحص شكل الأرقام فقط ولا حدود الساعة والدقيقة.
- Fix idea: قبول HH:mm ضمن 00–23 و00–59 فقط، وإزالة التكرار، مع إرشاد واضح وعدم إنتاج موعد ملفّق من الإدخال الخاطئ.
- Status: ✅ fixed (76a5630) — phone/WhatsApp defaults empty (example → placeholder); numbers validated before tel:/wa.me

### R2-9 [P2] قيم الهاتف المثال تتحول إلى أزرار اتصال فعلية خاطئة
- Where: app/components/home/CallStrip.tsx:19; app/components/home/InstallBooking.tsx:47; scripts/tc/17-call-strip.cjs:11; scripts/tc/16-install-booking.cjs:19
- What happens: بيانات twilight.json الافتراضية phone=05xxxxxxxx وwhatsapp=9665xxxxxxxx تحولت في المسبار إلى tel:05 وwa.me/9665. تنظيف الحروف يجعل المثال يبدو رقمًا متصلًا بدل إبقاء العنصر غير مهيأ. المشكلة في السلوك والتحقق، لا في محتوى مثال التاجر.
- Fix idea: افتراضيات اتصال فارغة والتحقق من رقم فعلي بالشكل المطلوب قبل إظهار زر الاتصال/الحجز؛ عدم تحويل placeholder إلى مستلم.
- Status: ✅ fixed (76a5630) — English for all default FAQ items and reviews

### R2-10 [P2] الأسئلة والآراء الافتراضية لا تملك عرضًا إنجليزيًا
- Where: app/components/home/Faq.tsx:26; app/components/home/Reviews.tsx:34; scripts/tc/22-faq.cjs:16; scripts/tc/20-reviews.cjs:16
- What happens: مع locale=en تُترجم العناوين، لكن أسئلة/أجوبة FAQ والآراء الافتراضية تظل عربية. قوائم DEFAULTS لا تمر بترجمة كاملة، وقيم المجموعات في JSON عربية فقط وقواميس EN لا تحتوي نصوصها. المسبار سجل الواجهة المختلطة؛ لا يُطلب ترجمة محتوى التاجر الحر آليًا.
- Fix idea: توفير defaults ثنائية اللغة للمجموعات والبدائل المدمجة، والتحقق من الإنجليزية ببيانات الإعداد الافتراضي الفعلية.
- Status: ✅ fixed (76a5630) — English images first, then each size stands in for the other

### R2-11 [P2] صورة الجوال الإنجليزية وحدها لا تحفظ الشريحة
- Where: app/components/home/TireHero.tsx:88; app/components/home/TireHero.tsx:105
- What happens: مع locale=en وen_images=true وmobile_image_en فقط، يحصل mob على الصورة لكن desk يبقى فارغًا، فتُحذف الشريحة. المسبار سجل صفر صور؛ في المقابل mobile_image العربية وحدها سجلت صورة واحدة. هذه حالة مختلفة عن R1-6 المسحوبة، وجميع حقول الصورة اختيارية في JSON.
- Fix idea: اختيار مصادر الصور المحلية أولًا، ثم تعويض كل من desktop/mobile بالآخر قبل الفلترة.
- Status: ✅ fixed (76a5630) — makeT returns empty when the current language key is empty; test added

### R2-12 [P2] مسح النص بلغة واحدة يعيد النص الافتراضي
- Where: app/components/home/fields.ts:78; app/components/home/fields.ts:86
- What happens: makeT('en', …) لقيمة {ar:'محتوى', en:''} أعاد «Default» بدل فراغ اللغة المختارة. isCleared يتطلب فراغ كل اللغات؛ حذف النص الإنجليزي وحده لا يُحترم. حالة '' وحالة حذف كل اللغات من R1-9 سليمتان.
- Fix idea: التفريق بين مفتاح لغة غائب ومفتاح موجود فارغ عمدًا، واحترام المسح في اللغة الحالية دون اشتراط مسح اللغة الأخرى.
- Status: ✅ fixed (76a5630) — PARTLY: numbers aria-hidden; review product line #5f6469. FAQ gold line deepened to #b07800 (3.4:1, large text) — owner chose

### R2-13 [P2] تباين ضعيف في نصوص أقسام الحجز والخطوات والآراء والأسئلة
- Where: app/components/home/InstallBooking.tsx:87; app/components/home/Steps.tsx:46; app/components/home/Reviews.tsx:57; app/components/home/Faq.tsx:43; scripts/build-tc-sections-css.cjs:14
- What happens: axe على 375px أبلغ color-contrast بدرجة serious لأرقام خطوات الحجز، أرقام الخطوات الكبيرة، بعض أسطر المنتج بالآراء، السطر الذهبي بعنوان FAQ وأرقام الأسئلة. قواعد التصميم المقارنة هي final.html:555،826،834،838،844. نسخ التصميم بأمانة لا يجعل النصوص اجتيازًا تلقائيًا للوصول.
- Fix idea: اعتماد معالجة وصول محدودة بالقواعد اليدوية؛ الأرقام الزخرفية يمكن إخفاؤها عن قارئ الشاشة إذا كانت مكررة فعلًا، أما النصوص ذات المعنى فتحتاج تباينًا مناسبًا. لا تعدّل الملف المولد يدويًا.
- Status: ✅ fixed (76a5630) — useId per instance

### R2-14 [P2] تكرار النشرة يكرر معرف حقل البريد
- Where: app/components/home/Newsletter.tsx:57
- What happens: نسختان من المكون أعطتا input id=tc-nl مرتين، وكلا label يشير إليه؛ تسمية النسخة الثانية قد ترتبط بالأولى. المسبار سجل [tc-nl, tc-nl].
- Fix idea: استخدام useId لكل نسخة وربط label والحقل بالمعرف نفسه.
- Status: ✅ fixed (76a5630) — JSON defaults include the two centre images (jsDelivr tires-store-assets/images)

### R2-15 [P2] إعداد مراكز التركيب الافتراضي يختلف بصريًا عن المعاينة
- Where: app/components/home/InstallCenters.tsx:29; scripts/tc/15-install-centers.cjs:23
- What happens: data={} يستعمل DEFAULTS بصور المركزين، لكن قيمة centers الافتراضية التي يرسلها JSON لا تتضمن centers.image؛ لأن وجود المصفوفة يمنع DEFAULTS، ظهر صفر img عند تمرير قيم JSON الفعلية. التصميم final.html:1182–1183 والمعاينة يحتويان صورتين، فيختلف ارتفاع وبناء الكروت في الإعداد الافتراضي الحقيقي.
- Fix idea: توحيد قيم الصور الافتراضية بين JSON والمعاينة من الأصول المعتمدة، أو معالجة حالة الصورة الناقصة بمساحة متسقة متفق عليها؛ إبقاء حذف التاجر المتعمد محترمًا.
- Status: ✅ fixed (76a5630) — Lineup shows could-not-load + retry like TireGrid

### R2-16 [P2] قسم التشكيلة الجديد يعيد إخفاء خطأ تحميل المنتجات
- Where: app/components/home/Lineup.tsx:25
- What happens: useTcProducts يعيد failed/retry، لكن Lineup يأخذ items/loading فقط؛ رفض الاستعلام في وضع إنتاج المسبار أعطى محتوى فارغًا دون خطأ/إعادة محاولة. نفس السيناريو في TireGrid أظهر رسالة وإعادة محاولة، مما يؤكد إصلاح R1-18 هناك فقط.
- Fix idea: إعادة استخدام معالجة التحميل والفشل في أقسام المنتجات الحالية، مع التمييز بين فشل الطلب وفراغ المصدر المشروع.
- Status: ✅ fixed (76a5630) — button group with aria-pressed instead of tab roles

### R2-17 [P3] أزرار الأيام معلنة كتبوِيبات دون سلوك لوحة مفاتيح التبويبات
- Where: app/components/home/InstallBooking.tsx:68
- What happens: role=tab/role=tablist موجودان، لكن جميع الأزرار في مسار Tab العادي ولا يوجد تنقل بالأسهم أو ربط tabpanel. ضغط ArrowRight على زر اليوم لم يغير التركيز أو الاختيار في المسبار. Tab وSpace يتيحان استخدام الأزرار، لذلك الخطورة منخفضة.
- Fix idea: استكمال نمط التبويبات، أو استخدام أزرار اختيار بـ aria-pressed إذا كانت الوظيفة مجموعة اختيارات فقط.
- Status: ✅ fixed (76a5630) — re-encoded with sharp to real WebP (104 KB / 42 KB), signature checked after build

### R2-18 [P2] صور JPEG ضخمة بامتداد WebP تدخل حزمة البناء
- Where: app/styles/04-components/tires-madar.scss:53; app/styles/04-components/tires-madar.scss:307
- What happens: madar-hero.webp حجمه 14,558,708 بايت وmadar-hero-m.webp حجمه 13,662,378 بايت؛ التوقيع يبدأ FFD8 أي JPEG وليس RIFF/WEBP. الملفان نُسخا بالحجم نفسه إلى dist/client/assets/images/home رغم استبعاد TcPreview. بقاؤهما يضخم الحزمة، واستخدام قواعد البنر القديمة يحمّل صورة ضخمة. كانا موجودين/متغيرين قبل هذه المراجعة، فلا تُنسب التغييرات للفحص.
- Fix idea: تحويلهما فعليًا بأداة الصور وبمقاسات الويب المعتمدة أو إزالة الأصول غير المستخدمة من حزمة الإصدار، والتحقق من البايتات والتوقيع بعد البناء؛ لا تغيير للتصميم.
- Status: open

**الجاهزية:** غير جاهز ضمن النطاق بسبب المشاكل الوظيفية المثبتة أعلاه. لا يُستنتج رفض رسمي أو نجاح رسمي من فحص محلي. [المراجعة التقنية الرسمية لسلة](https://docs.salla.dev/twilight-engine/technical-review)، جرى التحقق منها بتاريخ الجولة، تطلب متوسط Lighthouse للأداء ≥60 والوصول ≥90 على الرئيسية والمنتج والتصنيف بالمكتبي والجوال. نتيجتا النموذج المحلي ليستا هذا المتوسط، ولا درجة المتجر النهائي. [دليل twilight.json](https://docs.salla.dev/twilight-engine/twilight-json) وأمثلة Raed لا يمثلان مخطط قبول React كاملًا.

**باقي التحقق داخل سلة:** حفظ/إعادة فتح حقول المجموعات والشروط والألوان والروابط والأغلفة بالمحرر؛ بيانات منتجات وخيارات ومفضلة حقيقية في متجر تجريبي؛ hydration وتبديل اللغة؛ قياس صفحات المتجر المطلوبة بعد بناء إنتاجي؛ Safari/Firefox وهاتف فعلي؛ إثبات ترخيص إعادة توزيع الصور. لم تُختبر هذه بسلة الحية ولم تُسجل احتمالات فشلها كملاحظات مؤكدة. تأكد محليًا غياب TcPreview وtc-preview وtc-samples من ملفات JavaScript العميل والخادم، واستقلال المعرفات المصلحة للباحث، وعدم تسرب محددات CSS العامة من مولد الأقسام.


## Settings review — round 3

التاريخ: 2026-10-06. مراجعة إعدادات التاجر العامة والمكونات ومستهلكيها في Twilight React. المصدر: `CLAUDE.md`، مهارة المشروع `salla-tires-theme` ومهارة `salla-twilight-review`، `twilight.json`، مولدات الإعدادات والمكونات، وكود الواجهة والأنماط والمحرك المثبت. الملف المرفق استُخدم كقائمة محاور للفحص؛ المرجع الفعلي لكل نتيجة هو الكود. لم أعدّل مصدرًا أو أشغّل شبكة/سيرفر، ولم أُنفّذ شراء أو حفظ إعدادات متجر.

**النتيجة: 4 P1، و16 P2، و2 P3.** كل ملاحظة أدناه مؤكدة بالقراءة أو بمسبار محلي، إلا ما وُسم بأنه يحتاج تحقق. هذه الجولة مستقلة عن إعادة فحص R1/R2؛ ليست شهادة اجتياز Lighthouse أو المحرر الحقيقي. لم يُطلب typecheck/build في هذه الجولة؛ لم أشغلهما. الاختبارات المحلية المعزولة تحققت من دالة darkScript ومن hook إعدادات البطاقة ومن تنظيف رقم واتساب؛ لا تثبت payload سلة الحي.

**حصر الاستخدام:** 108 إعدادات إدخال عامة: 96 مخصصة `tc_*` + 12 موروثة. المرجع الكامل للـIDs ومواقع ذكرها محفوظ في `C:/Users/m52oo/Documents/Codex/2026-10-05/you-are-reviewing-a-salla-e/output/settings-round3-inventory.json`؛ الذكر النصي خطوة أولى، ثم تتبعت الاستدعاء واستخدام CSS لتحديد التأثير الحقيقي. جميع معرفات الشروط الحالية تشير إلى حقول موجودة؛ هذا لا يثبت سلامة سلسلة الإظهار ولا قبولها بالمحرر.

### أهم 10 حسب الأثر

1. وحدة البيع «طقم» لا تصل لحساب المقارنة أو تسمية سعر السلايدر وكمية الإضافة.
2. إخفاء السعر/المفضلة/الإضافة لا يعمل في التصنيف والبحث رغم وعد «بكل المتجر».
3. زر المقاس الافتراضي في الهيدر والشريط السفلي يشير لقسم غير موجود.
4. أرقام واتساب تُعالج بثلاث طرق؛ الرقم المخصص لا يصل للبطاقات/الشريط السفلي.
5. `tc_warranty` لا يُقرأ إطلاقًا.
6. إعدادات الأعمدة الثلاثة لا يستخدمها أي grid فعلي.
7. مصدر المقاس/سنة الصنع لا يصل لبطاقات الإطارات.
8. «مطفأ — فاتح دائمًا» يسمح بالتبديل وباختيار داكن محفوظ.
9. الهوية لا تصل لبنر الإطار، والخلفية لا تطبق على الصفحة كلها.
10. شروط الإظهار تتجاهل القوالب الجاهزة وسلاسل تعطيل بعض العناصر.

### S3-1 [P1] وحدة البيع والكمية لا تطبقان بصورة موحدة
- Where: scripts/tc-settings.cjs:80–82; app/components/tires/features/cardSettings.ts:17–29; app/components/tires/features/Compare.tsx:114–119; app/components/home/TireSlider.tsx:29–30 و:123; app/components/home/Lineup.tsx:80.
- What: IDs `tc_sale_unit`, `tc_default_qty`, `tc_set_price`, ومكوّن `home.tire-slider → add_qty`. اختيار `tc_sale_unit=set` يعطل setPrice في hook، لكن المقارنة تسمي السعر «سعر الحبة» وتضربه ×4، والسلايدر يكتب «للإطار الواحد». المسبار المحلي أعاد `qty=4` رغم البيع بالطقم، فتضيف الشبكة 4 وحدات طقم إن اختيرت هذه الكمية. السلايدر يستعمل add_qty المحلي ويفوت الإعداد العام دون بيان الأولوية. مثال طقم سعره 1200 → المقارنة تعرض 4800 للطقم.
- Fix idea: وحدة بيع واحدة تصل لكل عرض سعر وإضافة ومقارنة؛ الطقم يضاف بوحدات طقم واضحة، ولا يضرب سعره ×4. وضّح أن الكمية المحلية override أو وفر «استخدام إعداد المتجر».
- Status: ✅ fixed — `perSet` in useCardSettings: no «×4»/installments, qty forced to 1 (grid, slider), compare shows the set price as is, slider says «للطقم».

### S3-2 [P1] إعدادات بطاقة «بكل المتجر» لا تعمل في التصنيف والبحث
- Where: scripts/tc-settings.cjs:136–144; app/components/product/ProductListPage.tsx:356; app/components/product/ProductCard.tsx:70–72; app/components/home/Lineup.tsx:32.
- What: IDs `tc_card_price`, `tc_card_add`, `tc_card_fav`, `tc_card_brand`, `tc_card_rim`, `tc_year_badge`, `tc_install_badge`, `tc_set_price`, `tc_installments`, `tc_default_qty`, `tc_compare`. useCardSettings يستدعى فقط في TireGrid/TireSlider؛ صفحات القوائم تستخدم EngineProductCard مع قلب portal دائم، ولا تقرأ إعدادات tc. اختيار «اطلب السعر» أو إطفاء الإضافة لا يمنع عرض الأسعار/زر الإضافة في التصنيف والبحث. Lineup أيضًا يعرض السعر دون إعدادات البطاقة. المقارنة لا تتاح من بطاقات القوائم.
- Fix idea: توحيد adapter إعدادات البطاقة بين كل الأنواع الفعلية، مع تطبيق إخفاء السعر والإضافة والقلب على مصدر العرض نفسه، لا بتمويه CSS فقط. إن كان خيار خاصًا ببطاقات الرئيسية فليُسمّ بهذا النطاق، لكن إخفاء السعر يحتاج سياسة متجر متسقة.
- Status: ✅ fixed — listing ProductCard reads useCardSettings: hides add button, wishlist, and replaces the price by «اطلب السعر» (WhatsApp) on category/search pages.

### S3-3 [P1] رابط المقاس الافتراضي يذهب إلى anchor غير موجود
- Where: app/components/layout/TcHeader.tsx:132; app/components/layout/MobileBottomBar.tsx:429; app/components/home/SizeFinder.tsx:232.
- What: IDs `tc_header_cta_link`, `tc_header_cta`, `tc_bottombar_items=size`. fallback هو `/#finder`؛ قسم المكوّن الحقيقي `id="size"`. الزبون يعود للرئيسية دون الوصول للأداة. كذلك حذف التاجر أداة المقاس يترك الزرين فعالين دون بديل.
- Fix idea: وجهة موحدة `/#size` عند وجود المكوّن؛ بديل واضح/اختيار وجهة للتاجر عندما لا يُستخدم. اختبر الانتقال من منتج والتصنيف والإنجليزية.
- Status: ✅ fixed — header CTA and bottom-bar size button go to `/#size` (the finder section id).

### S3-4 [P1] وجهات واتساب تختلف والرقم المخصص لا يصل لكل المداخل
- Where: app/components/layout/MobileBottomBar.tsx:379; app/components/layout/TcExtras.tsx:33; app/components/tires/features/cardSettings.ts:18–19.
- What: IDs `tc_wa_number`, `tc_wa_message`, `tc_bottombar_items=whatsapp`, `tc_card_price=ask`. الشريط السفلي يستخدم `/D/g` بدل `/\D/g`؛ المسبار أبقى `+966 55 123 4567` كما هو في wa.me، ولا يضبط شرط طول أعلى أو صيغة أرقام فقط. Extras يقرأ رقمًا مخصصًا، بينما البطاقات والشريط يقرآن جهات اتصال المتجر فقط. المسبار بإعداد ask ورقم tc_wa_number صالح دون store.contacts أعاد askUrl=null، فيعود السعر للظهور. رسالة tc_wa_message تخص العائم فقط دون بيان ذلك.
- Fix idea: helper واحد لأرقام واتساب وأولوية الرقم المخصص/بيانات المتجر، وصيغة دولية صالحة. عند ask دون رقم صالح أظهر تنبيه إعداد للتاجر وسياسة عرض صريحة، بدل العودة الصامتة للسعر. تسمية الرسالة بحسب نطاقها.
- Status: ✅ fixed — one helper `layout/contact.ts` (`useWhatsappNumber`: tc_wa_number → store WhatsApp → mobile, 05… → 9665…, digits only) used by floating button, bottom bar and «اطلب السعر»; ask without a number keeps the price (field description says it needs a number).

### S3-5 [P2] نص الضمان إعداد بلا مستهلك
- Where: scripts/tc-settings.cjs:86; twilight.json:654.
- What: ID `tc_warranty` يُعرّف كنص ضمان بصفحة المنتج، ولا يوجد له أي قراءة في app أو المحرك المثبت. تعديله أو إفراغه لا يغيّر صفحة المنتج.
- Fix idea: عرضه في موضع واضح بصفحة المنتج مع الترجمة واحترام الفراغ، أو حذف الوعد والحقل حتى يُنفذ. بيانات ضمان كل منتج تختلف عن عبارة عامة للمتجر.
- Status: ✅ fixed — `features/Warranty.tsx` shows tc_warranty under the product details; empty = hidden; EN default.

### S3-6 [P2] إعدادات الأعمدة مقروءة لكن بدون تأثير فعلي
- Where: app/components/layout/ThemeTokens.tsx:70 و:86; app/styles/04-components/tc-theme-ui.scss:173–175; app/components/home/TireGrid.tsx:116.
- What: IDs `tc_cols_d`, `tc_cols_t`, `tc_cols_m`. القيم تولد --tc-cols-*؛ CSS يطبقها فقط على `.cgrid.tc-cols-auto`، ولا يوجد عنصر يستخدم tc-cols-auto في التطبيق. الشبكة الرئيسية تستخدم tc-cols-3/4 من `home.tire-grid → columns`، وصفحات القوائم تستخدم grid مختلفًا.
- Fix idea: ربط الأعمدة بالشبكات الفعلية وتحديد أولوية columns المحلي مقابل العام. وفر «حسب إعداد المتجر» بدل إعداد عام بلا أثر.
- Status: ✅ fixed — columns now drive the category/search grid (`tc-cols-set`, one less on desktop with the filter sidebar); labels say «أعمدة صفحات التصنيف والبحث».

### S3-7 [P2] مصدر المقاس وسنة الصنع يطبق على البحث فقط
- Where: scripts/tc-settings.cjs:83–85; app/routes/search-page.tsx:46; app/components/home/tc/products.ts:68–72; app/components/home/SizeFinder.tsx:112.
- What: ID `tc_spec_source` يوعد بقراءة المقاس وسنة الصنع من الاسم/الوسوم/الخيارات. البطاقات تستخرج المقاس والسنة من p.name فقط، فلا تظهر المقاس أو شارة سنة الصنع/مطابقة المقاس المحفوظ لمنتج بياناته بالوسوم أو الخيارات. `home.size-finder → match_by` قد يضيف m صريحًا يتجاوز الإعداد العام دون بيان.
- Fix idea: extractor موحد للمقاس والسنة وفق المصدر، مع ترتيب أولوية وتجنب تخمين سنة من رقم آخر. اجعل match_by المحلي اختيار override واضحًا. إذا بيانات السنة غير متاحة بالمصدر المعلن، صحح وصف الحقل.
- Status: ✅ fixed — `specTexts()` + `useSpecSources()`: cards read size and year from name/tags/options per tc_spec_source; year regex never matches inside a size/code.

### S3-8 [P2] إطفاء الداكن لا يجعل المتجر فاتحًا دائمًا
- Where: app/components/layout/ThemeTokens.tsx:40–47; scripts/tc-settings.cjs:66–71.
- What: IDs `tc_dark_mode`, `tc_dark_toggle`, `tc_dark_style`, `tc_dark_toggle_where`. default off مع toggle=true؛ useDarkSettings يسمح بالزر في off، والسكريبت يفضل اختيار الزائر المحفوظ. المسبار off + saved='1' أعاد data-tc-dark=1. وصف «فاتح دائمًا» مخالف للسلوك؛ mode=on يخفي زر الزائر في الكود مع بقاء حقوله ظاهرة بالمحرر.
- Fix idea: حسم المعنى: إما off يمنع الداكن/الاختيار المحفوظ، أو تسميته «فاتح افتراضيًا مع السماح للزائر». إظهار حقول الزر/الستايل فقط حين تؤثر، مع أولوية معلنة.
- Status: ✅ fixed — owner decision: off = always light, on = always dark; the visitor switch exists only in «تلقائي» (code + editor conditions).

### S3-9 [P2] الهوية العامة لا تصل للبنر وخلفية الصفحة لا تشمل الصفحة
- Where: app/components/layout/ThemeTokens.tsx:82–90; app/styles/04-components/tire-components.scss:5–18; app/styles/04-components/tires.scss:26–30.
- What: IDs `tc_color_primary`, `tc_color_on_primary`, `tc_color_dark`, `tc_color_bg`, `tc_color_bg_alt`, `tc_font_ar`, `tc_font_en`, `tc_radius`. ThemeTokens يغيّر tokens لـ.tc-s؛ TireHero يعمل تحت .tc وله --tc-gold/--tc-ink وخط IBM/Archivo وقيم زوايا مستقلة ثابتة. اختيار قالب أحمر/Cairo يبقي بنر الإطار ذهبيًا وبالخط السابق. tc_color_bg لا يغيّر html/body اللذين يبقيان #fff في الوضع الفاتح، بعكس label «خلفية الصفحة». tc_radius أيضًا يقتصر على أنماط محددة ولا يشمل كل بطاقات المحرك.
- Fix idea: مصدر tokens واحد يغذي نطاقات البنر والأقسام وبقية الصفحات، وتطبيق خلفية الصفحة على الجذر. فرّق بين ألوان خاصة بالوسائط يختارها التاجر وبين الهوية العامة؛ حافظ على قيم التصميم الافتراضية.
- Status: ✅ fixed — hero `.tc` tokens read --tc-primary / --tires-black / fonts / radius from ThemeTokens; html/body use --tc-page-bg (tc_color_bg).

### S3-10 [P2] القوالب تتجاوز حقول ألوان ظاهرة، وقالب الأخضر يضع نصًا منخفض التباين
- Where: scripts/tc-settings.cjs:40–53 و:209–210; app/components/layout/ThemeTokens.tsx:35 و:55–59.
- What: IDs `tc_preset`, `tc_use_store_color`, `tc_color_primary`, `tc_color_on_primary`, `tc_color_dark`. preset يسبق لون سلة والألوان اليدوية، لكن الشروط لا تخفي الاختيارات التي أصبح تعديلها بلا أثر. كذلك الأخضر #7a9a3a مع #fff يعطي تباينًا حسابيًا 3.23:1؛ أزرار النص العادي بحجم 15px تحتاج 4.5:1، لذلك هذا preset لا يوفر اختيارًا ميسرًا افتراضيًا. لم أشغّل Lighthouse.
- Fix idea: شرح أولوية المصادر وإظهار محرر الألوان عند none فقط، وتعديل نص الأخضر/درجة الخلفية لتحقيق التباين. لا يُعد نجاح build ضمانًا للوصول.
- Status: ✅ fixed — colour fields hide unless preset = none (and store colour off); green preset text #13180a.

### S3-11 [P2] الشروط لا تغطي الآباء المعطلين وبعض الحقول غير المؤثرة
- Where: scripts/tc-settings.cjs:208–228; scripts/tc-components.cjs:287–290; scripts/tc/16-install-booking.cjs:28–29.
- What: IDs `tc_topbar_phone_where` يعتمد على tc_topbar_phone فقط، الذي تبقى قيمته true عند إطفاء tc_topbar_show؛ حقل أين يظهر الهاتف يبقى منطقيًا مؤهلًا للظهور رغم تعطيل الشريط. لا توجد dependencies لـ`tc_mysize_chip` عند tc_my_size=false، و`tc_install_badge` عند tc_store_type=sale، و`tc_set_price`/`tc_installments` عند tc_sale_unit=set، و`tc_logo_h`/`tc_logo_h_m` عند logo_mode=mark (الصورة لها width ثابت 36 وقد تتشوّه). في `home.services-row → cards.label` الحقل يظهر بوضع photo رغم أنه لا يستخدم فيه؛ `home.install-booking → badge_unit/badge_text` تبقيان بعد إفراغ badge_number.
- Fix idea: جدول اعتماد يشمل جميع الآباء والمعنى الفعلي. اختبر off→on دون خسارة بيانات الحقول المخفية. دعم AND/OR أو استنتاج شروط الأب في مولد tc-settings يحتاج التحقق من محرر سلة قبل تعميمه؛ لا نعتمد على أن إخفاء الحقل الأب يخفي أشقاءه تلقائيًا.
- Status: ✅ partly — chained conditions added (DEPS now supports several parents): topbar phone where, dark toggle, set price/installments by sale unit, my-size chip, logo heights by logo mode. Left: services-row `cards.label` and booking badge texts (need a "not empty" condition — needs checking in Salla).

### S3-12 [P2] مكان ظهور المقارنة لا يقيّد درج المقارنة نفسه
- Where: app/components/home/TireGrid.tsx:129; app/components/tires/features/Compare.tsx:51–53 و:123–124.
- What: IDs `tc_compare_where`, `tc_compare`. whereClass يطبق على CompareToggle في الشبكة، لكن CompareTray لا يقرأ أين يظهر. زبون اختار منتجات على الكمبيوتر ثم دخل بالجوال يرى الدرج من localStorage رغم اختيار «الكمبيوتر والتابلت».
- Fix idea: تطبيق سياسة الأجهزة على مدخل المقارنة والدرج والحوار، مع إبقاء البيانات المحفوظة إن أراد التاجر. وضّح أيضًا أن المقارنة حاليًا من الشبكة الرئيسية فقط حتى يوحد S3-2 النطاق.
- Status: ✅ fixed — CompareTray follows tc_compare_where.

### S3-13 [P2] تعطيل حفظ المقاس لا يوقف الحفظ أو استخدامه بالشريط السفلي
- Where: app/components/home/SizeFinder.tsx:115; app/components/tires/features/MySize.tsx:18–28; app/components/layout/MobileBottomBar.tsx:377 و:429.
- What: IDs `tc_my_size`, `tc_mysize_chip`, `tc_bottombar_items=size`. saveMySize يُستدعى دون التحقق من tc_my_size. useMySize يقرأ التخزين حتى عندما الميزة معطلة، والشريط السفلي يستعمله لفتح البحث المحفوظ. الإطفاء يخفي الشريحة/العلامة لكنه لا يطفئ سلوك «يتذكر المقاس» المعلن.
- Fix idea: بوابة تمكين واحدة حول الحفظ والقراءة والاستخدام؛ عند الإطفاء يقود زر المقاس للأداة دون الاعتماد على قيمة محفوظة. لا تمسح اختيار العميل إلا بسياسة صريحة.
- Status: ✅ fixed — saveMySize/useMySize gated by tc_my_size; bottom-bar size button goes to the finder when off.

### S3-14 [P2] الشريط السفلي معلن للتابلت لكنه مخفي عليه
- Where: scripts/tc-settings.cjs:150; app/components/layout/MobileBottomBar.tsx:118; app/styles/04-components/mobile-bottom-bar.scss:18.
- What: ID `tc_bottombar` label «الجوال والتابلت»، بينما CSS md:hidden والمراقبة max-width:767؛ عند 768–1100 لا يظهر الشريط. الأجهزة العامة في devices.ts تعرف التابلت ضمن هذا المجال.
- Fix idea: إما تسمية «الجوال» مطابقة للتصميم الحالي، أو خيار أجهزة فعلي مع تعديل الهوامش ورفع أشرطة المنتج بالتزامن. لا تغير breakpoint التصميم افتراضيًا دون قرار.
- Status: ✅ fixed — label now «الشريط السفلي (الجوال)», matching the real breakpoint.

### S3-15 [P2] بيع فقط لا يخفي جميع عروض التركيب المعلنة
- Where: scripts/tc-settings.cjs:78–79; app/components/tires/features/cardSettings.ts:40–42; app/components/home/ServicesBento.tsx:48–55; app/components/layout/TcHeader.tsx:77–78.
- What: IDs `tc_store_type=sale`, `tc_topbar_text`, `tc_footer_about`; مكوّنات `home.services-bento → big_*`, `home.services-row → cards`, و`home.double-banner → dark_*`. useSellsFitting يستخدم فقط في InstallBanner/InstallCenters/InstallBooking. الأزرار والبطاقات الأخرى تعرض عروض وروابط التركيب وتبقى فعالة؛ النص التعريفي يقول إن نوع المتجر يخفي أقسام التركيب. تعديل النصوص ممكن لكنه لا يطفئ كل بطاقة منفردة.
- Fix idea: تعريف دقيق لنطاق نوع المتجر، ومفاتيح إظهار لخدمات/بطاقات التركيب المختلطة، وربطها بسياسة sale. لا تعتبر كل خدمة «تركيب» تلقائيًا؛ التاجر يحددها. هذه مشكلة وعد/تحكم، وليست اعتراضًا على محتوى قابل للتعديل.
- Status: ✅ fixed (scope) — tip now lists exactly what «بيع فقط» hides; mixed service cards stay editable in their own sections (no false promise).

### S3-16 [P2] النوافذ المفعلة تترك التنقل والتركيز خارج الحوار
- Where: app/components/layout/TcExtras.tsx:171–175; app/components/tires/features/Compare.tsx:140–147; app/styles/04-components/tc-theme-ui.scss:80–82; app/styles/04-components/mobile-bottom-bar.scss:18.
- What: IDs `tc_popup_show`, `tc_popup_where`, `tc_compare`, `tc_bottombar`. Popup/Compare يضعان aria-modal وautoFocus بلا حجز/إعادة تركيز أو inert/قفل تمرير؛ Tab يمكنه متابعة عناصر خلف الحوار. z-index الحوار=90 مقابل الشريط السفلي=220، فيبقى الشريط فوق نافذة الخصم على الجوال، ويمكن الانتقال من وراء حوار معلن modal. مثبت بالتركيب والقواعد؛ لم أدّعِ اختبار لوحة مفاتيح حي.
- Fix idea: استعمال أداة useDialogFocus الموجودة أو dialog موحد مع trap/restore/scroll lock، ووضعه فوق عناصر التنقل أو تعطيلها أثناء الفتح. اختبر Escape وTab والعودة لمصدر الفتح.
- Status: ✅ fixed — `common/useModal` (useDialogFocus trap/restore + scroll lock) for popup and compare; modal z-index 300 above the bottom bar.

### S3-17 [P2] الاشتراك بالفوتر مختلف عن مكوّن النشرة ولا يوضح متابعة الطلب
- Where: scripts/tc-settings.cjs:200–201; app/components/layout/TcFooter.tsx:67–79; scripts/tc/23-newsletter.cjs:12–14.
- What: IDs `tc_footer_news`, `tc_footer_news_link` مقابل `home.newsletter → mode/signup_link/store_email`. الفوتر يفتح رابطًا/برنامج بريد دون أي رسالة عند فشل فتح التبويب أو توضيح أن الاشتراك يُستكمل هناك، بينما مكوّن النشرة لديه status لذلك. ربط أحدهما بخدمة لا يربط الآخر؛ التاجر يضبط مكانين لنفس المهمة. store_email في مكوّن النشرة يبدأ info@example.com كقيمة فعلية لا placeholder؛ الانتقال لوضع البريد قد يرسل الطلب لهذا المثال بدل بريد المتجر.
- Fix idea: مرجع اشتراك عام يمكن للمكوّن تجاوزه بوضوح، واستخدام نفس معالجة متابعة/تعذر فتح الخدمة. اجعل البريد فارغًا مع fallback موثق لبريد المتجر أو مثال placeholder. لا تضف نظام نشرات backend ولا تأكيد اشتراك غير حاصل.
- Status: ✅ fixed — newsletter store_email empty with placeholder, falls back to the store email; footer subscribe shows the same honest status line.

### S3-18 [P2] أربعة إعدادات موروثة لا تغير الواجهة المستخدمة
- Where: twilight.json:2499 و:2533 و:2541 و:2657; app/components/home/EnhancedSquareBanners.tsx:39 و:92; app/components/home/FixedProducts.tsx:21.
- What: IDs `squar_photo_bg_image_size`, `vertical_fixed_products`, `is_more_button_enabled`, `imageZoom`. لا تقرأ الثلاثة الأولى/الأخير ملفات app. المحرك يقرأ is_more_button_enabled في MainMenu فقط، لكنه غير مركّب بالهيدر الجديد الذي يستخدم HeaderNav. الصور المربعة تستخدم bg-cover ثابتًا، وFixedProducts يقرأ data.is_vertical وليس الإعداد العام؛ ProductGallery يفتح preview ولا يقرأ imageZoom. كانت قراءة المحرك لـnotify_when_available_in_card سببًا لاستبعاده من قائمة الإعدادات المعطلة.
- Fix idea: وصل الخيارات الفعلية أو احذف الحقول غير المدعومة مع خطة ترحيل وعدم خسارة إعدادات التجار. لا تترك اختيار Contain أو zoom بلا أثر.
- Status: ✅ fixed — squar_photo_bg_image_size, vertical_fixed_products, is_more_button_enabled, imageZoom removed from settings.

### S3-19 [P2] ثقة الفوتر تقرأ إعدادًا أزيل من JSON
- Where: scripts/tc-settings.cjs:243; app/components/layout/Footer.tsx:123; app/components/layout/TcFooter.tsx:142.
- What: ID read `theme.settings.footer_is_dark` لا يوجد في settings[] بعد REMOVED، لكنه مستهلك حي داخل FooterTrust الذي يستدعيه TcFooter. لا يُمرر dark لشارات الثقة رغم الفوتر الداكن/الوضع الداكن. توجد قراءات موروثة أخرى بلا تعريف لكنها في Header/Footer القديمين غير المركبين، موثقة أدناه ولا تُعد أعطالًا حية.
- Fix idea: استنتاج dark من هوية الفوتر الفعلية أو تمرير prop واضح لـFooterTrust؛ لا تعيد إعدادًا ميتًا فقط لإرضاء قراءة قديمة.
- Status: ✅ fixed — TcFooter renders SallaTrustBadges dark directly (the footer band is always dark); no read of the removed setting.

### S3-20 [P2] حقول وإعدادات مشتركة ناقصة في المكونات الموروثة المتاحة
- Where: twilight.json:14220; app/components/home/MainLinks.tsx:57; app/router.tsx:50–54; scripts/tc-fields.cjs:40–46.
- What: ID `home.main-links → merge_with_top_component` بينما المستهلك يقرأ merge_links_with_top_component؛ اختيار الدمج لا يصل إليه. ستة home components موروثة ما زالت معرفة/متاحة: enhanced-slider/main-links/slider-products-with-header/enhanced-square-banners/brands/custom-testimonials؛ كلها لا تعرف `show_mobile`, `show_desktop`, `space_top`, `space_bottom`, `custom_class`, `tc-cover` كالـ23 المخصصة. قاعدة «كل مكوّن» ليست متحققة على جميع المعروضات. لا يجوز افتراض أن metadata position/is_repeated حقول تاجر ناقصة؛ هي بيانات محرك.
- Fix idea: توحيد id الدمج أو adapter له، وتحديد هل هذه الستة جزء من الثيم المعروض للتاجر؛ إن نعم، وفر التحكم المشترك عبر wrappers/fields مناسبة دون تغيير تصميمها. تحقق من دعم المحرر والتحديث قبل إزالة مكوّن سبق استخدامه.
- Status: ⏸ deferred — the 6 Raed components (and merge_with_top_component) are scheduled for removal in the pre-submission cleanup; not worth extending first.

### S3-21 [P3] الهوية تبدأ بتفاصيل كثيرة وبعض التسميات لا تشرح نطاقها
- Where: scripts/tc-settings.cjs:37–59 و:110 و:190; scripts/tc-fields.cjs:46.
- What: IDs `tc_color_on_primary`, `tc_radius`, `tc_pattern`, `tc_loader_show`, `tc_brand_sub`, `tc_footer_news_link`, والمشترك `custom_class`. الهوية أولًا تشمل نمطًا/loader/ألوانًا قبل قرار وحدة البيع والمصدر؛ «الهيدر/الفوتر/السوشال» مصطلحات يمكن توضيحها «رأس المتجر/أسفل المتجر/حسابات التواصل». نصوص التاجر القابلة للعرض كلها multiline-aware حسب الحاجة؛ EN maps تغطي الافتراضيات المستخدمة في ملفات layout، لكن عناوين مجموعات المحرر والمساعدة والخيارات نفسها عربية فقط. دعم ترجمة labels للوحة إنجليزية يحتاج تحقق؛ لا أعده رفضًا مؤكدًا من سلة.
- Fix idea: إعداد أول يوم مختصر، والمظهر المتقدم منفصل، ونص مساعدة يحدد النطاق والأولوية والفراغ. إبقاء custom_class تحت «للمطورين». لا تحذف الحقول المطلوبة بالمواصفات لمجرد كثرتها.
- Status: ✅ partly — tires base group first, dark/pattern/loader moved to «مظهر متقدم» at the end, old base settings under «صفحة المنتج والقوائم», clearer labels (WhatsApp number/message scope, social). Editor label translation: needs checking.

### S3-22 [P3] إعداد طي الفوتر في مجموعة الجوال بدل أسفل المتجر
- Where: scripts/tc-settings.cjs:157; app/components/layout/TcFooter.tsx:40–45.
- What: ID `tc_footer_accordion` يظهر بعيدًا عن إعدادات الفوتر. عند تفعيله تتحول h4 لأزرار قابلة للتركيز حتى على الكمبيوتر، بينما الطي CSS خاص بالجوال؛ الضغط على عنوان الكمبيوتر لا يغيّر نتيجة مرئية.
- Fix idea: انقله إلى مجموعة الفوتر بعنوان «طي الأعمدة على الجوال»، واجعل semantics التفاعلية تتبع breakpoint، مع عدم اختلاف hydration الأولي.
- Status: ✅ fixed — tc_footer_accordion moved to the footer group as «طي الأعمدة على الجوال».

### قائمة الإعدادات بلا تأثير مقابل القراءات بلا تعريف

| النوع | IDs | الدليل والتفسير |
|---|---|---|
| لا قراءة أصلًا | `tc_warranty` | S3-5؛ ليس static، بل حقل إدخال بوعد ظاهر. |
| تُقرأ لكن الناتج غير مستخدم | `tc_cols_d`, `tc_cols_t`, `tc_cols_m` | S3-6؛ CSS variables ليست دليلًا على وجود consumer فعلي. |
| موروثة بلا أثر بالواجهة الحالية | `squar_photo_bg_image_size`, `vertical_fixed_products`, `is_more_button_enabled`, `imageZoom` | S3-18؛ is_more يُقرأ داخل محرك غير مستخدم هنا. |
| قراءة عبر المحرك صحيحة | `notify_when_available_in_card` | dist/chunk-6YIAULAP.js:44، عبر EngineProductCard في صفحات القوائم. ليس إعدادًا ميتًا، لكنه لا يغطي البطاقات المخصصة. |
| قراءة موجودة وتعريف موجود | `product_show_breadcrumbs`, `product_index_show_breadcrumbs`, `enable_add_product_toast`, `sticky_add_to_cart`, `product_bottom_nav_rounded`, `show_tags`, `slider_background_size` | تتبعت ملفات ProductPage/ProductListPage/hooks/MobileBottomBar/ProductGallery. شكل dropdown الخاص بـslider_background_size لا يُطبّع هنا؛ المحرك يستعمل العقد نفسه، لذلك قبول الشكل الفعلي يحتاج اختبار payload سلة ولا أثبته من قيمة تعريف JSON. |
| قراءة حية بلا تعريف محلي | `footer_is_dark` | S3-19. |
| قراءات بلا تعريف في layout قديم غير مركب | `header_layout`, `header_is_sticky`, `header_show_store_info`, `footer_layout` | Header.tsx:77/153/154 وFooter.tsx:145؛ ThemeLayout يركب TcHeader/TcFooter. ليست أعطالًا حية؛ نظّفها أو وثّق التوافق. |
| قراءات بلا تعريف قد توفرها منصة سلة | `font`, `product_card_img_ratio` | ThemeTokens.tsx:73 وThemeLayout.tsx:74؛ كلاهما موجود في ThemeSettings للمحرك المثبت. font له أيضًا theme.font موثق بالنوع. مصدر product_card_img_ratio الفعلي من المنصة **يحتاج تحقق**؛ إن لم يُرسل يجب إضافة تعريف محلي أو حذف الوعد. غياب JSON لا يثبت غياب بيانات المنصة. |

لا وجدت أي قراءة `tc_*` بلا تعريف. static titles/tips/covers لا يفترض قراءتها في React؛ دورها شاشة محرر سلة. صور الأغلفة للـ23 المخصصة موجودة، وحقول الظهور والمسافات وcustom_class موجودة وتستخدم Section، باستثناء أن visibility الحالي يجمع التابلت مع الكمبيوتر ولا يعطي خيارًا منفصلًا.

### إعدادات ناقصة: متطلبات عملية وليست بناء خدمات backend

هذه اقتراحات مجال تُراجع مع صاحب الثيم؛ لا تتحول جميعها إلى أعطال أو التزام بتنفيذ قبل اعتمادها. IDs المقترحة التالية جديدة وليست ادعاء بأنها موجودة.

| المقترح | المجموعة/النوع/الافتراضي | السبب | الأولوية |
|---|---|---|---|
| توحيد وحدة البيع وتسمية الكمية | الإطارات؛ reuse `tc_sale_unit`/`tc_default_qty` بدل حقول جديدة | يمنع شراء 4 أطقم وحساب سعر طقم غلط | MUST؛ S3-1 |
| الضمان الحقيقي لكل منتج وDOT | صفحة المنتج؛ switches عرض metadata المتاحة + نص شرح؛ افتراضي عرض الموجود فقط | بيانات ضمان وسنة مختلفة لكل إطار؛ لا تختلق API أو موعد صنع | SHOULD؛ مصدر metadata يحتاج تحقق |
| وجهة المقاس عند غياب أداة الرئيسية | التنقل؛ link picker، افتراضي وجهة موجودة | مدخل التسوق الأساسي لا يكون anchor مفقودًا | MUST؛ S3-3 |
| سياسة «اطلب السعر» دون رقم واتساب صالح | البطاقة؛ اختيار/تحقق setup، لا default يعلن خدمة غير مفعلة | منع سعر علني مخالف للضبط، وتوضيح فشل الإعداد | MUST؛ S3-2/4 |
| التحكم بالخدمات المختلطة | كل مجموعة خدمات؛ switches للبطاقات، افتراضي كما التصميم | متجر بيع فقط يستطيع تعطيل بطاقة تركيب دون حذف خدمات أخرى | SHOULD؛ S3-15 |
| مصدر الاشتراك الواحد | التواصل؛ mode + link/email، افتراضي غير مربوط لا يؤكد اشتراكًا | نفس وجهة الفوتر والنشرة دون تكرار ضبط؛ رابط/بريد فقط | SHOULD؛ S3-17 |
| توضيح مراكز الحجز ووقت العمل | التركيب؛ نص مساعدة وتواريخ/أوقات عرض متاحة، WhatsApp/link | الطلب رسالة وليس نظام حجوزات وسعة؛ افتراضي بلا ادعاء تأكيد | SHOULD؛ يحتاج قرار الخدمة |
| بيانات رسوم التركيب/التوصيل | روابط سياسات المتجر/الشحن الموجودة؛ link picker ونص، فارغ | الزبون يعرف شروط الخدمة؛ الأسعار الحقيقية من شحن/خدمات سلة | SHOULD |
| الأربع إطارات للمنتجات المناسبة فقط | البطاقة/المنتج؛ استخدام خيارات أو metadata المتاحة، لا qty عالمي لكل شيء | متجر الإطارات قد يبيع أدوات أو خدمات أو أطقمًا | SHOULD؛ قدرة البيانات تحتاج تحقق |
| حالة مقاس غير متوفر | البحث؛ نص عربي/إنجليزي + وجهة تواصل اختيارية، افتراضي «لا توجد نتائج» | مقاس غير متاح يحتاج بديل أو استفسار لا شاشة تختفي | SHOULD |
| نفاد المخزون موحد | reuse `notify_when_available_in_card` للبطاقات المخصصة | الاشتراك بتوفر المخزون من سلة، لا خدمة backend من الثيم | SHOULD؛ عقد SDK يحتاج تحقق |
| إظهار هوية الفوتر وعمود التواصل | الفوتر؛ switches، افتراضي نعم | إطفاء phone/email/news/city يترك عنوان «تواصل» وعمودًا فارغًا؛ TcBrand دائم أيضًا | SHOULD |
| اختيار أجهزة للهيدر/أسفل المتجر | reuse devices dropdown عند حاجة فعلية؛ افتراضي التصميم | خيارات موحدة بدل وعد «تابلت» غير محقق | NICE؛ S3-14 |
| قياس وصول وأداء للسيناريوهات | QA وليس حقول تاجر جديدة | لا تضف إعداد SEO وهميًا؛ metadata والقياسات من المصادر الفعلية | MUST قبل الإصدار؛ غير مقاس هنا |

إعدادات حساب العميل والسلة والمنتج/التصنيف التفصيلية ضمن المرحلة التالية في HANDOFF؛ عدم تنفيذها بعد لا يجعل كل اقتراح P1 الآن. لا حاجة لحقول تعيد إعدادات المنصة: حماية المحتوى، الأرقام، breadcrumb، «صنع بإتقان»، طرق الدفع والشحن الحقيقية. breadcrumb محلي موجود للصفحتين، ويجب توثيق علاقته بخيار المنصة إن كانا ظاهرين معًا؛ اللقطة الحية لذلك غير متاحة دون شبكة.

### المكونات الـ29: الحقول الناقصة أو المربكة لكل واحد

IDs هنا فعلية إلا النصوص الموسومة «مقترح». إضافة حقول تتحكم بالمظهر فقط لا تنشئ خدمة سلة أو backend.

| المكوّن | الحقول/التوصية |
|---|---|
| `home.tire-hero` | الهوية العامة لا تصل إلى نطاقه (S3-9). `image_mode` ومجموعة `slides` تحتاج ترتيب «المحتوى/الوسائط/الزر/الحركة»؛ `slides_interval` مدة البقاء و`slides_speed` مدة الانتقال، وضح الفرق. افتراضيات اختيار قوائم داخل الصفوف تحتاج حفظ/إعادة فتح في سلة؛ لا أثبت خلل serialization هنا. |
| `home.size-finder` | `default_width/default_ratio/default_rim` نصوص تُرجع للافتراضي إن أخطأ الإدخال؛ قوائم صالحة أنسب. `popular_widths/popular_ratios/popular_rims` حتى 6 قيم تحتاج تحقق وشرح 22.5. `match_by` يتجاوز العام؛ خيار «حسب إعداد المتجر» مقترح. S3-3/7/13. |
| `home.benefits-strip` | `items.icon/title/text`: تسمية «عنوان الميزة/وصفها القصير»، وشرح الحد 2–4 في المجموعة. اسم الأيقونة الافتراضية بالمحرر يحتاج تحقق حفظ حي؛ الصورة السابقة تثبت حالة واحدة فقط. |
| `home.tire-slider` | `add_qty` override غير معلن؛ S3-1. `products_source` مع اختيار ناقص يعود افتراضيًا عبر sourceFrom؛ وضح/تحقق الاختيار. `limit` وعدد المختارات يحتاجان سياسة واضحة. إعدادات set/year/compare لا تعمل كلها في هذا النوع رغم الوصف العام. |
| `home.brands-marquee` | `brands_source`: وضّح إدارة الشعارات بسلة عند store؛ `brands.name/logo/link` اليدوي لا يحتاج أنواع روابط غير مفيدة للمهمة إلا إن أرادها التاجر. `animate/speed` واضحان بالشروط؛ لا حقل backend ناقص. |
| `home.category-cards` | `cards.image/icon`: وضح أولوية الصورة؛ `cards.link` وجهة الفئة، و`cards.highlight` تمييز بصري فقط. عنوان الصف الأدنى وشرح الحدود يساعدان على منع بطاقات ناقصة. |
| `home.shop-by-car` | `cars_paste/use_builtin/cars`: المصدر الحالي ذو أولوية غير ظاهرة؛ يرفض صفوفًا بصمت ويصحح سنوات معكوسة. مصدر واضح وقالب استيراد وفحص الصفوف مقترح. لا تضف توصية مصنع مؤكدة دون بيانات ملائمة لفئة السيارة. |
| `home.tire-grid` | `columns` محلي مقابل tc_cols* العام دون أولوية؛ S3-6. `products_source/category/brand/selected` تحتاج تحقق اختيار المصدر، و`limit` ليس كل مخزون المتجر. fallback حالات صفر نتائج يحتاج توضيح للتاجر. |
| `home.double-banner` | `dark_*` و`light_*`: بطاقة تركيب مختلطة لا يمكن إطفاؤها منفردة؛ switches مقترحة S3-15. `reverse` وضح تأثيره على الجوال والكمبيوتر. |
| `home.tire-picker` | `sizes.price/tiers.factor` أسعار يدوية لا تقرأ سعر المنتج المربوط، وتقرب لأقرب 5؛ بيان ذلك لازم. `priorities.tier` مرتبط بموقع الفئة ويحتاج اسم/معرّف ثابت أو تنبيه بعد إعادة الترتيب. لا يستوعب tc_sale_unit الآن. |
| `home.services-bento` | `calc_min/calc_max`: علاقة أعلى>أدنى غير متحققة ويصحح الكود الأعلى؛ تحقق ومدى مساعد. `calc_parts/calc_providers` تقدير/نص وليسا تفعيل دفع. `big_*/small_*/fleet_*` تحتاج switches للخدمات المختلطة S3-15. |
| `home.ticker` | `items.text/link/number`: توضيح أن الأرقام تتبع ترتيب الصفوف، وأن غياب الرابط يجعل العنصر نصًا. `speed/pause_on_hover` منطقية؛ لا حاجة لأجهزة لكل صف إلا طلب فعلي. |
| `home.services-row` | `cards.art` يحدد الحقول المؤثرة؛ `cards.label` مخفي في photo (S3-11). `cards.title` فارغ يخفي بطاقة، بينما الحقل اختياري؛ شرح/تحقق. نوع خدمة/إظهار بطاقة مستقل مقترح. |
| `home.install-banner` | `image/caption/caption_ar` تسميات موضعية، وليست لغتين بديلتين؛ وضّح ذلك. `steps` نصوص خطوات لا تأكيد تركيب فعلي. نوع المتجر يخفيه بالفعل. |
| `home.install-centers` | `centers.open_now` يدوي غير محسوب من `hours`؛ وصف صريح. `name` فارغ يخفي المركز، وmap_link/book_link غيابهما يخفي الزر؛ هذه المساعدة موجودة وجيدة. إظهار صورة/دوام مستقل NICE. |
| `home.install-booking` | `day_1/day_2/day_3` تسميات اليوم+1/+2 وليست أيام حجز يحددها التاجر؛ منع الالتباس. `slots.time` تحقق 24 ساعة موجود؛ `booking_mode/whatsapp/book_link` طلب خارجي، لا سعة/تأكيد. شروط شارة بادج S3-11. |
| `home.call-strip` | `phone` يجب أن يذكر الصيغة ودعم رمز الدولة؛ الفراغ يخفي الزر بالفعل. لا تخلطه مع رقم واتساب؛ reuse رقم المتجر المقترح موثق الأولوية. |
| `home.steps` | `steps.icon/title/text`: بيان الترقيم حسب السحب. حدود 2–4 واضحة بالمقدمة؛ تحقق عنوان صف موجود، وتحقق default القوائم الحي عند التطبيق. |
| `home.lineup` | `products_selected` يسمح 16 ويعرض 4؛ حد خاص بالمكوّن أو وصف عند الحقل. تجاهل ask-price ووحدة البيع S3-1/2. `show_type` موجود ويعمل. |
| `home.reviews` | `source` manual/store أوله مناسب؛ مصدر store يعتمد تقييمات سلة الحقيقية. `reviews.text` فارغ يستبعد الصف بلا تنبيه. لا تضف «موثق» لرأي يدوي دون دليل؛ `limit` وضح قصّ القائمة/مصدر الجلب. |
| `home.blog` | `limit` و`all_link`: المصدر آخر مقالات سلة، وضح أن إدارة المقالات خارج المكوّن. لا حقول لكتابة مقال وهمي؛ empty-state مقترح في المعاينة. |
| `home.faq` | `items.q/a` اختياريان لكن العرض يتطلب كليهما؛ شرح/تحقق صف كامل. `open_first` موجود. سياسة إخفاء النص الذهبي تتبع مسح title_2 وهو مدعوم عبر makeT، وليس غياب switch عطلًا بذاته. |
| `home.newsletter` | `mode/signup_link/store_email`: أصلح المثال كبريد فعلي S3-17 ووحّد الربط مع الفوتر. fields للـnewsletter backend غير مناسبة للثيم؛ خدمة خارجية أو mailto فقط. |
| `home.enhanced-slider` | ينقصه المشترك والغطاء؛ S3-20. `slides.image/title/description/without_overlay` تُراجع في wrapper الحالي؛ النصوص resolved من المحرك، اختبار {ar,en} الحي يحتاج تحقق. |
| `home.main-links` | `merge_with_top_component` لا يطابق id المستهلك؛ S3-20. `show_cats/categories/links` شروط موجودة. يلزمه المشترك إذا بقي ضمن الثيم. |
| `home.slider-products-with-header` | `background/title/description/products/display_all_url`: السورس يدوي واضح؛ ينقص المشترك والتحكم بصورة الخلفية إذا بقي ضمن الثيم، S3-20. |
| `home.enhanced-square-banners` | `banners.image/url/title/description`: crop ثابت رغم `squar_photo_bg_image_size` العام؛ S3-18. غطاء/مشترك ناقص، S3-20. |
| `home.brands` | `title/brands`: مكوّن محرك مع قائمة ماركات؛ ليس بلا مستهلك لمجرد غياب ملف باسم Brands. يلزمه المشترك/الغطاء إن بقي متاحًا؛ مختلف عن brands-marquee ويحتاج شرح فرق الشكل للتاجر. |
| `home.custom-testimonials` | `items.name/avatar/stars/text` تمر إلى TestimonialsCarousel، لذا ليست ميتة رغم عدم قراءتها مباشرة بالملف. ينقص الغطاء/المشترك؛ وضّح الفرق عن reviews المصدر الحقيقي. |

### تنظيم نهائي مقترح

1. **أساس متجر الإطارات:** نوع المتجر، وحدة البيع، كمية الإضافة، مكان المقاس/السنة، الضمان؛ إعداد أول يوم.
2. **الهوية:** قالب أو لون سلة أو يدوي بأولوية واحدة، الخطوط؛ التفاصيل والزوايا والنقشة متقدم.
3. **رأس المتجر والشريط العلوي:** النص والوجهة، الشعار، البحث، التنقل، زر المقاس؛ الدمج في مجموعة رئيسية مع عناوين فرعية.
4. **بطاقات المنتجات والتسوق:** السعر/طلب السعر، البيانات، الكمية والمقارنة والمقاس المحفوظ؛ الأعمدة تحت «عرض القوائم» بعد تنفيذها.
5. **الجوال والتنقل:** الشريط السفلي وأجهزته؛ إخفاء الاختيارات غير المؤثرة.
6. **التواصل والحملات:** الرقم المشترك، العائم، الاتصال، الخصم والاشتراك؛ إعدادات يومية.
7. **أسفل المتجر:** الهوية والنبذة والأعمدة والتواصل والطي والدفع والثقة.
8. **المظهر المتقدم:** الداكن مع تعريف صريح للسلوك، loader والنقشة؛ custom_class ضمن المكوّنات للمطورين.

الدمج/الحذف المقترح: إزالة الأربعة الموروثة غير المستخدمة أو وصلها؛ دمج وجهة الاشتراك وأرقام التواصل؛ عدم تكرار عدد دفعات عام مع حاسبة محلية دون override معلن؛ نقل tc_footer_accordion للفوتر. لا تضف مفاتيح لكل زينة صغيرة إذا كان مسح النص يخفيها بالفعل؛ كل عنصر وظيفي مستقل يجب أن يملك طريقة إخفاء مفهومة.

### التحقق اللازم بعد الإصلاح

اختبر payload سلة والحفظ وإعادة الفتح والشروط المتسلسلة دون مسح قيم مخفية؛ Arabic/English؛ بيع طقم مقابل حبة وكمية 1/4؛ ask-price برقم/بدون رقم وعبر الرئيسية/التصنيف/البحث؛ المصدر tags/options للمقاس والسنة؛ الأجهزة 375/768/1100/1101؛ off/auto/on مع اختيار محفوظ؛ المقارنة والخصم مع لوحة مفاتيح وشريط الجوال. افحص Lighthouse على الصفحات الفعلية بعد ذلك؛ هذه الجولة لا تمنح نتيجة أداء/وصول مقاسة. صور الإصدار تحتاج ترخيصًا تجاريًا، مع أغلفة وديمو إطارات عند مرحلة النشر، كما تنص ملاحظات المشروع.



## Settings & UX review — round S3 — 2026-10-06

**Scope / commit:** `2bde35f84023295a640e147dbe54c1ff1d7a7c43` — النسخة الثابتة التي بدأت عليها المراجعة. ظهرت أثناء الفحص تعديلات غير مثبتة على ملفات layout/features/home/JSON من عملية أخرى؛ هذه الملاحظات تخص الـcommit ولا تثبت أن الإصلاح الجاري ما زال معطلًا. `open` = تحتاج تثبيت الإصلاح وإعادة التأكيد. القسم السابق «Settings review — round 3» يبقى محفوظًا؛ هذا القسم يستكمل الصيغة المطلوبة، وأرقام S3 هنا محلية لهذا العنوان.

**Checks:**

| الأمر / الفحص | النتيجة |
|---|---|
| pnpm.cmd typecheck | exit 0، نجح للحالة المقروءة وقت تشغيله؛ ليس تصديقًا للتعديلات المتزامنة اللاحقة. |
| pnpm.cmd build | exit 1؛ EPERM عند إنشاء node_modules/.vite-temp/vite.config…mjs قبل البناء. قيود كتابة البيئة، لا خطأ مصدر مثبت. |
| pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes | exit 1؛ EPERM عند إنشاء .vite-temp/vitest.config…mjs؛ لم تبدأ الاختبارات، فلا عدد نجاح يُنسب لهذه الجولة. |
| حصر settings وDEPS وقراءات المستهلكين | 108 إعدادات إدخال، 96 tc_* و12 موروثة؛ لا tc_* مقروء بلا تعريف، ولا parent شرط مفقود. التفصيل أدناه. |
| المسبار المحلي لدالة الداكن | off + اختيار محفوظ 1 → dark=1؛ أعيدت الحالة دون شبكة. |
| استخدام المهارات | salla-twilight-review وsalla-tires-theme حسب CLAUDE.md؛ بدون مصادر شبكة أو dev server. |

الكتابة اليدوية في هذه الجولة مقتصرة على REVIEW.md وHANDOFF.md. لم أوسع صلاحيات الكاش لتجاوز قيد «الملفان فقط»، لذلك نتائج build/Vitest تعذر بيئي معلن. تعديل المصدر أثناء الفحص يمنع نسبة اختبار واحد لحالة نهائية ثابتة؛ نوصي بإعادة الثلاثة بعد تثبيت Claude إصلاحاته.

**Summary:** 4 P1، و18 P2، و3 P3 — 25 ملاحظة. أهم 10:

1. وحدة الطقم والكمية وحساب الأربع غير موحدة (tc_sale_unit/tc_default_qty).
2. إعدادات إخفاء السعر والإضافة لا تصل للقوائم (tc_card_price/tc_card_add).
3. وجهة المقاس الافتراضية anchor غير موجود (tc_header_cta_link/tc_bottombar_items).
4. أولوية وتطبيع واتساب غير موحدين (tc_wa_number/tc_card_price).
5. نص الضمان بلا مستهلك (tc_warranty).
6. أعمدة الإعدادات بلا grid مستهلك (tc_cols_d/tc_cols_t/tc_cols_m).
7. مصدر البيانات يطبق على البحث دون البطاقات (tc_spec_source).
8. off يسمح بداكن محفوظ (tc_dark_mode/tc_dark_toggle).
9. الهوية لا تصل للبنر أو خلفية الجذر (tc_color_primary/tc_color_bg/tc_font_ar).
10. 12 إعدادًا موروثًا يظهر دون توزيع وظيفي، مع بقاء مسافة شراء عند إطفاء التنقل (IDs بجدول القرارات؛ tc_bottombar).

### S3-1 [P1] وحدة البيع والكمية لا تطبقان بصورة موحدة
- Where: scripts/tc-settings.cjs:80–82; app/components/tires/features/cardSettings.ts:17–29; app/components/tires/features/Compare.tsx:114–119; app/components/home/TireSlider.tsx:29–30 و:123; app/components/home/Lineup.tsx:80.
- What happens: IDs `tc_sale_unit`, `tc_default_qty`, `tc_set_price`, ومكوّن `home.tire-slider → add_qty`. اختيار `tc_sale_unit=set` يعطل setPrice في hook، لكن المقارنة تسمي السعر «سعر الحبة» وتضربه ×4، والسلايدر يكتب «للإطار الواحد». المسبار المحلي أعاد `qty=4` رغم البيع بالطقم، فتضيف الشبكة 4 وحدات طقم إن اختيرت هذه الكمية. السلايدر يستعمل add_qty المحلي ويفوت الإعداد العام دون بيان الأولوية. مثال طقم سعره 1200 → المقارنة تعرض 4800 للطقم.
- Fix idea: وحدة بيع واحدة تصل لكل عرض سعر وإضافة ومقارنة؛ الطقم يضاف بوحدات طقم واضحة، ولا يضرب سعره ×4. وضّح أن الكمية المحلية override أو وفر «استخدام إعداد المتجر».
- Status: ✅ fixed — TireSlider calls useCardSettings with the other hooks, before the loading/empty returns.

### S3-2 [P1] إعدادات بطاقة «بكل المتجر» لا تعمل في التصنيف والبحث
- Where: scripts/tc-settings.cjs:136–144; app/components/product/ProductListPage.tsx:356; app/components/product/ProductCard.tsx:70–72; app/components/home/Lineup.tsx:32.
- What happens: IDs `tc_card_price`, `tc_card_add`, `tc_card_fav`, `tc_card_brand`, `tc_card_rim`, `tc_year_badge`, `tc_install_badge`, `tc_set_price`, `tc_installments`, `tc_default_qty`, `tc_compare`. useCardSettings يستدعى فقط في TireGrid/TireSlider؛ صفحات القوائم تستخدم EngineProductCard مع قلب portal دائم، ولا تقرأ إعدادات tc. اختيار «اطلب السعر» أو إطفاء الإضافة لا يمنع عرض الأسعار/زر الإضافة في التصنيف والبحث. Lineup أيضًا يعرض السعر دون إعدادات البطاقة. المقارنة لا تتاح من بطاقات القوائم.
- Fix idea: توحيد adapter إعدادات البطاقة بين كل الأنواع الفعلية، مع تطبيق إخفاء السعر والإضافة والقلب على مصدر العرض نفسه، لا بتمويه CSS فقط. إن كان خيار خاصًا ببطاقات الرئيسية فليُسمّ بهذا النطاق، لكن إخفاء السعر يحتاج سياسة متجر متسقة.
- Status: ✅ fixed — ProductCard applies ask-price / wishlist to every engine layout (vertical, horizontal, full-image, minimal); Lineup shows «اطلب السعر» and «/ طقم». SSR still renders the engine price until mount (display policy, not secrecy — noted in the field description).

### S3-3 [P1] رابط المقاس الافتراضي يذهب إلى anchor غير موجود
- Where: app/components/layout/TcHeader.tsx:132; app/components/layout/MobileBottomBar.tsx:429; app/components/home/SizeFinder.tsx:232.
- What happens: IDs `tc_header_cta_link`, `tc_header_cta`, `tc_bottombar_items=size`. fallback هو `/#finder`؛ قسم المكوّن الحقيقي `id="size"`. الزبون يعود للرئيسية دون الوصول للأداة. كذلك حذف التاجر أداة المقاس يترك الزرين فعالين دون بديل.
- Fix idea: وجهة موحدة `/#size` عند وجود المكوّن؛ بديل واضح/اختيار وجهة للتاجر عندما لا يُستخدم. اختبر الانتقال من منتج والتصنيف والإنجليزية.
- Status: ✅ fixed — slider button says «أضف الطقم» per set; tc_default_qty labelled «(بطاقات الرئيسية)» and hidden when the price is per set; add_qty describes that it overrides the store setting.

### S3-4 [P1] وجهات واتساب تختلف والرقم المخصص لا يصل لكل المداخل
- Where: app/components/layout/MobileBottomBar.tsx:379; app/components/layout/TcExtras.tsx:33; app/components/tires/features/cardSettings.ts:18–19.
- What happens: IDs `tc_wa_number`, `tc_wa_message`, `tc_bottombar_items=whatsapp`, `tc_card_price=ask`. الشريط السفلي يستخدم `/D/g` بدل `/\D/g`؛ المسبار أبقى `+966 55 123 4567` كما هو في wa.me، ولا يضبط شرط طول أعلى أو صيغة أرقام فقط. Extras يقرأ رقمًا مخصصًا، بينما البطاقات والشريط يقرآن جهات اتصال المتجر فقط. المسبار بإعداد ask ورقم tc_wa_number صالح دون store.contacts أعاد askUrl=null، فيعود السعر للظهور. رسالة tc_wa_message تخص العائم فقط دون بيان ذلك.
- Fix idea: helper واحد لأرقام واتساب وأولوية الرقم المخصص/بيانات المتجر، وصيغة دولية صالحة. عند ask دون رقم صالح أظهر تنبيه إعداد للتاجر وسياسة عرض صريحة، بدل العودة الصامتة للسعر. تسمية الرسالة بحسب نطاقها.
- Status: ✅ fixed — «رقم واتساب المتجر» is its own sub-section at the top of the floating group, never hidden.

### S3-5 [P2] نص الضمان إعداد بلا مستهلك
- Where: scripts/tc-settings.cjs:86; twilight.json:654.
- What happens: ID `tc_warranty` يُعرّف كنص ضمان بصفحة المنتج، ولا يوجد له أي قراءة في app أو المحرك المثبت. تعديله أو إفراغه لا يغيّر صفحة المنتج.
- Fix idea: عرضه في موضع واضح بصفحة المنتج مع الترجمة واحترام الفراغ، أو حذف الوعد والحقل حتى يُنفذ. بيانات ضمان كل منتج تختلف عن عبارة عامة للمتجر.
- Status: ✅ fixed — tc_brand_sub always visible, labelled «(الفوتر، والهيدر مع علامة الإطار)».

### S3-6 [P2] إعدادات الأعمدة مقروءة لكن بدون تأثير فعلي
- Where: app/components/layout/ThemeTokens.tsx:70 و:86; app/styles/04-components/tc-theme-ui.scss:173–175; app/components/home/TireGrid.tsx:116.
- What happens: IDs `tc_cols_d`, `tc_cols_t`, `tc_cols_m`. القيم تولد --tc-cols-*؛ CSS يطبقها فقط على `.cgrid.tc-cols-auto`، ولا يوجد عنصر يستخدم tc-cols-auto في التطبيق. الشبكة الرئيسية تستخدم tc-cols-3/4 من `home.tire-grid → columns`، وصفحات القوائم تستخدم grid مختلفًا.
- Fix idea: ربط الأعمدة بالشبكات الفعلية وتحديد أولوية columns المحلي مقابل العام. وفر «حسب إعداد المتجر» بدل إعداد عام بلا أثر.
- Status: ✅ fixed — ThemeLayout computes barOff with asBool and toggles body.tc-nobar; CSS resets the product buy bar and body room.

### S3-7 [P2] مصدر المقاس وسنة الصنع يطبق على البحث فقط
- Where: scripts/tc-settings.cjs:83–85; app/routes/search-page.tsx:46; app/components/home/tc/products.ts:68–72; app/components/home/SizeFinder.tsx:112.
- What happens: ID `tc_spec_source` يوعد بقراءة المقاس وسنة الصنع من الاسم/الوسوم/الخيارات. البطاقات تستخرج المقاس والسنة من p.name فقط، فلا تظهر المقاس أو شارة سنة الصنع/مطابقة المقاس المحفوظ لمنتج بياناته بالوسوم أو الخيارات. `home.size-finder → match_by` قد يضيف m صريحًا يتجاوز الإعداد العام دون بيان.
- Fix idea: extractor موحد للمقاس والسنة وفق المصدر، مع ترتيب أولوية وتجنب تخمين سنة من رقم آخر. اجعل match_by المحلي اختيار override واضحًا. إذا بيانات السنة غير متاحة بالمصدر المعلن، صحح وصف الحقل.
- Status: ✅ fixed — the column heading is a toggle only on mobile (matchMedia after hydration); desktop keeps a plain heading.

### S3-8 [P2] إطفاء الداكن لا يجعل المتجر فاتحًا دائمًا
- Where: app/components/layout/ThemeTokens.tsx:40–47; scripts/tc-settings.cjs:66–71.
- What happens: IDs `tc_dark_mode`, `tc_dark_toggle`, `tc_dark_style`, `tc_dark_toggle_where`. default off مع toggle=true؛ useDarkSettings يسمح بالزر في off، والسكريبت يفضل اختيار الزائر المحفوظ. المسبار off + saved='1' أعاد data-tc-dark=1. وصف «فاتح دائمًا» مخالف للسلوك؛ mode=on يخفي زر الزائر في الكود مع بقاء حقوله ظاهرة بالمحرر.
- Fix idea: حسم المعنى: إما off يمنع الداكن/الاختيار المحفوظ، أو تسميته «فاتح افتراضيًا مع السماح للزائر». إظهار حقول الزر/الستايل فقط حين تؤثر، مع أولوية معلنة.
- Status: ✅ partly — dark tokens now cover the `.tc` hero/finder scope; field description states the scope (home, header, footer). Inner pages get dark styles when they are rebuilt 1:1.

### S3-9 [P2] الهوية العامة لا تصل للبنر وخلفية الصفحة لا تشمل الصفحة
- Where: app/components/layout/ThemeTokens.tsx:82–90; app/styles/04-components/tire-components.scss:5–18; app/styles/04-components/tires.scss:26–30.
- What happens: IDs `tc_color_primary`, `tc_color_on_primary`, `tc_color_dark`, `tc_color_bg`, `tc_color_bg_alt`, `tc_font_ar`, `tc_font_en`, `tc_radius`. ThemeTokens يغيّر tokens لـ.tc-s؛ TireHero يعمل تحت .tc وله --tc-gold/--tc-ink وخط IBM/Archivo وقيم زوايا مستقلة ثابتة. اختيار قالب أحمر/Cairo يبقي بنر الإطار ذهبيًا وبالخط السابق. tc_color_bg لا يغيّر html/body اللذين يبقيان #fff في الوضع الفاتح، بعكس label «خلفية الصفحة». tc_radius أيضًا يقتصر على أنماط محددة ولا يشمل كل بطاقات المحرك.
- Fix idea: مصدر tokens واحد يغذي نطاقات البنر والأقسام وبقية الصفحات، وتطبيق خلفية الصفحة على الجذر. فرّق بين ألوان خاصة بالوسائط يختارها التاجر وبين الهوية العامة؛ حافظ على قيم التصميم الافتراضية.
- Status: ✅ fixed — hero gold button uses --tc-on-primary and a hover derived from the primary; --tc-bg-2 follows tc_color_bg_alt.

### S3-10 [P2] القوالب تتجاوز حقول ألوان ظاهرة، وقالب الأخضر يضع نصًا منخفض التباين
- Where: scripts/tc-settings.cjs:40–53 و:209–210; app/components/layout/ThemeTokens.tsx:35 و:55–59.
- What happens: IDs `tc_preset`, `tc_use_store_color`, `tc_color_primary`, `tc_color_on_primary`, `tc_color_dark`. preset يسبق لون سلة والألوان اليدوية، لكن الشروط لا تخفي الاختيارات التي أصبح تعديلها بلا أثر. كذلك الأخضر #7a9a3a مع #fff يعطي تباينًا حسابيًا 3.23:1؛ أزرار النص العادي بحجم 15px تحتاج 4.5:1، لذلك هذا preset لا يوفر اختيارًا ميسرًا افتراضيًا. لم أشغّل Lighthouse.
- Fix idea: شرح أولوية المصادر وإظهار محرر الألوان عند none فقط، وتعديل نص الأخضر/درجة الخلفية لتحقيق التباين. لا يُعد نجاح build ضمانًا للوصول.
- Status: ✅ partly — default qty hidden for per-set; dark style / install badge text got descriptions (an OR / not-equal condition needs checking in Salla). services-row label and booking badge texts: needs checking.

### S3-11 [P2] الشروط لا تغطي الآباء المعطلين وبعض الحقول غير المؤثرة
- Where: scripts/tc-settings.cjs:208–228; scripts/tc-components.cjs:287–290; scripts/tc/16-install-booking.cjs:28–29.
- What happens: IDs `tc_topbar_phone_where` يعتمد على tc_topbar_phone فقط، الذي تبقى قيمته true عند إطفاء tc_topbar_show؛ حقل أين يظهر الهاتف يبقى منطقيًا مؤهلًا للظهور رغم تعطيل الشريط. لا توجد dependencies لـ`tc_mysize_chip` عند tc_my_size=false، و`tc_install_badge` عند tc_store_type=sale، و`tc_set_price`/`tc_installments` عند tc_sale_unit=set، في `home.services-row → cards.label` الحقل يظهر بوضع photo رغم أنه لا يستخدم فيه؛ `home.install-booking → badge_unit/badge_text` تبقيان بعد إفراغ badge_number.
- Fix idea: جدول اعتماد يشمل جميع الآباء والمعنى الفعلي. اختبر off→on دون خسارة بيانات الحقول المخفية. دعم AND/OR أو استنتاج شروط الأب في مولد tc-settings يحتاج التحقق من محرر سلة قبل تعميمه؛ لا نعتمد على أن إخفاء الحقل الأب يخفي أشقاءه تلقائيًا.
- Status: ✅ fixed — category/brand/products pickers say what shows when nothing is picked, and that some sections show the first 4.

### S3-12 [P2] مكان ظهور المقارنة لا يقيّد درج المقارنة نفسه
- Where: app/components/home/TireGrid.tsx:129; app/components/tires/features/Compare.tsx:51–53 و:123–124.
- What happens: IDs `tc_compare_where`, `tc_compare`. whereClass يطبق على CompareToggle في الشبكة، لكن CompareTray لا يقرأ أين يظهر. زبون اختار منتجات على الكمبيوتر ثم دخل بالجوال يرى الدرج من localStorage رغم اختيار «الكمبيوتر والتابلت».
- Fix idea: تطبيق سياسة الأجهزة على مدخل المقارنة والدرج والحوار، مع إبقاء البيانات المحفوظة إن أراد التاجر. وضّح أيضًا أن المقارنة حاليًا من الشبكة الرئيسية فقط حتى يوحد S3-2 النطاق.
- Status: ✅ fixed — the 6 Raed components removed from twilight.json (no longer offered in the editor); their code stays registered for stores/pages that still render them.

### S3-13 [P2] تعطيل حفظ المقاس لا يوقف الحفظ أو استخدامه بالشريط السفلي
- Where: app/components/home/SizeFinder.tsx:115; app/components/tires/features/MySize.tsx:18–28; app/components/layout/MobileBottomBar.tsx:377 و:429.
- What happens: IDs `tc_my_size`, `tc_mysize_chip`, `tc_bottombar_items=size`. saveMySize يُستدعى دون التحقق من tc_my_size. useMySize يقرأ التخزين حتى عندما الميزة معطلة، والشريط السفلي يستعمله لفتح البحث المحفوظ. الإطفاء يخفي الشريحة/العلامة لكنه لا يطفئ سلوك «يتذكر المقاس» المعلن.
- Fix idea: بوابة تمكين واحدة حول الحفظ والقراءة والاستخدام؛ عند الإطفاء يقود زر المقاس للأداة دون الاعتماد على قيمة محفوظة. لا تمسح اختيار العميل إلا بسياسة صريحة.
- Status: ✅ fixed — 44px hit areas: forget-size button, social links; compare remove button 28px + invisible 44px hit area.

### S3-14 [P2] الشريط السفلي معلن للتابلت لكنه مخفي عليه
- Where: scripts/tc-settings.cjs:150; app/components/layout/MobileBottomBar.tsx:118; app/styles/04-components/mobile-bottom-bar.scss:18.
- What happens: ID `tc_bottombar` label «الجوال والتابلت»، بينما CSS md:hidden والمراقبة max-width:767؛ عند 768–1100 لا يظهر الشريط. الأجهزة العامة في devices.ts تعرف التابلت ضمن هذا المجال.
- Fix idea: إما تسمية «الجوال» مطابقة للتصميم الحالي، أو خيار أجهزة فعلي مع تعديل الهوامش ورفع أشرطة المنتج بالتزامن. لا تغير breakpoint التصميم افتراضيًا دون قرار.
- Status: ✅ fixed — size-finder default and popular fields have exact help text (numbers only, no R, comma-separated, up to 6).

### S3-15 [P2] بيع فقط لا يخفي جميع عروض التركيب المعلنة
- Where: scripts/tc-settings.cjs:78–79; app/components/tires/features/cardSettings.ts:40–42; app/components/home/ServicesBento.tsx:48–55; app/components/layout/TcHeader.tsx:77–78.
- What happens: IDs `tc_store_type=sale`, `tc_topbar_text`, `tc_footer_about`; مكوّنات `home.services-bento → big_*`, `home.services-row → cards`, و`home.double-banner → dark_*`. useSellsFitting يستخدم فقط في InstallBanner/InstallCenters/InstallBooking. الأزرار والبطاقات الأخرى تعرض عروض وروابط التركيب وتبقى فعالة؛ النص التعريفي يقول إن نوع المتجر يخفي أقسام التركيب. تعديل النصوص ممكن لكنه لا يطفئ كل بطاقة منفردة.
- Fix idea: تعريف دقيق لنطاق نوع المتجر، ومفاتيح إظهار لخدمات/بطاقات التركيب المختلطة، وربطها بسياسة sale. لا تعتبر كل خدمة «تركيب» تلقائيًا؛ التاجر يحددها. هذه مشكلة وعد/تحكم، وليست اعتراضًا على محتوى قابل للتعديل.
- Status: ✅ fixed — tc_footer_brand switch; the brand column and the contact column disappear when empty.

### S3-16 [P2] النوافذ المفعلة تترك التنقل والتركيز خارج الحوار
- Where: app/components/layout/TcExtras.tsx:171–175; app/components/tires/features/Compare.tsx:140–147; app/styles/04-components/tc-theme-ui.scss:80–82; app/styles/04-components/mobile-bottom-bar.scss:18.
- What happens: IDs `tc_popup_show`, `tc_popup_where`, `tc_compare`, `tc_bottombar`. Popup/Compare يضعان aria-modal وautoFocus بلا حجز/إعادة تركيز أو inert/قفل تمرير؛ Tab يمكنه متابعة عناصر خلف الحوار. z-index الحوار=90 مقابل الشريط السفلي=220، فيبقى الشريط فوق نافذة الخصم على الجوال، ويمكن الانتقال من وراء حوار معلن modal. مثبت بالتركيب والقواعد؛ لم أدّعِ اختبار لوحة مفاتيح حي.
- Fix idea: استعمال أداة useDialogFocus الموجودة أو dialog موحد مع trap/restore/scroll lock، ووضعه فوق عناصر التنقل أو تعطيلها أثناء الفتح. اختبر Escape وTab والعودة لمصدر الفتح.
- Status: ✅ fixed — ProductGallery fallback is contain, same as the setting default.

### S3-17 [P2] الاشتراك بالفوتر مختلف عن مكوّن النشرة ولا يوضح متابعة الطلب
- Where: scripts/tc-settings.cjs:200–201; app/components/layout/TcFooter.tsx:67–79; scripts/tc/23-newsletter.cjs:12–14.
- What happens: IDs `tc_footer_news`, `tc_footer_news_link` مقابل `home.newsletter → mode/signup_link/store_email`. الفوتر يفتح رابطًا/برنامج بريد دون أي رسالة عند فشل فتح التبويب أو توضيح أن الاشتراك يُستكمل هناك، بينما مكوّن النشرة لديه status لذلك. ربط أحدهما بخدمة لا يربط الآخر؛ التاجر يضبط مكانين لنفس المهمة. store_email في مكوّن النشرة يبدأ info@example.com كقيمة فعلية لا placeholder؛ الانتقال لوضع البريد قد يرسل الطلب لهذا المثال بدل بريد المتجر.
- Fix idea: مرجع اشتراك عام يمكن للمكوّن تجاوزه بوضوح، واستخدام نفس معالجة متابعة/تعذر فتح الخدمة. اجعل البريد فارغًا مع fallback موثق لبريد المتجر أو مثال placeholder. لا تضف نظام نشرات backend ولا تأكيد اشتراك غير حاصل.
- Status: open.

### S3-18 [P2] أربعة إعدادات موروثة لا تغير الواجهة المستخدمة
- Where: twilight.json:2499 و:2533 و:2541 و:2657; app/components/home/EnhancedSquareBanners.tsx:39 و:92; app/components/home/FixedProducts.tsx:21.
- What happens: IDs `squar_photo_bg_image_size`, `vertical_fixed_products`, `is_more_button_enabled`, `imageZoom`. لا تقرأ الثلاثة الأولى/الأخير ملفات app. المحرك يقرأ is_more_button_enabled في MainMenu فقط، لكنه غير مركّب بالهيدر الجديد الذي يستخدم HeaderNav. الصور المربعة تستخدم bg-cover ثابتًا، وFixedProducts يقرأ data.is_vertical وليس الإعداد العام؛ ProductGallery يفتح preview ولا يقرأ imageZoom. كانت قراءة المحرك لـnotify_when_available_in_card سببًا لاستبعاده من قائمة الإعدادات المعطلة.
- Fix idea: وصل الخيارات الفعلية أو احذف الحقول غير المدعومة مع خطة ترحيل وعدم خسارة إعدادات التجار. لا تترك اختيار Contain أو zoom بلا أثر.
- Status: open.

### S3-19 [P2] ثقة الفوتر تقرأ إعدادًا أزيل من JSON
- Where: scripts/tc-settings.cjs:243; app/components/layout/Footer.tsx:123; app/components/layout/TcFooter.tsx:142.
- What happens: ID read `theme.settings.footer_is_dark` لا يوجد في settings[] بعد REMOVED، لكنه مستهلك حي داخل FooterTrust الذي يستدعيه TcFooter. لا يُمرر dark لشارات الثقة رغم الفوتر الداكن/الوضع الداكن. توجد قراءات موروثة أخرى بلا تعريف لكنها في Header/Footer القديمين غير المركبين، موثقة أدناه ولا تُعد أعطالًا حية.
- Fix idea: استنتاج dark من هوية الفوتر الفعلية أو تمرير prop واضح لـFooterTrust؛ لا تعيد إعدادًا ميتًا فقط لإرضاء قراءة قديمة.
- Status: open.

### S3-20 [P2] حقول وإعدادات مشتركة ناقصة في المكونات الموروثة المتاحة
- Where: twilight.json:14220; app/components/home/MainLinks.tsx:57; app/router.tsx:50–54; scripts/tc-fields.cjs:40–46.
- What happens: ID `home.main-links → merge_with_top_component` بينما المستهلك يقرأ merge_links_with_top_component؛ اختيار الدمج لا يصل إليه. ستة home components موروثة ما زالت معرفة/متاحة: enhanced-slider/main-links/slider-products-with-header/enhanced-square-banners/brands/custom-testimonials؛ كلها لا تعرف `show_mobile`, `show_desktop`, `space_top`, `space_bottom`, `custom_class`, `tc-cover` كالـ23 المخصصة. قاعدة «كل مكوّن» ليست متحققة على جميع المعروضات. لا يجوز افتراض أن metadata position/is_repeated حقول تاجر ناقصة؛ هي بيانات محرك.
- Fix idea: توحيد id الدمج أو adapter له، وتحديد هل هذه الستة جزء من الثيم المعروض للتاجر؛ إن نعم، وفر التحكم المشترك عبر wrappers/fields مناسبة دون تغيير تصميمها. تحقق من دعم المحرر والتحديث قبل إزالة مكوّن سبق استخدامه.
- Status: open.

### S3-21 [P3] الهوية تبدأ بتفاصيل كثيرة وبعض التسميات لا تشرح نطاقها
- Where: scripts/tc-settings.cjs:37–59 و:110 و:190; scripts/tc-fields.cjs:46.
- What happens: IDs `tc_color_on_primary`, `tc_radius`, `tc_pattern`, `tc_loader_show`, `tc_brand_sub`, `tc_footer_news_link`, والمشترك `custom_class`. الهوية أولًا تشمل نمطًا/loader/ألوانًا قبل قرار وحدة البيع والمصدر؛ «الهيدر/الفوتر/السوشال» مصطلحات يمكن توضيحها «رأس المتجر/أسفل المتجر/حسابات التواصل». نصوص التاجر القابلة للعرض كلها multiline-aware حسب الحاجة؛ EN maps تغطي الافتراضيات المستخدمة في ملفات layout، لكن عناوين مجموعات المحرر والمساعدة والخيارات نفسها عربية فقط. دعم ترجمة labels للوحة إنجليزية يحتاج تحقق؛ لا أعده رفضًا مؤكدًا من سلة.
- Fix idea: إعداد أول يوم مختصر، والمظهر المتقدم منفصل، ونص مساعدة يحدد النطاق والأولوية والفراغ. إبقاء custom_class تحت «للمطورين». لا تحذف الحقول المطلوبة بالمواصفات لمجرد كثرتها.
- Status: open.

### S3-22 [P3] إعداد طي الفوتر في مجموعة الجوال بدل أسفل المتجر
- Where: scripts/tc-settings.cjs:157; app/components/layout/TcFooter.tsx:40–45.
- What happens: ID `tc_footer_accordion` يظهر بعيدًا عن إعدادات الفوتر. عند تفعيله تتحول h4 لأزرار قابلة للتركيز حتى على الكمبيوتر، بينما الطي CSS خاص بالجوال؛ الضغط على عنوان الكمبيوتر لا يغيّر نتيجة مرئية.
- Fix idea: انقله إلى مجموعة الفوتر بعنوان «طي الأعمدة على الجوال»، واجعل semantics التفاعلية تتبع breakpoint، مع عدم اختلاف hydration الأولي.
- Status: open.

### S3-23 [P2] الإعدادات القديمة تبدو جزءًا من الفوتر وتحتاج توزيعًا وظيفيًا
- Where: twilight.json:2473–2657; scripts/tc-settings.cjs:245–246.
- What happens: IDs `squar_photo_bg_image_size`, `vertical_fixed_products`, `is_more_button_enabled`, `product_show_breadcrumbs`, `product_index_show_breadcrumbs`, `enable_add_product_toast`, `notify_when_available_in_card`, `sticky_add_to_cart`, `product_bottom_nav_rounded`, `show_tags`, `slider_background_size`, `imageZoom` تُضاف بعد «أسفل الفوتر» دون عنوان مجموعة جديد. يوحي الترتيب أن الوسوم وصور المنتج والإضافة إعدادات للفوتر، ويصعب العثور عليها. أربعة منها بلا أثر أصلًا حسب S3-18.
- Fix idea: حذف غير المستخدم، ونقل المنتج/الصور لمجموعة «صفحة المنتج»، الإشعار للسلة، التنبيه للبطاقة، breadcrumb القوائم للتصنيف والبحث، وشكل التنقل للجوال. قرارات الـ12 بالتفصيل في الجدول أدناه.
- Status: ✅ fixed — the 8 kept base settings sit under the title «صفحة المنتج والقوائم»; the 4 dead ones were removed.

### S3-24 [P2] إطفاء الشريط السفلي يترك شريط شراء المنتج مرتفعًا
- Where: app/components/layout/ThemeLayout.tsx:82; app/styles/04-components/mobile-bottom-bar.scss:221–226; app/styles/04-components/tc-theme-ui.scss:193–197.
- What happens: IDs `tc_bottombar`, `sticky_add_to_cart`. عندما bottombar=false يختفي التنقل وتعود الأزرار العائمة ودرج المقارنة للأسفل بقواعد tc-nobar، لكن شريط شراء المنتج يبقى bottom=76px+safe-area بقاعدة !important، وbody يبقى محجوزًا له 76px إضافية. إخفاء الشريط لا يعيد كامل تخطيط المنتج لحالته. كذلك tc-nobar يتطلب boolean false حرفيًا، بينما MobileBottomBar يقبل string 'false' عبر asBool؛ هذا الفرع اختلاف مؤكد بالكود، وشكل payload سلة يحتاج checking.
- Fix idea: ربط مساحة الشريط ورفع شريط الشراء بمصدر boolean موحّد أو CSS variable؛ إطفاؤه يعيد شريط الشراء إلى safe-area فقط ويزيل مساحة التنقل مع الحفاظ على مساحة الشراء نفسه.
- Status: ✅ fixed — see second-pass S3-6: body.tc-nobar from one asBool source; the product buy bar drops to the safe area.

### S3-25 [P3] أهداف ضغط صغيرة في المقاس والتواصل والمقارنة
- Where: app/styles/04-components/tc-theme-ui.scss:35 و:41 و:77.
- What happens: IDs `tc_mysize_chip`, `tc_footer_social`, `tc_compare`. زر نسيان المقاس بعرض 30px، روابط التواصل 38×38px، حذف إطار من المقارنة 20×20px. هذه أقل من هدف 44px المطلوب في نطاق المراجعة، ويصعب ضغط الحذف على الجوال. قراءة CSS فقط؛ لا تُحوَّل هذه القيم وحدها إلى ادعاء فشل Lighthouse أو WCAG شامل.
- Fix idea: مساحة ضغط فعلية لا تقل عن 44×44px مع إبقاء حجم الأيقونة وشكل التصميم المرئي، ومنع تداخل hit areas المجاورة.
- Status: ✅ fixed — see second-pass S3-13.

### قائمة الإعدادات بلا تأثير مقابل القراءات بلا تعريف

| النوع | IDs | الدليل والتفسير |
|---|---|---|
| لا قراءة أصلًا | `tc_warranty` | S3-5؛ ليس static، بل حقل إدخال بوعد ظاهر. |
| تُقرأ لكن الناتج غير مستخدم | `tc_cols_d`, `tc_cols_t`, `tc_cols_m` | S3-6؛ CSS variables ليست دليلًا على وجود consumer فعلي. |
| موروثة بلا أثر بالواجهة الحالية | `squar_photo_bg_image_size`, `vertical_fixed_products`, `is_more_button_enabled`, `imageZoom` | S3-18؛ is_more يُقرأ داخل محرك غير مستخدم هنا. |
| قراءة عبر المحرك صحيحة | `notify_when_available_in_card` | dist/chunk-6YIAULAP.js:44، عبر EngineProductCard في صفحات القوائم. ليس إعدادًا ميتًا، لكنه لا يغطي البطاقات المخصصة. |
| قراءة موجودة وتعريف موجود | `product_show_breadcrumbs`, `product_index_show_breadcrumbs`, `enable_add_product_toast`, `sticky_add_to_cart`, `product_bottom_nav_rounded`, `show_tags`, `slider_background_size` | تتبعت ملفات ProductPage/ProductListPage/hooks/MobileBottomBar/ProductGallery. شكل dropdown الخاص بـslider_background_size لا يُطبّع هنا؛ المحرك يستعمل العقد نفسه، لذلك قبول الشكل الفعلي يحتاج اختبار payload سلة ولا أثبته من قيمة تعريف JSON. |
| قراءة حية بلا تعريف محلي | `footer_is_dark` | S3-19. |
| قراءات بلا تعريف في layout قديم غير مركب | `header_layout`, `header_is_sticky`, `header_show_store_info`, `footer_layout` | Header.tsx:77/153/154 وFooter.tsx:145؛ ThemeLayout يركب TcHeader/TcFooter. ليست أعطالًا حية؛ نظّفها أو وثّق التوافق. |
| قراءات بلا تعريف قد توفرها منصة سلة | `font`, `product_card_img_ratio` | ThemeTokens.tsx:73 وThemeLayout.tsx:74؛ كلاهما موجود في ThemeSettings للمحرك المثبت. font له أيضًا theme.font موثق بالنوع. مصدر product_card_img_ratio الفعلي من المنصة **يحتاج تحقق**؛ إن لم يُرسل يجب إضافة تعريف محلي أو حذف الوعد. غياب JSON لا يثبت غياب بيانات المنصة. |

لا وجدت أي قراءة `tc_*` بلا تعريف. static titles/tips/covers لا يفترض قراءتها في React؛ دورها شاشة محرر سلة. صور الأغلفة للـ23 المخصصة موجودة، وحقول الظهور والمسافات وcustom_class موجودة وتستخدم Section، باستثناء أن visibility الحالي يجمع التابلت مع الكمبيوتر ولا يعطي خيارًا منفصلًا.

### قرار كل إعداد قديم ومكانه الصحيح

| ID | القرار والمجموعة | تسمية مقترحة / السبب |
|---|---|---|
| squar_photo_bg_image_size | إزالة حتى التنفيذ | لا يُقرأ؛ صور المكونات المربعة تستخدم cover. S3-18. |
| vertical_fixed_products | إزالة حتى التنفيذ | ليس مصدر وضع FixedProducts الحالي؛ لا توهم بإعداد عام. |
| is_more_button_enabled | إزالة | MainMenu الذي يقرأه ليس الهيدر المستخدم. |
| product_show_breadcrumbs | إبقاء → صفحة المنتج | «إظهار مسار التنقل في صفحة المنتج». لا تكرر تحكم المنصة دون توضيح الأولوية؛ needs checking في محرر حي. |
| product_index_show_breadcrumbs | إبقاء → التصنيف والبحث | «إظهار مسار التنقل في قوائم المنتجات». |
| enable_add_product_toast | إبقاء → السلة والإضافة | «إظهار إشعار بعد إضافة المنتج للسلة»؛ المستهلك app/hooks/index.tsx:13. |
| notify_when_available_in_card | إبقاء → بطاقة المنتج | «إظهار أعلمني عند التوفر للمنتجات النافدة»؛ المحرك يقرأه، لكن عممه على البطاقات المخصصة. |
| sticky_add_to_cart | إبقاء → صفحة المنتج | «تثبيت زر الشراء على الجوال»؛ ربط المساحة مع الشريط السفلي S3-24. |
| product_bottom_nav_rounded | إبقاء → الجوال والتنقل | «شريط التنقل بحواف مستديرة في صفحة المنتج»؛ يخفي حقله عند bottombar=false إذا supported. |
| show_tags | إبقاء → صفحة المنتج | «إظهار وسوم المنتج» بدل «اظهار الوسوم» العامة. |
| slider_background_size | إبقاء → صفحة المنتج / الصور | «ملء صور المنتج: كاملة / اقتصاص»؛ تحقق payload dropdown. |
| imageZoom | إزالة حتى التنفيذ | lightbox الحالي لا يقرأه؛ لا تترك مفتاحًا لا يتحكم بالتكبير. |

### تحقق إضافي: الافتراضيات، الأجهزة والتعارضات

- فحص مباشر لـ53 قراءة asBool/opt لإعدادات عامة: لم تظهر مخالفة قيمة افتراضية بينها وبين التعريف. الأرقام المتعلقة بالشعار/الدفعات والـpresets راجعت يدويًا. ليست تغطية لكل قراءة ديناميكية بالمحرك.
- اختلاف افتراضي مؤكد: `slider_background_size` في twilight.json:2623 اختياره contain، بينما ProductGallery.tsx:39 يرجع إلى cover عند غياب القيمة. وحّد fallback مع الإعداد، بعد التحقق من تحويل شكل dropdown عند سلة. لا يعني ذلك أن القيمة المرسلة contain تُتجاهل.
- `where()`: all بلا class، desktop يظهر >1100، wide من 768، narrow حتى 1100، mobile أقل من 768. القيم الخمس موجودة ومطابقة للـCSS عند 375/768/1100/1101 وفق فحص المصدر. لم أجِد mapping خاطئًا؛ S3-12/14 تخص تطبيق السياسة على العنصر لا تحويل القيمة.
- كل parent في DEPS موجود؛ شروط boolean تستخدم boolean، وشروط القوائم تستخدم value موجودًا بخيارات الأب. السلسلة الوحيدة بين إعدادات عامة مشروطة هي topbar_phone_where → topbar_phone → topbar_show؛ الوراثة التلقائية لإخفاء المحرر needs checking. النواقص في S3-11.
- بيع فقط + تركيب مجاني: شارة بطاقة hook تُخفى، و3 أقسام تركيب تستخدم useSellsFitting. الخدمات المختلطة تبقى؛ S3-15. لا أسجل الجزء السليم كعطل.
- `tc_wa_show=true` بلا رقم: العائم لا يظهر وفق validation؛ سلوك سليم. `tc_card_price=ask` بلا رقم يرجع للسعر بدون تنبيه؛ S3-4/2.
- `tc_search_show=false`: form البحث وأيقونة الجوال وSallaSearch كلها مشروطة بنفس searchOn فلا يوجد مستهلك بحث مخفي بالهيدر. طريقة فتح بحث أخرى من إضافة خارجية ليست مثبتة هنا.
- `tc_bottombar=false`: spacing العائم/الدرج يعالج boolean false، لكن رفع شراء المنتج لا يُعاد؛ S3-24. string false اختلاف adapter، وليس إثبات payload حي.
- افتراضيات المحتوى العربية مع multilanguage:true تُترجم افتراضياتها في EN maps بالمستهلكين المستخدمين؛ عدم وجود object {ar,en} في JSON وحده ليس خطأ. tc_warranty غير منفذ أصلًا. labels وعناوين مجموعات المحرر عربية؛ دعم ترجمتها needs checking. make/model في cars بيانات مفاتيح ثابتة، وترجمة أسماء مخصصة تحتاج طريقة عرض منفصلة دون تغيير المعرّف.
- المقارنة البصرية هنا من markup/CSS فقط: final.html:44–47 للشريط، :855–867 للهيدر، وأشكال الأقسام المعتمدة. S3-9/14/24 وقيود ألوان الداكن تؤثر في الاتساق؛ لا توجد لقطة render لكل سيناريو ولا ادعاء مطابقة 100%.

### S3 — Missing settings

هذه اقتراحات مجال تُراجع مع صاحب الثيم؛ لا تتحول جميعها إلى أعطال أو التزام بتنفيذ قبل اعتمادها. IDs المقترحة التالية جديدة وليست ادعاء بأنها موجودة.

| المقترح | المجموعة/النوع/الافتراضي | السبب | الأولوية |
|---|---|---|---|
| توحيد وحدة البيع وتسمية الكمية | الإطارات؛ reuse `tc_sale_unit`/`tc_default_qty` بدل حقول جديدة | يمنع شراء 4 أطقم وحساب سعر طقم غلط | MUST؛ S3-1 |
| الضمان الحقيقي لكل منتج وDOT | صفحة المنتج؛ switches عرض metadata المتاحة + نص شرح؛ افتراضي عرض الموجود فقط | بيانات ضمان وسنة مختلفة لكل إطار؛ لا تختلق API أو موعد صنع | SHOULD؛ مصدر metadata يحتاج تحقق |
| وجهة المقاس عند غياب أداة الرئيسية | التنقل؛ link picker، افتراضي وجهة موجودة | مدخل التسوق الأساسي لا يكون anchor مفقودًا | MUST؛ S3-3 |
| سياسة «اطلب السعر» دون رقم واتساب صالح | البطاقة؛ اختيار/تحقق setup، لا default يعلن خدمة غير مفعلة | منع سعر علني مخالف للضبط، وتوضيح فشل الإعداد | MUST؛ S3-2/4 |
| التحكم بالخدمات المختلطة | كل مجموعة خدمات؛ switches للبطاقات، افتراضي كما التصميم | متجر بيع فقط يستطيع تعطيل بطاقة تركيب دون حذف خدمات أخرى | SHOULD؛ S3-15 |
| مصدر الاشتراك الواحد | التواصل؛ mode + link/email، افتراضي غير مربوط لا يؤكد اشتراكًا | نفس وجهة الفوتر والنشرة دون تكرار ضبط؛ رابط/بريد فقط | SHOULD؛ S3-17 |
| توضيح مراكز الحجز ووقت العمل | التركيب؛ نص مساعدة وتواريخ/أوقات عرض متاحة، WhatsApp/link | الطلب رسالة وليس نظام حجوزات وسعة؛ افتراضي بلا ادعاء تأكيد | SHOULD؛ يحتاج قرار الخدمة |
| بيانات رسوم التركيب/التوصيل | روابط سياسات المتجر/الشحن الموجودة؛ link picker ونص، فارغ | الزبون يعرف شروط الخدمة؛ الأسعار الحقيقية من شحن/خدمات سلة | SHOULD |
| الأربع إطارات للمنتجات المناسبة فقط | البطاقة/المنتج؛ استخدام خيارات أو metadata المتاحة، لا qty عالمي لكل شيء | متجر الإطارات قد يبيع أدوات أو خدمات أو أطقمًا | SHOULD؛ قدرة البيانات تحتاج تحقق |
| حالة مقاس غير متوفر | البحث؛ نص عربي/إنجليزي + وجهة تواصل اختيارية، افتراضي «لا توجد نتائج» | مقاس غير متاح يحتاج بديل أو استفسار لا شاشة تختفي | SHOULD |
| نفاد المخزون موحد | reuse `notify_when_available_in_card` للبطاقات المخصصة | الاشتراك بتوفر المخزون من سلة، لا خدمة backend من الثيم | SHOULD؛ عقد SDK يحتاج تحقق |
| إظهار هوية الفوتر وعمود التواصل | الفوتر؛ switches، افتراضي نعم | إطفاء phone/email/news/city يترك عنوان «تواصل» وعمودًا فارغًا؛ TcBrand دائم أيضًا | SHOULD |
| اختيار أجهزة للهيدر/أسفل المتجر | reuse devices dropdown عند حاجة فعلية؛ افتراضي التصميم | خيارات موحدة بدل وعد «تابلت» غير محقق | NICE؛ S3-14 |
| قياس وصول وأداء للسيناريوهات | QA وليس حقول تاجر جديدة | لا تضف إعداد SEO وهميًا؛ metadata والقياسات من المصادر الفعلية | MUST قبل الإصدار؛ غير مقاس هنا |

إعدادات حساب العميل والسلة والمنتج/التصنيف التفصيلية ضمن المرحلة التالية في HANDOFF؛ عدم تنفيذها بعد لا يجعل كل اقتراح P1 الآن. لا حاجة لحقول تعيد إعدادات المنصة: حماية المحتوى، الأرقام، breadcrumb، «صنع بإتقان»، طرق الدفع والشحن الحقيقية. breadcrumb محلي موجود للصفحتين، ويجب توثيق علاقته بخيار المنصة إن كانا ظاهرين معًا؛ اللقطة الحية لذلك غير متاحة دون شبكة.

### S3 — Per-component gaps

IDs هنا فعلية إلا النصوص الموسومة «مقترح». إضافة حقول تتحكم بالمظهر فقط لا تنشئ خدمة سلة أو backend.


#### home.tire-hero

- الهوية العامة لا تصل إلى نطاقه (S3-9). `image_mode` ومجموعة `slides` تحتاج ترتيب «المحتوى/الوسائط/الزر/الحركة»؛ `slides_interval` مدة البقاء و`slides_speed` مدة الانتقال، وضح الفرق. افتراضيات اختيار قوائم داخل الصفوف تحتاج حفظ/إعادة فتح في سلة؛ لا أثبت خلل serialization هنا.

#### home.size-finder

- `default_width/default_ratio/default_rim` نصوص تُرجع للافتراضي إن أخطأ الإدخال؛ قوائم صالحة أنسب. `popular_widths/popular_ratios/popular_rims` حتى 6 قيم تحتاج تحقق وشرح 22.5. `match_by` يتجاوز العام؛ خيار «حسب إعداد المتجر» مقترح. S3-3/7/13.

#### home.benefits-strip

- `items.icon/title/text`: تسمية «عنوان الميزة/وصفها القصير»، وشرح الحد 2–4 في المجموعة. اسم الأيقونة الافتراضية بالمحرر يحتاج تحقق حفظ حي؛ الصورة السابقة تثبت حالة واحدة فقط.

#### home.tire-slider

- `add_qty` override غير معلن؛ S3-1. `products_source` مع اختيار ناقص يعود افتراضيًا عبر sourceFrom؛ وضح/تحقق الاختيار. `limit` وعدد المختارات يحتاجان سياسة واضحة. إعدادات set/year/compare لا تعمل كلها في هذا النوع رغم الوصف العام.

#### home.brands-marquee

- `brands_source`: وضّح إدارة الشعارات بسلة عند store؛ `brands.name/logo/link` اليدوي لا يحتاج أنواع روابط غير مفيدة للمهمة إلا إن أرادها التاجر. `animate/speed` واضحان بالشروط؛ لا حقل backend ناقص.

#### home.category-cards

- `cards.image/icon`: وضح أولوية الصورة؛ `cards.link` وجهة الفئة، و`cards.highlight` تمييز بصري فقط. عنوان الصف الأدنى وشرح الحدود يساعدان على منع بطاقات ناقصة.

#### home.shop-by-car

- `cars_paste/use_builtin/cars`: المصدر الحالي ذو أولوية غير ظاهرة؛ يرفض صفوفًا بصمت ويصحح سنوات معكوسة. مصدر واضح وقالب استيراد وفحص الصفوف مقترح. لا تضف توصية مصنع مؤكدة دون بيانات ملائمة لفئة السيارة.

#### home.tire-grid

- `columns` محلي مقابل tc_cols* العام دون أولوية؛ S3-6. `products_source/category/brand/selected` تحتاج تحقق اختيار المصدر، و`limit` ليس كل مخزون المتجر. fallback حالات صفر نتائج يحتاج توضيح للتاجر.

#### home.double-banner

- `dark_*` و`light_*`: بطاقة تركيب مختلطة لا يمكن إطفاؤها منفردة؛ switches مقترحة S3-15. `reverse` وضح تأثيره على الجوال والكمبيوتر.

#### home.tire-picker

- `sizes.price/tiers.factor` أسعار يدوية لا تقرأ سعر المنتج المربوط، وتقرب لأقرب 5؛ بيان ذلك لازم. `priorities.tier` مرتبط بموقع الفئة ويحتاج اسم/معرّف ثابت أو تنبيه بعد إعادة الترتيب. لا يستوعب tc_sale_unit الآن.

#### home.services-bento

- `calc_min/calc_max`: علاقة أعلى>أدنى غير متحققة ويصحح الكود الأعلى؛ تحقق ومدى مساعد. `calc_parts/calc_providers` تقدير/نص وليسا تفعيل دفع. `big_*/small_*/fleet_*` تحتاج switches للخدمات المختلطة S3-15.

#### home.ticker

- `items.text/link/number`: توضيح أن الأرقام تتبع ترتيب الصفوف، وأن غياب الرابط يجعل العنصر نصًا. `speed/pause_on_hover` منطقية؛ لا حاجة لأجهزة لكل صف إلا طلب فعلي.

#### home.services-row

- `cards.art` يحدد الحقول المؤثرة؛ `cards.label` مخفي في photo (S3-11). `cards.title` فارغ يخفي بطاقة، بينما الحقل اختياري؛ شرح/تحقق. نوع خدمة/إظهار بطاقة مستقل مقترح.

#### home.install-banner

- `image/caption/caption_ar` تسميات موضعية، وليست لغتين بديلتين؛ وضّح ذلك. `steps` نصوص خطوات لا تأكيد تركيب فعلي. نوع المتجر يخفيه بالفعل.

#### home.install-centers

- `centers.open_now` يدوي غير محسوب من `hours`؛ وصف صريح. `name` فارغ يخفي المركز، وmap_link/book_link غيابهما يخفي الزر؛ هذه المساعدة موجودة وجيدة. إظهار صورة/دوام مستقل NICE.

#### home.install-booking

- `day_1/day_2/day_3` تسميات اليوم+1/+2 وليست أيام حجز يحددها التاجر؛ منع الالتباس. `slots.time` تحقق 24 ساعة موجود؛ `booking_mode/whatsapp/book_link` طلب خارجي، لا سعة/تأكيد. شروط شارة بادج S3-11.

#### home.call-strip

- `phone` يجب أن يذكر الصيغة ودعم رمز الدولة؛ الفراغ يخفي الزر بالفعل. لا تخلطه مع رقم واتساب؛ reuse رقم المتجر المقترح موثق الأولوية.

#### home.steps

- `steps.icon/title/text`: بيان الترقيم حسب السحب. حدود 2–4 واضحة بالمقدمة؛ تحقق عنوان صف موجود، وتحقق default القوائم الحي عند التطبيق.

#### home.lineup

- `products_selected` يسمح 16 ويعرض 4؛ حد خاص بالمكوّن أو وصف عند الحقل. تجاهل ask-price ووحدة البيع S3-1/2. `show_type` موجود ويعمل.

#### home.reviews

- `source` manual/store أوله مناسب؛ مصدر store يعتمد تقييمات سلة الحقيقية. `reviews.text` فارغ يستبعد الصف بلا تنبيه. لا تضف «موثق» لرأي يدوي دون دليل؛ `limit` وضح قصّ القائمة/مصدر الجلب.

#### home.blog

- `limit` و`all_link`: المصدر آخر مقالات سلة، وضح أن إدارة المقالات خارج المكوّن. لا حقول لكتابة مقال وهمي؛ empty-state مقترح في المعاينة.

#### home.faq

- `items.q/a` اختياريان لكن العرض يتطلب كليهما؛ شرح/تحقق صف كامل. `open_first` موجود. سياسة إخفاء النص الذهبي تتبع مسح title_2 وهو مدعوم عبر makeT، وليس غياب switch عطلًا بذاته.

#### home.newsletter

- `mode/signup_link/store_email`: أصلح المثال كبريد فعلي S3-17 ووحّد الربط مع الفوتر. fields للـnewsletter backend غير مناسبة للثيم؛ خدمة خارجية أو mailto فقط.

#### home.enhanced-slider

- ينقصه المشترك والغطاء؛ S3-20. `slides.image/title/description/without_overlay` تُراجع في wrapper الحالي؛ النصوص resolved من المحرك، اختبار {ar,en} الحي يحتاج تحقق.

#### home.main-links

- `merge_with_top_component` لا يطابق id المستهلك؛ S3-20. `show_cats/categories/links` شروط موجودة. يلزمه المشترك إذا بقي ضمن الثيم.

#### home.slider-products-with-header

- `background/title/description/products/display_all_url`: السورس يدوي واضح؛ ينقص المشترك والتحكم بصورة الخلفية إذا بقي ضمن الثيم، S3-20.

#### home.enhanced-square-banners

- `banners.image/url/title/description`: crop ثابت رغم `squar_photo_bg_image_size` العام؛ S3-18. غطاء/مشترك ناقص، S3-20.

#### home.brands

- `title/brands`: مكوّن محرك مع قائمة ماركات؛ ليس بلا مستهلك لمجرد غياب ملف باسم Brands. يلزمه المشترك/الغطاء إن بقي متاحًا؛ مختلف عن brands-marquee ويحتاج شرح فرق الشكل للتاجر.

#### home.custom-testimonials

- `items.name/avatar/stars/text` تمر إلى TestimonialsCarousel، لذا ليست ميتة رغم عدم قراءتها مباشرة بالملف. ينقص الغطاء/المشترك؛ وضّح الفرق عن reviews المصدر الحقيقي.

### S3 — Proposed final group order

1. **أساس متجر الإطارات:** نوع المتجر، وحدة البيع، كمية الإضافة، مكان المقاس/السنة، الضمان؛ إعداد أول يوم.
2. **الهوية:** قالب أو لون سلة أو يدوي بأولوية واحدة، الخطوط؛ التفاصيل والزوايا والنقشة متقدم.
3. **رأس المتجر والشريط العلوي:** النص والوجهة، الشعار، البحث، التنقل، زر المقاس؛ الدمج في مجموعة رئيسية مع عناوين فرعية.
4. **بطاقات المنتجات والتسوق:** السعر/طلب السعر، البيانات، الكمية والمقارنة والمقاس المحفوظ؛ الأعمدة تحت «عرض القوائم» بعد تنفيذها.
5. **الجوال والتنقل:** الشريط السفلي وأجهزته؛ إخفاء الاختيارات غير المؤثرة.
6. **التواصل والحملات:** الرقم المشترك، العائم، الاتصال، الخصم والاشتراك؛ إعدادات يومية.
7. **أسفل المتجر:** الهوية والنبذة والأعمدة والتواصل والطي والدفع والثقة.
8. **المظهر المتقدم:** الداكن مع تعريف صريح للسلوك، loader والنقشة؛ custom_class ضمن المكوّنات للمطورين.

### S3 — Remove or merge

الدمج/الحذف المقترح: إزالة الأربعة الموروثة غير المستخدمة أو وصلها؛ دمج وجهة الاشتراك وأرقام التواصل؛ عدم تكرار عدد دفعات عام مع حاسبة محلية دون override معلن؛ نقل tc_footer_accordion للفوتر. لا تضف مفاتيح لكل زينة صغيرة إذا كان مسح النص يخفيها بالفعل؛ كل عنصر وظيفي مستقل يجب أن يملك طريقة إخفاء مفهومة.

### S3 — Suggestions

اختبر payload سلة والحفظ وإعادة الفتح والشروط المتسلسلة دون مسح قيم مخفية؛ Arabic/English؛ بيع طقم مقابل حبة وكمية 1/4؛ ask-price برقم/بدون رقم وعبر الرئيسية/التصنيف/البحث؛ المصدر tags/options للمقاس والسنة؛ الأجهزة 375/768/1100/1101؛ off/auto/on مع اختيار محفوظ؛ المقارنة والخصم مع لوحة مفاتيح وشريط الجوال. افحص Lighthouse على الصفحات الفعلية بعد ذلك؛ هذه الجولة لا تمنح نتيجة أداء/وصول مقاسة. صور الإصدار تحتاج ترخيصًا تجاريًا، مع أغلفة وديمو إطارات عند مرحلة النشر، كما تنص ملاحظات المشروع.




## Settings & UX review — round S3 — 2026-10-06

**Scope / commit:** f6c04cb4e6e65268cefa526a42ac05a69412f994. إعادة مراجعة بعد إصلاحات Claude، وليست التقرير السابق على 2bde35f. الترقيم S3-1… محلي لهذه الإضافة؛ استشهد بالـcommit والعنوان لتجنب الخلط مع الأقسام السابقة. بقي HEAD ثابتًا أثناء الفحص؛ الملف غير المتتبع playwright.config.ts موجود قبل المراجعة. لم أعدل مصدرًا أو أشغّل شبكة/سيرفر أو شراء. قرأت قواعد المشروع ومهارتي salla-twilight-review وsalla-tires-theme، التعريفات والمولدات والمستهلكين والمحرك المثبت. المقارنة البصرية من المصدر، وليست لقطات متصفح أو شهادة مطابقة بكسلات.

**Checks:**

| الفحص | النتيجة |
|---|---|
| pnpm.cmd typecheck | exit 0 — ناجح |
| pnpm.cmd build | exit 1 قبل البناء: EPERM لكتابة node_modules/.vite-temp/vite.config.ts.timestamp-*.mjs |
| pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes | exit 1 قبل تشغيل الاختبارات: EPERM لكتابة node_modules/.vite-temp/vitest.config.ts.timestamp-*.mjs؛ لم تنفذ اختبارات |
| مسبار TireSlider الفعلي بعد transpile، مع mocks للبيانات والواردات ودون API | useCardSettings يُستدعى 0 مرة أثناء loading، ومرة بعد ظهور المنتجات؛ دليل ترتيب hooks في S3-1، وليس اختبار متصفح |
| حصر settings وتعريفات الشروط وUUIDs | 104 حقول إدخال عامة؛ لا tc_* مقروء بلا تعريف؛ لا parent مفقود بالشروط العامة/المكونات؛ UUIDs صحيحة، دون تكرار field IDs داخل نطاق المكوّن |
| مقارنة defaults لـ 60 استدعاء مباشر asBool/opt لإعدادات عامة | لا اختلاف؛ لا تشمل كل قراءة رقمية أو ديناميكية. fallback صور المنتج مختلف: S3-16 |
| فحص تباين حسابي لألوان زر البنر | الأحمر مع #221800 = 3.43:1، الأزرق = 3.17:1؛ S3-9. ليس تقرير Lighthouse |

البناء والاختبارات محجوبان بصلاحيات بيئة الفحص، وليس دليل فشل كود. التزمت بحد الكتابة المطلوب للملفين ولم أطلب كتابة cache أو dist. المحرر الحي، أشكال payload الفعلية، الوصول ≥90 والأداء ومطابقة 375px بالصور **needs checking**؛ لم أستخدم شبكة للتحقق من قواعد سلة المتغيرة. المراجع الرسمية ذات الصلة: https://docs.salla.dev/twilight-engine/twilight-json وhttps://docs.salla.dev/twilight-engine/technical-review؛ ليست مصادر جرى جلبها هذه الجولة.

**Summary:** 2 P1، 10 P2، 4 P3.

1. سلايدر المنتجات يغيّر ترتيب hooks بعد التحميل.
2. «اطلب السعر» يكشف السعر في العرض الأفقي والتشكيلة المختصرة.
3. وحدة البيع/الكمية/تسمية الإضافة ما زالت تختلف بين أنواع البطاقات.
4. إطفاء واتساب العائم يخفي الرقم المشترك رغم احتياج أزرار أخرى له.
5. سطر العلامة بالفوتر يبقى ظاهرًا لكن حقله مخفي عند اختيار شعار المتجر.
6. إطفاء الشريط السفلي يترك زر شراء المنتج مرفوعًا 76px.
7. طي الفوتر يعطي الكمبيوتر زرًا يعلن حالة مغلقة بينما المحتوى ظاهر.
8. الوضع الداكن يغطي .tc-s دون بقية أجزاء المتجر.
9. لون النص فوق اللون الرئيسي لا يصل إلى زر البنر؛ القوالب تغيّر خلفيته وحدها.
10. حقول غير مؤثرة تبقى ظاهرة في أوضاع مختلفة، والمصدر الناقص يعرض منتجات بديلة بصمت.

### S3-1 [P1] سلايدر المنتجات يغيّر ترتيب React hooks
- Where: home.tire-slider → products_source; app/components/home/TireSlider.tsx:41 و:61 و:67; app/components/tires/features/cardSettings.ts:16.
- What happens: useCardSettings يقع بعد return لحالتي التحميل/الفشل وبعد رجوع القائمة الفارغة. عند انتقال loading إلى منتجات يزيد عدد hooks، لأن hook الإعدادات يستدعي useTwilight/useLang/useParams. المسبار شغّل الدالة الفعلية بواردات mock: 0 استدعاء ثم 1. قواعد hooks مخالفة مؤكدة؛ لا يدحضها SSR لكل حالة منفصلة.
- Fix idea: استدعاء useCardSettings مع بقية hooks قبل أي return، ثم اختبار انتقال التحميل إلى النجاح/الفشل بالقائمة الحقيقية المعزولة.
- Status: open

### S3-2 [P1] سياسة طلب السعر والمفضلة لا تطبق على كل طرق العرض
- Where: tc_card_price, tc_card_fav; app/components/product/ProductCard.tsx:53 و:64 و:83; app/components/product/ProductListPage.tsx:354; app/components/home/Lineup.tsx:71; node_modules/@salla.sa/twilight-theme-engine/dist/chunk-6YIAULAP.js:193.
- What happens: sync يرجع إذا لم يجد .s-product-card-vertical؛ التحويل إلى list يستخدم horizontal، فيبقى السعر والقلب الأصليان، بينما زر الإضافة يُخفى ويغيب رابط طلب السعر. Lineup لا يقرأ useCardSettings ويعرض السعر دائمًا. اختيار التاجر «اطلب السعر» برقم صالح لا يمنع كشفه عبر هذه المسارات. كما أن إخفاء السعر بالبطاقة العمودية يبدأ في effect بعد عرض EngineProductCard؛ ليس منعًا لوجود السعر في SSR.
- Fix idea: سياسة عرض موحدة بكل layouts وبـLineup، وحالة السعر/القلب/الإضافة محسوبة في renderer بدل معالجة العمودي فقط بعد mount. وضّح إن كان الإعداد مجرد عرض وليس سرية بيانات.
- Status: open

### S3-3 [P2] وحدة البيع والكمية غير متسقتين بين البطاقات
- Where: tc_sale_unit, tc_default_qty; home.tire-slider → add_qty; app/components/home/Lineup.tsx:71; app/components/home/TireSlider.tsx:29 و:68 و:133; app/components/product/ProductCard.tsx:81; scripts/tc-settings.cjs:80; scripts/tc-components.cjs:43.
- What happens: Lineup يسمي السعر /حبة حتى عندما السعر لطقم. السلايدر يعرض نص «أضف 4 إطارات» حسب add_qty، لكن يضيف 1 عند perSet. كمية tc_default_qty لا تُمرر إلى EngineProductCard/زر المحرك بالقوائم؛ السلايدر يستعمل كمية محلية دون شرح الأولوية. المتجر نفسه يعطي نتائج مختلفة من زر أضف بحسب موضعه.
- Fix idea: تسمية الطقم صراحة وتطابق النص مع الوحدة المضافة؛ تحديد نطاق tc_default_qty بعنوان/مساعدة أو تطبيقه بكل الأزرار المدعومة؛ add_qty بعنوان «تجاوز كمية المتجر لهذا القسم» مع خيار استخدام إعداد المتجر.
- Status: open

### S3-4 [P2] الرقم المشترك مخفي خلف مفتاح الزر العائم
- Where: tc_wa_number, tc_wa_show, tc_card_price, tc_bottombar_items; scripts/tc-settings.cjs:165 و:226; app/components/layout/contact.ts:16; app/components/layout/MobileBottomBar.tsx:380.
- What happens: وصف الرقم يقول «لكل أزرار واتساب»، لكن conditions تخفيه عند tc_wa_show=false. الرقم يظل مستخدمًا لطلب السعر وشريط واتساب السفلي، فلا يستطيع التاجر تعديله وهو مطفئ الزر العائم.
- Fix idea: نقل الرقم إلى «التواصل — رقم واتساب مشترك» مستقل عن مفتاح العائم؛ إبقاء رسالة العائم ومكانه مشروطين بمفتاحه. أما install-booking → whatsapp فله رقم مستقل حاليًا: وضح الأولوية أو اجعل الفراغ يرث المشترك.
- Status: open

### S3-5 [P2] إعداد السطر تحت العلامة مخفي رغم ظهوره بالفوتر
- Where: tc_brand_sub, tc_logo_mode; scripts/tc-settings.cjs:114 و:222; app/components/layout/TcHeader.tsx:44 و:45; app/components/layout/TcFooter.tsx:83.
- What happens: TcBrand footer يمنع استعمال شعار المتجر دائمًا ويعرض علامة الإطار + الاسم + tc_brand_sub. اختيار tc_logo_mode=store يخفي حقل السطر، لكنه يبقى ظاهرًا بالفوتر، فلا يمكن مسحه من نفس وضع الإعداد.
- Fix idea: اجعل نطاق اختيار الشعار واضحًا «شعار رأس المتجر»، وحقل سطر الفوتر مستقل/متاح؛ أو طبّق وضع العلامة المشترك على الفوتر مع شروط مطابقة للاستخدام.
- Status: open

### S3-6 [P2] إطفاء شريط الجوال لا يعيد موضع شراء المنتج
- Where: tc_bottombar, sticky_add_to_cart; app/styles/04-components/mobile-bottom-bar.scss:222 و:226; app/styles/04-components/tc-theme-ui.scss:196; app/components/layout/ThemeLayout.tsx:82.
- What happens: .tc-nobar يعيد العائم ودرج المقارنة، لكن bottom:calc(76px + safe-area)!important لشريط شراء المنتج واحتياطي body يبقيان نافذين عند إطفاء الشريط السفلي. ينتج فراغ 76px في صفحة المنتج. كذلك class يستخدم ===false بينما MobileBottomBar يستخدم asBool؛ اختلاف "false" يحتاج checking لشكل payload الحي.
- Fix idea: شرط واحد محسوب بـasBool، ومتغير ارتفاع الشريط يساوي صفرًا عند إطفائه ويستخدمه شراء المنتج/الاحتياطي/العائم/المقارنة مع safe-area.
- Status: open

### S3-7 [P2] طي الفوتر يعلن حالة لا تطابق الكمبيوتر
- Where: tc_footer_accordion; app/components/layout/TcFooter.tsx:40 و:44; app/styles/04-components/tc-theme-ui.scss:183.
- What happens: نقل الحقل للفوتر تم، لكن h4 يبقى role=button وtabIndex=0 وaria-expanded=false على الكمبيوتر، حيث CSS يعرض محتواه دائمًا. النقر يغيّر الحالة المعلنة ولا يطوي المحتوى. تجربة لوحة المفاتيح/القارئ تعلن «مغلق» لعمود مفتوح.
- Fix idea: فصل عنوان ثابت للكمبيوتر عن زر طي الجوال، مع controls/id واضحين وحالة مطابقة، دون اختلاف SSR الأولي.
- Status: open

### S3-8 [P2] الوضع الداكن يغطي نطاقًا محدودًا رغم تسميته إعداد المتجر
- Where: tc_dark_mode, tc_dark_style; app/styles/04-components/tc-dark.scss:18; app/styles/04-components/tire-components.scss:7; app/components/home/tc/Section.tsx:14; app/components/product/ProductListPage.tsx:301.
- What happens: dark overrides تخص .tc-s، بينما Hero/SizeFinder يستعملان .tc ضمن Section scoped=false، وصفحات القوائم/المنتج لا ترث هذه tokens. خلفية body تتحول داكنة مع بقاء ألوان أجزاء وأسطر/حقول بقيمها الفاتحة/الداكنة الثابتة. off/on logic اتصلح، لكن وعد «المتجر داكن» أوسع من تغطية CSS.
- Fix idea: مصفوفة tokens تشمل .tc وصفحات المتجر والمحرك، والتحقق البصري فاتح/داكن عند 375 والكمبيوتر؛ أو تضييق نطاق الإعداد بوضوح لحين إتمامه. لا توجد نتيجة وصول مقاسة لهذه الحالة.
- Status: open

### S3-9 [P2] لون النص الرئيسي والقوالب لا يصلان إلى زر البنر
- Where: tc_color_on_primary, tc_preset; app/components/layout/ThemeTokens.tsx:84 و:90; app/styles/04-components/tire-components.scss:40; ../design/final.html:33.
- What happens: زر .tc-btn--gold يأخذ الخلفية من primary لكن النص #221800 ثابت وhover #ffc23f ثابت؛ ضبط لون النص لا يؤثر فيه. preset الأحمر/الأزرق ينتج تباينًا 3.43/3.17 للنص العادي بدل لون النص الأبيض المقصود بالقالب، ويتحول hover إلى ذهبي. التصميم الأصلي يقر اللون الذهبي الافتراضي؛ الخلل باستجابة التخصيص.
- Fix idea: استعمال --tc-on-primary في البنر وبقية أزرار اللون الرئيسي واشتقاق hover من primary. الإبقاء على افتراضي التصميم. مراجعة بقية القيم الثابتة مثل tc_color_bg_alt الذي لا يصل إلى --tc-bg-2 بالـfinder/slider.
- Status: open

### S3-10 [P2] حقول تبقى متاحة رغم أن نتيجتها معطلة
- Where: tc_default_qty, tc_dark_style, tc_install_badge_text; scripts/tc-settings.cjs:67 و:80 و:216; home.services-row → cards.label (scripts/tc-components.cjs:289); home.install-booking → badge_unit/badge_text (scripts/tc/16-install-booking.cjs:39); app/components/home/InstallBooking.tsx:143.
- What happens: اختيار بيع طقم يجعل hook يفرض qty=1 بينما قائمة tc_default_qty ما زالت تقبل 2/4؛ dark_style يبقى ظاهرًا عند off؛ نص شارة التركيب ظاهر بمتجر sale إذا مفتاح الشارة محفوظ true، رغم عدم عرض الشارة. cards.label لا يظهر في photo؛ وحقلا وصف الشارة يبقيان بعد مسح badge_number.
- Fix idea: شروط للوضع المؤثر، وإزالة/تعطيل كمية الطقم إن كان فرض 1 قرارًا مقصودًا. cards.label يمكن تكراره بشرط لكل نوع رسمة إذا OR غير مدعوم؛ شرط «غير فارغ» needs checking في سلة، مع وصف صريح بديل. جميع condition IDs الحالية موجودة؛ المشكلة دلالية وليست parent مفقودًا.
- Status: open

### S3-11 [P2] اختيار مصدر ناقص يعرض منتجات أخرى بصمت
- Where: home.tire-slider/home.tire-grid/home.lineup → products_source, products_category, products_brand, products_selected; scripts/tc-fields.cjs:67; app/components/home/tc/products.ts:57 و:64.
- What happens: sourceFrom يعيد المصدر الافتراضي إذا اختير «من ماركة/تصنيف/منتجات أختارها» دون IDs. التاجر يظن أنه حصر القسم بعناصر معينة بينما يظهر آخر/أفضل منتجات المتجر. pickers غير required ولا تصف هذا fallback.
- Fix idea: توضيح رسالة إعداد ناقص بالمعاينة، وحالة عدم إعداد مقصودة بدل بديل صامت؛ أو كتابة وصف صريح عن العودة للافتراضي. حد products_selected العام 16 بينما Lineup يعرض 4: اجعل الحد/الوصف خاصًا بالمكوّن.
- Status: open

### S3-12 [P2] مكونات Raed الستة ما زالت تستثنى من الإعدادات المشتركة
- Where: home.main-links → merge_with_top_component; app/components/home/MainLinks.tsx:52; scripts/tc-fields.cjs:40; twilight.json:14243.
- What happens: MainLinks يقرأ merge_links_with_top_component بينما التعريف merge_with_top_component. المكونات الستة enhanced-slider/main-links/slider-products-with-header/enhanced-square-banners/brands/custom-testimonials باقية بلا show_mobile/show_desktop/space_top/space_bottom/custom_class/tc-cover. هذا مؤكد بالحصر؛ Claude أجّل إزالتها وليس إصلاحها.
- Fix idea: تنفيذ قرار التنظيف قبل النشر مع التعامل مع المتاجر التي استخدمتها؛ أو توحيد id وتوفير المشتركات للستة إذا بقيت. لا توسعها تلقائيًا قبل حسم إبقائها.
- Status: open

### S3-13 [P3] أهداف لمس صغيرة لعناصر متكررة
- Where: tc_mysize_chip, tc_footer_social, tc_compare; app/styles/04-components/tc-theme-ui.scss:35 و:41 و:77.
- What happens: مسح المقاس بعرض 30، روابط التواصل 38×38، إزالة مقارنة 20×20. الأخيرة خصوصًا صعبة عند إتاحة المقارنة على الجوال. قياسات CSS مصدرية، وليست نتيجة Lighthouse أو إعلان فشل WCAG تلقائي.
- Fix idea: مساحة تفاعل 44×44 مع إبقاء حجم الأيقونة والشكل؛ إعادة ترتيب thumb/action عند الحاجة بدل تغطية عناصر مجاورة.
- Status: open

### S3-14 [P3] إدخال المقاسات الافتراضية نصي ويصحح الأخطاء بصمت
- Where: home.size-finder → default_width/default_ratio/default_rim/popular_widths/popular_ratios/popular_rims; twilight.json:4594; app/components/home/SizeFinder.tsx:81; ../design/components-spec.md:52.
- What happens: المواصفات تطلب قوائم لقيم صالحة؛ تعريفات الإدخال نصية، first يسقط القيمة غير الموجودة ويرجع 205/55/16 دون إيضاح. التاجر قد يكتب R22.5 بينما المتوقع 22.5، أو قائمة شعبية مفصولة بطريقة غير متوقعة.
- Fix idea: قوائم صالحة أو نص مساعدة دقيق «الجنط: الرقم فقط، مثل 22.5، دونR»، وقالب للقيم الشائعة وتحذير معاينة؛ ضبط trucks/buses مع القيم.
- Status: open

### S3-15 [P3] لا يمكن إخفاء عمود التواصل أو الهوية كعنصر كامل
- Where: tc_footer_phone, tc_footer_email, tc_footer_city, tc_footer_news, tc_footer_about; app/components/layout/TcFooter.tsx:82 و:106.
- What happens: إطفاء الهاتف والبريد والنشرة ومسح المدينة يبقي عنوان «تواصل» وعمودًا فارغًا. مسح النبذة/إطفاء الاجتماعي يبقي TcBrand دائمًا. لذلك قاعدة «كل عنصر مرئي قابل للإطفاء» لا تتحقق للعمود والهوية.
- Fix idea: إخفاء contact عندما لا يحتوي شيئًا أو مفتاح «إظهار عمود التواصل»؛ مفتاح هوية الفوتر SHOULD إذا أراد التاجر فوترًا مختصرًا، مع ضبط grid للأعمدة المتبقية.
- Status: open

### S3-16 [P3] افتراضي عرض صور المنتج مختلف عند غياب الإعداد
- Where: slider_background_size; twilight.json:2657 (slider_background_size → selected.value=contain); app/components/product/ProductGallery.tsx:39.
- What happens: تعريف القائمة contain بينما fallback في الكود cover؛ المتجر/المعاينة التي لا ترسل الإعداد تبدأ باقتصاص الصور. لا يعني أن قيمة contain المرسلة تُتجاهل. شكل dropdown الحي needs checking لأن المستهلك لا يطبعه بـopt.
- Fix idea: توحيد fallback مع contain وتطبيع الشكل إذا عقد المحرك يحتاجه؛ تسمية «عرض صورة المنتج: كاملة / اقتصاص».
- Status: open

### إعادة التحقق من الإصلاحات السابقة
هذه تعليقات جديدة بالـappend؛ لم أغيّر Status القديمة. المقصود أرقام القسم السابق «Settings review — round 3».

| السابق | النتيجة الحالية والدليل |
|---|---|
| S3-1 | ↩ reopened — حساب الطقم بالمقارنة والكمية بحزمة hook اتصلحا؛ تسمية Lineup والسلايدر/نطاق الكمية ما زالت ناقصة (الجديد S3-3). |
| S3-2 | ↩ reopened — العمودي يقرأ الإعدادات؛ الأفقي وLineup يتجاوزان السياسة (الجديد S3-2). |
| S3-3 | ✔ confirmed — TcHeader:132 وMobileBottomBar:430 يستعملان /#size مقابل SizeFinder:233. حذف المكوّن يبقي حاجة لضبط وجهة صالحة. |
| S3-4 | ✔ confirmed ضمن العائم/البطاقات/الشريط — contact.ts يوحد الرقم والتحويل 05→966؛ ask بلا رقم يرجع للسعر حسب القرار الموثق. حقل الرقم المخفي مشكلة UX جديدة S3-4. |
| S3-5 | ✔ confirmed — WarrantyLine يقرأ tc_warranty، مركب بـProductPage:143؛ makeT يحترم مسح النص وترجمة الافتراضي. |
| S3-6 | ✔ confirmed — ProductListPage:342 يضيف tc-cols-set وقواعد tc-theme-ui:212–217 تستهلك الأعمدة. |
| S3-7 | ✔ confirmed — useSpecSources + toTcProduct/specTexts يقرآن المصدر للبطاقات الرئيسية وLineup. match_by المحلي أولوية تحتاج توضيح. |
| S3-8 | ✔ confirmed للمنطق — toggle فقط auto، off/on لا يأخذان اختيارًا محفوظًا؛ تغطية الأنماط منفصلة S3-8 الجديد. |
| S3-9 | ↩ reopened جزئيًا — root background/لون البنر وخطوطه وصلوا؛ foreground/hover لم يصلا (الجديد S3-9). |
| S3-10 | ✔ confirmed للقوالب/التباين الأخضر — DEPS للألوان وgreen text #13180a؛ لا يشمل زر .tc المختلف. |
| S3-11 | ↩ reopened جزئيًا — chain topbar/dark/my-size/set صحيحة؛ النواقص المتبقية والجديدة S3-10. |
| S3-12 | ✔ confirmed — CompareTray:89 يأخذ whereClass(tc_compare_where,'wide') مثل سياسة أزراره. modal مفتوح ثم تغيير الشاشة يحتاج اختبار متصفح. |
| S3-13 | ✔ confirmed — saveMySize/useMySize gated، SizeFinder يمرر rememberSize، زر الشريط لا يستخدم المحفوظ عند off. |
| S3-14 | ✔ confirmed — عنوان الشريط «الجوال» يطابق breakpoint<768. |
| S3-15 | ✔ confirmed لتضييق الوعد — المساعدة تسمي 3 أقسام/شارة فقط؛ تعطيل بطاقات خدمات مختلطة ما زال اقتراحًا. |
| S3-16 | ✔ confirmed لإضافة trap/restore/scroll lock/z300 في useModal؛ تداخل نافذتين وأجهزة فعلية needs checking. |
| S3-17 | ✔ confirmed للبريد الافتراضي/status — store_email فارغ مع placeholder، fallbackstoreEmail، حالات link/email/blocked بالفوتر. توحيد مصدر الاشتراك اقتراح. |
| S3-18 | ✔ confirmed — الأربعة الميتة أزيلت من twilight.json والمولد. |
| S3-19 | ✔ confirmed — TcFooter يركب SallaTrustBadges dark؛ قراءة footer_is_dark باقية فقط في Footer القديم غير المركب. |
| S3-20 | لم يصلح — مؤجل، الستة ما زالت موجودة؛ الجديد S3-12. |
| S3-21 | ✔ confirmed لإعادة الترتيب/فصل المتقدم؛ ترجمة labels للمحرر needs checking. |
| S3-22 | ↩ reopened جزئيًا — نقل الحقل تم، semantics الكمبيوتر لم تتغير؛ الجديد S3-7. |

إضافات التقرير السابق على 2bde35f: عنوان يفصل الثمانية الموروثة أصبح موجودًا ✔؛ رفع شريط شراء المنتج وأهداف اللمس لم يتغيرا (الجديد S3-6/13).

### حصر الإعدادات والقراءات
- 104 حقول عامة غيرstatic:96tc_* و 8 موروثة. جميعها لها قراءة محلية، باستثناء notify_when_available_in_card الذي يقرأه المحرك المثبت chunk-6YIAULAP.js:44؛ ليس إعدادًا ميتًا.
- لا tc_* مقروء بلا تعريف. القراءات القديمة header_layout/header_is_sticky/footer_layout/footer_is_dark موجودة بكود Header/Footer غير المستخدمين في ThemeLayout؛ لا أسجلها عطلًا حيًا. font/product_card_img_ratio من أنواع المحرك وقد ترسلهما المنصة: needs checking؛ غياب تعريف محلي وحده ليس دليل غيابها.
- «مقروء» لا يساوي «يعمل بكل مكان»: qty، brand/year/install/compare/setPrice ليست كلها مدعومة ببطاقات المحرك أو Lineup. راجع وعد «تنطبق على بطاقات الإطارات بكل المتجر» في scripts/tc-settings.cjs:136.
- where() القيمall/desktop/wide/narrow/mobile تطابق CSS/devices عند 375/768/1100/1101؛ شرطshow_desktop المشترك يشمل التابلت>=768، لذلك الأفضل عنوان «الكمبيوتر والتابلت».
- الافتراضيات العربية multilanguage=true تمر عبرmakeT/ENmaps بالمخصص؛ custom_class/phone/email قيم تقنية plain. labels/collection conditions وحفظ الـselected داخل صف حي needs checking، وليس رفضًا مثبتًا. النص التسويقي القابل للتغيير لا يُعامل كخطأ بذاته.
- البحثoff يخفي form/icon/modal بنفس searchOn؛ واتساب العائم بلا رقم يخفي الزر؛ تصحيحoff/on وqtyperSet والمقارنة مؤكد مصدرًا.

### S3 — Missing settings
اقتراحات محددة لا تنشئ APIs، وتحتاج اعتماد قبل البناء؛ المرحلة التالية للصفحات الداخلية تبقى حسب HANDOFF.

| setting | group | type | default | why | MUST/SHOULD/NICE |
|---|---|---|---|---|---|
| إصلاح tc_card_price عبر كلlayout | البطاقة | reuse موجود | show | يمنع تجاوز سياسة التاجر | MUST |
| مصدر واتساب مستقل عن العائم | التواصل | reuse tc_wa_number plain | فارغ=المتجر | نقطة ضبط واحدة متاحة دائمًا | MUST |
| اختيار inherit لكمية المكوّن | المنتج/السلايدر | dropdown | إعداد المتجر | إزالة تضارب add_qty/tc_default_qty | SHOULD |
| وجهة المقاس عند حذف size-finder | التنقل | reuse link picker | وجهة موجودة | زر دخول التسوق لا يصبح anchor غائبًا | SHOULD |
| مصدر ضمان/DOT فعلي لكل منتج | صفحة المنتج | switches للبيانات الموجودة | عرض الموجود فقط | لا يوجد ضمان عام يناسب كلمنتج؛ schema metadata needs checking | SHOULD |
| إظهار عمود التواصل | الفوتر | switch/إخفاء تلقائي | true | لا يترك عنوانًا فارغًا | SHOULD |
| مصدر اشتراك مشترك | التواصل | mode+link/email | غير مربوط | الفوتر/home.newsletter يضبطان مرتين؛ خارجي أوmailto فقط | SHOULD |
| إظهار كل بطاقة خدمة مختلطة | double-banner/services-bento/services-row | switch لكلبطاقة | التصميم الحالي | بيع فقط يحتاج خدمات توصيل دون تركيب | SHOULD |
| حالة عدم توفر المقاس مع وجهة تواصل | البحث | نصmultilanguage+linkاختياري | لا توجد نتائج | استفسار/بديل واضح، دون حجوزات أوAPI | SHOULD |
| وصف حدود الشحن/التركيب | المنتج/سياسات | link picker | فارغ | مصدر الشروط الحقيقي لا نص تأكيد كاذب | SHOULD |
| توحيد notify_when_available_in_card بالمخصص | البطاقة | reuse switch | true | إشعار سلة الحقيقي؛ SDK needs checking | SHOULD |
| معاينة نتيجة الضبط وقياس وصول/أداء | QA، ليس حقلتاجر | سيناريوهات اختبار | — | اعتماد النشر يتطلب قياسًا فعليًا | MUST |
| مفاتيح أيقونات الشريط السفلي | الجوال | switches إذا مطلوب | التصميم | tc_cart_show/tc_account_show تخص الهيدر؛ وضّح النطاق بدل مضاعفة الخيارات | NICE |

### S3 — Per-component gaps
الـ 23 المخصصة كلها تحتوي المشتركات والغطاء؛ الستة القديمة لا. السلوك الحي للحفظ وشروط الصفوف يحتاج تجربة محرر سلة. هذه توصيات للحقول، لا طلب لبناء خدمات backend.

#### home.tire-hero
slides_interval: «مدة بقاء الشريحة»، slides_speed: «مدة الانتقال». ترتيب الوسائط ثم النص ثم الزر ثم الحركة. لون نص الزر والداكن: S3-8/9. حافظ على ترتيب الصورة أولًا بالجوال المعتمد.
#### home.size-finder
default_width/default_ratio/default_rim وpopular_*: S3-14. match_by يحتاج شرح الأولوية أو «استخدام إعداد المتجر». مسح help_text يخفي الرابط بالفعل.
#### home.benefits-strip
items.icon/title/text: «أيقونة الميزة / عنوان الميزة / وصف قصير». شرح حد 2–4. حفظ اختيار الأيقونة داخل الصف يحتاج checking، ولا يُثبت العطل من لقطة واحدة.
#### home.tire-slider
products_source/add_qty: S3-1/3/11. وضح الكمية المحلية وحد limit. تحريك الأسهم smooth لا يتبع reduced-motion؛ تحسين وصول مطلوب.
#### home.brands-marquee
brands_source: وضح أن إدارة شعارات المتجر من سلة. animate/speed/grayscale موجودة. لا حاجة لخدمة جلب جديدة.
#### home.category-cards
cards.image/icon: بيان أولوية الصورة؛ cards.link وجهة الفئة؛ highlight تمييز بصري. عنوان صف واضح أفضل من «بطاقة #».
#### home.shop-by-car
cars_paste/use_builtin/cars: وضح أولوية المصادر. parseCarsPaste يسقط الصفوف غير الصالحة؛ اقتراح إظهار عدد المقبول والمرفوض بالمعاينة. بيانات المقاس لا تكون توصية مصنع موثقة دون دليل ملائم.
#### home.tire-grid
columns محلي للرئيسية، بينما tc_cols_* صار لقوائم المتجر. المصدر الناقص: S3-11. ترتيب المنتجات بالسعر عند ask يحتاج سياسة واضحة.
#### home.double-banner
dark_*/light_*: مفتاح مستقل لكل بطاقة SHOULD للخدمات المختلطة. reverse يحتاج شرح تأثيره على الجوال.
#### home.tire-picker
sizes.price/tiers.factor أسعار يدوية تقديرية وليست سعر المنتج المربوط. priorities.tier مرتبط بترتيب الصف: تحذير بعد السحب أو معرّف ثابت SHOULD.
#### home.services-bento
calc_min/calc_max: تحقق أعلى > أدنى. calc_parts محلي لا يتبع tc_installments، فوضح النطاق. big_*/small_*/fleet_* تحتاج إخفاء مستقل SHOULD.
#### home.ticker
items.number يُستعمل للروابط فقط، وitems.link الفارغ يجعل العنصر جملة. pause_on_hover ينبغي أن يساعد keyboard focus أيضًا.
#### home.services-row
cards.art يتحكم بالحقول؛ cards.label غير مؤثر في photo: S3-10. title فارغ يخفي البطاقة، فوضح شرط اكتمالها.
#### home.install-banner
caption/caption_ar موضعان مختلفان وليسا بديلَي ترجمة؛ أسماء أوضح. useSellsFitting يخفيه في sale.
#### home.install-centers
centers.open_now يدوي ولا يحسب hours؛ العنوان المقترح «شارة مفتوح الآن (يدوي)». روابط الخريطة والحجز الفارغة تخفي الأزرار بالفعل.
#### home.install-booking
day_1/day_2/day_3 أسماء لليوم وغد وبعد غد وليست جدول أيام العمل. badge_unit/text: S3-10؛ whatsapp مستقل: S3-4. الرسالة طلب موعد وليست تأكيد حجز.
#### home.call-strip
phone: «رقم الاتصال (مع رمز الدولة)» مع شرح التنسيق والفراغ. لا تخلطه برقم واتساب.
#### home.steps
steps.icon/title/text وحدود 2–4: «ترقيم الخطوات يتبع ترتيبها». لا حاجة لإعدادات خدمة backend.
#### home.lineup
products_selected يسمح 16 والعرض 4: S3-11. tc_sale_unit/tc_card_price لا يطبقان: S3-2/3. show_type يعمل.
#### home.reviews
source manual/store موجود؛ reviews.text الفارغ يستبعد الصف، فوضح ذلك. لا تسمية «موثق» لرأي يدوي دون دليل.
#### home.blog
limit/all_link: شرح «آخر مقالات متجرك، وإدارتها من سلة». حالة المصدر الفارغ اقتراح QA، دون حقول مقالات وهمية.
#### home.faq
items.q/a يتطلبان الاثنين للعرض؛ مساعدة لصف كامل. open_first موجود؛ مسح title_2 يخفي النص الذهبي حسب القرار السابق.
#### home.newsletter
mode/signup_link/store_email: المثال اتصلح. ربط الفوتر مختلف؛ شرح النطاق أو دمج المصدر SHOULD. رابط خارجي أو mailto فقط.
#### home.enhanced-slider
مشتركات وغطاء ناقصان: S3-12؛ إزالة مؤجلة، فلا يوسع قبل الحسم.
#### home.main-links
merge_with_top_component لا يطابق المستهلك: S3-12؛ مشتركات وغطاء ناقصان.
#### home.slider-products-with-header
background/title/description/products/display_all_url موجودة؛ مشتركات وغطاء ناقصان: S3-12.
#### home.enhanced-square-banners
banners.image/url/title/description موجودة؛ إعداد crop القديم أزيل؛ مشتركات وغطاء ناقصان: S3-12.
#### home.brands
مستهلكه المحرك، ليس مكوّنًا ميتًا؛ مشتركات وغطاء ناقصان. وضح الفرق عن brands-marquee إن بقي.
#### home.custom-testimonials
items.name/avatar/stars/text تمر فعلًا إلى TestimonialsCarousel؛ مشتركات وغطاء ناقصان. وضح الفرق عن reviews ذات المصدر الحقيقي.

### S3 — Remove or merge
قرارات الـ 12 الموروثة المطلوبة بحسب النسخة الحالية:

| id | القرار |
|---|---|
| squar_photo_bg_image_size | ✔ أزيل؛ أبقه محذوفًا دون مستهلك |
| vertical_fixed_products | ✔ أزيل |
| is_more_button_enabled | ✔ أزيل؛ MainMenu المحرك ليس هيدرنا |
| imageZoom | ✔ أزيل؛ لا مفتاح ميت |
| product_show_breadcrumbs | إبقاء ضمن صفحة المنتج؛ «إظهار مسار التنقل بصفحة المنتج» |
| product_index_show_breadcrumbs | إبقاء ضمن التصنيف والبحث؛ توضيح علاقته بخيار المنصة |
| enable_add_product_toast | إبقاء ضمن السلة والإضافة |
| notify_when_available_in_card | إبقاء ضمن البطاقة/نفاد المخزون؛ المحرك يقرأه؛ توسيع المخصص needs checking |
| sticky_add_to_cart | إبقاء ضمن صفحة المنتج/زر الشراء؛ S3-6 |
| product_bottom_nav_rounded | إبقاء ضمن الجوال ومشروط بـtc_bottombar |
| show_tags | إبقاء «وسوم صفحة المنتج» ضمن صفحة المنتج |
| slider_background_size | إبقاء «عرض صور المنتج» ضمن معرض الصور؛ S3-16 |

الثمانية الباقية صارت تحت عنوان «صفحة المنتج والقوائم»، فالمشكلة القديمة اتصلحت؛ التوزيع الدقيق أعلاه يقلل البحث. دمج رقم واتساب ومصدر الاشتراك مفيد. لا تكرر خيارات المنصة للأرقام العربية أو حماية المحتوى أو «صنع بإتقان». custom_class تحت «للمطورين»، مع الحفاظ على حقول المواصفات بدل إضافة مفاتيح زينة كثيرة.

### S3 — Proposed final group order
1. أساس متجر الإطارات: نوع المتجر، وحدة البيع، كمية الإضافة، مصدر المقاس.
2. الهوية: قالب أو سلة أو يدوي بأولوية واحدة؛ ثم الخطوط.
3. رأس المتجر والشريط العلوي: بدل «الهيدر»، المحتوى ثم الظهور.
4. بطاقات المنتجات: السعر والشراء والمفضلة والمقارنة والمقاس المحفوظ.
5. صفحة المنتج والتصنيف والبحث: الموروثات تحت عناوين فرعية حسب الموضع.
6. الجوال والتنقل: الشريط السفلي وموضع شراء المنتج.
7. التواصل والحملات: الرقم المشترك، العائم، الخصم، الاشتراك.
8. أسفل المتجر: بدل «الفوتر»، الهوية والأعمدة والتواصل والدفع والثقة.
9. المظهر المتقدم: الداكن والنقشة والتحميل؛ dark_style يختفي عند off.

### S3 — Suggestions
- اختبارات انتقال حالة تحميل المنتجات، وليست SSR فقط؛ أولها S3-1.
- مصفوفة معاينة: حبة/طقم، كمية 1/4، طلب السعر مع/بدون رقم، عمودي/أفقي/Lineup، البحث مطفأ، الشريط مطفأ، off/auto/on مع اختيار داكن محفوظ.
- تجربة محرر سلة لاحقًا: حفظ الأيقونة وإعادة فتحها، شروط صفوف collections، النص بلغتين، القيم المخفية المحفوظة، والمصدر الناقص. تحتاج إذن شبكة.
- فحص 375/768/1100/1101، لوحة المفاتيح والحركة المخففة وتراكب صفحة المنتج، ثم Lighthouse وaxe على صفحات فعلية. لا ادعاء نتيجة 90 دون قياس.
- ضمان وDOT وتركيب من معلومات المنتجات وسياسات وشحن سلة؛ WhatsApp وروابط خارجية للطلبات، دون نظام حجز أو اشتراك backend.
- مطابقة الشكل الافتراضي بعد الإصلاح؛ المرجع final.html:33 للزر، :44–47 للشريط، :49–66 للهيدر، وcomponents-spec.md للحقول. قراءة CSS لا تثبت مطابقة بكسلات.
- قبل النشر: تنظيف المكونات المؤجلة والديمو، أغلفة لكل مكوّن، متجر تجريبي بمنتجات إطارات، وترخيص تجاري للصور.

