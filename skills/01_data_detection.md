# 01 Data Detection Skill

## 목적
입력 CSV의 컬럼명, 값 패턴, 날짜 축, 숫자형 컬럼을 기반으로 투자 데이터 유형을 자동 판별한다.

## 지원 데이터 유형
- `price_timeseries`: 주가/ETF 가격 시계열
- `asset_comparison`: 여러 자산의 가격 또는 수익률 비교
- `portfolio_allocation`: 포트폴리오 보유 비중
- `transaction_log`: 매수/매도 거래내역
- `market_indicator`: 금리, 환율, 물가 등 시장 지표

## 공통 입력
- CSV rows
- column names
- inferred data types
- sample values

## 판별 규칙
### price_timeseries
필수 조건:
- `date` 또는 `timestamp` 계열 컬럼 존재
- `close` 또는 `price` 컬럼 존재

신뢰도 가산:
- `open`, `high`, `low`, `volume` 컬럼 존재
- 날짜가 오름차순 또는 내림차순으로 정렬 가능

출력:
```yaml
data_type: price_timeseries
confidence: 0.0~1.0
mapped_columns:
  date: date
  close: close
```

### asset_comparison
필수 조건:
- 날짜 컬럼 존재
- `asset`, `ticker`, `symbol` 중 하나 존재
- 가격 또는 수익률 컬럼 존재

### portfolio_allocation
필수 조건:
- `ticker`, `asset`, `name` 중 하나 존재
- `weight`, `allocation`, `ratio` 중 하나 존재

### transaction_log
필수 조건:
- 날짜 컬럼 존재
- `side`, `type`, `action` 중 하나 존재
- `quantity`와 `price` 컬럼 존재

### market_indicator
필수 조건:
- 날짜 컬럼 존재
- `indicator`, `metric`, `name` 중 하나 존재
- `value` 컬럼 존재

## 실패 처리
- 신뢰도 0.5 미만이면 `unknown`으로 분류한다.
- unknown일 때는 숫자 컬럼과 날짜 컬럼을 기준으로 기본 프로파일링만 수행한다.

## Implemented demo rules
- `detect.price_timeseries.ohlcv`: date/일자 + close/종가/체결가 + OHLCV/거래량 보조 컬럼으로 주가 시계열 판별
- `detect.portfolio.weight`: asset/ticker/종목코드 + weight/allocation/평가비중 컬럼으로 포트폴리오 비중 판별
- `detect.transaction.execution`: date/일자 + side/매매/매수매도 + quantity/수량 + price/체결가 컬럼으로 거래내역 판별
- `detect.market_indicator.value`: date/일자 + value/price/지표값 컬럼으로 시장 지표 판별
- `detect.unknown.fallback`: 지원 규칙 미충족 시 기본 프로파일링으로 전환

## Declared future rules
- `detect.asset_comparison.long_format`: 여러 자산의 long-format date/ticker/price 비교 분석은 P1 확장 범위
