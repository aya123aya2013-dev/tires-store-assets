// DEV-ONLY preview of the Tires Store component pack: open the home page with ?tc-preview
// (rendered by app/routes/home-page.tsx). REMOVE before release.
import { TireHero } from './TireHero';

const IMG = '/assets/images/home';

const SAMPLES: { title: string; note: string; data: Record<string, unknown> }[] = [
  { title: '1-أ · بنر الإطار — الإعدادات الافتراضية', note: 'بدون أي تعديل من التاجر', data: {} },
  {
    title: '1-ب · بنر الإطار — نصوص مختلفة، بدون أرقام المقاس',
    note: 'parts_show = false · giant_text = R18 · btn2_show = false',
    data: { title_1: 'عروض الصيف', title_2: 'على كل الإطارات.', giant_text: 'R18', parts_show: false, btn2_show: false, stats_show: false },
  },
  {
    title: '1-ج · صور فقط — بانر بصورة واحدة',
    note: 'image_mode = true · شريحة وحدة = بانر ثابت · ارتفاع تلقائي',
    data: { image_mode: true, slides: [{ image: `${IMG}/madar-hero.webp`, mobile_image: `${IMG}/madar-hero-m.webp`, link: '/search' }] },
  },
  {
    title: '1-د · صور فقط — سلايدر 3 صور، 16:9، داخل حاوية، مع نص',
    note: 'banner_height = 16-9 · mobile 4-5 · boxed · content center · shade medium',
    data: {
      image_mode: true,
      banner_height: '16-9',
      banner_mobile_height: '4-5',
      banner_boxed: true,
      content_x: 'center',
      content_y: 'center',
      shade: 'medium',
      slides: [
        { image: `${IMG}/madar-hero.webp`, mobile_image: `${IMG}/madar-hero-m.webp`, title: 'تركيب مجاني بالرياض', text: 'اختر «استلام وتركيب» في السلة.', btn: 'احجز موعد', link: '/help' },
        { image: `${IMG}/cta.webp`, title: 'قسّطها على 4 دفعات', btn: 'تسوّق الآن', link: '/search' },
        { image: `${IMG}/madar-hero.webp`, mobile_image: `${IMG}/madar-hero-m.webp` },
      ],
    },
  },
  {
    title: '1-هـ · صور فقط — تأثير الاختفاء، زر مفرغ، نص بالمنتصف لشريحة وحدة، بدون أسهم',
    note: 'slides_effect = fade · show_arrows = false · btn_outline · pos_x = center · whole_link = false',
    data: {
      image_mode: true, slides_effect: 'fade', slides_speed: 1, show_arrows: false, banner_height: '21-9', shade: 'medium',
      slides: [
        { image: `${IMG}/madar-hero.webp`, title: 'إطارات أصلية', text: 'بضمان الوكيل وسنة صنع حديثة.', btn: 'تسوّق الآن', btn_outline: true, btn_color: '#ffffff', whole_link: false, link: '/search', pos_x: 'center' },
        { image: `${IMG}/cta.webp`, title: 'قسّطها على 4', btn: 'اعرف أكثر', btn_bg: '#1d2023', btn_color: '#ffb71b', link: '/search' },
      ],
    },
  },
];

export function TcPreview() {
  return (
    <div style={{ background: '#fff', paddingBottom: 60 }}>
      {SAMPLES.map(s => (
        <section key={s.title} style={{ borderTop: '6px solid #1d2023' }}>
          <div style={{ background: '#1d2023', color: '#fff', padding: '10px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <b style={{ color: '#ffb71b' }}>{s.title}</b>
            <small style={{ color: '#a5a9ad', direction: 'ltr' }}>{s.note}</small>
          </div>
          <TireHero data={s.data} />
        </section>
      ))}
    </div>
  );
}
