/**
 * Wires a new section component everywhere it must appear:
 *   node scripts/tc-register.cjs <ComponentName> <path-key> [previewProps]
 * e.g. node scripts/tc-register.cjs InstallCenters install-centers
 * → export in components/home/index.ts, import + map entry in app/router.tsx,
 *   and a sample in the dev preview (TcPreview.tsx), right after the previous one.
 */
const fs = require('fs');
const path = require('path');
const [name, key, props = '{}'] = process.argv.slice(2);
if (!name || !key) throw new Error('usage: tc-register <ComponentName> <path-key> [previewProps]');
const root = path.join(__dirname, '..');
const edit = (file, fn) => { const p = path.join(root, file); const s = fs.readFileSync(p, 'utf8'); const out = fn(s); if (out !== s) fs.writeFileSync(p, out); };

edit('app/components/home/index.ts', s => (s.includes(`{ ${name} }`) ? s : s.trimEnd() + `\nexport { ${name} } from './${name}';\n`));
edit('app/router.tsx', s => {
  if (!s.includes(`  ${name},\n} from './components/home';`) && !new RegExp(`\\n  ${name},\\n`).test(s))
    s = s.replace("} from './components/home';", `  ${name},\n} from './components/home';`);
  if (!s.includes(`: ${name},`)) {
    const lines = s.split('\n');
    // last "'some-key': Component," entry of the Tires Store pack
    let last = -1;
    lines.forEach((l, i) => { if (/^ {2}('[a-z-]+'|[a-z]+): [A-Z]\w+,$/.test(l)) last = i; });
    const k = /^[a-z]+$/.test(key) ? key : `'${key}'`;
    lines.splice(last + 1, 0, `  ${k}: ${name},`);
    s = lines.join('\n');
  }
  return s;
});
edit('app/components/home/TcPreview.tsx', s => {
  if (!s.includes(`import { ${name} }`)) {
    const imports = [...s.matchAll(/^import \{ \w+ \} from '\.\/\w+';$/gm)];
    const at = imports[imports.length - 1];
    s = s.slice(0, at.index + at[0].length) + `\nimport { ${name} } from './${name}';` + s.slice(at.index + at[0].length);
  }
  if (!s.includes(`<${name} `)) {
    // only the main run of default samples (`data={{}}`), not the variant sections below it
    const tags = [...s.matchAll(/^ {8}<[A-Z]\w+ data=\{\{\}\} \/>$/gm)];
    const at = tags[tags.length - 1];
    s = s.slice(0, at.index + at[0].length) + `\n        <${name} data={${props}} />` + s.slice(at.index + at[0].length);
  }
  return s;
});
console.log('registered', name, '→', key);
