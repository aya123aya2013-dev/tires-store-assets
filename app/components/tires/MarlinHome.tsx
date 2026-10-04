/**
 * Home page rebuilt section-for-section after the "Marlin" reference layout,
 * with tire-store content and the store's black + gold.
 *
 * Photos are web-sized WebP files under `public/assets/images/home/`, built by
 * `scripts/optimize-home-images.cjs` from the full-size originals.
 */
import { useCallback, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
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
import { HELP_PATH, STORE_CATEGORIES, STORE_CONTACT, whatsappUrl } from './storeInfo';

/** Photo files for each home slot (drop them into public/assets/images/home/). */
export const HOME_IMAGES = {
  hero: '/assets/images/home/hero-tire.webp',
  install: '/assets/images/home/install.webp',
  typeCar: '/assets/images/home/type-car.webp',
  typeSuv: '/assets/images/home/type-suv.webp',
  typeTruck: '/assets/images/home/type-truck.webp',
  installments: '/assets/images/home/installments.webp',
  ready: '/assets/images/home/ready.webp',
  review: '/assets/images/home/review.webp',
  centers: '/assets/images/home/centers.webp',
  blog1: '/assets/images/home/blog-1.webp',
  blog2: '/assets/images/home/blog-2.webp',
  cta: '/assets/images/home/cta.webp',
};

/* ── shared bits ──────────────────────────────────────────────────────────── */

const pill =
  'inline-flex items-center justify-center rounded-full bg-[#ffb71b] px-6 py-2.5 text-sm font-bold text-[#2f3337] transition hover:bg-[#ffc94d]';

/** A photo slot: the image when the file exists, a quiet panel when it doesn't. */
function Photo({
  src,
  alt,
  className = '',
  contain = false,
}: {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return <div className={`bg-[#e9ebee] ${className}`} aria-hidden="true" />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setMissing(true)}
      className={`${contain ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}

function Heading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-xl text-center">
      <h2 className="text-[28px] font-bold leading-tight text-[#2f3337] md:text-[34px]">{title}</h2>
      {text && <p className="mt-3 text-[15px] leading-7 text-[#6b7280]">{text}</p>}
    </div>
  );
}

const svg = (d: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

const ICONS = {
  wrench: svg(
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
  ),
  card: svg(
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  truck: svg(
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17" cy="17.5" r="1.5" />
    </>
  ),
  shield: svg(<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4" />),
  ruler: svg(<path d="M4 17 17 4l3 3L7 20l-3-3Zm4-4 2 2m1-5 2 2m1-5 2 2" />),
  cart: svg(
    <>
      <path d="M3 4h2l2.4 11h10.2L20 8H6.3" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  ),
  pin: svg(
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  phone: svg(
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
};

/* ── 1. Hero (shares the header's black) ─────────────────────────────────── */

export function MarlinHero() {
  return (
    <section className="overflow-hidden bg-[#2f3337] text-white">
      <div className="container grid items-center gap-6 pb-28 pt-8 md:grid-cols-2 md:pb-32 md:pt-6">
        <div className="max-w-md">
          <h1 className="text-[34px] font-bold leading-[1.25] md:text-[46px]">
            إطارات أصلية،
            <br />
            تركيب مجاني
            <br />
            <span className="text-[#ffb71b]">بكل ثقة</span>
          </h1>
          <p className="mb-7 mt-4 text-[15px] leading-7 text-[#b6bbc0]">
            اختر مقاس إطارك واستلمه مركّباً في أحد مراكزنا بالرياض، أو نوصله لباب بيتك.
          </p>
          <Link to="/latest-products" className={pill}>
            تسوّق الآن
          </Link>
        </div>
        <div className="relative flex justify-center">
          {/* Soft gold light behind the tire, like the reference's studio shot. */}
          <span
            aria-hidden="true"
            className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,183,27,0.28),transparent_68%)]"
          />
          <Photo
            src={HOME_IMAGES.hero}
            alt="إطار بجنط ذهبي"
            contain
            className="relative aspect-square w-full max-w-[460px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </section>
  );
}

/* ── 2. Booking-style card: pick your size ───────────────────────────────── */

const SIZE_FIELDS: { key: keyof TireSize; label: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'النسبة', options: TIRE_RATIOS },
  { key: 'rim', label: 'الجنط', options: TIRE_RIMS },
];

export function MarlinSizeCard() {
  const navigate = useNavigate();
  const [size, setSize] = useState<TireSize>(DEFAULT_TIRE_SIZE);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    <section id="size-search" className="relative z-10 -mt-24 scroll-mt-24">
      <div className="container">
        <form
          onSubmit={onSubmit}
          className="max-w-xl rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(47,51,55,0.12)] md:p-7 [&_select]:border-transparent [&_select]:bg-[#f3f4f6] [&_select]:text-base"
        >
          <h2 className="mb-5 text-[22px] font-bold text-[#2f3337]">اختر مقاس إطارك</h2>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {SIZE_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">{field.label}</span>
                <TireSizeSelect field={field.key} options={field.options} size={size} setSize={setSize} />
              </label>
            ))}
          </div>
          <button type="submit" className={`${pill} w-full py-3 text-[15px]`}>
            اعرض الإطارات
          </button>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="mt-3 text-[13px] text-[#6b7280] underline underline-offset-4 hover:text-[#2f3337]"
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

/* ── 3. Why choose us: four small icon cards ─────────────────────────────── */

const WHY = [
  { icon: ICONS.shield, title: 'إطارات أصلية', text: 'من وكلاء معتمدين وبضمان' },
  { icon: ICONS.wrench, title: 'تركيب مجاني', text: 'في مراكزنا المعتمدة بالرياض' },
  { icon: ICONS.card, title: 'تقسيط مريح', text: 'مع تابي وتمارا بدون فوائد' },
  { icon: ICONS.truck, title: 'توصيل سريع', text: 'لجميع مناطق المملكة' },
];

export function MarlinWhy() {
  return (
    <section className="pb-20 pt-20">
      <div className="container">
        <Heading
          title="ليش تختار متجر الإطارات؟"
          text="كل اللي تحتاجه لإطارات سيارتك في مكان واحد، من اختيار المقاس لين التركيب."
        />
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {WHY.map((item) => (
            <li key={item.title} className="rounded-xl border border-[#eef0f2] bg-[#fafafa] px-4 py-6 text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#ffb71b]/20 text-[#2f3337]">
                {item.icon}
              </span>
              <p className="text-[15px] font-bold text-[#2f3337]">{item.title}</p>
              <p className="mt-1 text-[13px] leading-6 text-[#6b7280]">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 4. Split band: text + photo on a gold block ─────────────────────────── */

function SplitBand({
  title,
  text,
  cta,
  to,
  image,
  imageAlt,
  imageFirst = false,
  tinted = false,
  cutout = false,
}: {
  title: string;
  text: string;
  cta: string;
  to: string;
  image: string;
  imageAlt: string;
  imageFirst?: boolean;
  tinted?: boolean;
  /** Transparent cut-out photo: stands on the gold block instead of a framed photo. */
  cutout?: boolean;
}) {
  return (
    <section className={tinted ? 'bg-[#f6f7f9] py-20' : 'py-20'}>
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <div className={imageFirst ? 'md:order-2' : ''}>
          <h2 className="text-[28px] font-bold leading-tight text-[#2f3337] md:text-[34px]">{title}</h2>
          <p className="mb-7 mt-4 max-w-md text-[15px] leading-7 text-[#6b7280]">{text}</p>
          <Link to={to} className={pill}>
            {cta}
          </Link>
        </div>
        {cutout ? (
          <div className={`relative aspect-[4/3] ${imageFirst ? 'md:order-1' : ''}`}>
            <span aria-hidden="true" className="absolute inset-x-4 bottom-0 top-[22%] rounded-2xl bg-[#ffb71b]" />
            <Photo
              src={image}
              alt={imageAlt}
              contain
              className="relative h-full w-full object-bottom drop-shadow-[0_20px_30px_rgba(47,51,55,0.25)]"
            />
          </div>
        ) : (
          <div className={`relative pb-4 pe-4 ${imageFirst ? 'md:order-1' : ''}`}>
            <span aria-hidden="true" className="absolute bottom-0 end-0 h-[85%] w-[85%] rounded-2xl bg-[#ffb71b]" />
            <Photo src={image} alt={imageAlt} className="relative aspect-[4/3] w-full rounded-2xl" />
          </div>
        )}
      </div>
    </section>
  );
}

export function MarlinInstall() {
  return (
    <SplitBand
      tinted
      title="اشتري إطاراتك وركّبها عندنا"
      text="مراكز تركيب معتمدة في الرياض، بفنيين متخصصين ومعدات حديثة. تركيب احترافي وسريع بشروط واضحة."
      cta="الموقع والشروط"
      to={`${HELP_PATH}#install`}
      image={HOME_IMAGES.install}
      imageAlt="فني تركيب يحمل إطاراً ومفتاحاً"
      cutout
    />
  );
}

/* ── 5. Services: tire types, first card highlighted ─────────────────────── */

const TYPES = [
  { title: 'إطارات سيارات', text: 'سيدان وهاتشباك لاستخدام يومي مريح', to: STORE_CATEGORIES.chinese, image: HOME_IMAGES.typeCar },
  { title: 'دفع رباعي', text: 'نصف حجري للطرق الوعرة والرحلات', to: '/search?q=حجري', image: HOME_IMAGES.typeSuv },
  { title: 'نقل وشاحنات', text: 'إطارات LT للأحمال الثقيلة', to: '/search?q=LT', image: HOME_IMAGES.typeTruck },
];

export function MarlinServices() {
  return (
    <section className="py-20">
      <div className="container">
        <Heading title="تسوّق حسب النوع" text="اختر نوع سيارتك ونعرض لك الإطارات المناسبة لها." />
        <ul className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {TYPES.map((type, index) => {
            const active = index === 0;
            return (
              <li key={type.title}>
                <Link
                  to={type.to}
                  className={`block h-full rounded-2xl p-5 transition ${
                    active ? 'bg-[#ffb71b]' : 'border border-[#eef0f2] bg-[#fafafa] hover:border-[#d1d5db]'
                  }`}
                >
                  <Photo src={type.image} alt={type.title} contain className="mb-4 aspect-[16/10] w-full rounded-xl" />
                  <p className="text-[17px] font-bold text-[#2f3337]">{type.title}</p>
                  <p className={`mt-1 text-[13px] leading-6 ${active ? 'text-[#3f3f3f]' : 'text-[#6b7280]'}`}>
                    {type.text}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── 6 & 8. Dark banner with a gold side ─────────────────────────────────── */

function DarkBanner({
  title,
  text,
  cta,
  to,
  image,
  imageAlt,
}: {
  title: string;
  text: string;
  cta: string;
  to: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="py-6">
      <div className="container">
        <div className="relative grid items-center overflow-hidden rounded-2xl bg-[#2f3337] text-white md:grid-cols-[1.3fr_1fr]">
          <span aria-hidden="true" className="absolute inset-y-0 end-0 hidden w-[28%] bg-[#ffb71b] md:block" />
          <div className="relative p-8 md:p-12">
            <h2 className="text-[26px] font-bold leading-tight md:text-[30px]">{title}</h2>
            <p className="mb-7 mt-3 max-w-sm text-[14px] leading-7 text-[#a3a3a3]">{text}</p>
            <Link to={to} className={pill}>
              {cta}
            </Link>
          </div>
          <Photo src={image} alt={imageAlt} contain className="relative hidden aspect-[4/3] w-full md:block" />
        </div>
      </div>
    </section>
  );
}

export function MarlinInstallments() {
  return (
    <DarkBanner
      title="قسّطها على 4 دفعات"
      text="ادفع قيمة إطاراتك على دفعات مع تابي أو تمارا، بدون فوائد وبدون رسوم إضافية."
      cta="تسوّق الآن"
      to="/latest-products"
      image={HOME_IMAGES.installments}
      imageAlt="الدفع بالتقسيط"
    />
  );
}

/* ── 7. Numbers ──────────────────────────────────────────────────────────── */

/** TODO(merchant): replace with the store's real figures. */
const NUMBERS = [
  { value: '+5,000', label: 'عميل راضٍ' },
  { value: '+300', label: 'مقاس متوفر' },
  { value: '+15', label: 'علامة تجارية' },
];

export function MarlinNumbers() {
  return (
    <section className="py-20">
      <div className="container">
        <Heading title="أرقامنا تتكلم" text="ثقة عملائنا هي أهم شي عندنا." />
        <ul className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-x-reverse divide-[#e5e7eb] text-center">
          {NUMBERS.map((n) => (
            <li key={n.label} className="px-2">
              <p className="text-[34px] font-bold text-[#2f3337] md:text-[44px]" dir="ltr">
                {n.value}
              </p>
              <p className="mt-1 text-[14px] text-[#6b7280]">{n.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function MarlinReady() {
  return (
    <DarkBanner
      title="جاهز تغيّر إطاراتك؟"
      text="اختر مقاسك الآن، واستلم إطاراتك مركّبة في نفس اليوم."
      cta="اختر مقاسك"
      to="/#size-search"
      image={HOME_IMAGES.ready}
      imageAlt="سيارة"
    />
  );
}

/* ── 9. Fares → our tires, middle card highlighted ───────────────────────── */

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

export function MarlinTires() {
  const { data } = useQuery(product.queries.list({ source: 'latest' }));
  const items = ((data?.items ?? []) as unknown as CardProduct[]).slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="py-20">
      <div className="container">
        <Heading title="اكتشف إطاراتنا" text="المقاس وسعر الحبة واضحين قبل ما تختار." />
        <ul className="mx-auto grid max-w-4xl items-center gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const active = index === 1;
            const size = parseTireSize(item.name);
            const price = item.is_on_sale ? item.sale_price : item.price;
            const src = item.image?.url || item.thumbnail || '';
            return (
              <li
                key={item.id}
                className={`rounded-2xl p-5 text-center ${
                  active ? 'bg-[#ffb71b] md:-my-5 md:py-8' : 'border border-[#eef0f2] bg-[#fafafa]'
                }`}
              >
                <p className="text-[15px] font-bold text-[#2f3337]">{item.name}</p>
                {size && (
                  <p className={`text-[13px] ${active ? 'text-[#3f3f3f]' : 'text-[#6b7280]'}`} dir="ltr">
                    {formatTireSize(size)}
                  </p>
                )}
                <Photo src={src} alt={item.image?.alt || item.name} contain className="my-4 aspect-[4/3] w-full" />
                <p className="text-[28px] font-bold text-[#2f3337]">
                  {price} <span className="text-[15px]">ر.س</span>
                </p>
                <p className={`mb-4 text-[12px] ${active ? 'text-[#3f3f3f]' : 'text-[#6b7280]'}`}>سعر الحبة</p>
                <Link
                  to={item.url}
                  className={`inline-block rounded-full px-6 py-2 text-[13px] font-bold ${
                    active ? 'bg-white text-[#2f3337]' : 'text-[#2f3337] underline underline-offset-4'
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

/* ── 10. Reviews: heading + photo, review card overlapping it ────────────── */

interface Testimonial {
  name?: string;
  avatar?: string;
  text?: string;
  stars?: number;
}

/** Reads the merchant's testimonials ("آراء عملاء مخصصة") from the home blocks. */
export function testimonialsFrom(blocks: HomeLoaderData['components']): Testimonial[] {
  for (const block of blocks) {
    const b = block as { path?: string; items?: unknown; component?: { items?: unknown } };
    if (!/testimonial/i.test(String(b.path ?? ''))) continue;
    const items = b.items ?? b.component?.items;
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

export function MarlinReviews({ items }: { items: Testimonial[] }) {
  const review = items[0];
  if (!review) return null;
  return (
    <section className="bg-[#f6f7f9] py-20">
      <div className="container grid items-center gap-8 md:grid-cols-2">
        <div className="relative z-10">
          <h2 className="mb-8 text-[28px] font-bold leading-tight text-[#2f3337] md:text-[34px]">
            وش يقولون
            <br />
            عملاؤنا
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(47,51,55,0.10)] md:-me-24">
            <p className="mb-3 tracking-[3px] text-[#ffb71b]" aria-label={`${review.stars} من 5`}>
              {'★'.repeat(Math.max(1, Math.min(5, review.stars ?? 5)))}
            </p>
            <p className="mb-5 text-[15px] leading-7 text-[#374151]">“{review.text}”</p>
            <div className="flex items-center gap-3">
              {review.avatar && <img src={review.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />}
              <span className="text-[14px] font-bold text-[#2f3337]">{review.name}</span>
            </div>
          </div>
        </div>
        <Photo src={HOME_IMAGES.review} alt="عميل في سيارته" className="aspect-[4/3] w-full rounded-2xl" />
      </div>
    </section>
  );
}

/* ── 11. How it works ────────────────────────────────────────────────────── */

const STEPS = [
  { icon: ICONS.ruler, title: 'اختر مقاسك', text: 'من جانب إطارك الحالي' },
  { icon: ICONS.cart, title: 'أضف للسلة', text: 'وحدد طريقة الاستلام' },
  { icon: ICONS.pin, title: 'استلم وركّب', text: 'في مركزنا أو عند بابك' },
];

export function MarlinHowItWorks() {
  return (
    <section className="py-20">
      <div className="container">
        <Heading title="كيف تطلب؟" text="ثلاث خطوات بسيطة وإطاراتك جاهزة." />
        <ol className="mx-auto mb-10 grid max-w-4xl items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {STEPS.map((step, index) => (
            <li key={step.title} className="contents">
              <div className="rounded-xl border border-[#eef0f2] bg-[#fafafa] px-5 py-6">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#ffb71b]/20 text-[#2f3337]">
                  {step.icon}
                </span>
                <p className="text-[15px] font-bold text-[#2f3337]">{step.title}</p>
                <p className="mt-1 text-[13px] text-[#6b7280]">{step.text}</p>
              </div>
              {index < STEPS.length - 1 && (
                <span aria-hidden="true" className="hidden text-[#9ca3af] md:block">
                  ‹
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="text-center">
          <Link to="/#size-search" className={pill}>
            ابدأ الآن
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 12. Install centers split (image first) ─────────────────────────────── */

export function MarlinCenters() {
  return (
    <SplitBand
      tinted
      imageFirst
      title="مراكز التركيب في الرياض"
      text="استلم إطاراتك وركّبها مجاناً في أقرب مركز لك. مواعيد مرنة وخدمة سريعة."
      cta="اعرف المواقع"
      to={`${HELP_PATH}#install`}
      image={HOME_IMAGES.centers}
      imageAlt="مركز تركيب إطارات"
    />
  );
}

/* ── 13. Articles ────────────────────────────────────────────────────────── */

/** The store's own blog articles (tiresstore.com.sa). */
const ARTICLES = [
  { tag: 'نصائح', title: 'أهمية تغيير إطارات السيارة', image: HOME_IMAGES.blog1 },
  { tag: 'دليل', title: 'دليل شامل لاختيار الإطارات المناسبة لسيارتك', image: HOME_IMAGES.blog2 },
];

export function MarlinArticles() {
  return (
    <section className="py-20">
      <div className="container">
        <Heading title="مقالات ونصائح" />
        <ul className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <li key={article.title}>
              <Link to="/blog" className="group block">
                <Photo src={article.image} alt={article.title} className="mb-4 aspect-[16/10] w-full rounded-2xl" />
                <p className="text-[12px] font-bold text-[#9ca3af]">{article.tag}</p>
                <p className="mt-1 text-[17px] font-bold text-[#2f3337] group-hover:underline">{article.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 14. Call now ────────────────────────────────────────────────────────── */

export function MarlinCallNow() {
  return (
    <section className="pt-6">
      <div className="container">
        <div className="relative grid items-center overflow-hidden rounded-t-2xl bg-[#2f3337] text-white md:grid-cols-[1.3fr_1fr]">
          <span aria-hidden="true" className="absolute inset-y-0 end-0 hidden w-[30%] bg-[#ffb71b] md:block" />
          <div className="relative p-8 md:p-12">
            <h2 className="text-[26px] font-bold leading-tight md:text-[30px]">
              تواصل معنا واطلب
              <br />
              إطاراتك اليوم
            </h2>
            <p className="mb-6 mt-3 max-w-sm text-[14px] leading-7 text-[#a3a3a3]">
              فريقنا يساعدك تختار المقاس المناسب لسيارتك.
            </p>
            <a
              href={whatsappUrl('مرحباً، أبي استفسر عن إطارات لسيارتي')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[18px] font-bold"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffb71b] text-[#2f3337]">
                {ICONS.phone}
              </span>
              <span dir="ltr">{STORE_CONTACT.phone}</span>
            </a>
          </div>
          <Photo src={HOME_IMAGES.cta} alt="إطارات" contain className="relative hidden aspect-[4/3] w-full md:block" />
        </div>
      </div>
    </section>
  );
}
