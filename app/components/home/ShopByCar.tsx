/**
 * Component #7 — تسوّق حسب سيارتك (`home.shop-by-car`).
 * Design: design/final.html → `#cars` (make → model → year columns + dark result card).
 * Cars: a pasted Excel list (replaces all), or the ready-made list (tc/cars.ts) + manual rows.
 * The button opens the exact-size search.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { parseTireSize, tireSizeQuery, formatTireSize } from '../tires/sizes';
import { asBool, asText, makeT, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';
import { BUILTIN_CARS, CAR_NAMES_EN } from './tc/cars';
import type { CarRow } from './tc/cars';

const EN: Record<string, string> = {
  'ما تعرف مقاسك؟': "Don't know your size?", 'اختر سيارتك، ونطلع لك المقاس.': "Pick your car — we'll find the size.",
  'الماركة، الموديل، السنة — وبس.': 'Make, model, year — that’s it.',
  'المقاس المرجعي لهذه السيارة حسب بيانات المتجر. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.': 'Reference size for this car, based on the store’s data. Double-check it on your current tire or the driver-door sticker.',
  'اعرض الإطارات': 'Show tires', 'اختر سيارتك عشان نعرض المقاس والإطارات المتوفرة.': 'Pick your car to see its size and available tires.',
};
type Car = CarRow;

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
/** ٢٠١٨ / ۲۰۱۸ → 2018 (merchants paste from Arabic-locale spreadsheets) */
const latinDigits = (s: string) => s.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0));

export type CarLineError = 'columns' | 'year' | 'range' | 'size';
const validYear = (y: number) => Number.isInteger(y) && y >= 1950 && y <= 2100;
/** `to` is undefined (or 0) when the end year is absent; any other value must be a real year */
const toCar = (make: string, model: string, from: number, to: number | undefined, sizeText: string): Car | CarLineError => {
  if (!make || !model) return 'columns';
  const hasTo = to !== undefined && to !== 0;
  if (!validYear(from) || (hasTo && !validYear(to as number))) return 'year';
  if (hasTo && (to as number) < from) return 'range'; // «2024-2018» is a typo, not a one-year car
  const size = parseTireSize(sizeText);
  if (!size) return 'size';
  return { make: clean(make), model: clean(model), from, to: hasTo ? (to as number) : from, size: formatTireSize(size) };
};

/**
 * Pasted from Excel / Google Sheets: one car per line, columns separated by tab, comma, «،», «;» or «|»:
 *   make, model, from, to, size   — or —   make, model, 2018-2024, size
 * Arabic digits are accepted. A header row (no digits at all) is ignored; every other line that cannot be
 * read is REPORTED (line number + why) instead of silently dropped.
 */
export function readCarsPaste(text: string): { cars: Car[]; rejected: { line: number; reason: CarLineError }[] } {
  const cars: Car[] = [];
  const rejected: { line: number; reason: CarLineError }[] = [];
  latinDigits(text).split(/\r?\n/).forEach((raw, i) => {
    if (!raw.trim() || !/\d/.test(raw)) return;
    const c = raw.split(/\t|,|،|;|\|/).map(x => x.trim()).filter(Boolean);
    let r: Car | CarLineError = 'columns';
    if (c.length >= 5) r = toCar(c[0], c[1], Number(c[2]), Number(c[3]), c.slice(4).join(' '));
    else if (c.length === 4) {
      const [from, to] = c[2].split(/\s*[-–]\s*/).map(Number);
      r = toCar(c[0], c[1], from, to, c[3]);
    }
    if (typeof r === 'string') rejected.push({ line: i + 1, reason: r });
    else cars.push(r);
  });
  return { cars, rejected };
}
export const parseCarsPaste = (text: string): Car[] => readCarsPaste(text).cars;

const REASON: Record<CarLineError, string> = { columns: 'أعمدة ناقصة', year: 'السنة غير صحيحة', range: 'سنة البداية أكبر من النهاية', size: 'المقاس غير مقروء' };

/** true inside Salla's theme editor preview (an iframe under a salla.* page) — merchant notes are meant for it only; Firefox exposes no ancestor origin, so the note may simply not show there */
function useInEditor() {
  const [inEditor, set] = useState(false);
  useEffect(() => {
    try {
      if (window.self === window.top) return;
      // inside an iframe whose parent is a Salla site (the theme editor); an unrelated embed never sees merchant notes
      const salla = /(^|.)salla.(sa|com|dev)$/i;
      const host = (u: string) => { try { return new URL(u).hostname; } catch { return ''; } };
      const origins = Array.from((window.location as unknown as { ancestorOrigins?: ArrayLike<string> }).ancestorOrigins ?? []);
      set(origins.some(o => salla.test(host(o))) || salla.test(host(document.referrer)));
    } catch {
      set(false);
    }
  }, []);
  return inEditor;
}

export function ShopByCar({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const pasteText = asText(data.cars_paste, '', lang);
  const report = useMemo(() => readCarsPaste(pasteText), [pasteText]);
  const inEditor = useInEditor();
  const cars: Car[] = useMemo(() => {
    // 1) a pasted list replaces everything; 2) otherwise ready-made list (unless cleared) + manual rows (manual wins)
    // a pasted list is THE list: when it has text but nothing valid, no other list is shown in its place
    if (pasteText.trim()) return report.cars;
    const manual = rows(data.cars, 'cars')
      .map(r => toCar(asText(r.make, '', lang), asText(r.model, '', lang), Number(r.year_from) || 0, Number(r.year_to) || 0, asText(r.size, '', lang)))
      .filter((x): x is Car => typeof x === 'object' && x !== null);
    if (!asBool(data.use_builtin, true)) return manual;
    const key = (c: Car) => `${c.make}|${c.model}`;
    const overridden = new Set(manual.map(key));
    return [...BUILTIN_CARS.filter(c => !overridden.has(key(c))), ...manual];
  }, [data.cars, data.use_builtin, lang, pasteText, report]);

  const makes = [...new Set(cars.map(c => c.make))];
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(0);
  // a model may have several rows (generations with different sizes)
  const models = [...new Set(cars.filter(c => c.make === make).map(c => c.model))];
  const gens = cars.filter(c => c.make === make && c.model === model);
  const years = [...new Set(gens.flatMap(g => Array.from({ length: g.to - g.from + 1 }, (_, i) => g.from + i)))].sort((x, y) => y - x);
  const car = year ? gens.find(g => year >= g.from && year <= g.to) : undefined;
  const parsed = car ? parseTireSize(car.size) : null;
  const pick = (f: () => void) => () => { f(); };
  const show = (s: string) => (isEn ? CAR_NAMES_EN[s] ?? s : s); // English names for the ready-made list

  const btn = (label: string, on: boolean, onClick: () => void, cls?: string) => (
    <button type="button" key={label} className={[cls, on ? 'on' : ''].filter(Boolean).join(' ') || undefined} onClick={onClick}>{label}</button>
  );

  // merchant-only notes (editor preview): unreadable pasted lines, and rows of one model with overlapping years but different sizes
  const lines: string[] = [];
  if (inEditor && pasteText.trim() && report.rejected.length > 0) {
    lines.push(`قُبلت ${report.cars.length} سيارة، ورُفض ${report.rejected.length} سطر — ${report.rejected.slice(0, 6).map(r => `سطر ${r.line}: ${REASON[r.reason]}`).join('، ')}`);
  }
  if (inEditor) {
    const clashes: string[] = [];
    for (let a = 0; a < cars.length && clashes.length < 4; a++) {
      for (let b = a + 1; b < cars.length; b++) {
        const x = cars[a], y = cars[b];
        if (x.make === y.make && x.model === y.model && x.size !== y.size && x.from <= y.to && y.from <= x.to) {
          clashes.push(`${x.make} ${x.model} (${x.from}–${x.to} و${y.from}–${y.to})`);
          break;
        }
      }
    }
    if (clashes.length) lines.push(`سنوات متداخلة بمقاسين مختلفين: ${clashes.join('، ')} — الزبون يشوف المقاس الأول، راجع السنوات`);
  }
  const note = lines.length > 0 && <p className="tc-editor-note" role="note">{`تنبيه للتاجر (يظهر لك بالمحرر فقط): ${lines.join(' · ')}`}</p>;
  if (!cars.length) return note ? <Section data={data}><div className="wrap">{note}</div></Section> : null;

  return (
    <Section data={data}>
      <section className={'sec cars' + (asBool(data.gold_bg, true) ? '' : ' tc-plain')} id="cars">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">{t(data.kicker, 'ما تعرف مقاسك؟')}</span>
              <h2 className="h2">{t(data.title, 'اختر سيارتك، ونطلع لك المقاس.')}</h2>
            </div>
            <p className="lead">{t(data.text, 'الماركة، الموديل، السنة — وبس.')}</p>
          </div>
          {note}
          <div className="car-ui">
            <div className="car-col">
              <span className="cstep">1 · {isEn ? 'Make' : 'الماركة'}</span>
              <div className="makes">{makes.map(m => btn(show(m), m === make, pick(() => { setMake(m); setModel(''); setYear(0); })))}</div>
            </div>
            <div className="car-col">
              <span className="cstep">2 · {isEn ? 'Model' : 'الموديل'}</span>
              <div className="list">
                {make ? models.map(m => btn(show(m), m === model, pick(() => { setModel(m); setYear(0); }), 'ar')) : <p className="hint">{isEn ? 'Pick the make first' : 'اختر الماركة أول'}</p>}
              </div>
            </div>
            <div className="car-col">
              <span className="cstep">3 · {isEn ? 'Year' : 'السنة'}</span>
              <div className="list">
                {model ? years.map(y => btn(String(y), y === year, pick(() => setYear(y)))) : <p className="hint">{isEn ? 'Pick the model' : 'اختر الموديل'}</p>}
              </div>
            </div>
            <div className="car-out">
              {car && parsed ? (
                <>
                  <span className="cstep" style={{ color: '#9a9ea2' }}>{`${show(make)} ${show(model)} ${year}`}</span>
                  <div className="cres">{car.size}</div>
                  <p>{t(data.result_text, 'المقاس المرجعي لهذه السيارة حسب بيانات المتجر. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.')}</p>
                  <Link className="btn btn-gold" to={`/search?q=${encodeURIComponent(tireSizeQuery(parsed))}`}>{t(data.btn_text, 'اعرض الإطارات')}</Link>
                </>
              ) : (
                <>
                  <span className="cstep" style={{ color: '#9a9ea2' }}>{isEn ? 'Your size' : 'المقاس المناسب'}</span>
                  <div className="cres">—</div>
                  <p>{t(data.empty_text, 'اختر سيارتك عشان نعرض المقاس والإطارات المتوفرة.')}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Section>
  );
}
