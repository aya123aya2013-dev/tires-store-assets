/**
 * «نص الضمان بصفحة المنتج» (tc_warranty, group «أساس متجر الإطارات») — one store-wide line under
 * the product details, e.g. «ضمان الوكيل 5 سنوات». Empty = hidden. Per-product warranty stays in
 * the product description; this is the store's general promise.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { makeT, useLang } from '../../home/fields';
import { Icon } from '../../home/tc/Icon';

const EN: Record<string, string> = { 'ضمان الوكيل': 'Manufacturer warranty' };

export function WarrantyLine() {
  const { theme } = useTwilight();
  const t = makeT(useLang(), EN);
  const text = t((theme?.settings as Record<string, unknown> | undefined)?.tc_warranty, 'ضمان الوكيل');
  if (!text) return null;
  return (
    <p className="tc-s tc-warranty">
      <Icon name="shield" style={{ width: 18, height: 18 }} /> {text}
    </p>
  );
}
