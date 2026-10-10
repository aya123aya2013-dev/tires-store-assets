import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

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
  currency,
  lang = 'ar',
}: {
  productId: number;
  unitPrice: number;
  currency?: ReactNode;
  lang?: string;
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
  const en = lang === 'en';

  // design/store/product.html → .qrow (1 / 2 / 4 quick picks) + .ptot (running total);
  // the stepper itself is Salla's quantity input in the form, kept in sync both ways
  return (
    <div className="tc-s tc-qbox">
      <div className="qrow">
        <span>{en ? 'Quantity' : 'الكمية'}</span>
        <div className="qbtn">
          {QUICK_QUANTITIES.map((value) => (
            <button key={value} type="button" className={quantity === value ? 'on' : undefined} aria-pressed={quantity === value} onClick={() => choose(value)}>
              {value === 1 ? (en ? '1 tire' : '1 إطار') : value === 4 ? (en ? '4 (set)' : '4 (طقم)') : value}
            </button>
          ))}
        </div>
      </div>
      <div className="ptot">
        <span>{en ? 'Total' : 'الإجمالي'}</span>
        <span><b>{total.toLocaleString('en-US')}</b> {currency}</span>
      </div>
    </div>
  );
}
