/**
 * Component #7 — تسوّق حسب سيارتك (`home.shop-by-car`).
 * Design: design/final.html → `#cars` (make → model → year columns + dark result card).
 * Cars: a pasted Excel list (replaces all), or the ready-made list (tc/cars.ts) + manual rows.
 * The button opens the exact-size search.
 */
import { useMemo, useState } from 'react';
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
  'المقاس الأصلي من المصنع. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.': 'The factory size. Double-check it on your current tire or the driver-door sticker.',
  'اعرض الإطارات': 'Show tires', 'اختر سيارتك عشان نعرض المقاس والإطارات المتوفرة.': 'Pick your car to see its size and available tires.',
};
type Car = CarRow;

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const toCar = (make: string, model: string, from: number, to: number, sizeText: string): Car | null => {
  const size = parseTireSize(sizeText);
  if (!make || !model || !size || !from) return null;
  return { make: clean(make), model: clean(model), from, to: to >= from ? to : from, size: formatTireSize(size) };
};

/**
 * Pasted from Excel / Google Sheets: one car per line, columns separated by tab, comma, «،», «;» or «|»:
 *   make, model, from, to, size   — or —   make, model, 2018-2024, size
 * Lines without a valid size/year (e.g. a header row) are skipped.
 */
export function parseCarsPaste(text: string): Car[] {
  return text.split(/\r?\n/).map(line => {
    const c = line.split(/\t|,|،|;|\|/).map(x => x.trim()).filter(Boolean);
    if (c.length >= 5) return toCar(c[0], c[1], Number(c[2]), Number(c[3]), c.slice(4).join(' '));
    if (c.length === 4) {
      const [from, to] = c[2].split(/\s*[-–]\s*/).map(Number);
      return toCar(c[0], c[1], from, to || from, c[3]);
    }
    return null;
  }).filter((x): x is Car => !!x);
}

export function ShopByCar({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const cars: Car[] = useMemo(() => {
    // 1) a pasted list replaces everything; 2) otherwise ready-made list (unless cleared) + manual rows (manual wins)
    const pasted = parseCarsPaste(asText(data.cars_paste, '', lang));
    if (pasted.length) return pasted;
    const manual = rows(data.cars, 'cars')
      .map(r => toCar(asText(r.make, '', lang), asText(r.model, '', lang), Number(r.year_from) || 0, Number(r.year_to) || 0, asText(r.size, '', lang)))
      .filter((x): x is Car => !!x);
    if (!asBool(data.use_builtin, true)) return manual;
    const key = (c: Car) => `${c.make}|${c.model}`;
    const overridden = new Set(manual.map(key));
    return [...BUILTIN_CARS.filter(c => !overridden.has(key(c))), ...manual];
  }, [data.cars, data.cars_paste, data.use_builtin, lang]);

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
                  <p>{t(data.result_text, 'المقاس الأصلي من المصنع. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.')}</p>
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
