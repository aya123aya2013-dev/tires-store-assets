/**
 * Writes the "Tires Store" section components (#3 onwards) into twilight.json.
 * Run after editing:  node scripts/tc-components.cjs
 * Order on the home page follows design/final.html.
 */
const fs = require('fs');
const path = require('path');
const F = require('./tc-fields.cjs');

const file = path.join(__dirname, '../twilight.json');
const json = JSON.parse(fs.readFileSync(file, 'utf8'));
const def = (path_, ar, en, icon, fields) => ({ title: { ar: `${ar} (تايرز ستور)`, en: `${en} (Tires Store)` }, icon, path: path_, is_default: true, fields });

const components = [
  // #3 شريط المميزات
  def('home.benefits-strip', 'شريط المميزات', 'Benefits Strip', 'sicon-award-ribbon', [
    F.cover('شريط المميزات'),
    F.tip('من 2 إلى 4 مميزات، كل وحدة: أيقونة + عنوان + سطر. يفضّل تحت أداة اختيار المقاس.'),
    F.head('h-items', 'المميزات'),
    F.collection('items', 'المميزات', 'ميزة', [
      F.icon('icon', 'الأيقونة', 'shield'),
      F.text('title', 'العنوان', 'إطارات أصلية', 30),
      F.text('text', 'السطر', 'من علامات تثق بها', 50),
    ], [
      { 'items.icon': 'shield', 'items.title': 'إطارات أصلية', 'items.text': 'من علامات تثق بها' },
      { 'items.icon': 'wrench', 'items.title': 'تركيب بالرياض', 'items.text': 'عناية بكل التفاصيل' },
      { 'items.icon': 'card', 'items.title': 'خيارات دفع مرنة', 'items.text': 'تابي وتمارا ومدى' },
      { 'items.icon': 'truck', 'items.title': 'توصيل لجميع المناطق', 'items.text': 'رحلتك تبدأ من بابك' },
    ], 2, 4),
    ...F.common('my-benefits'),
  ]),

  // #4 منتجات بسلايدر (إطارات الأسبوع)
  def('home.tire-slider', 'إطارات الأسبوع (سلايدر منتجات)', 'Tires of the Week (Product Slider)', 'sicon-list-play', [
    F.cover('إطارات الأسبوع'),
    F.tip('سلايدر منتجات من متجرك، مع فلاتر بالماركات وأسهم. اختر مصدر المنتجات وعددها.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'الأكثر طلباً', 40),
    F.text('title', 'العنوان', 'إطارات هالأسبوع', 60),
    F.head('h-products', 'المنتجات'),
    ...F.productSource('products', 'best_selling'),
    F.num('limit', 'عدد المنتجات', 8, 4, 12),
    F.dd('add_qty', 'كمية «أضف للسلة» من الكرت', [['إطار واحد', '1'], ['إطارين', '2'], ['4 إطارات', '4']], '1'),
    F.head('h-look', 'الشكل'),
    F.sw('show_filters', 'إظهار فلاتر الماركات', true, 'الماركات تنقرأ تلقائياً من المنتجات المعروضة'),
    F.sw('show_arrows', 'إظهار الأسهم', true),
    F.sw('feature_first', 'تمييز أول منتج بإطار ذهبي', true),
    ...F.common('my-slider'),
  ]),

  // #5 شريط الماركات
  def('home.brands-marquee', 'شريط الماركات', 'Brands Marquee', 'sicon-award-ribbon', [
    F.cover('شريط الماركات'),
    F.tip('شريط متحرك بأسماء أو شعارات الماركات. يقرأ ماركات متجرك تلقائياً، أو تضيفها بنفسك.'),
    F.head('h-texts', 'النصوص'),
    F.text('line_1', 'النص الجانبي — السطر الأول', 'علامات أصلية', 30),
    F.text('line_2', 'النص الجانبي — السطر الثاني (غامق)', 'من الوكيل مباشرة', 30),
    F.head('h-brands', 'الماركات'),
    F.dd('brands_source', 'مصدر الماركات', [['ماركات متجري تلقائياً', 'store'], ['أضيفها بنفسي', 'manual']], 'store'),
    F.when(F.collection('brands', 'الماركات', 'ماركة', [
      F.plain('name', 'اسم الماركة', 'MICHELIN', { maxLength: 30 }),
      F.image('logo', 'الشعار (اختياري)', 'PNG بخلفية شفافة، ارتفاع 80 بكسل تقريباً. بدون شعار يظهر الاسم بخط عريض.', 300, 80),
      F.link('link', 'الرابط'),
    ], [], 0, 30), 'brands_source', 'manual'),
    F.head('h-motion', 'الحركة'),
    F.sw('animate', 'تحريك الشريط', true, 'يتوقف عند مرور الماوس'),
    F.when(F.dd('speed', 'السرعة', [['عادية', 'normal'], ['بطيئة', 'slow'], ['سريعة', 'fast']], 'normal'), 'animate', true),
    F.sw('grayscale', 'الشعارات رمادية (تتلوّن عند المرور)', true),
    ...F.common('my-brands'),
  ]),

  // #6 كروت الفئات
  def('home.category-cards', 'كروت الفئات', 'Category Cards', 'sicon-layout-grid-rearrange', [
    F.cover('كروت الفئات'),
    F.tip('كروت مرقّمة توصل الزبون لفئات سيارته (سيدان، دفع رباعي…). اربط كل كرت بتصنيف من متجرك.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'لكل سيارة، اختيار', 40),
    F.text('title', 'العنوان', 'جاهزة لطريقك.', 60),
    F.text('text', 'النص الجانبي', 'اختر فئة سيارتك، واكتشف الخيارات المناسبة.', 120),
    F.head('h-cards', 'الكروت'),
    F.collection('cards', 'الكروت', 'كرت', [
      F.icon('icon', 'الأيقونة', 'cat-all'),
      F.image('image', 'صورة بدل الأيقونة (اختياري)', 'PNG بخلفية شفافة، 200×200 بكسل', 200, 200),
      F.text('title', 'العنوان', 'سيارات سيدان', 30),
      F.text('text', 'السطر', 'راحة للاستخدام اليومي', 50),
      F.link('link', 'الرابط', 'اختر التصنيف المرتبط بهالفئة'),
      F.sw('highlight', 'كرت مميّز (ذهبي)', false),
    ], [
      { 'cards.icon': 'cat-all', 'cards.title': 'جميع الإطارات', 'cards.text': 'استكشف المجموعة', 'cards.highlight': true },
      { 'cards.icon': 'cat-sedan', 'cards.title': 'سيارات سيدان', 'cards.text': 'راحة للاستخدام اليومي', 'cards.highlight': false },
      { 'cards.icon': 'cat-suv', 'cards.title': 'دفع رباعي', 'cards.text': 'ثقة في كل رحلة', 'cards.highlight': false },
      { 'cards.icon': 'cat-truck', 'cards.title': 'نقل و بيك أب', 'cards.text': 'تحمّل ومسافات طويلة', 'cards.highlight': false },
    ], 2, 6),
    F.head('h-look', 'الشكل'),
    F.sw('light_bg', 'خلفية القسم فاتحة (بيج)', false),
    ...F.common('my-categories'),
  ]),

  // #7 تسوّق حسب سيارتك
  def('home.shop-by-car', 'تسوّق حسب سيارتك', 'Shop by Car', 'sicon-car', [
    F.cover('تسوّق حسب سيارتك'),
    F.tip('الزبون يختار الماركة ثم الموديل ثم السنة، ويطلع له المقاس مع زر يعرض الإطارات المطابقة بالزبط. القائمة جاهزة بسيارات شائعة وتقدر تعدّلها.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'ما تعرف مقاسك؟', 40),
    F.text('title', 'العنوان', 'اختر سيارتك، ونطلع لك المقاس.', 80),
    F.text('text', 'النص الجانبي', 'الماركة، الموديل، السنة — وبس.', 120),
    F.head('h-cars', 'السيارات'),
    F.collection('cars', 'السيارات', 'سيارة', [
      F.plain('make', 'الماركة', 'تويوتا', { maxLength: 30 }),
      F.plain('model', 'الموديل', 'كامري', { maxLength: 30 }),
      F.num('year_from', 'من سنة', 2018, 1980, 2035),
      F.num('year_to', 'إلى سنة', 2024, 1980, 2035),
      F.plain('size', 'المقاس', '215/55 R17', { maxLength: 20, description: 'مثل 215/55 R17 أو 215/55/17' }),
    ], [{"cars.make":"تويوتا","cars.model":"كامري","cars.year_from":2018,"cars.year_to":2024,"cars.size":"215/55 R17"},{"cars.make":"تويوتا","cars.model":"لاند كروزر","cars.year_from":2016,"cars.year_to":2024,"cars.size":"285/60 R18"},{"cars.make":"تويوتا","cars.model":"هايلكس","cars.year_from":2016,"cars.year_to":2024,"cars.size":"265/65 R17"},{"cars.make":"تويوتا","cars.model":"يارس","cars.year_from":2018,"cars.year_to":2024,"cars.size":"185/60 R15"},{"cars.make":"هيونداي","cars.model":"النترا","cars.year_from":2017,"cars.year_to":2024,"cars.size":"205/55 R16"},{"cars.make":"هيونداي","cars.model":"توسان","cars.year_from":2019,"cars.year_to":2024,"cars.size":"225/60 R17"},{"cars.make":"هيونداي","cars.model":"أكسنت","cars.year_from":2018,"cars.year_to":2024,"cars.size":"185/65 R15"},{"cars.make":"هيونداي","cars.model":"سوناتا","cars.year_from":2020,"cars.year_to":2024,"cars.size":"215/55 R17"},{"cars.make":"نيسان","cars.model":"باترول","cars.year_from":2014,"cars.year_to":2024,"cars.size":"275/70 R18"},{"cars.make":"نيسان","cars.model":"ألتيما","cars.year_from":2019,"cars.year_to":2024,"cars.size":"215/60 R16"},{"cars.make":"نيسان","cars.model":"صني","cars.year_from":2018,"cars.year_to":2024,"cars.size":"185/65 R15"},{"cars.make":"كيا","cars.model":"سبورتاج","cars.year_from":2019,"cars.year_to":2024,"cars.size":"225/60 R17"},{"cars.make":"كيا","cars.model":"سيراتو","cars.year_from":2019,"cars.year_to":2024,"cars.size":"205/55 R16"},{"cars.make":"كيا","cars.model":"K5","cars.year_from":2021,"cars.year_to":2024,"cars.size":"215/55 R17"},{"cars.make":"شفروليه","cars.model":"تاهو","cars.year_from":2015,"cars.year_to":2024,"cars.size":"275/55 R20"},{"cars.make":"شفروليه","cars.model":"ماليبو","cars.year_from":2017,"cars.year_to":2024,"cars.size":"225/55 R17"},{"cars.make":"فورد","cars.model":"F-150","cars.year_from":2018,"cars.year_to":2024,"cars.size":"275/65 R18"},{"cars.make":"فورد","cars.model":"إكسبلورر","cars.year_from":2020,"cars.year_to":2024,"cars.size":"255/65 R18"},{"cars.make":"جي إم سي","cars.model":"يوكن","cars.year_from":2015,"cars.year_to":2024,"cars.size":"275/55 R20"},{"cars.make":"جي إم سي","cars.model":"سييرا","cars.year_from":2019,"cars.year_to":2024,"cars.size":"265/70 R17"},{"cars.make":"لكزس","cars.model":"LX","cars.year_from":2016,"cars.year_to":2024,"cars.size":"275/50 R21"},{"cars.make":"لكزس","cars.model":"ES","cars.year_from":2019,"cars.year_to":2024,"cars.size":"235/45 R18"}], 0, 200),
    F.head('h-result', 'كرت النتيجة'),
    F.area('result_text', 'نص الشرح تحت المقاس', 'المقاس الأصلي من المصنع. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.', 200),
    F.text('btn_text', 'نص الزر', 'اعرض الإطارات', 30),
    F.text('empty_text', 'النص قبل اختيار السيارة', 'اختر سيارتك عشان نعرض المقاس والإطارات المتوفرة.', 120),
    F.head('h-look', 'الشكل'),
    F.sw('gold_bg', 'خلفية ذهبية فاتحة', true),
    ...F.common('my-cars'),
  ]),

  // #8 شبكة منتجات
  def('home.tire-grid', 'شبكة منتجات (إطارات لكل رحلة)', 'Product Grid (Tires for Every Trip)', 'sicon-grid', [
    F.cover('شبكة المنتجات'),
    F.tip('شبكة منتجات من متجرك مع فلاتر بالماركات وترتيب وزر مفضلة. القطر الباهت ورا الصورة يُقرأ من مقاس المنتج.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'اختياراتنا لك', 40),
    F.text('title', 'العنوان', 'إطارات لكل رحلة.', 60),
    F.sw('show_view_all', 'إظهار رابط «عرض الكل»', true),
    F.when(F.text('view_all_text', 'نص الرابط', 'عرض جميع الإطارات', 40), 'show_view_all', true),
    F.when(F.link('view_all_link', 'رابط «عرض الكل»'), 'show_view_all', true),
    F.head('h-products', 'المنتجات'),
    ...F.productSource('products', 'latest'),
    F.num('limit', 'عدد المنتجات', 8, 4, 16),
    F.head('h-look', 'الشكل'),
    F.dd('columns', 'عدد الأعمدة على الكمبيوتر', [['4 أعمدة', '4'], ['3 أعمدة', '3']], '4'),
    F.sw('show_toolbar', 'إظهار شريط العدد والترتيب', true),
    F.sw('show_filters', 'إظهار فلاتر الماركات', true, 'الماركات تنقرأ تلقائياً من المنتجات المعروضة'),
    F.sw('feature_first', 'تمييز أول منتج («اختيار مميز»)', true),
    ...F.common('my-grid'),
  ]),

  // #9 بانر مزدوج
  def('home.double-banner', 'بانر مزدوج', 'Double Banner', 'sicon-image', [
    F.cover('بانر مزدوج'),
    F.tip('كرتين جنب بعض: غامق بصورة إطار وقطعة ذهبية مائلة، وفاتح بالمقاس كبير. لكتابة سطر جديد بالعنوان اضغط Enter.'),
    F.head('h-dark', 'الكرت الغامق'),
    F.text('dark_kicker', 'السطر الصغير', 'للرحلة، من أولها', 40),
    F.area('dark_title', 'العنوان', 'أربع إطارات.\nاختيار واحد مدروس.', 80),
    F.text('dark_text', 'النص', 'ابدأ بالمقاس، وقارن المجموعة المناسبة لسيارتك.', 120),
    F.text('dark_link_text', 'نص الرابط', 'اكتشف الإطارات', 30),
    F.link('dark_link', 'الرابط'),
    F.image('dark_image', 'صورة الإطار', 'PNG بخلفية شفافة، 800×800 بكسل. اتركها فارغة لاستخدام صورة الثيم.', 800, 800),
    F.color('slab_color', 'لون القطعة المائلة', '#ffb71b'),
    F.head('h-light', 'الكرت الفاتح'),
    F.text('light_kicker', 'السطر الصغير', 'دقيقة وحدة تكفي', 40),
    F.text('light_size', 'النص الكبير', '205 / 55 R16', 20),
    F.text('light_ghost', 'الحرف الباهت بالخلفية', 'R', 3),
    F.area('light_text', 'النص', 'ثلاثة أرقام، وكل رقم له معنى.\nخلّينا نساعدك تفهم مقاسك.', 160),
    F.text('light_link_text', 'نص الرابط', 'افتح دليل المقاسات', 30),
    F.link('light_link', 'الرابط'),
    F.head('h-look', 'الشكل'),
    F.sw('reverse', 'عكس ترتيب الكرتين', false),
    ...F.common('my-double-banner'),
  ]),
];

let after = 'home.size-finder';
for (const c of components) { F.upsert(json, c, after); after = c.path; }
fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log(json.components.map(c => c.path).join('\n'));
