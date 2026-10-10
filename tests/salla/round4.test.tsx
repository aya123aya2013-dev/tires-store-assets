import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({ useWishlist: () => ({ has: () => false, toggle: () => {} }) }));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => () => {}, useTwilight: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));
import { readSpecs } from '../../app/components/tires/product/TcProductParts';
import { TireQuantityPicker } from '../../app/components/tires/TireQuantityPicker';

const product = { name: 'Wrong 205/55R16 2024', tags: [{ name: '225-60-18' }, { name: '2026' }], options: [] } as never;

describe('review round 4', () => {
  it('R4-2: the spec table follows the chosen size source, not the product name', () => {
    expect(readSpecs(product, ['tags']).size).toMatchObject({ width: '225', ratio: '60', rim: '18' });
    expect(readSpecs(product, ['tags']).year).toBe('2026');
    expect(readSpecs(product, ['name']).size).toMatchObject({ width: '205', ratio: '55', rim: '16' });
  });

  it('R4-3: per-set pricing offers 1 / 2 sets, never «4 sets»', () => {
    const set = renderToString(<TireQuantityPicker productId={1} unitPrice={1000} unit="set" />);
    expect(set).toContain('طقمين');
    expect(set).not.toContain('4 (طقم)');
    const tire = renderToString(<TireQuantityPicker productId={1} unitPrice={250} />);
    expect(tire).toContain('4 (طقم)');
  });

  it('R4-22: truck sizes keep their trade code (no millimetre unit invented)', () => {
    expect(readSpecs({ name: 'Truck 11R22.5' } as never, ['name']).size).toMatchObject({ width: '11', rim: '22.5' });
    expect(readSpecs({ name: '900/16' } as never, ['name']).size).toMatchObject({ width: '900', rim: '16' });
  });
});

import { readCarsPaste } from '../../app/components/home/ShopByCar';
describe('UX-M2 pasted cars', () => {
  it('Arabic digits are read, a reversed year range is rejected with its line, a header row is ignored', () => {
    const r = readCarsPaste(['make,model,from,to,size', 'تويوتا، كامري، ٢٠١٨، ٢٠٢٤، 215/55/17', 'كيا | K5 | 2024-2018 | 215/55 R17', 'هيونداي | النترا | 2020-2024 | بدون مقاس'].join(String.fromCharCode(10)));
    expect(r.cars).toHaveLength(1);
    expect(r.cars[0]).toMatchObject({ make: 'تويوتا', from: 2018, to: 2024 });
    expect(r.rejected).toEqual([{ line: 3, reason: 'range' }, { line: 4, reason: 'size' }]);
  });
});

describe('round 5 — pasted cars edge cases', () => {
  it('R5-2: a present but invalid end year is rejected; an absent end means the same year', () => {
    const r = readCarsPaste(['Toyota | Camry | 2018 | abc | 215/55R17', 'Toyota | Corolla | 2018.5 | 2020 | 215/55R17', 'Kia | K5 | 2021 | | 215/55R17', 'Honda | Civic | 2019-2021 | 215/55R17'].join(String.fromCharCode(10)));
    expect(r.rejected.map(x => x.line)).toEqual([1, 2]);
    expect(r.cars.map(c => [c.model, c.from, c.to])).toEqual([['K5', 2021, 2021], ['Civic', 2019, 2021]]);
  });
});
