# HANDOFF — where we are, whose turn

**Turn:** Owner (push, check the editor visually, then Codex re-check of round 4)

**Last done by Claude (2026-10-06):**
- Components #1–#14 built (see `../design/components-spec.md`), size finder combobox + trucks/buses switches,
  exact size search, cover images in `public/assets/covers`.
- Claude's own audit of #1–#14 (to be fixed after Codex's round): add-to-cart with required options fails
  silently; currency hard-coded «ر.س»; product sections vanish when the store has no products; default
  links lead to empty search / blank /help; shared settings missing in #1–#2; brand filters not merchant-chosen;
  store brands only first page; spacing setting inconsistent across sections; Arabic product names in Archivo.

**Fix round 1 done by Claude (2026-10-06):** all 19 findings marked in REVIEW.md (18 ✅, R1-6 ❌ with reason). Commits 6e1625f, 9828355, 4bacc77, ea16506, f49a2e0, 35e9fec. Checks: typecheck, build, 55 tests passing.

**Next after the review:** Claude fixes REVIEW.md findings + the audit list, then components #15–#23.

**Done by Claude after fix round 1 (2026-10-06):** components #15–#23 — install-centers, install-booking (WhatsApp / link booking, past slots disabled), call-strip, steps, lineup, reviews (manual or Salla store ratings), blog (store articles via blogLoader), faq, newsletter (merchant sign-up link or store email; no fake sign-up). Commits cc0d0c0 … (see git log). All 23 home components now exist.
Round 2 scope: components #15–#23 + re-check of round 1 fixes.

**Fix round 2 done by Claude (2026-10-06):** all 18 R2 findings marked in REVIEW.md (17 ✅, R2-13 FAQ gold line kept as design). typecheck, build, 69 tests passing.

**Theme settings done by Claude (2026-10-06):** `scripts/tc-settings.cjs` → twilight.json settings, 4 groups: general/colours/dark/fonts/corners (ThemeTokens.tsx + tc-dark.scss), top bar/header/footer (TcHeader.tsx, TcFooter.tsx — store logo/name/contacts/social/menus from Salla, nothing hard-coded), floating WhatsApp/call/top + discount popup + loader + pattern (TcExtras.tsx), tire features (features/MySize, Compare, cardSettings; presets). Old Raed header/footer settings removed. Commits 55784d5, b765cb5. NOT visually checked yet (no preview without owner's OK).
**Next:** owner looks at a preview → fixes → inner pages 1:1 with design/store (+ product/category/cart/account settings group) → Codex round 3.

**Settings review S3 fixed by Claude (2026-10-06):** 22 findings marked in REVIEW.md (19 ✅, 2 partly, S3-20 deferred to cleanup). typecheck, build, 72 tests passing.

**Settings review S3 second pass fixed by Claude (2026-10-06):** 16 + 3 findings marked; 6 Raed components removed from twilight.json. typecheck, build, 72 tests passing.

**Inner pages done by Claude (2026-10-10):** product, category/search, cart, wishlist, brands, blog + article, account, help, thank-you, 404 — 1:1 with `design/store/*` + page settings groups (commits c244495 … ac8058f). Inner-pages CSS generated from pages.css. NOT visually checked yet; not reviewed by Codex.
**State:** branch `master`, 72 commits ahead of origin (nothing pushed since 2026-10-06), working tree clean.
**Next:** owner pushes → owner preview check → Codex round 4 (inner pages) → cleanup (TcPreview/?tc-preview/?tc-samples, old tires components' store data) → Lighthouse (a11y≥90, perf≥60) → covers, demo store, 4 screenshots, description/price → image licensing reminder.
**Turn:** Claude (fix round 4)

**Settings groups (2026-10-10):** the «اختر نوع الإعدادات» dropdown — root `groups` (13, our own list from `tc-settings.cjs`) + `groups:[id]` on each setting (204, the 13 yellow title rows removed). Method from Salla blog "Group Theme Settings" (see memory settings-groups-twilight). typecheck + 78 tests pass. VERIFIED by owner in the Salla editor (works).
**Update (2026-10-10):** per owner, the 13 yellow title rows are kept INSIDE each group (dropdown + old title look together); 217 settings again.
**Settings groups FINAL (2026-10-10, b6489ec, verified by owner):** every setting has `groups: ["general", <own group>]` — `general` is Salla's built-in «الخيارات العامة» (shows ALL settings, old flat look with yellow titles) and the 13 groups (all type "page"; "header"/"footer" types are NOT listed in the dropdown) each show only their own.

**Fix round 4 done by Claude (2026-10-10):** 27 findings marked in REVIEW.md (21 ✅, 4 partly, R4-13 deferred, R4-27 → cleanup). Commits 282ca75, 05f7c94, 2e43930, 01378e7 (+ tests). Also: reviews `auto` source (Salla ratings → samples only while empty, switch to turn samples off), Saudi/plain wording for customer text, «إعدادات متقدمة» switch on all 23 sections, setup-steps tip. typecheck, build, 81 tests pass. Visual parity items (gallery, cart rows, account) are CSS-only and NOT measured — need the owner's look.

**UX fixes from Codex's UX-REVIEW (2026-10-10, owner approved «صلح الاخطاء كلها»):** UX-M1 booking uses the store-wide WhatsApp number (own number optional) · UX-C3 booking says «اطلب هذا الموعد» + «الموعد يتأكد بعد رد المتجر» · UX-M2 pasted cars (Arabic digits, reversed years rejected, per-line report + overlapping-years note shown ONLY inside the editor iframe; no silent fallback list) · UX-M5 result text «مقاس مرجعي» · UX-C2 compare-limit message above the tray (aria-live) · UX-C1 tier prices marked approximate + editable note (option «أ») · UX-M6 sale-unit description · UX-M7 «لو قسم ما ظهر» tip · UX-M8 «replace the examples» notes on hero stats / picker sizes. NOT done: UX-M3 (collection item names — needs proof the editor can name items from a field), UX-C4/real task tests (need a demo store + owner's OK). typecheck, build, 82 tests pass.
