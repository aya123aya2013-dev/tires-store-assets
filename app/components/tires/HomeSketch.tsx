/**
 * Home page sections in the home sketch's order ("سكتش أولي — الصفحة الرئيسية"),
 * styled after the Marlin reference (dark hero, booking-style card riding over
 * it, icon cards, highlighted middle card, image with an accent block,
 * review card over an image, dark call-to-action) with an HRE-style big
 * ghost number in the hero — in the store's black + gold.
 */
import { useCallback, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { TireIllustration } from './TireSizeHero';
import { TireSizeSelect } from './TireSizeSelect';
import { SizeGuideModal } from './SizeGuideModal';
import {
  DEFAULT_TIRE_SIZE,
  TIRE_RATIOS,
  TIRE_RIMS,
  TIRE_WIDTHS,
  formatTireSize,
  parseTireSize,
  tireSizeQuery,
} from './sizes';
import type { TireSize } from './sizes';
import { HELP_PATH, STORE_CONTACT, whatsappUrl } from './storeInfo';

const GOLD = '#ffb71b';

/** Centered section heading with a short subtitle (Marlin style). */
function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">{title}</h2>
      {text && <p className="mx-auto mt-2 max-w-xl text-gray-500">{text}</p>}
    </div>
  );
}

const btnGold =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#ffb71b] px-7 py-3 font-bold text-gray-900 transition hover:bg-[#e5a00f]';

/* ── 1. Banner ─────────────────────────────────────────────────────────────── */

export function SketchHero() {
  return (
    <section className="relative overflow-hidden bg-[#2f3337] text-white">
      {/* HRE-style ghost size behind the content. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 start-1/2 select-none text-[120px] font-black leading-none text-white/[0.04] md:text-[200px]"
        dir="ltr"
      >
        R18
      </span>
      <div className="container relative grid items-center gap-8 pb-28 pt-8 md:grid-cols-2 md:pb-32 md:pt-10">
        <div>
          <p className="mb-3 text-sm font-bold" style={{ color: GOLD }}>
            متجر الإطارات
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            إطارات لسيارتك،
            <br />
            بالمقاس المناسب
          </h1>
          <p className="text-gray-300">أداء أعلى وأكثر أماناً على الطريق</p>
          <p className="mb-7 text-gray-400">مجموعة واسعة من الإطارات لأفضل العلامات التجارية</p>
          <Link to="/latest-products" className={btnGold}>
            تسوّق الآن
          </Link>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            <span className="h-1.5 w-8 rounded-full" style={{ background: GOLD }} />
            <span className="h-1.5 w-3 rounded-full bg-white/30" />
            <span className="h-1.5 w-3 rounded-full bg-white/30" />
          </div>
        </div>
        <div className="flex justify-center">
          <TireIllustration className="h-56 w-56 drop-shadow-2xl md:h-96 md:w-96" />
        </div>
      </div>
    </section>
  );
}

/* ── 2. Pick your size — booking-style card over the banner ───────────────── */

const SIZE_FIELDS: { key: keyof TireSize; label: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'النسبة', options: TIRE_RATIOS },
  { key: 'rim', label: 'الجنط', options: TIRE_RIMS },
];

export function SketchSizeSearch() {
  const navigate = useNavigate();
  const [size, setSize] = useState<TireSize>(DEFAULT_TIRE_SIZE);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    // Pulled up over the banner's bottom edge (see SketchHero's padding).
    <section id="size-search" className="relative z-10 -mt-20 scroll-mt-24 md:-mt-24">
      <div className="container">
        <form
          onSubmit={onSubmit}
          // Narrower, on the start side, soft gray fields — like Marlin's booking card.
          className="me-auto max-w-2xl rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.15)] md:p-7 [&_select]:border-transparent [&_select]:bg-gray-100"
        >
          <h2 className="mb-5 text-2xl font-extrabold text-gray-900">اختر مقاس إطارك</h2>
          <div className="mb-5 grid grid-cols-3 gap-3 md:gap-4">
            {SIZE_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-bold text-gray-600">{field.label}</span>
                <TireSizeSelect field={field.key} options={field.options} size={size} setSize={setSize} />
              </label>
            ))}
          </div>
          <button type="submit" className={`${btnGold} w-full text-lg`}>
            اعرض الإطارات
          </button>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="mx-auto mt-3 block text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
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

/* ── 3. Reassurance — "why choose us" icon cards ──────────────────────────── */

const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const TRUST = [
  {
    title: 'تركيب بالرياض',
    text: 'تركيب مجاني في مراكزنا المعتمدة',
    icon: icon(
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    ),
  },
  {
    title: 'تابي وتمارا',
    text: 'قسّم فاتورتك بدون فوائد',
    icon: icon(
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
  {
    title: 'توصيل',
    text: 'لجميع مناطق المملكة',
    icon: icon(
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17" cy="17.5" r="1.5" />
      </>
    ),
  },
];

export function SketchTrust() {
  return (
    <section className="py-16">
      <div className="container">
        <SectionTitle title="ليش تشتري من عندنا؟" text="كل اللي تحتاجه لإطاراتك في مكان واحد" />
        <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-3 md:gap-5">
          {TRUST.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center md:p-6"
            >
              <span
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-gray-900"
                style={{ background: `${GOLD}33` }}
              >
                {item.icon}
              </span>
              <p className="font-bold text-gray-900">{item.title}</p>
              <p className="mt-1 hidden text-sm text-gray-500 md:block">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 4. Discover our tires — middle card highlighted ──────────────────────── */

interface CardProduct {
  id: number;
  name: string;
  url: string;
  price?: number | string;
  sale_price?: number;
  is_on_sale?: boolean;
  image?: { url?: string; alt?: string } | null;
  thumbnail?: string;
}

export function SketchDiscover() {
  const { data } = useQuery(product.queries.list({ source: 'latest' }));
  const items = ((data?.items ?? []) as unknown as CardProduct[]).slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <SectionTitle title="اكتشف إطاراتنا" text="المقاس وسعر الحبة واضحين قبل ما تختار" />
        <ul className="mx-auto grid max-w-5xl items-center gap-5 sm:grid-cols-3">
          {items.map((item, index) => {
            const featured = index === 1;
            const size = parseTireSize(item.name);
            const price = item.is_on_sale ? item.sale_price : item.price;
            const src = item.image?.url || item.thumbnail;
            return (
              <li
                key={item.id}
                className={`flex flex-col rounded-2xl p-5 text-center transition ${
                  featured
                    ? 'bg-[#ffb71b] shadow-[0_20px_50px_rgba(255,183,27,0.35)] sm:-my-4 sm:py-9'
                    : 'border border-gray-100 bg-white'
                }`}
              >
                <div
                  className={`mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl ${
                    featured ? 'bg-white/40' : 'bg-gray-50'
                  }`}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={item.image?.alt || item.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <TireIllustration className="h-24 w-24" />
                  )}
                </div>
                <p className="font-bold text-gray-900">{item.name}</p>
                {size && (
                  <p className={`text-sm ${featured ? 'text-gray-800' : 'text-gray-500'}`} dir="ltr">
                    {formatTireSize(size)}
                  </p>
                )}
                <p className="mb-4 mt-2 text-2xl font-extrabold text-gray-900">
                  {price} <span className="text-base font-bold">ر.س</span>
                  <span className={`block text-xs font-normal ${featured ? 'text-gray-800' : 'text-gray-500'}`}>
                    سعر الحبة
                  </span>
                </p>
                <Link
                  to={item.url}
                  className={`mt-auto rounded-full py-2.5 text-sm font-bold transition ${
                    featured
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'border border-gray-300 text-gray-900 hover:border-gray-900'
                  }`}
                >
                  التفاصيل
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── 5. Buy and install with us — image over a gold block ─────────────────── */

export function SketchInstall() {
  return (
    <section className="py-16">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
            اشتري إطاراتك وركّبها عندنا
          </h2>
          <p className="text-gray-600">مراكز تركيب معتمدة في الرياض</p>
          <p className="mb-6 text-gray-600">تركيب احترافي وسريع بشروط واضحة</p>
          <Link to={`${HELP_PATH}#install`} className={btnGold}>
            الموقع والشروط
          </Link>
        </div>
        <div className="relative pb-4 pe-4">
          <span
            aria-hidden="true"
            className="absolute bottom-0 end-0 h-3/4 w-3/4 rounded-2xl"
            style={{ background: GOLD }}
          />
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-[#2f3337]">
            <TireIllustration className="h-40 w-40" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 6. Customer reviews — review card over an image ──────────────────────── */

interface Testimonial {
  name?: string;
  avatar?: string;
  text?: string;
  stars?: number;
}

/** Reads the merchant's testimonials ("آراء عملاء مخصصة") from the home blocks. */
export function testimonialsFrom(blocks: HomeLoaderData['components']): Testimonial[] {
  for (const block of blocks) {
    const b = block as {
      path?: string;
      items?: unknown;
      component?: { items?: unknown };
      data?: { items?: unknown };
    };
    if (!/testimonial/i.test(String(b.path ?? ''))) continue;
    // The block's settings sit on the block itself, or under `component`.
    const items = b.items ?? b.component?.items ?? b.data?.items;
    if (Array.isArray(items)) {
      return items.map((raw) => {
        const item = raw as Record<string, unknown>;
        const pick = (key: string) => item[key] ?? item[`items.${key}`];
        return {
          name: pick('name') as string | undefined,
          avatar: pick('avatar') as string | undefined,
          text: pick('text') as string | undefined,
          stars: Number(pick('stars') ?? 5),
        };
      });
    }
  }
  return [];
}

export function SketchReviews({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <SectionTitle title="آراء العملاء" />
        <ul className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {items.slice(0, 2).map((item, index) => (
            // Static merchant list without ids.
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <p className="mb-3 tracking-widest" style={{ color: GOLD }} aria-label={`${item.stars} من 5`}>
                {'★'.repeat(Math.max(1, Math.min(5, item.stars ?? 5)))}
              </p>
              <p className="mb-5 leading-7 text-gray-700">“{item.text}”</p>
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="h-11 w-11 rounded-full bg-gray-200" aria-hidden="true" />
                )}
                <span className="font-bold text-gray-900">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Call to action before the footer ("Call Now and Book") ───────────────── */

export function SketchCallToAction() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="relative grid overflow-hidden rounded-3xl bg-[#2f3337] text-white md:grid-cols-[1.4fr_1fr]">
          <div className="p-8 md:p-12">
            <h2 className="mb-3 text-2xl font-extrabold md:text-3xl">
              تواصل معنا واطلب إطاراتك اليوم
            </h2>
            <p className="mb-6 text-gray-400">فريقنا يساعدك تختار المقاس المناسب لسيارتك</p>
            <a
              href={whatsappUrl('مرحباً، أبي استفسر عن إطارات لسيارتي')}
              target="_blank"
              rel="noopener noreferrer"
              className={btnGold}
            >
              واتساب <span dir="ltr">{STORE_CONTACT.phone}</span>
            </a>
          </div>
          <div className="relative hidden items-center justify-center md:flex" style={{ background: GOLD }}>
            <TireIllustration className="h-48 w-48" />
          </div>
        </div>
      </div>
    </section>
  );
}
