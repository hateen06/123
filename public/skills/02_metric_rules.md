# 02 · Metric Calculation Skill

## 목적과 위치

이 문서는 **판별된 데이터 유형(`data_type`)에 따라 어떤 핵심 지표를 어떻게 계산할지** 정의한다.
지표는 KPI 카드, 차트 색상 결정, 인사이트 임계값 비교, 위험 시각 모두에 재사용된다.

```
(1) Data Detection ─▶  ★ (2) Metric Calculation ▶  (3) Chart  (4) Insight  (5) Layout
```

## 입력

| 항목 | 설명 |
| --- | --- |
| `data_type` | 01번 스킬이 결정한 유형 |
| `mapped_columns` | canonical → 원본 컬럼명 매핑 |
| `rows` | CSV 파싱 결과 (필요 시 날짜 오름차순 정렬 후 사용) |

## 공통 처리 정책

| 케이스 | 정책 |
| --- | --- |
| 결측 셀 | 해당 행을 통계에서 제외(드롭). drop된 행 수는 warning으로 노출 |
| 콤마/단위 | `1,234` → `1234`, `12.3%` → `0.123` 으로 정규화 |
| 음수 부호 | `(123)`, `-123` 모두 `-123`으로 처리 |
| 정렬 | 시계열 지표는 항상 날짜 오름차순으로 계산 |
| 비율 표기 | 내부 계산은 소수, 출력은 퍼센트(`0.0573` → `5.73%`) |

## 데이터 유형별 지표

### `price_timeseries`

| 지표 | 정의 | 사용처 |
| --- | --- | --- |
| `daily_return` | `closeₜ / closeₜ₋₁ − 1` | 누적/변동성 계산 베이스 |
| `cumulative_return` | `Π(1 + daily_return) − 1` | KPI: 총 수익률 |
| `volatility` | `stdev(daily_return) × √252` | KPI: 연환산 변동성 |
| `running_peak` | 누적 가치의 누적 최댓값 | drawdown 계산 |
| `drawdown` | `cumulative_value / running_peak − 1` | risk visual: drawdown 영역 차트 |
| `max_drawdown` | `min(drawdown)` | KPI: 최대 낙폭 |
| `latest_close` | 마지막 행의 close | KPI: 최근가 |
| `trend_label` | MA20 vs MA60 비교 결과(`상승`/`횡보`/`하락`) | KPI: 추세 라벨 |

### `portfolio_allocation`

| 지표 | 정의 |
| --- | --- |
| `weight_total` | 모든 weight 합 (정상 = 100% ± 5%) |
| `top1_weight` | 최대 비중 자산의 비중 |
| `top5_weight` | 상위 5개 비중 합 |
| `holding_count` | 보유 자산 수 |

**집중도 위험 판정**

| 조건 | `concentration_risk` |
| --- | --- |
| `top1_weight ≥ 0.30` | `high` |
| `0.20 ≤ top1_weight < 0.30` | `medium` |
| `top1_weight < 0.20` | `low` |

### `transaction_log`

| 지표 | 정의 |
| --- | --- |
| `buy_amount` | side=buy 행의 `quantity × price` 합 |
| `sell_amount` | side=sell 행의 `quantity × price` 합 |
| `buy_sell_ratio` | `buy_amount / max(sell_amount, ε)` |
| `trade_count` | 전체 행 수 |
| `avg_buy_price` | side=buy 행의 가중평균 체결가 |

**과매매 판정**: `trade_count` 가 분석 기간(일) 의 2배 이상이면 `overtrade_watch`.

### `market_indicator`

| 지표 | 정의 |
| --- | --- |
| `latest_value` | 마지막 행의 close/value |
| `period_change_pct` | `(latest − first) / first` |
| `direction` | `up` / `flat` / `down` (변화율 ±0.5% 기준) |

### `unknown`

판별 실패 시에도 다음을 항상 출력한다.

- `row_count`
- `column_count`
- 숫자형 컬럼 목록과 각 컬럼의 결측 비율

이 정보는 사용자가 데이터를 정상화한 뒤 재시도할 수 있도록 돕는다.

## 출력 스키마

```yaml
kpis:
  - label: 총 수익률
    value: "8.74%"
    tone: good | warn | bad | neutral
  - ...
risk_visual:
  kind: drawdown | concentration | buy_sell | none
  ...
report_sections:
  - title: 핵심 요약
    value: "8.74%"
    detail: "분석 기간 동안 가격 상승 흐름이 관찰됩니다."
    tone: good
```

`tone` 은 03 차트/색상과 04 인사이트가 같은 신호를 일관되게 사용하기 위한 **시맨틱 태그**다.

| tone | 의미 | UI 매핑 |
| --- | --- | --- |
| `good` | 긍정/양호 | primary 강조 |
| `neutral` | 정보성 | outline |
| `warn` | 주의 필요 | secondary |
| `bad` | 부정/위험 | destructive |

## 대시보드 생성 binding

Metric skill의 결과는 단순 수치 계산에서 끝나지 않고, Layout skill이 그대로 화면에 배치할 수 있는 구조로 나와야 한다.

| 산출물 | 생성 기준 | 화면 위치 | 심사 포인트 |
| --- | --- | --- | --- |
| `kpis[0..3]` | 데이터 유형별 핵심 4개를 우선 정렬 | KPI Grid | 다른 CSV도 같은 슬롯 의미 유지 |
| `kpis[4..]` | 상세 보조 지표 | Detail/summary 영역 | 자동 리포트 풍부화 |
| `riskVisual` | drawdown/concentration/buy_sell/none 중 하나 | chart 아래 risk card | 위험을 수익보다 숨기지 않음 |
| `reportSections` | 핵심 요약, 위험 포인트, 생성된 화면, 규칙 정합 | generated report summary | Skills가 만든 dashboard라는 증거 |
| `warnings` | 숫자 변환·결측·정규화 문제 | diagnostic/warning 영역 | 데이터 품질 문제를 숨기지 않음 |

## 리서치팀 검증 질문 대응

| 검증 질문 | Metric skill의 답변 |
| --- | --- |
| KPI가 임의로 고른 숫자인가? | 각 `data_type`별 공식과 화면 사용처를 이 문서에 고정하고, trace step 02에 계산 evidence를 남긴다. |
| 위험 지표가 별도로 보이는가? | 모든 supported type은 `riskVisual`을 만들거나 `none` 사유를 명시한다. |
| 같은 CSV를 다시 넣으면 같은 값이 나오는가? | 외부 API/LLM 없이 deterministic formula만 사용한다. |
| 단위가 섞이면 어떻게 하나? | 콤마, 퍼센트, 음수 부호 정규화 정책을 먼저 적용하고 변환 실패는 warning으로 노출한다. |
| transaction_log에서 손익을 말하지 않는 이유는? | 매수·매도 매칭과 수수료/세금 정보가 없으므로 실현 손익은 future rule로 분리한다. |

## 한계와 의도된 비대응

- **벤치마크 비교 미수행**: 코스피/S&P 등 외부 시리즈 미참조
- **실현 손익 산출 미수행**: transaction_log에서 매수/매도 매칭 로직 부재
- **세금/수수료 미반영**: 모든 수익률은 비용 차감 전 값
- **이상치 자동 제거 없음**: 통계적 outlier 처리는 사용자 데이터 정합성에 의존
- **다중 자산 비교 미수행**: 단일 자산 가정

## 구현 매트릭스

| Rule ID | 정의 위치 | 화면 증거 |
| --- | --- | --- |
| `metric.price.max_drawdown` | §price_timeseries | KPI 카드(총 수익률/변동성/최대 낙폭/추세) |
| `metric.portfolio.top_weight` | §portfolio_allocation | KPI 카드(총 비중/Top1/집중도) |
| `metric.transaction.buy_sell_ratio` | §transaction_log | KPI 카드(매수액/매도액/비율) |
| `metric.market_indicator.period_change` | §market_indicator | KPI 카드(최신값/변화율) |
| `metric.unknown.row_count` | §unknown | diagnostic의 컬럼 프로파일 |

## 확장

| Future Rule ID | 의도 |
| --- | --- |
| `metric.asset_comparison.relative_return` | 자산별 상대수익률·랭킹 |
| `metric.price.benchmark_alpha` | 벤치마크 대비 알파/베타 |
| `metric.transaction.realized_pnl` | 매수·매도 매칭 기반 실현 손익 |

## 검증 방법

1. 동일 입력에 대해 `cumulative_return = (last/first) − 1` 과 일치해야 한다.
2. `weight_total`이 95~105% 범위를 벗어나면 `warning`을 발생시켜야 한다.
3. `buy_sell_ratio`는 매도가 0일 때 `Infinity`가 아니라 `0` 또는 명시적 표기를 반환해야 한다.

검증은 `scripts/analysis-tests.mjs`에서 수행된다.
