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

const settings = json.settings || [];
for (const s of GROUP_GENERAL) {
  const i = settings.findIndex(x => x.id === s.id);
  if (i >= 0) settings[i] = s;
}
// new ones go to the top, in order, ahead of the old base-theme settings
const fresh = GROUP_GENERAL.filter(s => !settings.some(x => x.id === s.id));
json.settings = [...fresh, ...settings];

fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log('settings:', json.settings.length, '(tires group 1:', GROUP_GENERAL.length, ')');
