/**
 * Component #4 — منتجات بسلايدر «إطارات هالأسبوع» (`home.tire-slider`).
 * Design: design/final.html → `#types` (.sec-head + brand filters + arrows, `.slider` of `.pcard`).
 */
import { useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, makeT, opt, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';
import { FitsMine } from '../tires/features/MySize';
import { useCardSettings, useSpecSources } from '../tires/features/cardSettings';
import { SAMPLE_PRODUCTS, filterBrands, sourceFrom, toTcProduct, useTcProducts } from './tc/products';
import { useAddToCart } from './tc/useAddToCart';
import { useCurrency } from './tc/useCurrency';
import type { TcProduct } from './tc/products';

const EN: Record<string, string> = { 'اطلب السعر': 'Ask for price', 'للطقم (4 إطارات)': 'per set of 4', 'تركيب مجاني': 'Free fitting',
  'الأكثر طلباً': 'Most requested', 'إطارات هالأسبوع': 'Tires of the week', 'الكل': 'All',
  'عرض': 'Offer', 'للإطار الواحد': 'per tire', 'عرض التفاصيل': 'View details', 'ر.س': 'SAR',
  'أُضيف للسلة': 'Added to cart', 'تعذّر تحميل المنتجات.': 'Could not load the products.', 'حاول مرة ثانية': 'Try again', 'تعذّرت الإضافة — حاول مرة ثانية': 'Could not add — try again', 'اختر المقاس والكمية': 'Choose size & quantity', 'إطار': 'Tire',
};

export function TireSlider({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const specSources = useSpecSources();
  const limit = Math.min(12, Math.max(4, Number(data.limit) || 8));
  const qtyRaw = Number(opt(data.add_qty, '1')); // dropdown: '4' | {value} | [{value}]
  const qty = [1, 2, 4].includes(qtyRaw) ? qtyRaw : 1;
  const { items, loading, failed, retry } = useTcProducts(sourceFrom(data, 'products', 'best_selling'), limit);
  const list: TcProduct[] = items.length
    ? items.map(p => toTcProduct(p, t('عرض', 'عرض'), specSources))
    : import.meta.env.DEV && !loading ? SAMPLE_PRODUCTS.slice(0, limit) : [];

  const [brand, setBrand] = useState('');
  const cart = useAddToCart();
  const cur = useCurrency();
  const slider = useRef<HTMLDivElement>(null);
  const card = useCardSettings(); // every hook before the loading / empty returns (S3b-1)
  if (loading || failed) {
    return (
      <Section data={data}>
        <section className="sec" style={{ paddingBlock: 40 }}>
          <div className="wrap">
            <span className="kicker">{t(data.kicker, 'الأكثر طلباً')}</span>
            <h2 className="h2">{t(data.title, 'إطارات هالأسبوع')}</h2>
            {loading ? (
              <div className="tc-skel-row" aria-busy="true">{[0, 1, 2, 3].map(i => <span key={i} className="tc-skel" />)}</div>
            ) : (
              <p className="tc-load-fail">
                {t('تعذّر تحميل المنتجات.', 'تعذّر تحميل المنتجات.')}{' '}
                <button type="button" className="link" onClick={retry}>{t('حاول مرة ثانية', 'حاول مرة ثانية')}</button>
              </p>
            )}
          </div>
        </section>
      </Section>
    );
  }
  if (!list.length) return null;

  const brands = asBool(data.show_filters, true) ? filterBrands(list, data.filter_brands) : [];
  const shown = brand ? list.filter(p => p.brand === brand) : list;
  // RTL: "next" moves left; LTR: right
  const move = (dir: 1 | -1) => slider.current?.scrollBy({ left: (isEn ? 1 : -1) * dir * slider.current.clientWidth * 0.75, behavior: 'smooth' });
  const addLabel = card.perSet ? (isEn ? '+ Add the set to cart' : '+ أضف الطقم للسلة') : qty === 1 ? (isEn ? '+ Add a tire to cart' : '+ أضف إطارًا للسلة') : isEn ? `+ Add ${qty} tires to cart` : `+ أضف ${qty} إطارات للسلة`;

  return (
    <Section data={data}>
      <section className="sec" id="types">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'الأكثر طلباً')}</span>
              <h2 className="h2">{t(data.title, 'إطارات هالأسبوع')}</h2>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              {brands.length > 1 && (
                <div className="filters">
                  <button type="button" className={brand ? undefined : 'on'} onClick={() => setBrand('')}>{t('الكل', 'الكل')}</button>
                  {brands.map(b => (
                    <button type="button" key={b} className={brand === b ? 'on' : undefined} onClick={() => setBrand(b)}>{b}</button>
                  ))}
                </div>
              )}
              {asBool(data.show_arrows, true) && (
                <div className="nav-btns">
                  <button type="button" className="sq" aria-label={isEn ? 'Previous' : 'السابق'} onClick={() => move(-1)}><Icon name={isEn ? 'next' : 'prev'} /></button>
                  <button type="button" className="sq" aria-label={isEn ? 'Next' : 'التالي'} onClick={() => move(1)}><Icon name={isEn ? 'prev' : 'next'} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="slider" ref={slider}>
            {shown.map((p, i) => (
              <article className={'pcard' + (i === 0 && asBool(data.feature_first, true) ? ' feat' : '')} key={p.id}>
                <div className="pimg">
                  {p.tag ? <span className={'ptag' + (p.old ? ' g' : '')}>{p.tag}</span> : card.install ? <span className="ptag">{card.install}</span> : null}
                  {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
                </div>
                <div className="pbody">
                  {card.brand && p.brand && <span className="pbrand">{p.brand}</span>}
                  <FitsMine size={p.size} />
                  <h3>{p.name}</h3>
                  <span className="pline">
                    {p.type || t('إطار', 'إطار')}
                    {p.size && <> · <b dir="ltr">{p.size}</b></>}
                  </span>
                  <div className="pfoot2">
                    <div className="pprice2">
                      {card.askUrl ? (
                        <a className="tc-ask" href={card.askUrl(p.name)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" style={{ width: 18, height: 18 }} /> {t('اطلب السعر', 'اطلب السعر')}</a>
                      ) : (
                        <>
                          <div>
                            <b>{p.price}</b> <span>{cur(p.currency)}</span>
                            {p.old && <s>{p.old}</s>}
                          </div>
                          <small>{card.perSet ? t('للطقم (4 إطارات)', 'للطقم (4 إطارات)') : t('للإطار الواحد', 'للإطار الواحد')}</small>
                        </>
                      )}
                    </div>
                    <Link className="pdetails" to={p.url}>
                      {t('عرض التفاصيل', 'عرض التفاصيل')} <span>{isEn ? '→' : '←'}</span>
                    </Link>
                  </div>
                  {card.add && !card.askUrl && <button
                    type="button"
                    className={'add2' + (cart.stateOf(p.id) === 'done' ? ' done' : '')}
                    disabled={cart.stateOf(p.id) === 'busy'}
                    onClick={() => cart.add(p, card.perSet ? 1 : qty)}
                  >
                    {cart.stateOf(p.id) === 'done' ? `✓ ${t('أُضيف للسلة', 'أُضيف للسلة')}` : cart.stateOf(p.id) === 'failed' ? t('تعذّرت الإضافة — حاول مرة ثانية', 'تعذّرت الإضافة — حاول مرة ثانية') : p.hasOptions ? t('اختر المقاس والكمية', 'اختر المقاس والكمية') : addLabel}
                  </button>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
