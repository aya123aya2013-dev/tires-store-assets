/**
 * Shared helpers for our home components: Salla sends field values in several shapes
 * (string, { ar, en }, [value], { url }…) — normalise them here once.
 */
import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';

export type Row = Record<string, unknown>;
export type Lang = 'ar' | 'en';
export const isRow = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
export const pick = (row: Row, key: string, prefix: string) => row[key] ?? row[`${prefix}.${key}`];
// same language on server and browser (SSR-safe): read it from the route, not from document
export const useLang = (): Lang => {
  const { locale } = useParams({ strict: false }) as { locale?: string };
  return String(locale ?? '').toLowerCase().startsWith('en') ? 'en' : 'ar';
};
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
export const asBool = (v: unknown, d: boolean) => (v === undefined || v === null || v === '' ? d : v === true || v === 'true' || v === 1 || v === '1');
// multilanguage fields may arrive as { ar, en } before the engine resolves them
export const asText = (v: unknown, d: string, lang: Lang = 'ar'): string => {
  if (typeof v === 'string') return v.trim() ? v : d;
  if (typeof v === 'number') return String(v);
  if (isRow(v)) return asText(v[lang] ?? v.ar ?? v.en, d, lang);
  return d;
};
// url | [url] | { url } | [{ url }] — never turns a missing url into "null"
export const asImage = (v: unknown, d: string): string => {
  if (Array.isArray(v)) return asImage(v[0], d);
  if (typeof v === 'string') return /^(https?:|\/|data:)/.test(v.trim()) ? v.trim() : d;
  if (isRow(v)) return asImage(v.url ?? v.src ?? v.path, d);
  return d;
};
// optional class from the merchant / designer (letters, digits, - and _ only)
export const customClass = (v: unknown) =>
  typeof v === 'string' ? v.split(/s+/).filter(c => /^[A-Za-z_][w-]*$/.test(c)).join(' ') : '';

// Salla link picker (variable-list): product / category / brand / page / blog / offers / external.
// The engine usually hands us the resolved url string; some payloads keep it inside an object.
export const asLink = (v: unknown, d: string): string => {
  if (Array.isArray(v)) return asLink(v[0], d);
  if (typeof v === 'string') return v.trim() ? v.trim() : d;
  if (v && typeof v === 'object') {
    const o = v as Row;
    const val = typeof o.value === 'string' && /^(\/|https?:)/.test(o.value) ? o.value : undefined;
    const url = o.url ?? o.link ?? o.href ?? val;
    if (typeof url === 'string' && url) return url;
  }
  return d;
};

// dropdown values arrive as [{ value }], { value } or a plain string
export const opt = (v: unknown, d: string): string => {
  if (Array.isArray(v)) return opt(v[0], d);
  if (v && typeof v === 'object' && 'value' in (v as Row)) return String((v as Row).value);
  return typeof v === 'string' && v ? v : d;
};
