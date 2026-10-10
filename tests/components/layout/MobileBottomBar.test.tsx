import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { MobileBottomBar } from '../../../app/components/layout/MobileBottomBar';

/** A logged-in `<salla-user-menu>` — the bar clicks `.s-user-menu-trigger-slot`,
 * which (like the real component's `open()`) toggles `.opened` on the toggler. */
function mountUserMenu({ opened = false }: { opened?: boolean } = {}) {
  const menu = document.createElement('salla-user-menu') as HTMLElement & { opened?: boolean };
  menu.className = 'header-action';
  const toggler = document.createElement('div');
  toggler.className = `s-user-menu-toggler${opened ? ' opened' : ''}`;
  const trigger = document.createElement('div');
  trigger.className = 's-user-menu-trigger-slot';
  trigger.addEventListener('click', () => toggler.classList.toggle('opened'));
  toggler.appendChild(trigger);
  menu.appendChild(toggler);
  document.body.appendChild(menu);
  Object.defineProperty(menu, 'opened', {
    get: () => toggler.classList.contains('opened'),
    set: (v: boolean) => toggler.classList.toggle('opened', !!v),
    configurable: true,
  });
  return menu;
}

function mountSearchModal({ visible = false }: { visible?: boolean } = {}) {
  const modal = document.createElement('salla-modal');
  modal.className = 's-search-modal';
  if (visible) modal.setAttribute('visible', '');
  document.body.appendChild(modal);
  return modal;
}

const route = { pathname: '/', locale: 'en' };

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ locale: route.locale }),
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname: route.pathname } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, ...rest }: Record<string, unknown>) => (
    <a href={String(to)} className={className as string} {...(rest as Record<string, unknown>)}>
      {children as React.ReactNode}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: route.locale,
    t: (key: string, fallback: string) => {
      const en: Record<string, string> = {
        'common.titles.home': 'Home',
        'common.titles.categories': 'Categories',
        'common.titles.account': 'Account',
        'blocks.header.cart': 'Cart',
        'blocks.header.search': 'Search',
        'blocks.header.main_menu': 'Menu',
      };
      return en[key] ?? fallback;
    },
  }),
}));

const twilight = { settings: {} as Record<string, unknown> };

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: twilight.settings } }),
  useNavigate: () => navigateMock,
}));

// Guest by default: the Account tab keeps opening the user-menu / login modal.
const navigateMock = vi.fn();
vi.mock('@salla.sa/twilight-theme-engine/hooks/useUser', () => ({
  useUser: () => ({ isLoggedIn: false }),
}));

beforeEach(() => {
  route.pathname = '/';
  route.locale = 'en';
  twilight.settings = {};
  delete (window as unknown as { salla?: unknown }).salla;
});

afterEach(() => {
  // Unmount first: the bar's `<body>` MutationObserver would otherwise fire on
  // the node removal below and call setState outside act().
  cleanup();
  document.querySelectorAll('salla-user-menu, salla-modal').forEach((el) => el.remove());
});

describe('MobileBottomBar', () => {
  const noop = () => {};

  it('renders the five tabs with their labels (the middle one is «My size» by default)', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByText('My size')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.queryByTestId('mobile-bottom-bar-search')).toBeNull();
  });

  it('«My size» leads to the size finder when no size is saved', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.getByTestId('mobile-bottom-bar-size').getAttribute('href')).toBe('/#size');
  });

  it('the middle button can be WhatsApp (needs a number) or removed', () => {
    twilight.settings = { tc_bottombar_items: 'whatsapp' };
    const { unmount } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-wa')).toBeNull(); // no number → no button
    unmount();

    twilight.settings = { tc_bottombar_items: 'whatsapp', tc_wa_number: '0551234567' };
    const withNumber = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.getByTestId('mobile-bottom-bar-wa').getAttribute('href')).toBe('https://wa.me/966551234567');
    withNumber.unmount();

    twilight.settings = { tc_bottombar_items: 'basic' };
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-size')).toBeNull();
    expect(screen.queryByTestId('mobile-bottom-bar-wa')).toBeNull();
  });

  it('renders nothing when the merchant switches the bottom bar off', () => {
    twilight.settings = { tc_bottombar: false };
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(container.querySelector('.mobile-bottom-bar')).toBeNull();
  });

  it('points the route tabs at their in-app paths', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('href')).toBe('/');
    expect(screen.getByTestId('mobile-bottom-bar-cart').getAttribute('href')).toBe('/cart');
    // account is a button (opens the header user-menu), not a link
    expect(screen.getByTestId('mobile-bottom-bar-account').tagName).toBe('BUTTON');
  });

  it('opens the header user-menu when the Account tab is tapped', async () => {
    const menu = mountUserMenu();

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));
      // `openUserMenu` clicks the trigger on the next frame; the trailing
      // macrotask lets the bar's MutationObserver microtask drain inside act.
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    });

    expect(menu.opened).toBe(true);
  });

  it('sends guests (no menu toggler) to the login modal from the Account tab', () => {
    const dispatch = vi.fn();
    (window as unknown as { salla: unknown }).salla = { event: { dispatch } };
    const menu = document.createElement('salla-user-menu');
    menu.className = 'header-action'; // guest render: login button, no `.s-user-menu-toggler`
    document.body.appendChild(menu);

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));

    expect(dispatch).toHaveBeenCalledWith('login::open');
  });

  it('lights the Account tab while the user-menu sheet is open', () => {
    mountUserMenu({ opened: true });

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-account').className).toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('dismisses the drawer and the user-menu sheet when a route tab is tapped', async () => {
    const menu = mountUserMenu({ opened: true });
    const onCloseNav = vi.fn();

    render(<MobileBottomBar navOpen onOpenNav={noop} onCloseNav={onCloseNav} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-home'));
    });

    expect(onCloseNav).toHaveBeenCalledTimes(1);
    expect(menu.opened).toBe(false);
  });

  it('closes the search modal when a route tab is tapped', async () => {
    const modal = mountSearchModal({ visible: true });

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} onCloseNav={noop} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-home'));
    });

    expect(modal.hasAttribute('visible')).toBe(false);
  });

  it('renders on the product detail page with no tab lit (no tab owns it)', () => {
    route.pathname = '/ar/blue-hoodie/p4821';
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(container.querySelector('.mobile-bottom-bar')).not.toBeNull();
    for (const id of ['home', 'categories', 'cart', 'account']) {
      expect(screen.getByTestId(`mobile-bottom-bar-${id}`).className).not.toContain('is-active');
    }
  });

  it('still renders on a category / listing page', () => {
    route.pathname = '/ar/mens/c17';
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home')).toBeTruthy();
  });

  it('lights the home tab only on the home page, nothing on pages no tab owns', () => {
    const { rerender } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const home = screen.getByTestId('mobile-bottom-bar-home');
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.className).toContain('is-active');

    // A listing / blog page — no tab owns it, so the bar shows nothing lit.
    route.pathname = '/ar/blog/my-post/a-99';
    rerender(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('aria-current')).toBeNull();
    for (const id of ['categories', 'cart', 'account']) {
      expect(screen.getByTestId(`mobile-bottom-bar-${id}`).className).not.toContain('is-active');
    }
  });

  it('lights the cart tab on the cart route, locale prefix and all', () => {
    route.pathname = '/ar/cart';

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-cart').getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('aria-current')).toBeNull();
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('lights the account tab anywhere under /account (e.g. /ar/account/profile)', () => {
    route.pathname = '/ar/account/profile';

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const account = screen.getByTestId('mobile-bottom-bar-account');
    expect(account.className).toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('opens the shared nav drawer when the Categories tab is tapped', () => {
    const onOpenNav = vi.fn();
    render(<MobileBottomBar navOpen={false} onOpenNav={onOpenNav} />);

    fireEvent.click(screen.getByTestId('mobile-bottom-bar-categories'));

    expect(onOpenNav).toHaveBeenCalledTimes(1);
  });

  it('moves the pill onto Categories while the drawer is open, dropping the route tab', () => {
    render(<MobileBottomBar navOpen onOpenNav={noop} />);

    const categories = screen.getByTestId('mobile-bottom-bar-categories');
    expect(categories.className).toContain('is-active');
    expect(categories.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('hides the cart badge with an empty cart and shows the stored count', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-cart-count')).toBeNull();

    (window as unknown as { salla: unknown }).salla = {
      storage: { get: (key: string, fb: unknown) => (key === 'cart.summary.count' ? 3 : fb) },
      event: { on: vi.fn(), off: vi.fn() },
    };
    // The bar re-reads storage when the SDK signals it is ready.
    act(() => {
      document.dispatchEvent(new Event('theme::ready'));
    });

    expect(screen.getByTestId('mobile-bottom-bar-cart-count').textContent).toBe('3');
  });

  it('updates the badge from cart::updated events', () => {
    let onUpdated: ((summary?: { count?: number }) => void) | undefined;
    (window as unknown as { salla: unknown }).salla = {
      storage: { get: (_k: string, fb: unknown) => fb },
      event: {
        on: (event: string, cb: (summary?: { count?: number }) => void) => {
          if (event === 'cart::updated') onUpdated = cb;
        },
        off: vi.fn(),
      },
    };

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-cart-count')).toBeNull();

    act(() => {
      onUpdated?.({ count: 5 });
    });

    expect(screen.getByTestId('mobile-bottom-bar-cart-count').textContent).toBe('5');
  });

  it('adds the flush-on-product modifier by default (product_bottom_nav_rounded unset)', () => {
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(
      container.querySelector('.mobile-bottom-bar.mobile-bottom-bar--flush-on-product')
    ).toBeTruthy();
  });

  it('omits the flush-on-product modifier when product_bottom_nav_rounded is enabled', () => {
    twilight.settings = { product_bottom_nav_rounded: true };
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(container.querySelector('.mobile-bottom-bar--flush-on-product')).toBeNull();
    expect(container.querySelector('.mobile-bottom-bar')).toBeTruthy();
  });
});
