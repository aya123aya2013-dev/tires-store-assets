import { Link } from '@salla.sa/twilight-theme-engine/common';
import { parseTireSize, formatTireSize } from './sizes';
import { HELP_PATH, RETURN_POLICY } from './storeInfo';

/** Off-road sizes in inches: "31x10.50R15" (optionally followed by "LT"). */
const FLOTATION_SIZE = /(\d{2})\s*[xX×]\s*(\d{1,2}\.\d{1,2})\s*R\s*(\d{2})/;

interface SpecRow {
  label: string;
  value: string;
}

/** Spec rows read from the product name; empty when the name has no size. */
function specRows(name?: string): { full: string; rows: SpecRow[] } | null {
  const size = parseTireSize(name);
  if (size) {
    const full = formatTireSize(size);
    return {
      full,
      rows: [
        { label: 'العرض', value: `${size.width} مم` },
        // Truck sizes ("900/16") have no aspect ratio.
        ...(size.ratio ? [{ label: 'نسبة الارتفاع', value: `${size.ratio}%` }] : []),
        { label: 'قطر الجنط', value: `${size.rim} بوصة` },
        { label: 'المقاس الكامل', value: full },
      ],
    };
  }
  const flotation = name?.match(FLOTATION_SIZE);
  if (flotation) {
    const full = `${flotation[1]}x${flotation[2]}R${flotation[3]}`;
    return {
      full,
      rows: [
        { label: 'القطر الخارجي', value: `${flotation[1]} بوصة` },
        { label: 'العرض', value: `${flotation[2]} بوصة` },
        { label: 'قطر الجنط', value: `${flotation[3]} بوصة` },
        { label: 'المقاس الكامل', value: full },
      ],
    };
  }
  return null;
}

/** "المقاس المختار" confirmation shown under the product title. */
export function TireSizeBadge({ name }: { name?: string }) {
  const spec = specRows(name);
  if (!spec) return null;
  return (
    <div className="mb-5 inline-flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-2">
      <span className="text-sm text-gray-500">المقاس المختار:</span>
      <span className="text-lg font-bold text-gray-900" dir="ltr">
        {spec.full}
      </span>
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffb71b] text-xs font-bold text-gray-900"
      >
        ✓
      </span>
    </div>
  );
}

/**
 * Tire extras under the add-to-cart form: free-installation note, the spec
 * table (read from the product name) and the return policy.
 */
export function TireProductInfo({ name }: { name?: string }) {
  const spec = specRows(name);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#ffb71b]/40 bg-[#ffb71b]/10 p-4">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-6 w-6 shrink-0 text-gray-900"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
        </svg>
        <div>
          <p className="font-bold text-gray-900">تركيب الإطارات على الجنوط مجاناً بالرياض</p>
          <p className="text-sm text-gray-600">وفق شروط الخدمة، عند الاستلام من أحد مراكزنا المعتمدة.</p>
          <Link
            to={`${HELP_PATH}#install`}
            className="mt-1 inline-block text-sm font-bold text-gray-900 underline"
          >
            الموقع وشروط التركيب
          </Link>
        </div>
      </div>

      {spec && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">مواصفات الإطار</h2>
          <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 text-center text-sm sm:grid-cols-4">
            {spec.rows.map((row) => (
              <div key={row.label} className="border-b border-e border-gray-200 sm:border-b-0">
                <dt className="bg-gray-50 px-3 py-2 text-gray-500">{row.label}</dt>
                <dd className="px-3 py-3 font-bold text-gray-900" dir="ltr">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <details className="group rounded-xl border border-gray-200">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold text-gray-900">
          سياسة الإرجاع والاستبدال
          <span aria-hidden="true" className="text-gray-500 transition group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <ul className="list-disc space-y-1 px-4 pb-4 ps-8 text-sm leading-6 text-gray-600">
          {RETURN_POLICY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
