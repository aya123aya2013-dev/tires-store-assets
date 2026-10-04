// Builds the home hero / tire images from the "Madar" mockup assets, recoloring
// the mockup's lime accent (brake calipers) to the brand gold.
//   node scripts/build-madar-images.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '../../design-assets/madar');
const OUT = path.join(__dirname, '../public/assets/images/home');

const GOLD_HUE = 41; // #ffb71b

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max / 255];
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** Lime (hue ~70–100°, vivid, bright) → gold, keeping each pixel's shading. */
async function recolorLime(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    if (h >= 62 && h <= 105 && s >= 0.5 && v >= 0.4) {
      const [r, g, b] = hsvToRgb(GOLD_HUE, Math.min(1, s * 1.05), v);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
  return sharp(data, { raw: info });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const hero = await recolorLime(path.join(SRC, 'hero.png'));
  await hero.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, 'madar-hero.webp'));
  const mobile = await recolorLime(path.join(SRC, 'hero.png'));
  await mobile.resize({ width: 900 }).webp({ quality: 78 }).toFile(path.join(OUT, 'madar-hero-m.webp'));
  await sharp(path.join(SRC, 'tire.png')).resize({ width: 700, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(OUT, 'madar-tire.webp'));
  for (const f of ['madar-hero.webp', 'madar-hero-m.webp', 'madar-tire.webp']) {
    console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), 'KB');
  }
})();
