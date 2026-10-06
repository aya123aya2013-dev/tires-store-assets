/**
 * Component #12 — شريط متحرك (`home.ticker`).
 * Design: design/final.html → `.secbar` (dark band, endless track: numbered links + dotted phrases).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'المقاس': 'Size', 'الإطارات': 'Tires', 'التركيب': 'Fitting', 'الدليل': 'Guide',
  'إطارات أصلية بضمان الوكيل': 'Genuine tires with dealer warranty', 'تركيب مجاني بالرياض': 'Free fitting in Riyadh', 'قسّطها مع تابي وتمارا': 'Split it with Tabby & Tamara',
};
const DEFAULTS = [
  { text: 'المقاس', link: '#size', num: true }, { text: 'الإطارات', link: '/latest-products', num: true },
  { text: 'التركيب', link: '/help#install', num: true }, { text: 'الدليل', link: '/help', num: true },
  { text: 'إطارات أصلية بضمان الوكيل', link: '', num: false }, { text: 'تركيب مجاني بالرياض', link: '', num: false }, { text: 'قسّطها مع تابي وتمارا', link: '', num: false },
];
const SPEED: Record<string, string> = { slow: '50s', normal: '34s', fast: '20s' };

export function Ticker({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const list = rows(data.items, 'items').map(r => ({ text: t(r.text, ''), link: asLink(r.link, ''), num: asBool(r.number, false) })).filter(i => i.text).slice(0, 10);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const items = Array.isArray(data.items) ? list : DEFAULTS.map(d => ({ ...d, text: t(d.text, d.text) }));

  let counter = 0;
  const render = () =>
    items.map((it, i) => {
      if (!it.link) return <span key={i}>{it.text}</span>;
      const n = it.num ? String(++counter).padStart(2, '0') : '';
      return <Link key={i} to={it.link}>{n && <b>{n}</b>}{it.text}</Link>;
    });
  const first = render();
  counter = 0;
  const copy = render();

  const cls = ['secbar', opt(data.bg, 'dark') === 'gold' ? 'tc-gold' : '', asBool(data.pause_on_hover, true) ? '' : 'tc-nopause'].filter(Boolean).join(' ');
  if (!items.length) return null;
  return (
    <Section data={data}>
      <nav className={cls} aria-label={t(data.label, 'أقسام المتجر')}>
        <div className="tk">
          <div className="tk-track" style={{ animationDuration: SPEED[opt(data.speed, 'normal')] ?? '34s' }}>
            {first}
            {/* the loop copy (an <i>, so the design's span dot style doesn't hit the wrapper) */}
            <i style={{ display: 'contents' }} aria-hidden="true" inert>{copy}</i>
          </div>
        </div>
      </nav>
    </Section>
  );
}
