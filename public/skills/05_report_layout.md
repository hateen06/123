# 05 · Report Layout Skill

## 목적과 위치

이 문서는 **앞선 4개 단계의 산출물을 화면에 어떤 순서·비중·반응형 규칙으로 배치할지**를 정의한다.

```
(1) Detection  (2) Metric  (3) Chart  (4) Insight ─▶  ★ (5) Layout
```

레이아웃은 단순한 시각 디자인이 아니라 **정보 위계를 강제하는 규칙**이다. 평가자가 30초 안에 핵심을 파악하도록 설계되어야 하며, 이 문서는 "어떤 정보가 어디에 와야 하는가"의 근거를 명문화한다.

## 정보 위계 원칙

화면 위에서 아래로 내려갈수록 **상세도와 선택성**이 증가한다.

| 영역 | 우선순위 | 역할 |
| --- | --- | --- |
| Topbar | 1 | 브랜드 + Skills.md 진입점 |
| Data Source Bar | 2 | 샘플 토글 + CSV 업로드 + detection 상태 |
| Ask Bar | 3 | 분석 초점 입력 |
| KPI Grid (4개) | 4 | 한눈 요약 — Detected data + 3개 핵심 지표 |
| Main Visualization | 5 | 메인 차트 + 위험 보조 시각 |
| Skills Contract Card | 5 (병렬) | 현재 trace의 contract 매칭 상태 + 핵심 인사이트 3개 |
| Detail Tabs | 6 | Insights / Skills Trace / Rule Ledger / Data Preview |
| Mapping Note | 7 | 컬럼 매핑·판별 사유 |
| Disclaimer Footer | 8 | 안전 헌장 |

**Detail Tabs**가 한 단계 아래로 분리된 것은, **첫 화면 로드 시 화면을 차트와 KPI에 집중**시키기 위함이다. 평가자가 더 깊은 검증을 원할 때만 Tab을 열도록 한다.

## 데스크톱 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ Topbar                                                       │
├─────────────────────────────────────────────────────────────┤
│ Data Source Bar                                              │
│ Ask Bar                                                      │
├─────────────────────────────────────────────────────────────┤
│ KPI₁    KPI₂    KPI₃    KPI₄                                 │
├──────────────────────────────────┬──────────────────────────┤
│ Main Chart                       │ Skills Contract          │
│ + Risk Visual                    │ + Insights (3개)         │
├──────────────────────────────────┴──────────────────────────┤
│ Tabs: Insights / Trace / Ledger / Preview                    │
├─────────────────────────────────────────────────────────────┤
│ Mapping Note                                                 │
│ Disclaimer Footer                                            │
└─────────────────────────────────────────────────────────────┘
```

- 메인 차트와 Skills Contract는 **2:1 비율** (`lg:col-span-2`)
- KPI Grid는 **4열** (`lg:grid-cols-4`), 모바일에서는 2열
- 컨테이너 폭은 `max-w-7xl`로 제한, 좌우 6 padding

## 모바일 레이아웃

| 차이점 | 규칙 |
| --- | --- |
| KPI Grid | 4열 → 2열로 자동 전환 |
| Main Chart / Contract | 2 열 → 1 열로 세로 적층 |
| Topbar 액션 | 텍스트는 유지하되 padding 축소 |
| Tabs | 가로 스크롤 허용 |
| 폰트 크기 | 절대 축소 없음 — Tailwind responsive 토큰만 사용 |

390px 뷰포트에서 **수평 스크롤이 발생하지 않아야 한다**. 이는 검증 항목으로 강제된다.

## KPI 카드 슬롯 규칙

KPI 4 슬롯은 데이터 유형과 무관하게 **항상 같은 의미**를 가진다.

| 슬롯 | 의미 | 데이터 유형별 매핑 |
| --- | --- | --- |
| 1 | Detected data | 데이터 유형 + 신뢰도 + 행 수 (모든 유형 공통) |
| 2 | 핵심 성과 지표 | price=총수익률, portfolio=총비중, transaction=매수액, market=최신값 |
| 3 | 핵심 위험 지표 | price=변동성, portfolio=Top1, transaction=매도액, market=변화율 |
| 4 | 핵심 라벨 지표 | price=최대낙폭, portfolio=집중도, transaction=거래횟수, market=방향 |

이 매핑은 **"어떤 데이터든 같은 위치에서 같은 종류의 정보를 본다"** 라는 일관된 분석 기준 원칙의 직접 구현이다.

## 색상·그림자·라운드 규칙

- 색은 03 차트 시맨틱 토큰을 그대로 따른다
- 카드는 `border + bg-card` 단일 패턴, 그림자 사용 금지
- 라운드는 shadcn 기본(`var(--radius)` ≈ 0.625rem)만 사용
- 강조는 **색이 아니라 크기/굵기**로 (KPI value는 `text-2xl font-semibold tabular-nums`)

## 디스클레이머 규칙

| 위치 | 노출 시점 |
| --- | --- |
| Hero/Ask 영역 | (현재 미배치 — 1차에서 footer로만 충분) |
| Tabs > Insights 탭 내부 | 텍스트 끝에 항상 1줄 |
| Footer | 모든 화면, 모든 데이터 유형 공통 |

footer는 어떤 상황에서도 **반드시 렌더**되어야 한다. 데이터 미입력 / 에러 / unknown 상태에서도 동일.

## 인터랙션 규칙

- Tabs 전환은 클라이언트 상태로만 처리 (URL hash 변경 없음)
- 차트 hover tooltip은 활성, 클릭 드릴다운은 미사용 (현재 범위)
- 데이터 소스 칩 클릭은 `loadCsv` 후 `analyze`를 자동 트리거

## 한계와 의도된 비대응

- **PDF/이미지 export 미지원**: 1차 제출 범위 외
- **레이아웃 사용자 정의 미지원**: 슬롯 위치 고정
- **다중 데이터셋 동시 비교 미지원**: 한 화면 = 한 CSV
- **다크 모드 토글 미지원**: 토큰은 준비되어 있으나 UI 토글은 P1

## 구현 매트릭스

| Rule ID | 정의 위치 | 화면 증거 |
| --- | --- | --- |
| `layout.dashboard.evidence_first` | §정보 위계 / §데스크톱 레이아웃 | 화면 전체 구조 |
| `layout.kpi.shared_slot` | §KPI 카드 슬롯 규칙 | 데이터 유형 변경 시에도 KPI 슬롯 의미가 보존됨 |
| `layout.disclaimer.always_visible` | §디스클레이머 규칙 | footer 항상 렌더 |

## 확장

| Future Rule ID | 의도 |
| --- | --- |
| `layout.export.pdf_report` | PDF 리포트 출력 |
| `layout.theme.dark_toggle` | 다크 모드 토글 UI |
| `layout.compare.dual_dataset` | 두 데이터셋 동시 비교 워크스페이스 |

## 검증 방법

1. 데이터 유형이 바뀌어도 KPI 슬롯 4개의 **위치와 라벨 의미**가 유지되어야 한다.
2. 모바일 390px 뷰포트에서 가로 스크롤이 발생하지 않아야 한다.
3. footer disclaimer는 unknown / error / 정상 모든 상태에서 렌더되어야 한다.
4. Tabs는 첫 진입 시 `Insights`가 활성이어야 한다.
