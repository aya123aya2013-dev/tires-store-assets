import { useEffect, useState } from 'react';

const QUICK_QUANTITIES = [1, 2, 4];

type QuantityInput = HTMLElement & {
  setValue?: (value: number, fireChangeEvent?: boolean) => Promise<HTMLElement>;
  max?: number;
};

/**
 * Tire quantity shortcuts (1 / 2 / 4 tires) plus the running total. Drives the
 * product form's own `<salla-quantity-input>` so the cart gets the same number,
 * and follows it back when the shopper uses the +/- stepper instead.
 */
export function TireQuantityPicker({
  productId,
  unitPrice,
}: {
  productId: number;
  unitPrice: number;
}) {
  const [quantity, setQuantity] = useState(1);

  const findInput = () =>
    document.querySelector<QuantityInput>(`#product-${productId} salla-quantity-input`);

  // Keep in sync with the stepper (it fires `change` from its inner <input>).
  useEffect(() => {
    const onChange = (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      if (!target?.closest?.('salla-quantity-input')) return;
      const value = Number(target.value);
      if (value > 0) setQuantity(value);
    };
    const root = document.getElementById(`product-${productId}`);
    root?.addEventListener('change', onChange);
    return () => root?.removeEventListener('change', onChange);
  }, [productId]);

  const choose = (value: number) => {
    const input = findInput();
    const max = Number(input?.getAttribute('max') || input?.max || 0);
    const next = max > 0 ? Math.min(value, max) : value;
    setQuantity(next);
    void input?.setValue?.(next, true);
  };

  const total = Math.round(unitPrice * quantity * 100) / 100;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-sm text-gray-500">
          <span className="text-lg font-bold text-gray-900">{unitPrice.toLocaleString('en-US')}</span>{' '}
          ر.س للإطار الواحد
        </span>
        <span className="text-sm text-gray-500">
          الإجمالي:{' '}
          <span className="text-xl font-bold text-gray-900">{total.toLocaleString('en-US')}</span> ر.س
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-900">عدد الإطارات:</span>
        {QUICK_QUANTITIES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={quantity === value}
            className={`h-10 w-12 rounded-lg border text-sm font-bold transition ${
              quantity === value
                ? 'border-[#ffb71b] bg-[#ffb71b] text-gray-900'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#ffb71b]'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
