import { describe, expect, it } from 'vitest';
import { formatTireSize, parseSizeSources, parseTireSize, productHasTireSize, tireSizeQuery } from '../../app/components/tires/sizes';

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

describe('heavy truck & bus sizes', () => {
  it('reads 315/80 R22.5 and 11R22.5', () => {
    expect(parseTireSize('كفر شاحنة 315/80 R22.5')).toEqual({ width: '315', ratio: '80', rim: '22.5' });
    expect(parseTireSize('Bus tire 11R22.5 16PR')).toEqual({ width: '11', ratio: '', rim: '22.5' });
    expect(parseTireSize('235/75/17.5')).toEqual({ width: '235', ratio: '75', rim: '17.5' });
  });
  it('formats and searches them the way stores write them', () => {
    expect(formatTireSize({ width: '11', ratio: '', rim: '22.5' })).toBe('11R22.5');
    expect(tireSizeQuery({ width: '315', ratio: '80', rim: '22.5' })).toBe('315/80/22.5');
  });
  it('matches exactly (22.5 is not 22)', () => {
    const size = { width: '315', ratio: '80', rim: '22.5' };
    expect(productHasTireSize({ name: 'كفر 315/80 R22.5' }, size)).toBe(true);
    expect(productHasTireSize({ name: 'كفر 315/80 R22' }, size)).toBe(false);
  });
  it('still reads passenger sizes', () => {
    expect(parseTireSize('205/55 R16')).toEqual({ width: '205', ratio: '55', rim: '16' });
  });
});
