# InvestSkill Lens

<div class="subtitle">Skills.md 기반 범용 투자 데이터 대시보드 생성기</div>

<div class="meta-grid">
  <div><strong>해커톤</strong><br/>월간 해커톤 : 투자 데이터를 시각화하라</div>
  <div><strong>제출물</strong><br/>기획서 PDF</div>
  <div><strong>서비스 유형</strong><br/>문서 기반 자동 투자 분석 대시보드</div>
  <div><strong>핵심 산출물</strong><br/>Skills.md + Web Dashboard + Sample Data</div>
</div>

<div class="cover-note">
본 서비스는 단일 투자 차트 앱이 아니라, <strong>투자 분석 규칙을 Skills.md로 외부화하고 웹앱이 해당 규칙을 실행하는 범용 대시보드 생성 시스템</strong>입니다.
</div>

<div class="page-break"></div>

## 1. 서비스 개요

**InvestSkill Lens**는 사용자가 주가, ETF, 포트폴리오, 거래내역, 시장 지표 등 다양한 투자 데이터 CSV를 입력하면 `Skills.md`에 정의된 분석 규칙에 따라 데이터 유형을 자동 판별하고, 핵심 지표·시각화·위험 경고·인사이트 리포트를 자동 생성하는 웹 대시보드 서비스입니다.

### 한 줄 소개

> 투자 데이터만 넣으면, Skills.md가 분석 기준·차트 선택·인사이트 생성을 통제하는 자동 투자 대시보드 생성기

### 핵심 가치

| 구분 | 내용 |
|---|---|
| 범용성 | 데이터 구조가 달라도 컬럼 패턴을 판별해 공통 분석 흐름으로 변환 |
| 재사용성 | 분석 규칙을 코드가 아닌 Skills.md 문서로 분리 |
| 자동화 | KPI, 차트, 인사이트, 리포트 구성을 자동 생성 |
| 투명성 | Skills Inspector에서 어떤 규칙이 적용됐는지 확인 가능 |
| 심사 편의성 | API Key, 로그인, 외부 증권 API 없이 즉시 데모 가능 |

## 2. 기획 배경 및 문제 정의

금융 기업과 개인 투자자는 다양한 투자 데이터를 반복적으로 분석합니다. 하지만 데이터 구조가 매번 다르고, 분석 기준도 담당자마다 달라 대시보드를 새로 만들거나 수동으로 지표를 계산해야 하는 문제가 있습니다.

### 해결하고자 하는 문제

1. **데이터 형식 의존성**: CSV 컬럼명이 조금만 바뀌어도 기존 대시보드를 재사용하기 어렵습니다.
2. **분석 기준 불일치**: 같은 데이터를 보더라도 사람마다 지표·차트·해석 기준이 다릅니다.
3. **수동 리포트 작성 부담**: 차트 선택과 요약 문장 작성이 반복적인 수작업에 의존합니다.
4. **바이브코딩 결과의 재사용성 부족**: 생성된 코드가 왜 그런 분석을 하는지 문서로 남지 않으면 확장과 검증이 어렵습니다.

## 3. 핵심 아이디어

본 프로젝트의 핵심은 **Skills.md를 투자 분석가의 업무 규칙서로 정의하고, 웹앱을 그 규칙서를 실행하는 대시보드 엔진으로 구현하는 것**입니다.

<div class="flow">
  <div>CSV 입력</div><span>→</span>
  <div>데이터 유형 판별</div><span>→</span>
  <div>지표 계산</div><span>→</span>
  <div>차트 선택</div><span>→</span>
  <div>인사이트 생성</div>
</div>

### 설계 관점

- Skills.md는 단순 설명서가 아니라 **분석 실행 규칙**입니다.
- 웹앱은 하드코딩된 단일 대시보드가 아니라 **규칙 기반 대시보드 생성기**입니다.
- 사용자는 데이터만 넣고, 시스템은 규칙에 맞춰 결과를 생성합니다.

## 4. 주요 사용자

| 사용자 | 니즈 | 제공 가치 |
|---|---|---|
| 개인 투자자 | 보유 종목/거래내역 빠른 점검 | 수익률, 낙폭, 집중도 자동 요약 |
| 금융 데이터 분석가 | 반복 대시보드 제작 시간 단축 | 데이터 구조 판별과 차트 자동 생성 |
| 자산관리 담당자 | 포트폴리오 위험 파악 | 집중도·변동성·낙폭 경고 |
| 데이터/AI 팀 | 분석 규칙 재사용 | Skills.md 기반 표준화 |

## 5. 서비스 사용 흐름

### Step 1. 데이터 입력

사용자는 샘플 데이터를 선택하거나 CSV 파일을 업로드합니다.

지원 데이터 예시:

- 주가 시계열 데이터
- ETF/자산군 비교 데이터(제출 후 확장 후보)
- 포트폴리오 보유 비중 데이터
- 거래내역 데이터
- 시장 지표 데이터

### Step 2. 데이터 프로파일링

시스템은 컬럼명, 날짜 컬럼, 숫자 컬럼, 자산 식별자, 거래 방향 등을 분석하여 데이터 유형을 판별합니다.

```text
감지 유형: price_timeseries
신뢰도: 0.92
근거: date, close, volume 컬럼 존재
```

### Step 3. 지표 자동 계산

데이터 유형별 Skills 규칙에 따라 핵심 지표를 계산합니다.

- 누적 수익률
- 일간 수익률
- 변동성
- 최대 낙폭(MDD)
- 이동평균
- 포트폴리오 집중도
- 매수/매도 금액
- 거래 횟수
- 거래 상태

### Step 4. 차트 자동 선택

Skills.md에 정의된 시각화 규칙에 따라 적절한 차트를 선택합니다.

| 데이터 구조 | 자동 차트 | 선택 사유 |
|---|---|---|
| date + close | Line Chart | 가격 흐름을 시간축으로 표현 |
| asset + return | Bar Chart | 자산별 성과 비교(제출 후 확장 후보) |
| ticker + weight | allocation bar + concentration gauge | 포트폴리오 구성비와 Top1 집중도 표현 |
| date + drawdown | Area Chart | 손실 구간 강조 |
| side + quantity + price | Bar Chart | 매수/매도 금액 비교 |

### Step 5. 인사이트 리포트 생성

분석 결과를 기반으로 투자 권유가 아닌 데이터 기반 요약 문장을 생성합니다.

```text
최근 분석 기간 동안 상승 흐름이 관찰됩니다.
최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다.
본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다.
```

## 6. 화면 구성

### 6.1 랜딩 화면

- 서비스 개요
- 샘플 데이터 선택 버튼
- CSV 업로드 영역
- Skills.md 기반 자동 생성 흐름 설명

### 6.2 데이터 프로파일 화면

- 감지된 데이터 유형
- 신뢰도
- 컬럼 매핑 결과
- 결측치/이상치 요약
- 적용된 Skills 규칙

### 6.3 메인 대시보드 화면

- KPI 카드
- 가격/수익률/낙폭 차트
- 포트폴리오 비중 차트
- 매수/매도 금액 및 거래 상태 요약
- 인사이트 패널

### 6.4 Skills Inspector 화면

- 현재 적용된 Skills.md 문서
- 실행된 규칙 목록
- 차트 선택 사유
- 인사이트 생성 근거

## 7. Skills.md 설계

Skills.md는 하나의 거대한 문서가 아니라 역할별 문서로 분리합니다.

```text
skills/
  01_data_detection.md
  02_metric_rules.md
  03_chart_selection.md
  04_insight_generation.md
  05_report_layout.md
```

### 7.1 Data Detection Skill

입력 CSV의 컬럼명과 값 패턴을 기반으로 투자 데이터 유형을 판별합니다.

```yaml
if columns include [date, close]:
  data_type: price_timeseries

if columns include [ticker, weight]:
  data_type: portfolio_allocation

if columns include [side, quantity, price]:
  data_type: transaction_log
```

### 7.2 Metric Calculation Skill

데이터 유형별 계산 지표를 정의합니다.

```text
daily_return = close.pct_change()
cumulative_return = (1 + daily_return).cumprod() - 1
volatility = std(daily_return) * sqrt(252)
drawdown = cumulative_value / running_peak - 1
mdd = min(drawdown)
```

### 7.3 Chart Selection Skill

데이터 구조에 따라 적합한 차트를 자동 선택합니다.

```yaml
price_timeseries:
  - price_line
  - cumulative_return_line
  - drawdown_area

portfolio_allocation:
  - allocation_bar
  - sector_bar
```

### 7.4 Insight Generation Skill

지표 결과를 기반으로 안전한 자연어 인사이트를 생성합니다.

```text
if max_drawdown <= -0.10:
  "최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다."
```

### 7.5 Report Layout Skill

대시보드와 리포트의 정보 배치 순서를 정의합니다.

```text
데이터 요약 → KPI → 주요 차트 → 위험 분석 → 인사이트 → 적용 Skills → 유의사항
```

## 8. 기술 구현 결과

| 영역 | 선택 기술 | 이유 |
|---|---|---|
| Frontend | Vite + React + TypeScript | 빠른 구현, 정적 배포 용이 |
| Chart | Recharts | React 연동이 쉽고 심사용 시각화 충분 |
| CSV Parsing | PapaParse | 브라우저 내부 CSV 처리 가능 |
| Processing | TypeScript Rule Engine | API 없이 클라이언트에서 분석 가능 |
| Deploy | 정적 배포 산출물 | `npm run build`로 생성한 `dist/`를 영구 URL에 배포 가능 |

### 운영 원칙

- 로그인 없이 동작
- API Key 없이 동작
- 샘플 데이터로 즉시 체험 가능
- 외부 증권 API에 의존하지 않음
- Skills.md trace contract badge와 generated report summary를 화면에서 직접 확인 가능

## 9. 현재 제출 구현 범위

### 필수 구현

- 샘플 데이터 3종 제공
  - 주가 시계열
  - 포트폴리오 비중
  - 거래내역
- CSV 업로드
- 데이터 타입 자동 판별
- KPI 자동 계산
- 차트 자동 생성
- 인사이트 패널
- Skills Inspector
- 정적 빌드 산출물 생성 및 외부 preview URL 검증

### 제출 후 확장 후보

- Markdown/PDF 리포트 다운로드
- 사용자 Skills.md 편집 후 재실행
- 여러 종목/ETF 비교 분석(asset_comparison은 현재 제출 demo behavior가 아니라 P1 확장 후보)
- 포트폴리오 리밸런싱 힌트

## 10. 평가 기준 대응 전략

| 평가항목 | 배점 | 대응 방식 |
|---|---:|---|
| 범용성 | 25 | 여러 투자 데이터 구조를 자동 판별하고 공통 대시보드로 변환 |
| Skills.md 설계 | 25 | 데이터 판별, 지표 계산, 차트 선택, 인사이트 생성을 문서 규칙으로 분리 |
| 대시보드 자동 생성 | 25 | CSV 입력만으로 KPI·차트·리포트 자동 구성 |
| 바이브코딩 활용 | 15 | Skills.md를 요구사항/생성 지침으로 사용하여 코드와 UI를 생성 |
| 실용성 및 창의성 | 10 | Skills Inspector로 규칙 적용 과정을 투명하게 표시 |

## 11. 차별화 포인트

### 11.1 Skills Inspector

심사자가 대시보드 결과만 보는 것이 아니라, 어떤 Skills 규칙이 어떤 지표와 차트를 만들었는지 직접 확인할 수 있습니다.

### 11.2 API Key 없는 심사 친화 구조

외부 API Key, 로그인, 증권사 연동 없이 샘플 데이터와 업로드 CSV만으로 전체 기능을 확인할 수 있습니다.

### 11.3 투자 권유 방지 규칙

인사이트 생성 단계에서 매수·매도 추천, 수익 보장, 특정 종목 단정 표현을 금지합니다.


### 11.4 최신 제출 화면 증거

밝은 sky/mint/cream 톤의 judge-ready hero, generated report summary, trace contract badge, mini risk visuals(drawdown/concentration/buy-sell), Korean CSV alias를 현재 제출 차별점으로 반영했습니다.

## 12. 투자 유의사항

본 서비스는 투자 데이터를 시각화하고 요약하는 도구이며, 특정 자산의 매수·매도 추천을 제공하지 않습니다. 모든 인사이트는 입력 데이터 기반 참고 정보이며 투자 판단의 책임은 사용자에게 있습니다.

## 13. 기대 효과

1. 반복적인 투자 대시보드 구축 시간을 단축합니다.
2. 분석 기준을 Skills.md로 문서화하여 팀 내 재사용성을 높입니다.
3. 데이터 구조가 달라도 일관된 방식으로 분석할 수 있습니다.
4. 심사자가 별도 API Key 없이 즉시 서비스 기능을 확인할 수 있습니다.
5. 바이브코딩 결과를 일회성 코드가 아닌 재사용 가능한 분석 규칙으로 남길 수 있습니다.
