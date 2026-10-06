import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { TireHero } from '../../../app/components/home/TireHero';
import '../../../app/styles/04-components/tire-components.scss';

const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar';
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
export const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#1d2023"/></svg>');
const slides = [1, 2, 3].map(n => ({ image, title: { ar: `بنر ${n}`, en: `Banner ${n}` }, text: { ar: 'اختبار سلة', en: 'Salla test' }, link: [{ url: `/category/${n}` }], whole_link: false, btn: { ar: 'تسوق', en: 'Shop' } }));
export const fixtures: Record<string, Record<string, unknown>> = {
  slider: { image_mode: 'true', slides, slides_autoplay: false, banner_height: '16-9' },
  empty: { image_mode: true, slides: [] },
  mobileOnly: { image_mode: true, slides: [{ mobile_image: image, title: 'Mobile only' }] },
  bilingualRows: { tire_image: { url: image }, stats: [{ value: { ar: '10', en: '10' }, label: { ar: 'عملاء', en: 'Customers' } }], parts_show: false },
  nullRows: { image_mode: true, slides: [null, slides[0]] },
  tire: { tire_image: { url: image }, title_1: { ar: 'عنوان', en: 'Title' }, title_2: { ar: 'الإطار', en: 'Tire' }, stats_show: false, parts_show: false, float_anim: false },
};
function App() {
  const name = new URLSearchParams(location.search).get('case') || 'slider';
  const [data, setData] = useState(fixtures[name] || fixtures.slider);
  Object.assign(window, { sallaQaSetData: setData });
  return <TireHero data={data} />;
}
createRoot(document.getElementById('root')!).render(<App />);
