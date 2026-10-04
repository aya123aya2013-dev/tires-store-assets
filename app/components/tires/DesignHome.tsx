/**
 * Home page — 1:1 port of the approved mockup (design/home.html). Styles live
 * in styles/04-components/tires-home.scss under `.th`.
 */
import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { SizeGuideModal } from './SizeGuideModal';
import { DEFAULT_TIRE_SIZE, TIRE_RATIOS, TIRE_RIMS, TIRE_WIDTHS, isTruckWidth, tireSizeQuery } from './sizes';
import type { TireSize } from './sizes';
import { HELP_PATH, STORE_CATEGORIES, whatsappUrl } from './storeInfo';
import {
  IconArrow,
  IconCard,
  IconGauge,
  IconPin,
  IconPlay,
  IconShield,
  IconTire,
  IconTruck,
  IconUsers,
  IconWhatsapp,
  IconWrench,
} from './DesignIcons';

const IMG = '/assets/images/home';

const Arrow = () => <IconArrow className="arrow" />;

/* ── hero + size card ─────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">إطارات أصلية بضمان الوكيل</span>
          <h1>
            اختر إطارك.
            <br />
            <span>ركّبه اليوم.</span>
          </h1>
          <p className="lead">
            من المقاس الصح لين التركيب في مراكزنا بالرياض — إطارات أصلية لأفضل العلامات التجارية، بأسعار
            واضحة لكل حبة.
          </p>
          <div className="cta">
            <a className="btn btn-gold" href="#size">
              تسوّق حسب المقاس <Arrow />
            </a>
            <Link className="btn btn-ghost" to={`${HELP_PATH}#install`}>
              احجز تركيب
            </Link>
          </div>
          <Link className="watch" to={`${HELP_PATH}#install`}>
            <span>
              <IconPlay width={12} height={12} />
            </span>
            شاهد كيف نركّب إطارك
          </Link>
        </div>
        <div className="hero-art">
          <img src={`${IMG}/hero-tire.webp`} alt="إطار بجنط ذهبي" width={560} height={560} />
          <div className="badge-float bf-1">
            <span className="dot">
              <IconWrench />
            </span>
            <span>
              <b>تركيب مجاني</b>في مراكزنا بالرياض
            </span>
          </div>
          <div className="badge-float bf-2">
            <span className="dot">
              <IconCard />
            </span>
            <span>
              <b>4 دفعات</b>مع تابي وتمارا
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SIZE_FIELDS: { key: keyof TireSize; label: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'النسبة', options: TIRE_RATIOS },
  { key: 'rim', label: 'الجنط', options: TIRE_RIMS },
];

const FEATURES = [
  { Icon: IconShield, title: 'إطارات أصلية', text: 'بضمان الوكيل' },
  { Icon: IconWrench, title: 'تركيب مجاني', text: 'في الرياض' },
  { Icon: IconCard, title: 'تابي وتمارا', text: '4 دفعات بدون فوائد' },
  { Icon: IconTruck, title: 'توصيل سريع', text: 'لجميع المناطق' },
  { Icon: IconGauge, title: '+300 مقاس', text: 'سيارات ودفع رباعي' },
];

function SizeCard() {
  const navigate = useNavigate();
  const [size, setSize] = useState<TireSize>(DEFAULT_TIRE_SIZE);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const truck = isTruckWidth(size.width);

  const set = (key: keyof TireSize, value: string) =>
    setSize((s) => {
      const next = { ...s, [key]: value };
      // Back from a truck width: give the ratio a value again.
      if (key === 'width' && !isTruckWidth(value) && !next.ratio) next.ratio = DEFAULT_TIRE_SIZE.ratio;
      return next;
    });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    <div className="size" id="size">
      <div className="wrap">
        <form className="size-card" onSubmit={onSubmit}>
          <div className="size-head">
            <h2>اختر مقاس إطارك</h2>
            <button type="button" onClick={() => setGuideOpen(true)}>
              كيف أعرف مقاسي؟
            </button>
          </div>
          <div className="size-row">
            {SIZE_FIELDS.map((field) => {
              const noRatio = field.key === 'ratio' && truck;
              return (
                <label key={field.key} className="field">
                  <span>{field.label}</span>
                  <select
                    value={noRatio ? '' : size[field.key]}
                    disabled={noRatio}
                    onChange={(e) => set(field.key, e.target.value)}
                  >
                    {noRatio && <option value="">—</option>}
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
            <button className="btn btn-gold" type="submit">
              اعرض الإطارات <Arrow />
            </button>
          </div>
          <div className="feat">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title}>
                <Icon />
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
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
    </div>
  );
}

/* ── install ecosystem ────────────────────────────────────────────────────── */

const ECO = [
  { img: 'install.webp', cut: true, title: 'فنيون متخصصون', text: 'تركيب احترافي وسريع' },
  { img: 'review.webp', cut: false, title: 'مراكز معتمدة', text: 'في أكثر من حي بالرياض' },
  { img: 'ready.webp', cut: true, title: 'استلام بنفس اليوم', text: 'جاهز خلال ساعات' },
];

function Install() {
  return (
    <section>
      <div className="wrap eco">
        <div>
          <span className="eyebrow">ركّبها عندنا</span>
          <h2 className="h2">
            خدمة تركيب
            <br />
            تبدأ من الطلب
          </h2>
          <p className="lead">
            اشتر إطاراتك أونلاين واستلمها مركّبة على جنوطك في أحد مراكزنا المعتمدة — بفنيين متخصصين وبدون
            انتظار.
          </p>
          <Link className="btn btn-gold" to={`${HELP_PATH}#install`}>
            الموقع والشروط <Arrow />
          </Link>
        </div>
        <div className="eco-cards">
          {ECO.map((card) => (
            <Link key={card.title} className="eco-card" to={`${HELP_PATH}#install`}>
              <figure className={card.cut ? 'cut' : undefined}>
                <img src={`${IMG}/${card.img}`} alt="" loading="lazy" />
              </figure>
              <div>
                <b>{card.title}</b>
                <small>{card.text}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── line-up ──────────────────────────────────────────────────────────────── */

/** TODO(merchant): confirm the "from" prices per type. */
const LINE_UP = [
  {
    title: 'إطارات سيارات',
    text: 'سيدان وهاتشباك · استخدام يومي',
    img: 'type-car.webp',
    to: STORE_CATEGORIES.chinese,
    specs: [
      ['13–20"', 'قطر الجنط'],
      ['هادئ', 'على الطريق'],
      ['من 290', 'ر.س للحبة'],
    ],
  },
  {
    title: 'دفع رباعي',
    text: 'SUV ونصف حجري · رحلات وطرق وعرة',
    img: 'type-suv.webp',
    to: '/search?q=حجري',
    popular: true,
    specs: [
      ['16–22"', 'قطر الجنط'],
      ['متين', 'نقشة عميقة'],
      ['من 400', 'ر.س للحبة'],
    ],
  },
  {
    title: 'نقل وشاحنات',
    text: 'LT · أحمال ثقيلة ومسافات طويلة',
    img: 'type-truck.webp',
    to: '/search?q=LT',
    specs: [
      ['15–17"', 'قطر الجنط'],
      ['تحمّل', 'عالٍ'],
      ['من 600', 'ر.س للحبة'],
    ],
  },
];

function LineUp() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap center">
        <span className="eyebrow">تشكيلتنا</span>
        <h2 className="h2">إطار لكل طريق</h2>
      </div>
      <div className="wrap line-up">
        {LINE_UP.map((item) => (
          <Link key={item.title} className={`car${item.popular ? ' pop' : ''}`} to={item.to}>
            {item.popular && <span className="tag">الأكثر طلباً</span>}
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <figure>
              <img src={`${IMG}/${item.img}`} alt="" loading="lazy" />
            </figure>
            <div className="specs">
              {item.specs.map(([value, label]) => (
                <div key={label}>
                  <b>{value}</b>
                  <small>{label}</small>
                </div>
              ))}
            </div>
            <span className="more">
              تسوّق <IconArrow className="arrow" width={14} height={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── impact numbers ───────────────────────────────────────────────────────── */

/** TODO(merchant): replace with the store's real figures before launch. */
const STATS = [
  { Icon: IconUsers, value: '+5,000', label: 'عميل', text: 'في المملكة' },
  { Icon: IconTire, value: '+300', label: 'مقاس', text: 'متوفر دائماً' },
  { Icon: IconShield, value: '+15', label: 'علامة تجارية', text: 'أصلية بالضمان' },
  { Icon: IconPin, value: '2', label: 'مركز تركيب', text: 'في الرياض' },
];

function Impact() {
  return (
    <section className="impact">
      <div className="wrap">
        <div>
          <span className="eyebrow">ثقة عملائنا</span>
          <h2 className="h2">
            آلاف السيارات
            <br />
            على إطاراتنا
          </h2>
          <Link className="btn btn-dark" to={HELP_PATH}>
            عن المتجر <Arrow />
          </Link>
        </div>
        <div className="stats">
          {STATS.map(({ Icon, value, label, text }) => (
            <div key={label}>
              <Icon />
              <b>{value}</b>
              <span>{label}</span>
              <small>{text}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── reviews ──────────────────────────────────────────────────────────────── */

interface Review {
  name: string;
  text: string;
  avatar?: string;
  stars: number;
}

/** Shown until the merchant adds testimonials in the dashboard (from the live store's reviews). */
const FALLBACK_REVIEWS: Review[] = [
  { name: 'عبدالعزيز', stars: 5, text: 'اخترت المقاس من الموقع وركبتها بنفس اليوم في مركزهم. شغل مرتب وسريع وما انتظرت.' },
  { name: 'خالد', stars: 5, text: 'الأسعار واضحة لكل حبة، وقسّطت مع تابي. الكفرات وصلت أصلية وبتاريخ حديث.' },
  { name: 'يزيد', stars: 5, text: 'فكرة المتجر مميزة وتختصر وقت وجهد. ساعدوني أعرف مقاس كفرات الجيب.' },
];

/** The merchant's testimonials ("آراء عملاء مخصصة") from the home blocks, if any. */
export function reviewsFrom(blocks: HomeLoaderData['components']): Review[] {
  for (const block of blocks) {
    const b = block as { path?: string; items?: unknown; component?: { items?: unknown } };
    if (!/testimonial/i.test(String(b.path ?? ''))) continue;
    const items = b.items ?? b.component?.items;
    if (!Array.isArray(items)) continue;
    const reviews = items
      .map((raw) => {
        const item = raw as Record<string, unknown>;
        const pick = (key: string) => item[key] ?? item[`items.${key}`];
        return {
          name: String(pick('name') ?? ''),
          text: String(pick('text') ?? ''),
          avatar: pick('avatar') as string | undefined,
          stars: Number(pick('stars') ?? 5),
        };
      })
      .filter((r) => r.text);
    if (reviews.length) return reviews;
  }
  return FALLBACK_REVIEWS;
}

function Reviews({ items }: { items: Review[] }) {
  return (
    <section>
      <div className="wrap center">
        <span className="eyebrow">آراء العملاء</span>
        <h2 className="h2">تجارب حقيقية. عملاء حقيقيون.</h2>
      </div>
      <div className="wrap quotes">
        {items.slice(0, 3).map((review) => (
          <div key={review.name + review.text} className="quote">
            <span className="q">”</span>
            <p>{review.text}</p>
            <div className="who">
              <span>
                <b>— {review.name}</b>
                <div className="stars" aria-label={`${review.stars} من 5`}>
                  {'★'.repeat(Math.max(1, Math.min(5, review.stars)))}
                </div>
              </span>
              <span className="avatar">
                {review.avatar ? <img src={review.avatar} alt="" /> : review.name.charAt(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── contact band ─────────────────────────────────────────────────────────── */

function Band() {
  return (
    <section className="band">
      <div className="wrap">
        <div className="box">
          <figure>
            <img src={`${IMG}/cta.webp`} alt="" loading="lazy" />
          </figure>
          <div className="txt">
            <div>
              <h2>محتار في المقاس؟</h2>
              <p>أرسل لنا صورة جانب إطارك على واتساب، ونرشّح لك الأنسب لسيارتك خلال دقائق.</p>
            </div>
            <a
              className="btn btn-dark"
              href={whatsappUrl('مرحباً، أبي مساعدة في اختيار مقاس الإطار')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp /> تواصل عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export function DesignHome({ blocks }: { blocks: HomeLoaderData['components'] }) {
  return (
    <div className="th">
      <Hero />
      <SizeCard />
      <Install />
      <LineUp />
      <Impact />
      <Reviews items={reviewsFrom(blocks)} />
      <Band />
    </div>
  );
}
