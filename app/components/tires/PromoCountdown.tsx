import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { PROMO } from './storeInfo';

const UNITS = [
  { label: 'يوم', ms: 86_400_000 },
  { label: 'ساعة', ms: 3_600_000 },
  { label: 'دقيقة', ms: 60_000 },
  { label: 'ثانية', ms: 1_000 },
];

function split(remaining: number) {
  let rest = Math.max(0, remaining);
  return UNITS.map((unit) => {
    const value = Math.floor(rest / unit.ms);
    rest -= value * unit.ms;
    return { label: unit.label, value };
  });
}

/** Home offer banner with a live countdown; disappears once the offer has ended. */
export function PromoCountdown() {
  const end = PROMO ? Date.parse(PROMO.endsAt) : NaN;
  // `null` until mounted: the server and client clocks differ, so the numbers
  // only render on the client (no hydration mismatch).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!PROMO || Number.isNaN(end) || (now !== null && now >= end)) return null;

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#ffb71b] p-6 text-gray-900 md:flex-row md:p-10">
          <div className="text-center md:text-start">
            <p className="mb-1 text-sm font-bold uppercase tracking-wide">عرض لفترة محدودة</p>
            <h2 className="mb-2 text-2xl font-black md:text-3xl">{PROMO.title}</h2>
            <p className="text-gray-800">{PROMO.text}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2" dir="ltr" aria-label="الوقت المتبقي على العرض">
              {split(now === null ? 0 : end - now).map((part) => (
                  <div
                    key={part.label}
                    className="flex w-16 flex-col items-center rounded-xl bg-[#2f3337] py-2 text-white"
                  >
                    <span className="text-2xl font-bold tabular-nums">
                      {now === null ? '--' : String(part.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-gray-400">{part.label}</span>
                  </div>
                ))}
            </div>
            <Link
              to={PROMO.link}
              className="rounded-xl bg-[#2f3337] px-6 py-3 font-bold text-white transition hover:bg-black"
            >
              تسوّق العروض
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
