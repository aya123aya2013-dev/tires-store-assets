# Tires Store — Salla Twilight React theme

Start every session here, then load the `salla-tires-theme` skill (full workflow, rules, commands).

- **Where we are:** `HANDOFF.md` (last done, whose turn). Open review findings: `REVIEW.md`.
- **Design source of truth:** `../design/final.html` + `../design/store/*` — the theme must match them 1:1.
- **Component list / fields:** `../design/components-spec.md`. Built so far: see HANDOFF.md.
- **New section component:** `app/components/home/<Name>.tsx` (wrap in `tc/Section`, helpers from `fields.ts`)
  + `scripts/tc/NN-key.cjs` → `node scripts/tc-components.cjs` → `node scripts/tc-register.cjs <Name> <key>`
  + test in `tests/salla/sections-ssr.test.tsx` → commit.
- **Checks:** `pnpm.cmd typecheck` · `pnpm.cmd build` · `pnpm.cmd exec vitest --run tests/salla tests/components/tires tests/routes`
- **Owner rules:** reply in Arabic (Levantine); no dev server / preview / network without permission; «ضيف» = add, never replace;
  no AI-looking design; commit locally — push only to `aya123aya2013-dev/tires-store-theme` when asked; after big milestones
  ask the owner to run a Codex review (Prompt 3 in `CODEX-PROMPTS.md`).
