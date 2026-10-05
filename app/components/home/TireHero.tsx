/**
 * Component #1 — بنر الإطار (`home.tire-hero`).
 * Design: design/final.html → hero. Fields are defined in twilight.json; every
 * field is optional here so the block still renders with the defaults below.
 * Styles: styles/04-components/tire-components.scss (scoped under `.tc-hero`).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

type Row = Record<string, unknown>;
const pick = (row: Row, key: string, prefix: string) => (row[key] ?? row[`${prefix}.${key}`]) as string | undefined;
const asBool = (v: unknown, d: boolean) => (v === undefined || v === null || v === '' ? d : v === true || v === 'true' || v === 1 || v === '1');
// multilanguage fields may arrive as { ar, en } before the engine resolves them
const asText = (v: unknown, d: string): string => {
  if (typeof v === 'string') return v.trim() ? v : d;
  if (v && typeof v === 'object') {
    const o = v as Row;
    const lang = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'ar';
    return asText(o[lang] ?? o.ar ?? o.en, d);
  }
  return d;
};
const asImage = (v: unknown, d: string) => {
  if (typeof v === 'string' && v) return v;
  if (v && typeof v === 'object' && 'url' in (v as Row)) return String((v as Row).url);
  return d;
};

const DEFAULT_STATS = [
  { value: '+5,000', label: 'عميل' },
  { value: '4.9 ★', label: 'تقييم المتجر' },
  { value: 'نفس اليوم', label: 'تركيب بالرياض' },
];
const DEFAULT_PARTS = [
  { code: 'P', name: 'نوع الإطار', text: 'P لسيارات الركاب، و LT للنقل الخفيف.' },
  { code: '205', name: 'العرض', text: 'عرض الإطار من جانب لجانب بالمليمتر.' },
  { code: '55', name: 'نسبة الارتفاع', text: 'ارتفاع جانب الإطار = 55% من عرضه.' },
  { code: 'R', name: 'نوع البناء', text: 'R يعني بناء شعاعي، و ZR للسرعات العالية.' },
  { code: '16', name: 'قطر الجنط', text: 'بالبوصة، ولازم يطابق جنط سيارتك.' },
  { code: '91', name: 'مؤشر الحمولة', text: 'يتحمّل حتى 615 كغ لكل إطار.' },
  { code: 'V', name: 'مؤشر السرعة', text: 'مناسب لسرعات حتى 240 كم/س.' },
  { code: '0324', name: 'تاريخ الصنع', text: 'الأسبوع 03 من سنة 2024 — نضمن تاريخ حديث.' },
];
// how the size code is laid out on the sidewall: which parts sit together
const JOIN_BEFORE: Record<number, string> = { 1: ' ', 2: '/', 3: ' ', 5: ' ', 7: '   ' };

// dropdown values arrive as [{ value }], { value } or a plain string
const opt = (v: unknown, d: string): string => {
  if (Array.isArray(v)) return opt(v[0], d);
  if (v && typeof v === 'object' && 'value' in (v as Row)) return String((v as Row).value);
  return typeof v === 'string' && v ? v : d;
};

export interface TireHeroProps {
  data: Row;
}

/** Entry: the merchant either uses our tire design, or just uploads banner images. */
export function TireHero({ data }: TireHeroProps) {
  return asBool(data.image_mode, false) ? <BannerSlider data={data} /> : <TireDesign data={data} />;
}

/* ===================== image mode: plain banner / slider ===================== */
interface Slide { desk: string; mob: string; link: string; title: string; text: string; btn: string }

function BannerSlider({ data }: TireHeroProps) {
  const slides = useMemo<Slide[]>(() => {
    const rows = Array.isArray(data.slides) ? (data.slides as Row[]) : [];
    return rows
      .map(r => {
        const desk = asImage(r.image ?? r['slides.image'], '');
        return {
          desk,
          mob: asImage(r.mobile_image ?? r['slides.mobile_image'], '') || desk,
          link: asText(r.link ?? r['slides.link'], ''),
          title: asText(r.title ?? r['slides.title'], ''),
          text: asText(r.text ?? r['slides.text'], ''),
          btn: asText(r.btn ?? r['slides.btn'], ''),
        };
      })
      .filter(s => s.desk);
  }, [data.slides]);

  const height = opt(data.banner_height, 'auto'); // auto | 21-9 | 16-9 | 3-1 | screen
  const fit = opt(data.banner_fit, 'cover'); // cover | contain
  const mobRatio = opt(data.banner_mobile_height, 'auto'); // auto | 1-1 | 4-5 | 9-16
  const autoplay = asBool(data.slides_autoplay, true);
  const every = Math.max(2, Number(data.slides_interval) || 5) * 1000;
  const boxed = asBool(data.banner_boxed, false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const many = slides.length > 1;

  useEffect(() => {
    if (!many || !autoplay || paused) return;
    const t = setInterval(() => setI(n => (n + 1) % slides.length), every);
    return () => clearInterval(t);
  }, [many, autoplay, paused, every, slides.length]);

  if (!slides.length) {
    return (
      <div className="tc tc-banner tc-banner--empty">
        <div className="tc-wrap">أضف صورة البنر من إعدادات العنصر (صورة للكمبيوتر وصورة للجوال).</div>
      </div>
    );
  }

  const posX = opt(data.content_x, 'start'); // start | center | end
  const posY = opt(data.content_y, 'center'); // top | center | bottom
  const posYm = opt(data.content_y_mobile, 'bottom');
  const shade = opt(data.shade, 'light'); // none | light | medium | strong
  const cls = [
    'tc', 'tc-banner', `tc-banner--h-${height}`, `tc-banner--m-${mobRatio}`, `tc-banner--${fit}`, boxed ? 'tc-banner--boxed' : '',
    `tc-banner--x-${posX}`, `tc-banner--y-${posY}`, `tc-banner--ym-${posYm}`, `tc-banner--shade-${shade}`,
  ].join(' ');
  return (
    <div className={cls} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription={many ? 'carousel' : undefined}>
      <div className="tc-banner__track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, n) => {
          const pic = (
            <picture>
              <source media="(max-width: 767px)" srcSet={s.mob} />
              <img src={s.desk} alt={s.title || 'بنر'} loading={n ? 'lazy' : 'eager'} fetchPriority={n ? undefined : 'high'} />
            </picture>
          );
          const overlay = (s.title || s.text || s.btn) ? (
            <div className="tc-banner__over">
              <div className="tc-wrap">
                {s.title && <h2>{s.title}</h2>}
                {s.text && <p>{s.text}</p>}
                {s.btn && <span className="tc-btn tc-btn--gold">{s.btn} <span aria-hidden="true">←</span></span>}
              </div>
            </div>
          ) : null;
          return (
            <div className="tc-banner__slide" key={s.desk + n} aria-hidden={n !== i}>
              {s.link ? <Link to={s.link}>{pic}{overlay}</Link> : <>{pic}{overlay}</>}
            </div>
          );
        })}
      </div>
      {many && (
        <>
          <button type="button" className="tc-banner__arrow is-prev" aria-label="السابق" onClick={() => setI(n => (n - 1 + slides.length) % slides.length)}>›</button>
          <button type="button" className="tc-banner__arrow is-next" aria-label="التالي" onClick={() => setI(n => (n + 1) % slides.length)}>‹</button>
          <div className="tc-banner__dots">
            {slides.map((_, n) => (
              <button key={n} type="button" className={n === i ? 'on' : undefined} aria-label={`الشريحة ${n + 1}`} onClick={() => setI(n)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== tire mode: our designed hero ===================== */
function TireDesign({ data }: TireHeroProps) {
  const kicker = asText(data.kicker, 'إطارات أصلية · تركيب بنفس اليوم بالرياض');
  const title1 = asText(data.title_1, 'مقاسك مكتوب');
  const title2 = asText(data.title_2, 'على إطارك.');
  const text = asText(data.text, 'اقرأ الأرقام على جانب إطارك الحالي، واختر الإطار المناسب بسعر واضح لكل حبة — والتركيب علينا.');
  const btn1 = { text: asText(data.btn1_text, 'تسوّق حسب المقاس'), link: asText(data.btn1_link, '/#size') };
  const btn2 = { show: asBool(data.btn2_show, true), text: asText(data.btn2_text, 'اكتشف خدمة التركيب'), link: asText(data.btn2_link, '/help#install') };
  const image = asImage(data.tire_image, '/assets/images/home/tire-hero.webp');
  const giant = { show: asBool(data.giant_show, true), text: asText(data.giant_text, 'R16') };
  const float = asBool(data.float_anim, true);
  const showStats = asBool(data.stats_show, true);
  const showParts = asBool(data.parts_show, true);
  const interval = Math.max(1.5, Number(data.parts_interval) || 3.5) * 1000;

  const stats = useMemo(() => {
    const rows = Array.isArray(data.stats) ? (data.stats as Row[]) : [];
    const list = rows.map(r => ({ value: pick(r, 'value', 'stats') || '', label: pick(r, 'label', 'stats') || '' })).filter(r => r.value);
    return list.length ? list : DEFAULT_STATS;
  }, [data.stats]);
  const parts = useMemo(() => {
    const rows = Array.isArray(data.parts) ? (data.parts as Row[]) : [];
    const list = rows.map(r => ({ code: pick(r, 'code', 'parts') || '', name: pick(r, 'name', 'parts') || '', text: pick(r, 'text', 'parts') || '' })).filter(r => r.code);
    return list.length ? list : DEFAULT_PARTS;
  }, [data.parts]);

  // ----- sidewall size code + popup -----
  const textRef = useRef<SVGTextElement>(null);
  const [active, setActive] = useState(1);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ranges = useMemo(() => {
    let i = 0;
    return parts.map((p, n) => {
      i += (JOIN_BEFORE[n] ?? (n ? ' ' : '')).length;
      const r: [number, number] = [i, i + p.code.length - 1];
      i += p.code.length;
      return r;
    });
  }, [parts]);

  useEffect(() => {
    if (!showParts || hover) return;
    const t = setInterval(() => setActive(a => (a + 1) % parts.length), interval);
    return () => clearInterval(t);
  }, [showParts, hover, parts.length, interval]);

  useEffect(() => {
    const el = textRef.current;
    if (!el || !showParts) return;
    const place = () => {
      try {
        const [a, b] = ranges[active];
        const s = el.getStartPositionOfChar(a), e = el.getEndPositionOfChar(b);
        setPos({ x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 });
      } catch {
        setPos(null);
      }
    };
    place();
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(place);
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active, ranges, showParts]);

  const cur = parts[active] ?? parts[0];

  return (
    <div
      className={[
        'tc', 'tc-hero',
        `tc-hero--m-${opt(data.mobile_order, 'image')}`, // image | text — what comes first on phones
        `tc-hero--d-${opt(data.desktop_side, 'text-right')}`, // text-right | text-left
        `tc-hero--a-${opt(data.mobile_align, 'center')}`, // center | start
      ].join(' ')}
    >
      <div className="tc-wrap tc-hero__grid">
        <div className="tc-hero__copy">
          <span className="tc-kicker">{kicker}</span>
          <h1>
            {title1}
            <br />
            <span>{title2}</span>
          </h1>
          <p className="tc-lead">{text}</p>
          <div className="tc-hero__cta">
            <Link to={btn1.link} className="tc-btn tc-btn--gold">
              {btn1.text} <span aria-hidden="true">←</span>
            </Link>
            {btn2.show && (
              <Link to={btn2.link} className="tc-btn tc-btn--line">
                {btn2.text} <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
          {showStats && (
            <div className="tc-hero__proof">
              {stats.map(s => (
                <span key={s.value + s.label}>
                  <b>{s.value}</b> {s.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="tc-hero__stage">
          {giant.show && <div className="tc-hero__giant" aria-hidden="true">{giant.text}</div>}
          <div className={'tc-hero__tire' + (float ? ' is-floating' : '')}>
            <img src={image} alt="إطار" width={700} height={700} fetchPriority="high" />
            {showParts && (
              <svg viewBox="0 0 1000 1000" className="tc-hero__sw" aria-label="أرقام المقاس على جانب الإطار">
                <defs>
                  <path id="tc-arc" d="M 165 500 A 335 335 0 0 1 835 500" />
                </defs>
                <text ref={textRef} fontSize="44">
                  <textPath href="#tc-arc" startOffset="50%" textAnchor="middle">
                    {parts.map((p, n) => (
                      <tspan key={p.code + n}>
                        {JOIN_BEFORE[n] ?? (n ? ' ' : '')}
                        <tspan
                          className={n === active ? 'on' : undefined}
                          onMouseEnter={() => { setHover(true); setActive(n); }}
                          onMouseLeave={() => setHover(false)}
                          onClick={() => setActive(n)}
                        >
                          {p.code}
                        </tspan>
                      </tspan>
                    ))}
                  </textPath>
                </text>
              </svg>
            )}
            {showParts && pos && cur && (
              <div className="tc-hero__pop" style={{ left: `${pos.x / 10}%`, top: `${pos.y / 10}%` }} role="status">
                <b>
                  <em>{cur.code}</em>
                  {cur.name}
                </b>
                <span>{cur.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
