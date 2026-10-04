// Theme override for the home route (`/{-$locale}/`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone; the engine's own `index.tsx` stays generated and unused.
//
// The approved home design (design/home.html), ported 1:1 in
// components/tires/DesignHome.tsx. The dashboard's home blocks are not shown,
// except the testimonials, which feed the reviews section.
import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@salla.sa/twilight-theme-engine/routes/home';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { HomeSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { DesignHome } from '../components/tires/DesignHome';

export const Route = createFileRoute('/{-$locale}/')({
  loader: ({ params }): Promise<HomeLoaderData> => Home.loader({ locale: params.locale }),
  head: withHead(Home),
  pendingComponent: () => <HomeSkeleton />,
  component: HomeComponent,
});

function HomeComponent() {
  const data: HomeLoaderData = Route.useLoaderData();
  return <DesignHome blocks={data.components} />;
}
