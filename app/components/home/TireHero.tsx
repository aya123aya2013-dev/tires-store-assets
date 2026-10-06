/**
 * Component #1 — بنر الإطار (`home.tire-hero`).
 * Design: design/final.html → hero. Fields are defined in twilight.json; every
 * field is optional here so the block still renders with the defaults below.
 * Styles: styles/04-components/tire-components.scss (scoped under `.tc-hero`).
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asImage, asLink, asText, customClass, isCleared, isRow, opt, pick, useLang, useReducedMotion } from './fields';
import type { Lang, Row } from './fields';

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
// English defaults: shown on the English storefront while a field still holds our Arabic default
const EN: Record<string, string> = {
  'إطارات أصلية · تركيب بنفس اليوم بالرياض': 'Genuine tires · same-day fitting in Riyadh',
  'مقاسك مكتوب': 'Your size is written',
  'على إطارك.': 'on your tire.',
  'اقرأ الأرقام على جانب إطارك الحالي، واختر الإطار المناسب بسعر واضح لكل حبة — والتركيب علينا.':
    'Read the numbers on your current tire’s sidewall and pick the right one at a clear per-tire price — fitting is on us.',
  'تسوّق حسب المقاس': 'Shop by size',
  'اكتشف خدمة التركيب': 'Discover our fitting service',
  'عميل': 'customers',
  'تقييم المتجر': 'store rating',
  'نفس اليوم': 'Same day',
  'تركيب بالرياض': 'fitting in Riyadh',
  'نوع الإطار': 'Tire type', 'P لسيارات الركاب، و LT للنقل الخفيف.': 'P for passenger cars, LT for light trucks.',
  'العرض': 'Width', 'عرض الإطار من جانب لجانب بالمليمتر.': 'Tire width from side to side, in millimetres.',
  'نسبة الارتفاع': 'Aspect ratio', 'ارتفاع جانب الإطار = 55% من عرضه.': 'Sidewall height = 55% of the width.',
  'نوع البناء': 'Construction', 'R يعني بناء شعاعي، و ZR للسرعات العالية.': 'R means radial construction, ZR is for high speeds.',
  'قطر الجنط': 'Rim diameter', 'بالبوصة، ولازم يطابق جنط سيارتك.': 'In inches — it must match your car’s rim.',
  'مؤشر الحمولة': 'Load index', 'يتحمّل حتى 615 كغ لكل إطار.': 'Carries up to 615 kg per tire.',
  'مؤشر السرعة': 'Speed rating', 'مناسب لسرعات حتى 240 كم/س.': 'Rated for speeds up to 240 km/h.',
  'تاريخ الصنع': 'Production date', 'الأسبوع 03 من سنة 2024 — نضمن تاريخ حديث.': 'Week 03 of 2024 — we guarantee fresh stock.',
};
const tr = (s: string, lang: Lang) => (lang === 'en' ? EN[s.trim()] ?? s : s);

// how the size code is laid out on the sidewall: which parts sit together
const JOIN_BEFORE: Record<number, string> = { 1: ' ', 2: '/', 3: ' ', 5: ' ', 7: '   ' };

export interface TireHeroProps {
  data: Row;
}

/** Entry: the merchant either uses our tire design, or just uploads banner images. */
export function TireHero({ data }: TireHeroProps) {
  return asBool(data.image_mode, false) ? <BannerSlider data={data} /> : <TireDesign data={data} />;
}

/* ===================== image mode: plain banner / slider ===================== */
interface Slide {
  desk: string; mob: string; video: Video | null; link: string; wholeLink: boolean; title: string; text: string;
  btn: string; btnBg: string; btnColor: string; btnOutline: boolean; focus: string; posX: string;
}

function BannerSlider({ data }: TireHeroProps) {
  const lang = useLang();
  const isEn = lang === 'en';
  const reduced = useReducedMotion();
  const slides = useMemo<Slide[]>(() => {
    const rows = Array.isArray(data.slides) ? data.slides.filter(isRow) : [];
    const f = (r: Row, k: string) => pick(r, k, 'slides');
    const t = (v: unknown) => asText(v, '', lang);
    return rows
      .map(r => {
        const useEn = isEn && asBool(f(r, 'en_images'), false);
        const deskAr = asImage(f(r, 'image'), '');
        const mobAr = asImage(f(r, 'mobile_image'), '');
        // either image stands in for the other
        const desk = (useEn && asImage(f(r, 'image_en'), '')) || deskAr || mobAr;
        const mob = (useEn && asImage(f(r, 'mobile_image_en'), '')) || mobAr || desk;
        const video = asBool(f(r, 'use_video'), false) ? videoSrc(t(f(r, 'video'))) : null;
        return {
          desk, mob, video,
          link: asLink(f(r, 'link') ?? r.url, ''),
          wholeLink: asBool(f(r, 'whole_link'), true),
          title: t(f(r, 'title')),
          text: t(f(r, 'text')),
          btn: t(f(r, 'btn')),
          btnBg: t(f(r, 'btn_bg')),
          btnColor: t(f(r, 'btn_color')),
          btnOutline: asBool(f(r, 'btn_outline'), false),
          focus: opt(f(r, 'focus'), 'center'),
          posX: opt(f(r, 'pos_x'), ''),
        };
      })
      .filter(s => s.desk || s.video);
  }, [data.slides, isEn, lang]);

  const height = opt(data.banner_height, 'auto'); // auto | 21-9 | 16-9 | 3-1 | screen
  const fit = opt(data.banner_fit, 'cover');
  const mobRatio = opt(data.banner_mobile_height, 'auto');
  const autoplay = asBool(data.slides_autoplay, true);
  const every = Math.max(2, Number(data.slides_interval) || 5) * 1000;
  const rawSpeed = data.slides_speed === '' || data.slides_speed == null ? NaN : Number(data.slides_speed);
  const speed = Number.isFinite(rawSpeed) ? Math.min(3, Math.max(0, rawSpeed)) : 0.6; // 0 = instant
  const effect = opt(data.slides_effect, 'slide'); // slide | fade
  const showArrows = asBool(data.show_arrows, true);
  const showDots = asBool(data.show_dots, true);
  const boxed = asBool(data.banner_boxed, false);
  const topSpace = asBool(data.top_space, false);
  const [rawI, setI] = useState(0);
  const i = slides.length ? rawI % slides.length : 0; // the merchant may remove slides while a later one is showing
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touchX = useRef<number | null>(null);
  const many = slides.length > 1;
  const running = many && autoplay && !paused && !stopped && !reduced;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setI(n => (n + 1) % slides.length), every);
    return () => clearInterval(t);
  }, [running, every, slides.length]);

  if (!slides.length) {
    return (
      <div className={'tc tc-banner tc-banner--empty ' + customClass(data.custom_class)}>
        <div className="tc-wrap">أضف صورة البنر من إعدادات العنصر (صورة للكمبيوتر وصورة للجوال).</div>
      </div>
    );
  }

  const posX = opt(data.content_x, 'start');
  const posY = opt(data.content_y, 'center');
  const posYm = opt(data.content_y_mobile, 'bottom');
  const shade = opt(data.shade, 'light');
  const cls = [
    'tc', 'tc-banner', `tc-banner--h-${height}`, `tc-banner--m-${mobRatio}`, `tc-banner--${fit}`, boxed ? 'tc-banner--boxed' : '',
    `tc-banner--x-${posX}`, `tc-banner--y-${posY}`, `tc-banner--ym-${posYm}`, `tc-banner--shade-${shade}`,
    `tc-banner--fx-${effect}`, topSpace ? 'tc-banner--top-space' : '', customClass(data.custom_class),
  ].join(' ');
  const go = (n: number) => setI((n + slides.length) % slides.length);
  // swipe: phones always have a way to move, even with arrows / dots / autoplay off
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || !many) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); // the track is laid out left-to-right in both languages
  };

  return (
    <div
      className={cls}
      dir={isEn ? 'ltr' : 'rtl'}
      style={{ ['--tc-speed' as string]: `${speed}s` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={onTouchEnd}
      role={many ? 'region' : undefined}
      aria-roledescription={many ? 'carousel' : undefined}
      aria-label={many ? (isEn ? 'Banner' : 'البنر') : undefined}
    >
      <div className="tc-banner__track" style={effect === 'slide' ? { transform: `translateX(-${i * 100}%)` } : undefined}>
        {slides.map((s, n) => {
          const on = n === i;
          // only the visible slide plays its video
          const media = s.video ? (
            !on ? (
              <div className="tc-banner__video" aria-hidden="true" />
            ) : s.video.kind === 'youtube' ? (
              <iframe className="tc-banner__video" src={youTubeEmbed(s.video.id)} title={s.title || (isEn ? 'Video' : 'فيديو')} allow="autoplay; encrypted-media" />
            ) : (
              <video className="tc-banner__video" src={s.video.src} autoPlay={!reduced} controls={reduced} muted loop playsInline preload="metadata" />
            )
          ) : (
            <picture>
              <source media="(max-width: 767px)" srcSet={s.mob} />
              <img src={s.desk} alt={s.title || 'بنر'} loading={n ? 'lazy' : 'eager'} fetchPriority={n ? undefined : 'high'} style={{ objectPosition: s.focus }} />
            </picture>
          );
          const btnStyle = s.btnOutline
            ? { background: 'transparent', color: s.btnColor || '#fff', border: `1.5px solid ${s.btnColor || '#fff'}` }
            : { background: s.btnBg || undefined, color: s.btnColor || undefined };
          const btn = s.btn ? (
            s.link && !s.wholeLink
              ? <Link to={s.link} className="tc-btn tc-btn--gold" style={btnStyle}>{s.btn} <span aria-hidden="true">←</span></Link>
              : <span className="tc-btn tc-btn--gold" style={btnStyle}>{s.btn} <span aria-hidden="true">←</span></span>
          ) : null;
          const overlay = (s.title || s.text || s.btn) ? (
            <div className={'tc-banner__over' + (s.posX ? ` is-x-${s.posX}` : '')}>
              <div className="tc-wrap">
                {s.title && <h2>{s.title}</h2>}
                {s.text && <p>{s.text}</p>}
                {btn}
              </div>
            </div>
          ) : null;
          const inner = <>{media}{overlay}</>;
          return (
            <div
              className={'tc-banner__slide' + (on ? ' is-on' : '')}
              key={(s.desk || s.video?.src || '') + n}
              aria-hidden={!on}
              inert={!on}
              role={many ? 'group' : undefined}
              aria-roledescription={many ? 'slide' : undefined}
              aria-label={many ? `${n + 1} / ${slides.length}` : undefined}
            >
              {s.link && s.wholeLink ? <Link to={s.link}>{inner}</Link> : inner}
            </div>
          );
        })}
      </div>
      {many && showArrows && (
        <>
          <button type="button" className="tc-banner__arrow is-prev" aria-label={isEn ? 'Previous' : 'السابق'} onClick={() => go(i - 1)}>{isEn ? '‹' : '›'}</button>
          <button type="button" className="tc-banner__arrow is-next" aria-label={isEn ? 'Next' : 'التالي'} onClick={() => go(i + 1)}>{isEn ? '›' : '‹'}</button>
        </>
      )}
      {many && autoplay && !reduced && (
        <button type="button" className="tc-banner__pause" aria-pressed={stopped} aria-label={stopped ? (isEn ? 'Play' : 'تشغيل') : (isEn ? 'Pause' : 'إيقاف')} onClick={() => setStopped(v => !v)}>
          {stopped ? '▶' : '❚❚'}
        </button>
      )}
      {many && showDots && (
        <div className="tc-banner__dots">
          {slides.map((_, n) => (
            <button key={n} type="button" className={n === i ? 'on' : undefined} aria-label={isEn ? `Slide ${n + 1}` : `الشريحة ${n + 1}`} aria-current={n === i || undefined} onClick={() => go(n)} />
          ))}
        </div>
      )}
    </div>
  );
}

type Video = { kind: 'youtube'; id: string; src: string } | { kind: 'file'; src: string };
// YouTube is recognised by hostname + an 11-char id; anything else must be a direct video url
const videoSrc = (u: string): Video | null => {
  if (!u) return null;
  let url: URL;
  try { url = new URL(u, 'https://local.invalid'); } catch { return null; }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
    const id = host === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') || (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/) || [])[1] || '';
    return /^[\w-]{11}$/.test(id) ? { kind: 'youtube', id, src: u } : null;
  }
  return /^(https?:|\/)/.test(u) ? { kind: 'file', src: u } : null;
};
const youTubeEmbed = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1`;

/* ===================== tire mode: our designed hero ===================== */
function TireDesign({ data }: TireHeroProps) {
  const lang = useLang();
  const reduced = useReducedMotion();
  const text_ = (v: unknown, d: string) => (isCleared(v) ? '' : tr(asText(v, d, lang), lang));
  const kicker = text_(data.kicker, 'إطارات أصلية · تركيب بنفس اليوم بالرياض');
  const title1 = text_(data.title_1, 'مقاسك مكتوب');
  const title2 = text_(data.title_2, 'على إطارك.');
  const text = text_(data.text, 'اقرأ الأرقام على جانب إطارك الحالي، واختر الإطار المناسب بسعر واضح لكل حبة — والتركيب علينا.');
  const btn1 = { text: text_(data.btn1_text, 'تسوّق حسب المقاس'), link: asLink(data.btn1_link, '#size') }; // the size finder right under the hero
  const btn2 = { show: asBool(data.btn2_show, true), text: text_(data.btn2_text, 'اكتشف خدمة التركيب'), link: asLink(data.btn2_link, '/help#install') };
  const image = asImage(data.tire_image, '/assets/images/home/tire-hero.webp');
  const giant = { show: asBool(data.giant_show, true), text: text_(data.giant_text, 'R16') };
  const float = asBool(data.float_anim, true);
  const showStats = asBool(data.stats_show, true);
  const showParts = asBool(data.parts_show, true);
  const interval = Math.max(1.5, Number(data.parts_interval) || 3.5) * 1000;

  const stats = useMemo(() => {
    const rows = Array.isArray(data.stats) ? data.stats.filter(isRow) : [];
    const list = rows
      .map(r => ({ value: text_(pick(r, 'value', 'stats'), ''), label: text_(pick(r, 'label', 'stats'), '') }))
      .filter(r => r.value);
    return Array.isArray(data.stats) ? list : DEFAULT_STATS.map(r => ({ value: tr(r.value, lang), label: tr(r.label, lang) }));
  }, [data.stats, lang]);
  const parts = useMemo(() => {
    const rows = Array.isArray(data.parts) ? data.parts.filter(isRow) : [];
    const list = rows
      .map(r => ({
        code: asText(pick(r, 'code', 'parts'), '', lang).trim(),
        name: text_(pick(r, 'name', 'parts'), ''),
        text: text_(pick(r, 'text', 'parts'), ''),
      }))
      .filter(r => r.code);
    return Array.isArray(data.parts) && list.length ? list : DEFAULT_PARTS.map(r => ({ ...r, name: tr(r.name, lang), text: tr(r.text, lang) }));
  }, [data.parts, lang]);

  // ----- sidewall size code + popup -----
  const textRef = useRef<SVGTextElement>(null);
  const arcId = 'tc-arc-' + useId().replace(/[^a-zA-Z0-9-]/g, '');
  const [rawActive, setActive] = useState(1);
  const active = parts.length ? rawActive % parts.length : 0; // merchant may have fewer parts
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
    if (!showParts || hover || reduced) return;
    const t = setInterval(() => setActive(a => (a + 1) % parts.length), interval);
    return () => clearInterval(t);
  }, [showParts, hover, reduced, parts.length, interval]);

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
        customClass(data.custom_class),
      ].join(' ')}
    >
      <div className="tc-wrap tc-hero__grid">
        <div className="tc-hero__copy">
          <span className="tc-kicker">{kicker}</span>
          <h1>
            {title1}
            <br />
            <LastWordGold text={title2} />
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
          {showStats && stats.length > 0 && (
            <div className="tc-hero__proof">
              {stats.map(s => (
                <span key={s.value + s.label}>
                  <b>{s.value.replace(/\s*★\s*/g, '')}</b>
                  {s.value.includes('★') && <em> ★</em>} {s.label}
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
                  <path id={arcId} d="M 165 500 A 335 335 0 0 1 835 500" />
                </defs>
                <text ref={textRef} fontSize="44">
                  <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                    {parts.map((p, n) => (
                      <tspan key={p.code + n}>
                        {JOIN_BEFORE[n] ?? (n ? ' ' : '')}
                        <tspan
                          className={n === active ? 'on' : undefined}
                          tabIndex={0}
                          role="button"
                          aria-label={`${p.code} — ${p.name}`}
                          onMouseEnter={() => { setHover(true); setActive(n); }}
                          onMouseLeave={() => setHover(false)}
                          onFocus={() => { setHover(true); setActive(n); }}
                          onBlur={() => setHover(false)}
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

// approved design: only the last word of the 2nd title line is gold — «على <span>إطارك.</span>»
function LastWordGold({ text }: { text: string }) {
  const k = text.trimEnd().lastIndexOf(' ');
  if (k < 0) return <span>{text}</span>;
  return <>{text.slice(0, k + 1)}<span>{text.slice(k + 1)}</span></>;
}
