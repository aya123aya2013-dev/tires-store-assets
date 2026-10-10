/**
 * Theme settings (twilight.json → settings[]) for the tires theme.
 * Built from the owner-approved analysis (2026-10-06), not copied from a competitor:
 *  - grouped by what a tire merchant actually changes (identity → tires → header → card →
 *    mobile → floating → footer);
 *  - every visible element has a switch, and a switched-off element hides its own fields
 *    (`conditions`, see DEPS);
 *  - «وين يظهر» (devices) for elements whose use differs by screen:
 *    desktop > 1100px · tablet 768–1100px · mobile < 768px (the design's breakpoints).
 * Values are read in ThemeTokens / TcHeader / TcFooter / TcExtras / MobileBottomBar / cards.
 * Run:  node scripts/tc-settings.cjs   (rewrites the tires settings in this order; keeps others)
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
const tip = (id, t) => ({ ...F.tip(t), id });
/** «وين يظهر» — read with `devices()` in app/components/layout/devices.ts */
const DEVICES = [
  ['كل الشاشات', 'all'],
  ['الكمبيوتر فقط', 'desktop'],
  ['الكمبيوتر والتابلت', 'wide'],
  ['الجوال والتابلت', 'narrow'],
  ['الجوال فقط', 'mobile'],
];
const where = (id, d = 'all') => F.dd(id, 'يظهر على', DEVICES, d);

// 1 — identity
const G_IDENTITY = [
  title('tc-set-identity', 'هوية المتجر'),
  tip('tc-set-tip-identity', 'القيم الافتراضية هي ألوان وخطوط تصميم الإطارات. القالب الجاهز يغيّر الهوية كلها بضغطة.'),
  F.dd('tc_preset', 'قالب ألوان جاهز', [
    ['بدون — ألواني أنا', 'none'],
    ['ذهبي وفحمي (الأصلي)', 'gold'],
    ['أحمر وأسود (رياضي)', 'red'],
    ['أزرق وكحلي', 'blue'],
    ['أخضر وزيتي (بر ودفع رباعي)', 'green'],
  ], 'none'),
  F.sw('tc_use_store_color', 'استخدام لون هوية المتجر من لوحة سلة', false),
  F.color('tc_color_primary', 'اللون الرئيسي (الأزرار والتمييز)', '#ffb71b'),
  F.color('tc_color_on_primary', 'لون النص فوق اللون الرئيسي', '#221800'),
  F.color('tc_color_dark', 'اللون الداكن (الأقسام الداكنة والعناوين)', '#1d2023'),
  F.color('tc_color_bg', 'خلفية الصفحة', '#ffffff'),
  F.color('tc_color_bg_alt', 'خلفية الأقسام الفاتحة', '#f5f4f0'),
  sub('tc-set-h-fonts', 'الخطوط والشكل'),
  F.dd('tc_font_ar', 'الخط العربي', [
    ['IBM Plex Sans Arabic (التصميم)', 'ibm'], ['Tajawal', 'tajawal'], ['Cairo', 'cairo'], ['Almarai', 'almarai'], ['خط المتجر من لوحة سلة', 'store'],
  ], 'ibm'),
  F.dd('tc_font_en', 'خط الأرقام والإنجليزي', [['Archivo (التصميم)', 'archivo'], ['Inter', 'inter'], ['نفس الخط العربي', 'same']], 'archivo'),
  F.dd('tc_radius', 'زوايا البطاقات والأزرار', [['ناعمة (التصميم)', 'soft'], ['حادة', 'sharp'], ['دائرية', 'round']], 'soft'),
];

// last — advanced look: dark mode, pattern, loader
const G_DARK = [
  title('tc-set-dark', 'مظهر متقدم: الوضع الداكن والخلفية'),
  F.dd('tc_dark_mode', 'الوضع الداكن', [
    ['مطفأ — المتجر فاتح', 'off'], ['مفعّل — المتجر داكن', 'on'], ['تلقائي — حسب جهاز الزائر، مع زر تبديل', 'auto'],
  ], 'off'),
  F.dd('tc_dark_style', 'لون الداكن', [['فحمي (يناسب الهوية)', 'charcoal'], ['أسود', 'black']], 'charcoal', { description: 'يُستخدم لما الوضع «مفعّل» أو «تلقائي». يشمل الرئيسية والهيدر والفوتر' }),
  F.sw('tc_dark_toggle', 'زر التبديل (فاتح / داكن) للزائر بالهيدر', true, 'الزائر يختار، ويتذكر المتجر اختياره'),
  where('tc_dark_toggle_where'),
  F.dd('tc_pattern', 'نقشة خلفية خفيفة', [['بدون', 'none'], ['آثار إطار', 'tread'], ['نقاط', 'dots']], 'none'),
  F.sw('tc_loader_show', 'شاشة تحميل (إطار يدور) عند فتح المتجر', false, 'تختفي أول ما تجهز الصفحة'),
];

// 3 — tire store
const G_TIRES = [
  title('tc-set-tires', 'أساس متجر الإطارات (ابدأ من هنا)'),
  tip('tc-set-tip-tires', 'إعدادات اليوم الأول. «بيع فقط» يخفي: حجز التركيب، مراكز التركيب، بنر التركيب، وشارة «تركيب مجاني». بطاقات الخدمات بالأقسام الثانية تعدّلها من القسم نفسه.'),
  F.dd('tc_store_type', 'نوع المتجر', [['بيع وتركيب', 'install'], ['بيع فقط (توصيل)', 'sale'], ['بيع وتركيب وصيانة', 'service']], 'install'),
  F.dd('tc_sale_unit', 'سعر المنتج عندك', [['للحبة الواحدة', 'tire'], ['للطقم (4 حبات)', 'set']], 'tire'),
  F.dd('tc_default_qty', 'الكمية عند الضغط على «أضف» (بطاقات الرئيسية)', [['1', '1'], ['2', '2'], ['4', '4']], '1', { description: 'الأغلب يشتري 4 حبات. بصفحات التصنيف تختار الكمية من صفحة المنتج' }),
  F.dd('tc_spec_source', 'وين تكتب المقاس وسنة الصنع بمنتجاتك', [
    ['بأي مكان (الاسم أو الوسوم أو الخيارات)', 'all'], ['اسم المنتج', 'name'], ['الوسوم', 'tags'], ['خيارات المنتج', 'options'],
  ], 'all'),
  F.sw('tc_install_badge', 'شارة «تركيب مجاني» على المنتجات', true, 'لا تظهر لو نوع المتجر «بيع فقط»'),
  F.text('tc_install_badge_text', 'نص الشارة', 'تركيب مجاني', 30),
  F.text('tc_warranty', 'نص الضمان بصفحة المنتج (فاضي = بدون)', 'ضمان الوكيل', 60),
  sub('tc-set-h-tirefeat', 'مميزات للزبون'),
  F.sw('tc_my_size', '«مقاسي المحفوظ» — يتذكر مقاس الزبون ويعلّم المناسب له', true),
  F.sw('tc_year_badge', 'سنة الصنع على البطاقة', true),
  F.sw('tc_set_price', 'سعر الطقم (×4) والتقسيط على البطاقة', true, 'يظهر لما يكون سعر المنتج للحبة'),
  F.num('tc_installments', 'عدد دفعات التقسيط (تابي / تمارا)', 4, 2, 12),
  F.sw('tc_compare', 'مقارنة الإطارات (حتى 3)', true),
  where('tc_compare_where', 'wide'),
];

// 4 — top bar
const G_TOPBAR = [
  title('tc-set-topbar', 'الشريط العلوي'),
  F.sw('tc_topbar_show', 'إظهار الشريط', true),
  where('tc_topbar_where'),
  F.text('tc_topbar_text', 'النص', 'تركيب مجاني في مراكزنا بالرياض', 120),
  F.text('tc_topbar_highlight', 'نص مميّز (ذهبي)', '· تقسيط على 4 دفعات مع تابي وتمارا', 120),
  where('tc_topbar_highlight_where', 'wide'),
  F.sw('tc_topbar_marquee', 'نص متحرك', false),
  F.link('tc_topbar_link', 'رابط الشريط (اختياري)'),
  F.sw('tc_topbar_phone', 'رقم الجوال (من بيانات المتجر)', true),
  where('tc_topbar_phone_where', 'wide'),
];

// 5 — header
const G_HEADER = [
  title('tc-set-header', 'الهيدر'),
  F.dd('tc_logo_mode', 'الشعار', [['شعار متجرك (من لوحة سلة)', 'store'], ['علامة الإطار + اسم المتجر', 'mark']], 'store'),
  F.text('tc_brand_sub', 'السطر الصغير تحت اسم المتجر (الفوتر، والهيدر مع علامة الإطار)', 'TIRES STORE', 30),
  F.num('tc_logo_h', 'ارتفاع الشعار — الكمبيوتر (بكسل)', 46, 28, 80),
  F.num('tc_logo_h_m', 'ارتفاع الشعار — الجوال (بكسل)', 36, 24, 60),
  F.sw('tc_header_sticky', 'تثبيت الهيدر عند النزول — الكمبيوتر', true),
  F.sw('tc_header_sticky_m', 'تثبيت الهيدر عند النزول — الجوال', true),
  sub('tc-set-h-hsearch', 'البحث'),
  F.sw('tc_search_show', 'خانة البحث', true),
  F.text('tc_search_placeholder', 'نص خانة البحث', 'ابحث باسم الإطار أو الماركة أو المقاس…', 80),
  sub('tc-set-h-hicons', 'الأيقونات والأزرار'),
  F.sw('tc_account_show', 'أيقونة الحساب', true),
  F.sw('tc_cart_show', 'أيقونة السلة', true),
  F.sw('tc_mysize_chip', 'شريحة «مقاسي» (بعد ما يبحث الزبون)', true),
  F.sw('tc_header_cta', 'زر «اختر مقاسك»', true),
  where('tc_header_cta_where', 'wide'),
  F.text('tc_header_cta_text', 'نص الزر', 'اختر مقاسك', 24),
  F.link('tc_header_cta_link', 'رابط الزر', 'فاضي = باحث المقاسات بالصفحة الرئيسية'),
  F.sw('tc_header_nav', 'صف الأقسام (من قائمة الهيدر بلوحة سلة)', true),
];

// 6 — product card
const G_CARD = [
  title('tc-set-card', 'بطاقة المنتج'),
  tip('tc-set-tip-card', 'تنطبق على بطاقات الإطارات بكل المتجر.'),
  F.sw('tc_card_fav', 'زر المفضلة (القلب)', true),
  F.sw('tc_card_brand', 'اسم الماركة', true),
  F.sw('tc_card_rim', 'رقم الجنط الكبير خلف الصورة', true),
  F.dd('tc_card_price', 'السعر', [['يظهر السعر', 'show'], ['«اطلب السعر» عبر واتساب بدل السعر', 'ask']], 'show', { description: 'يحتاج رقم واتساب (من مجموعة الأزرار العائمة أو بيانات المتجر)' }),
  F.sw('tc_card_add', 'زر «أضف للسلة»', true),
  F.dd('tc_cols_d', 'أعمدة صفحات التصنيف والبحث — الكمبيوتر', [['3', '3'], ['4', '4'], ['5', '5']], '4'),
  F.dd('tc_cols_t', 'أعمدة صفحات التصنيف والبحث — التابلت', [['2', '2'], ['3', '3']], '3'),
  F.dd('tc_cols_m', 'أعمدة صفحات التصنيف والبحث — الجوال', [['1', '1'], ['2', '2']], '2'),
];

// 7 — mobile
const G_MOBILE = [
  title('tc-set-mobile', 'الجوال'),
  F.sw('tc_bottombar', 'الشريط السفلي (الجوال)', true),
  F.dd('tc_bottombar_items', 'أزرار الشريط السفلي', [
    ['الرئيسية · الأقسام · مقاسي · السلة · حسابي', 'size'],
    ['الرئيسية · الأقسام · واتساب · السلة · حسابي', 'whatsapp'],
    ['الرئيسية · الأقسام · السلة · حسابي', 'basic'],
  ], 'size'),
];

// 8 — floating buttons & popup
const G_FLOAT = [
  title('tc-set-float', 'الأزرار العائمة ونافذة الخصم'),
  F.dd('tc_float_side', 'مكان الأزرار العائمة', [['يسار الشاشة', 'left'], ['يمين الشاشة', 'right']], 'left'),
  sub('tc-set-h-wanum', 'رقم واتساب المتجر'),
  F.plain('tc_wa_number', 'رقم واتساب المتجر (لكل أزرار واتساب — فاضي = رقم المتجر)', '', { maxLength: 20, placeholder: '9665xxxxxxxx' }),
  sub('tc-set-h-wa', 'زر واتساب العائم'),
  F.sw('tc_wa_show', 'زر واتساب العائم', true),
  where('tc_wa_where'),
  F.text('tc_wa_message', 'الرسالة الجاهزة (للزر العائم)', 'السلام عليكم، أبي أستفسر عن مقاس إطار', 160),
  sub('tc-set-h-call', 'اتصال'),
  F.sw('tc_call_show', 'زر الاتصال العائم', false),
  where('tc_call_where', 'mobile'),
  F.plain('tc_call_number', 'الرقم (فاضي = رقم المتجر)', '', { maxLength: 20, placeholder: '05xxxxxxxx' }),
  sub('tc-set-h-top', 'للأعلى'),
  F.sw('tc_totop_show', 'زر الرجوع للأعلى', true),
  where('tc_totop_where', 'wide'),
  sub('tc-set-h-popup', 'نافذة الخصم'),
  F.sw('tc_popup_show', 'نافذة الخصم', false),
  where('tc_popup_where'),
  F.text('tc_popup_title', 'العنوان', 'خصم 10% على أول طقم إطارات', 60),
  F.text('tc_popup_text', 'النص', 'استخدم الكود عند الدفع. العرض لفترة محدودة.', 140),
  F.plain('tc_popup_code', 'كود الخصم', 'TIRES10', { maxLength: 30 }),
  F.image('tc_popup_image', 'صورة (اختياري)', '600×600 بكسل', 600, 600),
  F.num('tc_popup_delay', 'تظهر بعد (ثواني)', 6, 0, 120),
  F.dd('tc_popup_repeat', 'تكرار الظهور', [['مرة وحدة لكل زائر', 'once'], ['كل زيارة جديدة', 'session'], ['كل يوم', 'daily']], 'once'),
];

// 9 — footer
const G_FOOTER = [
  title('tc-set-footer', 'الفوتر'),
  tip('tc-set-tip-footer', 'عمود «تسوّق» من قائمة الهيدر، وعمود «المساعدة» من قائمة الفوتر بلوحة سلة. الجوال والإيميل والسوشال من «بيانات المتجر».'),
  F.area('tc_footer_about', 'نبذة عن المتجر (فاضي = بدون)', 'إطارات أصلية لكل سيارة، تركيب مجاني بالرياض، وتوصيل لكل مناطق المملكة.', 220),
  F.sw('tc_footer_brand', 'الشعار واسم المتجر', true),
  F.sw('tc_footer_social', 'أيقونات حسابات التواصل', true),
  F.sw('tc_footer_accordion', 'طي الأعمدة على الجوال', true),
  F.sw('tc_footer_shop', 'عمود «تسوّق»', true),
  F.text('tc_footer_shop_title', 'عنوان العمود', 'تسوّق', 30),
  F.sw('tc_footer_help', 'عمود «المساعدة»', true),
  F.text('tc_footer_help_title', 'عنوان العمود', 'المساعدة', 30),
  sub('tc-set-h-fcontact', 'التواصل'),
  F.sw('tc_footer_phone', 'رقم الجوال', true),
  F.sw('tc_footer_email', 'الإيميل', true),
  F.text('tc_footer_city', 'المدينة أو العنوان (فاضي = بدون)', 'الرياض', 60),
  F.sw('tc_footer_news', 'خانة الاشتراك بالعروض', true),
  F.link('tc_footer_news_link', 'رابط الاشتراك (Mailchimp، Brevo…)', 'فاضي = تنفتح رسالة لإيميل المتجر'),
  sub('tc-set-h-flegal', 'أسفل الفوتر'),
  F.sw('tc_footer_payments', 'شعارات الدفع (المفعّلة بمتجرك)', true),
  F.sw('tc_footer_legal', 'السجل التجاري وشارات الثقة', true),
];

// product page (app/components/tires/product/TcProductParts.tsx + ProductPage.tsx); the base product
// settings Salla already reads (breadcrumb, tags, sticky bar…) are slotted in by id below
const G_PRODUCT = [
  title('tc-set-product', 'صفحة المنتج'),
  sub('tc-set-h-ptrust', 'الوعود تحت السعر'),
  F.sw('tc_p_trust', 'إظهار الوعود الثلاثة', true),
  F.text('tc_p_trust_1', 'الوعد 1 (فاضي = بدون)', 'أصلي بضمان الوكيل', 40),
  F.text('tc_p_trust_2', 'الوعد 2 — التركيب (يختفي لو «بيع فقط»)', 'تركيب مجاني بالرياض', 40),
  F.text('tc_p_trust_3', 'الوعد 3', 'قسّطها مع تابي وتمارا', 40),
  sub('tc-set-h-pdm', 'طريقة الاستلام'),
  { ...F.tip('لو بدك الزبون يختار «تركيب أو توصيل» وتوصلك بالطلب: أضف للمنتج خيار اسمه «طريقة الاستلام» بقيم «استلام وتركيب» و«توصيل لعنوانك» (من تعديل المنتج ← خيارات المنتج). بدون الخيار تظهر البطاقتين كمعلومة.'), id: 'tc-set-tip-pdm' },
  F.sw('tc_p_delivery', 'بطاقتي التركيب والتوصيل', true),
  F.text('tc_p_dm_install', 'عنوان التركيب', 'استلام وتركيب — مجاناً', 50),
  F.text('tc_p_dm_install_sub', 'سطر التركيب', 'نركّبها على جنوطك بنفس اليوم', 80),
  F.text('tc_p_dm_ship', 'عنوان التوصيل', 'توصيل لعنوانك', 50),
  F.text('tc_p_dm_ship_sub', 'سطر التوصيل', 'المدة والتكلفة تظهر قبل الدفع', 80),
  sub('tc-set-h-pblocks', 'أقسام الصفحة'),
  F.sw('tc_p_specs', 'جدول المواصفات (من الاسم والوسوم والخيارات)', true),
  F.text('tc_p_specs_title', 'عنوان المواصفات', 'المواصفات', 30),
  { ...F.tip('للجدول: اكتب بالوسوم أو الخيارات مثل «حمولة: 91»، «سرعة: V»، «بلد الصنع: تايلند»، «النقشة: Ventus Prime 4»، «2026». المقاس يُقرأ تلقائياً.'), id: 'tc-set-tip-pspecs' },
  F.sw('tc_p_faq', 'أسئلة عن الإطار', true),
  F.text('tc_p_faq_title', 'عنوان الأسئلة', 'أسئلة عن الإطار', 40),
  F.text('tc_p_faq_q1', 'سؤال 1 (فاضي = بدون)', 'الشحن والإرجاع', 80),
  F.area('tc_p_faq_a1', 'جواب 1', 'نشحن لكل مناطق المملكة. الإطارات غير المركّبة تقبل الإرجاع خلال 7 أيام بحالتها الأصلية.', 400),
  F.text('tc_p_faq_q2', 'سؤال 2', 'هل يناسب سيارتي؟', 80),
  F.area('tc_p_faq_a2', 'جواب 2', 'إذا المقاس المكتوب على جانب إطارك الحالي نفس المقاس أعلاه، فهو مناسب. محتار؟ ابعت صورة إطارك على واتساب.', 400),
  F.text('tc_p_faq_q3', 'سؤال 3', 'الضمان', 80),
  F.area('tc_p_faq_a3', 'جواب 3', 'ضمان الوكيل ضد عيوب التصنيع حسب الماركة، ونضمن تاريخ صنع لا يتجاوز 12 شهر.', 400),
  F.sw('tc_p_related', 'إطارات مشابهة', true),
  F.text('tc_p_related_title', 'عنوان المشابهة', 'إطارات مشابهة', 40),
];
// category / search (app/components/tires/listing/TcListParts.tsx + ProductListPage.tsx)
const G_LIST = [
  title('tc-set-list', 'التصنيف والبحث'),
  F.sw('tc_list_kicker_show', 'السطر الصغير فوق العنوان', true),
  F.text('tc_list_kicker', 'نص السطر', 'تسوّق الإطارات', 40),
  F.sw('tc_list_fbar', 'شريط «مقاسك» (العرض · النسبة · الجنط)', true),
  F.text('tc_list_fbar_title', 'عنوان الشريط', 'مقاسك', 20),
  F.sw('tc_list_facets', 'عمود الفلاتر (من فلاتر سلة)', true, 'الفلاتر نفسها (الماركة، النوع، السعر، سنة الصنع…) تفعّلها وترتّبها من لوحة سلة ← الفلاتر'),
  F.sw('tc_list_nofind', '«ما لقيت مقاسك؟» — واتساب بالمقاس مكتوب', true, 'يظهر تحت نتائج أي مقاس وتحت القائمة الفاضية. يحتاج رقم واتساب'),
  F.text('tc_list_nofind_title', 'العنوان', 'ما لقيت مقاسك؟', 40),
  F.text('tc_list_nofind_text', 'السطر', 'ابعتلنا المقاس على واتساب ونأمّنه لك بأسرع وقت.', 100),
  F.text('tc_list_nofind_msg', 'أول رسالة الواتساب (المقاس ينضاف بعدها)', 'السلام عليكم، أبحث عن مقاس', 80),
];
const LIST_BASE = ['product_index_show_breadcrumbs'];

// wishlist / brands / blog / article (app/components/tires/pages/TcPages.tsx)
const G_PAGES = [
  sub('tc-set-h-help', 'صفحة المساعدة (/help)'),
  F.text('tc_help_title', 'العنوان', 'كل اللي تحتاج تعرفه.', 60),
  F.sw('tc_help_size', 'دليل قراءة المقاس', true),
  F.sw('tc_help_install', 'شروط التركيب', true, 'ما يظهر لو «بيع فقط»'),
  F.text('tc_help_install_title', 'عنوان التركيب', 'تركيب مجاني', 40),
  F.area('tc_help_install_lines', 'شروط التركيب (كل سطر بند)', `التركيب على الجنط مجاني عند اختيار «استلام وتركيب».
الترصيص ووزن الأذرعة برسوم بسيطة تحددها المراكز.
احضر بالموعد؛ التأخير أكثر من 30 دقيقة قد يتطلب موعد جديد.
التركيب خلال ساعة تقريباً لطقم الأربع إطارات.`, 800),
  F.sw('tc_help_returns', 'سياسة الإرجاع', true),
  F.area('tc_help_returns_lines', 'بنود الإرجاع (كل سطر بند)', `يمكن إرجاع أو استبدال الإطارات غير المركّبة وبحالتها الأصلية خلال 7 أيام.
لا يمكن إرجاع الإطارات بعد تركيبها أو استخدامها.
يُسترد المبلغ بنفس وسيلة الدفع بعد استلام الإطارات وفحصها.`, 800),
  F.link('tc_help_policy_link', 'رابط صفحة السياسة الكاملة (من صفحات سلة)', 'فاضي = بدون زر'),
  F.sw('tc_help_faq', 'الأسئلة الشائعة', true),
  F.text('tc_help_q1', 'سؤال 1 (فاضي = بدون)', 'كيف أعرف مقاس الإطار المناسب لسيارتي؟', 100),
  F.area('tc_help_a1', 'جواب 1', 'المقاس مكتوب على جانب إطارك الحالي، أو بملصق باب السائق.', 400),
  F.text('tc_help_q2', 'سؤال 2', 'هل السعر يشمل التركيب؟', 100),
  F.area('tc_help_a2', 'جواب 2', 'نعم، التركيب على الجنط مجاني عند اختيار «استلام وتركيب».', 400),
  F.text('tc_help_q3', 'سؤال 3', 'كم مدة التوصيل؟', 100),
  F.area('tc_help_a3', 'جواب 3', 'داخل المدينة 1–2 يوم، وباقي المناطق 3–5 أيام.', 400),
  F.text('tc_help_q4', 'سؤال 4', 'هل يمكن التقسيط؟', 100),
  F.area('tc_help_a4', 'جواب 4', 'نعم، عبر تابي أو تمارا على 4 دفعات حسب أهلية العميل.', 400),
  sub('tc-set-h-opages', 'المفضلة والماركات والمدونة'),
  F.text('tc_pg_wish_title', 'المفضلة — العنوان', 'المفضلة', 40),
  F.text('tc_pg_wish_empty', 'المفضلة الفاضية — النص', 'ما في إطارات بالمفضلة لسا.', 80),
  F.text('tc_pg_brands_title', 'الماركات — العنوان', 'ماركات أصلية، من الوكيل.', 60),
  F.sw('tc_pg_brands_logos', 'الماركات — شعار الماركة (بدل الاسم)', true),
  F.text('tc_pg_blog_title', 'المدونة — العنوان', 'نصائح تخلّي إطارك يعيش أطول.', 60),
  F.text('tc_404_title', 'صفحة 404 — العنوان', 'الطريق هذا مسكّر.', 60),
  F.text('tc_404_text', 'صفحة 404 — السطر', 'الصفحة اللي تدوّر عليها غير موجودة.', 100),
  F.sw('tc_pg_article_cta', 'المقال — زر «ابحث بمقاسك» آخر المقال', true),
  F.text('tc_pg_article_cta_text', 'نص الزر', 'ابحث بمقاسك', 30),
];

// cart (app/components/tires/cart/TcCartParts.tsx + cart/CartPage.tsx)
const G_CART = [
  title('tc-set-cart', 'السلة'),
  F.text('tc_cart_title', 'عنوان الصفحة', 'سلة المشتريات', 40),
  F.text('tc_cart_empty_title', 'لما السلة فاضية — العنوان', 'سلتك فاضية.', 40),
  F.text('tc_cart_empty_text', 'لما السلة فاضية — السطر', 'اختر مقاسك ونطلع لك الإطارات المناسبة.', 100),
  F.sw('tc_cart_ship_bar', 'شريط «باقي X وتوصيلك مجاني»', true),
  F.num('tc_cart_free_ship', 'التوصيل مجاني فوق (ر.س) — 0 = بدون', 0, 0, 100000, { description: 'نفس الرقم اللي حاطه بسلة ← الشحن، الشريط للعرض بس' }),
  F.sw('tc_cart_set_hint', 'تنبيه «الطقم 4» لما يكون عدد الإطارات فردي', true, 'ما يظهر لو سعر منتجاتك للطقم'),
  F.text('tc_cart_set_hint_text', 'نص التنبيه', 'عندك إطار مفرد بالسلة — الأفضل تبديل الإطارات زوج على نفس المحور، أو طقم 4 كامل.', 140),
  F.sw('tc_cart_appt', 'صندوق «موعد التركيب» (واتساب أو ملاحظات الطلب)', true, 'ما يظهر لو نوع المتجر «بيع فقط»'),
  F.text('tc_cart_appt_title', 'العنوان', 'موعد التركيب', 40),
  F.text('tc_cart_appt_text', 'السطر', 'أكمل طلبك واكتب الوقت المناسب لك بملاحظات الطلب، أو احجز الموعد مباشرة على واتساب.', 160),
  F.text('tc_cart_appt_msg', 'أول رسالة الواتساب (المنتجات تنضاف بعدها)', 'السلام عليكم، بدي أحجز موعد تركيب لـ:', 100),
  sub('tc-set-h-ty', 'صفحة الشكر بعد الطلب'),
  F.sw('tc_ty_next', 'خطوات «شو بيصير بعدين» + حجز موعد التركيب', true),
  F.text('tc_ty_step1', 'الخطوة 1 (فاضي = بدون)', 'نجهّز إطاراتك ونتأكد من تاريخ الصنع', 80),
  F.text('tc_ty_step2', 'الخطوة 2', 'نرسل لك تأكيد الموعد أو رقم التتبع', 80),
  F.text('tc_ty_step3', 'الخطوة 3', 'تركيب واستلام — وطريقك جاهز', 80),
  F.text('tc_ty_appt_title', 'عنوان صندوق الموعد', 'احجز وقت التركيب اللي يناسبك', 60),
  F.text('tc_ty_appt_text', 'سطر صندوق الموعد', 'ابعتلنا رقم الطلب على واتساب ونأكد لك الموعد والمركز.', 120),
  sub('tc-set-h-csecure', 'أسفل الملخص'),
  F.sw('tc_cart_secure', 'سطر «دفع آمن» تحت الملخص', true),
  F.text('tc_cart_secure_text', 'نص السطر', 'دفع آمن عبر سلة · مدى · Apple Pay · تابي · تمارا', 80),
];

// base settings that belong to the product page (kept, now under its title)
const PRODUCT_BASE = ['product_show_breadcrumbs', 'show_tags', 'slider_background_size', 'sticky_add_to_cart', 'enable_add_product_toast'];

// A switched-off element hides its own fields (child → [parent, value]).
const DEPS = {
  tc_use_store_color: ['tc_preset', 'none'],
  tc_color_primary: [['tc_preset', 'none'], ['tc_use_store_color', false]], tc_color_on_primary: [['tc_preset', 'none'], ['tc_use_store_color', false]],
  tc_color_dark: ['tc_preset', 'none'],
  tc_dark_toggle: ['tc_dark_mode', 'auto'], tc_dark_toggle_where: [['tc_dark_mode', 'auto'], ['tc_dark_toggle', true]],
  tc_set_price: ['tc_sale_unit', 'tire'],
  tc_mysize_chip: ['tc_my_size', true],
  tc_default_qty: ['tc_sale_unit', 'tire'],
  tc_logo_h: ['tc_logo_mode', 'store'], tc_logo_h_m: ['tc_logo_mode', 'store'],
  tc_install_badge_text: ['tc_install_badge', true],
  tc_installments: [['tc_sale_unit', 'tire'], ['tc_set_price', true]],
  tc_compare_where: ['tc_compare', true],
  tc_topbar_where: ['tc_topbar_show', true], tc_topbar_text: ['tc_topbar_show', true], tc_topbar_highlight: ['tc_topbar_show', true],
  tc_topbar_highlight_where: ['tc_topbar_show', true], tc_topbar_marquee: ['tc_topbar_show', true], tc_topbar_link: ['tc_topbar_show', true],
  tc_topbar_phone: ['tc_topbar_show', true], tc_topbar_phone_where: [['tc_topbar_show', true], ['tc_topbar_phone', true]],
  tc_search_placeholder: ['tc_search_show', true],
  tc_header_cta_where: ['tc_header_cta', true], tc_header_cta_text: ['tc_header_cta', true], tc_header_cta_link: ['tc_header_cta', true],
  tc_bottombar_items: ['tc_bottombar', true],
  tc_wa_where: ['tc_wa_show', true], tc_wa_message: ['tc_wa_show', true],
  tc_call_where: ['tc_call_show', true], tc_call_number: ['tc_call_show', true],
  tc_totop_where: ['tc_totop_show', true],
  tc_popup_where: ['tc_popup_show', true], tc_popup_title: ['tc_popup_show', true], tc_popup_text: ['tc_popup_show', true],
  tc_popup_code: ['tc_popup_show', true], tc_popup_image: ['tc_popup_show', true], tc_popup_delay: ['tc_popup_show', true],
  tc_popup_repeat: ['tc_popup_show', true],
  tc_footer_shop_title: ['tc_footer_shop', true], tc_footer_help_title: ['tc_footer_help', true],
  tc_footer_news_link: ['tc_footer_news', true],
  tc_p_trust_1: ['tc_p_trust', true], tc_p_trust_2: ['tc_p_trust', true], tc_p_trust_3: ['tc_p_trust', true],
  tc_p_dm_install: ['tc_p_delivery', true], tc_p_dm_install_sub: ['tc_p_delivery', true], tc_p_dm_ship: ['tc_p_delivery', true], tc_p_dm_ship_sub: ['tc_p_delivery', true],
  tc_p_specs_title: ['tc_p_specs', true],
  tc_p_faq_title: ['tc_p_faq', true], tc_p_faq_q1: ['tc_p_faq', true], tc_p_faq_a1: ['tc_p_faq', true], tc_p_faq_q2: ['tc_p_faq', true], tc_p_faq_a2: ['tc_p_faq', true], tc_p_faq_q3: ['tc_p_faq', true], tc_p_faq_a3: ['tc_p_faq', true],
  tc_p_related_title: ['tc_p_related', true],
  tc_list_kicker: ['tc_list_kicker_show', true], tc_list_fbar_title: ['tc_list_fbar', true],
  tc_help_install_title: ['tc_help_install', true], tc_help_install_lines: ['tc_help_install', true], tc_help_returns_lines: ['tc_help_returns', true], tc_help_policy_link: ['tc_help_returns', true],
  tc_help_q1: ['tc_help_faq', true], tc_help_a1: ['tc_help_faq', true], tc_help_q2: ['tc_help_faq', true], tc_help_a2: ['tc_help_faq', true], tc_help_q3: ['tc_help_faq', true], tc_help_a3: ['tc_help_faq', true], tc_help_q4: ['tc_help_faq', true], tc_help_a4: ['tc_help_faq', true],
  tc_pg_article_cta_text: ['tc_pg_article_cta', true],
  tc_cart_free_ship: ['tc_cart_ship_bar', true], tc_cart_set_hint_text: ['tc_cart_set_hint', true],
  tc_cart_appt_title: ['tc_cart_appt', true], tc_cart_appt_text: ['tc_cart_appt', true], tc_cart_appt_msg: ['tc_cart_appt', true],
  tc_cart_secure_text: ['tc_cart_secure', true],
  tc_ty_step1: ['tc_ty_next', true], tc_ty_step2: ['tc_ty_next', true], tc_ty_step3: ['tc_ty_next', true], tc_ty_appt_title: ['tc_ty_next', true], tc_ty_appt_text: ['tc_ty_next', true],
  tc_list_nofind_title: ['tc_list_nofind', true], tc_list_nofind_text: ['tc_list_nofind', true], tc_list_nofind_msg: ['tc_list_nofind', true],
};

// DEPS values: [parent, value] or a list of them (all must hold)
const ALL = [...G_TIRES, ...G_IDENTITY, ...G_TOPBAR, ...G_HEADER, ...G_CARD, ...G_MOBILE, ...G_FLOAT, ...G_FOOTER, ...G_PRODUCT, ...G_LIST, ...G_CART, title('tc-set-pages', 'باقي الصفحات'), ...G_PAGES, ...G_DARK]
  .map(f => (DEPS[f.id] ? (Array.isArray(DEPS[f.id][0]) ? DEPS[f.id] : [DEPS[f.id]]).reduce((g, d) => F.when(g, ...d), f) : f));

const ids = ALL.map(s => s.id);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) throw new Error('duplicate setting ids: ' + dup.join(', '));
for (const k of Object.keys(DEPS)) for (const d of Array.isArray(DEPS[k][0]) ? DEPS[k] : [DEPS[k]]) if (!ids.includes(k) || !ids.includes(d[0])) throw new Error('bad DEPS entry ' + k);

// base-theme settings replaced by the groups above
const REMOVED = ['squar_photo_bg_image_size', 'vertical_fixed_products', 'is_more_button_enabled', 'imageZoom', 'header_is_sticky', 'topnav_is_dark', 'important_links', 'enable_more_menu', 'header_show_store_info', 'footer_is_dark',
  'static-line1', 'static-label2', 'static-line3', 'static-label4', 'static-line5', 'static-label6'];
// ours always lead, in this order; old tires ids no longer in the list are dropped; base settings kept after
const base = (json.settings || []).filter(x => !REMOVED.includes(x.id) && !/^tc[_-]/.test(x.id));
const productBase = PRODUCT_BASE.map(id => base.find(x => x.id === id)).filter(Boolean);
const listBase = LIST_BASE.map(id => base.find(x => x.id === id)).filter(Boolean);
const others = base.filter(x => !PRODUCT_BASE.includes(x.id) && !LIST_BASE.includes(x.id));
const darkAt = ALL.findIndex(x => x.id === 'tc-set-dark');
ALL.splice(ALL.findIndex(x => x.id === 'tc-set-cart'), 0, ...listBase);
ALL.splice(ALL.findIndex(x => x.id === 'tc-set-list'), 0, ...productBase);
json.settings = [...ALL, ...others];

fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log('settings:', json.settings.length, '(tires:', ALL.length, ', conditional:', ALL.filter(s => s.conditions).length, ')');
