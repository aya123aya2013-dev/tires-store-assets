/**
 * Component #11 — شبكة الخدمات + حاسبة القسط (`home.services-bento`).
 * Design: design/final.html → `#bento` (big photo tile, gold instalment calculator,
 * small photo tile, wide dark fleet tile).
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, asImage, asLink, makeT, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { useCurrency } from './tc/useCurrency';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = {
  'الخدمات': 'Services', 'من الطلب لين التركيب.': 'From order to fitting.', 'مواقع المراكز': 'Centre locations',
  'تركيب مجاني بنفس اليوم': 'Free same-day fitting',
  'اختر «استلام وتركيب» في السلة، ونركّب إطاراتك على جنوطك في أحد مركزينا بالرياض.': 'Choose “pick up & fit” in the cart and we fit your tires at one of our Riyadh centres.',
  'احجز موعد': 'Book a slot', 'كم القسط؟': 'What’s the instalment?', 'حرّك المؤشر حسب سعر الأربع إطارات.': 'Move the slider to the price of four tires.',
  'تابي أو تمارا': 'Tabby or Tamara', 'فحص النقشة والضغط': 'Tread & pressure check', 'مجاناً مع أي زيارة': 'Free with any visit',
  'للشركات والأساطيل': 'For companies & fleets', 'أسعار كميات، فواتير ضريبية، وجدولة تبديل دوري لسياراتكم.': 'Volume prices, VAT invoices and scheduled replacements for your vehicles.',
  'اطلب عرض سعر': 'Request a quote',
};

export function ServicesBento({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const min = Math.max(1, Number(data.calc_min) || 800);
  const max = Math.max(min + 40, Number(data.calc_max) || 4000);
  const parts = Math.min(12, Math.max(2, Number(data.calc_parts) || 4));
  const [total, setTotal] = useState(() => Math.min(max, Math.max(min, 1160)));
  const cur = useCurrency();
  const arrow = <Icon name="arrow" style={{ width: 16, height: 16, ...(isEn ? { transform: 'scaleX(-1)' } : {}) }} />;

  return (
    <Section data={data}>
      <section className="sec" id="bento" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'الخدمات')}</span>
              <h2 className="h2">{t(data.title, 'من الطلب لين التركيب.')}</h2>
            </div>
            {asBool(data.show_link, true) && (
              <Link className="link" to={asLink(data.head_link, '/help#install')}>{t(data.head_link_text, 'مواقع المراكز')} {arrow}</Link>
            )}
          </div>
          <div className={'bento' + (asBool(data.calc_show, true) ? '' : ' tc-nocalc')}>
            <Link className="tile photo t-install" to={asLink(data.big_link, '/help#install')}>
              <img src={asImage(data.big_image, '/assets/images/tc/mechanic-check.webp')} alt="" loading="lazy" />
              <div className="in">
                <h3>{t(data.big_title, 'تركيب مجاني بنفس اليوم')}</h3>
                <p>{t(data.big_text, 'اختر «استلام وتركيب» في السلة، ونركّب إطاراتك على جنوطك في أحد مركزينا بالرياض.')}</p>
                <span className="link" style={{ marginTop: 16 }}>{t(data.big_link_text, 'احجز موعد')}</span>
              </div>
            </Link>
            {asBool(data.calc_show, true) && (
              <div className="tile t-calc">
                <div>
                  <h3>{t(data.calc_title, 'كم القسط؟')}</h3>
                  <p>{t(data.calc_text, 'حرّك المؤشر حسب سعر الأربع إطارات.')}</p>
                </div>
                <div>
                  <div className="calc-n">
                    <span>{Math.round(total / parts)}</span>
                    <small>{cur()} {isEn ? '/ month' : '/ شهرياً'}</small>
                  </div>
                  <input type="range" min={min} max={max} step={40} value={total} onChange={e => setTotal(Number(e.target.value))} aria-label={isEn ? 'Total price' : 'إجمالي السعر'} />
                  <div className="fine">
                    {isEn ? 'Total' : 'الإجمالي'} <span>{total}</span> {cur()} · {t(data.calc_providers, 'تابي أو تمارا')}
                  </div>
                </div>
              </div>
            )}
            <Link className="tile photo" to={asLink(data.small_link, '/help')}>
              <img src={asImage(data.small_image, '/assets/images/tc/tread-depth.webp')} alt="" loading="lazy" />
              <div className="in">
                <h3>{t(data.small_title, 'فحص النقشة والضغط')}</h3>
                <span className="link" style={{ marginTop: 10 }}>{t(data.small_link_text, 'مجاناً مع أي زيارة')}</span>
              </div>
            </Link>
            <Link className="tile t-fleet" to={asLink(data.fleet_link, '/help')}>
              <div>
                <h3>{t(data.fleet_title, 'للشركات والأساطيل')}</h3>
                <p>{t(data.fleet_text, 'أسعار كميات، فواتير ضريبية، وجدولة تبديل دوري لسياراتكم.')}</p>
              </div>
              <span className="link">{t(data.fleet_link_text, 'اطلب عرض سعر')}</span>
            </Link>
          </div>
        </div>
      </section>
    </Section>
  );
}
