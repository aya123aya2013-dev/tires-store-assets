import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { SearchIcon } from '../icons';
import { TireSizeSelect } from './TireSizeSelect';
import {
  DEFAULT_TIRE_SIZE,
  TIRE_RATIOS,
  TIRE_RIMS,
  TIRE_WIDTHS,
  formatTireSize,
  tireSizeQuery,
  parseTireSize,
} from './sizes';
import type { TireSize } from './sizes';

const FIELDS: { key: keyof TireSize; label: string; options: string[] }[] = [
  { key: 'width', label: 'العرض', options: TIRE_WIDTHS },
  { key: 'ratio', label: 'النسبة', options: TIRE_RATIOS },
  { key: 'rim', label: 'القطر', options: TIRE_RIMS },
];

/**
 * Compact "change size" bar for the search results page. Pre-filled from the
 * current query when it is a tire size, so the shopper can tweak one number.
 */
export function TireSizeBar({ query }: { query?: string }) {
  const navigate = useNavigate();
  const current = parseTireSize(query);
  const [size, setSize] = useState<TireSize>(current ?? DEFAULT_TIRE_SIZE);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(tireSizeQuery(size))}`);
  };

  return (
    <div className="mb-6 mt-4 rounded-2xl bg-[#2f3337] p-4 text-white md:p-5">
      {current && (
        <h1 className="mb-3 text-xl font-bold md:text-2xl">
          إطارات <span dir="ltr">{formatTireSize(current)}</span>
        </h1>
      )}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        {FIELDS.map((field) => (
          <label key={field.key} className="w-[calc(33%-8px)] sm:w-32">
            <span className="mb-1 block text-xs text-gray-300">{field.label}</span>
            <TireSizeSelect field={field.key} options={field.options} size={size} setSize={setSize} />
          </label>
        ))}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ffb71b] px-6 py-2.5 font-bold text-gray-900 transition hover:bg-[#e5a00f] sm:w-auto"
        >
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
          تغيير المقاس
        </button>
      </form>
    </div>
  );
}
