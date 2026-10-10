import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  formatTireSize,
  parseTireSize,
  tireSizeQuery,
} from '../../../app/components/tires/sizes';
import { DeliveryMethodPicker } from '../../../app/components/tires/DeliveryMethodPicker';
import { InstallCenterCard } from '../../../app/components/tires/InstallCenterCard';
import { TireProductInfo } from '../../../app/components/tires/TireProductInfo';
import { TireQuantityPicker } from '../../../app/components/tires/TireQuantityPicker';
import { INSTALL_CENTERS, readDeliveryChoice } from '../../../app/components/tires/delivery';

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

describe('TireProductInfo', () => {
  it('shows the spec table only when the name carries a size', () => {
    const { rerender } = render(<TireProductInfo name="Michelin Primary 4 - 205/55 R16" />);
    expect(screen.getByText('205 مم')).toBeTruthy();
    rerender(<TireProductInfo name="Wheel cleaner" />);
    expect(screen.queryByText('مواصفات الإطار')).toBeNull();
    // Off-road inch sizes still get a spec table.
    rerender(<TireProductInfo name="كفر تاش 31x10.50R15 LT" />);
    expect(screen.getAllByText('31x10.50R15').length).toBeGreaterThan(0);
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

describe('delivery choice', () => {
  beforeEach(() => window.localStorage.clear());

  it('defaults to shipping and remembers the install center pick', () => {
    render(<DeliveryMethodPicker />);
    expect(screen.queryByLabelText('مركز التركيب')).toBeNull();

    fireEvent.click(screen.getByText('استلام وتركيب بالرياض'));
    expect(screen.getByLabelText('مركز التركيب')).toBeTruthy();
    expect(readDeliveryChoice()).toEqual({ method: 'install', centerId: INSTALL_CENTERS[0].id });
  });

  it('shows the chosen center on the thank-you page, nothing for shipping', () => {
    window.localStorage.setItem(
      'tires:delivery-choice',
      JSON.stringify({ method: 'install', centerId: INSTALL_CENTERS[1].id })
    );
    const { unmount } = render(<InstallCenterCard />);
    expect(screen.getByText(INSTALL_CENTERS[1].name)).toBeTruthy();
    unmount();

    window.localStorage.setItem('tires:delivery-choice', JSON.stringify({ method: 'shipping' }));
    const { container } = render(<InstallCenterCard />);
    expect(container.innerHTML).toBe('');
  });
});
