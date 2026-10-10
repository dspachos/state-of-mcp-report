# AGENTS.md — state-of-mcp-report (public distribution repo)

Instructions for AI agents working in this repository.

## What this repo is

The **public distribution** of "The State of MCP" white paper. Research, drafting, and verification do **not** happen here — they happen in the private repo `../state-of-mcp` (see its `AGENTS.md` for the full edition pipeline and house rules). Do not edit paper content in this repo; publish a new edition from the research repo instead.

## Contents

| Path | Purpose |
|---|---|
| `state-of-mcp-whitepaper.pdf` | **Current edition** — always the latest published PDF |
| `editions/` | Archived PDFs of superseded editions (`state-of-mcp-whitepaper-v<X.Y>-<date>.pdf`) |
| `README.md` | Minimal landing page: download links + editions table. Keep it minimal — the papers themselves are not rendered here |
| `site/` | The editions website (GitHub Pages: https://dspachos.github.io/state-of-mcp-report/) |
| `.github/workflows/pages.yml` | Deploys `site/` to Pages on pushes touching `site/**` |
| git tags `v<X.Y>` | Pin each edition's release commit |

## Publishing a new edition (incoming from the research repo)

1. Replace `state-of-mcp-whitepaper.pdf` with the new build.
2. Move the previous PDF into `editions/state-of-mcp-whitepaper-v<X.Y>-<date>.pdf` (never delete it).
3. Update `README.md`: add the new row to the **Editions** table (status "current", link to `main` PDF), flip the previous row to its `editions/` file, refresh the direct-download size and checked-on date.
4. **Site update (required):** add a new entry at the **top** of `EDITIONS` in `site/site.js` — `id`, `version`, `title`, `short`, `asOf`, `dateLabel`, `pages`, `sources`, `status: "current"`, `gradWord`, `lead`, `summary`, `highlights` (4–6 pairs), `verification` (3–4 items), `pdf` (raw.githubusercontent URL of the root PDF), `pdfFile`. Flip the previous edition's `status` to `"superseded"`. Every page (index cards, per-report pages) renders from this array.
5. Rebuild Tailwind **only if** new utility classes were introduced:
   ```bash
   cd site && npx tailwindcss@3.4.17 -c tailwind.config.js -i ./src/input.css -o ./style.css --minify
   ```
6. Commit (paper/site separately is fine), push `main`, and tag the edition commit: `git tag v<X.Y> && git push origin main --tags`.
7. Verify: `gh run list --repo dspachos/state-of-mcp-report --limit 1` should show the Pages deploy succeeded (only triggered by `site/**` changes); then fetch https://dspachos.github.io/state-of-mcp-report/ and the new `report.html?id=...` page.

## Site rules

- **No build step at deploy time.** `site/style.css` is precompiled Tailwind (v3.4.x CLI). After HTML/JS class changes, rebuild locally and commit the output.
- **Vanilla JS only.** All pages render from the `EDITIONS` array in `site/site.js`. No frameworks, no runtime CDNs.
- **Aesthetic:** Tokyo Night (pi-pocket style) — bg `#13141c`, cards `#1a1b26`, lines `#292e42`, text `#c0caf5`/`#a9b1d6`/`#7a82ad`, accent `#7aa2f7`, brand `#ff9e64`, cyan→green gradient (`#33ccff → #00ff99`), JetBrains Mono everywhere, square corners, thin borders. Don't introduce rounded corners or other font families.
- **Relative links only** inside `site/` (Pages serves under `/state-of-mcp-report/`). PDFs link to raw.githubusercontent URLs so the site artifact stays self-contained.
- Smoke-test JS changes with `node --check site.js` before pushing.
- `site/FONTS.md` — JetBrains Mono is bundled under the SIL OFL 1.1.

## Hygiene

- Never delete or rewrite the edition tags (`v1.1`, `v2.0`, …) — the README and editions table link to them.
- Never edit archived PDFs under `editions/`.
- The root PDF and the latest `EDITIONS` entry must always correspond to the same version. If they disagree, stop and reconcile before pushing.
