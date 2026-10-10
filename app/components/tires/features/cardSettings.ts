/**
 * Product-card options from the theme settings — groups «أساس متجر الإطارات» and «بطاقة المنتج».
 * One hook so every card (TireGrid, TireSlider, Lineup, listing pages) follows the same switches.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, makeT, opt, useLang } from '../../home/fields';
import { useWhatsappNumber, waLink } from '../../layout/contact';
import { parseSizeSources, SIZE_SOURCES } from '../sizes';
import type { SizeSource } from '../sizes';

const EN: Record<string, string> = { 'تركيب مجاني': 'Free fitting' };

export function useCardSettings() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const lang = useLang();
  const t = makeT(lang, EN);
  const n = Math.round(Number(s.tc_installments));
  const perSet = opt(s.tc_sale_unit, 'tire') === 'set';
  const qty = Number(opt(s.tc_default_qty, '1'));
  const storeType = opt(s.tc_store_type, 'install'); // install | sale | service
  const wa = useWhatsappNumber();
  // «اطلب السعر» needs a number; without one the price stays (never a dead button)
  const ask = opt(s.tc_card_price, 'show') === 'ask' && !!wa;
  return {
    /** the product price is for a set of four (not one tire) */
    perSet,
    year: asBool(s.tc_year_badge, true),
    /** «للأربع» / installments only make sense when the price is per tire */
    setPrice: asBool(s.tc_set_price, true) && !perSet,
    installments: Number.isFinite(n) && n >= 2 && n <= 12 ? n : 4,
    fav: asBool(s.tc_card_fav, true),
    brand: asBool(s.tc_card_brand, true),
    rim: asBool(s.tc_card_rim, true),
    add: asBool(s.tc_card_add, true),
    /** a set is one unit — never add 4 sets */
    qty: perSet ? 1 : [1, 2, 4].includes(qty) ? qty : 1,
    install: storeType !== 'sale' && asBool(s.tc_install_badge, true) ? t(s.tc_install_badge_text, 'تركيب مجاني') : '',
    /** «اطلب السعر»: WhatsApp link instead of the price */
    askUrl: ask ? (name: string) => waLink(wa, (lang === 'en' ? 'Price request: ' : 'أبي سعر: ') + name) : null,
  };
}

/** a set of four split into N payments, rounded up to the halala */
export const perInstallment = (price: number, n: number) => Math.ceil(((price * 4) / n) * 100) / 100;

/** «نوع المتجر»: a sale-only store (delivery, no fitting) hides the fitting sections */
export function useSellsFitting() {
  const { theme } = useTwilight();
  return opt((theme?.settings as Record<string, unknown> | undefined)?.tc_store_type, 'install') !== 'sale';
}

/** «أين تكتب المقاس وسنة الصنع» → the sources cards read size / year from */
export function useSpecSources(): SizeSource[] {
  const { theme } = useTwilight();
  const v = opt((theme?.settings as Record<string, unknown> | undefined)?.tc_spec_source, 'all');
  return v === 'all' ? SIZE_SOURCES : parseSizeSources(v);
}
