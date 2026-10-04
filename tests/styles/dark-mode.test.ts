// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

function declarations(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    }
  });
  return decls;
}

describe('footer_is_dark (body.footer-is-dark)', () => {
  it('uses the Twig Raed dark palette, not Tailwind gray-900', async () => {
    const root = await compile('footer.scss');

    const footer = declarations(root, 'body.footer-is-dark .store-footer');
    expect(footer['background-color']).toContain('rgb(14 15 15'); // darker #0E0F0F
    expect(footer['background-color']).not.toContain('rgb(17 24 39');
    expect(footer.color).toContain('rgb(255 255 255');

    const inner = declarations(root, 'body.footer-is-dark .store-footer__inner');
    expect(inner['background-color']).toContain('rgb(29 31 31'); // dark #1D1F1F
    expect(inner['border-style']).toBe('dashed');
    expect(inner['border-bottom-color']).toBe('rgb(255 255 255 / 0.1)');
  });
});

describe('topnav_is_dark (body.topnav-is-dark)', () => {
  it('darkens the header top bar like the Twig Raed .top-navbar', async () => {
    const root = await compile('header.scss');

    const topnav = declarations(root, 'body.topnav-is-dark .site-header__topnav');
    expect(topnav['background-color']).toContain('rgb(29 31 31'); // dark #1D1F1F
    expect(topnav.color).toContain('rgb(209 213 219'); // gray-300
  });

  it('darkens the lite header bar, the only bar that layout has', async () => {
    const root = await compile('header.scss');

    const bar = declarations(root, 'body.topnav-is-dark .site-header--lite .site-header__bar');
    expect(bar['background-color']).toContain('rgb(29 31 31'); // dark #1D1F1F

    const action = declarations(
      root,
      'body.topnav-is-dark .site-header--lite .site-header__bar .header-action'
    );
    expect(action.color).toContain('rgb(209 213 219'); // gray-300
  });
});
