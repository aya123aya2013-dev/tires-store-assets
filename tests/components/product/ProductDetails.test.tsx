import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductDetails } from '../../../app/components/product/ProductDetails';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: 'ar',
    t: (key: string) => key,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));

// jsdom has no IntersectionObserver; report every element as visible so the
// deferred-hydration wrappers mount.
beforeAll(() => {
  class VisibleObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb(
        [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = VisibleObserver as unknown as typeof IntersectionObserver;
});

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 266863684,
    name: 'Product',
    price: 500,
    regular_price: 500,
    sale_price: 0,
    is_on_sale: false,
    status: 'sale',
    type: 'product',
    ...overrides,
  }) as Product;

const skuValue = (container: HTMLElement) =>
  container.querySelector('.text-unicode')?.textContent ?? null;

describe('ProductDetails SKU row', () => {
  it('shows the product SKU when no live SKU is passed', async () => {
    const { container } = render(<ProductDetails product={makeProduct({ sku: 'PARENT' })} />);

    await waitFor(() => expect(skuValue(container)).toBe('PARENT'));
  });

  it('shows the selected variant SKU over the loader SKU', async () => {
    const { container } = render(
      <ProductDetails product={makeProduct({ sku: 'PARENT' })} sku="VAR-1" />
    );

    await waitFor(() => expect(skuValue(container)).toBe('VAR-1'));
  });

  it('hides the row when the selected variant has no SKU', async () => {
    const { container } = render(
      <ProductDetails product={makeProduct({ sku: 'PARENT' })} sku="" />
    );

    await waitFor(() => expect(container.querySelector('h1')).toBeTruthy());
    expect(container.querySelector('.text-unicode')).toBeNull();
  });
});

const barcodeValue = (container: HTMLElement) =>
  [...container.querySelectorAll('.text-unicode')].find((el) =>
    el.previousElementSibling?.textContent?.includes('pages.products.barcode')
  )?.textContent ?? null;

describe('ProductDetails barcode row', () => {
  it('shows the product barcode when no live barcode is passed', async () => {
    const { container } = render(
      <ProductDetails product={makeProduct({ barcode: 'PARENT-BC' })} />
    );

    await waitFor(() => expect(barcodeValue(container)).toBe('PARENT-BC'));
  });

  it('shows the selected variant barcode over the loader barcode', async () => {
    const { container } = render(
      <ProductDetails product={makeProduct({ barcode: 'PARENT-BC' })} barcode="VAR-BC" />
    );

    await waitFor(() => expect(barcodeValue(container)).toBe('VAR-BC'));
  });

  it('hides the row when the selected variant has no barcode', async () => {
    const { container } = render(
      <ProductDetails product={makeProduct({ barcode: 'PARENT-BC' })} barcode="" />
    );

    await waitFor(() => expect(container.querySelector('h1')).toBeTruthy());
    expect(container.textContent).not.toContain('pages.products.barcode');
  });
});
