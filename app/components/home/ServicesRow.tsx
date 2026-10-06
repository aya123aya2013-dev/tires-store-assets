/**
 * Component #13 — صف الخدمات «كل ما تحتاجه» (`home.services-row`).
 * Design: design/final.html → `#services` (intro column + 3 cards: photo with a small tag,
 * the delivery-truck drawing, the dark size-guide art).
 */
import { Fragment } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'أكثر من مجرد إطار': 'More than a tire', 'كل ما تحتاجه\nلإطاراتك.': 'Everything you need\nfor your tires.',
  'من اختيار المقاس إلى التركيب.\nتجربة بسيطة، واهتمام بالتفاصيل.': 'From choosing the size to fitting.\nSimple, with care for the details.',
  'تعرّف على خدماتنا': 'Our services', 'عناية بالتفاصيل': 'Care in the details',
  'تركيب احترافي': 'Professional fitting', 'إطاراتك في أيدٍ خبيرة': 'Your tires in expert hands',
  'توصيل إلى بابك': 'Delivered to your door', 'خيارات تناسب وجهتك': 'Options for wherever you are',
  'دليل المقاسات': 'Size guide', 'اعرف مقاسك بكل سهولة': 'Find your size easily',
};
const lines = (s: string) => s.split(/\n/).map((l, i, a) => <Fragment key={i}>{l}{i < a.length - 1 && <br />}</Fragment>);

// the approved delivery drawing (design/final.html → .svc-art.truck)
const Truck = ({ label }: { label: string }) => (
  <svg viewBox="0 0 360 200" aria-hidden="true">
    <rect x="42" y="58" width="170" height="92" rx="10" fill="#fff" />
    <path d="M212 80h54l44 41v29h-98Z" fill="#eceae4" />
    <path d="M222 87h36l28 29h-64Z" fill="#a9aeb2" />
    <path d="M46 132h262" stroke="#ffb71b" strokeWidth="7" />
    <circle cx="97" cy="151" r="23" fill="#2f3337" /><circle cx="97" cy="151" r="10" fill="#d4d6d8" />
    <circle cx="265" cy="151" r="23" fill="#2f3337" /><circle cx="265" cy="151" r="10" fill="#d4d6d8" />
    <text x="127" y="108" fontSize="17" textAnchor="middle" fill="#2f3337" fontWeight="700" fontFamily="Arial">{label}</text>
  </svg>
);

const DEFAULTS = [
  { art: 'photo', image: '/assets/images/tc/mechanic-tyre.webp', tag: 'عناية بالتفاصيل', label: '', title: 'تركيب احترافي', text: 'إطاراتك في أيدٍ خبيرة', link: '/help#install' },
  { art: 'truck', image: '', tag: '', label: 'TIRES STORE', title: 'توصيل إلى بابك', text: 'خيارات تناسب وجهتك', link: '/help' },
  { art: 'guide', image: '/assets/images/tc/madar-tire.webp', tag: '', label: '205 / 55 R16', title: 'دليل المقاسات', text: 'اعرف مقاسك بكل سهولة', link: '/help#size' },
];

export function ServicesRow({ data }: { data: Row }) {
  const lang = useLang();
  const t = makeT(lang, EN);
  const list = rows(data.cards, 'cards')
    .map(r => {
      const art = opt(r.art, 'photo');
      const fallback = art === 'guide' ? '/assets/images/tc/madar-tire.webp' : art === 'photo' ? '/assets/images/tc/mechanic-tyre.webp' : '';
      return { art, image: asImage(r.image, fallback), tag: t(r.tag, ''), label: t(r.label, art === 'guide' ? '205 / 55 R16' : 'TIRES STORE'), title: t(r.title, ''), text: t(r.text, ''), link: asLink(r.link, '/help') };
    })
    .filter(c => c.title)
    .slice(0, 3);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const cards = Array.isArray(data.cards) ? list : DEFAULTS.map(d => ({ ...d, tag: d.tag && t(d.tag, d.tag), title: t(d.title, d.title), text: t(d.text, d.text) }));

  return (
    <Section data={data}>
      <section className="sec" id="services">
        <div className="wrap svc">
          <div className="svc-intro">
            <span className="kicker">{t(data.kicker, 'أكثر من مجرد إطار')}</span>
            <h2 className="h2">{lines(t(data.title, 'كل ما تحتاجه\nلإطاراتك.'))}</h2>
            <p className="lead">{lines(t(data.text, 'من اختيار المقاس إلى التركيب.\nتجربة بسيطة، واهتمام بالتفاصيل.'))}</p>
            <Link className="link" to={asLink(data.link, '/help')}>
              {t(data.link_text, 'تعرّف على خدماتنا')} <Icon name="arrow" style={{ width: 16, height: 16, ...(lang === 'en' ? { transform: 'scaleX(-1)' } : {}) }} />
            </Link>
          </div>
          {cards.map((c, i) => (
            <Link className="svc-card" to={c.link} key={i}>
              {c.art === 'truck' ? (
                <div className="svc-art truck"><Truck label={c.label} /></div>
              ) : c.art === 'guide' ? (
                <div className="svc-art guide">{c.image && <img src={c.image} alt="" loading="lazy" />}<b dir="ltr">{c.label}</b></div>
              ) : (
                <div className="svc-art">{c.image && <img src={c.image} alt={c.title} loading="lazy" />}{c.tag && <span className="svc-tag">{c.tag}</span>}</div>
              )}
              <div className="svc-cap">
                <div><b>{c.title}</b><small>{c.text}</small></div>
                <span className="rnd-arr">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Section>
  );
}
