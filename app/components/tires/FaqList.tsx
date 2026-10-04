import { FAQ } from './storeInfo';

/** FAQ accordion — native <details>, so it works before hydration too. */
export function FaqList({
  title = 'الأسئلة الشائعة',
  limit,
}: {
  title?: string;
  /** Show only the first N questions (the home sketch lists four). */
  limit?: number;
}) {
  const items = limit ? FAQ.slice(0, limit) : FAQ;
  return (
    <section className="bg-white py-10" id="faq">
      <div className="container max-w-3xl">
        <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
        <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
          {items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold text-gray-900 hover:bg-gray-50">
                {item.q}
                <span
                  aria-hidden="true"
                  className="text-xl text-gray-500 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-6 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
