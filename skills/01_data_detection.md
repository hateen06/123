# 01 · Data Detection Skill

## 목적과 위치

이 문서는 **임의의 투자 CSV가 들어왔을 때 데이터 유형을 자동 판별하는 규칙**을 정의한다.
판별 결과는 이후 단계(Metric / Chart / Insight / Layout)가 어떤 가지를 탈지 결정하는 **첫 번째 분기점**이다.

```
[CSV] ─▶ (1) Data Detection ─▶ (2) Metric ─▶ (3) Chart ─▶ (4) Insight ─▶ (5) Layout
                  ▲
            이 문서가 정의
```

판별이 틀리면 이후 모든 단계가 틀린다. 따라서 이 단계는 **신뢰도 점수와 함께 결과를 반환**해야 하며, 신뢰도가 낮으면 안전한 fallback 모드로 넘긴다.

## 입력 가정

| 항목 | 가정 |
| --- | --- |
| 파일 형식 | UTF-8 CSV, 헤더 1행 + 데이터 N행 (N ≥ 1) |
| 컬럼명 | 한국어/영어 혼재 가능. 공백/괄호/대소문자 정규화 후 비교 |
| 결측치 | `""`, `null`, `NaN` 모두 결측으로 취급 |
| 숫자 표기 | `1,234.56` 콤마 / `12.3%` 퍼센트 / `-3.45` 음수 부호 모두 허용 |

## 지원하는 데이터 유형 (현재)

| `data_type` | 한글 명칭 | 대표 시나리오 | 핵심 컬럼 |
| --- | --- | --- | --- |
| `price_timeseries` | 주가 시계열 | 단일 종목/ETF의 일별 가격 | `date` + `close` |
| `portfolio_allocation` | 포트폴리오 비중 | 자산별 보유 비중 스냅샷 | `ticker` + `weight` |
| `transaction_log` | 거래내역 | 매수·매도 체결 기록 | `date` + `side` + `quantity` + `price` |
| `market_indicator` | 시장 지표 | 금리·환율·물가 등 단일 지표 시계열 | `date` + `value` |
| `unknown` | 미지원 | 위 4종에 해당하지 않는 입력 | (해당 없음) |

> 자산 비교(`asset_comparison`) 등 추가 유형은 본 문서의 [확장 절](#확장)에서 별도 관리한다.

## 컬럼 정규화와 alias

판별 전 모든 헤더는 다음 변환을 거친다.

1. 양 끝 공백 제거
2. 모두 소문자
3. 내부 공백 제거
4. 괄호 `()`, `（）` 제거

이후 아래 alias 표로 canonical 이름에 매핑한다.

| canonical | 허용 alias |
| --- | --- |
| `date` | date, timestamp, time, 날짜, 일자, 기준일, 체결일, 거래일 |
| `close` | close, price, value, 종가, 가격, 현재가, 기준가, 체결가, 평가금액 |
| `open` | open, 시가 |
| `high` | high, 고가 |
| `low` | low, 저가 |
| `volume` | volume, 거래량, 수량합계 |
| `weight` | weight, allocation, ratio, 비중, 평가비중, 편입비중, 보유비중 |
| `ticker` | ticker, asset, symbol, name, 종목, 자산, 종목코드, 종목명, 상품명 |
| `side` | side, type, action, 구분, 매매, 매수매도, 매수/매도, 거래구분 |
| `quantity` | quantity, qty, 수량, 체결수량, 주수 |

이 표는 **확장 가능하지만 줄어들지는 않는다**. 새 alias 추가는 비파괴적 변경으로 취급한다.

## 판별 알고리즘

각 유형은 (a) **필수 신호**와 (b) **가산 신호**로 구성된 신뢰도 점수를 가진다.
모든 유형을 평가한 뒤 **가장 높은 점수를 가진 유형**을 선택한다. 단, 필수 신호 미충족 유형은 후보에서 제외한다.

### `price_timeseries`

| 종류 | 조건 | 가중치 |
| --- | --- | --- |
| 필수 | `date` 매핑 가능 | 0.5 |
| 필수 | `close` 매핑 가능 | 0.5 |
| 가산 | `open`, `high`, `low`, `volume` 중 ≥ 1개 존재 | +0.15 |
| 가산 | 행 수 ≥ 5 | +0.10 |
| 가산 | 날짜가 단조 정렬 가능 (오름/내림) | +0.10 |
| 페널티 | `ticker` 가 다중 값으로 존재 (자산 비교 의심) | −0.30 |

### `portfolio_allocation`

| 종류 | 조건 | 가중치 |
| --- | --- | --- |
| 필수 | `ticker` 매핑 가능 | 0.5 |
| 필수 | `weight` 매핑 가능 | 0.5 |
| 가산 | weight 합이 [0.95, 1.05] 또는 [95, 105] 범위 | +0.15 |
| 가산 | 행 수 ∈ [3, 50] (포트폴리오 합리적 범위) | +0.10 |
| 페널티 | `date` 가 매 행 다름 (시계열 의심) | −0.20 |

### `transaction_log`

| 종류 | 조건 | 가중치 |
| --- | --- | --- |
| 필수 | `date` 매핑 가능 | 0.4 |
| 필수 | `side` 매핑 가능 | 0.3 |
| 필수 | `quantity` 매핑 가능 | 0.15 |
| 필수 | `close` 매핑 가능 (체결가) | 0.15 |
| 가산 | `side` 값이 buy/sell 또는 매수/매도로 정규화 가능 | +0.15 |

### `market_indicator`

| 종류 | 조건 | 가중치 |
| --- | --- | --- |
| 필수 | `date` 매핑 가능 | 0.5 |
| 필수 | `close` 매핑 가능 | 0.4 |
| 가산 | `ticker`/`weight`/`side`/`quantity` 모두 부재 | +0.10 |

(시장 지표는 "단일 시리즈"라는 게 핵심이라, 다른 유형의 신호가 적을수록 신뢰도가 높아진다.)

### Fallback: `unknown`

위 4종 중 어느 것도 신뢰도 0.5 이상에 도달하지 못하면 `unknown`으로 분류한다.
이 경우 후속 단계는 차트 대신 **컬럼 프로파일링과 데이터 미리보기 중심**의 안전 모드를 사용한다.

## 출력 스키마

```yaml
data_type: price_timeseries | portfolio_allocation | transaction_log | market_indicator | unknown
confidence: 0.0 ~ 1.0
mapped_columns:
  date: <원본 컬럼명>
  close: <원본 컬럼명>
  ...
reasons:
  - "date/일자 컬럼 존재"
  - "close/종가 컬럼 존재"
  - "OHLCV/거래량 보조 컬럼 존재"
```

`reasons`는 **사용자에게 보여주기 위한 한국어 사유 문자열**이며, 화면의 "판별 근거" 영역에 그대로 노출된다.

## 리서치팀 검증 질문 대응

이 스킬은 평가자가 처음 물을 법한 "왜 이 CSV를 이 유형이라고 판단했는가?"에 답해야 한다. 따라서 판별 결과는 단순 label이 아니라 **근거가 남는 audit record**여야 한다.

| 검증 질문 | 답변 규칙 | 화면/trace 증거 |
| --- | --- | --- |
| 한국어 컬럼도 처리하는가? | 정규화 후 alias 표로 `일자`, `종가`, `평가비중`, `매매`, `체결가` 등을 canonical column에 매핑한다. | column mapping note |
| price와 market indicator가 둘 다 `date + value`면 어떻게 구분하는가? | OHLCV 보조 컬럼이 있으면 `price_timeseries`, 없으면 단일 지표인 `market_indicator`로 낮은 confidence 판별한다. | confidence, reasons |
| 샘플 3개만 맞춘 것 아닌가? | `ticker/weight`, `date/side/quantity/price`, `date/close/OHLCV` 같은 구조 신호를 기준으로 하며 파일명은 사용하지 않는다. | `reasons`에 컬럼 기반 증거만 표시 |
| 애매한 CSV를 억지로 분석하지 않는가? | 신뢰도 임계 미달 시 `unknown`으로 보내고 후속 단계는 diagnostic/table preview만 사용한다. | `detect.unknown.fallback` trace |
| 판별 결과가 다음 단계에 어떻게 전달되는가? | `data_type`, `mapped_columns`, `confidence`, `reasons`만 Metric skill의 입력으로 넘긴다. | trace step 01 output |

### Dashboard generation handoff

01번 스킬이 성공하면 Layout은 다음 데이터를 화면 상단과 trace에 바인딩한다.

```yaml
detection_badge: <data_type>
confidence_badge: round(confidence * 100)
column_mapping_note: mapped_columns
trace[0]:
  skillId: 01_data_detection
  ruleId: detect.<type>.*
  evidence: reasons
```

이 handoff가 비어 있으면 뒤 단계의 KPI/차트가 맞더라도 "Skills 기반 생성" 증거가 부족하므로 실패로 본다.

## 한계와 의도된 비대응

이 문서는 다음 케이스를 의도적으로 다루지 않는다.

- **다중 자산 long-format 비교** (`date`+`ticker`+`close`가 매 행 동일 ticker 묶음): `asset_comparison`으로 별도 정의 예정
- **잔고 스냅샷의 시계열** (포트폴리오 + 시간축): 단일 스냅샷으로만 다룬다
- **옵션/파생상품 만기·행사가 컬럼**: 현재 컬럼 alias 미정의
- **non-CSV 입력** (Excel·JSON·Parquet): CSV로 변환 후 입력 가정

이 한계는 **모르는 척 처리하지 말고 명시**하는 것이 본 시스템의 원칙이다.

## 구현 매트릭스 (Implemented demo rules)

이 문서의 규칙 중 현재 데모 빌드에서 실제로 동작하는 항목은 다음과 같다.

| Rule ID | 정의 위치 | 화면 증거 |
| --- | --- | --- |
| `detect.price_timeseries.ohlcv` | 본 문서 §price_timeseries | 주가 시계열 배지 + 판별 근거 영역 |
| `detect.portfolio.weight` | 본 문서 §portfolio_allocation | 포트폴리오 비중 배지 |
| `detect.transaction.execution` | 본 문서 §transaction_log | 거래내역 배지 |
| `detect.market_indicator.value` | 본 문서 §market_indicator | 시장 지표 배지 |
| `detect.unknown.fallback` | 본 문서 §Fallback | "지원되지 않는 구조" diagnostic |

## 확장

다음 규칙은 **선언만 되어 있고 현재 구현에는 포함되지 않는다.** 본 시스템이 향후 다룰 범위를 명시하기 위해 보존한다.

| Future Rule ID | 의도 |
| --- | --- |
| `detect.asset_comparison.long_format` | 동일 컬럼 구조에 여러 ticker가 섞인 long-format 비교 입력 식별 |
| `detect.holdings_timeseries` | 보유 비중 + 시간축이 결합된 스냅샷 시계열 |
| `detect.derivative.options_chain` | 옵션 체인(strike/expiry) 컬럼 패턴 |

## 검증 방법

1. 샘플 CSV 3종에 대해 `data_type`이 각각 `price_timeseries` / `portfolio_allocation` / `transaction_log`로 분류되어야 한다.
2. 빈 CSV는 `unknown`이 아니라 `errors: ["빈 CSV..."]`를 발생시켜야 한다.
3. 신뢰도 0.5 이상인 유형이 없으면 `unknown`으로 분류되어야 한다.
4. `reasons` 배열이 비어 있으면 안 된다(최소 1개의 사유).

검증은 `scripts/analysis-tests.mjs`의 detection 케이스에서 수행된다.
