/**
 * Store footer — 1:1 with design/final.html `<footer>`: brand + about, two link columns, contact
 * (phone, city, subscribe), then © + payment marks. Styles: generated design CSS (`.tc-s footer`,
 * `.fgrid`, `.fbot`, `.news`).
 * Content is the merchant's: column 1 = Salla header menu, column 2 = Salla footer menu, contact
 * and social from the store's own data; texts / switches from the theme settings.
 */
import { useQuery } from '@tanstack/react-query';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { SallaMenu } from '@salla.sa/twilight-components-react/menu';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { asBool, asLink, makeT, useLang } from '../home/fields';
import { Icon } from '../home/tc/Icon';
import { signupUrl } from '../home/Newsletter';
import { SallaTrustBadges } from '@salla.sa/twilight-components-react/trust-badges';
import { TcBrand } from './TcHeader';

const EN: Record<string, string> = {
  'إطارات أصلية لكل سيارة، تركيب مجاني بالرياض، وتوصيل لكل مناطق المملكة.': 'Genuine tires for every car, free fitting in Riyadh and delivery across the Kingdom.',
  'تسوّق': 'Shop', 'المساعدة': 'Help', 'تواصل': 'Contact', 'الرياض': 'Riyadh', 'بريدك للعروض': 'Your email for offers',
  'اشترك': 'Subscribe', 'أكمل اشتراكك بالنافذة الجديدة': 'Finish signing up in the new tab', 'أرسل رسالة البريد لإكمال الاشتراك': 'Send the email to finish signing up', 'المتصفح منع فتح النافذة — حاول مرة ثانية': 'Your browser blocked the tab — try again', 'جميع الحقوق محفوظة': 'All rights reserved', 'السجل التجاري': 'CR', 'الرقم الضريبي': 'VAT',
};
const SOCIAL: [keyof Social, string, string][] = [
  ['instagram', 'instagram', 'Instagram'], ['twitter', 'x', 'X'], ['snapchat', 'snapchat', 'Snapchat'], ['tiktok', 'tiktok', 'TikTok'],
];
type Social = { instagram?: string; twitter?: string; snapchat?: string; tiktok?: string };
const socialUrl = (k: keyof Social, v: string) => {
  if (/^https?:\/\//.test(v)) return v;
  const h = v.replace(/^@/, '');
  return { instagram: `https://instagram.com/${h}`, twitter: `https://x.com/${h}`, snapchat: `https://snapchat.com/add/${h}`, tiktok: `https://tiktok.com/@${h}` }[k];
};

/** a footer column; on mobile it folds under its title when «أعمدة الفوتر تنطوي» is on */
function Col({ title, acc, className = '', children }: { title: string; acc: boolean; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  if (!acc || !mobile) return <div className={className || undefined}><h4>{title}</h4>{children}</div>;
  return (
    <div className={`${className} tc-acc${open ? ' open' : ''}`.trim()}>
      <h4 role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen(!open))}>{title}</h4>
      {children}
    </div>
  );
}

/** < 768px, known only after hydration (SSR renders the desktop markup — no mismatch) */
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

export function TcFooter() {
  const [sub, setSub] = useState<'' | 'link' | 'email' | 'blocked'>('');
  const { store, theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const t = makeT(useLang(), EN);
  const { data: shop = [] } = useQuery(menu.queries.header());
  const year = new Date().getFullYear();

  const about = t(s.tc_footer_about, 'إطارات أصلية لكل سيارة، تركيب مجاني بالرياض، وتوصيل لكل مناطق المملكة.');
  const storeEmail = String(store?.contacts?.email || '').trim();
  const phone = asBool(s.tc_footer_phone, true) ? String(store?.contacts?.mobile || store?.contacts?.phone || '').trim() : '';
  const email = asBool(s.tc_footer_email, true) ? storeEmail : '';
  const acc = asBool(s.tc_footer_accordion, true);
  const city = t(s.tc_footer_city, 'الرياض');
  const social = (store?.social ?? {}) as Social;
  const newsLink = asLink(s.tc_footer_news_link, '');
  const showNews = asBool(s.tc_footer_news, true) && (!!newsLink || !!storeEmail);
  const legal = asBool(s.tc_footer_legal, true);
  const cr = (store?.settings as { commercial_number?: string | null } | undefined)?.commercial_number;

  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mail = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    if (!mail) return;
    if (newsLink) setSub(window.open(signupUrl(newsLink, mail), '_blank') ? 'link' : 'blocked');
    else if (storeEmail) setSub('email'), window.location.href = `mailto:${storeEmail}?subject=Newsletter&body=${encodeURIComponent(mail)}`;
  };

  return (
    <div className="tc-s tc-frame" suppressHydrationWarning>
      <footer>
        <HookSlot name="footer:start" />
        <div className="wrap">
          <div className="fgrid">
            {(asBool(s.tc_footer_brand, true) || about || (asBool(s.tc_footer_social, true) && SOCIAL.some(([k]) => social[k]))) && <div>
              {asBool(s.tc_footer_brand, true) && <TcBrand footer />}
              {about && <p style={{ marginTop: 16, fontSize: 13.5, color: '#9a9ea2', maxWidth: 300 }}>{about}</p>}
              {asBool(s.tc_footer_social, true) && SOCIAL.some(([k]) => social[k]) && (
                <div className="tc-soc">
                  {SOCIAL.filter(([k]) => social[k]).map(([k, icon, label]) => (
                    <a key={k} href={socialUrl(k, String(social[k]))} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon name={icon} /></a>
                  ))}
                </div>
              )}
            </div>}
            {asBool(s.tc_footer_shop, true) && shop.length > 0 && (
              <Col title={t(s.tc_footer_shop_title, 'تسوّق')} acc={acc}>
                {shop.filter(i => i.title).slice(0, 6).map(i => <Link key={i.id} to={i.url}>{i.title}</Link>)}
              </Col>
            )}
            {asBool(s.tc_footer_help, true) && (
              <Col title={t(s.tc_footer_help_title, 'المساعدة')} acc={acc} className="tc-f-menu">
                {/* the merchant's footer menu (shipping, returns, terms, privacy) */}
                <SallaMenu source="footer" useReactLink suppressHydrationWarning />
              </Col>
            )}
            {(phone || email || city || showNews) && <div className="contact">
              <h4>{t('تواصل', 'تواصل')}</h4>
              {phone && <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" style={{ width: 16, height: 16 }} /><span dir="ltr">{phone}</span></a>}
              {email && <a href={`mailto:${email}`}><Icon name="mail" style={{ width: 16, height: 16 }} /><span dir="ltr">{email}</span></a>}
              {city && <span className="tc-f-city"><Icon name="pin" style={{ width: 16, height: 16 }} />{city}</span>}
              {showNews && (
                <form className="news" onSubmit={subscribe}>
                  <input name="email" type="email" required placeholder={t('بريدك للعروض', 'بريدك للعروض')} aria-label={t('بريدك للعروض', 'بريدك للعروض')} dir="auto" />
                  <button type="submit">{t('اشترك', 'اشترك')}</button>
                </form>
              )}
              {showNews && (
                <p className="tc-f-sub" role="status">
                  {sub === 'link' ? t('أكمل اشتراكك بالنافذة الجديدة', 'أكمل اشتراكك بالنافذة الجديدة') : sub === 'email' ? t('أرسل رسالة البريد لإكمال الاشتراك', 'أرسل رسالة البريد لإكمال الاشتراك') : sub === 'blocked' ? t('المتصفح منع فتح النافذة — حاول مرة ثانية', 'المتصفح منع فتح النافذة — حاول مرة ثانية') : ''}
                </p>
              )}
            </div>}
          </div>
          <div className="fbot">
            <span>
              © {year} {store?.name} · {t('جميع الحقوق محفوظة', 'جميع الحقوق محفوظة')}
              {legal && cr && <> · {t('السجل التجاري', 'السجل التجاري')} <span dir="ltr">{cr}</span></>}
            </span>
            {asBool(s.tc_footer_payments, true) && (
              // the store's real payment methods (never a fixed list that may not be enabled)
              <div className="pay tc-pay"><SallaPayments suppressHydrationWarning /></div>
            )}
          </div>
          {legal && <div className="tc-f-trust"><SallaTrustBadges dark /></div>}
        </div>
        <HookSlot name="footer:end" />
      </footer>
    </div>
  );
}
