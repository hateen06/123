# 03 Chart Selection Skill

## 목적
데이터 유형과 컬럼 구조에 따라 대시보드 차트를 자동 선택한다.

## 기본 원칙
- 시간축이 있으면 line 또는 area chart를 우선한다.
- 구성비 데이터는 bar, donut, treemap 중 하나를 사용한다.
- 위험 지표는 red/orange/green 색상 규칙을 적용한다.
- 차트마다 선택 사유를 함께 출력한다.

## price_timeseries 차트
필수 차트:
- price_line: 날짜별 가격 추세
- cumulative_return_line: 누적 수익률
- drawdown_area: 최대 낙폭 구간

선택 차트:
- volume_bar: volume 컬럼이 있을 때
- moving_average_line: 데이터가 60개 이상일 때

## asset_comparison 차트
- normalized_line: 여러 자산을 100 기준으로 정규화한 비교
- return_bar: 기간 수익률 순위
- risk_return_scatter: 변동성과 수익률 비교

## portfolio_allocation 차트
- allocation_bar: 자산별 비중
- sector_bar: 섹터 컬럼이 있을 때
- region_bar: 지역 컬럼이 있을 때

## transaction_log 차트
- trade_timeline: 거래 시점 표시
- buy_sell_bar: 매수/매도 금액 비교
- pnl_bar: 손익 데이터가 있을 때

## chart_reason 출력 예시
```yaml
chart: price_line
reason: date와 close 컬럼이 존재하여 가격 추세를 시간 순서로 표시하기 적합함
```

## Implemented demo rules
- `chart.price.dual_axis_drawdown`: Close/Return dual-axis 라인 차트와 drawdown mini visual 선택
- `chart.portfolio.allocation_bar_gauge`: 자산별 비중 막대 차트와 concentration gauge 선택
- `chart.transaction.buy_sell_bar_meter`: 매수/매도 금액 bar와 flow meter 선택
- `chart.market_indicator.sparkline`: 시장 지표 추세 라인 선택
- `chart.unknown.table_preview`: 지원되지 않는 데이터는 테이블 미리보기 중심으로 표시

## Declared future rules
- `chart.asset_comparison.multi_line`: 여러 자산을 normalized multi-line chart로 비교하는 기능은 P1 확장 범위
