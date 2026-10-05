// Theme override for the home route (`/{-$locale}/`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone; the engine's own `index.tsx` stays generated and unused.
//
// The home page is now built ONLY from the merchant's components (عناصر الصفحة):
// the engine renders each block through the map in `app/router.tsx`
// (e.g. `home.tire-hero` → components/home/TireHero.tsx).
import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@salla.sa/twilight-theme-engine/routes/home';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { HomeSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useEffect, useState } from 'react';
import { TcPreview } from '../components/home/TcPreview';

export const Route = createFileRoute('/{-$locale}/')({
  loader: ({ params }): Promise<HomeLoaderData> => Home.loader({ locale: params.locale }),
  head: withHead(Home),
  pendingComponent: () => <HomeSkeleton />,
  component: HomeComponent,
});

function HomeComponent() {
  const data: HomeLoaderData = Route.useLoaderData();
  // DEV-ONLY: /?tc-preview shows our components with sample data (no Salla editor needed).
  const [preview, setPreview] = useState(false);
  useEffect(() => setPreview(new URLSearchParams(window.location.search).has('tc-preview')), []);
  return preview ? <TcPreview /> : <Home.Component {...data} />;
}
