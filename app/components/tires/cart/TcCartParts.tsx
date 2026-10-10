/**
 * Cart pieces — design/store/cart.html plus the agreed tire extras:
 *  - free-delivery bar (threshold set by the merchant; Salla's own shipping rules still decide),
 *  - «الطقم 4» hint when the tire count isn't a pair / set,
 *  - installation appointment: Salla has no booking, so the shopper sends the cart over
 *    WhatsApp (or writes it in the order notes) and the store confirms the time.
 * Every piece has its own switch in the «السلة» settings group.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, makeT, opt, useLang } from '../../home/fields';
import { useWhatsappNumber, waLink } from '../../layout/contact';

const EN: Record<string, string> = {
  'سلة المشتريات': 'Shopping cart',
  'سلتك فاضية.': 'Your cart is empty.',
  'اختر مقاسك ونطلع لك الإطارات المناسبة.': 'Pick your size and we will show the right tires.',
  'تسوّق الإطارات': 'Shop tires',
  'باقي': 'Add',
  'وتوصيلك مجاني': 'more for free delivery',
  'مبروك! التوصيل مجاني': 'Free delivery unlocked!',
  'موعد التركيب': 'Installation time',
  'احجز موعدك على واتساب': 'Book on WhatsApp',
  'ملخص الطلب': 'Order summary',
  'دفع آمن عبر سلة · مدى · Apple Pay · تابي · تمارا': 'Secure checkout · Mada · Apple Pay · Tabby · Tamara',
};

export type CartS = Record<string, unknown>;
export const useCartSettings = () => {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as CartS;
};
export const useCartT = () => makeT(useLang(), EN);

const num = (v: unknown): number => {
  if (v && typeof v === 'object' && 'amount' in v) return Number((v as { amount: unknown }).amount) || 0;
  return Number(v) || 0;
};
/** the cart's goods total, whatever shape the API gives (number or Money) */
export const cartSubtotal = (cart: Record<string, unknown>): number =>
  num(cart.sub_total ?? cart.total_amount ?? cart.total);

/** «باقي 240 ر.س وتوصيلك مجاني» — a progress bar toward the merchant's threshold. */
export function TcFreeShip({ subtotal, currency }: { subtotal: number; currency?: string }) {
  const s = useCartSettings();
  const t = useCartT();
  const goal = Number(s.tc_cart_free_ship) || 0;
  if (!asBool(s.tc_cart_ship_bar, true) || goal <= 0) return null;
  const left = Math.max(0, Math.ceil(goal - subtotal));
  const pct = Math.min(100, Math.round((subtotal / goal) * 100));
  return (
    <div className="box tc-fship">
      <p>
        {left > 0 ? (
          <>{t(undefined, 'باقي')} <b>{left.toLocaleString('en')} {currency}</b> {t(undefined, 'وتوصيلك مجاني')}</>
        ) : (
          <b>{t(undefined, 'مبروك! التوصيل مجاني')}</b>
        )}
      </p>
      <div className="tc-fship-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** One or three tires in the cart: most cars change tires in pairs or a full set. */
export function TcSetHint({ tires }: { tires: number }) {
  const s = useCartSettings();
  const t = useCartT();
  if (!asBool(s.tc_cart_set_hint, true) || opt(s.tc_sale_unit, 'tire') === 'set') return null;
  if (tires <= 0 || tires % 2 === 0) return null;
  return (
    <p className="tc-sethint" role="note">
      {t(s.tc_cart_set_hint_text, 'عندك إطار مفرد بالسلة — الأفضل تبديل الإطارات زوج على نفس المحور، أو طقم 4 كامل.')}
    </p>
  );
}

/** «موعد التركيب» — the cart goes to WhatsApp with the items; the store confirms a time. */
export function TcAppointment({ items }: { items: { name?: string; quantity?: number }[] }) {
  const s = useCartSettings();
  const t = useCartT();
  const wa = useWhatsappNumber();
  if (!asBool(s.tc_cart_appt, true) || opt(s.tc_store_type, 'install') === 'sale') return null;
  const list = items.map(i => `• ${i.name ?? ''} × ${i.quantity ?? 1}`).join('\n');
  const msg = `${t(s.tc_cart_appt_msg, 'السلام عليكم، بدي أحجز موعد تركيب لـ:')}\n${list}`;
  return (
    <div className="box tc-appt">
      <h3>{t(s.tc_cart_appt_title, 'موعد التركيب')}</h3>
      <p>{t(s.tc_cart_appt_text, 'أكمل طلبك واكتب الوقت المناسب لك بملاحظات الطلب، أو احجز الموعد مباشرة على واتساب.')}</p>
      {wa && (
        <a className="btn btn-line" href={waLink(wa, msg)} target="_blank" rel="noopener noreferrer">
          {t(undefined, 'احجز موعدك على واتساب')}
        </a>
      )}
    </div>
  );
}
