/**
 * Component #19 — تشكيلة مختصرة «إطار لكل طريق» (`home.lineup`).
 * Design: design/final.html → `#lineup` (intro column + 4 compact cards: type tag, photo,
 * name, size, price per tire, round arrow).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asLink, makeT, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { useCardSettings, useSpecSources } from '../tires/features/cardSettings';
import { SAMPLE_PRODUCTS, sourceFrom, toTcProduct, useTcProducts } from './tc/products';
import type { TcProduct } from './tc/products';
import { useCurrency } from './tc/useCurrency';

const EN: Record<string, string> = {
  'تشكيلتنا': 'Our range', 'إطار لكل طريق': 'A tire for every road',
  'من السيدان اليومية لين الدفع الرباعي والنقل — اختر الفئة واكتشف الأنسب.': 'From everyday sedans to SUVs and trucks — pick the class and find the best fit.',
  'كل الإطارات': 'All tires', 'تعذّر تحميل المنتجات.': 'Could not load the products.', 'حاول مرة ثانية': 'Try again', 'حبة': 'tire', 'طقم': 'set', 'اطلب السعر': 'Ask for price', 'عرض': 'Offer',
};

export function Lineup({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const specSources = useSpecSources();
  const cur = useCurrency();
  const card = useCardSettings();
  const { items, loading, failed, retry } = useTcProducts(sourceFrom(data, 'products', 'best_selling'), 4);
  const list: TcProduct[] = items.length
    ? items.map(p => toTcProduct(p, t('عرض', 'عرض'), specSources))
    : import.meta.env.DEV && !loading ? SAMPLE_PRODUCTS.slice(0, 4) : [];
  // a failed request is not an empty source: say so and offer a retry (like TireGrid)
  if (failed && !list.length) {
    return (
      <Section data={data}>
        <section className="sec" id="lineup">
          <div className="wrap">
            <span className="kicker">{t(data.kicker, 'تشكيلتنا')}</span>
            <h2 className="h2">{t(data.title, 'إطار لكل طريق')}</h2>
            <p className="tc-load-fail">
              {t('تعذّر تحميل المنتجات.', 'تعذّر تحميل المنتجات.')}{' '}
              <button type="button" className="link" onClick={retry}>{t('حاول مرة ثانية', 'حاول مرة ثانية')}</button>
            </p>
          </div>
        </section>
      </Section>
    );
  }
  if (!list.length) return null;
  const showType = asBool(data.show_type, true);
  const lead = t(data.text, 'من السيدان اليومية لين الدفع الرباعي والنقل — اختر الفئة واكتشف الأنسب.');
  const btn = t(data.btn_text, 'كل الإطارات');

  return (
    <Section data={data}>
      <section className="sec" id="lineup">
        <div className="wrap lineup">
          <div className="lu-intro">
            <span className="kicker">{t(data.kicker, 'تشكيلتنا')}</span>
            <h2 className="h2">{t(data.title, 'إطار لكل طريق')}</h2>
            {lead && <p className="lead">{lead}</p>}
            {btn && <Link className="btn btn-line" to={asLink(data.btn_link, '/latest-products')}>{btn} <span aria-hidden="true">{isEn ? '→' : '←'}</span></Link>}
          </div>
          <div className="lu-cards">
            {list.map(p => (
              <Link className="lu" to={p.url} key={p.id}>
                {showType && p.type && <span className="lu-t">{p.type}</span>}
                <div className="lu-img">{p.image && <img src={p.image} alt="" loading="lazy" />}</div>
                <b>{p.name}</b>
                {p.size && <small dir="ltr">{p.size}</small>}
                <div className="lu-f">
                  {card.askUrl ? (
                    <span className="tc-ask">{t('اطلب السعر', 'اطلب السعر')}</span>
                  ) : (
                    <span><b>{p.price}</b> {cur(p.currency)} / {card.perSet ? t('طقم', 'طقم') : t('حبة', 'حبة')}</span>
                  )}
                  <i aria-hidden="true">{isEn ? '→' : '←'}</i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
