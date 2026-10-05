import { describe, expect, it } from 'vitest';
import { parseSizeSources, productHasTireSize } from '../../app/components/tires/sizes';

const size = { width: '205', ratio: '55', rim: '14' };

describe('exact tire size match', () => {
  it('reads the product name in any spelling', () => {
    for (const name of ['كفر 205/55/14', 'Tire 205/55 R14', '205/55R14 Michelin'])
      expect(productHasTireSize({ name }, size)).toBe(true);
  });
  it('rejects near sizes', () => {
    for (const name of ['كفر 205/55/16', 'كفر 205/60/14', 'كفر 215/55/14'])
      expect(productHasTireSize({ name }, size)).toBe(false);
  });
  it('reads tags (205-55-14) and option values', () => {
    expect(productHasTireSize({ name: 'كفر ميشلان', tags: [{ name: '205-55-14' }] }, size)).toBe(true);
    expect(productHasTireSize({ name: 'كفر ميشلان', options: [{ values: [{ name: '195/65/15' }, { name: '205/55/14' }] }] }, size)).toBe(true);
  });
  it('respects the chosen sources', () => {
    const p = { name: 'كفر', tags: [{ name: '205-55-14' }] };
    expect(productHasTireSize(p, size, parseSizeSources('name'))).toBe(false);
    expect(productHasTireSize(p, size, parseSizeSources('tags'))).toBe(true);
    expect(parseSizeSources('nonsense')).toEqual(['name', 'tags', 'options']);
  });
  it('matches truck sizes without a profile', () => {
    expect(productHasTireSize({ name: 'كفر تاش 900/16' }, { width: '900', ratio: '', rim: '16' })).toBe(true);
  });
});
