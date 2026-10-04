import { useEffect, useRef } from 'react';
import { CloseIcon } from '../icons';
import { useDialogFocus } from '../common/useDialogFocus';
import { formatTireSize } from './sizes';
import type { TireSize } from './sizes';

export interface SizeGuideModalProps {
  open: boolean;
  size: TireSize;
  onClose: () => void;
  /** Confirms the example size into the search form. */
  onConfirm: (size: TireSize) => void;
}

/**
 * "How do I know my tire size?" dialog — explains the three numbers printed on
 * the tire sidewall (width / aspect ratio / rim diameter).
 */
export function SizeGuideModal({ open, size, onClose, onConfirm }: SizeGuideModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const parts = [
    { value: size.width, label: 'العرض', hint: '(مم)' },
    { value: size.ratio, label: 'نسبة الارتفاع', hint: '(% من عرض الإطار)' },
    { value: size.rim, label: 'قطر الجنط', hint: '(بالبوصة)' },
  ].filter((part) => part.value); // truck sizes have no ratio

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tire-size-guide-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-huge"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 id="tire-size-guide-title" className="mb-2 text-xl font-bold text-gray-900">
          كيف أعرف مقاس إطاري؟
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          يمكنك العثور على مقاس الإطار المكتوب على الجانب الخارجي للإطار.
        </p>

        {/* Sidewall illustration */}
        <div className="mb-4 rounded-xl bg-[#3b4045] px-4 py-6 text-center" dir="ltr">
          <span className="font-mono text-3xl font-bold tracking-widest text-gray-300">
            {formatTireSize(size)}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 text-center">
          {parts.map((part) => (
            <div key={part.label}>
              <span className="mb-2 inline-block rounded-lg bg-[#ffb71b] px-3 py-1 text-lg font-bold text-gray-900">
                {part.value}
              </span>
              <p className="text-sm font-bold text-gray-900">{part.label}</p>
              <p className="text-xs text-gray-500">{part.hint}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-xl bg-gray-100 p-4 text-center">
          <p className="mb-1 text-sm text-gray-600">مثال على مقاس الإطار:</p>
          <p className="text-2xl font-bold text-gray-900" dir="ltr">
            {formatTireSize(size)}
          </p>
        </div>

        <p className="mb-5 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <i className="sicon-info mt-0.5" />
          قد يختلف مكان كتابة المقاس حسب نوع الإطار، وغالباً يكون على الجانب الخارجي.
        </p>

        <button
          type="button"
          onClick={() => onConfirm(size)}
          className="w-full rounded-xl bg-[#ffb71b] py-3 font-bold text-gray-900 transition hover:bg-[#e5a00f]"
        >
          تأكيد المقاس
        </button>
      </div>
    </div>
  );
}
