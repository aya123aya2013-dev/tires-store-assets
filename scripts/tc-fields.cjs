/**
 * Field builders for twilight.json components — one place so every component's
 * editor looks the same (grouped headings, same wording, shared settings at the end).
 */
const { randomUUID: uuid } = require('crypto');

const cover = (name) => ({ type: 'static', format: 'description', id: 'tc-cover',
  value: `<div style="background:#1d2023;color:#ffb71b;border-radius:12px;padding:22px;text-align:center;font-weight:700">TIRES STORE<br><span style="color:#fff;font-size:18px">${name}</span></div>` });
const tip = (text) => ({ type: 'static', format: 'description', id: 'tc-tip', value: `<div>💡 ${text}</div>` });
const staticHtml = (id, html) => ({ type: 'static', format: 'description', id, value: html });
const head = (id, title) => ({ type: 'static', format: 'description', id,
  value: `<div style="font-weight:700;margin-top:6px;padding-bottom:6px;border-bottom:1px solid #e8e7e3">${title}</div>` });
const text = (id, label, value, max = 100, extra = {}) => ({ type: 'string', icon: 'sicon-format-text-alt', label, multilanguage: true, id, value, required: false, format: 'text', description: null, placeholder: value, minLength: 0, maxLength: max, ...extra });
const area = (id, label, value, max = 300, extra = {}) => ({ type: 'string', icon: 'sicon-typography', label, multilanguage: true, id, value, required: false, format: 'textarea', description: null, placeholder: value, minLength: 0, maxLength: max, ...extra });
const plain = (id, label, value, extra = {}) => ({ type: 'string', icon: 'sicon-format-text-alt', label, multilanguage: false, id, value, required: false, format: 'text', description: null, placeholder: value, minLength: 0, maxLength: 100, ...extra });
const image = (id, label, desc, w, h, extra = {}) => ({ type: 'string', icon: 'sicon-image', value: null, label, id, format: 'image', required: false, placeholder: null, description: desc, settings: { width: w, height: h }, ...extra });
const sw = (id, label, value, desc = null, extra = {}) => ({ type: 'boolean', icon: 'sicon-toggle-off', label, description: desc, id, format: 'switch', required: false, value, selected: value, ...extra });
const num = (id, label, value, min, max, extra = {}) => ({ type: 'number', icon: 'sicon-pencil-ruler', label, id, format: 'integer', required: false, value, minimum: min, maximum: max, description: null, ...extra });
const color = (id, label, value) => ({ type: 'string', icon: 'sicon-format-fill', label, id, format: 'color', value, required: false, description: null });
const dd = (id, label, opts, sel, extra = {}) => {
  const o = opts.map(([l, v]) => ({ label: l, value: v, key: uuid() }));
  return { id, type: 'items', format: 'dropdown-list', label, description: null, labelHTML: null, icon: 'sicon-list', selected: [o.find(x => x.value === sel) || o[0]], options: o, source: 'Manual', required: false, ...extra };
};
const SOURCES = [
  ['منتج', 'products'], ['منتجات مع وسم', 'products_tags'], ['تصنيف', 'categories'], ['ماركة تجارية', 'brands'],
  ['صفحة تعريفية', 'pages'], ['مقالة', 'blog_articles'], ['تصنيف ضمن المدونة', 'blog_categories'],
  ['التخفيضات', 'offers_link'], ['الماركات التجارية', 'brands_link'], ['المدونة', 'blog_link'], ['رابط خارجي', 'custom'],
].map(([label, v]) => ({ label, key: v, value: v }));
const link = (id, label, desc = 'اختر منتج أو تصنيف أو ماركة أو صفحة، أو ضع رابط خارجي', extra = {}) => ({ type: 'items', icon: 'sicon-link', label, id, value: null, description: desc, required: false, format: 'variable-list', searchable: true, source: 'custom', sources: SOURCES, ...extra });
const pickFrom = (id, label, source, multi = false, extra = {}) => ({ type: 'items', icon: 'sicon-keyboard_arrow_down', label, id, format: 'dropdown-list', description: null, selected: [], options: [], required: false, multichoice: multi, searchable: true, source, value: [], ...extra });
const collection = (id, label, itemLabel, fields, value, min = 0, max = 10, extra = {}) => ({
  id, type: 'collection', format: 'collection', required: false, minLength: min, maxLength: max, label, item_label: itemLabel, value,
  fields: fields.map(f => ({ ...f, id: `${id}.${f.id}`, conditions: f.conditions && f.conditions.map(c => ({ ...c, id: `${id}.${c.id}` })) })),
  ...extra,
});
const when = (field, id, value) => ({ ...field, conditions: [...(field.conditions || []), { id, operation: '=', value }] });

// settings every component ends with (components-spec.md → "إعدادات مشتركة")
const SPACE = [['عادية', 'normal'], ['صغيرة', 'small'], ['كبيرة', 'large'], ['بدون', 'none']];
const common = (cls = 'my-section') => [
  head('h-common', 'إعدادات عامة'),
  sw('show_mobile', 'إظهار على الجوال', true),
  sw('show_desktop', 'إظهار على الكمبيوتر', true),
  dd('space_top', 'المسافة فوق القسم', SPACE, 'normal'),
  dd('space_bottom', 'المسافة تحت القسم', SPACE, 'normal'),
  { type: 'string', icon: 'sicon-format-text-alt', label: 'كلاس CSS مخصص', multilanguage: false, id: 'custom_class', value: null, required: false, format: 'text', description: 'حقل خاص بالمطورين ومصممين المتاجر: اسم كلاس يضاف للعنصر لتعديل شكله من CSS المتجر', placeholder: cls, minLength: 0, maxLength: 60 },
];

const ICONS = [
  ['درع (أصلي / ضمان)', 'shield'], ['مفتاح (تركيب)', 'wrench'], ['بطاقة (دفع)', 'card'], ['شاحنة (توصيل)', 'truck'],
  ['إطار', 'tire'], ['تقويم', 'cal'], ['موقع', 'pin'], ['جوال', 'phone'], ['بحث', 'search'], ['قلب', 'heart'],
  ['شبكة', 'grid'], ['بيت', 'home'], ['كل الإطارات', 'cat-all'], ['سيدان', 'cat-sedan'], ['دفع رباعي', 'cat-suv'], ['نقل وبيك أب', 'cat-truck'],
];
const icon = (id, label, sel) => dd(id, label, ICONS, sel);

/** where the products come from: best sellers / latest / offers / category / brand / hand-picked */
const productSource = (prefix, sel = 'best_selling') => [
  dd(`${prefix}_source`, 'مصدر المنتجات', [['الأكثر مبيعاً', 'best_selling'], ['الأحدث', 'latest'], ['العروض والتخفيضات', 'offers'], ['الأعلى تقييماً', 'top-rated'], ['من تصنيف', 'categories'], ['من ماركة', 'brands'], ['منتجات أختارها', 'selected']], sel),
  when(pickFrom(`${prefix}_category`, 'التصنيف', 'categories', true), `${prefix}_source`, 'categories'),
  when(pickFrom(`${prefix}_brand`, 'الماركة', 'brands', true), `${prefix}_source`, 'brands'),
  when(pickFrom(`${prefix}_selected`, 'المنتجات', 'products', true, { maxLength: 16 }), `${prefix}_source`, 'selected'),
];

/** add or replace a component (matched by path) in twilight.json, keeping its key */
function upsert(json, comp, afterPath) {
  const i = json.components.findIndex(c => c.path === comp.path);
  if (i >= 0) { comp.key = json.components[i].key; json.components[i] = comp; return; }
  comp.key = uuid();
  const at = afterPath ? json.components.findIndex(c => c.path === afterPath) + 1 : 0;
  json.components.splice(at > 0 ? at : json.components.length, 0, comp);
}

module.exports = { static: staticHtml, productSource, cover, tip, head, text, area, plain, image, sw, num, color, dd, link, pickFrom, collection, when, common, icon, upsert, uuid };
