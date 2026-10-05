import React, { lazy, Suspense } from 'react';
import { HeadContent, Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
} from '@salla.sa/twilight-theme-engine/tanstack';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { ThemeLayout } from '../components/layout/ThemeLayout';
import { useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { HOME_ROUTE_ID } from '../components/common/routeIds';
import appCssUrl from '../styles/app.css?url';
import criticalCss from '../styles/critical.scss?inline';
import { useHydrated } from '../components/common/useHydrated';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

// Flips the async home stylesheet on before hydration; after hydration React
// renders the link without media="print" itself.
const themeCssFlip = `(function(){var n=0,t=setInterval(function(){var l=document.getElementById('salla-theme-css');if(l&&l.sheet){l.media='all';clearInterval(t)}else if(++n>400)clearInterval(t)},25)})()`;

function RootComponent() {
  const ctx = getTwilightContext();
  const isHome = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === HOME_ROUTE_ID),
  });
  const hydrated = useHydrated();
  // Inline the critical CSS only when the page was server-rendered as home;
  // never added or removed on client-side navigations.
  const [inlineCritical] = useState(isHome);

  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Brand typeface (tires.scss pins --font-main to it). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Archivo:wght@700;800;900&display=swap"
        />
        {/* Home: paint from the inline critical CSS and load the full sheet
            without blocking. Other routes: the full sheet blocks, as before. */}
        {inlineCritical && (
          // React 19 renders precedence-style children verbatim; no innerHTML needed.
          // Its own precedence, so it lands before app.css; in one group React puts links first.
          <style href="salla-critical-css" precedence="critical">
            {criticalCss}
          </style>
        )}
        <link
          id="salla-theme-css"
          rel="stylesheet"
          href={appCssUrl}
          precedence="default"
          media={inlineCritical && !hydrated ? 'print' : undefined}
          suppressHydrationWarning
        />
        {inlineCritical && (
          <>
            {/* React 19 renders script children verbatim; no innerHTML needed. */}
            <script>{themeCssFlip}</script>
            <noscript>
              <link rel="stylesheet" href={appCssUrl} />
            </noscript>
          </>
        )}
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          To get full functionality of this site you need to enable JavaScript.
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            To enable JavaScript on webpage
          </a>
          .
        </noscript>
        <TwilightProvider translations={themeTranslations} layout={ThemeLayout}>
          <Outlet />
        </TwilightProvider>
        <TanStackRouterDevtools position="bottom-right" />
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
