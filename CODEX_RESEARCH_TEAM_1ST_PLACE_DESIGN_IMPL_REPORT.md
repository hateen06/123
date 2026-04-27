# InvestSkill Lens 1위 후보 설계/구현 리뷰

작성자: coordinator_1  
범위: 전략/리뷰 전용. 소스 구현 변경 없음.  
검토 근거: `research_brief_codex_team_1st_place_design_impl.md`, `src/App.tsx`, `src/styles.css`, `src/lib/analysis.ts`, `package.json`, `skills/*.md`, `public/skills/*.md`, `docs/proposal-pdf-template.md`, `public/samples/*.csv`

## 1. Executive verdict

현재 MVP는 제출 가능한 데모다. Vite/React 클라이언트 안에서 샘플 CSV 3종, CSV 업로드, 데이터 유형 판별, KPI, 차트, 인사이트, Skills 파이프라인 표시가 연결되어 있고 API Key 없이 즉시 동작한다. 이 점은 심사 편의성과 안정성에서 강점이다.

다만 "강력한 1위 후보"로 보이기에는 핵심 증거가 약하다. `src/App.tsx`는 `/skills/01_data_detection.md`만 읽어 일부 raw text를 보여주고, `02`~`05` Skills가 실제 계산/차트/인사이트/레이아웃 결과와 연결됐다는 실행 증거를 만들지 않는다. `Analyze` 버튼은 클릭 핸들러가 없고 `query` state는 `analyze(rows)`에 전달되지 않는다. `src/lib/analysis.ts`는 drawdown과 top weight를 이미 계산하지만 UI는 금융 리스크를 별도 시각화로 보여주지 않는다.

가장 빠른 승리 경로는 LLM 연결이 아니다. 이미 있는 규칙 기반 분석을 "Skills.md가 실행되어 대시보드를 조립했다"는 trace로 보이게 만들고, 실제 Analyze run state와 금융 리스크 mini visual을 추가하는 것이다. 이 세 가지가 Skills.md 설계 25점, 대시보드 자동생성 25점, public-vote 스크린샷 매력을 동시에 올린다.

## 2. Judging-axis gap analysis

### 범용성

강점:
- `skills/01_data_detection.md`는 `price_timeseries`, `asset_comparison`, `portfolio_allocation`, `transaction_log`, `market_indicator` 5개 유형을 정의한다.
- `src/lib/analysis.ts`는 `price_timeseries`, `portfolio_allocation`, `transaction_log`, `market_indicator`, `unknown`을 판별한다.
- `public/samples`에는 가격 시계열, 포트폴리오 비중, 거래내역 3종 샘플이 있다.

간극:
- `asset_comparison`은 Skills에는 있지만 분석 분기가 없다.
- `market_indicator`는 감지될 수 있으나 전용 분석 없이 fallback으로 간다.
- 컬럼 synonym은 영어 exact lower-case 중심이라 실제 CSV 변형, 한글 컬럼, 퍼센트 문자열에 약하다.

판단: 지금은 "3개 샘플 중심 범용성"이다. P0에서는 지원 범위를 늘리기보다 trace와 오류 UX로 신뢰를 보강하고, 시간이 남으면 P1에서 `market_indicator` 최소 지원을 붙이는 편이 낫다.

### Skills.md 설계

강점:
- 5개 파일이 detection, metric, chart, insight, layout 역할로 분리되어 있다.
- 위험 문장, 금지 문구, 차트 선택 원칙, 레이아웃 순서가 문서화되어 있다.
- `skills/`와 `public/skills/`는 현재 `diff -qr` 기준 동일하다.

간극:
- 문서는 사람이 읽는 설계서에 가깝고 실행 가능한 계약이 부족하다. rule id, input/output schema, confidence, fallback, trace payload가 없다.
- 앱은 `01_data_detection.md` 일부만 표시하므로 나머지 Skills가 실제 실행에 관여했다는 증거가 약하다.
- `03_chart_selection.md`는 `drawdown_area`를 필수 차트로 선언하지만 UI는 가격/수익률 line chart만 보여준다.

판단: Skills 문서는 구조가 좋다. 다만 1위 후보처럼 보이려면 "문서"가 아니라 "실행 가능한 규칙 시스템"으로 보이도록 trace id와 실제 UI 결과를 맞춰야 한다.

### 대시보드 자동생성

강점:
- `rows`가 바뀌면 `analyze(rows)`가 자동 실행된다.
- 데이터 유형별 KPI, chartReason, series, insight가 달라진다.
- Recharts 기반 line/bar 차트가 즉시 렌더링된다.

간극:
- 레이아웃은 데이터 유형별로 크게 달라지지 않는다.
- 기간 필터 `1M/3M/YTD/ALL`은 정적 표시다.
- `Analyze` 버튼은 시각 요소일 뿐 실행 상태가 없다.

판단: 자동생성 골격은 있다. 부족한 것은 더 많은 차트가 아니라 "어떤 규칙 때문에 이 대시보드가 선택됐는지"를 화면에서 증명하는 장치다.

### 바이브코딩

강점:
- 기획서, Skills.md, React MVP가 같은 제품 스토리를 말한다.
- "Skills.md powered investment dashboard" 콘셉트가 화면에 반영되어 있다.

간극:
- 프롬프트 입력이 실제 동작하지 않아 AI command bar처럼 보이면 역효과가 날 수 있다.
- 생성 과정, 적용 rule id, 산출물 mapping이 UI에 없다.

판단: "AI처럼 보이는 입력창"보다 "규칙 기반 실행 로그"가 더 안전하고 설득력 있다.

### 실용성

강점:
- 로그인/API 없이 CSV만으로 동작한다.
- 투자 권유 방지 문구가 인사이트에 포함된다.
- 샘플 chip과 업로드가 한 화면에 있어 심사자가 바로 체험할 수 있다.

간극:
- 업로드 실패, 빈 CSV, 컬럼 불일치, NaN/퍼센트 문자열 처리 UX가 없다.
- Markdown report 다운로드 같은 결과물 저장 기능이 없다.
- 실제 CSV에서 흔한 한글 컬럼/공백/단위 변형에는 약하다.

판단: 데모 실용성은 충분하다. 운영 도구 실용성은 P1 이후 영역이다.

### Public-vote appeal

강점:
- 첫 화면은 깔끔하고 프리미엄 SaaS 느낌이 있다.
- KPI 카드, 큰 차트, 다크 인사이트 패널은 스크린샷 요소로 좋다.

간극:
- 첫 화면에서 "자동으로 조립됐다"는 증거가 약하다.
- "v0 minimal dashboard remix", "제출용 MVP", "AI insight", "Live"는 공개 제출물의 완성감을 낮출 수 있다.
- SEO/share metadata는 아직 확인된 강점이 아니다.

판단: 첫 화면을 더 큰 랜딩으로 만들 필요는 없다. 결과 화면 위쪽에 execution summary와 trace를 보이게 하는 것이 가장 ROI가 높다.

## 3. Web design direction for a 1위 후보

추천 방향은 "Premium financial analysis console with visible Skills execution"이다. 랜딩 페이지가 아니라, 첫 viewport에서 샘플 분석 결과와 실행 증거가 바로 보이는 금융 콘솔이어야 한다.

구체 방향:
- hero 문구는 줄이고 결과 밀도를 올린다. 예: `Detected price_timeseries`, `confidence 92%`, `5 Skills applied`, `4 KPIs`, `2 visual checks`.
- Skills 실행 로그는 terminal 느낌의 dark panel 또는 compact timeline으로 배치한다. `RUN-01 detect.price_timeseries.ohlcv`, `RUN-02 metric.max_drawdown`, `RUN-03 chart.price_line`처럼 rule id와 evidence를 같이 보여준다.
- 메인 차트는 유지하되 price sample에는 얇은 drawdown strip을, portfolio sample에는 Top1 concentration gauge를 붙인다. 이미 계산된 값이 있어 구현 대비 효과가 크다.
- 위험 색상은 초록/검정만 쓰지 말고 red/orange/green을 명확히 분리한다.
- 한국어 microcopy는 "AI"보다 "규칙 기반", "Skills 실행", "자동 생성", "투자 권유 아님"으로 정리한다.
- 모바일에서는 hero, command, sample, detected card까지 과하게 길어지지 않도록 첫 화면 높이를 관리한다.

## 4. Feature upgrades by ROI

1. Skills execution trace / rule evidence timeline
- Impact: 매우 높음. Skills 설계와 자동생성 점수를 동시에 올린다.
- Effort: 중간. `Analysis` 타입에 trace 배열을 추가하고 UI timeline을 만들면 된다.
- Risk: trace가 하드코딩처럼 보일 수 있다. 반드시 실제 detection/kpi/chart/insight 값에서 evidence를 생성해야 한다.

2. Real Analyze run state + prompt-aware rule mode
- Impact: 높음. 현재 버튼 기대 불일치를 해결한다.
- Effort: 낮음~중간. `isRunning`, `lastRunAt`, `lastPrompt`, `analysisMode`를 추가하고 prompt keyword로 위험/성과/요약 focus 정도만 반영한다.
- Risk: LLM처럼 과장하면 신뢰를 잃는다. "규칙 기반 재분석"으로 명명한다.

3. Financial risk mini visual
- Impact: 높음. 금융 대시보드 신뢰도와 screenshot appeal을 올린다.
- Effort: 중간. price는 `drawdown`, portfolio는 top weight, transaction은 buy/sell ratio를 재사용한다.
- Risk: Recharts responsive overflow와 빈 series 처리.

4. Korean submission copy cleanup
- Impact: 중간~높음. 구현 대비 효과가 매우 좋다.
- Effort: 낮음.
- Risk: 없음에 가깝다.

5. Metadata/error UX
- Impact: 중간. 실용성과 public vote에 도움.
- Effort: 낮음~중간.
- Risk: 기능 점수 직접 영향은 P0보다 낮다.

낮은 우선순위:
- 실제 LLM/API 연결
- PDF 생성
- Sharpe, beta, VaR 등 검증 부담이 큰 금융 지표
- 리밸런싱 추천
- 거대한 마케팅 랜딩 페이지

## 5. Skills.md strengthening contract

Skills.md는 다음 필드를 추가해야 "자동화 스펙"으로 보인다.

```yaml
skill_id: data_detection
version: 1.0
inputs:
  - columns
  - rows_sample
outputs:
  - data_type
  - confidence
  - mapped_columns
  - evidence
rules:
  - id: detect.price_timeseries.ohlcv
    priority: 100
    when:
      required_columns_any:
        date: [date, timestamp, time]
        close: [close, price, value]
      bonus_columns_any: [open, high, low, volume]
    emit:
      data_type: price_timeseries
      confidence_base: 0.70
      evidence:
        - date column matched
        - close column matched
fallback:
  data_type: unknown
  confidence: 0.30
```

파일별 보강:
- `01_data_detection.md`: rule id, confidence 산식, synonym table, unknown fallback.
- `02_metric_rules.md`: metric id, input columns, formula, output key, display format, invalid handling.
- `03_chart_selection.md`: chart id, required fields, selected reason, fallback chart. `drawdown_area`는 구현하거나 P1로 명시한다.
- `04_insight_generation.md`: insight id, trigger condition, severity, template, banned phrase check.
- `05_report_layout.md`: section id, visible condition, priority, data binding.

중요 결정: 문서가 실제 구현보다 앞서가면 감점 위험이 있다. 먼저 trace 구현을 만든 뒤 Skills.md의 rule id를 그 trace와 맞추는 순서가 안전하다.

## 6. Implementation plan

### P0: 최종 웹 링크 전 필수

1. Real Analyze run state
- Files: `src/App.tsx`, `src/styles.css`
- Outline: 버튼에 클릭 핸들러를 붙이고 `isRunning`, `lastRunAt`, `lastPrompt`, `analysisMode`를 추가한다. prompt keyword는 위험 중심/성과 중심/요약 중심 label과 insight ordering에만 반영한다.
- Verification: 브라우저에서 버튼 클릭 시 `실행 중 -> 완료`, 마지막 prompt, mode badge가 바뀌는지 확인. `npm run build`.
- Risk: 실제 LLM처럼 보이면 안 된다.

2. Skills execution trace
- Files: `src/lib/analysis.ts`, `src/App.tsx`, `src/styles.css`
- Outline: `Analysis.trace`를 추가한다. 타입 예시는 `{ step, skillId, ruleId, label, evidence, output }`. detect/metric/chart/insight/layout 단계별로 실제 결과값 기반 trace를 생성한다.
- Verification: 3개 sample 전환 시 trace rule id, evidence, output이 바뀌는지 확인. `rg "detect\\.|metric\\.|chart\\.|insight\\.|layout\\." src skills public/skills`로 문서와 코드 id 일치 확인.
- Risk: 정적 설명처럼 보이면 효과가 낮다. detection mapped columns, KPI 값, chartReason을 evidence로 써야 한다.

3. Financial risk visual
- Files: `src/App.tsx`, `src/styles.css`, 필요 시 `src/lib/analysis.ts`
- Outline: price는 drawdown mini area chart, portfolio는 Top1 concentration gauge, transaction은 buy/sell ratio meter를 표시한다.
- Verification: 세 샘플 모두 보조 시각화가 비어 있지 않고 모바일에서 overflow가 없는지 확인.
- Risk: chart container height와 responsive layout 회귀.

4. Public copy cleanup
- Files: `src/App.tsx`
- Outline: "v0 minimal dashboard remix", "제출용 MVP", "AI insight", "Live"를 "Skills execution dashboard", "규칙 기반 핵심 판단", "실행 완료" 계열로 교체한다.
- Verification: 첫 화면 스크린샷에서 제품처럼 보이고 과장된 AI 표현이 없는지 확인.
- Risk: 낮음.

### P1: 시간이 있으면 높은 가치

5. Skills.md schema/rule id sync
- Files: `skills/*.md`, `public/skills/*.md`
- Outline: P0 trace에서 쓰는 rule id와 문서 rule id를 맞춘다.
- Verification: `diff -qr skills public/skills`; trace id 검색.
- Risk: 문서 과장.

6. Upload/error UX and basic data normalization
- Files: `src/App.tsx`, `src/lib/analysis.ts`
- Outline: empty CSV, parse error, unknown type, percent string, 0~100 weight를 최소 처리한다.
- Verification: 빈 파일/잘못된 CSV/업로드 샘플로 오류 메시지 확인.
- Risk: 파서 edge case.

7. Markdown report download
- Files: `src/App.tsx`, 필요 시 `src/lib/analysis.ts`
- Outline: detection, KPI, chartReason, insights, trace, disclaimer를 markdown으로 다운로드한다.
- Verification: 다운로드 파일에 현재 샘플 결과와 투자 유의사항이 포함되는지 확인.
- Risk: 낮음.

8. SEO/share metadata
- Files: `index.html`
- Outline: title, description, og:title, og:description을 제출 콘셉트에 맞춘다.
- Verification: 빌드 후 HTML 확인.
- Risk: 기능 점수 직접 영향은 낮음.

### P2: polish only

9. `market_indicator` 최소 분석 또는 sample gallery 확장
- Files: `src/lib/analysis.ts`, `src/App.tsx`, `public/samples/*`
- Risk: QA 범위 증가.

10. Drag-and-drop upload and responsive screenshot tuning
- Files: `src/App.tsx`, `src/styles.css`
- Risk: 모바일 회귀.

## 7. Questions Hermes should have asked but did not

Product/UX:
- 심사자가 첫 10초 안에 이해해야 하는 핵심 문장은 무엇인가?
- 제품의 중심은 "투자 분석기"인가, "Skills.md 기반 대시보드 생성기"인가?
- 프롬프트 입력은 AI 기능처럼 보일 필요가 있는가, 아니면 규칙 기반 분석 모드 선택이면 충분한가?
- 공개 투표 대표 스크린샷은 어떤 샘플 상태여야 하는가?

Evaluation/competition:
- 심사자는 Skills.md 파일 자체를 열어보는가, 웹에서만 확인하는가?
- 범용성은 지원 데이터 유형 수, CSV 견고성, 또는 규칙 재사용성 중 무엇을 더 보는가?
- 바이브코딩 점수는 최종 결과물만 보는가, 생성 과정과 Skills 설계도 보는가?
- 외부 LLM 미사용은 감점인가, 안정성과 투명성 가점인가?

Implementation/data:
- 실제 사용자 CSV의 컬럼 synonym 범위는 어디까지 잡을 것인가?
- weight는 0~1과 0~100을 모두 허용할 것인가?
- 결측/비숫자/퍼센트 문자열은 어떻게 처리할 것인가?
- chart selection 결과는 단일 chart인가, chart bundle인가?

Submission/deployment:
- 최종 웹 링크는 모바일에서 주로 열릴 가능성이 있는가?
- 제출 페이지에 Skills.md 링크를 어떻게 노출할 것인가?
- public vote 썸네일/OG 이미지가 플랫폼에 표시되는가?
- README, 제안서, 웹 copy가 같은 지원 범위를 말하는가?

## 8. Low-EV work to avoid

- 실제 LLM/API 연동: 키 관리, 지연, 실패 처리, 비용 리스크가 크다.
- PDF 생성: 제안서 PDF는 이미 있고 웹 MVP에는 Markdown report가 더 빠르다.
- 복잡한 금융 모델: 데이터 요구사항과 검증 부담이 커진다.
- 리밸런싱/매수매도 추천: 투자 자문 오해가 생긴다.
- 큰 랜딩 페이지: 심사자는 설명보다 실행 결과를 본다.
- 테마 전환/과한 애니메이션: 심사 축 직접 기여가 낮고 회귀 위험이 있다.

## 9. Final recommended next 24h build order

1. `Analyze` 버튼을 실제 run state로 만든다.
2. `Analysis.trace` 타입과 trace 생성 로직을 추가한다.
3. 화면의 Skills 영역을 raw `01_data_detection.md` 일부 표시에서 trace timeline 중심으로 바꾼다.
4. price sample에 drawdown mini visual을 추가한다.
5. portfolio sample에 Top1 concentration gauge를 추가한다.
6. transaction sample에 buy/sell ratio meter를 추가한다.
7. 공개 제출용 copy를 정리한다.
8. Skills.md에 rule id/input/output/fallback/trace schema를 추가하고 실제 trace id와 맞춘다.
9. `npm run build`로 TypeScript/Vite 빌드를 검증한다.
10. 1440px/768px/390px에서 첫 화면, KPI, chart, trace, table overflow를 확인한다.
11. 시간이 남으면 Markdown report download와 SEO/share metadata를 붙인다.

## Coordinator routing decision

빌드로 넘길 준비는 됐다. 단, 하나의 범용 "대시보드 개선" 카드가 아니라 다음 명시 계약으로 구현해야 한다.

P0 구현 카드: `trace-runstate-risk-copy`
- Owner: `implementer_1`
- Scope: `src/lib/analysis.ts`, `src/App.tsx`, `src/styles.css`
- Required outcomes:
  1. Analyze button has visible run state and prompt-aware rule mode.
  2. `Analysis.trace` exists and changes across the three samples.
  3. Skills section displays evidence timeline tied to detection/KPI/chart/insight/layout results.
  4. At least two risk visuals are implemented: price drawdown and portfolio concentration. Transaction buy/sell meter is preferred if time allows.
  5. Public-facing copy removes "v0 remix", "제출용 MVP", "AI insight", and misleading "Live".
- Acceptance:
  - `npm run build` passes.
  - Three sample chips change KPI, chart, insight, and trace.
  - CSV upload still works.
  - No unsupported LLM/API implication in UI copy.
  - 390px mobile does not show incoherent overlap in hero, chart, trace, or table sections.

P1 follow-up card: `skills-schema-metadata-error-ux`
- Owner after P0: `implementer_1`, review by `reviewer_1`
- Scope: `skills/*.md`, `public/skills/*.md`, `index.html`, small parser/error handling in `src/*`
- Required outcomes:
  1. Skills rule ids and trace ids are synchronized.
  2. Empty/invalid CSV and unknown data type produce clear UI messages.
  3. SEO/share metadata is present.
  4. `diff -qr skills public/skills` remains clean.

## Verification performed for this report

- Read the brief and requested source/docs.
- Confirmed `src/App.tsx` has `query` state and an `Analyze` button but no click handler.
- Confirmed only `/skills/01_data_detection.md` is fetched into the UI.
- Confirmed `src/lib/analysis.ts` computes `drawdown` for price series and top weight for portfolio.
- Confirmed `skills/` and `public/skills/` currently match with `diff -qr skills public/skills`.
- Did not run `npm run build`, because this turn is strategy/review only and should not create or refresh build artifacts.

## Final judgment

현재 MVP는 제출 가능하지만 1위 후보 인상은 "실행되는 Skills 시스템" 증거가 약해서 막힌다. 다음 액션은 구현 범위를 넓히는 것이 아니라, trace/run-state/financial-risk/copy 네 축을 P0로 묶어 첫 화면과 Skills 영역에서 자동생성의 증거를 보이게 하는 것이다. 이 계약이면 implementer가 바로 시작할 수 있고, reviewer도 샘플 전환과 trace id 일치 여부로 명확하게 검증할 수 있다.
