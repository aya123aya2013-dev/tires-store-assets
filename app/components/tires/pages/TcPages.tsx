/**
 * Simple inner pages, 1:1 with design/store/{wishlist,brands,blog,article}.html. Same data and
 * Salla features as the engine pages (likes, comments, hooks), the design's markup around them.
 * Titles / switches: the «باقي الصفحات» settings group.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brand as brandApi } from '@salla.sa/twilight-theme-engine/api/brands';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useBlogLike } from '@salla.sa/twilight-theme-engine/hooks/useBlogLike';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { Breadcrumb, Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import type { BlogPageProps, BlogSinglePageProps, ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { WishlistPageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from '../../product/ProductCard';
import { asBool, makeT, useLang } from '../../home/fields';

const EN: Record<string, string> = {
  'المفضلة': 'Wishlist',
  'ما فيه إطارات بالمفضلة حتى الآن.': 'No tires in your wishlist yet.',
  'اضغط ♡ على أي إطار وتجده هنا.': 'Tap ♡ on any tire to keep it here.',
  'تسوّق الإطارات': 'Shop tires',
  'ماركات أصلية، من الوكيل.': 'Genuine brands, from the dealer.',
  'نصائح تخلّي إطارك يعيش أطول.': 'Tips that make your tires last longer.',
  'ابحث بمقاسك': 'Search by size',
  'مقالات ذات صلة': 'Related articles',
  'الصفحة التالية': 'Next page',
  'أعجبني': 'Like this article',
  'تعذّر تحميل باقي الماركات': 'Could not load the rest of the brands',
  'حاول مرة ثانية': 'Try again',
};

const useS = () => {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as Record<string, unknown>;
};
const usePT = () => makeT(useLang(), EN);

/** `.ptop-sec`: breadcrumb + the design's big title */
export function TcPageTop({ page, title }: { page: Page; title: ReactNode }) {
  return (
    <section className="wrap ptop-sec">
      <Breadcrumb page={page} />
      <h1 className="ph1">{title}</h1>
    </section>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  const t = usePT();
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="btn btn-gold" to="/#size">{t(undefined, 'تسوّق الإطارات')} <span aria-hidden="true">←</span></Link>
    </div>
  );
}

// ---------- wishlist ----------
export function TcWishlistPage({ page, products, pagination, query }: WishlistPageProps) {
  const s = useS();
  const t = usePT();
  const wishlist = useWishlist();
  const next = (pagination as { next?: unknown } | undefined)?.next;
  const cur = Number((query as { page?: unknown } | undefined)?.page) || 1;

  // The page list comes from the loader, so a heart removed here would stay on screen. Once the
  // wishlist state has loaded (a product reads as «in the wishlist»), a later «not in it» = removed.
  const seen = useRef(new Set<number>());
  const [gone, setGone] = useState<Set<number>>(new Set());
  useEffect(() => {
    let changed = false;
    const nextGone = new Set(gone);
    for (const p of products) {
      if (wishlist.has(p.id)) {
        seen.current.add(p.id);
        if (nextGone.delete(p.id)) changed = true;
      } else if (seen.current.has(p.id) && !nextGone.has(p.id)) {
        nextGone.add(p.id);
        changed = true;
      }
    }
    if (changed) setGone(nextGone);
  });
  const shown = products.filter(p => !gone.has(p.id));

  return (
    <div className="tc-s tc-page tc-wish">
      <TcPageTop page={page} title={t(s.tc_pg_wish_title, 'المفضلة')} />
      <section className="wrap tc-wish-body">
        <HookSlot name="customer:wishlist.start" />
        {shown.length ? (
          <div className="s-products-list-wrapper s-products-list-vertical-cards tc-cols-set tc-wgrid">
            {shown.map((p, i) => <ProductCard key={p.id} product={p} index={i} layout="vertical" />)}
          </div>
        ) : (
          <Empty title={t(s.tc_pg_wish_empty, 'ما فيه إطارات بالمفضلة حتى الآن.')} text={t(undefined, 'اضغط ♡ على أي إطار وتجده هنا.')} />
        )}
        {!!next && (
          <p className="tc-more"><Link className="btn btn-line" to={`?page=${cur + 1}`}>{t(undefined, 'الصفحة التالية')}</Link></p>
        )}
        <HookSlot name="customer:wishlist.end" />
      </section>
    </div>
  );
}

// ---------- brands ----------
export function TcBrandsPage({ page, brands, ...rest }: BrandsPageProps) {
  const s = useS();
  const t = usePT();
  const logos = asBool(s.tc_pg_brands_logos, true);
  // the loader returns the first page only; the remaining pages are fetched the same way the home marquee does
  const hasNext = !!(rest as { pagination?: { next?: unknown } }).pagination?.next;
  const more = useQuery({
    queryKey: ['tc-brands-rest'],
    enabled: hasNext,
    queryFn: async () => {
      const all: typeof brands = [];
      const seen = new Set<unknown>(brands.map(b => b.id));
      for (let p = 2; p <= 200; p++) {
        const res = await brandApi.list(p);
        const fresh = (res.items as unknown as typeof brands).filter(b => !seen.has(b.id));
        fresh.forEach(b => seen.add(b.id));
        all.push(...fresh);
        // no `next`, or a page with nothing new (a repeating cursor) ends the loop
        if (!res.next || !fresh.length) break;
      }
      return all;
    },
  });
  const known = new Set(brands.map(b => b.id));
  const list = [...brands, ...(more.data ?? []).filter(b => !known.has(b.id))];
  return (
    <div className="tc-s tc-page tc-brands">
      <TcPageTop page={page} title={t(s.tc_pg_brands_title, 'ماركات أصلية، من الوكيل.')} />
      <section className="wrap bgrid">
        {list.map(b => (
          <Link key={b.id} to={b.url}>
            {logos && b.logo ? <Image className="tc-blogo" src={b.logo} alt={b.name} aspectRatio="5/3" /> : <b>{b.name}</b>}
            {logos && b.logo && <small>{b.name}</small>}
          </Link>
        ))}
      </section>
      {more.isError && (
        <p className="wrap tc-more" role="alert">
          {t(undefined, 'تعذّر تحميل باقي الماركات')} <button type="button" className="btn btn-line" onClick={() => void more.refetch()}>{t(undefined, 'حاول مرة ثانية')}</button>
        </p>
      )}
    </div>
  );
}

// ---------- blog ----------
const fmtDate = (v: unknown, lang: string) => {
  const d = v ? new Date(typeof v === 'object' && v && 'date' in v ? String((v as { date: unknown }).date) : String(v)) : null;
  return d && !isNaN(+d) ? d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
};

function Tip({ a }: { a: ArticleSummary }) {
  const lang = useLang();
  return (
    <Link className="tip" to={a.url}>
      <div className="ti">{a.image ? <Image src={a.image} alt="" aspectRatio="16/10" /> : null}</div>
      <small>{a.promotion_title || fmtDate(a.created_at, lang)}</small>
      <h3>{a.name}</h3>
    </Link>
  );
}

export function TcBlogPage({ page, articles }: BlogPageProps) {
  const s = useS();
  const t = usePT();
  return (
    <div className="tc-s tc-page tc-blog">
      <TcPageTop page={page} title={t(s.tc_pg_blog_title, 'نصائح تخلّي إطارك يعيش أطول.')} />
      <section className="wrap tc-blog-body">
        <HookSlot name="blog:index.start" />
        <div className="tips">{articles.map(a => <Tip key={a.id} a={a} />)}</div>
        <HookSlot name="blog:index.end" />
      </section>
    </div>
  );
}

export function TcArticlePage({ page, article, related = [] }: BlogSinglePageProps) {
  const s = useS();
  const t = usePT();
  const lang = useLang();
  const { store } = useTwilight();
  const social = !!store.settings?.blog?.allow_likes_and_comments;
  const { active, count, toggle, loading } = useBlogLike(Number(article.id) || 0, article.stats?.likes ?? 0);
  const { commentsKey } = useComments();
  return (
    <div className="tc-s tc-page tc-article" key={article.id}>
      <article className="wrap article">
        <Breadcrumb page={page} />
        <HookSlot name="blog:single.start" />
        <span className="kicker">{[article.categories?.[0]?.name, fmtDate(article.created_at, lang)].filter(Boolean).join(' · ')}</span>
        <h1 className="ph1">{article.name}</h1>
        {article.image && <div className="hero-img"><Image src={article.image} alt={article.name} aspectRatio="16/8" priority noWrapper /></div>}
        <div className="tc-article-body" dangerouslySetInnerHTML={{ __html: article.description?.replace(/&nbsp;/g, ' ') || '' }} />
        {asBool(s.tc_pg_article_cta, true) && (
          <p><Link className="btn btn-gold" to="/#size">{t(s.tc_pg_article_cta_text, 'ابحث بمقاسك')} <span aria-hidden="true">←</span></Link></p>
        )}
        {asBool(s.tc_pg_article_tags, true) && !!article.tags?.length && (
          <div className="chips tc-article-tags">{article.tags.map(tag => <Link key={tag.id} to={tag.url}><span>{tag.name}</span></Link>)}</div>
        )}
        {social && (
          <div className="tc-article-social">
            <button type="button" id="blog-like" data-blog-id={article.id} className={active ? 'on' : ''} onClick={toggle} disabled={loading} aria-pressed={active} aria-label={t(undefined, 'أعجبني')}>
              <i className="sicon-thumbs-up" aria-hidden="true" /> {count}
            </button>
          </div>
        )}
        {social && <SallaComments key={commentsKey} itemId={Number(article.id) || 0} type={'blog' as never} />}
        <HookSlot name="blog:single.end" />
      </article>
      {asBool(s.tc_pg_article_related, true) && related.length > 0 && (
        <section className="wrap tc-related">
          <h2>{t(undefined, 'مقالات ذات صلة')}</h2>
          <div className="tips">{related.slice(0, 3).map(a => <Tip key={a.id} a={a} />)}</div>
        </section>
      )}
    </div>
  );
}

