/**
 * Simple inner pages, 1:1 with design/store/{wishlist,brands,blog,article}.html. Same data and
 * Salla features as the engine pages (likes, comments, hooks), the design's markup around them.
 * Titles / switches: the «باقي الصفحات» settings group.
 */
import type { ReactNode } from 'react';
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
  'ما في إطارات بالمفضلة لسا.': 'No tires in your wishlist yet.',
  'اضغط ♡ على أي إطار وبتلاقيه هون.': 'Tap ♡ on any tire to keep it here.',
  'تسوّق الإطارات': 'Shop tires',
  'ماركات أصلية، من الوكيل.': 'Genuine brands, from the dealer.',
  'نصائح تخلّي إطارك يعيش أطول.': 'Tips that make your tires last longer.',
  'ابحث بمقاسك': 'Search by size',
  'مقالات ذات صلة': 'Related articles',
  'الصفحة التالية': 'Next page',
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
  const next = (pagination as { next?: unknown } | undefined)?.next;
  const cur = Number((query as { page?: unknown } | undefined)?.page) || 1;
  return (
    <div className="tc-s tc-page tc-wish">
      <TcPageTop page={page} title={t(s.tc_pg_wish_title, 'المفضلة')} />
      <section className="wrap tc-wish-body">
        <HookSlot name="customer:wishlist.start" />
        {products.length ? (
          <div className="s-products-list-wrapper s-products-list-vertical-cards tc-cols-set tc-wgrid">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} layout="vertical" />)}
          </div>
        ) : (
          <Empty title={t(s.tc_pg_wish_empty, 'ما في إطارات بالمفضلة لسا.')} text={t(undefined, 'اضغط ♡ على أي إطار وبتلاقيه هون.')} />
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
export function TcBrandsPage({ page, brands }: BrandsPageProps) {
  const s = useS();
  const t = usePT();
  const logos = asBool(s.tc_pg_brands_logos, true);
  return (
    <div className="tc-s tc-page tc-brands">
      <TcPageTop page={page} title={t(s.tc_pg_brands_title, 'ماركات أصلية، من الوكيل.')} />
      <section className="wrap bgrid">
        {brands.map(b => (
          <Link key={b.id} to={b.url}>
            {logos && b.logo ? <Image className="tc-blogo" src={b.logo} alt={b.name} aspectRatio="5/3" /> : <b>{b.name}</b>}
            {logos && b.logo && <small>{b.name}</small>}
          </Link>
        ))}
      </section>
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
        {!!article.tags?.length && (
          <div className="chips tc-article-tags">{article.tags.map(tag => <Link key={tag.id} to={tag.url}><span>{tag.name}</span></Link>)}</div>
        )}
        {social && (
          <div className="tc-article-social">
            <button type="button" id="blog-like" data-blog-id={article.id} className={active ? 'on' : ''} onClick={toggle} disabled={loading} aria-pressed={active}>
              <i className="sicon-thumbs-up" aria-hidden="true" /> {count}
            </button>
          </div>
        )}
        {social && <SallaComments key={commentsKey} itemId={Number(article.id) || 0} type={'blog' as never} />}
        <HookSlot name="blog:single.end" />
      </article>
      {related.length > 0 && (
        <section className="wrap tc-related">
          <h2>{t(undefined, 'مقالات ذات صلة')}</h2>
          <div className="tips">{related.slice(0, 3).map(a => <Tip key={a.id} a={a} />)}</div>
        </section>
      )}
    </div>
  );
}
