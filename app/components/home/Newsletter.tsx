/**
 * Component #23 — الاشتراك بالنشرة (`home.newsletter`).
 * Design: design/final.html → `.news2` (dark card: kicker, two-line title, note; email field +
 * gold «subscribe» button).
 * Salla has no newsletter API for themes, so the merchant connects their own mailing service:
 * the email is sent to their sign-up link (Mailchimp, Brevo… `{email}` in the link is replaced),
 * or to their store email. Without either, the form isn't shown — it never fakes a sign-up.
 */
import { Fragment, useState } from 'react';
import type { FormEvent } from 'react';
import { asLink, makeT, opt, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'خلّيك قريب من جديدنا': 'Stay close to what’s new', 'عروض ونصائح.\nمباشرة لبريدك.': 'Offers and tips.\nStraight to your inbox.',
  'عروض الإطارات ونصائح الصيانة — مرتين بالشهر بالكثير.': 'Tire offers and care tips — twice a month at most.',
  'البريد الإلكتروني': 'Email', 'اشترك': 'Subscribe', 'شكراً، وصلنا اشتراكك ✓': 'Thanks — you’re subscribed ✓',
};
const lines = (s: string) => s.split(/\n/).map((l, i, a) => <Fragment key={i}>{l}{i < a.length - 1 && <br />}</Fragment>);

export function Newsletter({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const [done, setDone] = useState(false);
  const mode = opt(data.mode, 'link');
  const link = asLink(data.signup_link, '');
  const mail = String(data.store_email ?? '').trim();
  const connected = mode === 'link' ? !!link : mode === 'email' ? /@/.test(mail) : false;
  const showForm = connected || import.meta.env.DEV; // the local preview shows the design even unconnected

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    if (!email) return;
    if (mode === 'link' && link) {
      const url = link.includes('{email}') ? link.replace('{email}', encodeURIComponent(email)) : `${link}${link.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`;
      window.open(url, '_blank', 'noopener');
    } else if (mode === 'email' && mail) {
      window.location.href = `mailto:${mail}?subject=${encodeURIComponent(isEn ? 'Newsletter' : 'اشتراك بالنشرة')}&body=${encodeURIComponent(email)}`;
    } else return;
    setDone(true);
  };

  const note = t(data.text, 'عروض الإطارات ونصائح الصيانة — مرتين بالشهر بالكثير.');
  return (
    <Section data={data}>
      <section className="wrap news2">
        <div>
          <span className="kicker">{t(data.kicker, 'خلّيك قريب من جديدنا')}</span>
          <h2>{lines(t(data.title, 'عروض ونصائح.\nمباشرة لبريدك.'))}</h2>
          {note && <p>{note}</p>}
        </div>
        {showForm && (
          <form className="news2-f" onSubmit={submit}>
            <label htmlFor="tc-nl">{t('البريد الإلكتروني', 'البريد الإلكتروني')}</label>
            <div>
              <input id="tc-nl" name="email" type="email" required placeholder="name@example.com" dir="ltr" autoComplete="email" />
              <button className="btn btn-gold" type="submit">
                {done ? t('شكراً، وصلنا اشتراكك ✓', 'شكراً، وصلنا اشتراكك ✓') : <>{t(data.btn_text, 'اشترك')} {isEn ? '→' : '←'}</>}
              </button>
            </div>
          </form>
        )}
      </section>
    </Section>
  );
}
