import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  formatTireSize,
  parseTireSize,
  tireSizeQuery,
} from '../../../app/components/tires/sizes';
import { TireQuantityPicker } from '../../../app/components/tires/TireQuantityPicker';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to: string; children?: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('tire sizes', () => {
  it('parses the common spellings of a size', () => {
    expect(parseTireSize('Michelin Primary 4 - 205/55 R16')).toEqual({
      width: '205',
      ratio: '55',
      rim: '16',
    });
    expect(parseTireSize('225/45R17')).toEqual({ width: '225', ratio: '45', rim: '17' });
    // The store's own product names: "كفر تاش 275/65/18".
    expect(parseTireSize('كفر تاش 275/65/18')).toEqual({ width: '275', ratio: '65', rim: '18' });
    expect(parseTireSize('كفر تاش نصف حجري 285/70/17 LT')).toEqual({
      width: '285',
      ratio: '70',
      rim: '17',
    });
    expect(parseTireSize('no size here')).toBeNull();
  });

  it('formats a size the way product names spell it', () => {
    expect(formatTireSize({ width: '205', ratio: '55', rim: '16' })).toBe('205/55 R16');
    expect(tireSizeQuery({ width: '205', ratio: '55', rim: '16' })).toBe('205/55/16');
  });

  it('handles truck sizes that have no aspect ratio', () => {
    expect(parseTireSize('كفر تاش نقشة شاهين 900/16')).toEqual({
      width: '900',
      ratio: '',
      rim: '16',
    });
    expect(tireSizeQuery({ width: '900', ratio: '55', rim: '16' })).toBe('900/16');
    expect(formatTireSize({ width: '900', ratio: '', rim: '16' })).toBe('900/16');
  });
});

describe('TireQuantityPicker', () => {
  it('updates the total and drives the form stepper', () => {
    const setValue = vi.fn().mockResolvedValue(undefined);
    const root = document.createElement('div');
    root.id = 'product-7';
    const stepper = Object.assign(document.createElement('salla-quantity-input'), { setValue });
    stepper.setAttribute('max', '10');
    root.appendChild(stepper);
    document.body.appendChild(root);

    render(<TireQuantityPicker productId={7} unitPrice={400} />);
    fireEvent.click(screen.getByRole('button', { name: '4 (طقم)' }));

    expect(screen.getByText('1,600')).toBeTruthy();
    expect(setValue).toHaveBeenCalledWith(4, true);
    root.remove();
  });
});
