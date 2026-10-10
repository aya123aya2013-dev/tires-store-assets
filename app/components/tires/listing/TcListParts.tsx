/**
 * Category / search page pieces — design/store/category.html (`.fbar` size bar) plus the
 * agreed tire extras: «ما لقيت مقاسك؟» (WhatsApp with the size already written).
 * Every piece has its own switch in the «التصنيف والبحث» settings group.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { asBool, makeT, opt, useLang } from '../../home/fields';
import { PASSENGER_WIDTHS, TIRE_RATIOS, TIRE_RIMS, TRUCK_WIDTHS, HEAVY_RIMS, formatTireSize, isTruckWidth, parseTireSize, tireSizeQuery } from '../sizes';
import type { TireSize } from '../sizes';
import { saveMySize, useMySize, useMySizeEnabled } from '../features/MySize';
import { useWhatsappNumber, waLink } from '../../layout/contact';

const EN: Record<string, string> = {
  'مقاسك': 'Your size',
  'العرض': 'Width',
  'النسبة': 'Profile',
  'الجنط': 'Rim',
  'اعرض': 'Show',
  'تسوّق الإطارات': 'Shop tires',
  'ما لقيت مقاسك؟': "Can't find your size?",
  'ابعتلنا المقاس على واتساب ونأمّنه لك بأسرع وقت.': 'Send us the size on WhatsApp and we will source it for you.',
  'اسألنا على واتساب': 'Ask on WhatsApp',
  'نتائج المقاس': 'Results for size',
};

export type ListSettings = Record<string, unknown>;
export const useListSettings = () => {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as ListSettings;
};
export const useListT = () => makeT(useLang(), EN);

const sel = (v: string | undefined, all: string[], d: string) => (v && all.includes(v) ? v : d);

/** The dark «مقاسك» bar: width · profile · rim → the size search (saved as «مقاسي»). */
export function TcFbar({ initial }: { initial?: TireSize | null }) {
  const t = useListT();
  const s = useListSettings();
  const navigate = useNavigate();
  const remember = useMySizeEnabled();
  const mine = parseTireSize(useMySize());
  const start = initial ?? mine;
  const widths = [...PASSENGER_WIDTHS, ...TRUCK_WIDTHS];
  const rims = [...TIRE_RIMS, ...HEAVY_RIMS];
  const [w, setW] = useState(() => sel(start?.width, widths, '205'));
  const [r, setR] = useState(() => sel(start?.ratio, TIRE_RATIOS, '55'));
  const [j, setJ] = useState(() => sel(start?.rim, rims, '16'));
  const truck = isTruckWidth(w);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = tireSizeQuery({ width: w, ratio: truck ? '' : r, rim: j });
    const by = opt(s.tc_spec_source, 'all');
    saveMySize(q, remember);
    navigate(`/search?q=${encodeURIComponent(q)}${by === 'all' ? '' : `&m=${by}`}`);
  };

  return (
    <form className="fbar" onSubmit={submit}>
      <span className="t">{t(s.tc_list_fbar_title, 'مقاسك')}</span>
      <div>
        <label htmlFor="tc-fw">{t(undefined, 'العرض')}</label>
        <select id="tc-fw" value={w} onChange={e => setW(e.target.value)}>
          {widths.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="tc-fr">{t(undefined, 'النسبة')}</label>
        <select id="tc-fr" value={r} onChange={e => setR(e.target.value)} disabled={truck}>
          {TIRE_RATIOS.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="tc-fj">{t(undefined, 'الجنط')}</label>
        <select id="tc-fj" value={j} onChange={e => setJ(e.target.value)}>
          {rims.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <button className="btn btn-gold" type="submit">
        {t(undefined, 'اعرض')} <span aria-hidden="true">←</span>
      </button>
    </form>
  );
}

/** «ما لقيت مقاسك؟» — WhatsApp with the searched size in the message. Hidden without a number. */
export function TcNoFind({ size }: { size?: TireSize | null }) {
  const t = useListT();
  const s = useListSettings();
  const num = useWhatsappNumber();
  if (!asBool(s.tc_list_nofind, true) || !num) return null;
  const sz = size ? formatTireSize(size) : '';
  const msg = `${t(s.tc_list_nofind_msg, 'السلام عليكم، أبحث عن مقاس')}${sz ? ` ${sz}` : ''}`;
  return (
    <div className="tc-nofind">
      <div>
        <b>{t(s.tc_list_nofind_title, 'ما لقيت مقاسك؟')}</b>
        <small>{t(s.tc_list_nofind_text, 'ابعتلنا المقاس على واتساب ونأمّنه لك بأسرع وقت.')}</small>
      </div>
      <a className="btn btn-gold" href={waLink(num, msg)} target="_blank" rel="noopener noreferrer">
        {t(undefined, 'اسألنا على واتساب')}
      </a>
    </div>
  );
}
