/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import type { ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { HOME_ROUTE_ID } from '../../app/components/common/routeIds';

vi.mock('@tanstack/react-router', () => ({
  HeadContent: () => null,
  Scripts: () => null,
  Outlet: () => null,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ matches: [{ routeId: HOME_ROUTE_ID }] }),
}));
vi.mock('@tanstack/react-router-devtools', () => ({ TanStackRouterDevtools: () => null }));
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  TwilightProvider: ({ children }: { children?: unknown }) => children,
}));
vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({
  createTwilightRootRoute: () => (options: unknown) => options,
  getTwilightContext: () => ({ locale: 'ar', dir: 'rtl' }),
}));
vi.mock('virtual:twilight/theme-translations', () => ({ default: {} }));
vi.mock('virtual:twilight/schema', () => ({ default: {} }));
vi.mock('../../app/components/layout/ThemeLayout', () => ({ ThemeLayout: () => null }));
vi.mock('../../app/styles/app.css?url', () => ({ default: '/app.css' }));
vi.mock('../../app/styles/critical.scss?inline', () => ({ default: '.w-full{width:100%}' }));

describe('root head', () => {
  it('puts the critical CSS before app.css on the home page, so the full sheet wins', async () => {
    const { Route } = await import('../../app/routes/__root');
    const Shell = (Route as unknown as { shellComponent: ComponentType }).shellComponent;

    const html = renderToString(<Shell />);

    const critical = html.indexOf('data-href="salla-critical-css"');
    const appCss = html.indexOf('id="salla-theme-css"');
    expect(critical).toBeGreaterThan(-1);
    expect(appCss).toBeGreaterThan(-1);
    expect(critical).toBeLessThan(appCss);
  });
});
