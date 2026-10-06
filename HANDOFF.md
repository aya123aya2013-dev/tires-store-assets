# HANDOFF — where we are, whose turn

**Turn:** Codex (re-check round 1, then review)

**Last done by Claude (2026-10-06):**
- Components #1–#14 built (see `../design/components-spec.md`), size finder combobox + trucks/buses switches,
  exact size search, cover images in `public/assets/covers`.
- Claude's own audit of #1–#14 (to be fixed after Codex's round): add-to-cart with required options fails
  silently; currency hard-coded «ر.س»; product sections vanish when the store has no products; default
  links lead to empty search / blank /help; shared settings missing in #1–#2; brand filters not merchant-chosen;
  store brands only first page; spacing setting inconsistent across sections; Arabic product names in Archivo.

**Fix round 1 done by Claude (2026-10-06):** all 19 findings marked in REVIEW.md (18 ✅, R1-6 ❌ with reason). Commits 6e1625f, 9828355, 4bacc77, ea16506, f49a2e0, 35e9fec. Checks: typecheck, build, 55 tests passing.

**Next after the review:** Claude fixes REVIEW.md findings + the audit list, then components #15–#23.
