# Skills.md — InvestSkill Lens 분석 정의서

이 문서는 **InvestSkill Lens가 임의의 투자 CSV를 자동으로 분석·시각화·요약하기 위해 따르는 규칙 전체**의 인덱스이자 최상위 contract이다. 각 단계의 상세 규칙은 `skills/*.md` 5개 문서로 분리되어 있으며, 본 문서는 단계 간 연결과 전역 원칙을 정의한다.

대회 명세에 따라 본 문서는 다음 다섯 역할을 모두 수행하도록 설계되었다.

1. 투자 데이터 분석 기준 정의
2. 투자 지표 계산 규칙 정의
3. 시각화 선택 기준 정의
4. 리포트 구성 흐름 설계
5. 투자 인사이트 생성 규칙 정의

## 파이프라인

투자 CSV는 다음 단방향 파이프라인을 통과한다. 각 단계의 출력은 다음 단계의 입력이며, 단계 간 결합은 명시된 스키마로만 이루어진다.

```
[CSV] ─▶ (1) Detection ─▶ (2) Metric ─▶ (3) Chart ─▶ (4) Insight ─▶ (5) Layout ─▶ [Dashboard]
            data_type      KPI/risk        chart        insights        slots
            confidence     report          reason                       tabs
            mapped_cols    sections                                     disclaimer
```

각 박스의 규칙은 분리된 .md에 정의된다.

| Step | 문서 | 책임 |
| --- | --- | --- |
| 1 | [`skills/01_data_detection.md`](skills/01_data_detection.md) | 컬럼 alias·정규화·유형 판별·신뢰도 산정 |
| 2 | [`skills/02_metric_rules.md`](skills/02_metric_rules.md) | 결측 처리·지표 공식·위험 판정 매트릭스 |
| 3 | [`skills/03_chart_selection.md`](skills/03_chart_selection.md) | 메인 차트·위험 보조 시각·시맨틱 색상 |
| 4 | [`skills/04_insight_generation.md`](skills/04_insight_generation.md) | 안전 헌장·임계값/문장 매핑·우선순위 |
| 5 | [`skills/05_report_layout.md`](skills/05_report_layout.md) | 정보 위계·KPI 슬롯 의미·반응형 규칙 |

## 전역 원칙

본 시스템 전체에 무조건 우선하는 원칙은 다음과 같다.

| 원칙 | 적용 |
| --- | --- |
| **재현성** | 같은 CSV는 항상 같은 화면을 만들어낸다 (LLM 호출 없음) |
| **안전 우선** | 04 안전 헌장은 모든 출력에 우선 적용된다 |
| **위계 보존** | 위험 신호는 수익 신호보다 먼저, 항상 표시된다 |
| **경계 명시** | 다루지 못하는 케이스는 숨기지 않고 명시한다 (각 문서 §한계 절) |
| **검증 가능성** | 모든 단계는 자동 테스트로 검증되어야 한다 (`scripts/*-tests.mjs`) |

## 일관된 분석 기준

대회 명세의 *"일관된 분석 기준을 기반으로 다양한 투자 데이터를 시각화"* 라는 요구는 본 시스템에서 다음 두 장치로 구현된다.

1. **공통 스키마**: 모든 데이터 유형이 같은 `Analysis` 출력 타입을 채운다 (`detection / kpis / insights / chartReason / series / trace / riskVisual / reportSections / columnMapping`)
2. **공통 KPI 슬롯**: 4개의 KPI 카드는 데이터 유형과 무관하게 항상 같은 의미 슬롯을 갖는다 (05 §KPI 카드 슬롯 규칙)

즉, 평가자가 다른 데이터를 같은 화면 패턴으로 비교할 수 있다.

## 통합 구현 매트릭스

본 데모 빌드에서 실제로 동작하는 모든 규칙은 다음과 같다. 각 규칙 ID는 **(a) 정의된 .md 위치**, **(b) 코드의 trace 출력**, **(c) UI의 가시 증거** 셋이 모두 존재해야 한다.

| Step | Rule ID | 정의 | 화면 증거 |
| --- | --- | --- | --- |
| Detection | `detect.price_timeseries.ohlcv` | 01 §price_timeseries | 주가 시계열 배지 |
| Detection | `detect.portfolio.weight` | 01 §portfolio_allocation | 포트폴리오 비중 배지 |
| Detection | `detect.transaction.execution` | 01 §transaction_log | 거래내역 배지 |
| Detection | `detect.market_indicator.value` | 01 §market_indicator | 시장 지표 배지 |
| Detection | `detect.unknown.fallback` | 01 §Fallback | "지원되지 않는 구조" diagnostic |
| Metric | `metric.price.max_drawdown` | 02 §price_timeseries | KPI(수익률/변동성/최대낙폭) |
| Metric | `metric.portfolio.top_weight` | 02 §portfolio_allocation | KPI(총비중/Top1/집중도) |
| Metric | `metric.transaction.buy_sell_ratio` | 02 §transaction_log | KPI(매수액/매도액/비율) |
| Metric | `metric.market_indicator.period_change` | 02 §market_indicator | KPI(최신값/변화율) |
| Metric | `metric.unknown.row_count` | 02 §unknown | diagnostic 컬럼 프로파일 |
| Chart | `chart.price.dual_axis_drawdown` | 03 §price_line + drawdown_strip | 메인 차트 + drawdown 보조 |
| Chart | `chart.portfolio.allocation_bar_gauge` | 03 §allocation_bar + gauge | 비중 차트 + 게이지 |
| Chart | `chart.transaction.buy_sell_bar_meter` | 03 §flow_bar + meter | 거래 차트 + 미터 |
| Chart | `chart.market_indicator.sparkline` | 03 §indicator_line | 지표 라인 |
| Chart | `chart.unknown.table_preview` | 03 §table_preview | 데이터 미리보기 |
| Insight | `insight.risk.drawdown_warning` | 04 §최대 낙폭 | Insights 탭 |
| Insight | `insight.risk.drawdown_limited` | 04 §최대 낙폭 | Insights 탭 |
| Insight | `insight.portfolio.concentration_high` | 04 §집중도 | Insights 탭 |
| Insight | `insight.portfolio.concentration_normal` | 04 §집중도 | Insights 탭 |
| Insight | `insight.transaction.overtrade_watch` | 04 §거래 활동 | Insights 탭 |
| Insight | `insight.transaction.activity_normal` | 04 §거래 활동 | Insights 탭 |
| Insight | `insight.market_indicator.trend` | 04 §시장 지표 | Insights 탭 |
| Insight | `insight.unknown.safe_summary` | 04 §Fallback | Diagnostics |
| Layout | `layout.dashboard.evidence_first` | 05 §정보 위계 | 화면 전체 구조 |
| Layout | `layout.kpi.shared_slot` | 05 §KPI 슬롯 규칙 | 4개 KPI 카드 |
| Layout | `layout.disclaimer.always_visible` | 05 §디스클레이머 | footer |

화면의 `Trace ↔ Skills contract` 배지는 위 표의 매칭 상태를 실시간 표시한다.

## 안전 헌장 (요약)

자세한 내용은 04 문서 §Safety Charter 참조.

- 매수·매도 추천 금지
- 수익 보장 표현 금지
- 특정 종목 단정 금지
- 위험 신호를 수익 신호보다 먼저 표시
- 모든 화면 상태에서 disclaimer footer 표시

## 미러와 정합

- `skills/*.md`: 제출용 원본 (본 인덱스가 가리키는 정의)
- `public/skills/*.md`: 정적 웹 배포에서 Skills Inspector가 노출하기 위한 미러
- 두 디렉터리는 **항상 동일**해야 한다. 변경 시 둘 다 갱신한다.
- 정합성은 `scripts/submission-tests.mjs`에서 검증된다.

## 검증

각 단계 문서의 `§검증 방법` 절에 정의된 항목은 다음 자동 테스트에 매핑된다.

| 테스트 | 범위 |
| --- | --- |
| `npm run test:analysis` | Detection / Metric / Insight 정합성 |
| `npm run test:design` | 레이아웃·shadcn 컴포넌트 채택·시맨틱 색상 |
| `npm run test:submission` | Skills.md ↔ 미러 정합성, README 필수 항목 |

## 확장 정책

각 .md 의 `§확장` 절은 **현재 데모 외 향후 다룰 범위**를 명시한다. 확장 항목은 다음 두 조건을 동시에 만족할 때 정식 규칙으로 승격된다.

1. 정의 .md 의 §구현 매트릭스에 Rule ID가 등록됨
2. 코드의 `IMPLEMENTED_RULE_CATALOG`에 동일 Rule ID로 매핑됨

승격 전까지 미구현으로 명시되며, UI는 해당 케이스를 fallback으로 안전 처리한다.
