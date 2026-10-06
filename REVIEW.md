# REVIEW — Codex ↔ Claude

How it works (rule for both agents):
- **Codex reviews only — never edits code.** It appends findings under a new `## Round N` heading.
- **Claude fixes only what is listed**, then marks each finding: `✅ fixed (commit abc1234)` or `❌ not a bug — why`.
- Codex re-checks only the marked findings in the next round and writes `✔ confirmed` or `↩ reopened — why`.
- One agent at a time. Who's turn it is lives in `HANDOFF.md`.

Finding format:

```
### R<round>-<n> [P1|P2|P3] <short title>
- Where: path/to/file.tsx:line
- What happens: <concrete input / state → wrong result>
- Fix idea: <one line>
- Status: open
```

P1 = breaks for a shopper or merchant · P2 = wrong / missing per spec or design · P3 = polish.

---
