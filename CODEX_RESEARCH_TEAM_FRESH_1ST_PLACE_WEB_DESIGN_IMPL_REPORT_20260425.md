# Fresh 1위 후보 웹디자인·구현 전략 리뷰

작성일: 2026-04-25  
작성자: researcher_3  
범위: 전략/리뷰 전용. 소스 구현 변경 없음.  
검토 근거: `research_brief_codex_team_fresh_1st_place_web_design_impl_20260425.md`, `src/App.tsx`, `src/styles.css`, `src/lib/analysis.ts`, `index.html`, `package.json`, `scripts/analysis-tests.mjs`, `skills/*.md`, `public/skills/*.md`, `public/samples/*.csv`, `docs/proposal-pdf-template.md`, `README.md`, 이전 보고서 `CODEX_RESEARCH_TEAM_1ST_PLACE_DESIGN_IMPL_REPORT.md`

## 1. Executive verdict

현재 post-P0 사이트는 "제출 가능한 데모"에서 "심사위원이 이해하기 쉬운 규칙 기반 투자 대시보드"로 한 단계 올라왔다. Analyze run state, trace, risk mini visual, 임시 문구 제거, viewport 보정은 모두 1차 치명 리스크를 줄였다.

하지만 강력한 1위 후보로는 아직 한 문장으로 밀어붙이는 증거가 약하다. 첫 10초에 보이는 것은 세련된 금융 SaaS 카드 UI와 샘플 분석 결과이지, "Skills.md가 대시보드를 실제로 생성한다"는 압도적인 증명은 아니다. `src/App.tsx`는 trace를 잘 보여주지만 `src/lib/analysis.ts`의 분기와 문서 Skills의 범위가 아직 다르다. 특히 Skills 문서는 `asset_comparison`, `market_indicator`, 섹터/지역, 이동평균, 유의사항 하단 배치를 말하지만 구현은 가격/포트폴리오/거래 3종 중심이다.

다음 24시간의 우선순위는 기능 확장이 아니라 신뢰 증거 강화다. `샘플 3종 + 업로드`가 아니라 `5단계 Skills 실행 계약 + 생성된 리포트 요약 + 문서/코드 rule id 일치`가 첫 화면과 하단에서 반복적으로 확인되어야 한다.

## 2. Current post-P0 strengths

1. 즉시 체험 가능성이 좋다. `src/App.tsx`는 기본 가격 샘플을 자동 로드하고, 샘플 3종과 CSV 업로드를 한 화면에서 제공한다.
2. 대시보드 골격이 명확하다. hero, run strip, KPI grid, chart, risk visual, insight, Skills trace, data preview 흐름이 있다.
3. trace의 최소 실행 증거가 들어왔다. `Analysis.trace`는 `skillId`, `ruleId`, `evidence`, `output`을 포함하고, UI는 5단계 timeline으로 보여준다.
4. 금융 리스크 시각화가 생겼다. 가격은 drawdown area, 포트폴리오는 concentration gauge, 거래는 buy/sell meter로 샘플별 기억 포인트가 생겼다.
5. 안전 문구가 인사이트에 포함된다. 각 전용 분석은 "투자 권유가 아니라 입력 데이터 기반 요약"을 포함한다.
6. 기본 검증은 통과했다. 직접 실행 기준 `npm run test:analysis`는 `analysis-tests: ok`, `npm run build`는 통과했고 Vite 500KB chunk 경고만 남았다.
7. `skills/`와 `public/skills/`는 diff 기준 동일하다. 제출용 Skills와 public 표시용 Skills가 갈라진 상태는 아니다.

## 3. Remaining gaps by judging axis

### 범용성

현재 인상은 "범용 투자 CSV 엔진"보다 "세 샘플을 잘 해석하는 규칙 데모"에 가깝다. `detect()`는 price, portfolio, transaction, market indicator, unknown을 감지하지만 실제 전용 분석은 price/portfolio/transaction만 있다. `market_indicator`는 감지 후 fallback으로 처리되고, Skills에 있는 `asset_comparison`은 구현 분기가 없다. 한국어 컬럼은 일부 지원하지만 실전 CSV에서 흔한 `매수/매도`, `종목코드`, `체결가`, `평가금액`, `수익률(%)`, `일자 ` 같은 변형은 제한적이다.

최소 확장으로 가장 효과적인 것은 새 차트 5개가 아니라 synonym table과 detection matrix를 UI에 공개하는 것이다. "이 CSV에서 date=일자, close=종가로 매핑"을 보여주면 범용성이 실제보다 더 믿을 만하게 보인다.

### Skills.md 설계

Skills.md는 구조가 좋지만 아직 실행 가능한 계약이라기보다 설계 문서 성격이 강하다. rule id는 생겼지만 `input schema`, `output schema`, `required fields`, `fallback`, `severity`, `display binding`이 문서마다 균일하지 않다. 구현 trace와 문서 rule id의 연결은 보이지만, 문서에 있는 모든 rule이 지원된다고 믿게 만들면 역효과가 난다.

가장 높은 ROI는 Skills 문서 상단에 `Implemented in demo`와 `Declared future rule`을 분리하는 것이다. 구현 범위를 줄이는 것이 아니라 심사 신뢰를 지키는 작업이다.

### 대시보드 자동생성

데이터 유형별 KPI, chartReason, trace, riskVisual이 달라지는 점은 자동생성처럼 보인다. 그러나 레이아웃 자체는 거의 고정이고, "생성된 리포트/layout summary"가 별도 산출물로 보이지 않는다. 지금은 dashboard가 생성됐다기보다 dashboard component가 다른 데이터를 채운 느낌이 강하다.

심사위원이 스크린샷으로 기억할 장면은 `5 Skills applied`, `Generated report sections`, `Rule IDs matched`, `Risk visual`이 함께 있는 화면이어야 한다. 현재는 이 정보가 화면 아래로 분산된다.

### 웹디자인 / public-vote appeal

첫 화면은 깔끔하지만 다소 일반적인 SaaS hero다. `투자 CSV를 넣으면 규칙이 분석 화면을 조립합니다`는 정확하지만, 1위 후보형 한 방은 약하다. 금융 신뢰도는 다크 insight panel과 KPI 카드가 주지만, originality는 Skills trace에 달려 있다. 이 trace가 첫 화면에 더 가까워져야 한다.

모바일은 overflow fix가 들어갔고 CSS도 430px 대응이 있다. 다만 `run-strip`이 모바일에서 4줄로 늘어나 첫 viewport의 분석 결과 진입을 늦출 가능성이 있다. 실제 모바일 스크린샷은 이번 리뷰에서 생성하지 않았으므로 최종 판정은 확인 안 됨.

### 구현능력

타입과 테스트의 방향은 좋다. `Analysis.trace`와 `RiskVisual` union은 심사위원에게 설명하기 쉬운 구현 구조다. 다만 `series: any[]`, parse error 무시, fetch 실패 무시, CSV empty/error UX 부재는 구현 완성도 신호를 깎는다. `package.json`이 `latest` 의존성만 쓰는 점도 제출 직전 재현성 관점에서는 약하다.

### Risk and compliance

인사이트마다 투자 권유 아님 문구가 있지만, 문서의 `05_report_layout.md`가 요구하는 하단 유의사항 섹션은 앱에 명시적으로 없다. 안전 문구가 인사이트 중 하나로 섞여 있어 법적/심사 신뢰 관점에서는 약하다. 별도 footer disclaimer가 필요하다.

### Submission strategy

Skills.md deadline 전에는 문서와 trace의 불일치를 줄이는 것이 최우선이다. 웹 링크 deadline 전에는 첫 화면의 설득 구조, 오류 UX, 배포 메타데이터를 보강해야 한다. 낮은 ROI는 PDF 생성, LLM 연결, 고급 금융지표 과확장이다.

## 4. Web design critique as if first-time judge

첫 10초 판단: "보기 좋고 작동하는 투자 CSV 대시보드"다. 그러나 "이게 왜 해커톤 1위인가"라는 질문에는 아직 trace 섹션까지 내려가야 답이 나온다.

Above-the-fold 문제:
- `.hero-card`가 큰 중앙 hero로 시작해 제품의 실제 결과보다 마케팅 문구가 먼저 보인다.
- `.run-strip`은 mode/runs/last/prompt를 보여주지만, 자동생성의 핵심인 rule id와 generated sections는 없다.
- 샘플 버튼은 좋지만 "3 samples supported"로 읽힐 위험이 있다. "Upload your CSV"의 범용성 증거가 약하다.

시각 위계:
- `.metric-grid`와 `.workspace-grid`는 금융 대시보드처럼 읽히며 강점이다.
- `.insight-panel`은 어두운 배경으로 중요도를 잘 만든다.
- `.trace-timeline`은 하단에 있어 Skills.md 차별화가 늦게 나온다.
- `.period-pills`의 `ALL`, `{mode}`, `{rules}`는 필터처럼 보이지만 실제 기간 필터가 아니다. 클릭 불가능한 컨트롤처럼 보이면 구현 깊이를 의심받을 수 있다.

구체 개선:
1. `.hero-card` 하단 또는 `.metric-grid` 이전에 `execution-summary` 3칸 추가: `Detected`, `Generated sections`, `Matched rule ids`. 기대 효과 높음, 구현 위험 낮음.
2. `.run-strip`의 `prompt`는 줄이고 `rule contract` 또는 `5-step trace`를 더 앞에 둔다. 기대 효과 중상, 위험 낮음.
3. `.period-pills`를 버튼형 필터처럼 보이지 않게 `chart-meta` badge로 변경하거나 실제 필터로 만든다. 기대 효과 중간, 위험 낮음.
4. `.trace-timeline` 첫 2개 step을 compact preview로 chart panel 상단에 노출한다. 기대 효과 높음, 위험 중간.
5. `.data-preview`보다 `Generated report` 패널을 우선한다. 데이터 미리보기는 신뢰 보조이고, 제출물 기억 포인트는 생성 결과다.
6. `.hero-card`의 장식 gradient는 유지해도 되지만, 금융 제품 신뢰를 위해 실제 chart thumbnail 또는 live KPI snippet을 hero 안에 더 가까이 둔다. 기대 효과 중간, 위험 중간.
7. 모바일에서 `.run-strip span` 4줄은 첫 화면 밀도를 해친다. 2x2 grid 또는 horizontal scroll badge로 줄인다. 기대 효과 중간, 위험 낮음.

## 5. Implementation/code critique

핵심 구조:
- `src/lib/analysis.ts`는 detection, KPI, insight, trace, risk visual을 한 파일에서 처리한다. MVP에는 적절하지만 다음 단계에서는 rule catalog와 analyzer를 분리해야 한다.
- `Analysis.series`가 `any[]`라 chart별 data contract가 약하다. 구현능력 평가에서는 union type으로 분리하는 편이 더 강하다.
- `detect()`는 컬럼명을 lower/trim 처리하지만 exact synonym match다. 실전 CSV 변형에 약하다.
- `num()`은 comma와 `%`만 제거하고 비어 있거나 잘못된 숫자를 0으로 바꾼다. 결측을 0으로 처리하면 금융 지표가 조용히 왜곡된다.
- price 정렬은 문자열 `localeCompare`다. ISO 날짜 샘플에는 충분하지만 한국식 날짜, slash 날짜, timestamp 혼합은 확인 안 됨.
- `parseCsv()`는 PapaParse errors를 무시한다. 업로드 실패/깨진 CSV/빈 CSV UX가 없다.
- `loadCsv()`는 fetch 실패를 처리하지 않는다.
- `focusMode(query)`는 UI mode만 바꾸고 분석 결과를 실질적으로 재정렬하지 않는다. "prompt-aware"처럼 보이면 기대 불일치가 생긴다.
- transaction side 판정은 `sell` 포함 여부만 본다. 한글 `매도`는 현재 sell로 집계되지 않을 수 있다.
- `market_indicator`는 detection label은 있지만 전용 analyzer가 없어 fallback으로 간다.
- `package.json`의 모든 dependency가 `latest`다. 해커톤 제출 직전에는 lockfile이 있어도 설명상 재현성 점수가 약해질 수 있다.

테스트:
- `scripts/analysis-tests.mjs`는 3개 전용 샘플의 happy path와 trace/riskVisual 존재를 확인한다.
- 부족한 테스트는 한글 컬럼 synonym, percent/blank/invalid numeric, unknown fallback, market_indicator fallback copy, CSV parse error, transaction `매도` 처리다.

성능:
- 빌드는 통과하지만 `dist/assets/index-*.js`가 611.23 kB이고 Vite chunk warning이 남는다. Recharts 중심이라 심사 데모에는 치명적이지 않지만, 구현 완성도 관점에서는 lazy import 또는 chunk split 검토 가치가 있다.

## 6. Highest-ROI P0+ upgrades from here

### Must do before submission

1. Generated report summary 패널
- 내용: `[데이터 요약] [핵심 지표] [시각화 결과] [위험 요약] [인사이트] [적용 Skills] [유의사항]`가 이번 분석에서 어떻게 채워졌는지 5~7줄로 표시.
- 기대 심사 영향: 대시보드 자동생성 점수 상승.
- 구현 위험: 낮음. `Analysis`에 `reportSections` 또는 UI derived list 추가.

2. Trace-Skills contract badge
- 내용: trace rule id가 Skills.md에 존재한다는 `matched` 표시와 미구현 declared rule은 숨기거나 명시.
- 기대 심사 영향: Skills.md 설계 신뢰 상승.
- 구현 위험: 중간. 정적 rule id catalog를 두면 충분하다.

3. Korean real-world CSV support 최소 보강
- 내용: transaction `매수/매도`, `체결가`, `종목코드`, portfolio `평가비중`, price `기준일`, `종가`, `수익률(%)` synonym 추가.
- 기대 심사 영향: 범용성 상승.
- 구현 위험: 낮음~중간. detection 오탐 테스트 필요.

4. Error/empty state
- 내용: parse errors, empty rows, unsupported columns에서 "지원되지 않음" 대신 "필요 컬럼/감지된 컬럼/추천 매핑"을 보여준다.
- 기대 심사 영향: 실용성/구현능력 상승.
- 구현 위험: 낮음.

5. Standalone disclaimer footer
- 내용: 모든 결과 하단에 독립 유의사항 표시. 인사이트 문장 안의 disclaimer는 유지하되 UI footer로도 분리.
- 기대 심사 영향: compliance 신뢰 상승.
- 구현 위험: 낮음.

### Nice if time

6. `market_indicator` 최소 전용 analyzer
- 내용: latest value, period change, trend sparkline, trace.
- 기대 심사 영향: 범용성 상승.
- 구현 위험: 중간.

7. `asset_comparison`을 문서에서 P1로 명시하거나 최소 구현
- 내용: 여러 asset/date/price long format을 normalized line으로 표시.
- 기대 심사 영향: 범용성 상승.
- 구현 위험: 중상. 데이터 shape가 다양해 오탐 가능.

8. Dependency pin explanation
- 내용: `latest`를 lockfile 기반으로 제출한다는 README 설명 또는 버전 pin.
- 기대 심사 영향: 구현 신뢰 소폭 상승.
- 구현 위험: 낮음.

## 7. Concrete component/file-level change plan

1. `src/lib/analysis.ts`
- `Analysis`에 `reportSections`, `columnMapping`, `warnings` 추가.
- `Row` parsing 결과에서 invalid numeric을 0으로 삼키지 말고 warning으로 노출.
- `detect()` synonym table을 상수화하고 한글/증권 CSV alias 추가.
- `analyzeMarketIndicator()`를 추가하거나 Skills 문서에서 market indicator를 P1 declared로 표시.
- Impact: 높음. Risk: 중간.

2. `src/App.tsx`
- `.run-strip` 다음에 `ExecutionSummary` 컴포넌트 추가.
- `GeneratedReportPanel`을 lower grid의 data preview보다 먼저 배치.
- `period-pills`를 non-interactive meta badge로 rename하거나 실제 filter handler 추가.
- `parseCsv()`에서 `parsed.errors`와 empty row를 state로 보관해 error panel 표시.
- `RiskVisualPanel`에 데이터 부족 상태를 명확히 표시.
- Impact: 높음. Risk: 낮음~중간.

3. `src/styles.css`
- `.execution-summary`, `.report-sections`, `.contract-badge`, `.warning-panel`, `.disclaimer-footer` 스타일 추가.
- 모바일 `.run-strip`을 2열 compact grid로 바꾸고 prompt badge는 말줄임 처리.
- `.trace-timeline` compact variant 추가.
- Impact: 중상. Risk: 낮음.

4. `skills/*.md`와 `public/skills/*.md`
- 각 파일에 `Implemented demo rules`와 `Declared future rules` 구분.
- rule id 표를 실제 `src/lib/analysis.ts` trace id와 1:1로 정리.
- `05_report_layout.md`에 generated report summary 표시 규칙 추가.
- Impact: 높음. Risk: 낮음.

5. `scripts/analysis-tests.mjs`
- 한글 컬럼 샘플, invalid numeric warning, transaction `매도`, market indicator 처리, unknown fallback trace 추가.
- Impact: 중상. Risk: 낮음.

6. `README.md`
- "지원 범위", "샘플로 확인 가능한 rule ids", "투자 권유 아님", "로컬 검증 명령"을 짧게 추가.
- Impact: 중간. Risk: 낮음.

7. `index.html`
- description/Open Graph/Twitter card 최소 메타 추가.
- Impact: public-vote 공유 신뢰 상승. Risk: 낮음.

## 8. Questions Hermes should have asked but did not

1. 심사 기준의 실제 배점과 제출 플랫폼 설명은 확인됐는가?
- 답: repo의 `docs/proposal-pdf-template.md`에는 범용성/Skills.md/대시보드 자동생성/바이브코딩/실용성 및 창의성 배점표가 있다. 외부 플랫폼의 실제 최신 기준은 확인 안 됨.

2. Skills.md 제출물은 `skills/`만 제출하는가, `public/skills/`도 심사 대상인가?
- 답: repo에는 두 경로가 있고 현재 내용은 동일하다. 제출 플랫폼이 어느 경로를 요구하는지는 확인 안 됨.

3. 웹 링크 심사에서 업로드 기능을 실제로 써볼 가능성이 높은가?
- 답: 확인 안 됨. 하지만 업로드 CSV 실패 UX는 심사자가 직접 시도할 때 가장 빠르게 신뢰를 잃는 지점이라 보강 가치가 높다.

4. public vote는 모바일 유입이 많은가?
- 답: 확인 안 됨. 다만 일반 공개 투표라면 모바일 첫 화면이 중요하다는 가정은 합리적이다. 실제 유입 디바이스 통계는 없다.

5. "AI"라는 표현을 쓰는 것이 유리한가, Skills 실행이라는 표현이 유리한가?
- 답: 이 repo의 차별점은 LLM 호출이 아니라 Skills.md 규칙 실행이다. 구현과 맞지 않는 AI 과장은 피하고, `rule-based Skills execution`으로 밀어야 한다.

6. 실제 한국 증권사 CSV 컬럼 예시를 확보했는가?
- 답: repo에는 샘플 3종만 있다. 실제 증권사 CSV는 확인 안 됨. 최소 synonym 보강은 추론 기반이어야 하며 테스트 샘플을 함께 추가해야 한다.

7. "범용성"을 많이 늘릴 것인가, 현재 범위를 정확히 증명할 것인가?
- 답: 남은 시간이 짧다는 전제에서는 정확히 증명하는 쪽이 낫다. 3종을 깊게 믿게 만들고, market indicator 정도만 최소 확장 후보로 둔다.

8. 제출 전 반드시 캡처해야 할 hero screenshot은 무엇인가?
- 답: `Detected data`, `5 Skills applied`, `Generated report sections`, main chart, risk visual이 한 화면에 들어오는 캡처가 필요하다. 현재 구조에서는 trace가 아래에 있어 캡처 설득력이 분산될 수 있다.

9. 배포 링크에서 새로고침/직접 path 접근이 안전한가?
- 답: SPA 단일 path만 쓰므로 큰 문제는 없어 보인다. 실제 배포 플랫폼 rewrite 설정은 확인 안 됨.

10. 금융 compliance는 어느 수준까지 필요한가?
- 답: 법률 검토는 확인 안 됨. 다만 별도 disclaimer footer는 구현 부담 대비 신뢰 효과가 크다.

## 9. Low-EV work to avoid

1. 실제 LLM/API 연결: 비용, 키, 지연, 실패 리스크가 커지고 현재 제품 차별점과도 어긋난다.
2. PDF 다운로드 구현: 제안서 PDF는 이미 docs에 있고, 웹 심사 설득에는 report summary가 더 빠르다.
3. 고급 금융지표 과확장: Sharpe, beta, VaR, 리밸런싱 추천은 검증 부담과 투자자문 오해 리스크가 있다.
4. 대형 마케팅 랜딩 페이지: 첫 화면은 제품 체험이 우선이다.
5. 새 시각화 라이브러리 도입: Recharts로 충분하다. bundle warning이 있어도 라이브러리 교체는 ROI가 낮다.
6. 모든 Skills 선언 구현: 문서 범위를 정직하게 구분하는 편이 더 안전하다.
7. 미검증 외부 데이터 연동: 제출 안정성을 해친다.

## 10. Final recommended next 24h build order

### Must do before submission

1. `Generated report summary`를 추가한다.
2. trace rule id와 Skills 문서의 `Implemented demo rules`를 맞춘다.
3. 한글/실전 CSV synonym 최소 세트를 추가하고 테스트한다.
4. CSV parse/empty/unsupported error UX를 추가한다.
5. 독립 disclaimer footer를 추가한다.
6. 모바일 390px와 데스크톱 1440px에서 첫 화면 캡처 기준으로 trace/summary가 충분히 보이는지 확인한다.

### Nice if time

7. market indicator 최소 전용 analyzer를 추가한다.
8. README에 지원 범위와 검증 명령을 보강한다.
9. OG metadata를 추가한다.
10. Vite chunk warning은 lazy chart import로 줄일 수 있으면 처리하되, 기능/설득 보강보다 뒤로 둔다.

## 11. Verification plan for the next implementation pass

필수 CLI:
```bash
npm run test:analysis
npm run build
rg "detect\\.|metric\\.|chart\\.|insight\\.|layout\\." src skills public/skills
diff -q skills/01_data_detection.md public/skills/01_data_detection.md
diff -q skills/02_metric_rules.md public/skills/02_metric_rules.md
diff -q skills/03_chart_selection.md public/skills/03_chart_selection.md
diff -q skills/04_insight_generation.md public/skills/04_insight_generation.md
diff -q skills/05_report_layout.md public/skills/05_report_layout.md
```

분석 테스트에 추가할 케이스:
- `일자,종가,거래량` 가격 CSV가 price로 감지된다.
- `종목코드,평가비중` 포트폴리오 CSV가 portfolio로 감지된다.
- `일자,종목,매매,수량,체결가` 거래 CSV에서 `매도`가 sell로 집계된다.
- 빈 CSV와 깨진 CSV에서 error panel이 뜬다.
- invalid numeric은 0으로 조용히 계산되지 않고 warning에 노출된다.
- unknown fallback에도 trace 5단계와 추천 컬럼 안내가 나온다.

브라우저 검증:
- 1440px: hero, execution summary, KPI, chart/risk visual이 첫 스크롤 안에서 설득력 있게 보이는지 확인.
- 768px: grid collapse 후 panel 순서가 `summary -> KPI -> chart -> insight -> report -> trace`로 자연스러운지 확인.
- 390px: horizontal overflow 없음, run strip 과다 높이 없음, chart labels/trace code 줄바꿈 정상.
- 샘플 3종 전환 시 detection, KPI, chart, risk visual, trace, generated report summary가 모두 바뀌는지 확인.
- CSV 업로드 실패/unsupported/empty 상태를 직접 확인.

현재 리뷰에서 직접 수행한 검증:
```text
npm run test:analysis -> analysis-tests: ok
npm run build -> built successfully, Vite 500KB chunk warning remains
curl -I http://localhost:5173/ -> 200 OK while Vite dev server was running
```

## 12. Open assumptions / 확인 안 됨

- 실제 해커톤 플랫폼의 최신 심사 기준, 제출 양식, public vote 방식은 확인 안 됨.
- 외부 배포 환경의 rewrite/cache/asset path 동작은 확인 안 됨.
- 실제 렌더링 스크린샷 기반 픽셀 검증은 이번 리뷰에서 수행하지 않았다. 코드, CSS, build/test, dev server HTTP 응답 기반 평가다.
- 390px 모바일에서 최종 시각 밀도와 텍스트 겹침은 이전 Hermes 검증을 신뢰했지만 이번 턴에서 재측정하지 않았다.
- 실제 한국 증권사 CSV 컬럼 분포는 repo에 없어서 확인 안 됨.
- 투자 관련 문구의 법률 적합성은 확인 안 됨. 별도 법률 검토 없이 product-risk 관점으로만 판단했다.
- `docs/proposal-pdf-template.md`의 배점표가 실제 제출 플랫폼과 일치하는지는 확인 안 됨.
