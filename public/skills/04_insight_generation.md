# 04 Insight Generation Skill

## 목적
계산된 지표를 기반으로 투자 권유가 아닌 데이터 기반 요약 인사이트를 생성한다.

## 금지사항
- 매수/매도 추천 금지
- 수익 보장 표현 금지
- 특정 종목을 유망하다고 단정 금지
- 투자 자문으로 오해될 수 있는 문장 금지

## 공통 문장 원칙
- 관찰된 데이터 기준으로만 설명한다.
- 위험 신호를 수익 기회보다 우선 표시한다.
- 모든 리포트 하단에 투자 유의사항을 표시한다.

## Trend Insight
```text
if ma20 > ma60:
  "단기 이동평균이 장기 이동평균 위에 있어 상승 추세가 관찰됩니다."
else:
  "단기 이동평균이 장기 이동평균 아래에 있어 약세 흐름이 관찰됩니다."
```

## Risk Insight
```text
if max_drawdown <= -0.20:
  "최대 낙폭이 20%를 초과하여 큰 손실 구간이 존재합니다."
elif max_drawdown <= -0.10:
  "최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다."
else:
  "분석 기간 내 최대 낙폭은 제한적인 수준입니다."
```

## Volatility Insight
```text
if volatility >= 0.30:
  "연환산 변동성이 높은 편이므로 가격 변동 위험이 큽니다."
elif volatility >= 0.15:
  "연환산 변동성은 중간 수준입니다."
else:
  "연환산 변동성은 낮은 편입니다."
```

## Portfolio Concentration Insight
```text
if top1_weight >= 0.30:
  "단일 자산 비중이 30% 이상으로 포트폴리오 집중도가 높습니다."
```

## Disclaimer
모든 분석 결과는 입력 데이터 기반 요약이며 투자 권유가 아닙니다.

## Implemented demo rules
- `insight.risk.drawdown_warning`: max_drawdown이 -10% 이하일 때 위험 관리 문장 생성
- `insight.risk.drawdown_limited`: max_drawdown이 제한적일 때 중립 위험 문장 생성
- `insight.portfolio.concentration_high`: Top1 비중 30% 이상이면 집중도 경고 생성
- `insight.portfolio.concentration_normal`: Top1 비중이 낮으면 분산 상태 문장 생성
- `insight.transaction.overtrade_watch`: 거래 횟수 과다 시 과매매 점검 문장 생성
- `insight.transaction.activity_normal`: 거래 횟수 보통이면 활동 정상 문장 생성
- `insight.market_indicator.trend`: 시장 지표 변화 방향 요약 문장 생성
- `insight.unknown.safe_summary`: 지원되지 않는 구조는 안전한 기본 요약만 생성

## Declared future rules
- `insight.asset_comparison.relative_strength`: 자산 간 상대강도 설명은 P1 확장 범위
