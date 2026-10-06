/**
 * «مقاسي المحفوظ» — the visitor's tire size, remembered after a size search (SizeFinder or the
 * search page). The header shows it as a chip (one tap → matching tires), and product cards mark
 * tires that fit it. Setting: tc_my_size (group «مميزات متجر الإطارات»).
 * Stored only in the visitor's browser; nothing is sent anywhere.
 */
import { useEffect, useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, makeT, useLang } from '../../home/fields';
import { Icon } from '../../home/tc/Icon';
import { formatTireSize, parseTireSize } from '../sizes';

const KEY = 'tc-my-size';
const EVT = 'tc-my-size';
const EN: Record<string, string> = { 'مقاسي': 'My size', 'يناسب مقاسك': 'Fits your size', 'انسَ مقاسي': 'Forget my size' };

export function useMySizeEnabled() {
  const { theme } = useTwilight();
  return asBool((theme?.settings as Record<string, unknown> | undefined)?.tc_my_size, true);
}

/** remember a searched size ("205/55/16", "205/55 R16", "11R22.5"…) — only when «مقاسي المحفوظ» is on */
export function saveMySize(query: string, enabled = true) {
  if (!enabled) return;
  try {
    if (query.trim()) localStorage.setItem(KEY, query.trim());
    window.dispatchEvent(new Event(EVT));
  } catch { /* storage blocked — the feature just stays off */ }
}
export function clearMySize() {
  try { localStorage.removeItem(KEY); window.dispatchEvent(new Event(EVT)); } catch { /* storage blocked */ }
}

/** the saved size (null on the server and before hydration, so SSR markup never differs) */
export function useMySize(): string | null {
  const enabled = useMySizeEnabled();
  const [v, setV] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) { setV(null); return; }
    const read = () => { try { setV(localStorage.getItem(KEY)); } catch { setV(null); } };
    read();
    window.addEventListener(EVT, read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener(EVT, read); window.removeEventListener('storage', read); };
  }, [enabled]);
  return v;
}

/** same width / ratio / rim — compares parsed sizes, never raw text */
export function sameSize(a: string | null | undefined, b: string | null | undefined) {
  const x = parseTireSize(a ?? ''), y = parseTireSize(b ?? '');
  return !!x && !!y && x.width === y.width && x.ratio === y.ratio && x.rim === y.rim;
}

export function MySizeChip() {
  const enabled = useMySizeEnabled();
  const size = useMySize();
  const t = makeT(useLang(), EN);
  if (!enabled || !size) return null;
  const parsed = parseTireSize(size);
  const label = parsed ? formatTireSize(parsed) : size;
  return (
    <span className="tc-mysize hide-m">
      <Link to={`/search?q=${encodeURIComponent(size)}`} title={t('مقاسي', 'مقاسي')}>
        <Icon name="tire" style={{ width: 16, height: 16 }} /> <b dir="ltr">{label}</b>
      </Link>
      <button type="button" aria-label={t('انسَ مقاسي', 'انسَ مقاسي')} onClick={clearMySize}>
        <Icon name="close" style={{ width: 13, height: 13 }} />
      </button>
    </span>
  );
}

/** «يناسب مقاسك ✓» on a card whose size matches the saved one */
export function FitsMine({ size }: { size?: string | null }) {
  const enabled = useMySizeEnabled();
  const mine = useMySize();
  const t = makeT(useLang(), EN);
  if (!enabled || !size || !sameSize(size, mine)) return null;
  return <span className="ctag tc-fits"><Icon name="check" style={{ width: 13, height: 13 }} /> {t('يناسب مقاسك', 'يناسب مقاسك')}</span>;
}
