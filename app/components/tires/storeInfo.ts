/**
 * Store-wide content for the tire pages: contact details, installation terms
 * and FAQ.
 *
 * TODO(merchant): review the installation terms and FAQ answers below.
 */

/** From the live store (tiresstore.com.sa) — WhatsApp number doubles as the phone. */
export const STORE_CONTACT = {
  phone: '0593157718',
  /** International format, digits only — used to build the wa.me link. */
  whatsapp: '966593157718',
  email: 'tiresstore.sa@gmail.com',
  /** Instagram handle, from the brand identity sheet. */
  instagram: 'tirestore.sa',
};

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${STORE_CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/**
 * Home promo banner with a countdown. Hidden once `endsAt` has passed, so set
 * a new date (ISO, Riyadh time) for the next offer — or `null` to hide it.
 */
export const PROMO: { title: string; text: string; link: string; endsAt: string } | null = {
  title: 'عروض نهاية الأسبوع',
  text: 'خصومات خاصة على إطارات الدفع الرباعي لفترة محدودة',
  link: '/offers',
  endsAt: '2026-10-31T23:59:59+03:00',
};

/**
 * The merchant's category pages (tiresstore.com.sa). The IDs only exist on the
 * live store — on a demo store these links 404, which is expected.
 */
export const STORE_CATEGORIES = {
  thai: '/كفرات-تايلندي/c1045693629',
  chinese: '/كفرات-صيني/c748170334',
};

/** Brand category pages, keyed by how product names spell the brand. */
export const BRAND_CATEGORIES: Record<string, string> = {
  تاش: '/كفرات-تاش/c834517795',
  هانكوك: '/كفرات-هانكوك/c191362665',
  نكسن: '/كفرات-نكسن/c14085724',
  تويو: '/كفرات-تويو/c1387466077',
  دنلوب: '/كفرات-دنلوب/c189235537',
  يوكوهاما: '/كفرات-يوكوهاما/c1697423442',
  بريجستون: '/كفرات-بريجستون/c74239191',
  ماكسس: '/كفرات-ماكسس/c729980084',
};

/** Help page path (installation terms live under its #install anchor). */
export const HELP_PATH = '/help';

export const INSTALL_TERMS = [
  'التركيب على الجنوط مجاني للإطارات المشتراة من المتجر عند الاستلام من مراكزنا في الرياض.',
  'يتم تنسيق موعد التركيب معك بعد وصول الطلب إلى المركز.',
  'يرجى إحضار السيارة إلى المركز في الموعد المحدد.',
  'الخدمات الإضافية مثل الترصيص وزن الأذرعة تؤكد مع المركز وقد تكون برسوم.',
];

/** Short return policy shown on the product page (the full one is the store's policy page). */
export const RETURN_POLICY = [
  'يمكن إرجاع أو استبدال الإطارات غير المركّبة وبحالتها الأصلية.',
  'لا يمكن إرجاع الإطارات بعد تركيبها أو استخدامها.',
  'يتم استرداد المبلغ بنفس وسيلة الدفع بعد استلام الإطارات وفحصها.',
];

export const FAQ = [
  {
    q: 'ما هي طريقة معرفة مقاس الإطار المناسب؟',
    a: 'المقاس مكتوب على الجانب الخارجي لإطارك الحالي بهذا الشكل: 205/55 R16. الرقم الأول هو العرض بالمليمتر، والثاني نسبة الارتفاع، والثالث قطر الجنط بالبوصة.',
  },
  {
    q: 'هل تشمل الأسعار التركيب؟',
    a: 'نعم، التركيب على الجنوط مجاني عند اختيار "استلام وتركيب بالرياض" والاستلام من أحد مراكزنا، وفق شروط الخدمة.',
  },
  {
    q: 'كم مدة التوصيل؟',
    a: 'تختلف مدة التوصيل حسب المدينة، وتظهر لك المدة المتوقعة في صفحة الدفع قبل تأكيد الطلب.',
  },
  {
    q: 'هل يمكن الشراء بالتقسيط؟',
    a: 'نعم، يمكنك تقسيم المبلغ عبر تابي أو تمارا عند الدفع، حسب أهلية العميل وشروط مزوّد الخدمة.',
  },
  {
    q: 'هل يمكن الإرجاع أو الاستبدال؟',
    a: 'يمكن إرجاع أو استبدال الإطارات غير المركّبة وبحالتها الأصلية وفق سياسة الإرجاع والاستبدال في المتجر.',
  },
];
