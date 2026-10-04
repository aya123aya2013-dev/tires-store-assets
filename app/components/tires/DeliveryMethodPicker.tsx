import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { HELP_PATH } from './storeInfo';
import {
  INSTALL_CENTERS,
  readDeliveryChoice,
  saveDeliveryChoice,
} from './delivery';
import type { DeliveryChoice } from './delivery';

const DEFAULT_CHOICE: DeliveryChoice = { method: 'shipping' };

/**
 * Cart "receiving method": ship to an address, or pick up with free
 * installation at a Riyadh center. The choice is remembered in the browser and
 * shown again on the thank-you page.
 */
export function DeliveryMethodPicker() {
  const [choice, setChoice] = useState<DeliveryChoice>(DEFAULT_CHOICE);

  // Restore after mount — localStorage doesn't exist during SSR.
  useEffect(() => {
    const saved = readDeliveryChoice();
    if (saved) setChoice(saved);
  }, []);

  const update = (next: DeliveryChoice) => {
    setChoice(next);
    saveDeliveryChoice(next);
  };

  const options = [
    {
      method: 'install' as const,
      title: 'استلام وتركيب بالرياض',
      text: 'استلم إطاراتك وقم بالتركيب في أحد مراكزنا بالرياض',
    },
    {
      method: 'shipping' as const,
      title: 'الشحن إلى عنواني',
      text: 'يتم التوصيل إلى عنوانك',
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 p-4 md:p-5">
      <h2 className="mb-3 font-bold text-gray-900">طريقة الاستلام</h2>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="طريقة الاستلام">
        {options.map((option) => {
          const selected = choice.method === option.method;
          return (
            <label
              key={option.method}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selected ? 'border-[#ffb71b] bg-[#ffb71b]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tires-delivery-method"
                checked={selected}
                onChange={() =>
                  update({
                    method: option.method,
                    centerId:
                      option.method === 'install'
                        ? choice.centerId ?? INSTALL_CENTERS[0]?.id
                        : undefined,
                  })
                }
                className="mt-1 text-[#ffb71b] focus:ring-[#ffb71b]"
              />
              <span>
                <span className="block font-bold text-gray-900">{option.title}</span>
                <span className="block text-sm text-gray-500">{option.text}</span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
        <span aria-hidden="true" className="font-bold">ⓘ</span>
        <span>
          التركيب على الجنوط مجاناً عند الاستلام من مراكزنا في الرياض (حسب شروط الخدمة).{' '}
          <Link to={`${HELP_PATH}#install`} className="font-bold text-gray-900 underline">
            الموقع والشروط
          </Link>
        </span>
      </p>

      {choice.method === 'install' && (
        <div className="mt-4">
          <label className="mb-1 block text-sm font-bold text-gray-900" htmlFor="tires-center">
            مركز التركيب
          </label>
          <select
            id="tires-center"
            value={choice.centerId}
            onChange={(e) => update({ method: 'install', centerId: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
          >
            {INSTALL_CENTERS.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name} — {center.address}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            اختر &quot;الاستلام من الفرع&quot; في صفحة الدفع ليصل طلبك إلى المركز المحدد.
          </p>
        </div>
      )}
    </section>
  );
}
