/**
 * Component #23 — الاشتراك بالنشرة (`home.newsletter`).
 * Design: design/final.html → `.news2` (dark card: kicker, two-line title, note; email field +
 * gold «subscribe» button).
 * Salla has no newsletter API for themes, so the merchant connects their own mailing service:
 * the email is sent to their sign-up link (Mailchimp, Brevo… `{email}` in the link is replaced),
 * or to their store email. Without either, the form isn't shown — it never fakes a sign-up:
 * the message only says what really happened (tab opened / mail app opened / tab blocked).
 */
import { Fragment, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { asLink, makeT, opt, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

const EN: Record<string, string> = {
  'خلّيك قريب من جديدنا': 'Stay close to what’s new', 'عروض ونصائح.\nمباشرة لبريدك.': 'Offers and tips.\nStraight to your inbox.',
  'عروض الإطارات ونصائح الصيانة — مرتين بالشهر بالكثير.': 'Tire offers and care tips — twice a month at most.',
  'البريد الإلكتروني': 'Email', 'اشترك': 'Subscribe',
  'أكمل اشتراكك بالنافذة الجديدة': 'Finish signing up in the new tab',
  'أرسل رسالة البريد لإكمال الاشتراك': 'Send the email to finish signing up',
  'المتصفح منع فتح النافذة — حاول مرة ثانية': 'Your browser blocked the tab — try again',
};
const MSG = { link: 'أكمل اشتراكك بالنافذة الجديدة', email: 'أرسل رسالة البريد لإكمال الاشتراك', blocked: 'المتصفح منع فتح النافذة — حاول مرة ثانية' };
const lines = (s: string) => s.split(/\n/).map((l, i, a) => <Fragment key={i}>{l}{i < a.length - 1 && <br />}</Fragment>);

/** `{email}` in the link is replaced; otherwise `email` is added as a query param (any #hash kept after it) */
export const signupUrl = (link: string, email: string) => {
  if (link.includes('{email}')) return link.split('{email}').join(encodeURIComponent(email));
  try {
    const base = 'https://x.invalid';
    const u = new URL(link, base);
    u.searchParams.set('email', email);
    return u.origin === base ? u.pathname + u.search + u.hash : u.toString();
  } catch {
    return link;
  }
};

export function Newsletter({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const id = useId();
  const [done, setDone] = useState<'' | keyof typeof MSG>('');
  const mode = opt(data.mode, 'link');
  const link = asLink(data.signup_link, '');
  const { store } = useTwilight();
  const mail = String(data.store_email ?? '').trim() || String(store?.contacts?.email ?? '').trim();
  const connected = mode === 'link' ? !!link : mode === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) : false;
  const showForm = connected || import.meta.env.DEV; // the local preview shows the design even unconnected

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    if (!email) return;
    if (mode === 'link' && link) {
      setDone(window.open(signupUrl(link, email), '_blank') ? 'link' : 'blocked');
    } else if (mode === 'email' && connected) {
      window.location.href = `mailto:${mail}?subject=${encodeURIComponent(isEn ? 'Newsletter' : 'اشتراك بالنشرة')}&body=${encodeURIComponent(email)}`;
      setDone('email');
    }
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
            <label htmlFor={id}>{t('البريد الإلكتروني', 'البريد الإلكتروني')}</label>
            <div>
              <input id={id} name="email" type="email" required placeholder="name@example.com" dir="ltr" autoComplete="email" />
              <button className="btn btn-gold" type="submit">
                {t(data.btn_text, 'اشترك')} {isEn ? '→' : '←'}
              </button>
            </div>
            <p className="tc-nl-msg" role="status">{done ? t(MSG[done], MSG[done]) : ''}</p>
          </form>
        )}
      </section>
    </Section>
  );
}
