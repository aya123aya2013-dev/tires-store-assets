/**
 * Home page — port of the "Madar" mockup (outputs/tire-store) with the store's
 * own identity (logo, gold + charcoal). Styles: styles/04-components/tires-madar.scss
 * under `.md`. Images are built by scripts/build-madar-images.cjs.
 */
import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { SizeGuideModal } from './SizeGuideModal';
import {
  DEFAULT_TIRE_SIZE,
  TIRE_RATIOS,
  TIRE_RIMS,
  TIRE_WIDTHS,
  formatTireSize,
  isTruckWidth,
  parseTireSize,
  tireSizeQuery,
} from './sizes';
import type { TireSize } from './sizes';
import { FAQ, HELP_PATH, STORE_CATEGORIES, whatsappUrl } from './storeInfo';
import { reviewsFrom } from './DesignHome';
import { IconCard, IconShield, IconTruck, IconWrench } from './DesignIcons';

const IMG = '/assets/images/home';

/* ── hero ─────────────────────────────────────────────────────────────────── */

const HERO_TRUST = [
  { Icon: IconShield, title: 'إطارات أصلية', text: 'بضمان الوكيل' },
  { Icon: IconCard, title: 'تابي وتمارا', text: '4 دفعات' },
  { Icon: IconTruck, title: 'توصيل سريع', text: 'لكل المناطق' },
];

function Hero() {
  return (
    <section className="md-hero">
      <div className="md-hero-image" />
      <div className="md-container md-hero-content">
        <div className="md-eyebrow">
          <span /> للرحلة القادمة، وكل رحلة
        </div>
        <h1>
          إطارات تناسب سيارتك.
          <br />
          <em>وثقة ترافق طريقك.</em>
        </h1>
        <p>
          اختيار أسهل للإطار المناسب، من أفضل الماركات.
          <br />
          وخدمة تركيب احترافية في الرياض.
        </p>
        <div className="md-hero-buttons">
          <a className="md-btn md-gold" href="#size">
            تسوّق الإطارات <span>←</span>
          </a>
          <a className="md-btn md-outline" href="#installation">
            اكتشف خدمة التركيب <span>↗</span>
          </a>
        </div>
        <div className="md-hero-trust">
          {HERO_TRUST.map(({ Icon, title, text }) => (
            <div key={title}>
              <span>
                <Icon />
              </span>
              <p>
                <b>{title}</b>
                <small>{text}</small>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="md-hero-offer">
        <small>تركيب</small>
        <b>مجاني</b>
        <small>بالرياض</small>
      </div>
    </section>
  );
}

/* ── size finder ──────────────────────────────────────────────────────────── */

const SIZE_FIELDS: { key: keyof TireSize; label: string; en: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', en: 'WIDTH', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'نسبة الارتفاع', en: 'PROFILE', options: TIRE_RATIOS },
  { key: 'rim', label: 'قطر الجنط', en: 'RIM', options: TIRE_RIMS },
];

function SizeFinder() {
  const navigate = useNavigate();
  const [size, setSize] = useState<TireSize>(DEFAULT_TIRE_SIZE);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const truck = isTruckWidth(size.width);

  const set = (key: keyof TireSize, value: string) =>
    setSize((s) => {
      const next = { ...s, [key]: value };
      if (key === 'width' && !isTruckWidth(value) && !next.ratio) next.ratio = DEFAULT_TIRE_SIZE.ratio;
      return next;
    });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    <section className="md-container md-finder-wrap" id="size">
      <form className="md-finder" onSubmit={onSubmit}>
        <div className="md-finder-title">
          <span className="md-eyebrow">البداية الصحيحة</span>
          <h2>اختر مقاس إطارك</h2>
          <button type="button" onClick={() => setGuideOpen(true)}>
            كيف أعرف مقاسي؟ <span>↗</span>
          </button>
        </div>
        {SIZE_FIELDS.map((field) => {
          const noRatio = field.key === 'ratio' && truck;
          return (
            <div key={field.key} className="md-select">
              <label htmlFor={`md-${field.key}`}>
                {field.label} <span>{field.en}</span>
              </label>
              <select
                id={`md-${field.key}`}
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
            </div>
          );
        })}
        <button className="md-btn md-gold md-finder-button" type="submit">
          اعرض الإطارات <span>←</span>
        </button>
      </form>
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

/* ── benefits + brands ────────────────────────────────────────────────────── */

const BENEFITS = [
  { Icon: IconShield, title: 'إطارات أصلية', text: 'من علامات تثق بها' },
  { Icon: IconWrench, title: 'تركيب بالرياض', text: 'عناية بكل التفاصيل' },
  { Icon: IconCard, title: 'تابي وتمارا', text: 'قسّطها على 4 دفعات' },
  { Icon: IconTruck, title: 'توصيل لجميع المناطق', text: 'رحلتك تبدأ من بابك' },
];

function Benefits() {
  return (
    <section className="md-container md-benefits">
      {BENEFITS.map(({ Icon, title, text }) => (
        <div key={title}>
          <Icon className="md-benefit-icon" />
          <p>
            <strong>{title}</strong>
            <small>{text}</small>
          </p>
        </div>
      ))}
    </section>
  );
}

/** The store's brand categories (storeInfo BRAND_CATEGORIES ids). */
const BRANDS = [
  { name: 'Hankook', cls: 'hankook', to: '/هانكوك/c191362665' },
  { name: 'BRIDGESTONE', cls: 'bridgestone', to: '/بريجستون/c74239191' },
  { name: 'YOKOHAMA', cls: 'yokohama', to: '/يوكوهاما/c1697423442' },
  { name: 'DUNLOP', cls: 'dunlop', to: '/دنلوب/c189235537' },
  { name: 'TOYO', cls: 'toyo', to: '/تويو/c1387466077' },
  { name: 'NEXEN', cls: 'nexen', to: '/نكسن/c14085724' },
];

function Brands() {
  return (
    <section className="md-brands md-container">
      <span>
        أفضل الماركات.
        <br />
        <strong>اختيار بدون تنازلات.</strong>
      </span>
      {BRANDS.map((brand) => (
        <Link key={brand.name} className={`md-brand ${brand.cls}`} to={brand.to}>
          {brand.name}
        </Link>
      ))}
    </section>
  );
}

/* ── services ─────────────────────────────────────────────────────────────── */

function Services() {
  return (
    <section className="md-section md-container md-services">
      <div className="md-service-intro">
        <span className="md-eyebrow">أكثر من مجرد إطار</span>
        <h2>
          كل ما تحتاجه
          <br />
          لإطاراتك.
        </h2>
        <p>
          من اختيار المقاس إلى التركيب.
          <br />
          تجربة بسيطة، واهتمام بالتفاصيل.
        </p>
        <a className="md-text-link" href="#installation">
          تعرّف على خدماتنا ←
        </a>
      </div>
      <a className="md-service-card" href="#installation">
        <div className="md-service-art workshop">
          <span className="md-art-grid" />
          <img src={`${IMG}/madar-tire.webp`} alt="إطار جاهز للتركيب" loading="lazy" />
          <span className="md-art-badge">
            <IconWrench />
          </span>
        </div>
        <div className="md-service-caption">
          <div>
            <h3>تركيب احترافي</h3>
            <p>إطاراتك في أيدٍ خبيرة</p>
          </div>
          <span>↗</span>
        </div>
      </a>
      <a className="md-service-card" href="#faq">
        <div className="md-service-art delivery">
          <svg viewBox="0 0 360 200" aria-hidden="true">
            <rect x="42" y="63" width="170" height="89" rx="9" fill="#fff" />
            <path d="M212 83h54l44 41v28h-98Z" fill="#eceae4" />
            <path d="M222 89h36l28 29h-64Z" fill="#a9aeb2" />
            <path d="M46 135h262" stroke="#ffb71b" strokeWidth="7" />
            <circle cx="97" cy="152" r="23" fill="#2f3337" />
            <circle cx="97" cy="152" r="11" fill="#d4d6d8" />
            <circle cx="265" cy="152" r="23" fill="#2f3337" />
            <circle cx="265" cy="152" r="11" fill="#d4d6d8" />
            <text x="127" y="112" fontSize="17" textAnchor="middle" fill="#2f3337" fontWeight="700" fontFamily="Arial">
              TIRES STORE
            </text>
          </svg>
        </div>
        <div className="md-service-caption">
          <div>
            <h3>توصيل إلى بابك</h3>
            <p>خيارات تناسب وجهتك</p>
          </div>
          <span>↗</span>
        </div>
      </a>
      <a className="md-service-card" href="#help">
        <div className="md-service-art guide">
          <img src={`${IMG}/madar-tire.webp`} alt="" loading="lazy" />
          <b dir="ltr">205 / 55 R16</b>
        </div>
        <div className="md-service-caption">
          <div>
            <h3>دليل المقاسات</h3>
            <p>اعرف مقاسك بكل سهولة</p>
          </div>
          <span>↗</span>
        </div>
      </a>
    </section>
  );
}

/* ── categories ───────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { title: 'إطارات تاش', text: 'الأكثر طلباً', to: STORE_CATEGORIES.tash },
  { title: 'إطارات تايلندي', text: 'جودة وسعر مناسب', to: STORE_CATEGORIES.thai },
  { title: 'إطارات صيني', text: 'اقتصادية للاستخدام اليومي', to: STORE_CATEGORIES.chinese },
  { title: 'نقل وشاحنات', text: 'تحمّل عالٍ ومسافات طويلة', to: '/search?q=LT' },
];

function Categories() {
  return (
    <section className="md-section md-category-section" id="categories">
      <div className="md-container">
        <div className="md-heading">
          <div>
            <span className="md-eyebrow">لكل سيارة، اختيار</span>
            <h2>جاهزة لطريقك.</h2>
          </div>
          <p>اختر الفئة، واكتشف الخيارات المناسبة.</p>
        </div>
        <div className="md-categories">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.title} className={`md-category${i === 0 ? ' active' : ''}`} to={cat.to}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{cat.title}</b>
              <small>{cat.text}</small>
              <i>↗</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── products ─────────────────────────────────────────────────────────────── */

interface CardProduct {
  id: number;
  name: string;
  url: string;
  price?: number | string;
  sale_price?: number;
  regular_price?: number;
  is_on_sale?: boolean;
  image?: { url?: string; alt?: string } | null;
  thumbnail?: string;
  brand?: { name?: string } | null;
}

function Products() {
  const { data } = useQuery(product.queries.list({ source: 'latest' }));
  const items = ((data?.items ?? []) as unknown as CardProduct[]).slice(0, 6);
  if (!items.length) return null;

  return (
    <section className="md-section md-container" id="products">
      <div className="md-heading">
        <div>
          <span className="md-eyebrow">اختياراتنا لك</span>
          <h2>إطارات لكل رحلة.</h2>
        </div>
        <Link className="md-text-link" to="/search?q=كفر">
          عرض جميع الإطارات ←
        </Link>
      </div>
      <div className="md-product-grid">
        {items.map((item, i) => {
          const size = parseTireSize(item.name);
          const price = item.is_on_sale ? item.sale_price : item.price;
          const src = item.image?.url || item.thumbnail || '';
          return (
            <Link key={item.id} className={`md-product${i === 0 ? ' featured' : ''}`} to={item.url}>
              {item.is_on_sale && <span className="md-badge">عرض</span>}
              {item.brand?.name && <div className="md-product-brand">{item.brand.name}</div>}
              <div className="md-product-image">
                {src && <img src={src} alt={item.image?.alt || item.name} loading="lazy" />}
              </div>
              <h3>{item.name}</h3>
              {size && (
                <div className="md-product-spec" dir="ltr">
                  {formatTireSize(size)}
                </div>
              )}
              <div className="md-product-bottom">
                <div>
                  <div className="md-price">
                    {price} <small>ر.س</small>
                  </div>
                  <div className="md-unit">سعر الحبة الواحدة</div>
                </div>
                <span className="md-btn md-dark">التفاصيل ←</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── installation ─────────────────────────────────────────────────────────── */

function Installation() {
  return (
    <section className="md-container md-installation" id="installation">
      <div className="md-install-visual">
        <div className="md-install-label">
          TIRES STORE <span>FIT &amp; GO</span>
        </div>
        <img src={`${IMG}/madar-tire.webp`} alt="خدمة تركيب الإطارات" loading="lazy" />
        <span className="md-install-circle" />
      </div>
      <div className="md-install-copy">
        <span className="md-eyebrow">اختيارك علينا، وطريقك قدّامك</span>
        <h2>
          اشترِ إطاراتك.
          <br />
          وركّبها عندنا.
        </h2>
        <p>
          تركيب مجاني في مراكزنا بالرياض، بعناية تليق بسيارتك.
          <br />
          اختر «استلام وتركيب» في السلة ونجهّز لك كل شيء.
        </p>
        <Link className="md-btn md-gold" to={`${HELP_PATH}#install`}>
          الموقع وشروط التركيب <span>↗</span>
        </Link>
        <div className="md-install-points">
          <span>01 اختر إطاراتك</span>
          <span>02 أكمل طلبك</span>
          <span>03 نسّق التركيب</span>
        </div>
      </div>
    </section>
  );
}

/* ── size guide ───────────────────────────────────────────────────────────── */

function SizeGuide() {
  return (
    <section className="md-section md-container md-size-guide" id="help">
      <div>
        <span className="md-eyebrow">اختيار صحيح، بكل بساطة</span>
        <h2>
          مقاسك مكتوب
          <br />
          على إطارك.
        </h2>
        <p>
          الأرقام على جانب الإطار بتساعدك تعرف المقاس.
          <br />
          تأكد أيضًا من المقاس الموصى به في دليل سيارتك.
        </p>
        <a className="md-text-link" href="#size">
          جاهز؟ اختَر مقاسك ←
        </a>
      </div>
      <div className="md-size-diagram">
        <div className="md-size-code" dir="ltr">
          <span>
            205<small>عرض الإطار · ملم</small>
          </span>
          <i>/</i>
          <span>
            55<small>نسبة الارتفاع · %</small>
          </span>
          <span>
            R16<small>قطر الجنط · بوصة</small>
          </span>
        </div>
        <div className="md-tread" />
      </div>
    </section>
  );
}

/* ── reviews, faq, contact ────────────────────────────────────────────────── */

function Reviews({ blocks }: { blocks: HomeLoaderData['components'] }) {
  const reviews = reviewsFrom(blocks).slice(0, 3);
  return (
    <section className="md-container md-reviews">
      <div className="md-heading">
        <div>
          <span className="md-eyebrow">ثقة تصنعها التجربة</span>
          <h2>تجارب عملائنا.</h2>
        </div>
        <p>آراء حقيقية من عملاء المتجر.</p>
      </div>
      <div className="md-review-grid">
        {reviews.map((review) => (
          <div key={review.name + review.text}>
            <span className="md-quote">“</span>
            <strong>{review.name}</strong>
            <p>{review.text}</p>
            <span className="md-stars" aria-label={`${review.stars} من 5`}>
              {'★'.repeat(Math.max(1, Math.min(5, review.stars)))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="md-section md-container md-faq" id="faq">
      <div>
        <span className="md-eyebrow">نساعدك تختار بثقة</span>
        <h2>أسئلة على الطريق.</h2>
        <p>إجابات واضحة قبل قرارك.</p>
      </div>
      <div className="md-faq-list">
        {FAQ.slice(0, 5).map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="md-container md-contact">
      <div>
        <span className="md-eyebrow">خلّنا نسهّلها عليك</span>
        <h2>تحتاج مساعدة في اختيار مقاسك؟</h2>
      </div>
      <a
        className="md-btn md-dark"
        href={whatsappUrl('مرحباً، أبي مساعدة في اختيار مقاس الإطار')}
        target="_blank"
        rel="noopener noreferrer"
      >
        تواصل معنا <span>↗</span>
      </a>
    </section>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export function MadarHome({ blocks }: { blocks: HomeLoaderData['components'] }) {
  return (
    <div className="md">
      <Hero />
      <SizeFinder />
      <Benefits />
      <Brands />
      <Services />
      <Categories />
      <Products />
      <Installation />
      <SizeGuide />
      <Reviews blocks={blocks} />
      <Faq />
      <Contact />
    </div>
  );
}
