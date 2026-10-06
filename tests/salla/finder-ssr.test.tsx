// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SizeFinder } from '../../app/components/home/SizeFinder';

vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => () => {}, useTwilight: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));

describe('size finder', () => {
  it('renders defaults on the server', () => {
    const html = renderToString(<SizeFinder data={{}} />);
    expect(html).toContain('اختر مقاس إطارك');
    expect(html).toContain('205');
    expect(html).toContain('/help#size');
    expect(html).toContain('tc-finder--overlap');
  });
  it('accepts merchant values in any shape and ignores invalid defaults', () => {
    const html = renderToString(<SizeFinder data={{ title: { ar: 'دوّر بالمقاس' }, default_width: '999', overlap_hero: false, help_text: '' }} />);
    expect(html).toContain('دوّر بالمقاس');
    expect(html).toContain('205'); // invalid default falls back
    expect(html).not.toContain('tc-finder--overlap');
    expect(html).not.toContain('/help#size'); // emptied help text hides the link
  });
});
