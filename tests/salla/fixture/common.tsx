import type { AnchorHTMLAttributes } from 'react';
// Only routing is mocked; tests exercise the real hero and its real SCSS.
export function Link({ to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return <a href={to} {...props} />;
}
