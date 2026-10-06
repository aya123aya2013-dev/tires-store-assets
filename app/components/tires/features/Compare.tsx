/**
 * Tire comparison — up to 3 tires side by side (size, price, set of four, year, brand).
 * Cards get a small «قارن» toggle; a tray appears at the bottom once one is picked and opens
 * the comparison table. Setting: tc_compare. Kept in the visitor's browser only.
 */
import { useEffect, useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { asBool, makeT, opt, useLang } from '../../home/fields';
import { whereClass } from '../../layout/devices';
import { useModal } from '../../common/useModal';
import { Icon } from '../../home/tc/Icon';

export interface CompareItem { id: string | number; name: string; url: string; image?: string; price: number; currency?: string; size?: string; year?: string | number; brand?: string }

const KEY = 'tc-compare';
const EVT = 'tc-compare';
const MAX = 3;
const EN: Record<string, string> = {
  'قارن': 'Compare', 'مقارنة الإطارات': 'Compare tires', 'قارن الآن': 'Compare now', 'مسح': 'Clear', 'إغلاق': 'Close',
  'المقاس': 'Size', 'سعر الحبة': 'Per tire', 'سعر الطقم (4)': 'Set of 4', 'سنة الصنع': 'Year', 'الماركة': 'Brand',
  'تقدر تقارن 3 إطارات بالكثير': 'You can compare up to 3 tires', 'شوف المنتج': 'View',
};

const read = (): CompareItem[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const write = (v: CompareItem[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new Event(EVT)); } catch { /* blocked */ } };

export function useCompareEnabled() {
  const { theme } = useTwilight();
  return asBool((theme?.settings as Record<string, unknown> | undefined)?.tc_compare, true);
}
export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>([]);
  useEffect(() => {
    const on = () => setItems(read());
    on();
    window.addEventListener(EVT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(EVT, on); window.removeEventListener('storage', on); };
  }, []);
  return items;
}

/** returns false when the list is already full */
export function toggleCompare(item: CompareItem): boolean {
  const cur = read();
  if (cur.some(x => String(x.id) === String(item.id))) { write(cur.filter(x => String(x.id) !== String(item.id))); return true; }
  if (cur.length >= MAX) return false;
  write([...cur, item]);
  return true;
}

export function useCompareWhere() {
  const { theme } = useTwilight();
  return (theme?.settings as Record<string, unknown> | undefined)?.tc_compare_where;
}

export function CompareToggle({ item, className = '' }: { item: CompareItem; className?: string }) {
  const enabled = useCompareEnabled();
  const items = useCompare();
  const t = makeT(useLang(), EN);
  const [full, setFull] = useState(false);
  if (!enabled) return null;
  const on = items.some(x => String(x.id) === String(item.id));
  return (
    <button
      type="button"
      className={'tc-cmp-btn' + (on ? ' on' : '') + className}
      aria-pressed={on}
      title={full ? t('تقدر تقارن 3 إطارات بالكثير', 'تقدر تقارن 3 إطارات بالكثير') : undefined}
      onClick={() => setFull(!toggleCompare(item))}
    >
      <Icon name="scale" style={{ width: 15, height: 15 }} /> {t('قارن', 'قارن')}
    </button>
  );
}

/** bottom tray + the comparison dialog (mounted once in the layout) */
export function CompareTray({ currency }: { currency: (code?: string) => React.ReactNode }) {
  const enabled = useCompareEnabled();
  const { theme } = useTwilight();
  const ts = (theme?.settings ?? {}) as Record<string, unknown>;
  const perSet = opt(ts.tc_sale_unit, 'tire') === 'set';
  // the tray follows «يظهر على» like the «قارن» buttons (S3-12)
  const trayWhere = whereClass(ts.tc_compare_where, 'wide');
  const items = useCompare();
  const lang = useLang();
  const t = makeT(lang, EN);
  const [open, setOpen] = useState(false);
  const boxRef = useModal<HTMLDivElement>(open);
  useEffect(() => { if (!items.length) setOpen(false); }, [items.length]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);
  if (!enabled || !items.length) return null;

  const rows: [string, (p: CompareItem) => React.ReactNode][] = [
    ['المقاس', p => <b dir="ltr">{p.size || '—'}</b>],
    // «سعر المنتج عندك»: per tire → tire + set of four; per set → the set price as is
    ...(perSet
      ? ([['سعر الطقم (4)', p => <b>{p.price} {currency(p.currency)}</b>]] as [string, (p: CompareItem) => React.ReactNode][])
      : ([
          ['سعر الحبة', p => <>{p.price} {currency(p.currency)}</>],
          ['سعر الطقم (4)', p => <b>{p.price * 4} {currency(p.currency)}</b>],
        ] as [string, (p: CompareItem) => React.ReactNode][])),
    ['سنة الصنع', p => p.year || '—'],
    ['الماركة', p => p.brand || '—'],
  ];

  return (
    <div className="tc-s tc-frame">
      <div className={'tc-cmp-tray' + trayWhere} role="region" aria-label={t('مقارنة الإطارات', 'مقارنة الإطارات')}>
        <div className="tc-cmp-thumbs">
          {items.map(p => (
            <span key={p.id} className="tc-cmp-thumb">
              {p.image ? <img src={p.image} alt="" /> : <Icon name="tire" />}
              <button type="button" aria-label={`${t('مسح', 'مسح')} ${p.name}`} onClick={() => toggleCompare(p)}><Icon name="close" style={{ width: 12, height: 12 }} /></button>
            </span>
          ))}
        </div>
        <button type="button" className="btn btn-gold" disabled={items.length < 2} onClick={() => setOpen(true)}>
          {t('قارن الآن', 'قارن الآن')} ({items.length}/{MAX})
        </button>
        <button type="button" className="link" onClick={() => items.forEach(toggleCompare)}>{t('مسح', 'مسح')}</button>
      </div>

      {open && (
        <div className="tc-modal" role="dialog" aria-modal="true" aria-label={t('مقارنة الإطارات', 'مقارنة الإطارات')} onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div ref={boxRef} tabIndex={-1} className="tc-modal-box tc-cmp-box">
            <div className="tc-modal-head">
              <h2 className="h2" style={{ fontSize: 22 }}>{t('مقارنة الإطارات', 'مقارنة الإطارات')}</h2>
              <button type="button" className="ic" aria-label={t('إغلاق', 'إغلاق')} onClick={() => setOpen(false)}><Icon name="close" /></button>
            </div>
            <div className="tc-cmp-scroll">
              <table className="tc-cmp-table">
                <thead>
                  <tr>
                    <th />
                    {items.map(p => (
                      <th key={p.id} scope="col">
                        {p.image && <img src={p.image} alt="" />}
                        <Link to={p.url}>{p.name}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, cell]) => (
                    <tr key={label}>
                      <th scope="row">{t(label, label)}</th>
                      {items.map(p => <td key={p.id}>{cell(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
