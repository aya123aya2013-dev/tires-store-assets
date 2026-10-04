// Builds the web-sized home images from the full-resolution originals.
// Originals live outside the theme (../design-assets/home-originals) so they
// aren't shipped; outputs go to public/assets/images/home/*.webp.
//
//   node scripts/optimize-home-images.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '../../design-assets/home-originals');
const OUT = path.join(__dirname, '../public/assets/images/home');

/** output name → [source file, max width, optional crop {left,top,width,height} in source px] */
const JOBS = {
  'hero-tire': ['imge-4.png', 1100],
  'install': ['imge-7.png', 900],
  // imge-1 is a flat tire — not for a tire store. Chrome wheel, cropped to the wheel.
  'type-car': ['imge-3.png', 640, { left: 480, top: 620, width: 1060, height: 1060 }],
  'type-suv': ['imge-11.png', 700],
  'type-truck': ['imge-2.png', 560],
  'installments': ['imge-3.png', 700],
  'ready': ['imge-6.png', 760],
  'review': ['imge-8.png', 1100],
  'centers': ['imge-9.png', 900],
  'cta': ['imge-10.png', 640],
  'blog-1': ['imge-8.png', 900, { left: 1300, top: 0, width: 3200, height: 2000 }],
  'blog-2': ['imge-2.png', 900, { left: 0, top: 900, width: 2928, height: 1830 }],
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, [file, width, crop]] of Object.entries(JOBS)) {
    let img = sharp(path.join(SRC, file));
    if (crop) img = img.extract(crop);
    const out = path.join(OUT, `${name}.webp`);
    await img.resize({ width, withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 90 }).toFile(out);
    console.log(`${name}.webp  ${Math.round(fs.statSync(out).size / 1024)} KB`);
  }
})();
