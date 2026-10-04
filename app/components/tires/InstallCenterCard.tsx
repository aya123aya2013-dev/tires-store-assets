import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { whatsappUrl } from './storeInfo';
import { findCenter, readDeliveryChoice } from './delivery';
import type { InstallCenter } from './delivery';

/**
 * Thank-you page card for "pick up + install" orders: the chosen center with a
 * directions link. Renders nothing for shipped orders.
 */
export function InstallCenterCard() {
  const [center, setCenter] = useState<InstallCenter>();

  // Read after mount — the choice lives in localStorage (see DeliveryMethodPicker).
  useEffect(() => {
    const choice = readDeliveryChoice();
    if (choice?.method === 'install') setCenter(findCenter(choice.centerId));
  }, []);

  if (!center) return null;

  return (
    <div className="container">
      <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#ffb71b]/40 bg-[#ffb71b]/10 p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">الاستلام والتركيب في مركز الرياض</h2>
        <p className="font-bold text-gray-900">{center.name}</p>
        <p className="text-sm text-gray-600">{center.address}</p>
        <p className="mb-3 text-sm text-gray-600">{center.hours}</p>
        <p className="mb-4 text-sm text-gray-700">
          سيتم تجهيز طلبك وإرساله إلى المركز للاستلام والتركيب، وسيتم تنسيق موعد التركيب معك.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-lg bg-[#2f3337] px-4 py-2 text-sm font-bold text-white hover:bg-black"
          >
            تتبع الطلب
          </Link>
          <a
            href={whatsappUrl('مرحباً، أرغب بتنسيق موعد تركيب الإطارات لطلبي')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:border-[#ffb71b]"
          >
            تواصل لتنسيق التركيب
          </a>
          <a
            href={center.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:border-[#ffb71b]"
          >
            الاتجاهات
          </a>
        </div>
      </section>
    </div>
  );
}
