import { useQuery } from '@tanstack/react-query';
import { SallaSearch } from '@salla.sa/twilight-components-react/search';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { HeaderNav } from '../layout/HeaderNav';
import { ACCOUNT_PATH, useCartCount } from '../layout/MobileBottomBar';
import { IconArrow, IconBag, IconMenu, IconSearch, IconUser, IconWhatsapp } from './DesignIcons';
import { STORE_CONTACT, whatsappUrl } from './storeInfo';

/** Opens the Salla search modal (the `<SallaSearch />` mounted below). */
const openSearch = () => window.salla?.event?.dispatch('search::open');

/** How many top-level menu links fit inline (the rest live in the drawer). */
const INLINE_MENU_LINKS = 6;

/** Logo mark + the logo's own wording — always the brand, never the store-name setting. */
export function BrandLockup() {
  return (
    <Link to="/" className="brand" aria-label="متجر الإطارات">
      <img src="/assets/images/logo-mark.svg" alt="" width={36} height={38} />
      <span>
        <b>متجر الإطارات</b>
        <small dir="ltr">TIRES STORE</small>
      </span>
    </Link>
  );
}

function InlineMenu() {
  const { data: items = [] } = useQuery(menu.queries.header());
  const { t } = useTranslation();
  const links = items.filter((item) => item.title).slice(0, INLINE_MENU_LINKS);
  if (!links.length) return null;

  return (
    <nav className="menu" aria-label={t('blocks.header.main_menu', 'Menu')}>
      {links.map((item) => (
        <Link key={item.id} to={item.url}>
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Account icon in the same style as search / cart (instead of Salla's avatar
 * component): guests get Salla's login modal, signed-in shoppers their account.
 */
function AccountButton() {
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={t('common.titles.account', 'Account')}
      onClick={() =>
        isLoggedIn ? navigate(ACCOUNT_PATH) : window.salla?.event?.dispatch('login::open')
      }
    >
      <IconUser />
    </button>
  );
}

interface TireHeaderProps {
  navOpen: boolean;
  onNavOpenChange: (open: boolean) => void;
}

/**
 * Header from the approved design (design/home.html): white sticky bar —
 * brand · menu · search / account / cart · gold "choose your size".
 * Styles: tires-home.scss `.th-header`. Below 960px the menu moves into the
 * slide-in drawer ({@link HeaderNav}) behind the burger.
 */
export function TireHeader({ navOpen, onNavOpenChange }: TireHeaderProps) {
  const { t } = useTranslation();
  const cartCount = useCartCount();

  return (
    // `<SallaSearch>` is a modal, but its SSR skeleton sits in the flow until
    // hydration — hide it so it doesn't paint a gray bar under the header.
    <header className="th-header [&_.s-skeleton-search]:hidden" suppressHydrationWarning>
      <HookSlot name="header:start" />

      <div className="announce">
        <div className="wrap">
          <span className="announce-msg">
            <i /> تركيب مجاني في مراكزنا بالرياض
            <em>· إطارات أصلية بضمان الوكيل · قسّطها مع تابي وتمارا</em>
          </span>
          <a className="announce-link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <IconWhatsapp /> <span dir="ltr">{STORE_CONTACT.phone}</span>
          </a>
        </div>
      </div>

      <div className="wrap nav">
        <button
          type="button"
          className="icon-btn burger"
          aria-label={t('blocks.header.main_menu', 'Menu')}
          aria-expanded={navOpen}
          onClick={() => onNavOpenChange(true)}
        >
          <IconMenu />
        </button>

        <BrandLockup />
        <InlineMenu />

        <div className="tools">
          <button
            type="button"
            className="icon-btn"
            aria-label={t('blocks.header.search', 'Search')}
            onClick={openSearch}
          >
            <IconSearch />
          </button>
          <AccountButton />
          <Link className="icon-btn cart" to="/cart" aria-label={t('blocks.header.cart', 'Cart')}>
            <IconBag />
            {cartCount > 0 && <i>{cartCount > 99 ? '99+' : cartCount}</i>}
          </Link>
          <Link className="btn btn-gold" to="/#size" style={{ height: 42, marginInlineStart: 8 }}>
            اختر مقاسك <IconArrow className="arrow" />
          </Link>
        </div>
      </div>

      <HeaderNav open={navOpen} onClose={() => onNavOpenChange(false)} />
      <SallaSearch suppressHydrationWarning />

      <HookSlot name="header:end" />
    </header>
  );
}
