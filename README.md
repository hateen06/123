# InvestSkill Lens

**Skills.md 기반 범용 투자 데이터 대시보드 생성기**  
CSV를 넣으면 데이터 유형을 판별하고 KPI, 차트, 위험 요약, 실행 근거 trace, generated report summary를 브라우저에서 자동 생성합니다.

## Live Demo

- Temporary preview: https://integrity-menu-pointing-decided.trycloudflare.com
- Permanent submission URL: pending — Quick Tunnel은 PC 절전/네트워크 변경/프로세스 종료 시 끊길 수 있어 최종 제출 URL로는 별도 영구 배포가 필요합니다.

## 30초 심사 루트

1. Live Demo를 엽니다.
2. 상단 샘플에서 `주가 시계열`, `포트폴리오 비중`, `거래내역`을 차례로 클릭합니다.
3. 각 화면에서 KPI, chart, mini risk visual, generated report summary를 확인합니다.
4. `Trace ↔ Skills contract matched` 배지와 rule id timeline을 확인합니다.
5. CSV 업로드에 빈 CSV 또는 미지원 CSV를 넣어 diagnostics가 뜨는지 확인합니다.
6. footer와 hero note의 투자 유의사항을 확인합니다.

No API key, no login, no backend. 모든 분석은 브라우저 내부 rule engine으로 실행됩니다.

> `Ask` 입력과 `Analyze` 버튼의 prompt는 분석 초점 UI입니다. 외부 LLM/API 호출이 아니라 현재 CSV와 Skills.md rule trace를 재분석하는 클라이언트 기능입니다.

## DAKER 평가축 대응

| 평가축 | 구현 증거 |
| --- | --- |
| 범용성 | price timeseries, portfolio allocation, transaction log, market indicator/unknown 흐름과 한국어 CSV alias 지원 |
| Skills.md 설계 | `skills/*.md` 5개 문서 + 루트 `Skills.md` contract + implemented rule id matrix |
| 대시보드 자동 생성 | CSV/샘플 선택만으로 KPI, chart, risk visual, generated report summary 자동 생성 |
| 바이브코딩 활용 | Skills.md를 요구사항/검증 계약으로 사용하고 UI trace rule id와 문서 rule id를 동기화 |
| 실용성 | API key/login/backend 없이 정적 배포만으로 심사 가능 |
| 디자인/첫인상 | bright sky/mint/cream palette, judge-ready hero, proof grid, mobile proof strip |
| 신뢰/안전성 | 매수·매도 추천 금지, 수익 보장 금지, 교육용 자동 리포트 disclaimer |

## Verified on 2026-04-25

- `npm run test:analysis` → `analysis-tests: ok`
- `npm run test:design` → `design-tests: ok`
- `npm run test:submission` → README/Skills/proposal submission contract 검증용 테스트
- `npm run build` → TypeScript + Vite production build
- Temporary preview HTTP 200 확인됨
- Browser console errors: 0
- 390px overflow: none (`innerWidth=390`, document/body scroll width 390)
- Portfolio chart bars: bright blue, old black/muddy green chart colors removed

## 산출물

- `Skills.md`: 제출용 top-level Skills contract/index
- `skills/*.md`: 제출용 세부 Skills.md 세트
- `public/skills/*.md`: 웹 Skills Inspector/contract 표시용 mirror
- `docs/proposal-pdf-script.md`: 기획서 PDF 변환용 원고
- `docs/proposal-pdf-template.md`: PDF 템플릿 원본
- `docs/proposal-pdf-template.html`: HTML/PDF 변환본
- `docs/InvestSkill-Lens-proposal.pdf`: 기획서 PDF
- `src/`: Vite React MVP 코드
- `public/samples/*.csv`: 심사용 샘플 데이터

## 지원 범위

| 데이터 유형 | 필수/주요 컬럼 | 화면 결과 |
| --- | --- | --- |
| 주가 시계열 | `date/일자/기준일` + `close/종가/체결가` + `open/high/low/volume/거래량` 중 하나 | 수익률, 변동성, 최대 낙폭, dual-axis chart, drawdown strip |
| 포트폴리오 비중 | `ticker/종목코드/종목명` + `weight/평가비중/보유비중` | 총 비중, Top1 집중도, allocation bar, concentration gauge |
| 거래내역 | `date/일자` + `side/매매/매수매도` + `quantity/수량` + `price/체결가` | 매수/매도 금액, buy/sell flow meter |
| 시장 지표 | `date/일자` + `value/price/종가` | 최신값, 기간 변화율, trend line |

## Skills.md 실행 증거

- UI trace rule id는 `skills/*.md`의 `Implemented demo rules`와 동기화되어 있습니다.
- 화면의 `Trace ↔ Skills contract matched` 배지가 현재 trace rule id와 Skills rule catalog 일치를 표시합니다.
- 미구현 확장 규칙은 `Declared future rules`로 분리해 현재 데모 범위와 혼동하지 않게 했습니다.
- `public/skills/*.md`는 정적 웹 표시용 mirror이며 `skills/*.md`와 동일해야 합니다.

## 실행

```bash
npm ci
npm run dev
```

## 검증

```bash
npm ci
npm run test:analysis
npm run test:design
npm run test:submission
npm run build
```

## 투자 유의사항

InvestSkill Lens는 입력 CSV를 Skills.md 규칙으로 요약하는 교육용 자동 리포트입니다. 매수·매도 추천, 투자자문, 수익 보장을 제공하지 않습니다.
