import { Link } from '@salla.sa/twilight-theme-engine/common';
import { HELP_PATH } from './storeInfo';

/** Home banner: buy + install with us, linking to the installation terms. */
export function InstallPromo() {
  return (
    <section className="py-10">
      <div className="container">
        <div className="grid items-center gap-6 overflow-hidden rounded-2xl bg-[#2f3337] p-6 text-white md:grid-cols-2 md:p-10">
          <div>
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              اشتري إطاراتك <span className="text-[#ffb71b]">وركّبها عندنا</span>
            </h2>
            <p className="text-gray-300">مراكز تركيب معتمدة في الرياض</p>
            <p className="mb-6 text-gray-300">تركيب احترافي وسريع بشروط واضحة</p>
            <Link
              to={`${HELP_PATH}#install`}
              className="inline-block rounded-xl bg-[#ffb71b] px-6 py-3 font-bold text-gray-900 transition hover:bg-[#e5a00f]"
            >
              الموقع والشروط
            </Link>
          </div>
          <div aria-hidden="true" className="hidden justify-center md:flex">
            <svg viewBox="0 0 200 200" className="h-48 w-48">
              <circle cx="100" cy="100" r="92" fill="#3b4045" stroke="#ffb71b" strokeWidth="6" />
              <circle cx="100" cy="100" r="56" fill="#2f3337" stroke="#333" strokeWidth="4" />
              <circle cx="100" cy="100" r="18" fill="#ffb71b" />
              {[0, 72, 144, 216, 288].map((deg) => (
                <rect
                  key={deg}
                  x="96"
                  y="48"
                  width="8"
                  height="34"
                  rx="4"
                  fill="#444"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
