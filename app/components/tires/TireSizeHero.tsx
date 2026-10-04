import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { SearchIcon } from '../icons';
import { TireSizeSelect } from './TireSizeSelect';
import { SizeGuideModal } from './SizeGuideModal';
import {
  DEFAULT_TIRE_SIZE,
  TIRE_RATIOS,
  TIRE_RIMS,
  TIRE_WIDTHS,
  tireSizeQuery,
} from './sizes';
import type { TireSize } from './sizes';

const FIELDS: { key: keyof TireSize; label: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'النسبة', options: TIRE_RATIOS },
  { key: 'rim', label: 'الجنط', options: TIRE_RIMS },
];

/** Tire drawing used in the home banners until real photos are added. */
export function TireIllustration({ className = 'h-48 w-48' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="#3b4045" stroke="#ffb71b" strokeWidth="6" />
      <circle cx="100" cy="100" r="56" fill="#2f3337" stroke="#333" strokeWidth="4" />
      <circle cx="100" cy="100" r="18" fill="#ffb71b" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <rect
          key={deg}
          x="96"
          y="48"
          width="8"
          height="34"
          rx="4"
          fill="#444"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

/** Home section 1: what the store is — headline, two lines of copy, tire image. */
export function HomeHero() {
  return (
    // Extra bottom padding: the size-search card (next section) rides up over
    // the banner's bottom edge, like the store's "products over banner" block.
    <section className="bg-[#2f3337] text-white">
      <div className="container grid items-center gap-8 pb-32 pt-10 md:grid-cols-2 md:pb-40 md:pt-14">
        <div>
          <h1 className="mb-3 text-3xl font-bold leading-tight md:text-5xl">
            إطارات لسيارتك، <span className="text-[#ffb71b]">بالمقاس المناسب</span>
          </h1>
          <p className="text-lg text-gray-300">أداء أعلى وأكثر أماناً على الطريق</p>
          <p className="text-gray-400">مجموعة واسعة من الإطارات لأفضل العلامات التجارية</p>
        </div>
        <div className="flex justify-center">
          <TireIllustration className="h-48 w-48 md:h-64 md:w-64" />
        </div>
      </div>
    </section>
  );
}

/**
 * Home section 2 — the main step: pick width / ratio / rim and go to the
 * results ("205/55/16", the way the store names its products).
 */
export function SizeSearchSection() {
  const navigate = useNavigate();
  const [size, setSize] = useState<TireSize>(DEFAULT_TIRE_SIZE);
  const [guideOpen, setGuideOpen] = useState(false);

  const closeGuide = useCallback(() => setGuideOpen(false), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    // Pulled up over the hero's bottom edge (see HomeHero's padding).
    <section className="relative z-10 -mt-24 pb-8 md:-mt-32">
      <div className="container">
        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-3xl rounded-3xl border-t-4 border-[#ffb71b] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-8"
        >
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2f3337]">
              <TireIllustration className="h-8 w-8" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900">اختر مقاس إطارك</h2>
            <p className="mt-1 text-sm text-gray-500">اختر العرض والنسبة والجنط كما هي مكتوبة على جانب إطارك</p>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3 md:gap-4">
            {FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-bold text-gray-700">{field.label}</span>
                <TireSizeSelect field={field.key} options={field.options} size={size} setSize={setSize} />
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb71b] py-3.5 text-lg font-bold text-gray-900 transition hover:bg-[#e5a00f]"
          >
            <SearchIcon className="h-5 w-5" aria-hidden="true" />
            اعرض الإطارات
          </button>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="mx-auto block text-sm text-gray-700 underline underline-offset-4 hover:text-gray-900"
          >
            كيف أعرف مقاسي؟
          </button>
        </form>
      </div>

      <SizeGuideModal
        open={guideOpen}
        size={size}
        onClose={closeGuide}
        onConfirm={(confirmed) => {
          setSize(confirmed);
          setGuideOpen(false);
        }}
      />
    </section>
  );
}
