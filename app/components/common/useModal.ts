/**
 * A theme modal (discount popup, tire compare): focus trap + restore (useDialogFocus) and
 * page scroll lock while open. The modal sits above the mobile bottom bar (z-index in
 * tc-theme-ui.scss), so nothing behind it stays reachable.
 */
import { useEffect, useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';

export function useModal<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  useDialogFocus(ref, open);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  return ref;
}
