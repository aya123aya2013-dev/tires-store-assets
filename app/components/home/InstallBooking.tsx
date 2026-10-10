/**
 * Component #16 — حجز موعد التركيب (`home.install-booking`).
 * Design: design/final.html → `#book` (.fit: copy with day tabs + time slots + gold button +
 * steps; art side with the tire, «TIRES STORE / FIT & GO» label and the «45 min» badge).
 * Booking: Salla has no slot booking for themes, so the button REQUESTS the chosen date/time
 * (the store confirms after replying) on WhatsApp, or adds `date` + `time` to the merchant's booking link. Times are judged in the
 * store's time zone (Riyadh) and refreshed every minute, so today's past times stay disabled.
 */
import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { useSellsFitting } from '../tires/features/cardSettings';
import { toIntl, useWhatsappNumber } from '../layout/contact';

const EN: Record<string, string> = {
  'اختيارك علينا، وطريقك قدّامك': 'Your choice is on us, your road is ahead',
  'اشترِ إطاراتك.': 'Buy your tires.', 'وركّبها عندنا.': 'Have them fitted with us.',
  'تركيب مجاني في مراكزنا بالرياض، بعناية تليق بسيارتك. اختر الموعد اللي يناسبك ونجهّز كل شيء قبل ما توصل.':
    'Free fitting at our Riyadh centres, with the care your car deserves. Pick a time and we prepare everything before you arrive.',
  'اليوم': 'Today', 'بكرة': 'Tomorrow', 'بعد بكرة': 'Day after', 'اطلب موعد التركيب': 'Request a fitting',
  'الموعد يتأكد بعد رد المتجر': 'The time is confirmed once the store replies',
  'الموقع وشروط التركيب': 'Location & fitting terms', 'اختر إطاراتك': 'Choose your tires', 'أكمل طلبك': 'Complete your order',
  'ركّب واستلم': 'Fit & drive', 'دقيقة': 'min', 'متوسط التركيب': 'average fitting', 'اطلب': 'Request',
};
const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];
const STEPS = ['اختر إطاراتك', 'أكمل طلبك', 'ركّب واستلم'];
const STORE_TZ = 'Asia/Riyadh';
const LOCAL = 'https://x.invalid';

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return (h || 0) * 60 + (m || 0); };
/** "9:05" → "09:05"; "25:99" → null — only real 24-hour times */
export const normTime = (v: unknown) => {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(v ?? '').trim());
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
};
/** 12-hour label that keeps morning and evening apart: 10:00 ص / 10:00 م */
export const show12 = (hhmm: string, en: boolean) => {
  const h = Math.floor(toMin(hhmm) / 60), m = toMin(hhmm) % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? (en ? 'AM' : 'ص') : en ? 'PM' : 'م'}`;
};
/** today's date (YYYY-MM-DD) and minutes since midnight in the store's time zone */
const storeNow = () => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map(x => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
};
const addDays = (ymd: string, n: number) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const withParams = (link: string, params: Record<string, string>) => {
  try {
    const u = new URL(link, LOCAL);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.origin === LOCAL ? u.pathname + u.search + u.hash : u.toString();
  } catch {
    return link;
  }
};

export function InstallBooking({ data }: { data: Row }) {
  const fitting = useSellsFitting();
  const sharedPhone = useWhatsappNumber();
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const days = [t(data.day_1, 'اليوم'), t(data.day_2, 'بكرة'), t(data.day_3, 'بعد بكرة')];
  const slotRows = [...new Set(rows(data.slots, 'slots').map(r => normTime(r.time)).filter((x): x is string => !!x))].sort((a, b) => toMin(a) - toMin(b));
  const slots = Array.isArray(data.slots) ? slotRows : SLOTS;
  const stepRows = rows(data.steps, 'steps').map(r => t(r.text, '')).filter(Boolean);
  const steps = Array.isArray(data.steps) ? stepRows : STEPS.map(s => t(s, s));

  const [day, setDay] = useState(0);
  const [time, setTime] = useState('');
  // "now" only on the client, so the server and the first paint agree (no hydration mismatch)
  const [now, setNow] = useState<{ date: string; min: number } | null>(null);
  useEffect(() => {
    const tick = () => setNow(storeNow());
    tick();
    const iv = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const past = (s: string) => day === 0 && now !== null && toMin(s) <= now.min + 30;
  // a chosen time that has slipped into the past is dropped
  useEffect(() => { if (time && past(time)) setTime(''); });
  const date = now ? addDays(now.date, day) : '';

  const btnText = t(data.btn_text, 'اطلب موعد التركيب');
  const label = time ? `${t('اطلب', 'اطلب')} ${days[day]} · ${show12(time, isEn)}` : btnText;
  // this section's own number first (optional), else the store-wide WhatsApp number from the theme settings;
  // a real number only — an example like 9665xxxxxxxx never becomes a recipient
  const rawPhone = String(data.whatsapp ?? '').trim();
  const ownPhone = /^\+?[\d\s-]+$/.test(rawPhone) ? toIntl(rawPhone) : '';
  const phone = ownPhone || sharedPhone;
  const mode = opt(data.booking_mode, 'whatsapp');
  const msg = `${isEn ? 'Fitting appointment request' : 'طلب موعد تركيب'}: ${days[day]}${date ? ` ${date}` : ''}${time ? ` · ${time} (${show12(time, isEn)})` : ''}`;
  const href = mode === 'whatsapp' && phone.length >= 10 && phone.length <= 15
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : time && date ? withParams(asLink(data.book_link, '/help#install'), { date, time }) : asLink(data.book_link, '/help#install');
  const terms = t(data.terms_text, 'الموقع وشروط التركيب');
  const confirmNote = t(data.confirm_note, 'الموعد يتأكد بعد رد المتجر');

  if (!fitting) return null; // «بيع فقط»: no fitting sections
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
              <div className="days" role="group" aria-label={isEn ? 'Day' : 'اليوم'}>
                {days.map((d, i) => (
                  <button type="button" aria-pressed={i === day} key={i} className={i === day ? 'on' : undefined} onClick={() => { setDay(i); setTime(''); }}>{d}</button>
                ))}
              </div>
              <div className="times" role="group" aria-label={isEn ? 'Time' : 'الوقت'}>
                {slots.map(s => (
                  <button type="button" key={s} disabled={past(s)} aria-pressed={s === time} className={s === time ? 'on' : undefined} onClick={() => setTime(s)}>{show12(s, isEn)}</button>
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
          {confirmNote && <p className="fit-note">{confirmNote}</p>}
          {steps.length > 0 && (
            <ol className="fit-steps">
              {steps.map((s, i) => <li key={i}><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>{s}</li>)}
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
