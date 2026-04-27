# Codex Research Team Brief — DAKER 투자 데이터 Skills Dashboard 1위 후보 설계/구현 리뷰

## Mission
DAKER 해커톤 "투자 데이터 분석 & 스킬 대시보드 만들기"에서 **강력한 1위 후보**가 될 수 있도록, 현재 MVP를 기준으로 웹디자인·제품 설계·구현 능력·Skills.md 연결성을 냉정하게 리뷰하고 다음 구현 우선순위를 제안한다.

이 세션은 **리서치/전략/설계 리뷰 전용**이다. 코드를 수정하지 말고, CSV/배포물을 생성하지 말고, 최종 보고서를 지정 경로에 저장한다.

## Workspace
- Real workspace path: `/root/daker-investskill-lens`
- Current app stack: Vite + React + TypeScript + Recharts + PapaParse
- Current source files to inspect:
  - `src/App.tsx`
  - `src/styles.css`
  - `src/lib/analysis.ts`
  - `package.json`
  - `skills/01_data_detection.md`
  - `skills/02_metric_rules.md`
  - `skills/03_chart_selection.md`
  - `skills/04_insight_generation.md`
  - `skills/05_report_layout.md`
  - `docs/proposal-pdf-template.md`
- Existing dist build exists, but source is the source of truth.

## Hackathon context
- Product: 투자 CSV를 넣으면 Skills.md 규칙으로 데이터 유형 판별, KPI 계산, 차트 선택, 위험 인사이트, 리포트 레이아웃을 자동 생성하는 대시보드.
- User is individual participant.
- Proposal is already final-submitted; remaining high-leverage deliverables are Skills.md and final web link.
- Expected judging axes observed from the platform/session context:
  - 범용성 25
  - Skills.md 설계 25
  - 대시보드 자동생성 25
  - 바이브코딩 15
  - 실용성 10
  - plus public voting exposure
- Current rank/score does not yet reflect quality; all users had 0.00 when inspected earlier.

## Current product state
Current UI already has:
- v0-style minimal white dashboard inspired by `Dashboard – M.O.N.K.Y`
- top brand bar, nav pills, hero card, command bar, sample chips, CSV upload
- KPI cards
- auto chart panel
- dark AI insight panel
- Skills pipeline section
- input data preview table
- support for three sample CSVs:
  - price time series
  - portfolio allocation
  - transaction log

Current implementation limits:
- `Analyze` button is mostly visual; prompt text is not actually used to alter analysis.
- Analysis is deterministic/rule-based, not connected to a real LLM.
- Only 3 canonical data types are meaningfully handled.
- Skills.md content is shown mostly as text, not as an interactive execution trace.
- UI looks clean, but may still be perceived as a template unless it has stronger “wow” moments.
- No explicit share/public-vote optimized landing section yet.
- No deployment optimization/a11y/performance review done after redesign.

## Review goals
Produce an evidence-backed report that answers the following **in this order**:

### 1. Executive verdict
- Is the current MVP already competitive?
- What prevents it from looking like a top-1 candidate?
- What is the fastest path to make it look/feel like a winning submission?

### 2. Judging-axis gap analysis
For each scoring axis, evaluate current strength and missing pieces:
- 범용성
- Skills.md 설계
- 대시보드 자동생성
- 바이브코딩
- 실용성
- public-vote appeal

Use direct evidence from the files.

### 3. Web design direction for a 1위 후보
Recommend a concrete visual/product direction, not generic advice.
Consider:
- first-screen impact
- financial dashboard credibility
- minimal premium SaaS feel
- v0/vercel-style polish
- chart density vs clarity
- microcopy in Korean
- public-vote screenshot appeal
- dark accent sections vs white canvas
- mobile responsiveness

### 4. Feature upgrades with highest judging ROI
Rank the top upgrades by impact/effort/risk.
Prefer implementable features within this React/Vite MVP.
Examples to evaluate, not blindly accept:
- real “analysis run” state and generated report cards
- prompt-aware analysis modes
- automatic Skills.md execution trace / rule evidence timeline
- risk radar / drawdown mini-chart / allocation concentration gauge
- portfolio health score
- downloadable report markdown
- sample scenario gallery
- before/after insight comparison
- transparent rule explainability panel
- drag-and-drop CSV upload
- deployment-ready SEO/share metadata

### 5. Skills.md 설계 strengthening
Review whether the five Skills.md files can score highly as a reusable skill system.
Suggest improvements to make them look like a real automation spec rather than documentation.
Specify exact additions/renames/structure if needed.

### 6. Implementation plan
Give a concrete phased plan:
- P0: must implement before final web link
- P1: high value if time allows
- P2: polish only

For each item include:
- exact file(s) likely touched
- implementation outline
- verification method
- risk

### 7. Questions Hermes should have asked but did not
Invent the missing questions that would improve the product and submission strategy.
Separate:
- product/UX questions
- evaluation/competition questions
- implementation/data questions
- submission/deployment questions

### 8. Low-EV work to avoid
List changes that sound good but are likely not worth it for this hackathon.

### 9. Final recommended next 24h build order
Give a clear ordered checklist for Hermes to execute after this review.

## Hard constraints
- Do not implement.
- Do not modify source files except writing the requested final report.
- Do not fabricate platform rules; if not directly visible from files/context, label as assumption.
- Treat current code as MVP, not final architecture.
- Keep recommendations practical for one-person hackathon execution.
- Prefer visible product quality + judging-axis alignment over overengineering.

## Expected output artifact
Save the final report to:

`/root/daker-investskill-lens/CODEX_RESEARCH_TEAM_1ST_PLACE_DESIGN_IMPL_REPORT.md`

If blocked, save a partial report to the same path and clearly mark blockers.
