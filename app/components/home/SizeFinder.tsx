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
import { HEAVY_INCH_WIDTHS, HEAVY_METRIC_WIDTHS, HEAVY_RIMS, PASSENGER_WIDTHS, TIRE_RATIOS, TIRE_RIMS, TRUCK_WIDTHS, isTruckWidth } from '../tires/sizes';
import type { TireSize } from '../tires/sizes';
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
  'شاحنات': 'Trucks',
  'باصات': 'Buses',
  'اقتراحات': 'Suggestions',
  'ما في مقاس بهالرقم': 'No size matches that number',
};
const tr = (s: string, lang: Lang) => (lang === 'en' ? EN[s.trim()] ?? s : s);

// "195, 205 ،215" → ['195', '205', '215'] — only values that exist in the list
const asList = (v: unknown, d: string, all: string[]) => {
  const raw = typeof v === 'string' && v.trim() ? v : d;
  const list = raw.split(/[\s,،]+/).filter(x => all.includes(x));
  return list.length ? list.slice(0, 6) : d.split(',');
};

type Key = 'w' | 'r' | 'j';

interface SizeFinderProps {
  data: Row;
  /** search results page: start from the searched size, own heading, no overlap on a hero */
  initial?: TireSize | null;
  /** the searched size, e.g. "205/55 R16" → heading «إطارات 205/55 R16» */
  heading?: string;
}

export function SizeFinder({ data, initial, heading }: SizeFinderProps) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = (v: unknown, d: string) => tr(asText(v, d, lang), lang);
  const navigate = useNavigate();

  // the merchant switches each vehicle family on/off; the results page keeps a searched one selectable
  const searchedHeavy = !!initial && (initial.rim.includes('.') || Number(initial.width) < 100 || Number(initial.width) >= 600);
  const trucks = asBool(data.show_trucks, true) || searchedHeavy;
  const buses = asBool(data.show_buses, false) || (!!initial && Number(initial.width) < 100);
  // main grid: passenger sizes
  const lists: Record<Key, string[]> = { w: PASSENGER_WIDTHS, r: TIRE_RATIOS, j: TIRE_RIMS };
  // own labelled groups under it, so these sizes are never lost at the bottom of the scroll
  const groups: { name: string; vals: Record<Key, string[]> }[] = [
    ...(trucks ? [{ name: 'شاحنات', vals: { w: [...TRUCK_WIDTHS, ...HEAVY_METRIC_WIDTHS], r: [], j: HEAVY_RIMS } }] : []),
    ...(buses ? [{ name: 'باصات', vals: { w: HEAVY_INCH_WIDTHS, r: [], j: trucks ? [] : ['22.5'] } }] : []),
  ];
  const all: Record<Key, string[]> = {
    w: [...lists.w, ...groups.flatMap(g => g.vals.w)],
    r: lists.r,
    j: [...lists.j, ...groups.flatMap(g => g.vals.j)],
  };
  const widths = all.w;
  const rims = all.j;
  const popular: Record<Key, string[]> = {
    w: asList(data.popular_widths, '195,205,215,225,265', widths),
    r: asList(data.popular_ratios, '55,60,65,70', TIRE_RATIOS),
    j: asList(data.popular_rims, '15,16,17,18', rims),
  };
  const first = (v: unknown, d: string, all: string[]) => (all.includes(String(v ?? '').trim()) ? String(v).trim() : d);
  const [value, setValue] = useState<Record<Key, string>>(() => ({
    w: first(initial?.width ?? data.default_width, '205', widths),
    r: first(initial?.ratio || data.default_ratio, '55', TIRE_RATIOS),
    j: first(initial?.rim ?? data.default_rim, '16', rims),
  }));
  const [open, setOpen] = useState<Key | null>(null);
  const [draft, setDraft] = useState<Record<Key, string | null>>({ w: null, r: null, j: null }); // typed text while editing
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
    if (truck) return Number(w) < 100 ? `${w}R${j}` : `${w}/${j}`; // 11R22.5 · 900/16
    const fmt = opt(data.query_format, 'slash'); // how the store names its products
    return fmt === 'r' ? `${w}/${r} R${j}` : fmt === 'r-tight' ? `${w}/${r}R${j}` : `${w}/${r}/${j}`;
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    // where the store writes sizes: product name / tags / options (all three by default)
    const by = opt(data.match_by, 'all');
    const m = by === 'all' ? '' : `&m=${by}`;
    navigate(`/search?q=${encodeURIComponent(query())}${m}`);
  };

  const overlap = !heading && asBool(data.overlap_hero, true);
  const kicker = t(data.kicker, 'البداية الصحيحة');
  // an emptied field hides the link (a missing one shows our default)
  const helpCleared = data.help_text === '' || (isRow(data.help_text) && !String(data.help_text[lang] ?? data.help_text.ar ?? '').trim());
  const helpText = helpCleared ? '' : t(data.help_text, 'كيف أعرف مقاسي؟');
  const helpLink = asLink(data.help_link, '/help#size');

  // each box: type the number (suggestions appear as you type) or open the full list with the arrow
  const picker = (k: Key, label: string, en: string) => {
    const isOpen = open === k;
    const disabled = k === 'r' && truck; // 900/16 and 11R22.5 have no profile
    const typing = draft[k] !== null;
    const q = (draft[k] ?? '').trim();
    const suggestions = q
      ? [...all[k].filter(v => v.startsWith(q)), ...all[k].filter(v => !v.startsWith(q) && v.includes(q))].slice(0, 12)
      : [];
    const pickValue = (v: string) => {
      setValue(s => ({ ...s, [k]: v }));
      setDraft(d => ({ ...d, [k]: null }));
      setOpen(null);
    };
    const commit = () => {
      if (!typing) return;
      if (all[k].includes(q)) pickValue(q);
      else if (suggestions[0] && q) pickValue(suggestions[0]);
      else setDraft(d => ({ ...d, [k]: null }));
    };
    const opts = (vals: string[]) =>
      vals.map(v => (
        <button type="button" key={v} className={'tc-dd-o' + (v === value[k] ? ' on' : '')} onMouseDown={e => e.preventDefault()} onClick={() => pickValue(v)}>
          {v}
        </button>
      ));
    return (
      <div className={'tc-sel' + (isOpen ? ' open' : '')}>
        <label htmlFor={`tc-in-${k}`} id={`tc-sel-${k}`}>
          {t(label, label)} <span>{en}</span>
        </label>
        <div className={'tc-dd-btn tc-dd-combo' + (disabled ? ' is-off' : '')}>
          <input
            id={`tc-in-${k}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={`tc-list-${k}`}
            disabled={disabled}
            value={disabled ? '—' : typing ? (draft[k] as string) : value[k]}
            onFocus={e => e.currentTarget.select()}
            onClick={e => e.stopPropagation()}
            onChange={e => { setDraft(d => ({ ...d, [k]: e.target.value.replace(/[^\d.rR]/g, '') })); setOpen(k); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
            onBlur={commit}
          />
          <button
            type="button"
            className="tc-dd-arrow"
            aria-label={isEn ? 'Show all sizes' : 'عرض كل المقاسات'}
            disabled={disabled}
            onClick={e => { e.stopPropagation(); setDraft(d => ({ ...d, [k]: null })); setOpen(isOpen ? null : k); }}
          >
            <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
        {isOpen && (
          <div className="tc-dd-panel" role="listbox" id={`tc-list-${k}`} aria-labelledby={`tc-sel-${k}`}>
            {typing && q ? (
              <>
                <div className="t"><span>{tr('اقتراحات', lang)}</span><span>{suggestions.length}</span></div>
                {suggestions.length ? <div className="tc-dd-grid tc-dd-suggest">{opts(suggestions)}</div> : <p className="tc-dd-none">{tr('ما في مقاس بهالرقم', lang)}</p>}
              </>
            ) : (
              <>
                <div className="t"><span>{tr('الأكثر طلباً', lang)}</span></div>
                <div className="tc-dd-pop">{opts(popular[k])}</div>
                <div className="t"><span>{tr('كل القيم', lang)}</span><span>{lists[k].length}</span></div>
                <div className="tc-dd-grid">{opts(lists[k])}</div>
                {groups.filter(g => g.vals[k].length).map(g => (
                  <div key={g.name}>
                    <div className="t tc-dd-group"><span>{tr(g.name, lang)}</span><span>{g.vals[k].length}</span></div>
                    <div className="tc-dd-grid tc-dd-trucks">{opts(g.vals[k])}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={['tc', 'tc-finder-band', overlap ? 'tc-finder--overlap' : '', heading ? 'tc-finder--page' : '', customClass(data.custom_class)].join(' ')}>
      <section className="tc-wrap tc-finder-wrap" id="size">
        <form className="tc-finder" ref={root} onSubmit={submit}>
          <div className="tc-finder__title">
            <div>
              {kicker && !heading && <span className="eb">{kicker}</span>}
              {heading ? <h1>{isEn ? <><bdi>{heading}</bdi> tires</> : <>إطارات <bdi>{heading}</bdi></>}</h1> : <h2>{t(data.title, 'اختر مقاس إطارك')}</h2>}
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
