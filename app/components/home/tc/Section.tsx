/**
 * Wrapper every "Tires Store" section renders: `.tc-s` scopes the approved design's CSS
 * (styles/04-components/tc-sections.scss, generated from design/final.html) and applies the
 * settings every component shares — show on mobile / desktop, space above / below, custom class.
 */
import type { ReactNode } from 'react';
import { asBool, customClass, opt } from '../fields';
import type { Row } from '../fields';

export function Section({ data, children, className = '' }: { data: Row; children: ReactNode; className?: string }) {
  const cls = [
    'tc-s',
    className,
    asBool(data.show_mobile, true) ? '' : 'tc-hide-m',
    asBool(data.show_desktop, true) ? '' : 'tc-hide-d',
    `tc-pt-${opt(data.space_top, 'normal')}`,
    `tc-pb-${opt(data.space_bottom, 'normal')}`,
    customClass(data.custom_class),
  ].filter(Boolean);
  return <div className={cls.join(' ')}>{children}</div>;
}
