# Prompt 1 — Review the work (Codex code review)

You are reviewing a Salla e-commerce theme for tire stores ("متجر الإطارات / TIRES STORE"), built on **Salla Twilight React** (`@salla.sa/twilight-theme-engine`, React + TanStack Router + Vite, SCSS). It will be sold on the Salla theme store, so it must be robust for any merchant, not just one store.

**Repo:** this folder (`tires-store`). Design source of truth (static HTML/CSS/JS, already approved by the client): `../design/final.html` and `../design/store/*` (built by `../design/store/build.cjs`). Specs: `../design/components-spec.md`, `../design/components-backlog.md`, `../design/design-notes.md`.

**What has been built so far:**
1. Full static store (design folder): home + category, product, cart, thank-you, help, account, wishlist, brands, blog, article, 404.
2. Theme component #1 `home.tire-hero` ("بنر الإطار"):
   - `twilight.json` → component with UUID key, ~40 fields: tire-design mode (title, texts, 2 buttons with Salla link picker `items/variable-list`, stats collection, tire image, curved size-code text, parts popups, mobile/desktop layout) and "image only" mode = Selia-style slider (`slides` collection: video mp4/YouTube, desktop/mobile images, English images, title/text/button, button colors, outline, whole-image link, focal point, per-slide text position; component: heights, fit, boxed, autoplay, interval, speed, fade/slide, arrows, dots, top space, content position, shade). Uses `conditions` to show/hide fields.
   - `app/components/home/TireHero.tsx` (helpers pick/asBool/asText/asImage/asLink/opt; BannerSlider + TireDesign).
   - Registered in `app/router.tsx` (`'tire-hero': TireHero`), exported in `app/components/home/index.ts`.
   - Styles: `app/styles/04-components/tire-components.scss` (imported in app.scss).
   - Dev-only preview: `app/components/home/TcPreview.tsx`, shown on `/?tc-preview` from `app/routes/home-page.tsx` (loader skips Salla API in DEV preview and tolerates API errors in DEV).

**Please check and report (do not rewrite large parts; list issues with file:line, severity, and a suggested fix):**
1. `twilight.json` validity against Salla Twilight component schema: field types/formats, `conditions` (also inside collections), `items/variable-list` link picker sources, `color` fields, defaults, unique ids, UUID keys, ar/en titles.
2. `TireHero.tsx`: does it read every field defined in twilight.json with the right shape (Salla may send strings, `{ar,en}`, arrays, objects for links/images)? Null safety, empty collections, slider timers/cleanup, SSR safety (no window at render), accessibility (buttons, alt, aria), keys, video autoplay muted/playsinline, YouTube embed.
3. Visual fidelity: compare the hero markup/CSS with `../design/final.html` hero section — list differences (spacing, fonts, colors, responsive breakpoints, RTL).
4. SCSS: scoping (everything under `.tc`), no leaks into the base theme, RTL/LTR, mobile.
5. `home-page.tsx` dev-only code: confirm nothing from TcPreview or `?tc-preview` affects production builds.
6. Run `pnpm.cmd typecheck`, `pnpm.cmd build`, `pnpm.cmd exec vitest --run tests/components/tires tests/components/layout tests/routes` and report results.
7. Anything that would make Salla reject the theme on review.

Do NOT: push to git, start dev servers that hit the Salla API repeatedly, change the design, or touch credentials. Output a prioritized findings list.

---

# Prompt 2 — Context handoff (understand the project and continue)

You are continuing work on a **Salla theme for tire stores** ("متجر الإطارات / TIRES STORE"), to be sold on the Salla theme store (benchmark: Salla's "سيليا / Selia" theme, but tire-specialized). The owner speaks Levantine Arabic — reply in Arabic, short and practical.

**Stack:** Salla Twilight React (`@salla.sa/twilight-theme-engine`), React, TanStack Router, Vite, SCSS. Windows: use `pnpm.cmd` (not pnpm), git at `C:\Program Files\Git\cmd\git.exe`.

**Folders:**
- `Salla Web Designs/design/` — approved static design (source of truth): `final.html` (home), `store/` (full static store pages, `build.cjs`), `components-spec.md` (23 components + theme settings — the roadmap), `components-backlog.md`, `design-notes.md`. `store-pub/` = copy published to GitHub Pages.
- `Salla Web Designs/tires-store/` — the Salla theme.

**Identity:** gold `#ffb71b` + charcoal; Archivo for Latin display; no "AI-looking" design; keep visual harmony. The Salla theme must be a **100% pixel copy** of the static store.

**How every home section becomes a Salla component (merchant edits it in "عناصر الصفحة"):**
1. Add component to `twilight.json` → `components[]` (real UUID `key`, `title{ar,en}`, `icon`, `path: "home.<key>"`, `fields[]`; use `conditions` for show/hide; every button/link uses `items/variable-list` link picker: product/category/brand/page/external).
2. React component in `app/components/home/<Name>.tsx` receiving `{data}`; reuse helpers from `TireHero.tsx` (pick, asBool, asText, asImage, asLink, opt).
3. Register in `app/router.tsx` (`registerHomeComponents({...DefaultHomeComponents, '<key>': Comp})`) and export from `app/components/home/index.ts`.
4. Styles in `app/styles/04-components/tire-components.scss` under `.tc`.
5. Add sample to `app/components/home/TcPreview.tsx` (dev-only `/?tc-preview`).
6. typecheck + build + tests, commit locally.

**Status:**
- DONE: static store; component #1 `home.tire-hero` (tire design mode + Selia-style image/video slider).
- NOW: owner is pushing to GitHub and building in Salla Partners to test component #1 in the store customizer (link picker, color picker, conditional fields inside collections).
- NEXT (only after owner confirms the Salla test): component #2 size finder (`id=size`), #3 benefits strip, #4 weekly products slider, then the rest of `components-spec.md`, then theme settings (two-row header, footer, top bar, popup, WhatsApp, colors, product-page toggles), then inner pages 1:1 with `design/store`.
- OPEN ISSUE: custom pages (`/help`, thank-you) render blank locally (Salla API).
- BEFORE RELEASE: remove TcPreview and `?tc-preview` code; cover image per component; demo store with tire products; theme name/description/screenshots; remind owner all images must be commercially licensed (no Google images).

**Local dev gotchas:** dev store `VITE_STORE_DOMAIN=1510890315`; Salla API may return 422 (store not found) or 429 (rate limit → wait ~10 min or change IP). Root loader failure = blank 500 page. Real testing is best done on Salla Partners.

**GitHub accounts:**
- `aya123aya2013-dev/tires-store-theme` (PRIVATE, linked to Salla Partners) — the theme. If push says "Repository not found", git is logged in as the other account: push with `https://aya123aya2013-dev@github.com/aya123aya2013-dev/tires-store-theme.git master`.
- `MohammedAboseedo/tires-store-preview` — public GitHub Pages preview of the static store for clients: https://mohammedaboseedo.github.io/tires-store-preview/ (used because the owner didn't want AI-hosted links; reuse for every future design round).

**Owner's rules (strict):**
- Don't write code until the owner says so; if they say "save only", only update notes.
- No dev server/preview/network calls without permission.
- "ضيف" = ADD, never replace existing sections.
- Never enter credentials or push — commit locally; the owner pushes.
- Don't open `Documents\Codex\2026-10-04\new-chat\work\` (private documents).

Start by reading `../design/components-spec.md`, `twilight.json` (component `home.tire-hero`), and `app/components/home/TireHero.tsx`, then ask the owner whether the Salla test of component #1 passed before building component #2.

---

# Prompt 3 — Review round (use after every big milestone)

You are the **reviewer** in a two-agent workflow on a Salla Twilight React theme for tire stores (`tires-store`, sold on the Salla theme store). Claude builds and fixes; **you only review — do not edit any source file, do not commit, do not push, do not touch credentials, do not start dev servers that hit the Salla API.**

Read first: `HANDOFF.md` (what was just done, whose turn), `REVIEW.md` (format + past rounds), `../design/components-spec.md` (what each component must offer), `../design/final.html` (approved design — the theme must match it 1:1).

Scope of this round: everything listed under "Last done by Claude" in `HANDOFF.md`. Key files: `twilight.json` (components `home.*`), `app/components/home/*.tsx` (incl. `tc/`, `fields.ts`), `app/components/tires/sizes.ts`, `app/components/product/ProductListPage.tsx`, `app/routes/search-page.tsx`, `app/styles/04-components/tire-components.scss` (hand-written) and `tc-sections.scss` (GENERATED from final.html by `scripts/build-tc-sections-css.cjs` — review the generator, not the output), `scripts/tc-*.cjs`.

Check:
1. Every field in `twilight.json` is read by its component with the right shape (string, `{ar,en}`, arrays, link-picker objects, collections `prefix.key`); conditions point to existing ids; defaults sensible; English defaults exist.
2. Behaviour a shopper sees: empty data, missing images, many items, RTL/LTR, mobile 375px, keyboard, reduced motion, add-to-cart / wishlist / search flows, exact size matching (incl. 22.5 rims, 11R22.5, 900/16).
3. Visual parity with `final.html` (sizes, spacing, fonts, colours, breakpoints) — cite the design rule you compare against.
4. Spec gaps vs `components-spec.md`.
5. Anything that would make Salla reject the theme (translations, a11y ≥ 90, performance, store-specific data hard-coded).
6. Run `pnpm.cmd typecheck`, `pnpm.cmd build`, `pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes` and report results.

Also re-check findings from earlier rounds marked `✅ fixed` → write `✔ confirmed` or `↩ reopened — why` under each.

Output: append to `REVIEW.md` a new `## Round N — <date>` section using the finding format at the top of that file (P1/P2/P3, file:line, concrete failure, fix idea, `Status: open`). Verify each finding yourself; drop anything you couldn't confirm or mark it `(unverified)`. Then set `**Turn:** Claude (fix round N)` in `HANDOFF.md`. Reply to the user in Arabic with a short summary: counts by priority and the top 5.
