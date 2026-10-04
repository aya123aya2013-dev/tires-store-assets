import { Link } from '@salla.sa/twilight-theme-engine/common';
import { TIRE_RIMS } from './sizes';
import { STORE_CATEGORIES } from './storeInfo';

/**
 * Tire-type cards: either a store category (`to`, from the merchant's
 * categories) or a product-name search (`query`, which must match how the store
 * writes names — "حجري" for the semi-off-road range, "LT" for light trucks).
 */
const TYPES = [
  { title: 'كفرات تايلندي', text: 'جودة عالية وعمر أطول', to: STORE_CATEGORIES.thai },
  { title: 'كفرات صيني', text: 'أداء ممتاز بسعر مناسب', to: STORE_CATEGORIES.chinese },
  { title: 'نصف حجري', text: 'للطرق الوعرة', query: 'حجري' },
  { title: 'نقل وشاحنات', text: 'LT للأحمال الثقيلة', query: 'LT' },
];

const typeHref = (type: (typeof TYPES)[number]) =>
  type.to ?? `/search?q=${encodeURIComponent(type.query ?? '')}`;

const RIMS = TIRE_RIMS.filter((rim) => Number(rim) >= 14 && Number(rim) <= 22);

/** Home: shop by tire type, then by rim diameter. */
export function ShopByType() {
  return (
    <section className="bg-gray-50 py-10">
      <div className="container">
        <h2 className="mb-5 text-2xl font-bold text-gray-900">تسوّق حسب النوع</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TYPES.map((type) => (
            <li key={type.title}>
              <Link
                to={typeHref(type)}
                className="group flex h-full flex-col justify-between rounded-2xl bg-[#2f3337] p-5 text-white transition hover:-translate-y-0.5"
              >
                <span>
                  <span className="block text-lg font-bold">{type.title}</span>
                  <span className="block text-sm text-gray-400">{type.text}</span>
                </span>
                <span className="mt-4 text-sm font-bold text-[#ffb71b]">
                  تسوّق الآن <span aria-hidden="true">←</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mb-4 mt-10 text-xl font-bold text-gray-900">تسوّق حسب قطر الجنط</h2>
        <ul className="flex flex-wrap gap-2">
          {RIMS.map((rim) => (
            <li key={rim}>
              <Link
                // Product names end in "/<rim>" (e.g. "275/65/18"), so this finds that diameter.
                to={`/search?q=${encodeURIComponent(`/${rim}`)}`}
                className="flex h-14 w-16 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white font-bold text-gray-900 transition hover:border-[#ffb71b]"
              >
                {rim}
                <span className="text-[10px] font-normal text-gray-500">بوصة</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
