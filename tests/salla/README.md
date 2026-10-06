# فحوصات ثيم سلة Twilight React

هذه الحزمة خاصة بمكوّن `home.tire-hero` في هذا الثيم. تستعمل المكوّن وSCSS الحقيقيين مع بديل محلي لرابط Twilight وبيانات سلة مصطنعة. لا تشغّل إضافة Twilight ولا تتصل بواجهة سلة ولا تنفّذ شراءً أو تعديل إعدادات متجر.

الأوامر:

- `pnpm test:salla:smoke`: تشغيل الحالات الأساسية بالعربية والإنجليزية على Chromium المكتبي ومحاكاة الجوال.
- `pnpm test:salla`: كل الحالات، ومنها اختبارات تكشف عيوب البيانات والوصول الحالية؛ فشلها يستدعي إصلاح المكوّن ولا يعني أن الأدوات لم تُثبّت.
- `pnpm test:salla:lighthouse`: تقارير محلية بالعربية والإنجليزية؛ ليست تقييم أداء متجر سلة المنشور ولا إثبات قبول الثيم.
- `pnpm exec vitest --run tests/salla/hero-ssr.test.tsx`: SSR في بيئة Node دون window/document؛ لا يثبت سلامة hydration في لغة المتجر الفعلية.
- لإعادة تنزيل Chromium: في PowerShell شغّل `$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) 'output/playwright/browsers'` ثم `pnpm exec playwright install chromium`.
- `pnpm exec playwright show-report output/playwright/report`: فتح التقرير.

النتائج والصور وملفات axe وtraces في `output/playwright/`. بيانات الاختبار مصطنعة، لكن يفضّل عدم مشاركة traces من متجر حقيقي لأنها قد تتضمن بيانات خاصة.

الفحص البصري ينتج صورًا للمراجعة؛ لم نعتمد صورة الثيم الحالية مرجعًا ذهبيًا. قارِنها بالتصميم المعتمد عند نفس العرض والمحتوى والخطوط، مع الحفاظ على ترتيب الصورة أولًا في الجوال الذي طلبه المستخدم. لا تدّعي مطابقة التصميم اعتمادًا على نجاح smoke.

فحوصات إضافية على معاينة سلة تجريبية: قبول `twilight.json`، شروط حقول المجموعات، حفظ وإعادة فتح إعدادات التاجر، الروابط المحلولة فعليًا، تبديل اللغة، SSR/hydration، صفحات المنتج والتصنيف والسلة، لوحة المفاتيح والحركة المخفّضة. لا تشمل هذه الحزمة قبول محرر سلة أو Safari حقيقيًا أو إتمام الدفع. لا ترسل طلب شراء للحصول على صفحة الشكر.

مراجع: [Twilight configuration](https://docs.salla.dev/twilight-engine/twilight-json)، [Salla technical review](https://docs.salla.dev/twilight-engine/technical-review)، [official Raed examples](https://github.com/SallaApp/theme-raed/blob/master/twilight.json). أمثلة Raed ليست مخطط React كاملًا؛ تحقّق من انطباق أي قاعدة قبل اعتبارها مانع نشر.
