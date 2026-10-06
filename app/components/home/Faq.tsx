/**
 * Component #22 — الأسئلة الشائعة (`home.faq`).
 * Design: design/final.html → `#faq` (.faq2: side column with a two-line title — 2nd line gold —,
 * lead and contact link; numbered `<details>` rows with a gold plus that turns into ×).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asLink, makeT, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'قبل ما تنطلق': 'Before you set off', 'عندك سؤال؟': 'Got a question?', 'خلّينا نوضّح.': "Let's clear it up.",
  'إجابات تساعدك تختار براحة.': 'Answers that help you choose with ease.', 'تواصل معنا': 'Contact us',
  // the default questions, so the English store doesn't show Arabic until the merchant edits them
  'كيف أعرف مقاس الإطار المناسب لسيارتي؟': 'How do I know the right tire size for my car?',
  'المقاس مكتوب على جانب إطارك الحالي بهذا الشكل: 205/55 R16. تقدر كمان تلقاه في ملصق إطار باب السائق أو دليل السيارة.': 'The size is printed on the side of your current tire, like 205/55 R16. You can also find it on the sticker in the driver’s door frame or in the car manual.',
  'هل السعر يشمل التركيب؟': 'Does the price include fitting?',
  'نعم، التركيب على الجنط مجاني عند اختيار «استلام وتركيب». الترصيص وزن الأذرعة برسوم بسيطة.': 'Yes — fitting on the rim is free when you choose “pick up & fit”. Balancing and alignment have a small fee.',
  'كم تاريخ صنع الإطارات؟': 'How recent are the tires?',
  'نضمن أن تاريخ الصنع لا يتجاوز 12 شهر من تاريخ الطلب، ويظهر في صفحة كل منتج.': 'We guarantee the production date is within 12 months of your order; it’s shown on every product page.',
  'كم مدة التوصيل؟': 'How long does delivery take?',
  'المدة الدقيقة حسب مدينتك، وتظهر لك قبل الدفع.': 'It depends on your city and is shown before you pay.',
  'هل أقدر أرجّع الإطار؟': 'Can I return a tire?',
  'نعم، الإطارات غير المركّبة وبحالتها الأصلية وفق سياسة الإرجاع.': 'Yes — unfitted tires in their original condition, under the return policy.',
};
const DEFAULTS: [string, string][] = [
  ['كيف أعرف مقاس الإطار المناسب لسيارتي؟', 'المقاس مكتوب على جانب إطارك الحالي بهذا الشكل: 205/55 R16. تقدر كمان تلقاه في ملصق إطار باب السائق أو دليل السيارة.'],
  ['هل السعر يشمل التركيب؟', 'نعم، التركيب على الجنط مجاني عند اختيار «استلام وتركيب». الترصيص وزن الأذرعة برسوم بسيطة.'],
  ['كم تاريخ صنع الإطارات؟', 'نضمن أن تاريخ الصنع لا يتجاوز 12 شهر من تاريخ الطلب، ويظهر في صفحة كل منتج.'],
  ['كم مدة التوصيل؟', 'المدة الدقيقة حسب مدينتك، وتظهر لك قبل الدفع.'],
  ['هل أقدر أرجّع الإطار؟', 'نعم، الإطارات غير المركّبة وبحالتها الأصلية وفق سياسة الإرجاع.'],
];

export function Faq({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const list = rows(data.items, 'items').map(r => [t(r.q, ''), t(r.a, '')] as [string, string]).filter(([q, a]) => q && a).slice(0, 12);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const items = Array.isArray(data.items) ? list : DEFAULTS.map(([q, a]) => [t(q, q), t(a, a)] as [string, string]);
  if (!items.length) return null;
  const openFirst = asBool(data.open_first, true);
  const lead = t(data.text, 'إجابات تساعدك تختار براحة.');
  const contact = t(data.contact_text, 'تواصل معنا');

  return (
    <Section data={data}>
      <section className="sec" id="faq">
        <div className="wrap faq2">
          <div className="side">
            <span className="kicker">{t(data.kicker, 'قبل ما تنطلق')}</span>
            <h2 className="h2">
              {t(data.title_1, 'عندك سؤال؟')}
              <br />
              <em>{t(data.title_2, 'خلّينا نوضّح.')}</em>
            </h2>
            {lead && <p className="lead">{lead}</p>}
            {contact && <Link className="link" to={asLink(data.contact_link, '/help')}>{contact} <span aria-hidden="true">↗</span></Link>}
          </div>
          <div>
            {items.map(([q, a], i) => (
              <details key={i} open={openFirst && i === 0}>
                <summary>
                  <span className="fq-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {q}
                  <Icon name="plus" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
