/**
 * Component #18 — الخطوات (`home.steps`).
 * Design: design/final.html → `#steps` (.sec-head + `.s3`: icon tile, title + line, big faded number).
 */
import { makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'رحلة أسهل من البداية': 'An easier trip from the start', 'ثلاث خطوات. وطريقك جاهز.': 'Three steps. Your road is ready.',
  'تسوّق براحتك، وخلّ الباقي علينا.': 'Shop at ease — leave the rest to us.',
  'اعرف مقاسك': 'Know your size', 'اختر العرض ونسبة الارتفاع وقطر الجنط، وشوف الإطارات المطابقة.': 'Pick width, profile and rim, and see the matching tires.',
  'اختر إطارك': 'Choose your tire', 'قارن الماركات والأسعار، وحدّد الكمية المناسبة لسيارتك.': 'Compare brands and prices, and pick the right quantity.',
  'نسّق الاستلام والتركيب': 'Arrange pick-up & fitting', 'راجع خيارات التوصيل أو التركيب في الرياض.': 'Review delivery or fitting options in Riyadh.',
};
const DEFAULTS = [
  { icon: 'search', title: 'اعرف مقاسك', text: 'اختر العرض ونسبة الارتفاع وقطر الجنط، وشوف الإطارات المطابقة.' },
  { icon: 'card', title: 'اختر إطارك', text: 'قارن الماركات والأسعار، وحدّد الكمية المناسبة لسيارتك.' },
  { icon: 'wrench', title: 'نسّق الاستلام والتركيب', text: 'راجع خيارات التوصيل أو التركيب في الرياض.' },
];

export function Steps({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const list = rows(data.steps, 'steps').map(r => ({ icon: opt(r.icon, 'search'), title: t(r.title, ''), text: t(r.text, '') })).filter(s => s.title).slice(0, 4);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const steps = Array.isArray(data.steps) ? list : DEFAULTS.map(d => ({ ...d, title: t(d.title, d.title), text: t(d.text, d.text) }));
  if (!steps.length) return null;
  const lead = t(data.text, 'تسوّق براحتك، وخلّ الباقي علينا.');
  return (
    <Section data={data}>
      <section className="sec" id="steps">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'رحلة أسهل من البداية')}</span>
              <h2 className="h2">{t(data.title, 'ثلاث خطوات. وطريقك جاهز.')}</h2>
            </div>
            {lead && <p className="lead">{lead}</p>}
          </div>
          <div className={`s3 tc-n-${steps.length}`}>
            {steps.map((s, i) => (
              <div key={i}>
                <span className="s3i"><Icon name={s.icon} /></span>
                <p><b>{s.title}</b>{s.text}</p>
                <em aria-hidden="true">{String(i + 1).padStart(2, '0')}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
