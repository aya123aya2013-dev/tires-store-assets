// Theme override (wired in via app/routes.ts) — renders the design page, not the engine one.
import { createFileRoute } from '@tanstack/react-router';
import { Brands } from '@salla.sa/twilight-theme-engine/routes/brands';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { TcBrandsPage } from '../components/tires/pages/TcPages';

/**
 * Brands route configuration.
 * Loads page data via loader and renders the Brands component.
 */
export const Route = createFileRoute('/{-$locale}/brands')({
  loader: ({ params }): Promise<BrandsPageProps> => Brands.loader({ locale: params.locale }),
  head: withHead(Brands),
  component: BrandsComponent,
});

/**
 * Brands page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function BrandsComponent() {
  const data: BrandsPageProps = Route.useLoaderData();
  return <TcBrandsPage {...data} />;
}
