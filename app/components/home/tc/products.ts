/**
 * Product data for the "Tires Store" product sections: the merchant picks a source in the
 * editor (best sellers / latest / offers / category / brand / hand-picked), we read it from
 * the store and map each product to what the approved cards show.
 */
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { formatTireSize, parseTireSize } from '../../tires/sizes';
import { opt } from '../fields';
import type { Row } from '../fields';

export interface TcProduct {
  id: number;
  url: string;
  brand: string;
  name: string;
  size: string; // "205/55 R16" or ''
  rim: string; // "R16" or ''
  type: string; // category name
  price: number;
  old?: number;
  tag?: string;
  image: string;
  year?: string;
  sold?: number;
}

/** ids picked in a `dropdown-list` (source: products / categories / brands): [1,2] | [{value:1}] | "1,2" */
const ids = (v: unknown): number[] => {
  const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : v == null ? [] : [v];
  return list
    .map(x => (x && typeof x === 'object' ? (x as Row).value ?? (x as Row).id : x))
    .map(Number)
    .filter(n => Number.isFinite(n) && n > 0);
};

/** source + its ids from the component fields (`<prefix>_source`, `_category`, `_brand`, `_selected`) */
export function sourceFrom(data: Row, prefix: string, fallback: ProductsListSource) {
  const source = opt(data[`${prefix}_source`], fallback) as ProductsListSource;
  const value =
    source === 'categories' ? ids(data[`${prefix}_category`]) :
    source === 'brands' ? ids(data[`${prefix}_brand`]) :
    source === 'selected' ? ids(data[`${prefix}_selected`]) : undefined;
  // a source that needs ids but has none → fall back so the section is never empty by mistake
  return value && !value.length ? { source: fallback, value: undefined } : { source, value };
}

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

export function toTcProduct(p: Product, offerLabel: string): TcProduct {
  const size = parseTireSize(p.name);
  const price = p.is_on_sale && p.sale_price ? num(p.sale_price) : num(p.price);
  const old = p.is_on_sale && p.regular_price && num(p.regular_price) > price ? num(p.regular_price) : undefined;
  const year = p.name.match(/\b(20[2-3]\d)\b/)?.[1];
  // the card shows the model on its own line and the size in the grey line under it
  const name = size ? p.name.replace(/\s*\d{3}\s*\/\s*\d{2}(\s*\/\s*|\s*R\s*|\s+)\d{2}\b/i, '').trim() || p.name : p.name;
  return {
    id: p.id,
    url: p.url,
    brand: p.brand?.name ?? '',
    name,
    size: size ? formatTireSize(size) : '',
    rim: size ? `R${size.rim}` : '',
    type: p.category?.name ?? '',
    price,
    old,
    tag: p.promotion_title || (old ? offerLabel : undefined),
    image: p.image?.url ?? '',
    year,
    sold: p.sold_quantity ?? 0,
  };
}

export function useTcProducts(src: { source: ProductsListSource; value?: number[] }, limit: number) {
  const q = useQuery(productApi.queries.list({ source: src.source, sourceValue: src.value, perPage: limit }));
  // DEV only: `?tc-samples` shows the design's sample tires (used to shoot the editor cover images)
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('tc-samples')) return { items: [], loading: false };
  return { items: (q.data?.items ?? []).slice(0, limit), loading: q.isLoading };
}

/** Salla storefront SDK — the same call the product page's add-to-cart uses */
export async function addToCart(id: number, quantity: number) {
  const salla = (window as unknown as { salla?: { cart?: { addItem?: (p: { id: number; quantity: number }) => Promise<unknown> } } }).salla;
  return salla?.cart?.addItem?.({ id, quantity });
}

/** design samples — only for the local preview (no store API there) */
export const SAMPLE_PRODUCTS: TcProduct[] = [
  { id: 1, url: '#', brand: 'HANKOOK', name: 'Ventus Prime 4', size: '205/55 R16', rim: 'R16', type: 'سيارات سيدان', price: 420, old: 470, tag: 'الأكثر مبيعاً', image: '/assets/images/tc/tire-a.webp', year: '2025' },
  { id: 2, url: '#', brand: 'BRIDGESTONE', name: 'Turanza T005', size: '215/60 R17', rim: 'R17', type: 'سيارات سيدان', price: 510, image: '/assets/images/tc/tire-c.webp', year: '2025' },
  { id: 3, url: '#', brand: 'YOKOHAMA', name: 'Geolandar A/T', size: '265/65 R17', rim: 'R17', type: 'دفع رباعي', price: 640, old: 700, tag: 'عرض', image: '/assets/images/tc/tire-b.webp', year: '2024' },
  { id: 4, url: '#', brand: 'TASH', name: 'كفر تاش', size: '275/65 R18', rim: 'R18', type: 'دفع رباعي', price: 390, image: '/assets/images/tc/tire-stack-2.webp', year: '2025' },
  { id: 5, url: '#', brand: 'HANKOOK', name: 'Dynapro HT', size: '245/70 R16', rim: 'R16', type: 'بيك أب', price: 560, image: '/assets/images/tc/tire-c.webp', year: '2025' },
  { id: 6, url: '#', brand: 'YOKOHAMA', name: 'BluEarth ES32', size: '195/65 R15', rim: 'R15', type: 'سيارات سيدان', price: 330, image: '/assets/images/tc/tire-a.webp', year: '2025' },
  { id: 7, url: '#', brand: 'BRIDGESTONE', name: 'Dueler H/T', size: '265/70 R16', rim: 'R16', type: 'دفع رباعي', price: 590, image: '/assets/images/tc/tire-b.webp', year: '2025' },
  { id: 8, url: '#', brand: 'TASH', name: 'كفر تاش رياضي', size: '225/45 R18', rim: 'R18', type: 'سيارات سيدان', price: 410, old: 450, tag: 'عرض', image: '/assets/images/tc/tire-a.webp', year: '2025' },
];
