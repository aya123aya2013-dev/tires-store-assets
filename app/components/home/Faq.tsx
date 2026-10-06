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
  const items = Array.isArray(data.items) ? list : DEFAULTS;
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
                  <span className="fq-n">{String(i + 1).padStart(2, '0')}</span>
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
