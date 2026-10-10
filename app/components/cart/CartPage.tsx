import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SallaConditionalOffer } from '@salla.sa/twilight-components-react/conditional-offer';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { HookSlot, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { CartSummary, SeoCartWidget } from '@salla.sa/twilight-theme-engine/cart';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { loyalty } from '@salla.sa/twilight-theme-engine/api/loyalty';
import { cart } from '@salla.sa/twilight-theme-engine/api/cart';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { CartItem } from './CartItem';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { TcAppointment, TcFreeShip, TcSetHint, cartSubtotal, useCartSettings, useCartT } from '../tires/cart/TcCartParts';
import { asBool } from '../home/fields';

/**
 * Theme fork of the engine `CartPage`.
 *
 * Same data flow as upstream, plus a column-heading row above the items
 * (Products (N) · Quantity · Total) so the flat {@link CartItem} rows read as a
 * table. Kept in sync with the engine on upgrades.
 */
function CartPageContent({ page }: CartPageProps) {
  const { store } = useTwilight();
  const cs = useCartSettings();
  const ct = useCartT();
  const queryClient = useQueryClient();
  // Seed `salla.config.page` on first load. The engine only sets it from a
  // `router.subscribe('onLoad')` handler (SPA navigations), so a direct load of
  // /cart leaves `page.slug` unset, `salla.url.is_page('cart')` is false and
  // `<salla-product-options>` skips the cart-only behaviour: the item's selected
  // option (e.g. the country / digital-card pills) is never pre-checked.
  usePageConfig(page);
  const { data: loyaltyPoints } = useQuery(loyalty.queries.points());

  const idQuery = useQuery(cart.queries.currentId());
  const cartId = idQuery.data;

  const detailQuery = useQuery({
    ...cart.queries.detail(cartId!),
    enabled: !!cartId,
  });
  const cartData = detailQuery.data;

  // Refetch after a row mutates its quantity / gets deleted — the SDK doesn't
  // push cart changes back into React, so item totals and the summary would
  // otherwise stay stale until a page reload.
  const refetchCart = useCallback(() => {
    if (cartId != null) {
      queryClient.invalidateQueries({ queryKey: cart.queries.detail(cartId).queryKey });
    }
  }, [cartId, queryClient]);

  // Belt-and-suspenders: also refetch on any SDK cart event that does fire.
  // Root on/off: onUpdated registers a wrapper that only offUpdated can remove.
  useEffect(() => {
    window.salla?.event?.on?.('cart::updated', refetchCart);
    return () => {
      window.salla?.event?.off?.('cart::updated', refetchCart);
    };
  }, [refetchCart]);

  // pending = still fetching; a resolved `null` id (no cart yet) and a failed request are NOT loading
  if (idQuery.isPending || (!!cartId && detailQuery.isPending)) {
    return <CartSkeleton />;
  }

  if (idQuery.isError || detailQuery.isError) {
    return (
      <div className="tc-s tc-page tc-cart">
        <section className="wrap ptop-sec">
          <Breadcrumb page={page} />
          <h1 className="ph1">{ct(cs.tc_cart_title, 'سلة المشتريات')}</h1>
        </section>
        <section className="wrap">
          <div className="empty tc-cart-empty" role="alert">
            <h3>{ct(undefined, 'تعذّر تحميل السلة')}</h3>
            <button type="button" className="btn btn-gold" onClick={() => { void idQuery.refetch(); if (cartId) void detailQuery.refetch(); }}>{ct(undefined, 'حاول مرة ثانية')}</button>
          </div>
        </section>
      </div>
    );
  }

  // No cart yet (null id), or it was already turned into an order: shown empty like Twig.
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="tc-s tc-page tc-cart">
        <section className="wrap ptop-sec">
          <Breadcrumb page={page} />
          <h1 className="ph1">{ct(cs.tc_cart_title, 'سلة المشتريات')}</h1>
        </section>
        <section className="wrap">
          <div className="empty tc-cart-empty">
            <h3>{ct(cs.tc_cart_empty_title, 'سلتك فاضية.')}</h3>
            <p>{ct(cs.tc_cart_empty_text, 'اختر مقاسك ونطلع لك الإطارات المناسبة.')}</p>
            <Link className="btn btn-gold" to="/#size">{ct(undefined, 'تسوّق الإطارات')} <span aria-hidden="true">←</span></Link>
          </div>
        </section>
      </div>
    );
  }

  const tires = cartData.items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const currency = (cartData as unknown as { currency?: string }).currency;

  return (
    <div className="tc-s tc-page tc-cart">
      {/* Analytics — no visible UI, fires GTM checkout events */}
      <SeoCartWidget cart={cartData} />

      {/* design/store/cart.html — .ptop-sec, then .cartg (items | summary) */}
      <section className="wrap ptop-sec">
        <Breadcrumb page={page} />
        <h1 className="ph1">{ct(cs.tc_cart_title, 'سلة المشتريات')}</h1>
      </section>

      <div className="wrap"><SallaConditionalOffer /></div>
      <HookSlot name="cart:start" />

      <section className="wrap cartg">
        <div className="tc-cart-items">
          <HookSlot name="cart:items.start" context={{ cartItems: cartData.items }} />

          <TcSetHint tires={tires} />

          {cartData.items.map((item, index) => (
            <CartItem key={item.id} item={item} isFirst={index === 0} onMutated={refetchCart} />
          ))}

          {cartData.options?.length > 0 && (
            <div className="cart-options">
              {cartData.options.map((option) => (
                <form
                  key={option.id}
                  className="first:pt-5 relative"
                  onChange={(e) => window.salla?.form.onChange('cart.updateItem', e)}
                  id={`item-${option.id}`}
                >
                  <input type="hidden" name="id" value={option.id} />
                  <input type="hidden" name="quantity" value={option.quantity} />
                  {option.options && option.options.length > 0 && (
                    // Raw element, like CartItem: the wrapper sets `options` too late and it renders empty.
                    <salla-product-options
                      key={JSON.stringify(option.options)}
                      options={JSON.stringify(option.options)}
                      product-id={option.id}
                    />
                  )}
                </form>
              ))}
            </div>
          )}

          <TcAppointment items={cartData.items.map(i => ({ name: (i as { product_name?: string; name?: string }).product_name ?? (i as { name?: string }).name, quantity: i.quantity }))} />

          <SallaOffer />
          <HookSlot name="cart:items.end" />
        </div>

        <aside className="tc-cart-side">
          <TcFreeShip subtotal={cartSubtotal(cartData as unknown as Record<string, unknown>)} currency={currency} />
          {/* Salla's summary: coupon, loyalty, gift, totals and the checkout button */}
          <div className="box tc-cart-sum">
            <CartSummary
              cart={cartData}
              applyCouponEnabled={store.settings?.cart?.apply_coupon_enabled}
              taxAmount={cartData.tax_amount}
              key={cartData.id}
              loyalty={cartData.loyalty}
              gift={cartData.gift}
              loyaltyPoints={loyaltyPoints ?? undefined}
            />
            {asBool(cs.tc_cart_secure, true) && (
              <p className="secure">{ct(cs.tc_cart_secure_text, 'دفع آمن عبر سلة · مدى · Apple Pay · تابي · تمارا')}</p>
            )}
          </div>
        </aside>
      </section>

      <HookSlot name="cart:end" />
    </div>
  );
}

export function CartPage(props: CartPageProps) {
  return <CartPageContent {...props} />;
}
