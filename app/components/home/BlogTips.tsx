/**
 * Component #21 — المدونة «خلّي إطارك يعيش أطول» (`home.blog`).
 * Design: design/final.html → `#tips` (.sec-head + «all articles» link, 3 cards: 16/10 photo,
 * small gold label, title).
 * Articles come from the store's blog; the label is the first tag, else the date.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import { asLink, makeT, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { Icon } from './tc/Icon';

const EN: Record<string, string> = { 'نصائح': 'Tips', 'خلّي إطارك يعيش أطول.': 'Make your tires last longer.', 'كل المقالات': 'All articles' };
const SAMPLES = [
  { url: '/blog', image: '/assets/images/tc/tread-depth.webp', label: 'صيانة · 3 دقائق', title: 'متى لازم تبدّل إطاراتك؟ اختبار العملة في 10 ثواني' },
  { url: '/blog', image: '/assets/images/tc/hands-tyre.webp', label: 'دليل · 4 دقائق', title: 'الفرق بين الإطار الصيني والتايلندي والياباني' },
  { url: '/blog', image: '/assets/images/tc/road-sunset.webp', label: 'سلامة · 2 دقيقة', title: 'ضغط الهوا الصحيح في صيف الرياض' },
];

export function BlogTips({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const limit = Math.min(6, Math.max(1, Number(data.limit) || 3));
  const q = useQuery(blog.queries.articles());
  const day = (d: unknown) => {
    const date = d ? new Date(String((d as { date?: string })?.date ?? d)) : null;
    return date && !isNaN(+date) ? date.toLocaleDateString(isEn ? 'en' : 'ar', { day: 'numeric', month: 'long' }) : '';
  };
  const articles = (q.data?.data ?? []).slice(0, limit).map(a => ({ url: a.url, image: a.image ?? '', label: a.tags?.[0]?.name ?? day(a.created_at), title: a.name }));
  const list = articles.length ? articles : import.meta.env.DEV && !q.isLoading ? SAMPLES.slice(0, limit) : [];
  if (!list.length) return null;
  const allText = t(data.all_text, 'كل المقالات');

  return (
    <Section data={data}>
      <section className="sec" id="tips" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'نصائح')}</span>
              <h2 className="h2">{t(data.title, 'خلّي إطارك يعيش أطول.')}</h2>
            </div>
            {allText && (
              <Link className="link" to={asLink(data.all_link, '/blog')}>
                {allText} <Icon name="arrow" style={{ width: 16, height: 16, ...(isEn ? { transform: 'scaleX(-1)' } : {}) }} />
              </Link>
            )}
          </div>
          <div className="tips">
            {list.map((a, i) => (
              <Link className="tip" to={a.url} key={i}>
                <div className="ti">{a.image && <img src={a.image} alt="" loading="lazy" />}</div>
                {a.label && <small>{a.label}</small>}
                <h3>{a.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Section>
  );
}
