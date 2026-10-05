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
import { lazy, Suspense, useEffect, useState } from 'react';

// DEV-only: `import.meta.env.DEV` is false in production, so this import (and the
// samples) is dropped from the build entirely.
const TcPreview = import.meta.env.DEV ? lazy(() => import('../components/home/TcPreview').then(m => ({ default: m.TcPreview }))) : null;

export const Route = createFileRoute('/{-$locale}/')({
  // DEV-ONLY: with ?tc-preview skip the Salla API (it answers 422 for the local
  // store and the whole page goes blank) — the preview needs no store data.
  loader: ({ params, location }): Promise<HomeLoaderData> => {
    const isPreview = import.meta.env.DEV && 'tc-preview' in ((location.search ?? {}) as Record<string, unknown>);
    if (isPreview) return Promise.resolve({} as HomeLoaderData);
    const load = Home.loader({ locale: params.locale });
    return import.meta.env.DEV ? load.catch(() => ({}) as HomeLoaderData) : load;
  },
  head: withHead(Home),
  pendingComponent: () => <HomeSkeleton />,
  component: HomeComponent,
});

function HomeComponent() {
  const data: HomeLoaderData = Route.useLoaderData();
  // DEV-ONLY: /?tc-preview shows our components with sample data (no Salla editor needed).
  const [preview, setPreview] = useState(false);
  useEffect(() => setPreview(import.meta.env.DEV && new URLSearchParams(window.location.search).has('tc-preview')), []);
  if (TcPreview && preview) {
    return (
      <Suspense fallback={null}>
        <TcPreview />
      </Suspense>
    );
  }
  return <Home.Component {...data} />;
}
