/** design/store/404.html — own file so the root route doesn't pull the blog/comments code. */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, makeT, useLang } from '../../home/fields';

const useS = () => {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as Record<string, unknown>;
};
export function TcNotFound() {
  const s = useS();
  const t = makeT(useLang(), { 'الطريق هذا مسكّر.': 'This road is closed.', 'الصفحة التي تبحث عنها غير موجودة.': "The page you're looking for doesn't exist.", 'رجوع للرئيسية': 'Back home', 'ابحث بمقاسك': 'Search by size' });
  return (
    <div className="tc-s tc-page tc-404">
      <section className="wrap nf">
        <b>404</b>
        <h1 className="ph1">{t(s.tc_404_title, 'الطريق هذا مسكّر.')}</h1>
        <p className="lead" style={{ margin: '10px 0 24px' }}>{t(s.tc_404_text, 'الصفحة التي تبحث عنها غير موجودة.')}</p>
        <div className="tc-404-btns">
          <Link className="btn btn-gold" to="/">{t(s.tc_404_home, 'رجوع للرئيسية')} <span aria-hidden="true">←</span></Link>
          {asBool(s.tc_404_size, true) && <Link className="btn btn-line" to="/#size">{t(s.tc_404_size_text, 'ابحث بمقاسك')}</Link>}
        </div>
      </section>
    </div>
  );
}
