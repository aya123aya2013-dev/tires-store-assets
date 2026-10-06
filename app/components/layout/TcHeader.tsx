/**
 * Store header — 1:1 with design/final.html: dark top bar, then row 1 (burger · brand · search ·
 * tools · «choose your size») and row 2 (category nav). Styles come from the generated design
 * CSS (tc-sections.scss → `.tc-s .topbar / header / .hrow / .hnav`) + tc-theme-ui.scss.
 *
 * Every element is a setting (groups «الشريط العلوي» and «الهيدر» in scripts/tc-settings.cjs),
 * with «يظهر على» per screen where the use differs; content is the store's own data from Salla
 * (logo, name, phone, header menu) — nothing is tied to one store.
 */
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SallaSearch } from '@salla.sa/twilight-components-react/search';
import { useNavigate, useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { asBool, asLink, makeT, opt, useLang } from '../home/fields';
import { Icon } from '../home/tc/Icon';
import { HeaderNav } from './HeaderNav';
import { ACCOUNT_PATH, useCartCount } from './MobileBottomBar';
import { setDark, useDarkSettings } from './ThemeTokens';
import { whereClass } from './devices';
import { MySizeChip } from '../tires/features/MySize';

const EN: Record<string, string> = {
  'تركيب مجاني في مراكزنا بالرياض': 'Free fitting at our Riyadh centres',
  '· تقسيط على 4 دفعات مع تابي وتمارا': '· Split into 4 payments with Tabby & Tamara',
  'ابحث باسم الإطار أو الماركة أو المقاس…': 'Search by tire name, brand or size…',
  'اختر مقاسك': 'Find your size', 'بحث': 'Search', 'حسابي': 'My account', 'السلة': 'Cart', 'القائمة': 'Menu',
  'الأقسام': 'Categories', 'الوضع الداكن': 'Dark mode', 'الوضع الفاتح': 'Light mode', 'TIRES STORE': 'TIRES STORE',
};

const openSearch = () => window.salla?.event?.dispatch('search::open');
type S = Record<string, unknown>;

/** Brand lockup: the store's own logo, or the tire mark + store name (design look). */
export function TcBrand({ footer = false }: { footer?: boolean }) {
  const { store, theme } = useTwilight();
  const s = (theme?.settings ?? {}) as S;
  const t = makeT(useLang(), EN);
  const name = store?.name || 'متجر الإطارات';
  const useLogo = !footer && opt(s.tc_logo_mode, 'store') === 'store' && !!store?.logo;
  const sub = t(s.tc_brand_sub, 'TIRES STORE');
  return (
    <Link className="brand" to="/" aria-label={name}>
      {useLogo ? (
        <img src={store!.logo} alt={name} style={{ width: 'auto', maxWidth: 200, objectFit: 'contain' }} />
      ) : (
        <>
          <img src="/assets/images/logo-mark.svg" alt="" width={36} height={42} />
          <span>
            <b>{name}</b>
            {sub && <small dir="ltr">{sub}</small>}
          </span>
        </>
      )}
    </Link>
  );
}

function DarkSwitch({ label, className }: { label: (k: string) => string; className: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(document.documentElement.getAttribute('data-tc-dark') === '1'); }, []);
  return (
    <button
      type="button"
      className={'ic tc-dark-btn' + className}
      aria-pressed={on}
      aria-label={on ? label('الوضع الفاتح') : label('الوضع الداكن')}
      onClick={() => { setDark(!on); setOn(!on); }}
    >
      <Icon name={on ? 'sun' : 'moon'} />
    </button>
  );
}

function TopBar({ s, t }: { s: S; t: (v: unknown, d: string) => string }) {
  const { store } = useTwilight();
  if (!asBool(s.tc_topbar_show, true)) return null;
  const text = t(s.tc_topbar_text, 'تركيب مجاني في مراكزنا بالرياض');
  const hi = t(s.tc_topbar_highlight, '· تقسيط على 4 دفعات مع تابي وتمارا');
  const link = asLink(s.tc_topbar_link, '');
  const phone = asBool(s.tc_topbar_phone, true) ? String(store?.contacts?.mobile || store?.contacts?.phone || '').trim() : '';
  if (!text && !hi && !phone) return null;
  const msg = (
    <span>
      {text} {hi && <b className={whereClass(s.tc_topbar_highlight_where, 'wide')}>{hi}</b>}
    </span>
  );
  return (
    <div className={'topbar' + (asBool(s.tc_topbar_marquee, false) ? ' tc-marquee' : '') + whereClass(s.tc_topbar_where)}>
      <div className="wrap">
        {link ? <Link to={link} className="tc-top-msg">{msg}</Link> : msg}
        {phone && (
          <a className={whereClass(s.tc_topbar_phone_where, 'wide').trim() || undefined} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
            <Icon name="phone" style={{ width: 15, height: 15 }} />
            <span dir="ltr">{phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}

interface Props { navOpen: boolean; onNavOpenChange: (open: boolean) => void }

export function TcHeader({ navOpen, onNavOpenChange }: Props) {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as S;
  const t = makeT(useLang(), EN);
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const cartCount = useCartCount();
  const { toggle: darkToggle } = useDarkSettings();
  const { data: items = [] } = useQuery(menu.queries.header());

  const stickyD = asBool(s.tc_header_sticky, true);
  const stickyM = asBool(s.tc_header_sticky_m, true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!stickyD && !stickyM) return;
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [stickyD, stickyM]);

  const searchOn = asBool(s.tc_search_show, true);
  const cta = asBool(s.tc_header_cta, true) ? t(s.tc_header_cta_text, 'اختر مقاسك') : '';
  const ctaLink = asLink(s.tc_header_cta_link, '/#size');
  const nav = asBool(s.tc_header_nav, true) ? items.filter(i => i.title).slice(0, 8) : [];
  const cls = ['', scrolled ? 'scrolled' : '', stickyD ? '' : 'tc-nosticky-d', stickyM ? '' : 'tc-nosticky-m'].filter(Boolean).join(' ');

  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="tc-s tc-frame" suppressHydrationWarning>
      <HookSlot name="header:start" />
      <TopBar s={s} t={t} />

      <header className={cls || undefined} suppressHydrationWarning>
        <div className="wrap hrow">
          <button type="button" className="ic burger" aria-label={t('القائمة', 'القائمة')} aria-expanded={navOpen} onClick={() => onNavOpenChange(true)}>
            <Icon name="menu" />
          </button>
          <TcBrand />
          {searchOn ? (
            <form className="hsearch" role="search" onSubmit={search}>
              <input name="q" type="search" placeholder={t(s.tc_search_placeholder, 'ابحث باسم الإطار أو الماركة أو المقاس…')} aria-label={t('بحث', 'بحث')} />
              <button className="hs-btn" type="submit">{t('بحث', 'بحث')}</button>
            </form>
          ) : (
            <span style={{ flex: 1 }} />
          )}
          <div className="tools">
            {searchOn && <button type="button" className="ic only-m" aria-label={t('بحث', 'بحث')} onClick={openSearch}><Icon name="search" /></button>}
            {asBool(s.tc_mysize_chip, true) && <MySizeChip />}
            {darkToggle && <DarkSwitch label={k => t(k, k)} className={whereClass(s.tc_dark_toggle_where)} />}
            {asBool(s.tc_account_show, true) && (
              <button
                type="button"
                className="ic"
                aria-label={t('حسابي', 'حسابي')}
                onClick={() => (isLoggedIn ? navigate(ACCOUNT_PATH) : window.salla?.event?.dispatch('login::open'))}
              >
                <Icon name="user" />
              </button>
            )}
            {asBool(s.tc_cart_show, true) && (
              <Link className="ic" to="/cart" aria-label={t('السلة', 'السلة')}>
                <Icon name="bag" />
                {cartCount > 0 && <i>{cartCount > 99 ? '99+' : cartCount}</i>}
              </Link>
            )}
            {cta && (
              <Link className={'btn btn-gold tc-hcta' + whereClass(s.tc_header_cta_where, 'wide')} to={ctaLink} style={{ height: 46, marginInlineStart: 8 }}>
                {cta} <span className="tc-flip"><Icon name="arrow" style={{ width: 18, height: 18 }} /></span>
              </Link>
            )}
          </div>
        </div>
        {nav.length > 0 && (
          <nav className="hnav" aria-label={t('الأقسام', 'الأقسام')}>
            <div className="wrap">
              {nav.map(item => <Link key={item.id} to={item.url}>{item.title}</Link>)}
            </div>
          </nav>
        )}
      </header>

      <HeaderNav open={navOpen} onClose={() => onNavOpenChange(false)} />
      {searchOn && <div className="tc-search-modal"><SallaSearch suppressHydrationWarning /></div>}
      <HookSlot name="header:end" />
    </div>
  );
}
