/**
 * Store-wide extras from the theme settings (group «الأزرار العائمة والنوافذ»):
 * WhatsApp / call / back-to-top floating buttons, the discount popup, the tire loader,
 * the background pattern, and the tire-compare tray. Each one is off unless its setting is on
 * (WhatsApp and back-to-top default on, like the design).
 */
import { useEffect, useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, asImage, makeT, opt, useLang, useReducedMotion } from '../home/fields';
import { Icon } from '../home/tc/Icon';
import { useCurrency } from '../home/tc/useCurrency';
import { CompareTray } from '../tires/features/Compare';
import { onThisScreen, where, whereClass } from './devices';

const EN: Record<string, string> = {
  'السلام عليكم، أبي أستفسر عن مقاس إطار': 'Hello, I have a question about a tire size',
  'تواصل واتساب': 'WhatsApp us', 'اتصل بنا': 'Call us', 'للأعلى': 'Back to top', 'إغلاق': 'Close',
  'خصم 10% على أول طقم إطارات': '10% off your first set of tires', 'استخدم الكود عند الدفع. العرض لفترة محدودة.': 'Use the code at checkout. Limited-time offer.',
  'انسخ الكود': 'Copy code', 'تم النسخ ✓': 'Copied ✓', 'جاري التحميل': 'Loading',
};
const POPUP_KEY = 'tc-popup';
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');

export function TcExtras() {
  const { store, theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const t = makeT(useLang(), EN);
  const reduced = useReducedMotion();
  const cur = useCurrency();
  const side = opt(s.tc_float_side, 'left');

  // WhatsApp: the setting's number, else the store's WhatsApp / mobile — only a real number
  const wa = digits(s.tc_wa_number) || digits(store?.contacts?.whatsapp) || digits(store?.contacts?.mobile).replace(/^0/, '966');
  const waOn = asBool(s.tc_wa_show, true) && wa.length >= 10 && wa.length <= 15;
  const waMsg = t(s.tc_wa_message, 'السلام عليكم، أبي أستفسر عن مقاس إطار');
  const call = digits(s.tc_call_number) || digits(store?.contacts?.mobile || store?.contacts?.phone);
  const callOn = asBool(s.tc_call_show, false) && call.length >= 7;

  const [showTop, setShowTop] = useState(false);
  const topOn = asBool(s.tc_totop_show, true);
  useEffect(() => {
    if (!topOn) return;
    const on = () => setShowTop(window.scrollY > 700);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [topOn]);

  // loader: only until the page is ready (never blocks longer than 2.5s)
  const loaderOn = asBool(s.tc_loader_show, false);
  const [loading, setLoading] = useState(loaderOn);
  useEffect(() => {
    if (!loaderOn) return;
    const done = () => setLoading(false);
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    const cap = setTimeout(done, 2500);
    return () => { window.removeEventListener('load', done); clearTimeout(cap); };
  }, [loaderOn]);

  // background pattern on <body>
  const pattern = opt(s.tc_pattern, 'none');
  useEffect(() => {
    document.body.dataset.tcPattern = pattern;
    return () => { delete document.body.dataset.tcPattern; };
  }, [pattern]);

  return (
    <div className="tc-s tc-frame">
      {(waOn || callOn || (topOn && showTop)) && (
        <div className={`tc-float tc-float-${side}`}>
          {topOn && showTop && (
            <button type="button" className={'tc-fbtn tc-fbtn-top' + whereClass(s.tc_totop_where, 'wide')} aria-label={t('للأعلى', 'للأعلى')} onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
              <Icon name="up" />
            </button>
          )}
          {callOn && (
            <a className={'tc-fbtn tc-fbtn-call' + whereClass(s.tc_call_where, 'mobile')} href={`tel:${call}`} aria-label={t('اتصل بنا', 'اتصل بنا')}><Icon name="phone" /></a>
          )}
          {waOn && (
            <a className={'tc-fbtn tc-fbtn-wa' + whereClass(s.tc_wa_where)} href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" aria-label={t('تواصل واتساب', 'تواصل واتساب')}>
              <Icon name="whatsapp" />
            </a>
          )}
        </div>
      )}

      {asBool(s.tc_popup_show, false) && <Popup s={s} t={t} />}

      {loaderOn && loading && (
        <div className="tc-loader" role="status" aria-label={t('جاري التحميل', 'جاري التحميل')}>
          <img src="/assets/images/logo-mark.svg" alt="" width={54} height={62} />
        </div>
      )}

      <CompareTray currency={cur} />
    </div>
  );
}

function Popup({ s, t }: { s: Record<string, unknown>; t: (v: unknown, d: string) => string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const repeat = opt(s.tc_popup_repeat, 'once');
  const delay = Math.min(120, Math.max(0, Number(s.tc_popup_delay ?? 6) || 0)) * 1000;
  const code = String(s.tc_popup_code ?? '').trim();
  const title = t(s.tc_popup_title, 'خصم 10% على أول طقم إطارات');
  const text = t(s.tc_popup_text, 'استخدم الكود عند الدفع. العرض لفترة محدودة.');
  const img = asImage(s.tc_popup_image, '');
  // a new code / title shows again even to visitors who closed the old one
  const stamp = `${code}|${title}`;

  useEffect(() => {
    let seen: string | null = null;
    try {
      const store = repeat === 'session' ? sessionStorage : localStorage;
      seen = store.getItem(POPUP_KEY);
      if (repeat === 'daily' && seen) {
        const [st, day] = seen.split('@');
        seen = st === stamp && day === new Date().toDateString() ? st : null;
      }
    } catch { /* storage blocked — show it */ }
    if (seen === stamp || !onThisScreen(where(s.tc_popup_where))) return;
    const id = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(id);
  }, [repeat, delay, stamp, s.tc_popup_where]);

  const close = () => {
    setOpen(false);
    try {
      const store = repeat === 'session' ? sessionStorage : localStorage;
      store.setItem(POPUP_KEY, repeat === 'daily' ? `${stamp}@${new Date().toDateString()}` : stamp);
    } catch { /* blocked */ }
  };
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  });
  if (!open || (!title && !code)) return null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { /* the code stays visible to copy by hand */ }
  };
  return (
    <div className="tc-modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.target === e.currentTarget && close()}>
      <div className={'tc-modal-box tc-popup' + (img ? ' has-img' : '')}>
        <button type="button" className="ic tc-popup-x" aria-label={t('إغلاق', 'إغلاق')} onClick={close} autoFocus><Icon name="close" /></button>
        {img && <img className="tc-popup-img" src={img} alt="" />}
        <div className="tc-popup-body">
          <span className="tc-popup-ic"><Icon name="gift" /></span>
          {title && <h2 className="h2">{title}</h2>}
          {text && <p className="lead">{text}</p>}
          {code && (
            <div className="tc-popup-code">
              <b dir="ltr">{code}</b>
              <button type="button" className="btn btn-gold" onClick={copy}>{copied ? t('تم النسخ ✓', 'تم النسخ ✓') : t('انسخ الكود', 'انسخ الكود')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
