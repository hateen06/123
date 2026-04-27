# Codex Research Team Brief — DAKER InvestSkill Lens post-bright final gap review

## Mission
Review `/root/daker-investskill-lens` as if you are a fresh 1st-place-oriented judging/strategy board for the DAKER hackathon page:
`https://daker.ai/public/hackathons/hackathon-investment-data-skills-dashboard`

The product has already gone through P0/P0+ implementation and a bright palette redesign. Your job is **not** to repeat old recommendations or implement anything. Your job is to answer: **what, if anything, should Hermes still improve/add before final submission, and what questions should Hermes have asked the operator/user but did not?**

## Current baseline — already implemented, do not re-recommend unless refining
Treat the following as current baseline, not future work:

1. Browser-only Vite/React investment dashboard MVP.
2. No API key, no login, no backend dependency.
3. Sample data buttons for at least:
   - price timeseries
   - portfolio allocation
   - transaction log
4. CSV upload / parse / empty / unsupported UX exists.
5. `Skills.md` set exists under `skills/` and mirrored under `public/skills/`.
6. `Analysis.trace` / rule IDs / Skills contract evidence exist.
7. Generated report summary exists.
8. Mini risk visuals exist:
   - price drawdown
   - portfolio concentration
   - transaction buy/sell ratio
9. Korean/real-world CSV aliases exist for fields such as `일자`, `종가`, `체결가`, `매수`, `매도`, `수량`, `비중`.
10. Standalone investment disclaimer footer exists.
11. Premium judge-ready UI exists with hero visual, trust ribbon, proof grid, metric spark, command CTA.
12. Bright tone redesign already applied: sky/mint/cream/coral/sun palette; old black/muddy green chart colors removed.
13. Current public quick tunnel exists but is temporary:
    - `https://integrity-menu-pointing-decided.trycloudflare.com`
14. Local dev server currently runs on `http://127.0.0.1:5178/`.
15. Current tests pass:
    - `npm run test:design`
    - `npm run test:analysis`
    - `npm run build`

## Hard constraints
- Review / strategy only.
- Do not modify source files except writing the requested final report.
- Do not run deployment, do not generate new PDF, do not create submission artifacts.
- Do not create CSV submissions or unrelated artifacts.
- Label unverified assumptions explicitly.
- Use actual files in the workspace as evidence.
- Separate high-ROI final-submission work from nice-to-have product expansion.
- Prefer low-risk, high-judging-ROI improvements over broad feature creep.

## Files to inspect
Please inspect these before answering:

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/lib/analysis.ts`
- `src/styles.css`
- `scripts/analysis-tests.mjs`
- `scripts/design-tests.mjs`
- `skills/*.md`
- `public/skills/*.md`
- `docs/proposal-pdf-script.md`
- `docs/proposal-pdf-template.md`
- `docs/proposal-pdf-template.html`
- `docs/InvestSkill-Lens-proposal.pdf` if feasible via metadata only; do not spend long on PDF rendering unless easy.

## Live/verified state supplied by Hermes
- Sidecar status before launch: `/`, `/workspaces`, `/settings` all HTTP 200 on `http://127.0.0.1:4280`.
- Project file sizes at launch:
  - `src/App.tsx`: 23,583 bytes / 556 lines
  - `src/lib/analysis.ts`: 24,241 bytes / 422 lines
  - `src/styles.css`: 24,828 bytes / 770 lines
  - `scripts/analysis-tests.mjs`: 4,946 bytes / 132 lines
  - `scripts/design-tests.mjs`: 2,155 bytes / 58 lines
- Latest known browser checks before this review:
  - Cloudflare quick tunnel HTTP 200 with latest build assets.
  - Portfolio page renders and chart bars are bright blue, not black.
  - Browser console JS errors: 0.
  - 390px CDP metrics: no horizontal overflow; `innerWidth=390`, scroll width 390.

## Judging axes to use
Evaluate against these likely DAKER criteria:

1. 범용성 — can it handle more than one CSV/data structure?
2. Skills.md 설계 — are rules clear, reusable, and demonstrably linked to UI behavior?
3. 대시보드 자동 생성 — does input data visibly produce KPI/chart/insight/report automatically?
4. 바이브코딩 활용 — is the Skills.md-driven build story convincing and documented?
5. 실용성 — can a judge use it immediately without setup/key/login?
6. 디자인/첫인상 — does it look like a polished submission, not a scratch demo?
7. 신뢰/규제 안전성 — avoids investment advice and overclaiming?
8. 제출 안정성 — URL, PDF, README, artifacts stable enough for judges?

## Questions Hermes wants you to answer
Answer these directly and sharply:

1. Is there any additional feature worth implementing before submission, or should Hermes stop coding and focus on deployment/docs?
2. If only 2 hours remain, what are the top 3 actions?
3. If only 30 minutes remain, what is the single best action?
4. Are there any remaining obvious UI/copy/design weaknesses after the bright redesign?
5. Are there any hidden judging risks in the current repo structure or submission packaging?
6. Is the current `README.md` enough for external judges, or should it be upgraded?
7. Does the PDF/proposal text likely lag behind the latest P0/P0+ UI and bright redesign? If yes, what exact sections should be refreshed?
8. Are the `skills/*.md` files likely strong enough as submission artifacts, or do they need a top-level consolidated `Skills.md`?
9. What questions should Hermes have asked the user/operator before deciding the final work order?
10. What low-EV work should be explicitly avoided now?
11. What verification should Hermes run after any remaining changes?
12. What should the final submission checklist be?

## Required output report
Save your final report to:

`/root/daker-investskill-lens/CODEX_RESEARCH_TEAM_POST_BRIGHT_FINAL_GAP_REVIEW_20260425.md`

Use exactly these sections:

1. Executive verdict
2. Current strengths that should not be disturbed
3. Remaining high-ROI improvements
4. 2-hour action plan
5. 30-minute emergency action
6. UI/copy/design critique after bright redesign
7. Submission packaging risks
8. README / proposal / PDF refresh recommendations
9. Skills.md artifact recommendations
10. Questions Hermes should have asked the user
11. Low-EV work to avoid
12. Verification plan
13. Final submission checklist
14. Open assumptions / unverified items

## Report quality bar
- Be concrete and file-grounded.
- Do not give generic dashboard advice.
- Rank recommendations by judging ROI and risk.
- If there is nothing meaningful to code, say so plainly.
- If permanent deployment is the biggest issue, say so plainly.
- If a top-level consolidated `Skills.md` is needed, specify exact minimal content.
- If proposal/PDF refresh is needed, name exact sections and copy deltas.
- Keep implementation instructions at the level of actionable files/changes, but do not modify them.
