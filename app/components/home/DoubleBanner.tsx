/**
 * Component #9 — بانر مزدوج (`home.double-banner`).
 * Design: design/final.html → `.dbl` (dark card with gold slanted slab + tire photo,
 * light gold card with a huge faded letter and the size in big Latin digits).
 */
import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asImage, asLink, asText, makeT, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'للرحلة، من أولها': 'For the trip, from the start', 'أربع إطارات.\nاختيار واحد مدروس.': 'Four tires.\nOne considered choice.',
  'ابدأ بالمقاس، وقارن المجموعة المناسبة لسيارتك.': 'Start with the size and compare the right range for your car.',
  'اكتشف الإطارات': 'Discover tires', 'دقيقة وحدة تكفي': 'One minute is enough',
  'ثلاثة أرقام، وكل رقم له معنى.\nخلّنا نساعدك تفهم مقاسك.': 'Three numbers, each with a meaning.\nLet us help you read your size.',
  'افتح دليل المقاسات': 'Open the size guide',
};
// "line one\nline two" → line one<br>line two
const lines = (s: string) => s.split(/\n/).map((l, i, a) => <Fragment key={i}>{l}{i < a.length - 1 && <br />}</Fragment>);

export function DoubleBanner({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const arrow = <Icon name="arrow" style={{ width: 16, height: 16, ...(isEn ? { transform: 'scaleX(-1)' } : {}) }} />;
  const slab = asText(data.slab_color, '', lang);

  const dark = (
    <Link className="dcard dark" to={asLink(data.dark_link, '/latest-products')} key="dark">
      <div className="dtxt">
        <span className="kicker" style={{ color: 'var(--gold)' }}>{t(data.dark_kicker, 'للرحلة، من أولها')}</span>
        <h3>{lines(t(data.dark_title, 'أربع إطارات.\nاختيار واحد مدروس.'))}</h3>
        <p>{t(data.dark_text, 'ابدأ بالمقاس، وقارن المجموعة المناسبة لسيارتك.')}</p>
        <span className="link" style={{ color: '#fff' }}>{t(data.dark_link_text, 'اكتشف الإطارات')} {arrow}</span>
      </div>
      <div className="dart">
        <span className="dslab" style={slab ? ({ background: slab } as CSSProperties) : undefined} />
        <img src={asImage(data.dark_image, '/assets/images/tc/tire-a.webp')} alt="" loading="lazy" />
      </div>
    </Link>
  );
  const light = (
    <Link className="dcard light" to={asLink(data.light_link, '/help#size')} key="light">
      <span className="dghost">{t(data.light_ghost, 'R')}</span>
      <div className="dtxt">
        <span className="kicker">{t(data.light_kicker, 'دقيقة وحدة تكفي')}</span>
        <div className="dsize" dir="ltr">{t(data.light_size, '205 / 55 R16')}</div>
        <p>{lines(t(data.light_text, 'ثلاثة أرقام، وكل رقم له معنى.\nخلّنا نساعدك تفهم مقاسك.'))}</p>
        <span className="link">{t(data.light_link_text, 'افتح دليل المقاسات')} {arrow}</span>
      </div>
    </Link>
  );

  return (
    <Section data={data}>
      <section className="wrap dbl">{asBool(data.reverse, false) ? [light, dark] : [dark, light]}</section>
    </Section>
  );
}
