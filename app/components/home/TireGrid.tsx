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
import { SAMPLE_PRODUCTS, addToCart, sourceFrom, toTcProduct, useTcProducts } from './tc/products';
import type { TcProduct } from './tc/products';

const EN: Record<string, string> = {
  'اختياراتنا لك': 'Our picks for you', 'إطارات لكل رحلة.': 'Tires for every trip.', 'عرض جميع الإطارات': 'View all tires',
  'عرض': 'Offer', 'اختيار مميز': 'Featured pick', 'منتجات': 'products', 'الترتيب': 'Sort',
  'المميزة أولاً': 'Featured first', 'الأكثر مبيعاً': 'Best selling', 'السعر: الأقل أولاً': 'Price: low to high', 'السعر: الأعلى أولاً': 'Price: high to low',
  'جميع الماركات': 'All brands', 'ر.س': 'SAR', 'أضف': 'Add', 'بالسلة': 'In cart', 'صنع': 'made',
};
type Sort = 'feat' | 'pop' | 'low' | 'high';

export function TireGrid({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const wishlist = useWishlist();
  const limit = Math.min(16, Math.max(4, Number(data.limit) || 8));
  const { items, loading } = useTcProducts(sourceFrom(data, 'products', 'latest'), limit);
  const all: TcProduct[] = items.length
    ? items.map(p => toTcProduct(p, t('عرض', 'عرض')))
    : import.meta.env.DEV && !loading ? SAMPLE_PRODUCTS.slice(0, limit) : [];

  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('feat');
  const [added, setAdded] = useState<Record<number, boolean>>({});
  if (!all.length) return null;

  const featFirst = asBool(data.feature_first, true);
  const brands = asBool(data.show_filters, true) ? [...new Set(all.map(p => p.brand).filter(Boolean))].slice(0, 6) : [];
  let list = brand ? all.filter(p => p.brand === brand) : all;
  if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === 'pop') list = [...list].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  const cols = opt(data.columns, '4') === '3' ? 3 : 4;
  const viewAll = asLink(data.view_all_link, '/search');

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
                    <button type="button" className="fav" aria-label={isEn ? 'Add to wishlist' : 'أضف للمفضلة'} aria-pressed={fav} onClick={() => wishlist.toggle(p.id)}>
                      <Icon name="heart" />
                    </button>
                    {p.brand && <span className="cbrand">{p.brand}</span>}
                  </div>
                  <div className="ctagrow">
                    {feat ? <span className="ctag g">{t('اختيار مميز', 'اختيار مميز')}</span> : p.tag ? <span className="ctag">{p.tag}</span> : null}
                  </div>
                  <Link className="cimg" to={p.url}>
                    {p.rim && <span className="cghost">{p.rim}</span>}
                    {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
                  </Link>
                  <div className="cbody">
                    <h3><Link to={p.url}>{p.name}</Link></h3>
                    <span className="csub">
                      {p.size && <b dir="ltr">{p.size}</b>}
                      {[p.type, p.year && `${t('صنع', 'صنع')} ${p.year}`].filter(Boolean).map(x => ` · ${x}`)}
                    </span>
                    <div className="pfoot">
                      <div className="pprice">
                        <b>{p.price}</b> {t('ر.س', 'ر.س')}
                        {p.old && <s>{p.old}</s>}
                        <small>{isEn ? `per tire · ${p.price * 4} for four` : `للحبة · ${p.price * 4} للأربع`}</small>
                      </div>
                      <button
                        type="button"
                        className={'add' + (added[p.id] ? ' done' : '')}
                        onClick={() => addToCart(p.id, 1)?.then(() => setAdded(a => ({ ...a, [p.id]: true })))}
                      >
                        <Icon name="plus" /> {added[p.id] ? t('بالسلة', 'بالسلة') : t('أضف', 'أضف')}
                      </button>
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
