/**
 * The store's currency label for our price lines — same source as Twilight's `useMoney`
 * (`settings.currencies[code].symbol`, and the SAR icon when the store enables it), but
 * returned on its own so the approved layout (big number + small currency) is kept.
 */
import type { ReactNode } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

const SAR = ['ر.س', 'SAR', 'ريال'];

export function useCurrency() {
  const tw = useTwilight() as unknown as {
    store?: { currency?: string; settings?: { use_sar_symbol?: boolean } };
    settings?: { currencies?: Record<string, { symbol?: string }> };
  };
  const storeCode = tw?.store?.currency || 'SAR';
  /** label for a currency code (a product's own currency, or the store's for merchant-typed prices) */
  return (code?: string | null): ReactNode => {
    const c = code || storeCode;
    const symbol = tw?.settings?.currencies?.[c]?.symbol ?? (c === 'SAR' ? 'ر.س' : c);
    if (tw?.store?.settings?.use_sar_symbol && SAR.includes(symbol)) return <i className="sicon-sar" aria-label="SAR" />;
    return symbol;
  };
}
