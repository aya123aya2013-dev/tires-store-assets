/**
 * Component #7 — تسوّق حسب سيارتك (`home.shop-by-car`).
 * Design: design/final.html → `#cars` (make → model → year columns + dark result card).
 * The merchant fills the car list (make, model, years, size); the button opens the exact-size search.
 */
import { useMemo, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { parseTireSize, tireSizeQuery, formatTireSize } from '../tires/sizes';
import { asBool, asText, makeT, rows, useLang } from './fields';
import type { Row } from './fields';
import { Section } from './tc/Section';

const EN: Record<string, string> = {
  'ما تعرف مقاسك؟': "Don't know your size?", 'اختر سيارتك، ونطلع لك المقاس.': "Pick your car — we'll find the size.",
  'الماركة، الموديل، السنة — وبس.': 'Make, model, year — that’s it.',
  'المقاس الأصلي من المصنع. تأكد منه على جانب إطارك الحالي أو ملصق باب السائق.': 'The factory size. Double-check it on your current tire or the driver-door sticker.',
  'اعرض الإطارات': 'Show tires', 'اختر سيارتك عشان نعرض المقاس والإطارات المتوفرة.': 'Pick your car to see its size and available tires.',
};
// design data (final.html → CARS)
const DESIGN: [string, string, number, number, string][] = [
  ['تويوتا', 'كامري', 2018, 2024, '215/55 R17'], ['تويوتا', 'لاند كروزر', 2016, 2024, '285/60 R18'], ['تويوتا', 'هايلكس', 2016, 2024, '265/65 R17'], ['تويوتا', 'يارس', 2018, 2024, '185/60 R15'],
  ['هيونداي', 'النترا', 2017, 2024, '205/55 R16'], ['هيونداي', 'توسان', 2019, 2024, '225/60 R17'], ['هيونداي', 'أكسنت', 2018, 2024, '185/65 R15'], ['هيونداي', 'سوناتا', 2020, 2024, '215/55 R17'],
  ['نيسان', 'باترول', 2014, 2024, '275/70 R18'], ['نيسان', 'ألتيما', 2019, 2024, '215/60 R16'], ['نيسان', 'صني', 2018, 2024, '185/65 R15'],
  ['كيا', 'سبورتاج', 2019, 2024, '225/60 R17'], ['كيا', 'سيراتو', 2019, 2024, '205/55 R16'], ['كيا', 'K5', 2021, 2024, '215/55 R17'],
  ['شفروليه', 'تاهو', 2015, 2024, '275/55 R20'], ['شفروليه', 'ماليبو', 2017, 2024, '225/55 R17'],
  ['فورد', 'F-150', 2018, 2024, '275/65 R18'], ['فورد', 'إكسبلورر', 2020, 2024, '255/65 R18'],
  ['جي إم سي', 'يوكن', 2015, 2024, '275/55 R20'], ['جي إم سي', 'سييرا', 2019, 2024, '265/70 R17'],
  ['لكزس', 'LX', 2016, 2024, '275/50 R21'], ['لكزس', 'ES', 2019, 2024, '235/45 R18'],
];
interface Car { make: string; model: string; from: number; to: number; size: string }

export function ShopByCar({ data }: { data: Row }) {
  const lang = useLang();
  const isEn = lang === 'en';
  const t = makeT(lang, EN);
  const cars: Car[] = useMemo(() => {
    const list = rows(data.cars, 'cars')
      .map(r => {
        const size = parseTireSize(asText(r.size, '', lang));
        const from = Number(r.year_from) || 0;
        return { make: asText(r.make, '', lang).trim(), model: asText(r.model, '', lang).trim(), from, to: Number(r.year_to) || from, size: size ? formatTireSize(size) : '' };
      })
      .filter(c => c.make && c.model && c.size && c.from);
    return list.length ? list : DESIGN.map(([make, model, from, to, size]) => ({ make, model, from, to, size }));
  }, [data.cars, lang]);

  const makes = [...new Set(cars.map(c => c.make))];
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(0);
  const models = cars.filter(c => c.make === make);
  const car = models.find(c => c.model === model);
  const years = car ? Array.from({ length: Math.max(0, car.to - car.from + 1) }, (_, i) => car.to - i) : [];
  const parsed = car && year ? parseTireSize(car.size) : null;
  const pick = (f: () => void) => () => { f(); };

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
              <div className="makes">{makes.map(m => btn(m, m === make, pick(() => { setMake(m); setModel(''); setYear(0); })))}</div>
            </div>
            <div className="car-col">
              <span className="cstep">2 · {isEn ? 'Model' : 'الموديل'}</span>
              <div className="list">
                {make ? models.map(c => btn(c.model, c.model === model, pick(() => { setModel(c.model); setYear(0); }), 'ar')) : <p className="hint">{isEn ? 'Pick the make first' : 'اختر الماركة أول'}</p>}
              </div>
            </div>
            <div className="car-col">
              <span className="cstep">3 · {isEn ? 'Year' : 'السنة'}</span>
              <div className="list">
                {car ? years.map(y => btn(String(y), y === year, pick(() => setYear(y)))) : <p className="hint">{isEn ? 'Pick the model' : 'اختر الموديل'}</p>}
              </div>
            </div>
            <div className="car-out">
              {car && year && parsed ? (
                <>
                  <span className="cstep" style={{ color: '#9a9ea2' }}>{`${make} ${model} ${year}`}</span>
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
