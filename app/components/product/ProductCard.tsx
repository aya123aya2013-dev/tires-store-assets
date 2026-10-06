import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import { ProductCard as EngineProductCard } from '@salla.sa/twilight-theme-engine/product';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useCardSettings } from '../tires/features/cardSettings';
import { useLang } from '../home/fields';

type ProductCardProps = ComponentProps<typeof EngineProductCard>;

/**
 * Thin wrapper over the engine `ProductCard`.
 *
 * After mount (and whenever the lazily-hydrated bits appear):
 *  - marks a vertical card with `is-theme-card`, sets `display: none` inline
 *    on the engine's own image-corner wishlist button (a plain style mutation
 *    on an existing node — safe, unlike moving it; see below), and portals a
 *    theme-owned wishlist button into `.s-product-card-content-footer`
 *    instead. Hiding it inline rather than through `04-components/product.scss`
 *    keeps this component correct on its own — that stylesheet's `is-theme-card`
 *    rule still applies too once it lands, redundantly.
 *  - The engine's button is a React-owned node; physically moving it there
 *    with `appendChild` (the previous approach) left React still tracking it
 *    as a child of the image container, so on unmount (e.g. navigating away)
 *    React tried to `removeChild` it from a parent it was no longer inside,
 *    throwing `NotFoundError`. A portal keeps this button fully React-managed
 *    at its real DOM location instead.
 *  - sets `loader-position="center"` on the add-to-cart button (grid + list).
 * Styling: `04-components/product.scss`.
 */
export function ProductCard(props: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // theme settings «بطاقة المنتج» apply here too (category / search / offers pages)
  const card = useCardSettings();
  const askUrl = card.askUrl ? card.askUrl(props.product.name) : null;
  const hideAdd = !card.add || !!askUrl;
  const askLabel = useLang() === 'en' ? 'Ask for price' : 'اطلب السعر';
  const [footerEl, setFooterEl] = useState<HTMLElement | null>(null);
  const isVertical = !!footerEl?.closest('.s-product-card-vertical');

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const sync = () => {
      root.querySelectorAll<HTMLElement>('salla-add-product-button').forEach((el) => {
        el.style.display = hideAdd ? 'none' : '';
        // engine ships the card button fill="outline"; make it solid + centre its spinner
        el.setAttribute('fill', 'solid');
        el.setAttribute('loader-position', 'center');
      });

      // «اطلب السعر» / wishlist policy applies to every layout (grid AND list view — S3b-2)
      const anyCard = root.querySelector<HTMLElement>('.s-product-card-vertical, .s-product-card-horizontal, .s-product-card-full-image, .s-product-card-minimal');
      if (anyCard) {
        anyCard.querySelectorAll<HTMLElement>('.s-product-card-price, .s-product-card-sale-price, .s-product-card-starting-price').forEach((el) => {
          el.style.display = askUrl ? 'none' : '';
        });
        if (!card.fav) {
          anyCard.querySelectorAll<HTMLElement>('.s-product-card-wishlist-btn').forEach((el) => { el.style.display = 'none'; });
        }
      }

      const vertical = root.querySelector<HTMLElement>('.s-product-card-vertical');
      // other layouts: the ask link goes in their content footer (the engine keeps its own wishlist)
      if (!vertical) {
        setFooterEl(anyCard?.querySelector<HTMLElement>('.s-product-card-content-footer, .s-product-card-content-sub') ?? null);
        return;
      }

      vertical.classList.add('is-theme-card');

      const originalWishlistBtn = vertical.querySelector<HTMLElement>(
        '.s-product-card-image .s-product-card-wishlist-btn'
      );
      if (originalWishlistBtn) originalWishlistBtn.style.display = 'none';

      setFooterEl(vertical.querySelector<HTMLElement>('.s-product-card-content-footer'));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hideAdd, askUrl, card.fav]);

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      <EngineProductCard {...props} />
      {footerEl && card.fav && isVertical && createPortal(<FooterWishlistButton productId={props.product.id} />, footerEl)}
      {footerEl && askUrl && createPortal(<a className="tc-ask-engine" href={askUrl} target="_blank" rel="noopener noreferrer">{askLabel}</a>, footerEl)}
    </div>
  );
}

/** Same button the engine renders for `horizontal`/`fullImage` layouts
 * (`ProductCardContent`, theme-engine) — reused here for `vertical`, which
 * the engine only ever places in the image corner. */
function FooterWishlistButton({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const inWishlist = wishlist.has(productId);

  return (
    <SallaButton
      shape="icon"
      fill="outline"
      color="light"
      ariaLabel={t('pages.wishlist.toggle', 'Add or remove to wishlist')}
      className={`s-product-card-wishlist-btn animated ${inWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}`}
      onClick={() => wishlist.toggle(productId)}
      data-id={productId}
    >
      <i className="sicon-heart" />
    </SallaButton>
  );
}
