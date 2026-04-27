# 1. Executive verdict

추가 기능 구현은 중단하는 편이 맞다. 현재 제품은 심사 기준의 핵심인 브라우저-only 실행, CSV 판별, KPI/차트/위험/trace/리포트 자동 생성, 한글 alias, 투자 권유 방지, 밝은 judge-ready UI를 이미 갖췄다. 남은 1순위 리스크는 기능 부재가 아니라 제출 안정성이다.

최대 리스크는 영구 정적 배포 URL 부재다. 브리프에 적힌 `trycloudflare.com` quick tunnel은 임시 주소이므로 최종 제출 URL로 쓰면 안 된다. 그 다음은 README가 외부 심사자용 첫 화면 문서로 부족한 점, 루트 `Skills.md`가 없어 심사자가 "Skills.md 제출물"을 바로 찾기 어렵다는 점, PDF/제안서 원고가 최신 P0+/bright redesign 상태보다 뒤처져 있다는 점이다.

검증 근거: `npm run test:analysis`와 `npm run test:design`는 2026-04-25 작업 중 모두 `ok`로 통과했다. `npm run build`와 live URL 브라우저 검증은 이번 전략 리뷰 범위에서는 재실행하지 않았다.

# 2. Current strengths that should not be disturbed

- `src/App.tsx`는 첫 화면에 `Judge-ready`, `Browser only`, `Skills contract` 배지와 hero copy를 보여준다. 샘플 3종 버튼과 CSV 업로드도 같은 첫 화면 영역에 있다.
- `src/lib/analysis.ts`는 `price_timeseries`, `portfolio_allocation`, `transaction_log`, `market_indicator`, `unknown` 흐름을 실제 rule id trace로 생성한다.
- `src/lib/analysis.ts`의 alias catalog는 `일자`, `종가`, `체결가`, `매수`, `매도`, `수량`, `평가비중`, `종목코드` 등 한국형 CSV를 이미 지원한다.
- `buildRuleContract()`와 UI의 `Trace ↔ Skills contract matched` 배지는 trace rule id와 implemented rule catalog 연결을 보여준다.
- `skills/*.md`와 `public/skills/*.md`는 byte-for-byte 동일하다. mirror drift는 현재 없다.
- `src/styles.css`는 bright palette 변수와 `bright-palette` 배경, 520px 이하 `.hero-visual { display: none; }`, `overflow-x: hidden`을 포함한다.
- 투자 유의문구는 hero note와 footer에 모두 있다. `src/lib/analysis.ts`의 insight 문장도 "투자 권유가 아니라 입력 데이터 기반 요약"을 반복한다.

이 강점들은 마지막 단계에서 건드리지 않는 것이 낫다. 기능 확장보다 제출 표면을 안정화해야 한다.

# 3. Remaining high-ROI improvements

1. 영구 정적 배포 URL 확보 및 live smoke check
   - ROI: 매우 높음, 리스크: 낮음.
   - quick tunnel이 아니라 Vercel/Netlify/Cloudflare Pages/GitHub Pages 등 심사 기간 동안 유지되는 URL이어야 한다.
   - 검증은 `/` HTTP 200, `dist/index.html`의 최신 asset hash 로드, 샘플 3종 클릭, CSV 업로드 empty/unsupported diagnostics, console error 0, 390px horizontal overflow 없음까지 포함해야 한다.

2. README 상단 judge-facing 보강
   - ROI: 매우 높음, 리스크: 낮음.
   - 현재 README는 기능 요약과 실행법은 있지만 live URL, 30초 데모 순서, 평가축 대응표, 실제 검증 결과, 제출 산출물 위치가 부족하다.
   - 상단에 "Live Demo", "30초 심사 루트", "No API/Login/Backend", "DAKER 평가축 대응", "Verified on YYYY-MM-DD"를 넣어야 한다.

3. 루트 `Skills.md` 추가
   - ROI: 높음, 리스크: 낮음.
   - 상세 규칙을 중복하지 않는 index/contract 파일이면 충분하다.
   - `skills/01_data_detection.md`부터 `skills/05_report_layout.md` 링크, implemented rule id 표, `public/skills/*.md` mirror 설명, future rules는 현재 데모 동작이 아니라는 경계를 담으면 된다.

4. 제안서/PDF 원고의 outdated 섹션만 좁게 정리
   - ROI: 중간~높음, 리스크: 낮음.
   - `docs/proposal-pdf-script.md`와 `docs/proposal-pdf-template.md`는 아직 "기술 구현 계획", "MVP 구현 범위", "웹 배포" 같은 미래형 표현이 남아 있다.
   - PDF는 2026-04-25 02:24 KST 생성본이라 bright redesign 이후 상태를 충분히 반영하지 못했을 가능성이 높다.

# 4. 2-hour action plan

1. 0~55분: 영구 정적 배포 URL 확보
   - `npm run build` 후 정적 호스팅에 배포한다.
   - `/` HTTP 200과 최신 asset hash를 확인한다.
   - quick tunnel URL은 README/제출 문서에서 제출 URL로 쓰지 않는다.

2. 55~95분: live smoke 검증
   - 가격 시계열, 포트폴리오 비중, 거래내역 샘플을 실제 URL에서 클릭한다.
   - CSV 업로드로 empty CSV와 unsupported CSV diagnostics를 확인한다.
   - 브라우저 console error 0, 390px viewport overflow 없음, 최신 bright chart color를 확인한다.
   - 결과를 날짜/명령/URL과 함께 README에 기록한다.

3. 95~120분: README + 루트 `Skills.md` 최소 보강
   - README 상단에 live URL, 30초 데모 순서, 평가축 대응표, 검증 결과, 산출물 위치, 투자 유의문구를 추가한다.
   - 루트 `Skills.md`는 index/contract로 추가한다.
   - 시간이 15분 이상 남으면 proposal 원고의 8~10장만 현재 구현 상태로 바꾼다.

# 5. 30-minute emergency action

단 하나만 한다면 영구 정적 URL을 만들고 README 최상단에 live URL과 30초 데모 순서를 박아야 한다. 기능이 좋아도 심사자가 안정 URL에서 즉시 열지 못하면 점수화가 어렵다. 루트 `Skills.md`와 proposal refresh는 그 다음이다.

# 6. UI/copy/design critique after bright redesign

큰 디자인 결함은 보이지 않는다. `src/App.tsx`의 hero는 "투자 CSV가 바로 심사용 리포트 화면으로 변환됩니다"라고 첫인상을 명확히 만들고, `src/styles.css`는 sky/mint/coral/sun 계열 bright palette를 사용한다. design test도 old black/green gradient와 black chart stroke/fill이 없음을 확인한다.

남은 약점은 기능보다 copy/기대치 관리다.

- `Ask` 입력과 `Analyze` 버튼은 LLM 대화처럼 보일 수 있지만 실제로는 rule-based focus mode와 재분석 트리거다. README에서 "prompt는 분석 초점 UI이며 외부 LLM/API 호출이 아니다"라고 명시하면 오해를 줄일 수 있다.
- 한 화면에 한국어와 영어가 섞인다. 해커톤/심사 맥락에서는 오히려 기술 증거로 보일 수 있으나, README의 데모 순서에서는 버튼명을 실제 UI 텍스트 그대로 병기해야 한다.
- 모바일에서 hero visual을 숨기는 선택은 390px 안정성 관점에서 합리적이다. 다만 README에 mobile proof strip/contract badge가 보인다는 점을 검증 결과로 적으면 디자인 의도가 명확해진다.

# 7. Submission packaging risks

- 영구 URL 없음: 브리프의 현재 공개 URL은 `trycloudflare.com` quick tunnel이다. 제출 안정성 기준에서 가장 큰 P0 리스크다.
- README 외부 심사용 부족: 현재 README는 `README.md` 1~45행 정도의 간단한 프로젝트 설명이다. live URL, 30초 데모, 검증 로그, 평가축 대응이 없다.
- 루트 `Skills.md` 부재: `skills/*.md` 세트는 강하지만, 해커톤 이름상 심사자가 루트 `Skills.md`를 기대할 수 있다.
- proposal/PDF lag: `docs/proposal-pdf-script.md`는 8장 "기술 구현 계획", 9장 "MVP 구현 범위", "추가 구현 후보"처럼 과거 계획형 톤이 남아 있다. PDF metadata는 2026-04-25 02:24 KST 생성본이다.
- 기능 claim mismatch: proposal은 `asset_comparison`, `거래 승률`, `Bar/Donut Chart`, `Skills.md를 화면에서 직접 확인` 등을 넓게 말한다. 현재 구현은 `asset_comparison`을 future rule로 분리했고, 실제 거래 분석은 buy/sell amount와 거래 상태 중심이다.
- dependency reproducibility: `package.json`과 `package-lock.json` 모두 `latest` 의존성을 담고 있다. 제출 직전 재설치 환경에서는 lockfile이 있으면 실질 리스크가 낮지만, README에는 `npm ci`를 권장하는 편이 안전하다.

# 8. README / proposal / PDF refresh recommendations

README는 반드시 업그레이드해야 한다. 최소 상단 구조:

```md
InvestSkill Lens

Live Demo: <permanent URL>
30-second judge route:
1. Open Live Demo.
2. Click 주가 시계열, 포트폴리오 비중, 거래내역.
3. Upload unsupported CSV and confirm diagnostics.
4. Check Trace ↔ Skills contract matched and disclaimer footer.

No API key, no login, no backend.

Verified on 2026-04-25:
- npm run test:analysis: ok
- npm run test:design: ok
- npm run build: <result>
- Live URL / HTTP 200: <result>
- Console errors: 0
- 390px overflow: none
```

proposal/PDF 원고에서 좁게 바꿀 곳:

- `docs/proposal-pdf-script.md` / `docs/proposal-pdf-template.md` 8장: "기술 구현 계획"을 "기술 구현 결과"로 변경.
- 9장: "MVP 구현 범위"를 "현재 제출 구현 범위"로 변경하고 "웹 배포"는 실제 영구 URL 확보 후 완료형으로 기재.
- 9장 "추가 구현 후보"는 "제출 후 확장 후보"로 낮추고 현재 제출 범위와 분리.
- Step 3의 "거래 승률"은 현재 구현과 맞지 않으므로 "매수/매도 금액, 거래 횟수, 거래 상태"로 바꿈.
- Step 4의 `Bar/Donut Chart`는 현재 구현이 allocation bar + concentration gauge이므로 그렇게 바꿈.
- `asset_comparison`은 future/P1로 표기하거나 현재 제출 지원 범위에서 제외.
- bright redesign, generated report summary, mini risk visuals, Korean aliases, trace contract badge를 최신 차별점에 추가.

PDF 재생성은 시간이 남을 때만 한다. PDF를 다시 만들지 못한다면 README가 최신 상태의 canonical submission guide가 되어야 한다.

# 9. Skills.md artifact recommendations

`skills/*.md` 자체는 충분히 강하다. 각 파일이 목적, 규칙, implemented demo rules, declared future rules를 갖고 있고 `public/skills/*.md`와 동일하다. 다만 루트 `Skills.md`가 없어서 제출 아티팩트 발견성이 약하다.

루트 `Skills.md`는 상세 규칙 중복 없이 다음만 담으면 된다.

- 프로젝트명과 한 문장 contract: "CSV rows -> detection -> metrics -> chart -> insight -> layout".
- Rule file index:
  - `skills/01_data_detection.md`
  - `skills/02_metric_rules.md`
  - `skills/03_chart_selection.md`
  - `skills/04_insight_generation.md`
  - `skills/05_report_layout.md`
- Implemented rule id matrix: detection, metric, chart, insight, layout rule id와 UI trace 연결.
- Mirror note: `public/skills/*.md`는 웹 표시/정적 배포용 mirror이며 `skills/*.md`와 동기화.
- Boundary note: `Declared future rules`는 현재 demo behavior가 아니며 P1 확장 후보.
- Safety note: 투자 권유/수익 보장/매수매도 추천 금지.

# 10. Questions Hermes should have asked the user

- 최종 제출 플랫폼은 URL만 받는가, GitHub/ZIP/PDF/Skills.md 파일 업로드도 받는가?
- 심사자가 한국어 UI를 선호하는가, 영어 README/영문 요약이 필요한가?
- 영구 배포는 어떤 계정/도메인에 유지할 수 있는가? 심사 기간 이후까지 유지해야 하는가?
- DAKER 제출란에 PDF가 필수인가, 선택인가? README와 live demo 중 어느 쪽이 canonical artifact인가?
- 루트 `Skills.md` 단일 파일을 명시적으로 요구하는가, `skills/*.md` 세트도 허용되는가?
- 투자 유의문구는 국내 투자자문/광고 규제 관점에서 더 보수적으로 써야 하는가?
- 샘플 데이터가 실제 종목명/가상 종목 중 어느 쪽이어야 하는가?
- 심사자가 모바일로도 볼 가능성이 높은가, 데스크톱 우선이면 어느 해상도를 대표로 검증할 것인가?
- quick tunnel이 허용되는 임시 심사인지, 반드시 영구 URL이 필요한지 왜 더 일찍 확정하지 않았는가?

# 11. Low-EV work to avoid

- 새 데이터 타입 추가, 특히 `asset_comparison` 구현.
- PDF export, Skills editor, 리밸런싱 힌트, 실제 종목 추천/랭킹.
- 백엔드/API/로그인/증권사 연동.
- 디자인 대개편 또는 palette 재변경.
- 광범위한 리팩터링, chart library 교체, state 구조 재작성.
- 투자 조언처럼 보이는 copy 강화.
- 제안서 전체 재작성. 필요한 것은 outdated 섹션의 좁은 현재화다.

# 12. Verification plan

남은 변경 후 최소 검증:

```bash
npm ci
npm run test:analysis
npm run test:design
npm run build
```

live URL 검증:

- `curl -I <permanent-url>/` 결과 HTTP 200.
- 배포된 HTML이 최신 build asset을 참조하는지 확인.
- 실제 브라우저에서 샘플 3종 클릭:
  - 주가 시계열: price/return line + drawdown visual.
  - 포트폴리오 비중: allocation bar + concentration gauge.
  - 거래내역: buy/sell bar + flow meter.
- CSV 업로드:
  - 정상 CSV.
  - 빈 CSV.
  - unsupported CSV.
  - 숫자 변환 경고 CSV.
- Console JS error 0.
- 390px viewport에서 horizontal overflow 없음.
- footer 투자 유의문구 노출.
- `Trace ↔ Skills contract matched` 또는 rule id matched 상태 확인.

이번 리뷰에서 직접 확인한 명령:

```text
npm run test:analysis -> analysis-tests: ok
npm run test:design -> design-tests: ok
```

# 13. Final submission checklist

- [ ] 영구 정적 배포 URL 확보.
- [ ] quick tunnel URL을 제출 URL로 쓰지 않음.
- [ ] README 최상단에 live URL 추가.
- [ ] README에 30초 데모 순서 추가.
- [ ] README에 no API/login/backend 명시.
- [ ] README에 DAKER 평가축 대응표 추가.
- [ ] README에 실제 검증 명령/결과/날짜 추가.
- [ ] README에 산출물 위치와 투자 유의문구 추가.
- [ ] 루트 `Skills.md` index/contract 추가.
- [ ] `skills/*.md`와 `public/skills/*.md` mirror 동일성 재확인.
- [ ] proposal 원고의 계획형/outdated 문구를 현재 구현형으로 수정.
- [ ] PDF를 재생성한다면 metadata와 페이지를 확인. 재생성하지 못하면 README를 canonical 최신 문서로 둠.
- [ ] live URL에서 샘플 3종, CSV 업로드 diagnostics, console error 0, 390px overflow 없음 확인.
- [ ] 최종 제출란에 live URL, README, Skills.md, PDF/원고 경로를 일관되게 기입.

# 14. Open assumptions / unverified items

- 영구 배포 URL은 이번 리뷰에서 생성/검증하지 않았다. 브리프의 quick tunnel URL은 임시로 간주했다.
- `npm run build`는 이번 리뷰에서 재실행하지 않았다. 브리프에는 통과로 제공되어 있고, `dist/`에는 2026-04-25 10:28 KST 기준 asset이 존재한다.
- live browser smoke는 이번 리뷰에서 재수행하지 않았다. 브리프가 제공한 최신 browser check를 참고했지만, 최종 제출 URL에서는 반드시 다시 해야 한다.
- PDF 내용은 metadata와 원고/HTML 텍스트 중심으로 확인했다. PDF 렌더링 페이지별 시각 검수는 하지 않았다.
- DAKER 공식 제출 요구사항의 파일 형식/필수 항목은 이 워크스페이스만으로 확정할 수 없다.
- 현재 작업 디렉터리는 git 저장소가 아니었다. 최종 제출 방식이 GitHub 저장소라면 별도 packaging 확인이 필요하다.
