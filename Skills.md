# Skills.md — InvestSkill Lens Contract

InvestSkill Lens의 제출용 Skills contract입니다.

**Contract:** CSV rows -> detection -> metrics -> chart -> insight -> layout

웹앱은 이 문서와 `skills/*.md`에 정의된 규칙을 실행 계약으로 사용해 CSV 입력을 자동 대시보드로 변환합니다. UI의 trace rule id는 아래 implemented rule id와 동기화됩니다.

## Rule file index

1. [`skills/01_data_detection.md`](skills/01_data_detection.md) — CSV 컬럼/값 패턴 기반 데이터 유형 판별
2. [`skills/02_metric_rules.md`](skills/02_metric_rules.md) — 데이터 유형별 KPI/위험 지표 계산
3. [`skills/03_chart_selection.md`](skills/03_chart_selection.md) — 데이터 구조별 차트 선택
4. [`skills/04_insight_generation.md`](skills/04_insight_generation.md) — 투자 권유가 아닌 데이터 기반 요약 문장 생성
5. [`skills/05_report_layout.md`](skills/05_report_layout.md) — 리포트/대시보드 배치 순서

## Implemented rule id matrix

| Pipeline | Rule id | UI evidence |
| --- | --- | --- |
| Detection | `detect.price_timeseries.ohlcv` | 주가 시계열 sample/CSV 감지 |
| Detection | `detect.portfolio.weight` | 포트폴리오 비중 sample/CSV 감지 |
| Detection | `detect.transaction.execution` | 거래내역 sample/CSV 감지 |
| Metric | `metric.price.max_drawdown` | drawdown mini visual / MDD KPI |
| Metric | `metric.portfolio.top_weight` | Top1 concentration / concentration gauge |
| Metric | `metric.transaction.buy_sell_ratio` | buy/sell amount ratio / flow meter |
| Chart | `chart.price.dual_axis_drawdown` | price/return line + drawdown strip |
| Chart | `chart.portfolio.allocation_bar_gauge` | allocation bar + concentration gauge |
| Chart | `chart.transaction.buy_sell_bar_meter` | buy/sell bar meter |
| Insight | `insight.safety.no_advice` | 투자 권유/수익 보장 금지 문구 |
| Layout | `layout.dashboard.evidence_first` | generated report summary + trace contract badge |

## Mirror note

`public/skills/*.md`는 웹 정적 배포에서 Skills Inspector/contract를 표시하기 위한 mirror입니다. 제출 기준 원본은 `skills/*.md`이고, 두 위치는 동일해야 합니다.

## Boundary note

각 세부 문서의 `Declared future rules`는 현재 demo behavior가 아니라 P1 확장 후보입니다. 현재 제출 데모는 위 implemented rule id matrix 범위에 맞춰 검증합니다.

## Safety note

이 Skills contract는 교육용 자동 리포트 생성을 위한 규칙입니다. 매수·매도 추천 금지, 수익 보장 금지, 특정 종목 단정 금지를 유지합니다.
