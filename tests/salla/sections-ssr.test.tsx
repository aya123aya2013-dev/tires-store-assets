// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BenefitsStrip } from '../../app/components/home/BenefitsStrip';
import { TireSlider } from '../../app/components/home/TireSlider';
import { BrandsMarquee } from '../../app/components/home/BrandsMarquee';
import { CategoryCards } from '../../app/components/home/CategoryCards';
import { ShopByCar, parseCarsPaste } from '../../app/components/home/ShopByCar';
import { TireGrid } from '../../app/components/home/TireGrid';
import { DoubleBanner } from '../../app/components/home/DoubleBanner';
import { TirePicker } from '../../app/components/home/TirePicker';
import { ServicesBento } from '../../app/components/home/ServicesBento';
import { Ticker } from '../../app/components/home/Ticker';
import { ServicesRow } from '../../app/components/home/ServicesRow';
import { InstallBanner } from '../../app/components/home/InstallBanner';
import { TireHero } from '../../app/components/home/TireHero';
import { SizeFinder } from '../../app/components/home/SizeFinder';
import { InstallCenters } from '../../app/components/home/InstallCenters';
import { toTcProduct } from '../../app/components/home/tc/products';

vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({ useWishlist: () => ({ has: () => false, toggle: () => {} }) }));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => () => {}, useTwilight: () => ({}) }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: { items: [] }, isLoading: false }) }));
vi.mock('@salla.sa/twilight-theme-engine/api/brands', () => ({ brand: { queries: { list: () => ({ queryKey: ['b'] }) } } }));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({ product: { queries: { list: () => ({}) } } }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children, className, style }: { to: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) => <a href={to} className={className} style={style}>{children}</a> }));

describe('#3 benefits strip', () => {
  it('renders the 4 approved defaults', () => {
    const html = renderToString(<BenefitsStrip data={{}} />);
    expect(html).toContain('class="wrap bstrip tc-n-4"');
    expect(html).toContain('إطارات أصلية');
    expect(html).toContain('توصيل لجميع المناطق');
  });
  it('uses merchant rows, any shape, and the shared settings', () => {
    const html = renderToString(
      <BenefitsStrip data={{ items: [{ 'items.icon': 'tire', 'items.title': { ar: 'شاحنات' }, 'items.text': 'سطر' }, null], show_mobile: false, custom_class: 'x1' }} />
    );
    expect(html).toContain('tc-n-1');
    expect(html).toContain('شاحنات');
    expect(html).toContain('tc-hide-m');
    expect(html).toContain('x1');
  });
});

describe('#4 tire slider', () => {
  it('renders the approved card (samples in dev when the store has none)', () => {
    const html = renderToString(<TireSlider data={{ add_qty: '4' }} />);
    expect(html).toContain('pcard feat');
    expect(html).toContain('إطارات هالأسبوع');
    expect(html).toContain('أضف 4 إطارات للسلة');
    expect(html).toContain('205/55 R16');
  });
  it('maps a Salla product: size out of the name, sale price, offer tag', () => {
    const p = toTcProduct({ id: 9, url: '/p9', name: 'كفر هانكوك 205/55/16', brand: { id: 1, name: 'Hankook' }, price: 400, sale_price: 380, regular_price: 400, is_on_sale: true, image: { url: '/x.webp' }, category: { name: 'سيدان', url: '' } } as never, 'عرض');
    expect(p).toMatchObject({ hasOptions: false, name: 'كفر هانكوك', size: '205/55 R16', rim: 'R16', price: 380, old: 400, tag: 'عرض', brand: 'Hankook', type: 'سيدان' });
  });
});

describe('#5 brands marquee', () => {
  it('falls back to the design brands and loops them', () => {
    const html = renderToString(<BrandsMarquee data={{}} />);
    expect(html).toContain('علامات أصلية');
    expect(html.match(/MICHELIN/g)?.length).toBe(2);
    expect(html).toContain('tc-grey');
  });
  it('manual brands, still mode', () => {
    const html = renderToString(<BrandsMarquee data={{ brands_source: 'manual', animate: false, brands: [{ 'brands.name': 'ACME' }] }} />);
    expect(html.match(/ACME/g)?.length).toBe(1);
    expect(html).toContain('tc-still');
  });
});

describe('#6 category cards', () => {
  it('renders 4 numbered cards with the first highlighted', () => {
    const html = renderToString(<CategoryCards data={{}} />);
    expect(html).toContain('catg tc-n-4');
    expect(html).toContain('class="cat on"');
    expect(html).toContain('>04<');
  });
});

describe('#7 shop by car', () => {
  it('lists the makes and waits for a choice', () => {
    const html = renderToString(<ShopByCar data={{}} />);
    expect(html).toContain('تويوتا');
    expect(html).toContain('اختر الماركة أول');
    expect(html).toContain('class="sec cars"');
  });
  it('uses the merchant list and ignores rows without a size', () => {
    const html = renderToString(<ShopByCar data={{ cars: [{ 'cars.make': 'مازda', 'cars.model': '6', 'cars.year_from': 2020, 'cars.size': '225/45/18' }, { 'cars.make': 'بلا', 'cars.model': 'x', 'cars.year_from': 2020 }], gold_bg: false }} />);
    expect(html).toContain('مازda');
    expect(html).not.toContain('بلا');
    expect(html).toContain('tc-plain');
  });
});

describe('#8 tire grid', () => {
  it('renders the approved card with the faded rim and price for four', () => {
    const html = renderToString(<TireGrid data={{ columns: '3' }} />);
    expect(html).toContain('cgrid tc-cols-3');
    expect(html).toContain('class="cghost">R16<');
    expect(html).toContain('للحبة · 1680 للأربع');
    expect(html).toContain('اختيار مميز');
  });
});

describe('#9 double banner', () => {
  it('renders both cards with line breaks and the custom slab colour', () => {
    const html = renderToString(<DoubleBanner data={{ slab_color: '#e11d48', reverse: true }} />);
    expect(html).toContain('أربع إطارات.<br/>اختيار واحد مدروس.');
    expect(html).toContain('background:#e11d48');
    expect(html.indexOf('dcard light')).toBeLessThan(html.indexOf('dcard dark'));
  });
});

describe('#10 tire picker', () => {
  it('recommends the mid tier for "best value" with the design prices', () => {
    const html = renderToString(<TirePicker data={{}} />);
    expect(html).toContain('ننصحك بـ <b>كفر تايلندي</b>');
    expect(html).toContain('<b>360</b>'); // 290 × 1.24 → 360
    expect(html).toContain('tier rec');
  });
});

describe('#11 services bento', () => {
  it('shows the calculator with the design numbers (1160 / 4 = 290)', () => {
    const html = renderToString(<ServicesBento data={{}} />);
    expect(html).toContain('<span>290</span>');
    expect(html).toContain('tile photo t-install');
  });
  it('hides the calculator and widens the small tile', () => {
    const html = renderToString(<ServicesBento data={{ calc_show: false }} />);
    expect(html).not.toContain('t-calc');
    expect(html).toContain('bento tc-nocalc');
  });
});

describe('#12 ticker', () => {
  it('numbers the links, dots the phrases, loops once', () => {
    const html = renderToString(<Ticker data={{ bg: 'gold' }} />);
    expect(html).toContain('<b>01</b>المقاس');
    expect(html).toContain('<span>تركيب مجاني بالرياض</span>');
    expect(html.split('<b>04</b>').length - 1).toBe(2);
    expect(html).toContain('secbar tc-gold');
  });
});

describe('#13 services row', () => {
  it('renders the photo, truck and guide cards', () => {
    const html = renderToString(<ServicesRow data={{}} />);
    expect(html).toContain('svc-art truck');
    expect(html).toContain('svc-art guide');
    expect(html).toContain('كل ما تحتاجه<br/>لإطاراتك.');
  });
});

describe('#14 install banner', () => {
  it('renders the dark split, numbered steps and the gold second line', () => {
    const html = renderToString(<InstallBanner data={{ image_side: 'right' }} />);
    expect(html).toContain('<em>وركّبها عندنا.</em>');
    expect(html).toContain('<span>03</span>');
    expect(html).toContain('fitd tc-img-right');
  });
});

describe('#7 shop by car — car lists', () => {
  it('ships the ready-made list (many makes) by default', () => {
    const html = renderToString(<ShopByCar data={{}} />);
    for (const m of ['تويوتا', 'مازدا', 'هوندا', 'ميتسوبيشي']) expect(html).toContain(m);
  });
  it('a pasted Excel list replaces everything', () => {
    const TAB = String.fromCharCode(9), NL = String.fromCharCode(10);
    const paste = ['الماركة', 'الموديل', 'من', 'إلى', 'المقاس'].join(TAB) + NL + ['بي واي دي', 'أتو 3', '2023', '2025', '215/55 R18'].join(TAB);
    const html = renderToString(<ShopByCar data={{ cars_paste: paste }} />);
    expect(html).toContain('بي واي دي');
    expect(html).not.toContain('تويوتا');
  });
  it('clearing the ready-made list leaves only manual cars', () => {
    const html = renderToString(<ShopByCar data={{ use_builtin: false, cars: [{ 'cars.make': 'شيري', 'cars.model': 'تيغو 8', 'cars.year_from': 2022, 'cars.year_to': 2025, 'cars.size': '235/55 R19' }] }} />);
    expect(html).toContain('شيري');
    expect(html).not.toContain('تويوتا');
  });
  it('parses comma / Arabic comma / year range rows and skips headers', () => {
    const cars = parseCarsPaste(['make,model,from,to,size', 'تويوتا، كامري، 2018، 2024، 215/55/17', 'كيا | K5 | 2021-2025 | 215/55 R17'].join(String.fromCharCode(10)));
    expect(cars).toEqual([
      { make: 'تويوتا', model: 'كامري', from: 2018, to: 2024, size: '215/55 R17' },
      { make: 'كيا', model: 'K5', from: 2021, to: 2025, size: '215/55 R17' },
    ]);
  });
});

describe('R1-14 / R1-16 shared settings', () => {
  it('hero and finder take show/space/class settings without the design scope', () => {
    const hero = renderToString(<TireHero data={{ show_mobile: false, space_top: 'small', custom_class: 'h1x' }} />);
    expect(hero).toMatch(/class="tc-sp tc-hide-m tc-pt-small tc-pb-normal h1x"/);
    const finder = renderToString(<SizeFinder data={{ show_desktop: false }} />);
    expect(finder).toContain('tc-sp tc-hide-d');
    expect(finder).not.toContain('tc-s ');
  });
});

describe('R1-15 / R1-17 / R1-18', () => {
  it('filter pills follow the brands the merchant picked, in order', async () => {
    const { filterBrands } = await import('../../app/components/home/tc/products');
    const ps = [{ brand: 'Hankook', brandId: 1 }, { brand: 'Toyo', brandId: 2 }, { brand: 'Pirelli', brandId: 3 }] as never[];
    expect(filterBrands(ps, [3, 1])).toEqual(['Pirelli', 'Hankook']);
    expect(filterBrands(ps, [])).toEqual(['Hankook', 'Toyo', 'Pirelli']);
  });
});

describe('#15 install centers', () => {
  it('renders the two design centres; a saved empty list hides the section', () => {
    expect(renderToString(<InstallCenters data={{}} />)).toContain('مركز السويدي');
    expect(renderToString(<InstallCenters data={{ centers: [] }} />)).toBe('');
  });
  it('merchant centre: phone link, no book button when the link is empty', () => {
    const html = renderToString(<InstallCenters data={{ centers: [{ 'centers.name': 'مركز جدة', 'centers.phone': '055 123 4567', 'centers.open_now': false }] }} />);
    expect(html).toContain('href="tel:0551234567"');
    expect(html).not.toContain('مفتوح الآن');
    expect(html).not.toContain('btn-line');
  });
});
