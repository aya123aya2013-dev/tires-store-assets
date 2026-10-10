/**
 * Component #20 — آراء العملاء (`home.reviews`).
 * Design: design/final.html → `.rpanel` (light panel, .sec-head, `.rp3` cards: gold quote,
 * «name · city», text, product line).
 * Source (the merchant picks):
 *  - auto (default): the store's real ratings through Salla's reviews component; a brand-new store with
 *    none yet shows our sample cards instead (switch «show_samples»), and they disappear by themselves
 *    the day a real rating exists;
 *  - store: only Salla's real ratings;
 *  - manual: the merchant's own list (sample cards while the list is empty, same switch).
 * Salla renders its own cards inside our panel and heading.
 */
import { useEffect, useRef, useState } from 'react';
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

type StoreState = 'checking' | 'has' | 'empty';

/** Salla's own reviews cards, plus a check whether the store has any (its component renders nothing when empty). */
function StoreReviews({ limit, onState }: { limit: number; onState: (s: StoreState) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      // a rendered card carries a name + the review text; an empty state is a short line
      if ((ref.current?.textContent ?? '').trim().length > 30) { window.clearInterval(id); onState('has'); }
      else if (tries >= 8) { window.clearInterval(id); onState('empty'); }
    }, 500);
    return () => window.clearInterval(id);
  }, [onState]);
  return <div ref={ref}><SallaReviews limit={limit} sort="latest" type="store" /></div>;
}

export function Reviews({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const source = opt(data.source, 'auto');
  const showSamples = asBool(data.show_samples, true);
  const limit = Math.min(12, Math.max(1, Number(data.limit) || 3));
  const [store, setStore] = useState<StoreState>('checking');
  const own = rows(data.reviews, 'reviews')
    .map(r => {
      const name = t(r.name, ''), city = t(r.city, '');
      return { name: [name, city].filter(Boolean).join(' · '), text: t(r.text, ''), product: t(r.product, '') };
    })
    .filter(r => r.text);
  const samples = showSamples ? DEFAULTS.map(d => ({ name: [t(d.name, d.name), t(d.city, d.city)].join(' · '), text: t(d.text, d.text), product: t(d.product, d.product) })) : [];
  const fromStore = source !== 'manual';
  // cards drawn by us: the merchant's own list, else samples (only while there is nothing real to show)
  const mine = source === 'manual' ? (own.length ? own : samples) : store === 'empty' ? samples : [];
  const cards = mine.slice(0, limit);
  const showStore = fromStore && store !== 'empty';
  if (source === 'manual' && !cards.length) return null;
  if (source === 'auto' && store === 'empty' && !cards.length) return null;
  const lead = t(data.text, 'تقييمات موثّقة من عملاء المتجر.');
  // while the store check runs (auto) the panel stays hidden: no flash of samples that then vanish
  const hidden = source === 'auto' && store === 'checking';

  return (
    <Section data={data}>
      <section className={'wrap rpanel' + (asBool(data.light_bg, true) ? '' : ' tc-plain')} id="reviews" hidden={hidden}>
        <div className="sec-head">
          <div>
            <span className="kicker">{t(data.kicker, 'ثقة تصنعها التجربة')}</span>
            <h2 className="h2">{t(data.title, 'القرار أسهل مع تجاربهم.')}</h2>
          </div>
          {lead && <p className="lead">{lead}</p>}
        </div>
        {showStore && <StoreReviews limit={limit} onState={setStore} />}
        {cards.length > 0 && (
          <div className={`rp3 tc-n-${Math.min(3, cards.length)}`}>
            {cards.map((r, i) => (
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
