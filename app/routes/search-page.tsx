// Theme override for the search route (`/{-$locale}/search`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone; the engine's own `search.tsx` stays generated and unused.
//
// Reuses the engine loader / head but renders the theme's `ProductListPage`,
// so every product listing shows the same product card and catalog toolbar as
// the category and offers pages.
import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductListPage } from '../components/product/ProductListPage';
import { ProductListSkeleton } from '../components/product/ProductListSkeleton';
import { useCallback } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SizeFinder } from '../components/home/SizeFinder';
import { formatTireSize, parseSizeSources, parseTireSize, productHasTireSize } from '../components/tires/sizes';

export const Route = createFileRoute('/{-$locale}/search')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { q: (search.q as string) || '', m: (search.m as string) || '', ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { source: 'search' },
      search: { q: deps.q, page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing),
  // Without this, a sort/page change re-runs the loader and TanStack Router
  // blanks the whole page until it resolves — taking the toolbar with it.
  pendingComponent: () => <ProductListSkeleton />,
  component: ListComponent,
});

function ListComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  const { q, m } = Route.useSearch();
  // A tire-size search shows ONLY that exact size — read from the product name,
  // its tags or its option values (`m` narrows the sources; all three by default).
  const size = parseTireSize(q);
  const keep = useCallback(
    (p: Product) => (size ? productHasTireSize(p, size, parseSizeSources(m)) : true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, m]
  );
  return (
    <>
      {size && (
        // same card as the home "size finder" component, keyed so it resets per search
        <SizeFinder key={q} data={{ match_by: m || 'all' }} initial={size} heading={formatTireSize(size)} />
      )}
      <ProductListPage {...data} keep={size ? keep : undefined} />
    </>
  );
}
