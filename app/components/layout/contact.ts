/**
 * One WhatsApp number for every entry point (floating button, bottom bar, «اطلب السعر», …):
 * the theme setting `tc_wa_number` first, then the store's WhatsApp, then its mobile.
 * Returns international digits only (05… → 9665…), or '' when there is no real number.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

export const toIntl = (v: unknown): string => {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^05\d{8}$/.test(d)) d = `966${d.slice(1)}`; // Saudi mobile written locally
  return d.length >= 10 && d.length <= 15 ? d : '';
};

export function useWhatsappNumber(): string {
  const { theme, store } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  return toIntl(s.tc_wa_number) || toIntl(store?.contacts?.whatsapp) || toIntl(store?.contacts?.mobile);
}

export const waLink = (num: string, text?: string) => `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
