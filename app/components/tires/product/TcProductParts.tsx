/**
 * Product page parts — 1:1 with design/store/product.html (`.pinfo`, `.trust3`, `.dm`, `.specs-dl`,
 * `.pfaq`), styled by the generated tc-pages.scss. Content comes from the product (name, tags,
 * options, price, rating) and from the theme settings group «صفحة المنتج» (scripts/tc-settings.cjs).
 * Nothing here is tied to one store.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { asBool, makeT, opt, useLang } from '../../home/fields';
import { Icon } from '../../home/tc/Icon';
import { useCurrency } from '../../home/tc/useCurrency';
import { formatTireSize, parseTireSize, specTexts } from '../sizes';
import { useSpecSources } from '../features/cardSettings';
import { FitsMine } from '../features/MySize';

type S = Record<string, unknown>;
const EN: Record<string, string> = {
  'المقاس': 'Size', 'تقييم': 'reviews', 'سعر الإطار الواحد شامل الضريبة': 'Price per tire, VAT included',
  'سعر الطقم (4 إطارات) شامل الضريبة': 'Price per set of 4, VAT included', 'وفّر': 'Save',
  'أصلي بضمان الوكيل': 'Genuine, manufacturer warranty', 'تركيب مجاني بالرياض': 'Free fitting in Riyadh', 'قسّطها مع تابي وتمارا': 'Split it with Tabby & Tamara',
  'استلام وتركيب — مجاناً': 'Pick up & fitting — free', 'نركّبها على جنوطك بنفس اليوم': 'We fit them on your rims the same day',
  'توصيل لعنوانك': 'Delivery to your address', 'المدة والتكلفة تظهر قبل الدفع': 'Time and cost are shown before you pay',
  'المواصفات': 'Specifications', 'العرض': 'Width', 'نسبة الارتفاع': 'Aspect ratio', 'قطر الجنط': 'Rim diameter',
  'مؤشر الحمولة': 'Load index', 'مؤشر السرعة': 'Speed rating', 'سنة الصنع': 'Production year', 'بلد الصنع': 'Made in',
  'النقشة': 'Pattern', 'الماركة': 'Brand', 'النوع': 'Type', 'مم': 'mm', 'بوصة': 'in',
  'أسئلة عن الإطار': 'Questions about this tire',
  'الشحن والإرجاع': 'Shipping & returns',
  'نشحن لكل مناطق المملكة. الإطارات غير المركّبة تقبل الإرجاع خلال 7 أيام بحالتها الأصلية.': 'We ship across the Kingdom. Unfitted tires can be returned within 7 days in their original condition.',
  'هل يناسب سيارتي؟': 'Does it fit my car?',
  'إذا المقاس المكتوب على جانب إطارك الحالي نفس المقاس أعلاه، فهو مناسب. محتار؟ ابعت صورة إطارك على واتساب.': 'If the size on the side of your current tire matches the size above, it fits. Not sure? Send us a photo of your tire on WhatsApp.',
  'الضمان': 'Warranty',
  'ضمان الوكيل ضد عيوب التصنيع حسب الماركة، ونضمن تاريخ صنع لا يتجاوز 12 شهر.': 'Manufacturer warranty against defects per brand, and a production date within 12 months.',
};

export const useProductSettings = () => {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as S;
};

/** «91V», «104H XL» — load index + speed letter written after the size, or as tags */
const LOAD_SPEED = /(?<![\d/.])(\d{2,3})\s?([J-NP-WYZ]|ZR)\b/;
/** tag/option written as «label: value» (e.g. «بلد الصنع: تايلند», «النقشة: Ventus Prime 4») */
const labeled = (texts: string[], keys: RegExp) => {
  for (const x of texts) {
    const m = x.match(/^\s*([^:：]+)[:：]\s*(.+)$/);
    if (m && keys.test(m[1])) return m[2].trim();
  }
  return '';
};

export function readSpecs(product: Product, sources: Parameters<typeof specTexts>[1]) {
  const texts = specTexts(product as unknown as Parameters<typeof specTexts>[0], sources);
  const all = [product.name, ...texts].filter(Boolean) as string[];
  const size = all.map(x => parseTireSize(x)).find(Boolean) ?? null;
  const ls = all.map(x => x.replace(/\d{3}\/\d{2}\s*Z?R\s*\d{2}(\.5)?/i, ' ').match(LOAD_SPEED)).find(Boolean);
  const year = all.map(x => x.match(/(?<![\d/.])(20[2-3]\d)(?![\d/.])/)?.[1]).find(Boolean) ?? '';
  return {
    size,
    load: labeled(texts, /حمول|load/i) || (ls ? ls[1] : ''),
    speed: labeled(texts, /سرع|speed/i) || (ls ? ls[2] : ''),
    // «سنة الصنع» / «تاريخ الصنع» — never «بلد الصنع»
    year: labeled(texts, /^\s*(سنة|تاريخ)|year|dot/i) || year,
    origin: labeled(texts, /بلد|منشأ|origin|made/i),
    pattern: labeled(texts, /نقش|pattern|model/i),
    type: labeled(texts, /نوع|type/i),
  };
}

/** `.pinfo` head: brand, name, rating, size badge, price, note */
export function TcProductHead({ product }: { product: Product }) {
  const s = useProductSettings();
  const lang = useLang();
  const t = makeT(lang, EN);
  const cur = useCurrency();
  const sources = useSpecSources();
  const spec = readSpecs(product, sources);
  const perSet = opt(s.tc_sale_unit, 'tire') === 'set';
  const price = product.is_on_sale && product.sale_price ? Number(product.sale_price) : Number(product.price);
  const old = product.is_on_sale && Number(product.regular_price) > price ? Number(product.regular_price) : 0;
  const pct = old ? Math.round((1 - price / old) * 100) : 0;
  const rating = product.rating as { stars?: number; count?: number } | undefined;
  const size = spec.size ? formatTireSize(spec.size) : '';
  return (
    <>
      {product.brand?.name && <span className="pbrand">{product.brand.name}</span>}
      <h1>{product.name}</h1>
      {!!rating?.count && (
        <div className="prate">
          <span className="st" aria-hidden="true">{'★★★★★'.slice(0, Math.round(rating.stars ?? 5)).padEnd(5, '☆')}</span>
          {Number(rating.stars ?? 0).toFixed(1)} · <a className="link" href="#prev">{rating.count} {t('تقييم', 'تقييم')}</a>
        </div>
      )}
      {size && (
        <div className="psizebadge">
          {t('المقاس', 'المقاس')} <b dir="ltr">{size}</b>
          {(spec.load || spec.speed) && <><span>·</span><span dir="ltr">{spec.load}{spec.speed}</span></>}
          {spec.type && <><span>·</span><span>{spec.type}</span></>}
          <FitsMine size={size} />
        </div>
      )}
      <div className="pp">
        <b>{price}</b> {cur(product.currency as string | undefined)}
        {old > 0 && <s>{old}</s>}
        {pct > 0 && <span className="psave">{t('وفّر', 'وفّر')} {pct}%</span>}
      </div>
      <p className="pnote">{perSet ? t('سعر الطقم (4 إطارات) شامل الضريبة', 'سعر الطقم (4 إطارات) شامل الضريبة') : t('سعر الإطار الواحد شامل الضريبة', 'سعر الإطار الواحد شامل الضريبة')}{spec.year ? ` · ${lang === 'en' ? 'made' : 'صنع'} ${spec.year}` : ''}</p>
    </>
  );
}

/** `.trust3` — three promises, each switchable and editable */
export function TcTrust() {
  const s = useProductSettings();
  const t = makeT(useLang(), EN);
  if (!asBool(s.tc_p_trust, true)) return null;
  const items: [string, string][] = [
    ['shield', t(s.tc_p_trust_1, 'أصلي بضمان الوكيل')],
    ['wrench', opt(s.tc_store_type, 'install') === 'sale' ? '' : t(s.tc_p_trust_2, 'تركيب مجاني بالرياض')],
    ['card', t(s.tc_p_trust_3, 'قسّطها مع تابي وتمارا')],
  ];
  const shown = items.filter(([, x]) => x);
  if (!shown.length) return null;
  return (
    <div className="trust3">
      {shown.map(([icon, text]) => <div key={icon}><Icon name={icon} />{text}</div>)}
    </div>
  );
}

/**
 * `.dm` — how the tires reach the customer. The theme cannot choose Salla's shipping, so:
 * when the product has an option named like «طريقة الاستلام / تركيب», Salla's own option field
 * carries the choice into the order (styled in tc-theme-ui.scss); otherwise these two cards are
 * information only (no fake selection).
 */
export function TcDelivery({ product }: { product: Product }) {
  const s = useProductSettings();
  const t = makeT(useLang(), EN);
  if (!asBool(s.tc_p_delivery, true)) return null;
  const hasOption = (product.options ?? []).some(o => /استلام|تركيب|توصيل|delivery|fitting|install/i.test(String((o as { name?: string }).name ?? '')));
  if (hasOption) return null;
  const fitting = opt(s.tc_store_type, 'install') !== 'sale';
  return (
    <div className="dm tc-dm-info">
      {fitting && (
        <div className="tc-dm-row">
          <Icon name="wrench" />
          <span><b>{t(s.tc_p_dm_install, 'استلام وتركيب — مجاناً')}</b><small>{t(s.tc_p_dm_install_sub, 'نركّبها على جنوطك بنفس اليوم')}</small></span>
        </div>
      )}
      <div className="tc-dm-row">
        <Icon name="truck" />
        <span><b>{t(s.tc_p_dm_ship, 'توصيل لعنوانك')}</b><small>{t(s.tc_p_dm_ship_sub, 'المدة والتكلفة تظهر قبل الدفع')}</small></span>
      </div>
    </div>
  );
}

/** `.pblk` «المواصفات» — read from the name / tags / options (setting «وين تكتب المقاس») */
export function TcSpecs({ product }: { product: Product }) {
  const s = useProductSettings();
  const lang = useLang();
  const t = makeT(lang, EN);
  const sources = useSpecSources();
  if (!asBool(s.tc_p_specs, true)) return null;
  const sp = readSpecs(product, sources);
  const rows: [string, string][] = [];
  if (sp.size) {
    rows.push(['المقاس', formatTireSize(sp.size)]);
    rows.push(['العرض', `${sp.size.width} ${t('مم', 'مم')}`]);
    if (sp.size.ratio) rows.push(['نسبة الارتفاع', `${sp.size.ratio}%`]);
    rows.push(['قطر الجنط', `${sp.size.rim} ${t('بوصة', 'بوصة')}`]);
  }
  if (sp.load) rows.push(['مؤشر الحمولة', sp.load]);
  if (sp.speed) rows.push(['مؤشر السرعة', sp.speed]);
  if (sp.year) rows.push(['سنة الصنع', sp.year]);
  if (sp.origin) rows.push(['بلد الصنع', sp.origin]);
  if (sp.pattern) rows.push(['النقشة', sp.pattern]);
  if (sp.type) rows.push(['النوع', sp.type]);
  if (product.brand?.name) rows.push(['الماركة', product.brand.name]);
  if (rows.length < 2) return null;
  return (
    <section className="wrap pblk" id="specs">
      <h2>{t(s.tc_p_specs_title, 'المواصفات')}</h2>
      <dl className="specs-dl">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{t(k, k)}</dt><dd dir={/^[\d\w/ .%-]+$/.test(v) ? 'ltr' : undefined}>{v}</dd></div>
        ))}
      </dl>
    </section>
  );
}

/** `.pfaq` «أسئلة عن الإطار» — three store-wide Q/A from the settings; an empty pair is skipped */
export function TcProductFaq() {
  const s = useProductSettings();
  const t = makeT(useLang(), EN);
  if (!asBool(s.tc_p_faq, true)) return null;
  const D: [string, string][] = [
    ['الشحن والإرجاع', 'نشحن لكل مناطق المملكة. الإطارات غير المركّبة تقبل الإرجاع خلال 7 أيام بحالتها الأصلية.'],
    ['هل يناسب سيارتي؟', 'إذا المقاس المكتوب على جانب إطارك الحالي نفس المقاس أعلاه، فهو مناسب. محتار؟ ابعت صورة إطارك على واتساب.'],
    ['الضمان', 'ضمان الوكيل ضد عيوب التصنيع حسب الماركة، ونضمن تاريخ صنع لا يتجاوز 12 شهر.'],
  ];
  const items = D.map(([q, a], i) => [t(s[`tc_p_faq_q${i + 1}`], q), t(s[`tc_p_faq_a${i + 1}`], a)]).filter(([q, a]) => q && a);
  if (!items.length) return null;
  return (
    <section className="wrap pblk pfaq">
      <h2>{t(s.tc_p_faq_title, 'أسئلة عن الإطار')}</h2>
      {items.map(([q, a], i) => (
        <details key={i}><summary>{q}</summary><p>{a}</p></details>
      ))}
    </section>
  );
}
