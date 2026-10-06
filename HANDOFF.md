# HANDOFF — where we are, whose turn

**Turn:** Owner (decide next: theme settings, or Codex round 3 re-check)

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
