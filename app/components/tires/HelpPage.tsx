import { FaqList } from './FaqList';
import { INSTALL_CENTERS } from './delivery';
import { INSTALL_TERMS, whatsappUrl } from './storeInfo';

const SIZE_PARTS = [
  { value: '205', title: 'عرض الإطار', text: 'عرض الإطار بالمليمتر (المسافة من جانب إلى جانب)' },
  { value: '55', title: 'نسبة الارتفاع إلى العرض', text: 'ارتفاع الجدار الجانبي كنسبة مئوية من عرض الإطار' },
  { value: '16', title: 'قطر الجنط', text: 'حجم الجنط المناسب بالبوصة' },
];

const CARDS = [
  { href: '#size-guide', title: 'دليل المقاس', text: 'تعرف على معنى الأرقام على الإطار' },
  { href: '#install', title: 'شروط التركيب', text: 'معلومات عن خدمة التركيب في فروعنا' },
  { href: '#faq', title: 'الأسئلة الشائعة', text: 'إجابات على أكثر الأسئلة شيوعاً' },
];

/** "How can we help?" — size guide, installation terms and centers, FAQ. */
export function HelpPage() {
  return (
    <div className="bg-white">
      <section className="container py-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">كيف نقدر نساعدك؟</h1>
        <p className="mb-8 text-gray-500">معلومات ونصائح لمساعدتك في اختيار الإطارات وتركيبها</p>
        <div className="grid gap-4 text-start sm:grid-cols-3">
          {CARDS.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-gray-200 p-5 transition hover:border-[#ffb71b]"
            >
              <span className="mb-1 block text-lg font-bold text-gray-900">{card.title}</span>
              <span className="block text-sm text-gray-500">{card.text}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="size-guide" className="border-t border-gray-100 py-10">
        <div className="container">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">دليل المقاس</h2>
          <p className="mb-6 text-gray-500">
            تعرف على معنى الأرقام الموجودة على جانب الإطار لمساعدتك في اختيار المقاس المناسب.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-center rounded-2xl bg-[#3b4045] p-10" dir="ltr">
              <span className="font-mono text-4xl font-bold tracking-widest text-gray-200">
                <span className="text-[#ffb71b]">205</span>/
                <span className="text-[#ffb71b]">55</span> R
                <span className="text-[#ffb71b]">16</span>
              </span>
            </div>
            <div className="space-y-3">
              {SIZE_PARTS.map((part) => (
                <div key={part.value} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                  <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-[#ffb71b] text-lg font-bold text-gray-900">
                    {part.value}
                  </span>
                  <span>
                    <span className="block font-bold text-gray-900">{part.title}</span>
                    <span className="block text-sm text-gray-500">{part.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="install" className="border-t border-gray-100 py-10">
        <div className="container">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">شروط التركيب</h2>
          <p className="mb-6 text-gray-500">
            نوفر خدمة تركيب الإطارات على الجنوط في مراكزنا بالرياض بواسطة فنيين متخصصين ومعدات مناسبة.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="mb-3 font-bold text-gray-900">أهم الشروط والمعلومات</h3>
              <ul className="list-disc space-y-2 ps-5 text-sm leading-6 text-gray-600">
                {INSTALL_TERMS.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              {INSTALL_CENTERS.map((center) => (
                <div key={center.id} className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900">{center.name}</h3>
                  <p className="text-sm text-gray-500">{center.address}</p>
                  <p className="mb-3 text-sm text-gray-500">{center.hours}</p>
                  <a
                    href={center.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#e5a00f] hover:underline"
                  >
                    عرض الموقع على الخريطة
                  </a>
                </div>
              ))}
              <a
                href={whatsappUrl('مرحباً، عندي استفسار عن تركيب الإطارات')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] py-3 font-bold text-white transition hover:opacity-90"
              >
                تواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100">
        <FaqList />
      </div>
    </div>
  );
}
