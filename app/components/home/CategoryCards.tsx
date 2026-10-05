/**
 * Component #6 — كروت الفئات «جاهزة لطريقك» (`home.category-cards`).
 * Design: design/final.html → `#cats` (.sec-head + `.catg` of `.cat`: number, icon tile, title, line, arrow).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'لكل سيارة، اختيار': 'A choice for every car', 'جاهزة لطريقك.': 'Ready for your road.',
  'اختر فئة سيارتك، واكتشف الخيارات المناسبة.': 'Pick your car type and discover the right options.',
  'جميع الإطارات': 'All tires', 'استكشف المجموعة': 'Explore the range',
  'سيارات سيدان': 'Sedans', 'راحة للاستخدام اليومي': 'Comfort for daily driving',
  'دفع رباعي': 'SUV & 4x4', 'ثقة في كل رحلة': 'Confidence on every trip',
  'نقل و بيك أب': 'Trucks & pickups', 'تحمّل ومسافات طويلة': 'Load and long distances',
};
const DEFAULTS = [
  { icon: 'cat-all', title: 'جميع الإطارات', text: 'استكشف المجموعة', on: true },
  { icon: 'cat-sedan', title: 'سيارات سيدان', text: 'راحة للاستخدام اليومي', on: false },
  { icon: 'cat-suv', title: 'دفع رباعي', text: 'ثقة في كل رحلة', on: false },
  { icon: 'cat-truck', title: 'نقل و بيك أب', text: 'تحمّل ومسافات طويلة', on: false },
];

export function CategoryCards({ data }: { data: Row }) {
  const lang = useLang();
  const t = makeT(lang, EN);
  const list = rows(data.cards, 'cards')
    .map(r => ({ icon: opt(r.icon, 'cat-all'), image: asImage(r.image, ''), title: t(r.title, ''), text: t(r.text, ''), link: asLink(r.link, '/search'), on: asBool(r.highlight, false) }))
    .filter(c => c.title)
    .slice(0, 6);
  const cards = list.length ? list : DEFAULTS.map(d => ({ ...d, image: '', link: '/search', title: t(d.title, d.title), text: t(d.text, d.text) }));
  const lead = t(data.text, 'اختر فئة سيارتك، واكتشف الخيارات المناسبة.');

  return (
    <Section data={data}>
      <section className={'sec cats' + (asBool(data.light_bg, false) ? ' tc-light' : '')} id="cats">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'لكل سيارة، اختيار')}</span>
              <h2 className="h2">{t(data.title, 'جاهزة لطريقك.')}</h2>
            </div>
            {lead && <p className="lead">{lead}</p>}
          </div>
          <div className={`catg tc-n-${cards.length}`}>
            {cards.map((c, i) => (
              <Link className={'cat' + (c.on ? ' on' : '')} to={c.link} key={i}>
                <span className="cn">{String(i + 1).padStart(2, '0')}</span>
                <span className="cic">{c.image ? <img src={c.image} alt="" /> : <Icon name={c.icon} />}</span>
                <b>{c.title}</b>
                <small>{c.text}</small>
                <span className="ca"><Icon name="arrow" style={lang === 'en' ? { transform: 'scaleX(-1)' } : undefined} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
