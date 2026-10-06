/**
 * Component #5 — شريط الماركات (`home.brands-marquee`).
 * Design: design/final.html → `.brands` (two-line label + endless `.mq` marquee of brand names).
 * Brands come from the store's brands or a manual list (name / logo / link).
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { brand as brandApi } from '@salla.sa/twilight-theme-engine/api/brands';
import { asBool, asImage, asLink, makeT, opt, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = { 'علامات أصلية': 'Genuine brands', 'من الوكيل مباشرة': 'straight from the dealer' };
const DESIGN = ['Hankook', 'BRIDGESTONE', 'YOKOHAMA', 'DUNLOP', 'TOYO', 'NEXEN', 'MAXXIS', 'MICHELIN', 'PIRELLI'];
const ITALIC = new Set(['Hankook', 'BRIDGESTONE', 'TOYO']); // as drawn in the approved design
const SPEED: Record<string, string> = { slow: '42s', normal: '28s', fast: '16s' };

interface Mark { name: string; logo: string; url: string }

export function BrandsMarquee({ data }: { data: Row }) {
  const t = makeT(useLang(), EN);
  const fromStore = opt(data.brands_source, 'store') === 'store';
  // every page of the store brands (the API is paginated), capped so a huge catalogue can't stall the page
  const q = useQuery({
    queryKey: ['tc-brands-all'],
    enabled: fromStore,
    queryFn: async () => {
      const all: { name: string; logo: string; url: string }[] = [];
      for (let page = 1; page <= 10; page++) {
        const res = await brandApi.list(page);
        all.push(...res.items.map(b => ({ name: b.name, logo: b.logo, url: b.url })));
        if (!res.next) break;
      }
      return all;
    },
  });

  const manual: Mark[] = rows(data.brands, 'brands')
    .map(r => ({ name: t(r.name, ''), logo: asImage(r.logo, ''), url: asLink(r.link, '') }))
    .filter(b => b.name || b.logo);
  const store: Mark[] = Array.isArray(q.data) ? q.data : [];
  const chosen = fromStore ? store : manual;
  // the design's brand names are a preview aid only — a live store never shows brands it doesn't have
  const list = chosen.length ? chosen : import.meta.env.DEV ? DESIGN.map(name => ({ name, logo: '', url: '/brands' })) : [];

  const moving = asBool(data.animate, true);
  const grey = asBool(data.grayscale, true);
  const items = (copy: number) =>
    list.map((b, i) => {
      const inner = b.logo ? <img src={b.logo} alt={b.name} loading="lazy" /> : b.name;
      const style = !b.logo && ITALIC.has(b.name) ? { fontStyle: 'italic' as const, ...(b.name === 'BRIDGESTONE' ? { fontSize: 17 } : {}) } : undefined;
      return (
        <Link key={`${copy}-${i}`} to={b.url || '/brands'} style={style}>
          {inner}
        </Link>
      );
    });

  if (!list.length) return null;
  return (
    <Section data={data}>
      <section className={'wrap brands' + (grey ? ' tc-grey' : '') + (moving ? '' : ' tc-still')}>
        <span>
          {t(data.line_1, 'علامات أصلية')}
          <br />
          <b>{t(data.line_2, 'من الوكيل مباشرة')}</b>
        </span>
        <div className="mq">
          <div className="mq-track" style={{ animationDuration: SPEED[opt(data.speed, 'normal')] ?? '28s' }}>
            {items(0)}
            {/* the loop copy: same row, hidden from screen readers and keyboard */}
            {moving && <span style={{ display: 'contents' }} aria-hidden="true" inert>{items(1)}</span>}
          </div>
        </div>
      </section>
    </Section>
  );
}
