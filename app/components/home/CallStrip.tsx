/**
 * Component #17 — شريط اتصال (`home.call-strip`).
 * Design: design/final.html → `.callbar` (dark strip, gold slanted piece behind the phone,
 * kicker + title + line, big Latin phone number and a white «call now» button).
 */
import { asBool, makeT, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'تفضّل الحجز بالتلفون؟': 'Prefer booking by phone?', 'اتصل واحجز موعد التركيب.': 'Call and book your fitting.',
  'نرد عليك من 9 الصبح لين 11 بالليل، طوال الأسبوع.': 'We answer from 9 am to 11 pm, all week.', 'اتصل الآن': 'Call now',
};

export function CallStrip({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const phone = String(data.phone ?? '').trim();
  const tel = phone.replace(/[^\d+]/g, '');
  const sub = t(data.text, 'نرد عليك من 9 الصبح لين 11 بالليل، طوال الأسبوع.');
  return (
    <Section data={data}>
      <section className={'wrap callbar' + (asBool(data.gold_piece, true) ? '' : ' tc-plain')}>
        <div className="cb-txt">
          <span className="kicker">{t(data.kicker, 'تفضّل الحجز بالتلفون؟')}</span>
          <h2>{t(data.title, 'اتصل واحجز موعد التركيب.')}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {tel && (
          <div className="cb-act">
            <a className="cb-phone" href={`tel:${tel}`} dir="ltr">{phone}</a>
            <a className="btn btn-white" href={`tel:${tel}`}><Icon name="phone" /> {t(data.btn_text, 'اتصل الآن')}</a>
          </div>
        )}
      </section>
    </Section>
  );
}
