/** Product-card options from the theme settings (group «مميزات متجر الإطارات»). */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool } from '../../home/fields';

export function useCardSettings() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const n = Math.round(Number(s.tc_installments));
  return {
    year: asBool(s.tc_year_badge, true),
    setPrice: asBool(s.tc_set_price, true),
    installments: Number.isFinite(n) && n >= 2 && n <= 12 ? n : 4,
  };
}

/** a set of four split into N payments, rounded up to the halala */
export const perInstallment = (price: number, n: number) => Math.ceil(((price * 4) / n) * 100) / 100;
