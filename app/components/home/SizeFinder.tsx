/**
 * Component #2 — أداة اختيار المقاس (`home.size-finder`).
 * Design: design/final.html → "size finder" (dark card riding on the hero's edge,
 * 3 pickers with a "most requested" row + full grid, gold submit button).
 * Styles: styles/04-components/tire-components.scss (scoped under `.tc-finder`).
 */
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import { TIRE_RATIOS, TIRE_RIMS, TIRE_WIDTHS, isTruckWidth } from '../tires/sizes';
import { asBool, asLink, asText, customClass, isRow, opt, useLang } from './fields';
import type { Lang, Row } from './fields';

const EN: Record<string, string> = {
  'البداية الصحيحة': 'The right start',
  'اختر مقاس إطارك': 'Choose your tire size',
  'كيف أعرف مقاسي؟': 'How do I find my size?',
  'اعرض الإطارات': 'Show tires',
  'العرض': 'Width',
  'نسبة الارتفاع': 'Profile',
  'قطر الجنط': 'Rim',
  'الأكثر طلباً': 'Most requested',
  'كل القيم': 'All values',
};
const tr = (s: string, lang: Lang) => (lang === 'en' ? EN[s.trim()] ?? s : s);

// "195, 205 ،215" → ['195', '205', '215'] — only values that exist in the list
const asList = (v: unknown, d: string, all: string[]) => {
  const raw = typeof v === 'string' && v.trim() ? v : d;
  const list = raw.split(/[\s,،]+/).filter(x => all.includes(x));
  return list.length ? list.slice(0, 6) : d.split(',');
};

type Key = 'w' | 'r' | 'j';

export function SizeFinder({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = (v: unknown, d: string) => tr(asText(v, d, lang), lang);
  const navigate = useNavigate();

  const trucks = asBool(data.show_trucks, true);
  const widths = trucks ? TIRE_WIDTHS : TIRE_WIDTHS.filter(w => !isTruckWidth(w));
  const lists: Record<Key, string[]> = { w: widths, r: TIRE_RATIOS, j: TIRE_RIMS };
  const popular: Record<Key, string[]> = {
    w: asList(data.popular_widths, '195,205,215,225,265', widths),
    r: asList(data.popular_ratios, '55,60,65,70', TIRE_RATIOS),
    j: asList(data.popular_rims, '15,16,17,18', TIRE_RIMS),
  };
  const first = (v: unknown, d: string, all: string[]) => (all.includes(String(v ?? '').trim()) ? String(v).trim() : d);
  const [value, setValue] = useState<Record<Key, string>>(() => ({
    w: first(data.default_width, '205', widths),
    r: first(data.default_ratio, '55', TIRE_RATIOS),
    j: first(data.default_rim, '16', TIRE_RIMS),
  }));
  const [open, setOpen] = useState<Key | null>(null);
  const root = useRef<HTMLFormElement>(null);

  // close on outside click / Escape (same as the approved design)
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const truck = isTruckWidth(value.w);
  const query = () => {
    const { w, r, j } = value;
    if (truck) return `${w}/${j}`;
    const fmt = opt(data.query_format, 'slash'); // how the store names its products
    return fmt === 'r' ? `${w}/${r} R${j}` : fmt === 'r-tight' ? `${w}/${r}R${j}` : `${w}/${r}/${j}`;
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query())}`);
  };

  const overlap = asBool(data.overlap_hero, true);
  const kicker = t(data.kicker, 'البداية الصحيحة');
  // an emptied field hides the link (a missing one shows our default)
  const helpCleared = data.help_text === '' || (isRow(data.help_text) && !String(data.help_text[lang] ?? data.help_text.ar ?? '').trim());
  const helpText = helpCleared ? '' : t(data.help_text, 'كيف أعرف مقاسي؟');
  const helpLink = asLink(data.help_link, '/help#size');

  const picker = (k: Key, label: string, en: string) => {
    const isOpen = open === k;
    const pickValue = (v: string) => { setValue(s => ({ ...s, [k]: v })); setOpen(null); };
    const disabled = k === 'r' && truck; // truck sizes (900/16) have no profile
    const opts = (vals: string[]) =>
      vals.map(v => (
        <button type="button" key={v} className={'tc-dd-o' + (v === value[k] ? ' on' : '')} onClick={() => pickValue(v)}>
          {v}
        </button>
      ));
    return (
      <div className={'tc-sel' + (isOpen ? ' open' : '')}>
        <label id={`tc-sel-${k}`}>
          {t(label, label)} <span>{en}</span>
        </label>
        <button
          type="button"
          className="tc-dd-btn"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`tc-sel-${k}`}
          disabled={disabled}
          onClick={e => { e.stopPropagation(); setOpen(isOpen ? null : k); }}
        >
          <span>{disabled ? '—' : value[k]}</span>
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {isOpen && (
          <div className="tc-dd-panel" role="listbox" aria-labelledby={`tc-sel-${k}`}>
            <div className="t"><span>{tr('الأكثر طلباً', lang)}</span></div>
            <div className="tc-dd-pop">{opts(popular[k])}</div>
            <div className="t"><span>{tr('كل القيم', lang)}</span><span>{lists[k].length}</span></div>
            <div className="tc-dd-grid">{opts(lists[k])}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={['tc', 'tc-finder-band', overlap ? 'tc-finder--overlap' : '', customClass(data.custom_class)].join(' ')}>
      <section className="tc-wrap tc-finder-wrap" id="size">
        <form className="tc-finder" ref={root} onSubmit={submit}>
          <div className="tc-finder__title">
            <div>
              {kicker && <span className="eb">{kicker}</span>}
              <h2>{t(data.title, 'اختر مقاس إطارك')}</h2>
            </div>
            {helpText && <Link to={helpLink}>{helpText} ↗</Link>}
          </div>
          {picker('w', 'العرض', 'WIDTH')}
          {picker('r', 'نسبة الارتفاع', 'PROFILE')}
          {picker('j', 'قطر الجنط', 'RIM')}
          <button className="tc-finder__go" type="submit">
            {t(data.btn_text, 'اعرض الإطارات')} <span aria-hidden="true">{isEn ? '→' : '←'}</span>
          </button>
        </form>
      </section>
    </div>
  );
}
