/**
 * Component #3 — شريط المميزات (`home.benefits-strip`).
 * Design: design/final.html → `.bstrip` (4 columns, gold icon + title + line, hairline dividers).
 */
import { makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'إطارات أصلية': 'Genuine tires', 'من علامات تثق بها': 'From brands you trust',
  'تركيب بالرياض': 'Fitting in Riyadh', 'عناية بكل التفاصيل': 'Care in every detail',
  'خيارات دفع مرنة': 'Flexible payment', 'تابي وتمارا ومدى': 'Tabby, Tamara & mada',
  'توصيل لجميع المناطق': 'Delivery everywhere', 'رحلتك تبدأ من بابك': 'Your trip starts at your door',
};
const DEFAULTS = [
  { icon: 'shield', title: 'إطارات أصلية', text: 'من علامات تثق بها' },
  { icon: 'wrench', title: 'تركيب بالرياض', text: 'عناية بكل التفاصيل' },
  { icon: 'card', title: 'خيارات دفع مرنة', text: 'تابي وتمارا ومدى' },
  { icon: 'truck', title: 'توصيل لجميع المناطق', text: 'رحلتك تبدأ من بابك' },
];

export function BenefitsStrip({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const list = rows(data.items, 'items')
    .map(r => ({ icon: opt(r.icon, 'shield'), title: t(r.title, ''), text: t(r.text, '') }))
    .filter(r => r.title || r.text)
    .slice(0, 4);
  const items = list.length ? list : DEFAULTS.map(d => ({ ...d, title: t(d.title, d.title), text: t(d.text, d.text) }));
  return (
    <Section data={data}>
      <section className={`wrap bstrip tc-n-${items.length}`}>
        {items.map((it, i) => (
          <div key={i}>
            <Icon name={it.icon} />
            <p>
              <b>{it.title}</b>
              {it.text}
            </p>
          </div>
        ))}
      </section>
    </Section>
  );
}
