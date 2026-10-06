/**
 * «يظهر على» (screen) settings → a class that hides the element on the other screens.
 * Breakpoints are the design's: mobile < 768px · tablet 768–1100px · desktop > 1100px.
 * CSS: app/styles/04-components/tc-theme-ui.scss (`.tc-on-*`).
 */
import { opt } from '../home/fields';

export type Where = 'all' | 'desktop' | 'wide' | 'narrow' | 'mobile';
const ALL: Where[] = ['all', 'desktop', 'wide', 'narrow', 'mobile'];

export const where = (v: unknown, d: Where = 'all'): Where => {
  const w = opt(v, d) as Where;
  return ALL.includes(w) ? w : d;
};
export const whereClass = (v: unknown, d: Where = 'all') => {
  const w = where(v, d);
  return w === 'all' ? '' : ` tc-on-${w}`;
};
/** for things that open by themselves (popup): is the current screen one of the chosen ones? */
export const onThisScreen = (w: Where) => {
  if (w === 'all' || typeof window === 'undefined') return true;
  const x = window.innerWidth;
  return w === 'desktop' ? x > 1100 : w === 'wide' ? x >= 768 : w === 'narrow' ? x <= 1100 : x < 768;
};
