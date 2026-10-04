/** Store promises under the home hero: installation, instalments, delivery. */

const ITEMS = [
  {
    title: 'تركيب مجاني بالرياض',
    text: 'في مراكز التركيب المعتمدة',
    icon: (
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    ),
  },
  {
    title: 'تابي وتمارا',
    text: 'قسّم فاتورتك على دفعات بدون فوائد',
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
  {
    title: 'توصيل الطلبات',
    text: 'لجميع مناطق المملكة',
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17" cy="17.5" r="1.5" />
      </>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="container grid gap-4 py-6 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffb71b]/15 text-gray-900">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
            </span>
            <span>
              <span className="block font-bold text-gray-900">{item.title}</span>
              <span className="block text-sm text-gray-500">{item.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
