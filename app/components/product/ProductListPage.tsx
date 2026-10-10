import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNavigate, useLocation, useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { sortOptions, onSallaEvent } from '@salla.sa/twilight-theme-engine/utils';
import {
  Breadcrumb,
  NoContent,
  ProductCardSkeleton,
  Image,
  RenderWhenVisible,
} from '@salla.sa/twilight-theme-engine/common';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import {
  ItemsList,
  ReviewItemSkeleton,
  type ItemsLoaderFn,
} from '@salla.sa/twilight-components-react';
import { Testimonials } from '@salla.sa/twilight-theme-engine/home';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from './ProductCard';
import { useAppliedFilters } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListFilters } from '@salla.sa/twilight-theme-engine/api/product';
import { BlockHookSlot } from '../common/BlockHookSlot';
import { TcFbar, TcNoFind, useListSettings, useListT } from '../tires/listing/TcListParts';
import { formatTireSize } from '../tires/sizes';
import type { TireSize } from '../tires/sizes';
import { asBool } from '../home/fields';
import { BottomSheet } from '../common/BottomSheet';
import { FilterHorizontalIcon } from '../icons';

type View = 'grid' | 'list';

/** `wideGrid`: full-width lists with no filter column (e.g. offers) render 5 grid columns on desktop. */
/** `keep`: optional exact-match filter (e.g. the tire size search) applied to every loaded page. */
/** `size`: a tire-size search — the size becomes the title and «ما لقيت مقاسك؟» shows under the list. */
type ProductListPageProps = ProductListLoaderData & { wideGrid?: boolean; keep?: (product: Product) => boolean; size?: TireSize | null };

/** `ItemsList`'s `loader` for infinite scroll — the route already loaded the
 * first page, so this fetches subsequent ones from `pagination.next`, a full
 * URL the API hands back. `next` can be an opaque URL param rather than a bare
 * cursor value, so pull just the `cursor` query param back out of it. */
function useCatalogLoader(
  source: ProductListPageProps['source'],
  selectedSort: string,
  next: string | null | undefined,
  filters: ProductListFilters | null,
  keep?: (product: Product) => boolean
): ItemsLoaderFn<Product> {
  const nextCursorRef = useRef<string | null>(next ?? null);
  useEffect(() => {
    nextCursorRef.current = next ?? null;
  }, [next]);

  return useCallback(async () => {
    const fetchPage = async () => {
      const nextUrl = nextCursorRef.current;
      const cursorMatch = nextUrl?.match(/[?&]cursor=([^&]+)/);
      const cursor = cursorMatch ? decodeURIComponent(cursorMatch[1]) : (nextUrl ?? undefined);
      const result = await product.list({
        source: source.type,
        sourceValue: source.value,
        ...(cursor && { cursor }),
        sort: selectedSort,
        ...(filters && { filterable: true, filters }),
      });
      nextCursorRef.current = result.next;
      return result;
    };
    let result = await fetchPage();
    if (!keep) return result;
    // Exact-match mode: a page with no match must not end the list while more
    // pages exist — keep reading until something matches or the catalog ends.
    let items = result.items.filter(keep);
    for (let guard = 0; !items.length && result.next && guard < 30; guard++) {
      result = await fetchPage();
      items = result.items.filter(keep);
    }
    return { ...result, items };
  }, [source.type, source.value, selectedSort, filters, keep]);
}

type BrandEntity = { name: string; banner?: string; logo?: string; description?: string };

/** Banner + logo + description above the listing, for a `/brands/{id}` page. Renders
 * nothing for any other source type. */
function BrandHeader({ source }: { source: ProductListPageProps['source'] }) {
  if (source.type !== 'brands') return null;
  const brand = source.entity as BrandEntity | undefined;
  if (!brand) return null;

  return (
    <>
      <Image
        width={1200}
        height={300}
        className="w-full max-h-[300px] object-cover rounded-md bg-gray-100"
        src={brand.banner || undefined}
        alt={brand.name}
        priority
      />
      <header className="flex flex-col md:flex-row items-center md:items-start text-center rtl:md:text-right ltr:md:text-left mt-2 mb-8">
        <Image
          className="rounded-md w-40 h-24 object-contain shadow-md p-4 bg-white shrink-0"
          src={brand.logo || undefined}
          alt={brand.name}
          aspectRatio="5/3"
        />
        <div className="px-5 pt-3 rtl:text-right">
          <h1 className="text-2xl font-bold mb-1">{brand.name}</h1>
          {brand.description && (
            <p
              className="text-base text-gray-500 font-medium"
              dangerouslySetInnerHTML={{ __html: brand.description }}
            />
          )}
        </div>
      </header>
    </>
  );
}

/** The desktop filter column (when visible) + the product grid/list itself. */
function CatalogGrid({
  filtersVisible,
  filters,
  listKey,
  selectedSort,
  view,
  products,
  pagination,
  loader,
  listLayoutClass,
  wideGridClass,
  filterStatus,
  onRetry,
}: {
  filterStatus: 'idle' | 'loading' | 'ready' | 'error';
  onRetry: () => void;
  filtersVisible: boolean;
  filters: ProductListPageProps['filters'];
  listKey: string;
  selectedSort: string;
  view: View;
  products: Product[];
  pagination: ProductListPageProps['pagination'];
  loader: ItemsLoaderFn<Product>;
  listLayoutClass: string;
  wideGridClass: string;
}) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className={filtersVisible ? 'cat-wrap' : 'cat-wrap tc-nofacets'}>
      {filtersVisible && (
        <aside className="facets tc-facets">
          <SallaFilters id="filters-menu" filters={filters as never} />
        </aside>
      )}

      <div className="min-w-0">
        <HookSlot name="product:list.items.start" />
        {/* legacy name for the same point */}
        <HookSlot name="product:index.items.start" />

        <div
          className={`flex min-h-screen${filterStatus === 'loading' ? ' opacity-60' : ''}`}
          aria-busy={filterStatus === 'loading'}
        >
          {filterStatus === 'error' ? (
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <NoContent
                icon="sicon-shopping-bag"
                message={t('common.errors.error_occurred', 'Something went wrong')}
              />
              <button
                type="button"
                data-testid="store-catalog-filters-retry"
                className="link--primary mt-4"
                onClick={onRetry}
              >
                {t('common.elements.try_again', 'Try again')}
              </button>
            </div>
          ) : (
            <ItemsList<Product>
              key={`${listKey}-${selectedSort}-${view}`}
              resetKey={`${listKey}-${selectedSort}-${view}`}
              items={products}
              loader={loader}
              mode={pagination?.next ? 'infinite' : 'static'}
              pageUrl={location.pathname + location.searchStr}
              className="s-products-list flex-1 min-w-0"
              itemsClassName={`s-products-list-wrapper ${listLayoutClass}${filtersVisible ? ' s-products-list-with-filters' : ''}${wideGridClass} tc-cols-set`}
              skeleton={<ProductCardSkeleton />}
              skeletonType="item"
              skeletonCount={12}
              empty={
                <NoContent
                  icon="sicon-shopping-bag"
                  message={t('pages.categories.no_products', 'No products found in this category')}
                />
              }
              t={(key, fallback) => t(key, fallback || key)}
            >
              {(items) =>
                items.map((prod, idx) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    index={idx}
                    layout={view === 'list' ? 'horizontal' : 'vertical'}
                  />
                ))
              }
            </ItemsList>
          )}
        </div>

        {/* legacy name for the same point */}
        <HookSlot name="product:index.items.end" />
        <HookSlot name="product:list.items.end" />
      </div>
    </div>
  );
}

/** The store-reviews block below the listing — categories only, and only when
 * the merchant has enabled it. */
function CategoryTestimonials({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    // `estimatedHeight="0"`: `RenderWhenVisible` hard-codes `min-height` on
    // its wrapper and never clears it, so an empty `salla-reviews` (no
    // category reviews) reserves 400px. It's collapsed by CSS when empty.
    <RenderWhenVisible estimatedHeight="0px" placeholder={<ReviewItemSkeleton />}>
      <Testimonials data={{}} />
    </RenderWhenVisible>
  );
}

/**
 * Theme fork of the engine `ProductListPage` (wired in from
 * `app/routes/product-list.tsx` for the category route).
 *
 * Same data flow as upstream; the toolbar is rebuilt as a pill with a product
 * count, a grid / list view switch and a styled sort control, plus a desktop
 * "hide filters" toggle that collapses the filter column. View + collapse state
 * persist in `localStorage`. Kept in sync with the engine on upgrades.
 */

export function ProductListPage({
  page,
  source,
  query,
  products,
  pagination,
  filters,
  wideGrid = false,
  keep,
  size,
}: ProductListPageProps) {
  const { t } = useTranslation();
  const store = useStore();
  const { theme } = useTwilight();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedSort = query.sort;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const ls = useListSettings();
  const lt = useListT();
  // the design has one card layout; the view switch is gone
  const view = 'grid' as View;

  // Salla's filters (type, brand, price, year… whatever the merchant set up), as the design's
  // `.facets` column; the merchant can switch the column off from «التصنيف والبحث»
  const showFilters = !!(query.filters && store?.settings?.product?.filters) && asBool(ls.tc_list_facets, true);
  const filtersVisible = showFilters;

  // The selection made in `<salla-filters>` — re-queries the list (the route's
  // loader output was fetched without it).
  const {
    filters: appliedFilters,
    page: filteredPage,
    lastPage,
    status: filterStatus,
    retry: retryFilters,
  } = useAppliedFilters(source, selectedSort, showFilters);
  // While a new selection loads, the previous page stays up (dimmed, `aria-busy`); if the
  // request fails nothing stale passes for the new selection. Infinite scroll is only live
  // for the loader's own page or a fully loaded filtered one.
  const shownPage = filterStatus === 'ready' ? filteredPage : lastPage;
  const loadedProducts =
    filterStatus === 'error'
      ? []
      : filterStatus === 'idle'
        ? products
        : (shownPage?.items ?? products);
  const shownProducts = keep ? loadedProducts.filter(keep) : loadedProducts;
  const shownNext =
    filterStatus === 'idle'
      ? pagination?.next
      : filterStatus === 'ready'
        ? filteredPage?.next
        : null;
  const filteredKey =
    filterStatus === 'idle'
      ? ''
      : `${filterStatus}${filterStatus === 'ready' ? JSON.stringify(appliedFilters) : ''}`;

  const isBrand = source.type === 'brands';

  const sortOptionsWithTrans = useMemo(() => sortOptions(selectedSort, t), [selectedSort, t]);
  const currentSortLabel =
    sortOptionsWithTrans.find((o) => o.id === selectedSort)?.name ?? sortOptionsWithTrans[0]?.name;

  useEffect(() => {
    const handleFiltersChanged = () => setFiltersOpen(false);
    return onSallaEvent('salla-filters::changed', handleFiltersChanged);
  }, []);

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      // `location.pathname` (not `window.location.pathname`) — the router
      // already strips the store's username/locale base off it and re-adds
      // its own when navigating, so passing the raw browser path here
      // doubles it up (`/store/ar/store/ar/...`) and 404s.
      const params = new URLSearchParams(location.searchStr);
      params.set('sort', event.target.value);
      params.delete('page');
      const search = params.toString();
      navigate(location.pathname + (search ? `?${search}` : ''));
    },
    [navigate, location.pathname, location.searchStr]
  );

  const listKey = source.value ?? source.type;
  // Merchant blocks go on category pages only, as in Twig; offers, search and brands get none.
  const blockScope = useMemo(
    () =>
      source.type === 'categories' && source.value ? { category_id: source.value } : undefined,
    [source.type, source.value]
  );
  const loader = useCatalogLoader(source, selectedSort, shownNext, appliedFilters, keep);

  // Exact-match mode: if the first page has no match but more pages exist, read on
  // before showing anything — never "no products" while matching ones exist.
  // the result belongs to one search: list, sort, filters and the match rule (`keep`) itself
  const [found, setFound] = useState<{ key: string; keep: (product: Product) => boolean; items: Product[]; next: string | null } | null>(null);
  const firstEmpty = !!keep && filterStatus !== 'loading' && shownProducts.length === 0 && !!shownNext;
  const searchKey = `${listKey}-${selectedSort}-${JSON.stringify(appliedFilters ?? null)}`;
  const isCurrent = (f: typeof found): f is NonNullable<typeof found> => !!f && f.key === searchKey && f.keep === keep;
  useEffect(() => {
    if (!firstEmpty || !keep || isCurrent(found)) return;
    const rule = keep;
    let live = true;
    loader()
      .then(r => { if (live) setFound({ key: searchKey, keep: rule, items: r.items, next: r.next ?? null }); })
      .catch(() => { if (live) setFound({ key: searchKey, keep: rule, items: [], next: null }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstEmpty, found, searchKey, keep, loader]);
  const useFound = firstEmpty && isCurrent(found);
  const searching = firstEmpty && !useFound;
  const listProducts = useFound && keep ? found.items.filter(keep) : shownProducts;
  const listNext = useFound ? found.next : shownNext;

  const listLayoutClass =
    view === 'list' ? 's-products-list-horizontal-cards' : 's-products-list-vertical-cards';
  // Offers (and other filter-less lists) get the full row: 5 columns on desktop.
  const wideGridClass = wideGrid && view === 'grid' ? ' s-products-list-cols-5' : '';

  return (
    <div key={listKey} className="tc-s tc-page tc-listing">
     <section className="wrap ptop-sec">
      {theme?.settings?.product_index_show_breadcrumbs !== false && <Breadcrumb page={page} />}

      <BrandHeader source={source} />

      <HookSlot name="product:list.start" />

      {/* App-block hook `product.index.before_products_group_with_filter` — above the listing */}
      <BlockHookSlot
        name="product.index.before_products_group_with_filter"
        wrapper="s-before-products-list"
        className="!mt-0"
        scope={blockScope}
      />

      {/* design/store/category.html — .cat-top: kicker + title | count · sort */}
      <div className="cat-top">
        <div>
          {asBool(ls.tc_list_kicker_show, true) && (
            <span className="kicker">{size ? lt(undefined, 'نتائج المقاس') : lt(ls.tc_list_kicker, 'تسوّق الإطارات')}</span>
          )}
          <h1 className="ph1" id="page-main-title">
            {size ? formatTireSize(size) : isBrand ? t('common.titles.products') : page.title}
          </h1>
        </div>
        <div className="tc-cat-tools">
          {showFilters && (
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="btn btn-line tc-filters-trigger"
              aria-label={t('pages.categories.filters', 'Filters')}
            >
              <FilterHorizontalIcon aria-hidden="true" /> {t('pages.categories.filters', 'Filters')}
            </button>
          )}
          {sortOptionsWithTrans.length > 0 && (
            <label className="cmp-pick">
              {/* the API is cursor-paginated with no total, so a count shows only once every page is in */}
              {!searching && !listNext && <span>{listProducts.length} {t('blocks.catalog.products_count', 'products')} ·</span>}
              {t('pages.categories.sorting', 'Sort By')}
              <select value={selectedSort} onChange={handleSortChange} aria-label={currentSortLabel}>
                {sortOptionsWithTrans.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {asBool(ls.tc_list_fbar, true) && <TcFbar key={size ? formatTireSize(size) : 'none'} initial={size} />}

      <CatalogGrid
        filtersVisible={filtersVisible}
        filters={filters}
        listKey={`${listKey}${filteredKey}`}
        filterStatus={searching ? 'loading' : filterStatus}
        onRetry={retryFilters}
        selectedSort={selectedSort}
        view={view}
        products={listProducts}
        pagination={{ next: listNext ?? null }}
        loader={loader}
        listLayoutClass={listLayoutClass}
        wideGridClass={wideGridClass}
      />

      {/* «ما لقيت مقاسك؟» — under every size search, and under an empty list */}
      {(size || (!searching && filterStatus !== 'loading' && listProducts.length === 0)) && <TcNoFind size={size} />}
     </section>

      {/* App-block hook `product.index.after_products_group_with_filter` — below the listing */}
      <BlockHookSlot
        name="product.index.after_products_group_with_filter"
        wrapper="s-after-products-list"
        scope={blockScope}
      />

      {showFilters && (
        <BottomSheet
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title={t('pages.categories.filters', 'Filters')}
        >
          <SallaFilters id="filters-menu-mobile" filters={filters as never} />
        </BottomSheet>
      )}

      <CategoryTestimonials
        enabled={source.type === 'categories' && !!store?.settings?.category?.testimonial_enabled}
      />

      {/* App-block hook `product.index.after_testimonials` — after the store-reviews block */}
      <BlockHookSlot
        name="product.index.after_testimonials"
        wrapper="s-after-testimonials"
        scope={blockScope}
      />

      <HookSlot name="product:list.end" />
    </div>
  );
}
