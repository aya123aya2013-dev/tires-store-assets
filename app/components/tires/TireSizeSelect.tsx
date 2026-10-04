import type { Dispatch, SetStateAction } from 'react';
import { DEFAULT_TIRE_SIZE, isTruckWidth } from './sizes';
import type { TireSize } from './sizes';

interface TireSizeSelectProps {
  field: keyof TireSize;
  options: string[];
  size: TireSize;
  setSize: Dispatch<SetStateAction<TireSize>>;
}

/**
 * One size dropdown. Truck widths ("900/16") have no aspect ratio, so the ratio
 * select is disabled for them and gets a default back when switching to a car width.
 */
export function TireSizeSelect({ field, options, size, setSize }: TireSizeSelectProps) {
  const noRatio = field === 'ratio' && isTruckWidth(size.width);

  const onChange = (value: string) =>
    setSize((s) => {
      const next = { ...s, [field]: value };
      if (field === 'width' && !isTruckWidth(value) && !next.ratio) {
        next.ratio = DEFAULT_TIRE_SIZE.ratio;
      }
      return next;
    });

  return (
    <select
      value={noRatio ? '' : size[field]}
      disabled={noRatio}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white py-2.5 text-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#ffb71b] disabled:bg-gray-300 disabled:text-gray-500"
    >
      {noRatio && <option value="">—</option>}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
