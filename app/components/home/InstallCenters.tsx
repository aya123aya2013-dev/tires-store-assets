/**
 * Component #15 — مراكز التركيب (`home.install-centers`).
 * Design: design/final.html → `#centers` (.sec-head + `.centers` of `.center`: photo, «open now» tag,
 * name, address / hours / phone with icons, «directions» + «book» buttons).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asImage, asLink, makeT, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { useSellsFitting } from '../tires/features/cardSettings';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'مراكز التركيب': 'Fitting centres', 'أقرب مركز لك بالرياض.': 'The centre closest to you in Riyadh.',
  'اختر المركز في السلة، ونجهّز إطاراتك قبل ما توصل.': 'Pick the centre in the cart and we prepare your tires before you arrive.',
  'مفتوح الآن': 'Open now', 'الاتجاهات': 'Directions', 'احجز موعد': 'Book a slot',
  'مركز الملقا': 'Al Malqa centre', 'طريق أنس بن مالك، حي الملقا': 'Anas Bin Malik Rd, Al Malqa',
  'مركز السويدي': 'Al Suwaidi centre', 'طريق ديراب، حي السويدي': 'Dirab Rd, Al Suwaidi',
  'السبت–الخميس · 9 ص – 11 م': 'Sat–Thu · 9 am – 11 pm',
};
const DEFAULTS = [
  { image: '/assets/images/tc/inspect.webp', name: 'مركز الملقا', address: 'طريق أنس بن مالك، حي الملقا' },
  { image: '/assets/images/tc/mechanic-tyre.webp', name: 'مركز السويدي', address: 'طريق ديراب، حي السويدي' },
].map(c => ({ ...c, hours: 'السبت–الخميس · 9 ص – 11 م', phone: '', map: 'https://maps.google.com', open: true, book: 'احجز موعد', bookLink: '/help#install' }));

export function InstallCenters({ data }: { data: Row }) {
  const fitting = useSellsFitting();
  const t = makeT(useLang(), EN);
  const list = rows(data.centers, 'centers')
    .map(r => ({
      image: asImage(r.image, ''),
      name: t(r.name, ''),
      address: t(r.address, ''),
      hours: t(r.hours, ''),
      phone: t(r.phone, '').replace(/[^\d+]/g, ''),
      map: asLink(r.map_link, ''),
      open: asBool(r.open_now, false),
      book: t(r.book_text, 'احجز موعد'),
      bookLink: asLink(r.book_link, ''),
    }))
    .filter(c => c.name);
  // a saved list (even empty) is the merchant's choice — defaults only when the field was never saved
  const centers = Array.isArray(data.centers) ? list : DEFAULTS.map(c => ({ ...c, name: t(c.name, c.name), address: t(c.address, c.address), hours: t(c.hours, c.hours), book: t(c.book, c.book) }));
  if (!centers.length) return null;
  const lead = t(data.text, 'اختر المركز في السلة، ونجهّز إطاراتك قبل ما توصل.');

  if (!fitting) return null; // «بيع فقط»: no fitting sections
  return (
    <Section data={data}>
      <section className="sec" id="centers" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'مراكز التركيب')}</span>
              <h2 className="h2">{t(data.title, 'أقرب مركز لك بالرياض.')}</h2>
            </div>
            {lead && <p className="lead">{lead}</p>}
          </div>
          <div className={`centers tc-n-${centers.length}`}>
            {centers.map((c, i) => (
              <article className="center" key={i}>
                {c.image && <img src={c.image} alt="" loading="lazy" />}
                <div className="cin">
                  {c.open && <span className="tag-open">{t('مفتوح الآن', 'مفتوح الآن')}</span>}
                  <h3>{c.name}</h3>
                  <ul>
                    {c.address && <li><Icon name="pin" />{c.address}</li>}
                    {c.hours && <li><Icon name="cal" />{c.hours}</li>}
                    {c.phone && <li><Icon name="phone" /><a href={`tel:${c.phone}`} dir="ltr">{c.phone}</a></li>}
                  </ul>
                  <div className="cbtns">
                    {c.map && <a className="btn btn-dark" href={c.map} target="_blank" rel="noopener noreferrer">{t('الاتجاهات', 'الاتجاهات')}</a>}
                    {c.bookLink && <Link className="btn btn-line" to={c.bookLink}>{c.book}</Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
