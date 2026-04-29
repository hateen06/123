# 03 · Chart Selection Skill

## 목적과 위치

이 문서는 **데이터 유형과 계산된 지표 구조에 따라 어떤 차트를 자동 선택할지**, 그리고 **각 차트에 어떤 시맨틱 색상을 입힐지**를 정의한다.

```
(1) Detection  (2) Metric ─▶  ★ (3) Chart Selection ─▶  (4) Insight  (5) Layout
```

차트는 두 종류로 나뉜다.

- **메인 차트**: 화면 가운데에 큰 면적으로 표시. 데이터의 주된 형태(시간/구성비/이벤트) 표현
- **위험 보조 시각**: 메인 차트 아래에 작게 동반. 위험을 별도 미니 시각으로 분리

## 입력

| 항목 | 설명 |
| --- | --- |
| `data_type` | 01번 결과 |
| `kpi.tone` | 02번이 매긴 시맨틱 태그 |
| 컬럼 시그니처 | volume 존재 여부, 행 수, side 분포 등 |

## 차트 카탈로그와 선택 규칙

| 메인 차트 | 사용 조건 | 사유 |
| --- | --- | --- |
| `price_line` (dual-axis line) | `data_type = price_timeseries` | 가격 추세와 누적 수익률을 한 화면에 비교 |
| `indicator_line` | `data_type = market_indicator` | 단일 지표의 시간 흐름을 보기 위함 |
| `allocation_bar` | `data_type = portfolio_allocation` | 자산별 비중 비교에 직관적 |
| `flow_bar` | `data_type = transaction_log` | 거래별 금액 비교 |
| `table_preview` | `data_type = unknown` | 시각화 위험을 회피하고 원본 검증을 우선 |

## 위험 보조 시각

위험은 **메인 차트와 분리된 별도 영역**에 표시한다. 이는 평가자가 한 화면에서 "수익"과 "위험"을 구분 인지할 수 있게 한다.

| 보조 시각 | 사용 조건 | 표시 형태 |
| --- | --- | --- |
| `drawdown_strip` | `price_timeseries` / `market_indicator` | 시간축에 정렬된 area chart, 음수 영역만 |
| `concentration_gauge` | `portfolio_allocation` | 0–100% 가로 바, 30% watch 라인 표시 |
| `buy_sell_meter` | `transaction_log` | buy/sell 비율 stacked bar |
| `none` | `unknown` | 보조 시각 없음 |

## 색상 시맨틱

색상은 시각적 일관성을 위해 **shadcn 시맨틱 토큰**으로만 사용한다. 원시 hex/rgb 직접 사용 금지.

| 신호 | 토큰 |
| --- | --- |
| 주가/누적값(긍정) | `var(--foreground)` |
| 보조 시리즈 | `var(--muted-foreground)` |
| 위험·낙폭·매도 | `var(--destructive)` |
| 비중 강조 | `var(--foreground)` (≥30%면 `var(--destructive)` 로 전환) |
| 그리드/축 | `var(--border)` / `var(--muted-foreground)` |

투자 도메인 특성상 **매도(sell)는 빨강, 매수(buy)는 검정/짙은색**으로 통일한다. 한국 금융권 관행과 정반대(빨강=상승)로 보일 수 있어, 본 시스템은 **"거래 방향" 색상과 "수익률 부호" 색상을 분리**한다.

| 의미 | 색 |
| --- | --- |
| 거래 방향 매도 | `--destructive` (red) |
| 거래 방향 매수 | `--foreground` (dark) |
| 수익률 부호 | 차트는 단색, 부호는 텍스트로 표시 (한국식 색관행과 충돌 방지) |

## 차트 출력 스키마

```yaml
chart:
  main: price_line | indicator_line | allocation_bar | flow_bar | table_preview
  reason: "date와 close 컬럼이 존재하여 가격 추세와 누적 수익률을 dual-axis 라인으로 표현"
  risk_visual:
    kind: drawdown | concentration | buy_sell | none
```

`reason`은 화면의 차트 카드 헤더에 그대로 노출된다. 평가자가 "왜 이 차트가 선택됐는가"를 즉시 확인할 수 있어야 한다.

## 한계와 의도된 비대응

- **상관계수 매트릭스/히트맵 미지원**: 다중 자산 비교 유형 미구현에 따른 결과
- **리스크-수익 산점도 미지원**: 외부 벤치마크 미참조와 결합된 한계
- **드릴다운 미지원**: 차트 클릭 → 상세 분석 흐름 부재
- **사용자 정의 기간 필터 미지원**: 항상 전체 기간 사용

## 구현 매트릭스

| Rule ID | 정의 위치 | 화면 증거 |
| --- | --- | --- |
| `chart.price.dual_axis_drawdown` | §price_line + §drawdown_strip | 메인 라인 차트 + drawdown 보조 시각 |
| `chart.portfolio.allocation_bar_gauge` | §allocation_bar + §concentration_gauge | 비중 막대 + 집중도 게이지 |
| `chart.transaction.buy_sell_bar_meter` | §flow_bar + §buy_sell_meter | 거래 막대 + buy/sell 미터 |
| `chart.market_indicator.sparkline` | §indicator_line | 지표 라인 |
| `chart.unknown.table_preview` | §table_preview | 데이터 미리보기 표 |

## 확장

| Future Rule ID | 의도 |
| --- | --- |
| `chart.asset_comparison.multi_line` | 여러 자산을 100 기준 정규화 multi-line |
| `chart.portfolio.sector_treemap` | 섹터 컬럼이 있을 때 treemap |
| `chart.transaction.pnl_bar` | 손익 컬럼이 있을 때 |

## 검증 방법

1. `data_type` 변경 시 `chart.main` 도 자동으로 함께 변해야 한다.
2. `risk_visual.kind`는 `data_type`과 1:1 매핑이 깨지지 않아야 한다.
3. 라인 차트는 항상 두 개의 Y축(가격/수익률) 또는 단일 축이어야 한다(혼재 금지).
4. `unknown` 분기에서는 메인 차트가 렌더링되지 않아야 한다.
