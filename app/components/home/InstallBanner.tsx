/**
 * Component #14 — بنر التركيب الغامق (`home.install-banner`).
 * Design: design/final.html → `.fitd` (full-width dark split: photo with "FIT. DRIVE. REPEAT."
 * caption, copy with a two-line title — 2nd line gold — numbered steps, button, fine print).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'اهتمام بالتفاصيل، من أول مسمار.': 'Care in the details, from the first bolt.',
  'جاهز للطريق': 'Ready for the road',
  'اشترِ إطاراتك.': 'Buy your tires.',
  'وركّبها عندنا.': 'Have them fitted with us.',
  'مراكز تركيب في الرياض، وتجربة أوضح من أول اختيار حتى الاستلام. راجع الموقع والخدمات المشمولة قبل إكمال طلبك.':
    'Fitting centres in Riyadh and a clearer experience from first choice to pick-up. Check the location and included services before you order.',
  'اختر المقاس والإطار': 'Choose the size and tire',
  'راجع طريقة الاستلام': 'Review the pick-up method',
  'نسّق موعد التركيب': 'Arrange your fitting time',
  'الموقع وشروط التركيب': 'Location & fitting terms',
  'نطاق الخدمة وما يشمله التركيب يُحدّدان وفق شروط المركز.': 'Service scope and what fitting includes follow the centre terms.',
};
const STEPS = ['اختر المقاس والإطار', 'راجع طريقة الاستلام', 'نسّق موعد التركيب'];

export function InstallBanner({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const steps = rows(data.steps, 'steps').map(r => t(r.text, '')).filter(Boolean).slice(0, 4);
  const list = steps.length ? steps : STEPS.map(s => t(s, s));
  const fine = t(data.fine, 'نطاق الخدمة وما يشمله التركيب يُحدّدان وفق شروط المركز.');
  const imageRight = opt(data.image_side, 'left') === 'right';
  return (
    <Section data={data}>
      <section className={'fitd' + (imageRight ? ' tc-img-right' : '')} id="fit">
        <div className="fitd-img">
          <img src={asImage(data.image, '/assets/images/tc/mechanic-check.webp')} alt="" loading="lazy" />
          <div className="fitd-cap">
            <span>{t(data.caption, 'FIT. DRIVE. REPEAT.')}</span>
            <small>{t(data.caption_ar, 'اهتمام بالتفاصيل، من أول مسمار.')}</small>
          </div>
        </div>
        <div className="fitd-copy">
          <span className="kicker">{t(data.kicker, 'جاهز للطريق')}</span>
          <h2>
            {t(data.title_1, 'اشترِ إطاراتك.')}
            <br />
            <em>{t(data.title_2, 'وركّبها عندنا.')}</em>
          </h2>
          <p>{t(data.text, 'مراكز تركيب في الرياض، وتجربة أوضح من أول اختيار حتى الاستلام. راجع الموقع والخدمات المشمولة قبل إكمال طلبك.')}</p>
          <ol>
            {list.map((s, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
          <Link className="btn btn-gold" to={asLink(data.btn_link, '/help#install')}>
            {t(data.btn_text, 'الموقع وشروط التركيب')} <span aria-hidden="true">↗</span>
          </Link>
          {fine && <small className="fine">{fine}</small>}
        </div>
      </section>
    </Section>
  );
}
