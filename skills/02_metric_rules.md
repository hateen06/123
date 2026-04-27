# 02 Metric Calculation Skill

## 목적
감지된 투자 데이터 유형에 따라 핵심 지표를 자동 계산한다.

## 공통 원칙
- 결측치는 계산 전 제거 또는 보간 여부를 명시한다.
- 수익률은 소수 기준으로 계산하고 화면에서는 퍼센트로 표시한다.
- 날짜 정렬 후 시계열 지표를 계산한다.

## price_timeseries 지표
```text
daily_return = close.pct_change()
cumulative_return = (1 + daily_return).cumprod() - 1
volatility = std(daily_return) * sqrt(252)
running_peak = cumulative_value.cummax()
drawdown = cumulative_value / running_peak - 1
mdd = min(drawdown)
ma20 = rolling_mean(close, 20)
ma60 = rolling_mean(close, 60)
```

출력 KPI:
- total_return
- volatility
- max_drawdown
- latest_close
- trend_label

## asset_comparison 지표
- 자산별 누적 수익률
- 자산별 변동성
- 기간 내 최고/최저 성과 자산
- 상관계수 매트릭스 선택 출력

## portfolio_allocation 지표
- 총 비중 합계
- Top 1 / Top 5 집중도
- 섹터별 비중
- 지역별 비중
- 단일 자산 과집중 여부

위험 판정:
```text
if top1_weight >= 0.30: concentration_risk = high
elif top1_weight >= 0.20: concentration_risk = medium
else: concentration_risk = low
```

## transaction_log 지표
- 총 매수 금액
- 총 매도 금액
- 평균 매입가
- 실현 손익 추정
- 거래 횟수
- 매수/매도 비율
- 과매매 여부

## market_indicator 지표
- 최근 값
- 전월 대비 변화율
- 전년 대비 변화율
- 이동평균
- 이상치 여부

## Implemented demo rules
- `metric.price.max_drawdown`: total_return, volatility, max_drawdown, trend_label 계산
- `metric.portfolio.top_weight`: 총 비중, Top1 비중, 집중도 계산
- `metric.transaction.buy_sell_ratio`: 매수/매도 금액과 비율 계산
- `metric.market_indicator.period_change`: 시장 지표 최신값과 기간 변화율 계산
- `metric.unknown.row_count`: 지원되지 않는 데이터의 행 수와 컬럼 프로파일링

## Declared future rules
- `metric.asset_comparison.relative_return`: 자산별 상대수익률/랭킹 비교는 P1 확장 범위
