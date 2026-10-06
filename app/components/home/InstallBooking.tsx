/**
 * Component #16 — حجز موعد التركيب (`home.install-booking`).
 * Design: design/final.html → `#book` (.fit: copy with day tabs + time slots + gold button +
 * steps; art side with the tire, «TIRES STORE / FIT & GO» label and the «45 min» badge).
 * Booking: Salla has no slot booking for themes, so the button sends the chosen day/time
 * on WhatsApp (or opens the merchant's booking link). Today's past times are disabled.
 */
import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'اختيارك علينا، وطريقك قدّامك': 'Your choice is on us, your road is ahead',
  'اشترِ إطاراتك.': 'Buy your tires.', 'وركّبها عندنا.': 'Have them fitted with us.',
  'تركيب مجاني في مراكزنا بالرياض، بعناية تليق بسيارتك. اختر الموعد اللي يناسبك ونجهّز كل شيء قبل ما توصل.':
    'Free fitting at our Riyadh centres, with the care your car deserves. Pick a time and we prepare everything before you arrive.',
  'اليوم': 'Today', 'بكرة': 'Tomorrow', 'بعد بكرة': 'Day after', 'احجز موعد التركيب': 'Book a fitting',
  'الموقع وشروط التركيب': 'Location & fitting terms', 'اختر إطاراتك': 'Choose your tires', 'أكمل طلبك': 'Complete your order',
  'ركّب واستلم': 'Fit & drive', 'دقيقة': 'min', 'متوسط التركيب': 'average fitting', 'احجز': 'Book',
};
const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];
const STEPS = ['اختر إطاراتك', 'أكمل طلبك', 'ركّب واستلم'];
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const show12 = (hhmm: string) => { const h = Math.floor(toMin(hhmm) / 60), m = toMin(hhmm) % 60; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`; };

export function InstallBooking({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const days = [t(data.day_1, 'اليوم'), t(data.day_2, 'بكرة'), t(data.day_3, 'بعد بكرة')];
  const slotRows = rows(data.slots, 'slots').map(r => String(r.time ?? '').trim()).filter(x => /^\d{1,2}:\d{2}$/.test(x));
  const slots = Array.isArray(data.slots) ? slotRows : SLOTS;
  const stepRows = rows(data.steps, 'steps').map(r => t(r.text, '')).filter(Boolean);
  const steps = Array.isArray(data.steps) ? stepRows : STEPS.map(s => t(s, s));

  const [day, setDay] = useState(0);
  const [time, setTime] = useState('');
  // "now" only on the client, so the server and the first paint agree (no hydration mismatch)
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); }, []);
  const past = (s: string) => day === 0 && nowMin !== null && toMin(s) <= nowMin + 30;

  const btnText = t(data.btn_text, 'احجز موعد التركيب');
  const label = time ? `${t('احجز', 'احجز')} ${days[day]} · ${show12(time)}` : btnText;
  const phone = String(data.whatsapp ?? '').replace(/[^\d]/g, '');
  const mode = opt(data.booking_mode, 'whatsapp');
  const msg = `${isEn ? 'Fitting booking' : 'حجز موعد تركيب'}: ${days[day]}${time ? ` · ${show12(time)}` : ''}`;
  const href = mode === 'whatsapp' && phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : asLink(data.book_link, '/help#install');
  const terms = t(data.terms_text, 'الموقع وشروط التركيب');

  return (
    <Section data={data}>
      <section className="wrap fit" id="book">
        <div className="fit-copy">
          <span className="kicker">{t(data.kicker, 'اختيارك علينا، وطريقك قدّامك')}</span>
          <h2 className="h2">
            {t(data.title_1, 'اشترِ إطاراتك.')}
            <br />
            {t(data.title_2, 'وركّبها عندنا.')}
          </h2>
          <p className="lead">{t(data.text, 'تركيب مجاني في مراكزنا بالرياض، بعناية تليق بسيارتك. اختر الموعد اللي يناسبك ونجهّز كل شيء قبل ما توصل.')}</p>
          {slots.length > 0 && (
            <div className="slots">
              <div className="days" role="tablist">
                {days.map((d, i) => (
                  <button type="button" role="tab" aria-selected={i === day} key={i} className={i === day ? 'on' : undefined} onClick={() => { setDay(i); setTime(''); }}>{d}</button>
                ))}
              </div>
              <div className="times">
                {slots.map(s => (
                  <button type="button" key={s} disabled={past(s)} aria-pressed={s === time} className={s === time ? 'on' : undefined} onClick={() => setTime(s)}>{show12(s)}</button>
                ))}
              </div>
            </div>
          )}
          <div className="fit-cta">
            {href.startsWith('http') ? (
              <a className="btn btn-gold" href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ) : (
              <Link className="btn btn-gold" to={href}>{label}</Link>
            )}
            {terms && <Link className="link" to={asLink(data.terms_link, '/help#install')}>{terms}</Link>}
          </div>
          {steps.length > 0 && (
            <ol className="fit-steps">
              {steps.map((s, i) => <li key={i}><b>{String(i + 1).padStart(2, '0')}</b>{s}</li>)}
            </ol>
          )}
        </div>
        <div className="fit-art">
          <div className="fit-label">{t(data.art_title, 'TIRES STORE')}<span>{t(data.art_sub, 'FIT & GO')}</span></div>
          <span className="fit-ring" />
          <img src={asImage(data.image, '/assets/images/tc/madar-tire.webp')} alt="" loading="lazy" />
          {String(data.badge_number ?? '45').trim() && (
            <div className="fit-badge">
              <b>{String(data.badge_number ?? '45')}</b>
              <small>{t(data.badge_unit, 'دقيقة')}<br />{t(data.badge_text, 'متوسط التركيب')}</small>
            </div>
          )}
        </div>
      </section>
    </Section>
  );
}
