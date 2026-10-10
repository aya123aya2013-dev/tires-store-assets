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
    F.dd('add_qty', 'كمية «أضف للسلة» من الكرت', [['إطار واحد', '1'], ['إطارين', '2'], ['4 إطارات', '4']], '1', { description: 'خاص بهذا القسم (يتجاوز «الكمية عند أضف» بإعدادات المتجر). لو سعرك للطقم يضاف طقم واحد' }),
    F.head('h-look', 'الشكل'),
    F.sw('show_filters', 'إظهار فلاتر الماركات', true),
    F.when(F.pickFrom('filter_brands', 'الماركات اللي تظهر بالفلاتر', 'brands', true, { description: 'اختر الماركات وترتيبها. اتركها فاضية لعرض ماركات المنتجات المعروضة تلقائياً' }), 'show_filters', true),
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
    F.tip('الزبون يختار الماركة ثم الموديل ثم السنة، ويطلع له المقاس مع زر يعرض الإطارات المطابقة بالزبط. الثيم فيه قائمة جاهزة بسيارات السوق السعودي، وتقدر تلصق قائمتك من إكسل أو تضيف يدوي.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'ما تعرف مقاسك؟', 40),
    F.text('title', 'العنوان', 'اختر سيارتك، ونطلع لك المقاس.', 80),
    F.text('text', 'النص الجانبي', 'الماركة، الموديل، السنة — وبس.', 120),
    F.head('h-cars', 'السيارات'),
    F.static('cars-help', '<div>طريقة القائمة:<br>• <b>القائمة الجاهزة</b> تشتغل لحالها (أشهر سيارات السوق السعودي).<br>• <b>لصق من إكسل</b>: يستبدل كل القوائم ويظهر بس اللي لصقته.<br>• <b>تفريغ القائمة الجاهزة</b> ثم <b>الإضافة اليدوية</b>: لعدد قليل من السيارات.</div>'),
    F.area('cars_paste', 'لصق قائمة من إكسل (يستبدل كل القوائم)', '', 20000, { multilanguage: false, placeholder: 'تويوتا, كامري, 2018, 2024, 215/55 R17', description: 'سطر لكل سيارة: الماركة، الموديل، من سنة، إلى سنة، المقاس. انسخ الأعمدة من إكسل أو Google Sheets والصقها هنا. لإلغاء اللصق امسح الخانة.' }),
    F.sw('use_builtin', 'استخدام القائمة الجاهزة', true, 'أطفئها لتفريغ القائمة الجاهزة واستخدام السيارات اللي تضيفها يدوي فقط'),
    F.collection('cars', 'إضافة يدوية', 'سيارة', [
      F.plain('make', 'الماركة', 'تويوتا', { maxLength: 30 }),
      F.plain('model', 'الموديل', 'كامري', { maxLength: 30 }),
      F.num('year_from', 'من سنة', 2018, 1980, 2035),
      F.num('year_to', 'إلى سنة', 2024, 1980, 2035),
      F.plain('size', 'المقاس', '215/55 R17', { maxLength: 20, description: 'مثل 215/55 R17 أو 215/55/17' }),
    ], [], 0, 200, { description: 'تُضاف للقائمة الجاهزة، وإذا نفس الماركة والموديل موجودين تغلب قيمتك' }),
    F.head('h-result', 'كرت النتيجة'),
    F.area('result_text', 'نص الشرح تحت المقاس', 'المقاس المرجعي لهذه السيارة حسب بيانات المتجر. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.', 200),
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
    F.sw('show_filters', 'إظهار فلاتر الماركات', true),
    F.when(F.pickFrom('filter_brands', 'الماركات اللي تظهر بالفلاتر', 'brands', true, { description: 'اختر الماركات وترتيبها. اتركها فاضية لعرض ماركات المنتجات المعروضة تلقائياً' }), 'show_filters', true),
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
    F.area('light_text', 'النص', 'ثلاثة أرقام، وكل رقم له معنى.\nخلّنا نساعدك تفهم مقاسك.', 160),
    F.text('light_link_text', 'نص الرابط', 'افتح دليل المقاسات', 30),
    F.link('light_link', 'الرابط'),
    F.head('h-look', 'الشكل'),
    F.sw('reverse', 'عكس ترتيب الكرتين', false),
    ...F.common('my-double-banner'),
  ]),

  // #10 مقارنة الفئات
  def('home.tire-picker', 'مقارنة الفئات (وش أهم شيء عندك؟)', 'Tire Picker (What Matters Most?)', 'sicon-chart-bar', [
    F.cover('مقارنة الفئات'),
    F.tip('الزبون يختار المقاس وأولويته (قيمة، سعر، عمر، هدوء) ونوصيه بفئة من 3. السعر = سعر المقاس الأساسي × نسبة الفئة.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'قارن قبل ما تختار', 40),
    F.text('title', 'العنوان', 'وش أهم شيء عندك؟', 60),
    F.text('price_note', 'سطر تحت الفئات', 'الأسعار تقريبية للمقارنة بين الفئات. السعر الفعلي يظهر بصفحة المنتج.', 120, { description: 'الأسعار هنا تقدير منك للمقارنة، مو سعر المنتج بسلة. لو غيّرت سعر منتج عدّل المقاسات هنا. اتركه فارغاً لإخفائه' }),
    F.head('h-sizes', 'المقاسات والأسعار'),
    F.collection('sizes', 'المقاسات', 'مقاس', [
      F.plain('size', 'المقاس', '205/55 R16', { maxLength: 20 }),
      F.num('price', 'السعر الأساسي للحبة (ر.س)', 290, 1, 100000),
    ], [['205/55 R16', 290], ['215/60 R17', 330], ['225/45 R18', 360], ['265/65 R17', 420], ['275/65 R18', 450]].map(([a, b]) => ({ 'sizes.size': a, 'sizes.price': b })), 1, 20, { description: 'أسعار تقديرية للمقارنة بين الفئات، مو سعر المنتج بسلة. استبدل الأمثلة بمقاسات وأسعار متجرك.' }),
    F.head('h-tiers', 'الفئات (3)'),
    F.collection('tiers', 'الفئات', 'فئة', [
      F.text('tier', 'اسم الفئة', 'متوسط', 20),
      F.text('name', 'اسم الإطار', 'كفر تايلندي', 40),
      F.num('factor', 'نسبة السعر من الأساسي (%)', 100, 10, 1000, { description: '100 = نفس السعر الأساسي، 124 = أغلى بـ 24%' }),
      F.num('life', 'العمر المتوقع (كم)', 60000, 0, 300000),
      F.text('quiet', 'الهدوء', 'عالي', 20),
      F.text('warranty', 'الضمان', 'سنتين', 20),
      F.text('origin', 'المنشأ', 'تايلند', 20),
      F.text('fit', 'مناسب لـ', 'يومي وسفر', 30),
      F.link('link', 'رابط زر «اختر»'),
    ], [
      { 'tiers.tier': 'اقتصادي', 'tiers.name': 'كفر صيني', 'tiers.factor': 100, 'tiers.life': 40000, 'tiers.quiet': 'مقبول', 'tiers.warranty': 'سنة', 'tiers.origin': 'الصين', 'tiers.fit': 'داخل المدينة' },
      { 'tiers.tier': 'متوسط', 'tiers.name': 'كفر تايلندي', 'tiers.factor': 124, 'tiers.life': 60000, 'tiers.quiet': 'عالي', 'tiers.warranty': 'سنتين', 'tiers.origin': 'تايلند', 'tiers.fit': 'يومي وسفر' },
      { 'tiers.tier': 'ممتاز', 'tiers.name': 'هانكوك', 'tiers.factor': 145, 'tiers.life': 75000, 'tiers.quiet': 'عالي جداً', 'tiers.warranty': '5 سنوات', 'tiers.origin': 'كوريا', 'tiers.fit': 'سفر وطرق سريعة' },
    ], 1, 3),
    F.head('h-prio', 'أزرار الأولويات (حتى 4)'),
    F.collection('priorities', 'الأولويات', 'أولوية', [
      F.text('label', 'نص الزر', 'الأفضل قيمة', 20),
      F.dd('tier', 'الفئة الموصى فيها', [['الفئة الأولى', '1'], ['الفئة الثانية', '2'], ['الفئة الثالثة', '3']], '2'),
      F.text('reason', 'جملة السبب', 'يعطيك أقل تكلفة لكل كيلومتر مع عمر وهدوء ممتازين.', 120),
    ], [
      { 'priorities.label': 'الأفضل قيمة', 'priorities.tier': '2', 'priorities.reason': 'يعطيك أقل تكلفة لكل كيلومتر مع عمر وهدوء ممتازين.' },
      { 'priorities.label': 'أقل سعر', 'priorities.tier': '1', 'priorities.reason': 'أقل دفعة اليوم، ومناسب للمشاوير داخل المدينة.' },
      { 'priorities.label': 'أطول عمر', 'priorities.tier': '3', 'priorities.reason': 'يعيش أطول، فتبدّل أقل على المدى البعيد.' },
      { 'priorities.label': 'أهدأ قيادة', 'priorities.tier': '3', 'priorities.reason': 'أهدأ صوت وأنعم قيادة على الطرق السريعة.' },
    ], 1, 4),
    ...F.common('my-picker'),
  ]),

  // #11 شبكة الخدمات + حاسبة القسط
  def('home.services-bento', 'شبكة الخدمات وحاسبة القسط', 'Services Bento & Instalment Calculator', 'sicon-layout-grid-rearrange', [
    F.cover('شبكة الخدمات'),
    F.tip('4 بطاقات: صورة كبيرة للتركيب، حاسبة قسط ذهبية، صورة صغيرة، وبطاقة غامقة عريضة للشركات.'),
    F.head('h-texts', 'العنوان'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'الخدمات', 40),
    F.text('title', 'العنوان', 'من الطلب لين التركيب.', 60),
    F.sw('show_link', 'إظهار الرابط بجانب العنوان', true),
    F.when(F.text('head_link_text', 'نص الرابط', 'مواقع المراكز', 30), 'show_link', true),
    F.when(F.link('head_link', 'الرابط'), 'show_link', true),
    F.head('h-big', 'البطاقة الكبيرة (صورة)'),
    F.image('big_image', 'الصورة', '1200×1000 بكسل. اتركها فارغة لصورة الثيم.', 1200, 1000),
    F.text('big_title', 'العنوان', 'تركيب مجاني بنفس اليوم', 50),
    F.area('big_text', 'النص', 'اختر «استلام وتركيب» في السلة، ونركّب إطاراتك على جنوطك في أحد مركزينا بالرياض.', 160),
    F.text('big_link_text', 'نص الرابط', 'احجز موعد', 30),
    F.link('big_link', 'الرابط'),
    F.head('h-calc', 'حاسبة القسط'),
    F.sw('calc_show', 'إظهار حاسبة القسط', true),
    F.when(F.text('calc_title', 'العنوان', 'كم القسط؟', 30), 'calc_show', true),
    F.when(F.text('calc_text', 'النص', 'حرّك المؤشر حسب سعر الأربع إطارات.', 80), 'calc_show', true),
    F.when(F.num('calc_min', 'أقل مبلغ (ر.س)', 800, 40, 100000), 'calc_show', true),
    F.when(F.num('calc_max', 'أعلى مبلغ (ر.س)', 4000, 80, 200000), 'calc_show', true),
    F.when(F.num('calc_parts', 'عدد الدفعات', 4, 2, 12), 'calc_show', true),
    F.when(F.text('calc_providers', 'مزودي التقسيط', 'تابي أو تمارا', 40), 'calc_show', true),
    F.head('h-small', 'البطاقة الصغيرة (صورة)'),
    F.image('small_image', 'الصورة', '800×600 بكسل. اتركها فارغة لصورة الثيم.', 800, 600),
    F.text('small_title', 'العنوان', 'فحص النقشة والضغط', 40),
    F.text('small_link_text', 'نص الرابط', 'مجاناً مع أي زيارة', 30),
    F.link('small_link', 'الرابط'),
    F.head('h-fleet', 'البطاقة الغامقة العريضة'),
    F.text('fleet_title', 'العنوان', 'للشركات والأساطيل', 40),
    F.area('fleet_text', 'النص', 'أسعار كميات، فواتير ضريبية، وجدولة تبديل دوري لسياراتكم.', 160),
    F.text('fleet_link_text', 'نص الرابط', 'اطلب عرض سعر', 30),
    F.link('fleet_link', 'الرابط'),
    ...F.common('my-bento'),
  ]),

  // #12 شريط متحرك
  def('home.ticker', 'شريط متحرك', 'Moving Ticker', 'sicon-arrow-left-right', [
    F.cover('شريط متحرك'),
    F.tip('شريط غامق يتحرك بروابط مرقّمة وجمل قصيرة. العنصر بدون رابط يظهر كجملة بنقطة ذهبية.'),
    F.head('h-items', 'العناصر (حتى 10)'),
    F.collection('items', 'العناصر', 'عنصر', [
      F.text('text', 'النص', 'المقاس', 50),
      F.link('link', 'الرابط (اختياري)', 'بدون رابط = جملة بنقطة ذهبية'),
      F.sw('number', 'رقم قبله (01، 02…)', true),
    ], [
      { 'items.text': 'المقاس', 'items.number': true }, { 'items.text': 'الإطارات', 'items.number': true },
      { 'items.text': 'التركيب', 'items.number': true }, { 'items.text': 'الدليل', 'items.number': true },
      { 'items.text': 'إطارات أصلية بضمان الوكيل', 'items.number': false }, { 'items.text': 'تركيب مجاني بالرياض', 'items.number': false }, { 'items.text': 'قسّطها مع تابي وتمارا', 'items.number': false },
    ], 1, 10),
    F.head('h-look', 'الشكل والحركة'),
    F.dd('speed', 'السرعة', [['عادية', 'normal'], ['بطيئة', 'slow'], ['سريعة', 'fast']], 'normal'),
    F.sw('pause_on_hover', 'إيقاف عند مرور الماوس', true),
    F.dd('bg', 'لون الخلفية', [['غامق', 'dark'], ['ذهبي', 'gold']], 'dark'),
    ...F.common('my-ticker'),
  ]),

  // #13 صف الخدمات
  def('home.services-row', 'صف الخدمات (كل ما تحتاجه)', 'Services Row', 'sicon-store2', [
    F.cover('صف الخدمات'),
    F.tip('عمود تعريف و3 بطاقات. كل بطاقة: صورة، أو رسمة شاحنة التوصيل، أو رسمة دليل المقاسات الغامقة.'),
    F.head('h-intro', 'عمود التعريف'),
    F.text('kicker', 'السطر الصغير', 'أكثر من مجرد إطار', 40),
    F.area('title', 'العنوان', 'كل ما تحتاجه\nلإطاراتك.', 60),
    F.area('text', 'النص', 'من اختيار المقاس إلى التركيب.\nتجربة بسيطة، واهتمام بالتفاصيل.', 160),
    F.text('link_text', 'نص الرابط', 'تعرّف على خدماتنا', 30),
    F.link('link', 'الرابط'),
    F.head('h-cards', 'البطاقات (3)'),
    F.collection('cards', 'البطاقات', 'بطاقة', [
      F.dd('art', 'شكل الصورة', [['صورة', 'photo'], ['رسمة شاحنة التوصيل', 'truck'], ['رسمة دليل المقاسات (غامقة)', 'guide']], 'photo'),
      F.when(F.image('image', 'الصورة', '800×500 بكسل', 800, 500), 'art', 'photo'),
      F.when(F.text('tag', 'شارة صغيرة على الصورة (اختياري)', 'عناية بالتفاصيل', 30), 'art', 'photo'),
      F.text('label', 'النص على الرسمة', 'TIRES STORE', 20, { description: 'لرسمة الشاحنة أو دليل المقاسات' }),
      F.text('title', 'العنوان', 'تركيب احترافي', 30),
      F.text('text', 'السطر', 'إطاراتك في أيدٍ خبيرة', 50),
      F.link('link', 'الرابط'),
    ], [
      { 'cards.art': 'photo', 'cards.tag': 'عناية بالتفاصيل', 'cards.title': 'تركيب احترافي', 'cards.text': 'إطاراتك في أيدٍ خبيرة' },
      { 'cards.art': 'truck', 'cards.label': 'TIRES STORE', 'cards.title': 'توصيل إلى بابك', 'cards.text': 'خيارات تناسب وجهتك' },
      { 'cards.art': 'guide', 'cards.label': '205 / 55 R16', 'cards.title': 'دليل المقاسات', 'cards.text': 'اعرف مقاسك بكل سهولة' },
    ], 1, 3),
    ...F.common('my-services'),
  ]),
];

// components #14 onwards live one per file in scripts/tc/ (NN-name.cjs, sorted), each exporting (F, def) => component
const dir = path.join(__dirname, 'tc');
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.cjs')).sort()) components.push(require(path.join(dir, f))(F, def));
}

let after = 'home.size-finder';
for (const c of components) { F.upsert(json, c, after); after = c.path; }
// editor cover images (shot from the approved design), shipped inside the theme
// public CDN copy of public/assets/covers (repo aya123aya2013-dev/tires-store-assets) — the editor can't read theme-relative URLs
const COVERS = 'https://cdn.jsdelivr.net/gh/aya123aya2013-dev/tires-store-assets@main/covers/';
const coversDir = path.join(__dirname, '../public/assets/covers');
for (const c of json.components) {
  const key = c.path.replace(/^home\./, '');
  if (!fs.existsSync(path.join(coversDir, `${key}.webp`))) continue;
  c.image = `${COVERS}${key}.webp`;
  const cover = c.fields.find(f => f.id === 'tc-cover');
  if (cover) cover.value = `<div><img class='w-full' src='${c.image}' alt=''></div>`;
}

fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log(json.components.map(c => c.path).join('\n'));
