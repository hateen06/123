# Fresh 1위 후보 웹디자인·구현능력 리서치 Brief

작성일: 2026-04-25  
Workspace: `/root/daker-investskill-lens`  
해커톤: DAKER 월간 해커톤 - 투자 데이터를 시각화하라  
요청자 관점: "이 사이트를 처음 본 심사위원/참가자라고 생각하고, 강력한 1위 후보가 되려면 무엇을 더 해야 하는지"를 끝까지 질문하고 답하라.

## Mission

현재 사이트는 이미 1차 개선이 반영된 상태다. 이전 리뷰의 P0 9개가 구현되어 있다:
1. Analyze 버튼 run state 전환
2. `Analysis.trace` 타입 + trace 생성 로직
3. Skills 영역 execution evidence timeline
4. price sample drawdown mini visual
5. portfolio sample Top1 concentration gauge
6. transaction sample buy/sell meter
7. 임시 문구 제거 (`v0 remix`, `제출용 MVP`, `AI insight`, `Live`)
8. Skills.md rule id ↔ trace id 동기화
9. build + 1440/768/390px 검증

이 상태에서 **새로 처음 의뢰받은 것처럼** 웹디자인, 제품 설계, 구현능력, Skills.md-실행 연결성, 심사/투표 설득력을 다시 평가하라. 단순 버그 리뷰가 아니라 **강력한 1위 후보화 전략/설계 리뷰**가 목표다.

## Hard constraints

- Do not implement.
- Do not modify source files except saving the final report requested below.
- Do not generate deployment/submission artifacts.
- Label unverified platform assumptions as `확인 안 됨`.
- Use only repo-grounded evidence from this workspace where possible.
- Treat the current site as already improved, not as the older raw-Skills MVP.
- If you identify additional questions Hermes/operator should have asked, include them explicitly and answer them when possible.
- If blocked, save a partial report with the same section structure.

## Current verified local state from Hermes

파일 해시:
```text
c2dc7573673088f2cc94a08c49662501b5824023d3f799989a0feea16fb9d559  src/App.tsx
d8aad22d9aa44c5917e47cda2eab09f3ed6e8b628071e2125adac862436313e4  src/lib/analysis.ts
ecb570bc85dc9bd3adffbddaa732c56fb2ddbee0563f85bbdcf09e3868655450  src/styles.css
c94b144f0f7e782f794d986ab7942b706e88cb47623ef58091bccf6a3be9e4d4  index.html
b1826c042419439eb1e355252367ddc15e60905bd7b425ec99da2dbd5452ffe8  package.json
34c916c22eb61f95e85bb5c78a8d7a7c991620c1c37c01ccb413561cefd775df  scripts/analysis-tests.mjs
```

최근 Hermes 검증:
- `npm run test:analysis` passed: `analysis-tests: ok`
- `npm run build` passed. Vite bundle warning remained because chunk > 500KB.
- Browser UI checked across 1440/768/390px. 390px mobile clipping fixed by adding viewport meta.
- Browser runtime check showed no temporary UI copy and no horizontal overflow in final CDP measurement.

## Inspect files

Mandatory:
- `src/App.tsx`
- `src/styles.css`
- `src/lib/analysis.ts`
- `index.html`
- `package.json`
- `scripts/analysis-tests.mjs`
- `skills/*.md`
- `public/skills/*.md`
- `public/samples/*.csv`
- `docs/proposal-pdf-template.md`
- `README.md`

Optional but useful:
- Previous report: `CODEX_RESEARCH_TEAM_1ST_PLACE_DESIGN_IMPL_REPORT.md`
- New report should not merely repeat the previous report. It should critique the post-P0 state.

## Judging axes to evaluate

1. 범용성
   - Does current CSV detection/generalization feel broad enough?
   - Are Korean/real-world finance CSV variants still a risk?
   - What minimal extension would most improve perceived generality without overbuilding?

2. Skills.md 설계
   - Are rule ids, trace ids, and evidence strong enough?
   - Does Skills.md read like an executable rubric or still like documentation?
   - What is the highest-ROI schema/contract improvement if time remains?

3. 대시보드 자동생성
   - Does the UI convincingly show dashboard generation from data + rules?
   - Are run state and trace enough, or should there be a visible generated report/layout summary?
   - What would a judge screenshot and remember?

4. 웹디자인 / public-vote appeal
   - Evaluate first 10 seconds, above-the-fold, mobile, visual hierarchy, finance credibility, originality.
   - Identify weak copy, weak spacing, weak visual rhythm, bland/overloaded areas.
   - Propose concrete design changes by selector/component, not vague inspiration.

5. 구현능력
   - Evaluate TypeScript/data pipeline/testability/responsiveness/performance/error handling.
   - Point out hidden bugs or brittle assumptions.
   - Identify the smallest implementation upgrades that signal engineering skill.

6. Risk and compliance
   - Does the product avoid investment recommendation risk clearly enough?
   - Are disclaimers visible but not damaging to product appeal?

7. Submission strategy
   - What should be done before Skills.md deadline / web link deadline?
   - What low-EV work should be avoided?
   - Should the team prioritize UI polish, data support, report export, deployment polish, or docs alignment next?

## Required final output

Save final report to:

`/root/daker-investskill-lens/CODEX_RESEARCH_TEAM_FRESH_1ST_PLACE_WEB_DESIGN_IMPL_REPORT_20260425.md`

Required sections, exactly in this order:

1. Executive verdict
2. Current post-P0 strengths
3. Remaining gaps by judging axis
4. Web design critique as if first-time judge
5. Implementation/code critique
6. Highest-ROI P0+ upgrades from here
7. Concrete component/file-level change plan
8. Questions Hermes should have asked but did not
9. Low-EV work to avoid
10. Final recommended next 24h build order
11. Verification plan for the next implementation pass
12. Open assumptions / 확인 안 됨

## Desired style

- Be blunt and practical.
- Prefer ranked actions over broad brainstorming.
- Separate `must do before submission` from `nice if time`.
- For every proposed change, include expected judging impact and implementation risk.
- If a recommendation depends on viewing the actual rendered page and you cannot render it, say so and infer only from code.
- Do not claim external leaderboard/judge behavior unless verified.
