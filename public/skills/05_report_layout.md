# 05 Report Layout Skill

## 목적
자동 생성 대시보드와 리포트의 정보 배치 순서를 정의한다.

## 대시보드 레이아웃
1. 데이터 입력 영역
2. 데이터 감지 결과
3. 핵심 KPI 카드
4. 주요 차트
5. 위험 분석
6. 인사이트 리포트
7. Skills Inspector
8. 투자 유의사항

## KPI 카드 규칙
- 첫 번째 카드: 총 수익률 또는 총 비중
- 두 번째 카드: 위험 지표 또는 집중도
- 세 번째 카드: 최근 값 또는 거래 횟수
- 네 번째 카드: 추세/상태 라벨

## Skills Inspector 표시 항목
- 적용된 데이터 판별 규칙
- 계산된 지표 목록
- 생성된 차트 목록
- 차트 선택 사유
- 생성된 인사이트 문장 근거

## 리포트 순서
```text
[데이터 요약]
[핵심 지표]
[시각화 결과]
[위험 요약]
[인사이트]
[적용 Skills]
[유의사항]
```

## UI 원칙
- 첫 화면에서 샘플 데이터로 즉시 체험 가능해야 한다.
- API Key나 로그인 없이 동작해야 한다.
- 심사자가 Skills.md와 결과물의 연결 관계를 확인할 수 있어야 한다.

## Implemented demo rules
- `layout.dashboard.evidence_first`: KPI, 차트, generated report summary, 위험 요약, Skills 실행 근거, 데이터 미리보기 순서로 화면 배치

## Declared future rules
- `layout.export.pdf_report`: PDF export는 P1 확장 범위이며 현재 웹 심사 MVP에는 포함하지 않음
