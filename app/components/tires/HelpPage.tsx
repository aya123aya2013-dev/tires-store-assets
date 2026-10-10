/**
 * /help — design/store/help.html: size guide (the sidewall code, explained once for every
 * store), installation terms, returns, FAQ. Every section and every line comes from the
 * «صفحة المساعدة» settings; the merchant can link their own Salla policy page under returns.
 */
import { Breadcrumb, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, asLink, makeT, opt, useLang } from '../home/fields';

const EN: Record<string, string> = {
  'المساعدة': 'Help',
  'كل اللي تحتاج تعرفه.': 'Everything you need to know.',
  'دليل المقاس': 'Size guide',
  'خدمة التركيب': 'Installation',
  'الإرجاع': 'Returns',
  'الأسئلة': 'FAQ',
  'اقرأ الأرقام على جانب إطارك': 'Read the numbers on your sidewall',
  'مثال:': 'Example:',
  'ابحث بمقاسك': 'Search by size',
  'تركيب مجاني': 'Free installation',
  'الإرجاع والاستبدال': 'Returns and exchanges',
  'سياسة الإرجاع': 'Return policy',
  'السياسة الكاملة': 'Full policy',
  'الأسئلة الشائعة': 'FAQ',
  'عندك سؤال؟': 'Got a question?',
  'خلّينا نوضّح.': "Let's clear it up.",
};

const CODE: [string, string, string, string, string][] = [
  ['P', 'نوع الإطار', 'P سيارات ركاب، LT نقل خفيف.', 'Type', 'P passenger, LT light truck.'],
  ['205', 'العرض', 'عرض الإطار بالمليمتر.', 'Width', 'Tire width in millimetres.'],
  ['55', 'نسبة الارتفاع', 'ارتفاع الجانب = 55% من العرض.', 'Profile', 'Sidewall height = 55% of the width.'],
  ['R', 'نوع البناء', 'R شعاعي، ZR للسرعات العالية.', 'Construction', 'R radial, ZR for high speeds.'],
  ['16', 'قطر الجنط', 'بالبوصة، لازم يطابق جنطك.', 'Rim', 'In inches; must match your rim.'],
  ['91', 'مؤشر الحمولة', 'حتى 615 كغ لكل إطار.', 'Load index', 'Up to 615 kg per tire.'],
  ['V', 'مؤشر السرعة', 'حتى 240 كم/س.', 'Speed rating', 'Up to 240 km/h.'],
  ['0324', 'تاريخ الصنع', 'الأسبوع 03 من سنة 2024.', 'DOT date', 'Week 03 of 2024.'],
];

const D_INSTALL = 'التركيب على الجنط مجاني عند اختيار «استلام وتركيب».\nالترصيص ووزن الأذرعة برسوم بسيطة تحددها المراكز.\nاحضر بالموعد؛ التأخير أكثر من 30 دقيقة قد يتطلب موعد جديد.\nالتركيب خلال ساعة تقريباً لطقم الأربع إطارات.';
const D_RETURNS = 'يمكن إرجاع أو استبدال الإطارات غير المركّبة وبحالتها الأصلية خلال 7 أيام.\nلا يمكن إرجاع الإطارات بعد تركيبها أو استخدامها.\nيُسترد المبلغ بنفس وسيلة الدفع بعد استلام الإطارات وفحصها.';
const D_FAQ: [string, string][] = [
  ['كيف أعرف مقاس الإطار المناسب لسيارتي؟', 'المقاس مكتوب على جانب إطارك الحالي، أو بملصق باب السائق.'],
  ['هل السعر يشمل التركيب؟', 'نعم، التركيب على الجنط مجاني عند اختيار «استلام وتركيب».'],
  ['كم مدة التوصيل؟', 'داخل المدينة 1–2 يوم، وباقي المناطق 3–5 أيام.'],
  ['هل يمكن التقسيط؟', 'نعم، عبر تابي أو تمارا على 4 دفعات حسب أهلية العميل.'],
];

const lines = (v: string) => v.split(/\r?\n/).map(x => x.trim()).filter(Boolean);

export function HelpPage() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const lang = useLang();
  const en = lang === 'en';
  const t = makeT(lang, EN);
  const sale = opt(s.tc_store_type, 'install') === 'sale';
  const show = {
    size: asBool(s.tc_help_size, true),
    install: asBool(s.tc_help_install, true) && !sale,
    returns: asBool(s.tc_help_returns, true),
    faq: asBool(s.tc_help_faq, true),
  };
  const install = lines(t(s.tc_help_install_lines, D_INSTALL));
  const returns = lines(t(s.tc_help_returns_lines, D_RETURNS));
  const policy = asLink(s.tc_help_policy_link, '');
  const faq = D_FAQ.map(([q, a], i) => [t(s[`tc_help_q${i + 1}`], q), t(s[`tc_help_a${i + 1}`], a)]).filter(([q]) => q);
  const page = { title: t(undefined, 'المساعدة'), breadcrumbs: [{ name: en ? 'Home' : 'الرئيسية', url: '/' }, { name: t(undefined, 'المساعدة'), url: '' }] };
  const nav: [keyof typeof show, string, string][] = [['size', 'size', 'دليل المقاس'], ['install', 'install', 'خدمة التركيب'], ['returns', 'returns', 'الإرجاع'], ['faq', 'faq', 'الأسئلة']];

  return (
    <div className="tc-s tc-page tc-help">
      <section className="wrap ptop-sec">
        <Breadcrumb page={page as never} />
        <h1 className="ph1">{t(s.tc_help_title, 'كل اللي تحتاج تعرفه.')}</h1>
        <nav className="help-nav">
          {nav.filter(([k]) => show[k]).map(([k, id, label]) => <a key={id} href={`#${id}`}>{t(undefined, label)}</a>)}
        </nav>
      </section>

      {show.size && (
        <section className="wrap hsec" id="size">
          <span className="kicker">{t(undefined, 'دليل المقاس')}</span>
          <h2>{t(undefined, 'اقرأ الأرقام على جانب إطارك')}</h2>
          <p className="lead" style={{ marginBottom: 22 }}>{t(undefined, 'مثال:')} <b dir="ltr">P 205/55 R16 91V · 0324</b></p>
          <div className="codegrid">
            {CODE.map(([v, ar, arT, enL, enT]) => (
              <div key={v}><b>{v}</b><span>{en ? enL : ar}</span><p>{en ? enT : arT}</p></div>
            ))}
          </div>
          <p style={{ marginTop: 22 }}><Link className="btn btn-gold" to="/#size">{t(undefined, 'ابحث بمقاسك')} <span aria-hidden="true">←</span></Link></p>
        </section>
      )}

      {show.install && install.length > 0 && (
        <section className="wrap hsec" id="install">
          <span className="kicker">{t(undefined, 'خدمة التركيب')}</span>
          <h2>{t(s.tc_help_install_title, 'تركيب مجاني')}</h2>
          <ul className="hlist">{install.map(x => <li key={x}>{x}</li>)}</ul>
        </section>
      )}

      {show.returns && returns.length > 0 && (
        <section className="wrap hsec" id="returns">
          <span className="kicker">{t(undefined, 'الإرجاع والاستبدال')}</span>
          <h2>{t(undefined, 'سياسة الإرجاع')}</h2>
          <ul className="hlist">{returns.map(x => <li key={x}>{x}</li>)}</ul>
          {policy && <p style={{ marginTop: 16 }}><Link className="btn btn-line" to={policy}>{t(undefined, 'السياسة الكاملة')}</Link></p>}
        </section>
      )}

      {show.faq && faq.length > 0 && (
        <section className="wrap hsec faq2" id="faq" style={{ border: 0 }}>
          <div className="side">
            <span className="kicker">{t(undefined, 'الأسئلة الشائعة')}</span>
            <h2 className="h2">{t(undefined, 'عندك سؤال؟')}<br /><em>{t(undefined, 'خلّينا نوضّح.')}</em></h2>
          </div>
          <div>
            {faq.map(([q, a]) => (
              <details key={q}><summary>{q}<span className="i" aria-hidden="true">+</span></summary><p>{a}</p></details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
