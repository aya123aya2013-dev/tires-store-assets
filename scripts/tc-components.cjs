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
];

let after = 'home.size-finder';
for (const c of components) { F.upsert(json, c, after); after = c.path; }
fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log(json.components.map(c => c.path).join('\n'));
