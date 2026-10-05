// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BenefitsStrip } from '../../app/components/home/BenefitsStrip';
import { TireSlider } from '../../app/components/home/TireSlider';
import { BrandsMarquee } from '../../app/components/home/BrandsMarquee';
import { CategoryCards } from '../../app/components/home/CategoryCards';
import { ShopByCar } from '../../app/components/home/ShopByCar';
import { toTcProduct } from '../../app/components/home/tc/products';

vi.mock('@tanstack/react-router', () => ({ useParams: () => ({}) }));
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
    expect(p).toMatchObject({ name: 'كفر هانكوك', size: '205/55 R16', rim: 'R16', price: 380, old: 400, tag: 'عرض', brand: 'Hankook', type: 'سيدان' });
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
