/**
 * Component #20 — آراء العملاء (`home.reviews`).
 * Design: design/final.html → `.rpanel` (light panel, .sec-head, `.rp3` cards: gold quote,
 * «name · city», text, product line).
 * Source: the merchant's own reviews (exact design), or the store's real ratings through Salla's
 * reviews component (Salla renders those cards, inside our panel and heading).
 */
import { SallaReviews } from '@salla.sa/twilight-components-react/reviews';
import { asBool, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'ثقة تصنعها التجربة': 'Trust built by experience', 'القرار أسهل مع تجاربهم.': 'Their experience makes it easier.',
  'تقييمات موثّقة من عملاء المتجر.': 'Verified reviews from store customers.',
  // the default reviews (names stay as written; city, text and product get English)
  'الرياض': 'Riyadh', 'جدة': 'Jeddah', 'الدمام': 'Dammam', 'عبدالعزيز': 'Abdulaziz', 'خالد': 'Khalid', 'يزيد': 'Yazeed',
  'اخترت المقاس من الموقع وركبتها بنفس اليوم في مركزهم. شغل مرتب وما انتظرت.': 'I picked the size on the site and had them fitted the same day at their centre. Tidy work, no waiting.',
  'الأسعار واضحة لكل حبة وقسّطت مع تابي. الكفرات وصلت أصلية وتاريخها حديث.': 'Clear per-tire prices and I paid in instalments with Tabby. Genuine tires with a recent date.',
  'صوّرت الكفر وأرسلته واتساب، وردّوا علي بالمقاس والسعر خلال دقائق.': 'I sent a photo of my tire on WhatsApp and they replied with the size and price within minutes.',
  'هانكوك 265/65 R17': 'Hankook 265/65 R17', 'بريجستون 215/60 R17': 'Bridgestone 215/60 R17', 'تاش 275/65 R18': 'Tash 275/65 R18',
};
const DEFAULTS = [
  { name: 'عبدالعزيز', city: 'الرياض', text: 'اخترت المقاس من الموقع وركبتها بنفس اليوم في مركزهم. شغل مرتب وما انتظرت.', product: 'هانكوك 265/65 R17' },
  { name: 'خالد', city: 'جدة', text: 'الأسعار واضحة لكل حبة وقسّطت مع تابي. الكفرات وصلت أصلية وتاريخها حديث.', product: 'بريجستون 215/60 R17' },
  { name: 'يزيد', city: 'الدمام', text: 'صوّرت الكفر وأرسلته واتساب، وردّوا علي بالمقاس والسعر خلال دقائق.', product: 'تاش 275/65 R18' },
];

export function Reviews({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const fromStore = opt(data.source, 'manual') === 'store';
  const limit = Math.min(12, Math.max(1, Number(data.limit) || 3));
  const list = rows(data.reviews, 'reviews')
    .map(r => {
      const name = t(r.name, ''), city = t(r.city, '');
      return { name: [name, city].filter(Boolean).join(' · '), text: t(r.text, ''), product: t(r.product, '') };
    })
    .filter(r => r.text);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const reviews = (Array.isArray(data.reviews) ? list : DEFAULTS.map(d => ({ name: [t(d.name, d.name), t(d.city, d.city)].join(' · '), text: t(d.text, d.text), product: t(d.product, d.product) }))).slice(0, limit);
  if (!fromStore && !reviews.length) return null;
  const lead = t(data.text, 'تقييمات موثّقة من عملاء المتجر.');

  return (
    <Section data={data}>
      <section className={'wrap rpanel' + (asBool(data.light_bg, true) ? '' : ' tc-plain')} id="reviews">
        <div className="sec-head">
          <div>
            <span className="kicker">{t(data.kicker, 'ثقة تصنعها التجربة')}</span>
            <h2 className="h2">{t(data.title, 'القرار أسهل مع تجاربهم.')}</h2>
          </div>
          {lead && <p className="lead">{lead}</p>}
        </div>
        {fromStore ? (
          <SallaReviews limit={limit} sort="latest" type="store" />
        ) : (
          <div className={`rp3 tc-n-${Math.min(3, reviews.length)}`}>
            {reviews.map((r, i) => (
              <div key={i}>
                <span className="q" aria-hidden="true">“</span>
                {r.name && <b>{r.name}</b>}
                <p>{r.text}</p>
                {r.product && <small>{r.product}</small>}
              </div>
            ))}
          </div>
        )}
      </section>
    </Section>
  );
}
