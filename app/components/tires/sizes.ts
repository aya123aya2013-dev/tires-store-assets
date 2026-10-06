/** Tire size option lists for the size search (width / aspect ratio / rim diameter). */

const range = (from: number, to: number, step: number): string[] => {
  const out: string[] = [];
  for (let n = from; n <= to; n += step) out.push(String(n));
  return out;
};

/** Light-truck / pickup sizes ("900/16") are written width/rim with no aspect ratio. */
export const TRUCK_WIDTHS = ['650', '700', '750', '825', '900'];

/**
 * Heavy trucks & buses (tubeless, 17.5″–22.5″ rims): metric ones use the normal
 * width/ratio (e.g. 315/80 R22.5, 385/65 R22.5); the inch ones are "11R22.5", "12R22.5"
 * — a 2-digit width and no ratio.
 */
export const HEAVY_METRIC_WIDTHS = ['385'];
export const HEAVY_INCH_WIDTHS = ['11', '12', '13'];
export const HEAVY_RIMS = ['17.5', '19.5', '22.5'];

export const PASSENGER_WIDTHS = range(155, 335, 10);
export const TIRE_WIDTHS = [...PASSENGER_WIDTHS, ...TRUCK_WIDTHS];

/** Truck widths (900/16) and inch widths (11R22.5) carry no aspect ratio, so the ratio field doesn't apply. */
export const isTruckWidth = (width: string) => Number(width) >= 600 || (Number(width) > 0 && Number(width) < 100);
const isInchWidth = (width: string) => Number(width) > 0 && Number(width) < 100;
export const TIRE_RATIOS = range(25, 85, 5);
export const TIRE_RIMS = range(13, 22, 1);

export interface TireSize {
  width: string;
  ratio: string;
  rim: string;
}

export const DEFAULT_TIRE_SIZE: TireSize = { width: '205', ratio: '55', rim: '16' };

/**
 * Reads a size out of free text; null when absent. Accepts the store's own
 * spelling ("كفر تاش 275/65/18") as well as "205/55 R16", "205/55R16", "205 55 16".
 */
// One set of patterns for reading AND removing a size, so both always agree.
// Each is anchored so it never matches inside a longer number ("1205/55 R16" is not 205/55 R16).
const SIZE_PATTERNS: { re: RegExp; size: (m: RegExpMatchArray) => TireSize | null }[] = [
  // 205/55/16 · 205/55 R16 · 205/55R16 · 225/45ZR18 · 315/80 R22.5 (rims may be 17.5 / 19.5 / 22.5)
  { re: /(?<![\d.])(\d{3})\s*[/\s]\s*(\d{2})\s*(?:\/|\s|Z?R)*\s*(\d{2}(?:\.5)?)(?![\d.])/i, size: m => ({ width: m[1], ratio: m[2], rim: m[3] }) },
  // Heavy truck / bus, inch width: "11R22.5", "12 R 22.5"
  { re: /(?<![\d.])(1[1-3])\s*R\s*(\d{2}\.5)(?![\d.])/i, size: m => ({ width: m[1], ratio: '', rim: m[2] }) },
  // Light truck: "كفر تاش نقشة شاهين 900/16".
  { re: /(?<![\d.])(\d{3})\s*\/\s*(\d{2})(?![\d/.])/, size: m => (isTruckWidth(m[1]) ? { width: m[1], ratio: '', rim: m[2] } : null) },
];

function findTireSize(text: string | undefined | null): { size: TireSize; match: string } | null {
  if (!text) return null;
  for (const { re, size } of SIZE_PATTERNS) {
    const m = text.match(re);
    const s = m && size(m);
    if (s) return { size: s, match: m[0] };
  }
  return null;
}

export function parseTireSize(text: string | undefined | null): TireSize | null {
  return findTireSize(text)?.size ?? null;
}

/** The name without its size: "كفر هانكوك 205/55/16" → "كفر هانكوك" (falls back to the full name). */
export function stripTireSize(name: string): string {
  const found = findTireSize(name);
  if (!found) return name;
  return name.replace(found.match, ' ').replace(/\s{2,}/g, ' ').trim() || name;
}

/** "205/55 R16" · "900/16" · "11R22.5" — the way to show a size to shoppers. */
export function formatTireSize({ width, ratio, rim }: TireSize): string {
  if (isInchWidth(width)) return `${width}R${rim}`;
  return isTruckWidth(width) ? `${width}/${rim}` : `${width}/${ratio} R${rim}`;
}

/** "205/55/16" · "900/16" · "11R22.5" — how stores name their products, so it is the search query. */
export function tireSizeQuery({ width, ratio, rim }: TireSize): string {
  if (isInchWidth(width)) return `${width}R${rim}`;
  return isTruckWidth(width) ? `${width}/${rim}` : `${width}/${ratio}/${rim}`;
}

/** True when a product name carries exactly this size (any spelling: 205/55/16, 205/55 R16, 205/55R16, 900/16). */
export function nameHasTireSize(name: string | undefined | null, size: TireSize): boolean {
  const found = parseTireSize(name);
  if (!found) return false;
  return found.width === size.width && found.rim === size.rim && (isTruckWidth(size.width) || found.ratio === size.ratio);
}

/** Where a product's size is written: its name, its tags ("205-55-16"), or its option values. */
export type SizeSource = 'name' | 'tags' | 'options';
export const SIZE_SOURCES: SizeSource[] = ['name', 'tags', 'options'];

interface SizedProduct {
  name?: string | null;
  tags?: { name?: string | null }[] | null;
  options?: { values?: { name?: string | null }[] | null }[] | null;
}

/** The texts of the chosen sources, name first (tags may use "-" instead of "/"). */
export function specTexts(product: SizedProduct, sources: SizeSource[] = SIZE_SOURCES): string[] {
  const texts: (string | null | undefined)[] = [];
  if (sources.includes('name')) texts.push(product.name);
  if (sources.includes('tags')) texts.push(...(product.tags ?? []).map(t => t.name?.replace(/-/g, '/')));
  if (sources.includes('options')) for (const o of product.options ?? []) texts.push(...(o.values ?? []).map(v => v.name));
  return texts.filter((t): t is string => !!t);
}

/** Exact match on any of the chosen sources (tags may use "-" instead of "/"). */
export function productHasTireSize(product: SizedProduct, size: TireSize, sources: SizeSource[] = SIZE_SOURCES): boolean {
  const texts: (string | null | undefined)[] = [];
  if (sources.includes('name')) texts.push(product.name);
  if (sources.includes('tags')) texts.push(...(product.tags ?? []).map(t => t.name?.replace(/-/g, '/')));
  if (sources.includes('options')) for (const o of product.options ?? []) texts.push(...(o.values ?? []).map(v => v.name));
  return texts.some(t => nameHasTireSize(t, size));
}

/** "name,tags" (from the URL) → valid sources; anything else → all three. */
export function parseSizeSources(v: unknown): SizeSource[] {
  const list = String(v ?? '').split(',').filter((s): s is SizeSource => (SIZE_SOURCES as string[]).includes(s));
  return list.length ? list : SIZE_SOURCES;
}
