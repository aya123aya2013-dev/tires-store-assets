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
];

let after = 'home.size-finder';
for (const c of components) { F.upsert(json, c, after); after = c.path; }
fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log(json.components.map(c => c.path).join('\n'));
