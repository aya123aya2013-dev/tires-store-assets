import { Link } from '@salla.sa/twilight-theme-engine/common';
import { BRAND_CATEGORIES } from './storeInfo';

/**
 * Tire makers shown on the home page; each links to a search for that brand.
 * `name` is how the store spells it in product names ("كفر تاش 275/65/18").
 */
const BRANDS = [
  { name: 'تاش', label: 'TASH' },
  { name: 'هانكوك', label: 'Hankook' },
  { name: 'نكسن', label: 'NEXEN' },
  { name: 'تويو', label: 'TOYO' },
  { name: 'دنلوب', label: 'DUNLOP' },
  { name: 'يوكوهاما', label: 'YOKOHAMA' },
  { name: 'بريجستون', label: 'BRIDGESTONE' },
  { name: 'ماكسس', label: 'MAXXIS' },
];

export function TireBrands() {
  return (
    <section className="bg-white py-10">
      <div className="container">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">أشهر العلامات التجارية</h2>
          <p className="mt-1 text-sm text-gray-500">تسوّق من أفضل العلامات التجارية</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {BRANDS.map((brand) => (
            <li key={brand.name}>
              <Link
                to={BRAND_CATEGORIES[brand.name] ?? `/search?q=${encodeURIComponent(brand.name)}`}
                className="flex h-16 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-black italic tracking-wide text-gray-800 transition hover:border-[#ffb71b] hover:text-[#e5a00f]"
              >
                <span dir="ltr">{brand.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
