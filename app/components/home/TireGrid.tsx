/**
 * Component #8 — شبكة منتجات «إطارات لكل رحلة» (`home.tire-grid`).
 * Design: design/final.html → `#catalog` (.sec-head + view-all link, `.ptool` count/sort,
 * `.cfilters` brand pills, `.cgrid` of `.ccard`: wishlist heart, italic brand, tag,
 * faded rim size behind the photo, name, size · type · year, price per tire + for four, add).
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { asBool, asLink, makeT, opt, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';
import { FitsMine } from '../tires/features/MySize';
import { CompareToggle, useCompareWhere } from '../tires/features/Compare';
import { perInstallment, useCardSettings } from '../tires/features/cardSettings';
import { whereClass } from '../layout/devices';
import { SAMPLE_PRODUCTS, filterBrands, sourceFrom, toTcProduct, useTcProducts } from './tc/products';
import { useAddToCart } from './tc/useAddToCart';
import { useCurrency } from './tc/useCurrency';
import type { TcProduct } from './tc/products';

const EN: Record<string, string> = {
  'اختياراتنا لك': 'Our picks for you', 'إطارات لكل رحلة.': 'Tires for every trip.', 'عرض جميع الإطارات': 'View all tires',
  'عرض': 'Offer', 'اختيار مميز': 'Featured pick', 'منتجات': 'products', 'الترتيب': 'Sort',
  'المميزة أولاً': 'Featured first', 'الأكثر مبيعاً': 'Best selling', 'السعر: الأقل أولاً': 'Price: low to high', 'السعر: الأعلى أولاً': 'Price: high to low',
  'جميع الماركات': 'All brands', 'ر.س': 'SAR', 'أضف': 'Add', 'تعذّر تحميل المنتجات.': 'Could not load the products.', 'حاول مرة ثانية': 'Try again', 'بالسلة': 'In cart', 'أعد المحاولة': 'Retry', 'اختر': 'Choose', 'تعذّرت الإضافة': 'Could not add', 'صنع': 'made', 'اطلب السعر': 'Ask for price',
};
type Sort = 'feat' | 'pop' | 'low' | 'high';

export function TireGrid({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const wishlist = useWishlist();
  const limit = Math.min(16, Math.max(4, Number(data.limit) || 8));
  const { items, loading, failed, retry } = useTcProducts(sourceFrom(data, 'products', 'latest'), limit);
  const all: TcProduct[] = items.length
    ? items.map(p => toTcProduct(p, t('عرض', 'عرض')))
    : import.meta.env.DEV && !loading ? SAMPLE_PRODUCTS.slice(0, limit) : [];

  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('feat');
  const cart = useAddToCart();
  const cur = useCurrency();
  const card = useCardSettings();
  const cmpWhere = useCompareWhere();
  if (loading || failed) {
    return (
      <Section data={data}>
        <section className="sec" style={{ paddingBlock: 40 }}>
          <div className="wrap">
            <span className="kicker">{t(data.kicker, 'اختياراتنا لك')}</span>
            <h2 className="h2">{t(data.title, 'إطارات لكل رحلة.')}</h2>
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
  if (!all.length) return null;

  const featFirst = asBool(data.feature_first, true);
  const brands = asBool(data.show_filters, true) ? filterBrands(all, data.filter_brands) : [];
  let list = brand ? all.filter(p => p.brand === brand) : all;
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === 'pop') list = [...list].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  const cols = opt(data.columns, '4') === '3' ? 3 : 4;
  const viewAll = asLink(data.view_all_link, '/latest-products');

  return (
    <Section data={data}>
      <section className="sec" id="catalog" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'اختياراتنا لك')}</span>
              <h2 className="h2">{t(data.title, 'إطارات لكل رحلة.')}</h2>
            </div>
            {asBool(data.show_view_all, true) && (
              <Link className="link" to={viewAll}>
                {t(data.view_all_text, 'عرض جميع الإطارات')} <Icon name="arrow" style={{ width: 16, height: 16, ...(isEn ? { transform: 'scaleX(-1)' } : {}) }} />
              </Link>
            )}
          </div>
          {asBool(data.show_toolbar, true) && (
            <div className="ptool">
              <span>{list.length} {t('منتجات', 'منتجات')}</span>
              <label>
                {t('الترتيب', 'الترتيب')}
                <select value={sort} onChange={e => setSort(e.target.value as Sort)}>
                  <option value="feat">{t('المميزة أولاً', 'المميزة أولاً')}</option>
                  <option value="pop">{t('الأكثر مبيعاً', 'الأكثر مبيعاً')}</option>
                  <option value="low">{t('السعر: الأقل أولاً', 'السعر: الأقل أولاً')}</option>
                  <option value="high">{t('السعر: الأعلى أولاً', 'السعر: الأعلى أولاً')}</option>
                </select>
              </label>
            </div>
          )}
          {brands.length > 1 && (
            <div className="cfilters">
              <button type="button" className={brand ? undefined : 'on'} onClick={() => setBrand('')}>{t('جميع الماركات', 'جميع الماركات')}</button>
              {brands.map(b => (
                <button type="button" key={b} className={brand === b ? 'on' : undefined} onClick={() => setBrand(b)}>{b}</button>
              ))}
            </div>
          )}
          <div className={`cgrid tc-cols-${cols}`}>
            {list.map(p => {
              const feat = featFirst && p.id === all[0].id;
              const fav = wishlist.has(p.id);
              return (
                <article className={'ccard' + (feat ? ' feat' : '')} key={p.id}>
                  <div className="ctop">
                    {card.fav && (
                      <button type="button" className="fav" aria-label={isEn ? 'Add to wishlist' : 'أضف للمفضلة'} aria-pressed={fav} onClick={() => wishlist.toggle(p.id)}>
                        <Icon name="heart" />
                      </button>
                    )}
                    {card.brand && p.brand && <span className="cbrand">{p.brand}</span>}
                    <CompareToggle className={whereClass(cmpWhere, 'wide')} item={{ id: p.id, name: p.name, url: p.url, image: p.image, price: p.price, currency: p.currency, size: p.size, year: p.year, brand: p.brand }} />
                  </div>
                  <div className="ctagrow">
                    <FitsMine size={p.size} />
                    {card.install && <span className="ctag tc-install">{card.install}</span>}
                    {feat ? <span className="ctag g">{t('اختيار مميز', 'اختيار مميز')}</span> : p.tag ? <span className="ctag">{p.tag}</span> : null}
                  </div>
                  <Link className="cimg" to={p.url}>
                    {card.rim && p.rim && <span className="cghost">{p.rim}</span>}
                    {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
                  </Link>
                  <div className="cbody">
                    <h3><Link to={p.url}>{p.name}</Link></h3>
                    <span className="csub">
                      {p.size && <b dir="ltr">{p.size}</b>}
                      {[p.type, card.year && p.year && `${t('صنع', 'صنع')} ${p.year}`].filter(Boolean).map(x => ` · ${x}`)}
                    </span>
                    <div className="pfoot">
                      <div className="pprice">
                        {card.askUrl ? (
                          <a className="tc-ask" href={card.askUrl(p.name)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" style={{ width: 18, height: 18 }} /> {t('اطلب السعر', 'اطلب السعر')}</a>
                        ) : (
                          <>
                            <b>{p.price}</b> {cur(p.currency)}
                            {p.old && <s>{p.old}</s>}
                          </>
                        )}
                        {!card.askUrl && card.setPrice && (
                          <small>
                            {isEn ? `per tire · ${p.price * 4} for four` : `للحبة · ${p.price * 4} للأربع`}
                            <span className="tc-inst">{isEn ? `or ${card.installments} × ${perInstallment(p.price, card.installments)}` : `أو ${card.installments} دفعات × ${perInstallment(p.price, card.installments)}`}</span>
                          </small>
                        )}
                      </div>
                      {card.add && !card.askUrl && <button
                        type="button"
                        className={'add' + (cart.stateOf(p.id) === 'done' ? ' done' : '')}
                        disabled={cart.stateOf(p.id) === 'busy'}
                        title={cart.stateOf(p.id) === 'failed' ? t('تعذّرت الإضافة', 'تعذّرت الإضافة') : undefined}
                        onClick={() => cart.add(p, card.qty)}
                      >
                        <Icon name="plus" /> {cart.stateOf(p.id) === 'done' ? t('بالسلة', 'بالسلة') : cart.stateOf(p.id) === 'failed' ? t('أعد المحاولة', 'أعد المحاولة') : p.hasOptions ? t('اختر', 'اختر') : t('أضف', 'أضف')}
                      </button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Section>
  );
}
