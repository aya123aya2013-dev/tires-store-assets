/** Tire size option lists for the size search (width / aspect ratio / rim diameter). */

const range = (from: number, to: number, step: number): string[] => {
  const out: string[] = [];
  for (let n = from; n <= to; n += step) out.push(String(n));
  return out;
};

/** Truck sizes ("900/16") are written width/rim with no aspect ratio. */
const TRUCK_WIDTHS = ['650', '700', '750', '825', '900'];

export const TIRE_WIDTHS = [...range(155, 335, 10), ...TRUCK_WIDTHS];

/** Truck widths carry no aspect ratio, so the ratio field doesn't apply to them. */
export const isTruckWidth = (width: string) => Number(width) >= 600;
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
export function parseTireSize(text: string | undefined | null): TireSize | null {
  const match = text?.match(/(\d{3})\s*[/\s]\s*(\d{2})\s*[/\sRr]*\s*(\d{2})(?!\d)/);
  if (match) return { width: match[1], ratio: match[2], rim: match[3] };
  // Truck: "كفر تاش نقشة شاهين 900/16".
  const truck = text?.match(/(\d{3})\s*\/\s*(\d{2})(?![\d/])/);
  return truck && isTruckWidth(truck[1]) ? { width: truck[1], ratio: '', rim: truck[2] } : null;
}

/** "205/55 R16" (or "900/16" for trucks) — the way to show a size to shoppers. */
export function formatTireSize({ width, ratio, rim }: TireSize): string {
  return isTruckWidth(width) ? `${width}/${rim}` : `${width}/${ratio} R${rim}`;
}

/** "205/55/16" (or "900/16") — how the store names its products, so it is the search query. */
export function tireSizeQuery({ width, ratio, rim }: TireSize): string {
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
