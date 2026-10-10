import { Fragment, useEffect, useMemo, useState } from 'react';
import { SallaQuickOrder } from '@salla.sa/twilight-components-react/quick-order';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { HookSlot, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { Breadcrumb, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { PageBlocks } from '@salla.sa/twilight-theme-engine/home';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { ProductGallery } from './ProductGallery';
import { ProductDetails } from './ProductDetails';
import { AddToCartForm } from './AddToCartForm';
import { BlockHookSlot } from '../common/BlockHookSlot';
import { ProductsSlider } from '../home/ProductsSlider';
import { TcDelivery, TcFav, TcProductFaq, TcProductHead, TcSpecs, TcTrust } from '../tires/product/TcProductParts';
import { asBool, makeT, opt, useLang } from '../home/fields';
import { useCurrency } from '../home/tc/useCurrency';
import { WarrantyLine } from '../tires/features/Warranty';
import { TireQuantityPicker } from '../tires/TireQuantityPicker';

/**
 * "Similar products" slider. A separate component (not inline in
 * `ProductPage`) so `relatedCount` lives *inside* the product's keyed
 * `<Fragment>` and resets for free on every product → product navigation,
 * instead of needing a `useEffect` to reset it by hand.
 */
function RelatedProducts({ productId, title }: { productId: number; title: string }) {
  // `null` until the related-products list resolves; `0` once we know there are
  // none — then the lazy `<section>` / `.container` wrapper is dropped entirely
  // rather than left empty in the DOM.
  const [relatedCount, setRelatedCount] = useState<number | null>(null);

  return (
    <>
      <HookSlot name="product:related.start" />
      {/* Dropped once we know there are no related products, so no empty
          `<section>` / `.container` is left behind. `estimatedHeight="0"`: until
          then, don't reserve 400px for a block that may render nothing. */}
      {relatedCount !== 0 && (
        <RenderWhenVisible estimatedHeight="0px">
          <div className="container">
            <ProductsSlider
              data={{
                products: { source: 'related', source_value: productId },
                title,
                display_all_url: '',
              }}
              onResolve={setRelatedCount}
            />
          </div>
        </RenderWhenVisible>
      )}
      <HookSlot name="product:related.end" />
    </>
  );
}

/**
 * Theme fork of the engine `ProductPage` (wired in from
 * `app/routes/$slug.p$id.tsx`).
 *
 * Same structure as upstream, but renders the theme's flat-markup
 * {@link ProductDetails} / {@link AddToCartForm} and the theme's scroll-carousel
 * {@link ProductsSlider} for the "similar products" block (matching the homepage
 * product cards). The engine's bottom store-wide testimonials block is dropped —
 * `<SallaComments>` already covers product reviews on this page.
 */
export function ProductPage({ product: initialProduct, page }: ProductPageProps) {
  const { theme, store } = useTwilight();
  const { t } = useTranslation();
  const { product } = useProduct(initialProduct);
  const { commentsKey } = useComments();
  const blockScope = useMemo(() => ({ product_id: product.id }), [product.id]);
  const lang = useLang();
  const ts = (theme?.settings ?? {}) as Record<string, unknown>;
  const cur = useCurrency();

  // Seed `salla.config.page` on first load. The engine only sets it from a
  // `router.subscribe('onLoad')` handler, which fires on SPA navigations but not
  // on the initial SSR load — leaving `page.slug` unset, so `salla.url.is_page`
  // ('product.single') is false and the SDK skips `<salla-reviews-summary>` (plus
  // the delivery-promise / loyalty / cashback auto-components). The keyed
  // `<Fragment>` remounts this per product, so it re-runs on product → product.
  usePageConfig(page);

  // The Twig storefront bootstraps `salla.config` with `user.can_comment`; the
  // React SDK init doesn't, so it's `null` and `<salla-comment-form>` (and the
  // `<salla-comments>` container gate) render empty even for eligible buyers.
  // The engine *does* expose the same flag as `store.settings.product
  // .user_can_comment` — copy it across before the lazy comments block mounts.
  useEffect(() => {
    const salla = window.salla;
    if (!salla?.config?.set) return;
    if (salla.config.get('user.can_comment') != null) return;
    const canComment = salla.config.get('store.settings.product.user_can_comment');
    if (typeof canComment !== 'boolean') return;
    salla.config.set('user', { ...(salla.config.get('user') || {}), can_comment: canComment });
  }, []);

  // The engine breadcrumb replaces the product's category crumb with the page
  // you came from (a stored "referrer"). Drop it — synchronously, before
  // `<Breadcrumb>` mounts and reads it — so the real Home › Category › Product
  // trail shows. Guarded: `window` doesn't exist during SSR.
  useState(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage?.removeItem('breadcrumb-referrer');
    } catch {
      /* sessionStorage unavailable (private mode) */
    }
  });

  return (
    // Keyed Fragment (not a wrapper <div>): remounts the whole subtree on a
    // product → product navigation so gallery / form state resets, without
    // adding a node between `#main-content` and the page's sections.
    <Fragment key={product.id}>
      {/* App-block hook `product.single.before_product_info` — above the gallery / info grid */}
      <BlockHookSlot
        name="product.single.before_product_info"
        wrapper="s-before-product-info"
        className="!mt-0"
        scope={blockScope}
      />

      {/* design/store/product.html — .ptop-sec (breadcrumb) + .pd (gallery | .pinfo buy box) */}
      <div className="tc-s tc-page tc-product">
        <section className="wrap ptop-sec">
          {theme?.settings?.product_show_breadcrumbs !== false && <Breadcrumb page={page} />}
        </section>

        <HookSlot name="product:start" />

        <section className="wrap pd" id={`product-${product.id}`}>
          <div className="tc-gallery">
            <ProductGallery product={product} />
          </div>

          <div className="pinfo" id="buybox">
            <HookSlot name="product:details.start" />
            <TcProductHead product={product} />
            <TcTrust />
            {asBool(ts.tc_p_qty, true) && !product.is_out_of_stock && !product.is_hidden_quantity && (
              <TireQuantityPicker
                productId={product.id}
                unit={opt(ts.tc_sale_unit, 'tire') === 'set' ? 'set' : 'tire'}
                unitPrice={product.is_on_sale ? Number(product.sale_price) : Number(product.starting_price || product.price)}
                currency={cur(product.currency as string | undefined)}
                lang={lang}
              />
            )}
            <TcDelivery product={product} />
            <HookSlot name="product:single.form.start" />
            <AddToCartForm product={product} stickyAddToCart={theme.settings.sticky_add_to_cart} />
            <HookSlot name="product:single.form.end" />
            <TcFav productId={product.id} />
            <WarrantyLine />
            <SallaQuickOrder className="mt-5 block" />
            <HookSlot name="product:details.end" />
          </div>
        </section>

        {/* description, tags and Salla metadata — the merchant's own text */}
        <section className="wrap pblk tc-pdesc">
          <HookSlot name="product:single.description.start" />
          <ProductDetails product={initialProduct} sku={product.sku} barcode={product.barcode} showTags={theme.settings.show_tags} headless />
          <HookSlot name="product:single.description" />
          <HookSlot name="product:single.description.end" />
          {/* Twig renders this hook's merchant blocks after the form */}
          <PageBlocks hook="product:single.description.end" scope={blockScope} />
        </section>

        <TcSpecs product={product} />
        <div className="wrap"><SallaOffer /></div>
      </div>

      {/* App-block hook `product.single.before_customer_reviews` — between the info and the reviews */}
      <BlockHookSlot
        name="product.single.before_customer_reviews"
        wrapper="s-before-reviews"
        scope={blockScope}
      />

      {store.settings?.rating?.show_on_product && (
        // `estimatedHeight="0"`: `RenderWhenVisible` hard-codes `min-height` on its
        // wrapper section and never clears it, so the default 400px leaves an empty
        // gap when the product has no reviews. Comments size themselves once present.
        <div className="tc-s tc-page">
          <section className="wrap pblk" id="prev">
            <RenderWhenVisible estimatedHeight="0px">
              <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
            </RenderWhenVisible>
          </section>
        </div>
      )}

      {/* App-block hook `product.single.before_product_recommendations` — between the reviews and related */}
      <BlockHookSlot
        name="product.single.before_product_recommendations"
        wrapper="s-before-related"
        scope={blockScope}
      />

      <div className="tc-s tc-page"><TcProductFaq /></div>

      {asBool(ts.tc_p_related, true) && (
        <RelatedProducts productId={product.id} title={makeT(lang, { 'إطارات مشابهة': 'Similar tires' })(ts.tc_p_related_title, 'إطارات مشابهة') || t('pages.products.similar_products')} />
      )}

      {/* App-block hook `product.single.after_product_recommendations` — end of the product page */}
      <BlockHookSlot
        name="product.single.after_product_recommendations"
        wrapper="s-after-related"
        scope={blockScope}
      />

      <HookSlot name="product:end" />
    </Fragment>
  );
}
