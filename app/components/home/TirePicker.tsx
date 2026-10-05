/**
 * Component #10 — مقارنة الفئات «وش أهم شيء عندك؟» (`home.tire-picker`).
 * Design: design/final.html → `#compare` (priority buttons + verdict line + 3 calm tier cards,
 * size select; price = size base price × tier factor, rounded to 5).
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asLink, asText, makeT, opt, rows, useLang } from './fields';
import type { Lang, Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'قارن قبل ما تختار': 'Compare before you choose', 'وش أهم شيء عندك؟': 'What matters most to you?', 'المقاس': 'Size',
  'الأفضل قيمة': 'Best value', 'أقل سعر': 'Lowest price', 'أطول عمر': 'Longest life', 'أهدأ قيادة': 'Quietest ride',
  'يعطيك أقل تكلفة لكل كيلومتر مع عمر وهدوء ممتازين.': 'The lowest cost per kilometre with great life and comfort.',
  'أقل دفعة اليوم، ومناسب للمشاوير داخل المدينة.': 'The smallest payment today — fine for city driving.',
  'يعيش أطول، فتبدّل أقل على المدى البعيد.': 'Lasts longer, so you replace less often.',
  'أهدأ صوت وأنعم قيادة على الطرق السريعة.': 'The quietest, smoothest ride on highways.',
  'اقتصادي': 'Economy', 'متوسط': 'Mid-range', 'ممتاز': 'Premium', 'كفر صيني': 'Chinese tire', 'كفر تايلندي': 'Thai tire', 'هانكوك': 'Hankook',
  'مقبول': 'Fair', 'عالي': 'High', 'عالي جداً': 'Very high', 'سنة': '1 year', 'سنتين': '2 years', '5 سنوات': '5 years',
  'الصين': 'China', 'تايلند': 'Thailand', 'كوريا': 'Korea', 'داخل المدينة': 'City driving', 'يومي وسفر': 'Daily & trips', 'سفر وطرق سريعة': 'Trips & highways',
};
const D_SIZES: [string, number][] = [['205/55 R16', 290], ['215/60 R17', 330], ['225/45 R18', 360], ['265/65 R17', 420], ['275/65 R18', 450]];
const D_TIERS = [
  { tier: 'اقتصادي', name: 'كفر صيني', life: 40000, quiet: 'مقبول', wy: 'سنة', origin: 'الصين', fit: 'داخل المدينة', mult: 100 },
  { tier: 'متوسط', name: 'كفر تايلندي', life: 60000, quiet: 'عالي', wy: 'سنتين', origin: 'تايلند', fit: 'يومي وسفر', mult: 124 },
  { tier: 'ممتاز', name: 'هانكوك', life: 75000, quiet: 'عالي جداً', wy: '5 سنوات', origin: 'كوريا', fit: 'سفر وطرق سريعة', mult: 145 },
];
const D_PRIO = [
  { label: 'الأفضل قيمة', tier: 2, why: 'يعطيك أقل تكلفة لكل كيلومتر مع عمر وهدوء ممتازين.' },
  { label: 'أقل سعر', tier: 1, why: 'أقل دفعة اليوم، ومناسب للمشاوير داخل المدينة.' },
  { label: 'أطول عمر', tier: 3, why: 'يعيش أطول، فتبدّل أقل على المدى البعيد.' },
  { label: 'أهدأ قيادة', tier: 3, why: 'أهدأ صوت وأنعم قيادة على الطرق السريعة.' },
];
const n = (v: unknown, d: number) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
const fmt = (x: number, lang: Lang) => x.toLocaleString(lang === 'en' ? 'en' : 'en');

export function TirePicker({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);

  const sizeRows = rows(data.sizes, 'sizes').map(r => [asText(r.size, '', lang).trim(), n(r.price, 0)] as [string, number]).filter(([s, p]) => s && p);
  const sizes = sizeRows.length ? sizeRows : D_SIZES;
  const tierRows = rows(data.tiers, 'tiers')
    .map(r => ({ tier: t(r.tier, ''), name: t(r.name, ''), life: n(r.life, 0), quiet: t(r.quiet, ''), wy: t(r.warranty, ''), origin: t(r.origin, ''), fit: t(r.fit, ''), mult: n(r.factor, 100), link: asLink(r.link, '/search') }))
    .filter(x => x.name)
    .slice(0, 3);
  const tiers = tierRows.length ? tierRows : D_TIERS.map(x => ({ ...x, tier: t(x.tier, x.tier), name: t(x.name, x.name), quiet: t(x.quiet, x.quiet), wy: t(x.wy, x.wy), origin: t(x.origin, x.origin), fit: t(x.fit, x.fit), link: '/search' }));
  const prioRows = rows(data.priorities, 'priorities').map(r => ({ label: t(r.label, ''), tier: Number(opt(r.tier, '1')), why: t(r.reason, '') })).filter(p => p.label).slice(0, 4);
  const prios = prioRows.length ? prioRows : D_PRIO.map(p => ({ ...p, label: t(p.label, p.label), why: t(p.why, p.why) }));

  const [prio, setPrio] = useState(0);
  const [size, setSize] = useState(sizes[0][0]);
  const base = (sizes.find(s => s[0] === size) ?? sizes[0])[1];
  const p = prios[Math.min(prio, prios.length - 1)];
  const recIndex = Math.min(Math.max(1, p.tier), tiers.length) - 1;
  const price = (mult: number) => Math.round((base * mult) / 100 / 5) * 5;

  return (
    <Section data={data}>
      <section className="sec" id="compare">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'قارن قبل ما تختار')}</span>
              <h2 className="h2">{t(data.title, 'وش أهم شيء عندك؟')}</h2>
            </div>
            <label className="cmp-pick">
              {t('المقاس', 'المقاس')}
              <select value={size} onChange={e => setSize(e.target.value)}>
                {sizes.map(([s]) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div className="prio" role="tablist">
            {prios.map((x, i) => (
              <button type="button" role="tab" aria-selected={i === prio} key={i} className={i === prio ? 'on' : undefined} onClick={() => setPrio(i)}>{x.label}</button>
            ))}
          </div>
          <p className="verdict">
            {isEn ? 'We recommend ' : 'ننصحك بـ '}<b>{tiers[recIndex].name}</b> — {p.why}
          </p>
          <div className="tiers">
            {tiers.map((x, i) => {
              const on = i === recIndex;
              const pr = price(x.mult);
              return (
                <article className={'tier' + (on ? ' rec' : '')} key={i}>
                  {on && <span className="rec-l">{isEn ? 'Our pick for you' : 'اختيارنا لك'}</span>}
                  <span className="t-tier">{x.tier}</span>
                  <h3>{x.name}</h3>
                  <div className="t-price">
                    <b>{pr}</b> {isEn ? 'SAR' : 'ر.س'}{' '}
                    <small>{isEn ? `per tire · ${fmt(pr * 4, lang)} for four` : `للإطار · ${fmt(pr * 4, lang)} للأربع`}</small>
                  </div>
                  <dl>
                    {x.life > 0 && <div><dt>{isEn ? 'Expected life' : 'العمر المتوقع'}</dt><dd>{fmt(x.life, lang)} {isEn ? 'km' : 'كم'}</dd></div>}
                    {x.life > 0 && <div><dt>{isEn ? 'Per 1000 km' : 'كل 1000 كم'}</dt><dd>{((pr * 4) / x.life * 1000).toFixed(1)} {isEn ? 'SAR' : 'ر.س'}</dd></div>}
                    {x.quiet && <div><dt>{isEn ? 'Comfort' : 'الهدوء'}</dt><dd>{x.quiet}</dd></div>}
                    {x.wy && <div><dt>{isEn ? 'Warranty' : 'الضمان'}</dt><dd>{x.wy}</dd></div>}
                    {x.origin && <div><dt>{isEn ? 'Origin' : 'المنشأ'}</dt><dd>{x.origin}</dd></div>}
                    {x.fit && <div><dt>{isEn ? 'Best for' : 'مناسب لـ'}</dt><dd>{x.fit}</dd></div>}
                  </dl>
                  <Link className={'btn ' + (on ? 'btn-gold' : 'btn-line')} to={x.link}>{isEn ? `Choose ${x.tier}` : `اختر ${x.tier}`}</Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Section>
  );
}
