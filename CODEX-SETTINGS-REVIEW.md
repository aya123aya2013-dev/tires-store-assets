# Prompt 4 — Codex: settings & UX review (round S3)

Copy everything inside the box into Codex (working folder: `Salla Web Designs`).

```text
You are reviewing (NOT building) a Salla Twilight React theme for tire stores: «متجر الإطارات / TIRES STORE».
Repo: Salla Web Designs/tires-store · approved design: Salla Web Designs/design (final.html + store/*).
Codex only reviews; Claude fixes. Reply to me in Arabic.

HARD RULES
- Do NOT edit any source file, do NOT commit, do NOT push, do NOT start a dev server or use the network.
- The ONLY files you may write: tires-store/REVIEW.md (append) and tires-store/HANDOFF.md (turn line).
- Quote the exact setting/field `id` and file:line for every finding. If unsure whether Salla supports
  something, write "needs checking" — never assert.
- Themes cannot add backend APIs (no booking system, no newsletter API); they can only link out or use WhatsApp/email.

READ FIRST
1. tires-store/CLAUDE.md (project rules — esp. «Analysis first»: settings come from how a tire store is really
   used, not copied from competitors; every visible element must be switchable; a switched-off feature hides its
   own fields; fewer meaningful settings beat many cosmetic ones).
2. tires-store/twilight.json → `settings[]` (global) and `components[]` (home sections, key `home.*`).
3. tires-store/scripts/tc-settings.cjs — the 9 setting groups, `where()` per-screen dropdowns, `DEPS` conditions.
4. tires-store/scripts/tc-fields.cjs, scripts/tc-components.cjs, scripts/tc/*.cjs — component fields.
5. Consumers: app/components/layout/{ThemeTokens,TcHeader,TcFooter,TcExtras,MobileBottomBar,ThemeLayout,devices}.tsx|ts,
   app/components/tires/features/*, app/components/home/*.tsx, app/routes/search-page.tsx,
   app/styles/04-components/{tc-theme-ui,tc-dark}.scss.
6. Screens: mobile < 768 · tablet 768–1100 · desktop > 1100.

CONTEXT YOU MUST KNOW
- In the Salla editor the merchant first sees Salla's own «خيارات التصميم» (Arabic numerals, content protection,
  «صنع بإتقان», breadcrumb, unify card heights, product image display) — those are the platform's, not ours.
- After our last group («الفوتر» → «أسفل الفوتر») the editor shows 12 OLD base-theme (Raed) settings with no group
  title: squar_photo_bg_image_size, vertical_fixed_products, is_more_button_enabled, product_show_breadcrumbs,
  product_index_show_breadcrumbs, enable_add_product_toast, notify_when_available_in_card, sticky_add_to_cart,
  product_bottom_nav_rounded, show_tags, slider_background_size, imageZoom. To the merchant they look like part of
  the footer. Judge each one: keep (and in which group), rename, or remove (is it still read by our code?).

WHAT TO REVIEW

A. Does the work function? (code vs settings)
  1. Every setting id in twilight.json → is it read anywhere in app/? List settings that do NOTHING.
  2. Every `theme.settings.X` / `s.X` read in app/ → does X exist in twilight.json? List reads with no setting.
  3. Every DEPS entry: parent exists, value type matches (boolean vs dropdown value), children really belong to it.
     List fields that should hide but don't, and chains (child of a hidden parent stays visible?).
  4. Defaults in twilight.json == defaults in code (asBool(..., true), opt(..., 'x'))? List mismatches.
  5. «يظهر على» (where) values → classes in devices.ts → CSS in tc-theme-ui.scss: any value that maps wrong?
  6. Conflicts: what happens with sale-only store + fitting badge, price per set + «للأربع», dark mode off + dark
     toggle, WhatsApp on with no store number, «اطلب السعر» with no number, bottom bar off (spacing, floating
     buttons, compare tray), search off (mobile search icon, SallaSearch modal). Report wrong behaviour.
  7. Run (allowed, offline): `pnpm.cmd typecheck`, `pnpm.cmd build`,
     `pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes`. Report results.

B. Merchant UX in the editor (field distribution — the main question)
  1. Is each setting in the right group? Should any move / merge / split? Is the group order right for a
     tire merchant (first-day setup → daily changes)?
  2. Labels and descriptions: clear Saudi-merchant Arabic? Too long, jargon, ambiguous, inconsistent wording
     (e.g. «إظهار …» vs bare nouns, «الجوال» vs «رقم الجوال»)? Propose exact new text.
  3. Defaults for a brand-new store: works with zero setup, nothing empty/broken, no fake data that turns into
     real links.
  4. Bilingual: text fields missing English values / multilanguage flag.
  5. Per-screen: settings that need a «يظهر على» but lack it, and ones where it is useless noise.
  6. Overload: settings with little value that should go or move under an "advanced" switch.

C. Shopper UX (storefront) — read the components' markup + CSS
  Header / top bar / footer / bottom bar / floating buttons / popup / compare / «مقاسي» / cards on mobile and
  desktop, light and dark, RTL and LTR: overlap of fixed elements, tap targets < 44px, focus/keyboard, contrast
  in dark mode, anything that differs from design/final.html.

D. Missing settings
  1. Whole store — think as a tire merchant (daily operations) and as a customer buying 4 tires on a phone:
     header, top bar, footer, mobile, product card, product page, category/search, cart, account, trust
     (warranty, original, production year/DOT, returns), fitting, delivery, installments, WhatsApp ordering,
     out-of-stock sizes, SEO/performance.
  2. EACH home component (`home.*`): missing content/layout/visibility/per-screen/link/image/source fields,
     confusing or redundant fields, wrong defaults; each must have show mobile/desktop, space above/below,
     custom CSS class, cover image, Arabic + English defaults.
  For each missing setting: why a tire store needs it, field type, default, group, MUST / SHOULD / NICE.

E. Your own suggestions — features or simplifications that would make this theme clearly better than generic
   themes for tire stores (keep them realistic for a Salla theme).

WHERE TO WRITE THE RESULTS (so Claude can review and fix)
Append to the END of tires-store/REVIEW.md:

## Settings & UX review — round S3 — <date>
**Scope / commit:** (git HEAD you reviewed)
**Checks:** table of the commands you ran + results.
**Summary:** top 10 issues, one line each.

Then one block per finding, numbered S3-1, S3-2, … in this exact shape:
### S3-<n> [P1|P2|P3] <short title>
- Where: <file:line or setting id / component key → field id>
- What happens: <concrete behaviour or problem>
- Fix idea: <specific: new label text / move to group X / add field {type, default} / remove>
- Status: open

Then these sections:
### S3 — Missing settings (table: setting | group | type | default | why | MUST/SHOULD/NICE)
### S3 — Per-component gaps (one sub-heading per component key)
### S3 — Remove or merge (with reasons)
### S3 — Proposed final group order
### S3 — Suggestions

Finally edit ONE line in tires-store/HANDOFF.md:  **Turn:** Claude (fix settings review S3)
and tell me in Arabic: how many findings per priority, and the 5 most important ones.
```
