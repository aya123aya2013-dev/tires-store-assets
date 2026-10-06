/**
 * Theme settings (twilight.json → settings[]) for the tires theme, grouped like the store
 * editor shows them: each group opens with a title bar, then its fields.
 * Group 1 — general look: colours (light + dark), dark mode, fonts, corners.
 * Values are read in app/components/layout/ThemeTokens.tsx.
 * Run:  node scripts/tc-settings.cjs   (upserts by id, keeps every other setting)
 */
const fs = require('fs');
const path = require('path');
const F = require('./tc-fields.cjs');

const file = path.join(__dirname, '../twilight.json');
const json = JSON.parse(fs.readFileSync(file, 'utf8'));

const title = (id, text) => ({
  type: 'static', format: 'title', variant: 'h6', id,
  value: `<div style="background:#1d2023;color:#ffb71b;border-radius:10px;padding:12px 14px;margin:6px 0 14px;font-weight:700;font-size:14px">${text}</div>`,
});
const sub = (id, text) => F.head(id, text);

const GROUP_GENERAL = [
  title('tc-set-general', 'الخيارات العامة والألوان'),
  { ...F.tip('ألوان الهوية تنطبق على كل المتجر: الأزرار والعناوين والشارات. القيم الافتراضية هي ألوان تصميم الإطارات (ذهبي وفحمي).'), id: 'tc-set-tip-general' },

  sub('tc-set-h-colors', 'ألوان المتجر'),
  F.color('tc_color_primary', 'اللون الرئيسي (الأزرار والتمييز)', '#ffb71b'),
  F.color('tc_color_on_primary', 'لون النص فوق اللون الرئيسي', '#221800'),
  F.color('tc_color_dark', 'اللون الداكن (الأقسام الداكنة والعناوين)', '#1d2023'),
  F.color('tc_color_bg', 'خلفية الصفحة', '#ffffff'),
  F.color('tc_color_bg_alt', 'خلفية الأقسام الفاتحة', '#f5f4f0'),
  F.sw('tc_use_store_color', 'استخدام لون هوية المتجر من لوحة سلة بدل اللون الرئيسي', false),

  sub('tc-set-h-dark', 'الوضع الداكن'),
  F.dd('tc_dark_mode', 'الوضع الداكن', [
    ['مطفأ — المتجر فاتح دائماً', 'off'],
    ['حسب جهاز الزائر (تلقائي)', 'auto'],
    ['مفعّل — المتجر داكن دائماً', 'on'],
  ], 'off'),
  F.sw('tc_dark_toggle', 'إظهار زر التبديل (فاتح / داكن) للزائر بالهيدر', true, 'الزائر يختار، ويتذكر المتجر اختياره'),
  F.color('tc_dark_bg', 'خلفية الوضع الداكن', '#121416'),
  F.color('tc_dark_surface', 'خلفية البطاقات بالوضع الداكن', '#1b1e21'),
  F.color('tc_dark_text', 'لون النص بالوضع الداكن', '#ecebe6'),

  sub('tc-set-h-fonts', 'الخطوط'),
  F.dd('tc_font_ar', 'الخط العربي', [
    ['IBM Plex Sans Arabic (التصميم)', 'ibm'],
    ['Tajawal', 'tajawal'],
    ['Cairo', 'cairo'],
    ['Almarai', 'almarai'],
    ['خط المتجر من لوحة سلة', 'store'],
  ], 'ibm'),
  F.dd('tc_font_en', 'خط الأرقام والإنجليزي', [
    ['Archivo (التصميم)', 'archivo'],
    ['Inter', 'inter'],
    ['نفس الخط العربي', 'same'],
  ], 'archivo'),

  sub('tc-set-h-shape', 'الشكل'),
  F.dd('tc_radius', 'زوايا البطاقات والأزرار', [
    ['ناعمة (التصميم)', 'soft'],
    ['حادة', 'sharp'],
    ['دائرية', 'round'],
  ], 'soft'),
];

const tip = (id, t) => ({ ...F.tip(t), id });

// Group 2 — top bar, header, footer (app/components/layout/TcHeader.tsx / TcFooter.tsx)
const GROUP_FRAME = [
  title('tc-set-frame', 'أعلى المتجر والهيدر والفوتر'),

  sub('tc-set-h-topbar', 'الشريط الترويجي أعلى المتجر'),
  F.sw('tc_topbar_show', 'إظهار الشريط', true),
  F.text('tc_topbar_text', 'النص', 'تركيب مجاني في مراكزنا بالرياض', 120),
  F.text('tc_topbar_highlight', 'نص مميّز (ذهبي، يختفي بالجوال)', '· تقسيط على 4 دفعات مع تابي وتمارا', 120),
  F.sw('tc_topbar_marquee', 'نص متحرك (يتحرك بالعرض)', false),
  F.link('tc_topbar_link', 'رابط الشريط (اختياري)'),
  F.sw('tc_topbar_phone', 'إظهار رقم الجوال (من بيانات التواصل بالمتجر)', true),

  sub('tc-set-h-header', 'الهيدر'),
  F.dd('tc_logo_mode', 'الشعار', [['شعار متجرك (من لوحة سلة)', 'store'], ['علامة الإطار + اسم المتجر', 'mark']], 'store'),
  F.text('tc_brand_sub', 'السطر الصغير تحت الاسم (مع علامة الإطار)', 'TIRES STORE', 30),
  F.text('tc_search_placeholder', 'نص خانة البحث', 'ابحث باسم الإطار أو الماركة أو المقاس…', 80),
  F.sw('tc_header_sticky', 'تثبيت الهيدر عند النزول', true),
  F.sw('tc_header_nav', 'إظهار صف الأقسام (من قائمة الهيدر بلوحة سلة)', true),
  F.sw('tc_header_cta', 'إظهار زر «اختر مقاسك»', true),
  F.text('tc_header_cta_text', 'نص الزر', 'اختر مقاسك', 24),
  F.link('tc_header_cta_link', 'رابط الزر', 'فاضي = يفتح باحث المقاسات'),

  sub('tc-set-h-footer', 'الفوتر'),
  F.area('tc_footer_about', 'نبذة عن المتجر', 'إطارات أصلية لكل سيارة، تركيب مجاني بالرياض، وتوصيل لكل مناطق المملكة.', 220),
  F.text('tc_footer_shop_title', 'عنوان العمود الأول', 'تسوّق', 30),
  F.text('tc_footer_help_title', 'عنوان العمود الثاني', 'المساعدة', 30),
  tip('tc-set-tip-footer', 'العمود الأول من «قائمة الهيدر» والثاني من «قائمة الفوتر» بلوحة سلة (المتجر ← القوائم). الجوال والإيميل والسوشال من «بيانات المتجر».'),
  F.text('tc_footer_city', 'المدينة أو العنوان', 'الرياض', 60),
  F.sw('tc_footer_news', 'إظهار خانة الاشتراك بالعروض', true),
  F.link('tc_footer_news_link', 'رابط الاشتراك (Mailchimp، Brevo…)', 'فاضي = تنفتح رسالة لإيميل المتجر'),
  F.sw('tc_footer_payments', 'إظهار شعارات الدفع', true),
  F.sw('tc_footer_legal', 'إظهار السجل التجاري والرقم الضريبي وشارات الثقة', true),
];

// Group 3 — floating buttons, popup, loader, background (app/components/layout/TcExtras.tsx)
const GROUP_EXTRAS = [
  title('tc-set-extras', 'الأزرار العائمة والنوافذ'),

  sub('tc-set-h-wa', 'زر واتساب'),
  F.sw('tc_wa_show', 'إظهار زر واتساب العائم', true),
  F.plain('tc_wa_number', 'رقم واتساب مع رمز الدولة (فاضي = رقم المتجر)', '', { maxLength: 20, placeholder: '9665xxxxxxxx' }),
  F.text('tc_wa_message', 'الرسالة الجاهزة', 'السلام عليكم، أبي أستفسر عن مقاس إطار', 160),
  F.dd('tc_float_side', 'مكان الأزرار العائمة', [['يسار الشاشة', 'left'], ['يمين الشاشة', 'right']], 'left'),

  sub('tc-set-h-call', 'زر الاتصال'),
  F.sw('tc_call_show', 'إظهار زر الاتصال العائم (جوال فقط)', false),
  F.plain('tc_call_number', 'الرقم (فاضي = رقم المتجر)', '', { maxLength: 20, placeholder: '05xxxxxxxx' }),

  sub('tc-set-h-top', 'زر الرجوع للأعلى'),
  F.sw('tc_totop_show', 'إظهار زر الرجوع للأعلى', true),

  sub('tc-set-h-popup', 'نافذة الخصم'),
  F.sw('tc_popup_show', 'إظهار نافذة الخصم', false),
  F.text('tc_popup_title', 'العنوان', 'خصم 10% على أول طقم إطارات', 60),
  F.text('tc_popup_text', 'النص', 'استخدم الكود عند الدفع. العرض لفترة محدودة.', 140),
  F.plain('tc_popup_code', 'كود الخصم', 'TIRES10', { maxLength: 30 }),
  F.image('tc_popup_image', 'صورة (اختياري)', '600×600 بكسل', 600, 600),
  F.num('tc_popup_delay', 'تظهر بعد (ثواني)', 6, 0, 120),
  F.dd('tc_popup_repeat', 'تكرار الظهور', [['مرة وحدة لكل زائر', 'once'], ['كل زيارة جديدة', 'session'], ['كل يوم', 'daily']], 'once'),

  sub('tc-set-h-loader', 'صفحة التحميل'),
  F.sw('tc_loader_show', 'إظهار شاشة تحميل (إطار يدور) عند فتح المتجر', false, 'تختفي أول ما تجهز الصفحة'),

  sub('tc-set-h-pattern', 'خلفية المتجر'),
  F.dd('tc_pattern', 'نقشة خلفية خفيفة', [['بدون', 'none'], ['آثار إطار', 'tread'], ['نقاط', 'dots']], 'none'),
];

// Group 4 — tires features (app/components/tires/features/*)
const GROUP_TIRES = [
  title('tc-set-tires', 'مميزات متجر الإطارات'),
  tip('tc-set-tip-tires', 'هاي المميزات خاصة بمتاجر الإطارات. المقاس يُقرأ من اسم المنتج أو الوسوم أو الخيارات (مثل 205/55 R16).'),
  F.sw('tc_my_size', '«مقاسي المحفوظ» — يتذكر مقاس الزبون ويعلّم المنتجات المناسبة له', true),
  F.sw('tc_year_badge', 'شارة سنة الصنع على بطاقة المنتج (من وسم مثل 2026)', true),
  F.sw('tc_set_price', 'سعر الطقم (4 حبات) والقسط الشهري على بطاقة المنتج', true),
  F.num('tc_installments', 'عدد دفعات التقسيط (تابي / تمارا)', 4, 2, 12),
  F.sw('tc_compare', 'مقارنة الإطارات (حتى 3)', true),
  F.dd('tc_preset', 'قالب ألوان جاهز', [
    ['بدون — ألواني من الأعلى', 'none'],
    ['ذهبي وفحمي (الأصلي)', 'gold'],
    ['أحمر وأسود (رياضي)', 'red'],
    ['أزرق وكحلي', 'blue'],
    ['أخضر وزيتي (بر ودفع رباعي)', 'green'],
  ], 'none', { description: 'يتقدّم على ألوان المتجر بالأعلى إذا اخترت قالب' }),
];

// A switched-off feature hides its own fields in the editor (child → [parent, value]).
const DEPS = {
  tc_topbar_text: ['tc_topbar_show', true], tc_topbar_highlight: ['tc_topbar_show', true],
  tc_topbar_marquee: ['tc_topbar_show', true], tc_topbar_link: ['tc_topbar_show', true], tc_topbar_phone: ['tc_topbar_show', true],
  tc_brand_sub: ['tc_logo_mode', 'mark'],
  tc_header_cta_text: ['tc_header_cta', true], tc_header_cta_link: ['tc_header_cta', true],
  tc_footer_news_link: ['tc_footer_news', true],
  tc_wa_number: ['tc_wa_show', true], tc_wa_message: ['tc_wa_show', true],
  tc_call_number: ['tc_call_show', true],
  tc_popup_title: ['tc_popup_show', true], tc_popup_text: ['tc_popup_show', true], tc_popup_code: ['tc_popup_show', true],
  tc_popup_image: ['tc_popup_show', true], tc_popup_delay: ['tc_popup_show', true], tc_popup_repeat: ['tc_popup_show', true],
  tc_installments: ['tc_set_price', true],
  tc_color_primary: ['tc_use_store_color', false], tc_color_on_primary: ['tc_use_store_color', false],
};

const ALL = [...GROUP_GENERAL, ...GROUP_FRAME, ...GROUP_EXTRAS, ...GROUP_TIRES].map(f => (DEPS[f.id] ? F.when(f, ...DEPS[f.id]) : f));

// base-theme settings replaced by the groups above (header / footer now come from TcHeader / TcFooter)
const REMOVED = ['header_is_sticky', 'topnav_is_dark', 'important_links', 'enable_more_menu', 'header_show_store_info', 'footer_is_dark', 'static-line1', 'static-label2', 'static-line3', 'static-label4', 'static-line5', 'static-label6'];
const settings = (json.settings || []).filter(x => !REMOVED.includes(x.id));
for (const s of ALL) {
  const i = settings.findIndex(x => x.id === s.id);
  if (i >= 0) settings[i] = s;
}
// new ones go to the top, in order, ahead of the old base-theme settings
const fresh = ALL.filter(s => !settings.some(x => x.id === s.id));
json.settings = [...fresh, ...settings];

fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log('settings:', json.settings.length, '(tires:', ALL.length, ')');
