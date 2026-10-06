// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TireHero } from '../../app/components/home/TireHero';

vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));

describe('Salla Twilight hero SSR without window/document', () => {
  it('renders tire mode and resolves bilingual title in server default language', () => {
    expect(typeof window).toBe('undefined');
    const html = renderToString(<TireHero data={{ title_1: { ar: 'عنوان سلة', en: 'Salla title' }, parts_show: false, stats_show: false }} />);
    expect(html).toContain('عنوان سلة');
  });
  it('renders an empty slider safely', () => {
    expect(renderToString(<TireHero data={{ image_mode: true, slides: [] }} />)).toContain('tc-banner--empty');
  });
});
