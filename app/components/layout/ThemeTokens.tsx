/**
 * Theme settings → CSS tokens (group 1 in scripts/tc-settings.cjs): brand colours, dark mode,
 * fonts and corners. One small <style> overrides the design's tokens for the whole store
 * (base theme `--color-primary` + the home sections' `--gold` / `--ink` … under `.tc-s`).
 *
 * Dark mode sets `html[data-tc-dark="1"]`; the dark palette itself lives in
 * app/styles/04-components/tc-dark.scss. An inline script applies the saved choice
 * before the page paints, so a dark visitor never sees a white flash.
 */
import { useEffect } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, opt } from '../home/fields';

export const DARK_KEY = 'tc-dark';
type Mode = 'off' | 'auto' | 'on';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const col = (v: unknown, d: string) => (typeof v === 'string' && HEX.test(v.trim()) ? v.trim() : d);

const FONTS_AR: Record<string, { family: string; css?: string }> = {
  ibm: { family: "'IBM Plex Sans Arabic'" }, // already loaded in __root.tsx
  tajawal: { family: "'Tajawal'", css: 'Tajawal:wght@400;500;700;800' },
  cairo: { family: "'Cairo'", css: 'Cairo:wght@400;500;600;700;800' },
  almarai: { family: "'Almarai'", css: 'Almarai:wght@400;700;800' },
};
const FONTS_EN: Record<string, { family: string; css?: string }> = {
  archivo: { family: "'Archivo'" }, // already loaded in __root.tsx
  inter: { family: "'Inter'", css: 'Inter:wght@500;600;700;800' },
};
/** ready-made palettes (setting tc_preset): [primary, text on primary, dark] */
const PRESETS: Record<string, [string, string, string]> = {
  gold: ['#ffb71b', '#221800', '#1d2023'],
  red: ['#e0262b', '#ffffff', '#151515'],
  blue: ['#1f6feb', '#ffffff', '#14213d'],
  green: ['#7a9a3a', '#ffffff', '#262b1f'],
};
const RADIUS: Record<string, [string, string]> = { soft: ['14px', '10px'], sharp: ['4px', '3px'], round: ['24px', '999px'] };

/** saved visitor choice → system → merchant mode */
export const darkScript = (mode: Mode, toggle: boolean) =>
  `(function(){try{var m=${JSON.stringify(mode)},s=${toggle ? `localStorage.getItem('${DARK_KEY}')` : 'null'},d=s==='1'||(s!=='0'&&(m==='on'||(m==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)));document.documentElement.setAttribute('data-tc-dark',d?'1':'0')}catch(e){}})()`;

export function useDarkSettings() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const mode = opt(s.tc_dark_mode, 'off') as Mode;
  return { mode, toggle: mode !== 'on' && asBool(s.tc_dark_toggle, true) };
}

export function ThemeTokens() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const { mode, toggle } = useDarkSettings();

  const preset = PRESETS[opt(s.tc_preset, 'none')];
  const storePrimary = !preset && asBool(s.tc_use_store_color, false) ? col(theme?.color?.primary, '') : '';
  const primary = preset?.[0] || storePrimary || col(s.tc_color_primary, '#ffb71b');
  const onPrimary = preset?.[1] || (storePrimary ? col(theme?.color?.reverse_primary, '#221800') : col(s.tc_color_on_primary, '#221800'));
  const dark = preset?.[2] || col(s.tc_color_dark, '#1d2023');
  const bg = col(s.tc_color_bg, '#ffffff');
  const bgAlt = col(s.tc_color_bg_alt, '#f5f4f0');
  // «لون الداكن»: charcoal (the identity) or black
  const black = opt(s.tc_dark_style, 'charcoal') === 'black';
  const dBg = black ? '#0a0a0a' : '#121416';
  const dSurface = black ? '#161616' : '#1b1e21';
  const dText = '#ecebe6';
  const num = (v: unknown, d: number, lo: number, hi: number) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : d; };
  const logoH = num(s.tc_logo_h, 46, 28, 80);
  const logoHm = num(s.tc_logo_h_m, 36, 24, 60);
  const cols = [num(opt(s.tc_cols_d, '4'), 4, 3, 5), num(opt(s.tc_cols_t, '3'), 3, 2, 3), num(opt(s.tc_cols_m, '2'), 2, 1, 2)];

  const arKey = opt(s.tc_font_ar, 'ibm');
  const storeFont = theme?.font?.family_name || theme?.settings?.font?.family_name;
  const ar = arKey === 'store' && storeFont ? { family: `'${storeFont}'` } : FONTS_AR[arKey] ?? FONTS_AR.ibm;
  const enKey = opt(s.tc_font_en, 'archivo');
  const en = enKey === 'same' ? ar : FONTS_EN[enKey] ?? FONTS_EN.archivo;
  const fontCss = [ar, en].map(f => f.css).filter(Boolean);
  const radiusKey = opt(s.tc_radius, 'soft');
  const [r, rBtn] = RADIUS[radiusKey] ?? RADIUS.soft;

  const css = `
:root{--tires-yellow:${primary};--color-primary:${primary};--color-primary-dark:color-mix(in srgb,${primary} 86%,#000);--color-primary-reverse:${onPrimary};--tires-black:${dark};
--tc-primary:${primary};--tc-on-primary:${onPrimary};--tc-radius:${r};--tc-radius-btn:${rBtn};
--font-ar:${ar.family},Tahoma,sans-serif;--font-main:var(--font-ar);--tc-font-en:${en.family},Arial,sans-serif;
--tc-dark-bg:${dBg};--tc-dark-surface:${dSurface};--tc-dark-text:${dText};
--tc-logo-h:${logoH}px;--tc-logo-h-m:${logoHm}px;--tc-cols-d:${cols[0]};--tc-cols-t:${cols[1]};--tc-cols-m:${cols[2]}}
.tc-s{--gold:${primary};--gold-2:color-mix(in srgb,${primary} 88%,#000);--gold-3:color-mix(in srgb,${primary} 55%,#000);--gold-soft:color-mix(in srgb,${primary} 14%,#fff);
--ink:${dark};--bg:${bg};--bg-2:${bgAlt};--en:var(--tc-font-en);font-family:var(--font-ar)}
.tc-s .btn-gold{color:${onPrimary}}${radiusKey === 'soft' ? '' : `
.tc-s .btn,.tc-s input,.tc-s select{border-radius:${rBtn}}.tc-s [class*=card],.tc-s .tc-tile{border-radius:${r}}`}`;

  // follow the visitor's system while the merchant chose "auto" and the visitor hasn't picked
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => {
      let saved: string | null = null;
      try { saved = toggle ? localStorage.getItem(DARK_KEY) : null; } catch { /* storage blocked */ }
      if (saved === null) document.documentElement.setAttribute('data-tc-dark', mq.matches ? '1' : '0');
    };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mode, toggle]);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: darkScript(mode, toggle) }} />
      {fontCss.length > 0 && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${fontCss.map(f => `family=${f}`).join('&')}&display=swap`} />
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}

/** visitor switch used by the header button */
export function setDark(on: boolean) {
  document.documentElement.setAttribute('data-tc-dark', on ? '1' : '0');
  try { localStorage.setItem(DARK_KEY, on ? '1' : '0'); } catch { /* storage blocked */ }
}
