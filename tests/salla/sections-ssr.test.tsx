// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BenefitsStrip } from '../../app/components/home/BenefitsStrip';

vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));

describe('#3 benefits strip', () => {
  it('renders the 4 approved defaults', () => {
    const html = renderToString(<BenefitsStrip data={{}} />);
    expect(html).toContain('class="wrap bstrip tc-n-4"');
    expect(html).toContain('إطارات أصلية');
    expect(html).toContain('توصيل لجميع المناطق');
  });
  it('uses merchant rows, any shape, and the shared settings', () => {
    const html = renderToString(
      <BenefitsStrip data={{ items: [{ 'items.icon': 'tire', 'items.title': { ar: 'شاحنات' }, 'items.text': 'سطر' }, null], show_mobile: false, custom_class: 'x1' }} />
    );
    expect(html).toContain('tc-n-1');
    expect(html).toContain('شاحنات');
    expect(html).toContain('tc-hide-m');
    expect(html).toContain('x1');
  });
});
