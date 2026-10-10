# برومت مراجعة الإعدادات وتجربة المستخدم — ChatGPT

> **قبل ما تلصق البرومت، أرفق مع الرسالة:**
> 1. `tires-store/twilight.json` — فيه كل الإعدادات (`settings`) وكل المكوّنات (`components`).
> 2. صور شاشة لصفحة الإعدادات بمحرر سلة (من أولها لآخرها) + صورة لمحرر مكوّن أو اثنين.
> 3. صور للتصميم المعتمد: `design/final.html` (الرئيسية) وأي صفحة من `design/store/`.
> 4. (اختياري) صور للمتجر من الجوال والكمبيوتر.

---

## البرومت (انسخه كامل)

You are a senior e-commerce UX reviewer and Salla (Twilight) theme expert. Review the settings of a Salla storefront theme I am building to SELL on the Salla theme store. Be critical and specific. Do not rewrite code; produce a review report.

### Context
- Theme: «متجر الإطارات / TIRES STORE» — a theme specialised for **tire stores in Saudi Arabia** (passenger, SUV, light-truck and truck tires; fitting/installation centres; size-based shopping like 205/55 R16; installments with Tabby/Tamara; WhatsApp-heavy customers; mostly mobile traffic).
- Identity: gold `#ffb71b` + charcoal `#1d2023`. Arabic first (RTL), English fully supported. Light + dark mode.
- Engine: Salla Twilight **React** theme. Global settings live in `twilight.json → settings[]`; home-page sections are editable components in `twilight.json → components[]`. Fields support: switch, text (multilingual), textarea, color, number, image, dropdown, link picker, collection (repeatable rows), static titles/descriptions, and `conditions` (a field is shown only when another field has a given value).
- Screens: mobile < 768px · tablet 768–1100px · desktop > 1100px. Many elements have a «يظهر على» (where it shows) dropdown: all / desktop / desktop+tablet / mobile+tablet / mobile.
- The merchant sees Salla's own platform options («خيارات التصميم»: Arabic numerals, content protection, «صنع بإتقان», breadcrumb, unify card heights, product image display) ABOVE our settings — those are Salla's, not ours, but check for overlap/duplication with ours.
- Our rules: (1) every setting must come from how a tire merchant and their customer really use the store — not copied from competitors (e.g. the Selia theme); (2) every visible element on the storefront must have a way to be switched off; (3) when a feature is switched off, its own fields must hide in the editor; (4) fewer meaningful settings beat many cosmetic ones (Salla review measures performance: Lighthouse performance ≥ 60, accessibility ≥ 90).

### What to check

**A. Settings UX (the merchant's experience in the editor)**
1. Group order and naming: does the order match how a tire merchant would set up a store (first-day setup → daily changes)? Are group titles and labels clear Arabic for a non-technical Saudi merchant? Flag jargon, ambiguous or too-long labels, and wrong/missing helper descriptions.
2. Placement: is every setting in the right group? List any that should move, merge, or be split.
3. Conditions: list every switch/dropdown whose dependent fields should hide but don't (or hide when they shouldn't). Check chains (a child of a hidden parent).
4. Defaults: are defaults sensible for a brand-new tire store (works well with zero configuration, nothing broken or empty, no fake data like example phone numbers that turn into real links)?
5. Bilingual: which text fields are missing an English value or a multilingual flag? Which labels would confuse an English-speaking merchant?
6. Per-screen: which settings should have a per-screen option but don't, and which have one that is unnecessary noise?
7. Overload: which settings would you remove or hide behind an "advanced" switch because they add little value?

**B. Missing settings — whole store**
Think as (a) a tire merchant running daily operations and (b) a customer buying 4 tires on a phone. List settings that are missing for: header, top bar, footer, mobile bottom bar, floating buttons, popups, product cards, product page, category/search pages, cart, customer account pages, SEO/performance, trust (warranty, original tires, production year/DOT, return policy), fitting/installation, delivery, installments, WhatsApp ordering, out-of-stock sizes. For each: why a tire store needs it, the field type, default, and which group it belongs in. Mark each as MUST (blocks a good store), SHOULD, or NICE.

**C. Missing settings — each home component**
For EACH component in `twilight.json → components` (key starts with `home.`): list missing fields (content, layout, visibility, per-screen, links, images, product source/filter, empty-state behaviour), fields that are confusing or redundant, and wrong defaults. Check that every component has: show on mobile/desktop, space above/below, custom CSS class, a cover image, Arabic + English defaults.

**D. Consistency**
Same concept named the same way everywhere (e.g. «الجوال» vs «رقم الجوال», «اختر مقاسك»), same field order across similar components, same units (px, seconds), same switch wording (positive phrasing: «إظهار …»).

**E. Conflicts**
Settings that contradict each other (e.g. sale-only store but fitting badge on; price per set but "×4" shown; dark mode off but dark toggle shown; WhatsApp number empty but WhatsApp button on). Say what should happen in each case.

### Output format (Arabic, please)
1. **ملخص** — top 10 issues by impact, one line each.
2. **جدول المشاكل**: | # | المكان (المجموعة / المكوّن → الحقل `id`) | المشكلة | ليش مهم لمتجر إطارات | الإصلاح المقترح | الأولوية P1/P2/P3 |
3. **إعدادات ناقصة للمتجر** (جدول): | الإعداد المقترح | المجموعة | نوع الحقل | القيمة الافتراضية | السبب | MUST/SHOULD/NICE |
4. **إعدادات ناقصة لكل مكوّن** — عنوان لكل مكوّن، تحته نقاط.
5. **إعدادات أنصح بحذفها أو دمجها** مع السبب.
6. **الترتيب المقترح النهائي للمجموعات** (قائمة مرقّمة).

Rules for you: quote the exact setting `id` from twilight.json for every finding; do not invent features Salla themes cannot do (themes cannot add backend APIs, booking systems or newsletters — they can only link to them or use WhatsApp/email); if you are unsure whether Salla supports something, say "needs checking" instead of asserting it.

---

## نسخة Codex (أفضل — يقرأ الكود مباشرة، ما بدها مرفقات)

الصق هاد السطر بأول البرومت فوق، وبعده البرومت كامل:

> You have the repo `Salla Web Designs/tires-store` (and `Salla Web Designs/design`). Read `CLAUDE.md`, `twilight.json`, `scripts/tc-settings.cjs` (global settings, groups + `DEPS` conditions), `scripts/tc-components.cjs` + `scripts/tc/*.cjs` (component fields), and the consumers: `app/components/layout/{ThemeTokens,TcHeader,TcFooter,TcExtras,MobileBottomBar,devices}.tsx`, `app/components/tires/features/*`, `app/components/home/*.tsx`. ALSO verify that every setting `id` is actually read by code (list settings that do nothing) and every `theme.settings.*` read in code exists in twilight.json. Do NOT edit source files, do not commit, do not push, no network/dev server. Write the report as a new section «## Settings review — round 3» at the end of `REVIEW.md` (findings numbered S3-1, S3-2… with Where / What / Fix idea / Status: open), then set `HANDOFF.md` → **Turn:** Claude (fix settings review). Reply in Arabic.
