# 04 · Insight Generation Skill

## 목적과 위치

이 문서는 **계산된 지표를 한국어 요약 문장으로 옮길 때 따라야 할 규칙과 안전 헌장**을 정의한다.

```
(1) Detection  (2) Metric  (3) Chart ─▶  ★ (4) Insight ─▶  (5) Layout
```

본 시스템의 인사이트는 **결정형 문장(deterministic templates)**이다. LLM 호출 없이 임계값 기반 매핑으로 생성되며, 같은 데이터는 항상 같은 문장을 만들어낸다(재현성).

## 안전 헌장 (Safety Charter)

이 헌장은 본 시스템의 **모든 인사이트 출력에 대해 무조건 우선**한다.

| 금지 | 이유 |
| --- | --- |
| 매수·매도 추천 | 투자 자문업 영역. 본 시스템은 자문 라이선스 없음 |
| 수익 보장 표현 | 어떤 지표도 미래 수익을 보장하지 않음 |
| 특정 종목 단정 ("○○은 유망") | 분석은 입력 데이터 한정. 외부 컨텍스트 부재 |
| 자문 오해 표현 ("매수해야 합니다") | 명령형 문장 금지 |

| 의무 | 적용 |
| --- | --- |
| 모든 리포트 끝에 disclaimer | 화면 footer + 출력 데이터 모두 |
| 위험 신호를 수익 기회보다 먼저 표시 | 인사이트 정렬 우선순위에 반영 |
| "관찰됨"·"확인됨" 등 사실 기반 어미 사용 | 추측·확신 어미 금지 |
| 표본 한계가 큰 경우 명시 | 행 수 < 10이면 신뢰 한계 안내 |

## 인사이트 우선순위

같은 데이터에서 여러 인사이트가 동시에 트리거될 때 **표시 순서**는 다음과 같다.

1. 위험 (drawdown / concentration / overtrade)
2. 변동성·규모
3. 추세·방향
4. 활동·빈도
5. 데이터 한계 안내

위험을 가장 먼저 보여주는 것은 안전 헌장의 직접적인 적용이다.

## 임계값과 문장 매핑

### 추세 (`price_timeseries`)

| 조건 | 문장 |
| --- | --- |
| `MA20 > MA60` | "단기 이동평균이 장기 이동평균 위에 있어 상승 추세가 관찰됩니다." |
| `MA20 ≤ MA60` | "단기 이동평균이 장기 이동평균 아래에 있어 약세 흐름이 관찰됩니다." |
| 데이터 < 20행 | (생략 — MA 계산 표본 부족) |

### 위험 — 최대 낙폭 (`price_timeseries`)

| 조건 | rule | 문장 |
| --- | --- | --- |
| `mdd ≤ −0.20` | `insight.risk.drawdown_severe` | "최대 낙폭이 20%를 초과하여 큰 손실 구간이 존재합니다." |
| `−0.20 < mdd ≤ −0.10` | `insight.risk.drawdown_warning` | "최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다." |
| `mdd > −0.10` | `insight.risk.drawdown_limited` | "분석 기간 내 최대 낙폭은 제한적인 수준입니다." |

### 변동성 (`price_timeseries`)

| 조건 | 문장 |
| --- | --- |
| `vol ≥ 0.30` | "연환산 변동성이 높은 편이므로 가격 변동 위험이 큽니다." |
| `0.15 ≤ vol < 0.30` | "연환산 변동성은 중간 수준입니다." |
| `vol < 0.15` | "연환산 변동성은 낮은 편입니다." |

### 집중도 (`portfolio_allocation`)

| 조건 | rule | 문장 |
| --- | --- | --- |
| `top1 ≥ 0.30` | `insight.portfolio.concentration_high` | "단일 자산 비중이 30% 이상으로 포트폴리오 집중도가 높습니다." |
| `top1 < 0.30` | `insight.portfolio.concentration_normal` | "단일 자산 비중이 분산된 상태입니다." |

### 거래 활동 (`transaction_log`)

| 조건 | rule | 문장 |
| --- | --- | --- |
| 거래 횟수 ≥ 분석 기간(일) × 2 | `insight.transaction.overtrade_watch` | "거래 횟수가 많아 과매매 가능성을 점검할 필요가 있습니다." |
| 그 외 | `insight.transaction.activity_normal` | "거래 활동은 일반적인 수준입니다." |

### 시장 지표 (`market_indicator`)

| 조건 | 문장 |
| --- | --- |
| `period_change_pct ≥ +0.005` | "분석 기간 동안 지표가 상승 방향으로 움직였습니다." |
| `period_change_pct ≤ −0.005` | "분석 기간 동안 지표가 하락 방향으로 움직였습니다." |
| 그 외 | "분석 기간 동안 지표는 비교적 안정적인 흐름을 보였습니다." |

### Fallback (`unknown`)

`insight.unknown.safe_summary`: "본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다." 만 출력.

## 표본 한계 안내
## 리서치팀 검증 질문 대응

| 검증 질문 | Insight skill의 답변 |
| --- | --- |
| 인사이트가 투자 추천으로 오해될 수 있나? | Safety Charter가 모든 템플릿보다 우선하며 추천·보장·명령형 문장을 금지한다. |
| LLM이 매번 다른 문장을 만들지 않나? | 모든 문장은 deterministic template이며 외부 LLM/API를 호출하지 않는다. |
| 위험보다 긍정 문구가 먼저 나오지 않나? | 위험 → 변동성·규모 → 추세 → 활동 → 한계 안내 순서로 정렬한다. |
| 작은 표본도 단정하나? | 행 수·결측 조건에 따라 표본 한계 문장을 추가한다. |
| unknown도 억지 해석하나? | `unknown`은 안전 요약과 추천 컬럼 안내만 제공하고 투자 판단 문장은 생성하지 않는다. |

### Insight-to-layout handoff

```yaml
insights:
  - <위험 또는 한계 문장 우선>
  - <지표 관찰 문장>
  - "본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다."
trace[3]:
  skillId: 04_insight_generation
  ruleId: insight.<type>.*
  evidence: <임계값 또는 표본 조건>
```

Layout skill은 이 배열을 Insights 탭과 핵심 인사이트 영역에 배치한다. 안전 disclaimer는 footer와 insight text 양쪽에서 반복되어야 한다.


행 수가 작거나 결측이 많으면 **모든 인사이트 뒤에 한 줄을 덧붙인다.**

| 조건 | 부가 문장 |
| --- | --- |
| 행 수 < 10 | "표본 수가 적어 위 결과의 신뢰 구간이 넓을 수 있습니다." |
| 결측 비율 ≥ 20% | "결측치 비율이 높아 일부 지표가 왜곡될 수 있습니다." |

이 두 조건은 **신뢰 가능한 분석의 경계를 평가자에게 보여주기 위함**이며, 인사이트를 무리하게 단정하지 않는 안전 장치다.

## 출력 스키마

```yaml
insights:
  - "최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다."
  - "연환산 변동성은 중간 수준입니다."
  - "단기 이동평균이 장기 이동평균 위에 있어 상승 추세가 관찰됩니다."
disclaimer: "본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다."
```

## 한계와 의도된 비대응

- **자연어 생성(LLM) 미사용**: 정해진 템플릿 문장만 출력 (재현성 우선)
- **외부 컨텍스트 미참조**: 코스피 지수, 뉴스, 거시 이벤트 미반영
- **개인화 미수행**: 투자자 성향/목표 입력 받지 않음
- **다국어 미지원**: 한국어 한정 (영문 라벨은 일부 보조 사용)

## 구현 매트릭스

| Rule ID | 정의 위치 | 화면 증거 |
| --- | --- | --- |
| `insight.risk.drawdown_warning` | §최대 낙폭 | Insights 탭 / 우측 핵심 인사이트 |
| `insight.risk.drawdown_limited` | §최대 낙폭 | Insights 탭 |
| `insight.portfolio.concentration_high` | §집중도 | Insights 탭 |
| `insight.portfolio.concentration_normal` | §집중도 | Insights 탭 |
| `insight.transaction.overtrade_watch` | §거래 활동 | Insights 탭 |
| `insight.transaction.activity_normal` | §거래 활동 | Insights 탭 |
| `insight.market_indicator.trend` | §시장 지표 | Insights 탭 |
| `insight.unknown.safe_summary` | §Fallback | Diagnostics |

## 확장

| Future Rule ID | 의도 |
| --- | --- |
| `insight.asset_comparison.relative_strength` | 자산 간 상대강도 설명 |
| `insight.benchmark.alpha` | 벤치마크 대비 초과 수익 해석 |
| `insight.calendar.seasonality` | 월별/요일별 패턴 인사이트 |

## 검증 방법

1. 위험 인사이트가 다른 카테고리보다 **앞 순서**에 표시되어야 한다.
2. `mdd = −0.05` 입력 시 `drawdown_limited` 문장만 생성되어야 한다.
3. 행 수 < 10이면 표본 한계 안내가 항상 동반되어야 한다.
4. 어떤 출력에도 "매수", "매도하세요", "유망" 같은 권유 단어가 포함되어선 안 된다 (정적 점검).
