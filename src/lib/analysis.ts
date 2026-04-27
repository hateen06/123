export type Row = Record<string, string>;
export type Detection = { dataType: string; confidence: number; reasons: string[]; mapped: Record<string, string> };
export type Kpi = { label: string; value: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' };
export type TraceStep = {
  step: string;
  skillId: string;
  ruleId: string;
  label: string;
  evidence: string[];
  output: string;
};
export type RiskVisual =
  | { kind: 'drawdown'; label: string; value: number; helper: string }
  | { kind: 'concentration'; label: string; value: number; helper: string }
  | { kind: 'buy_sell'; label: string; buy: number; sell: number; ratio: number; helper: string }
  | { kind: 'none'; label: string; helper: string };
export type ReportSection = { title: string; value: string; detail: string; tone?: Kpi['tone'] };
export type ColumnMapping = { canonical: string; source: string; label: string };
export type ValidationResult = { errors: string[]; warnings: string[]; recommendations: string[]; detectedColumns: string[] };
export type RuleContractItem = { ruleId: string; skillId: string; status: 'matched' | 'unmatched'; description: string };
export type RuleContract = { matched: RuleContractItem[]; unmatched: RuleContractItem[] };
export type Analysis = {
  detection: Detection;
  kpis: Kpi[];
  insights: string[];
  chartReason: string;
  series: any[];
  trace: TraceStep[];
  riskVisual: RiskVisual;
  reportSections: ReportSection[];
  columnMapping: ColumnMapping[];
  warnings: string[];
  recommendations: string[];
};

const COLUMN_ALIASES: Record<string, string[]> = {
  date: ['date', 'timestamp', 'time', '날짜', '일자', '기준일', '체결일', '거래일'],
  close: ['close', 'price', 'value', '종가', '가격', '현재가', '기준가', '체결가', '평가금액'],
  open: ['open', '시가'],
  high: ['high', '고가'],
  low: ['low', '저가'],
  volume: ['volume', '거래량', '수량합계'],
  weight: ['weight', 'allocation', 'ratio', '비중', '평가비중', '편입비중', '보유비중'],
  ticker: ['ticker', 'asset', 'symbol', 'name', '종목', '자산', '종목코드', '종목명', '상품명'],
  side: ['side', 'type', 'action', '구분', '매매', '매수매도', '매수/매도', '거래구분'],
  quantity: ['quantity', 'qty', '수량', '체결수량', '주수'],
};

const IMPLEMENTED_RULE_CATALOG: Record<string, { skillId: string; description: string }> = {
  'detect.price_timeseries.ohlcv': { skillId: '01_data_detection', description: 'date + close/price + OHLCV 보조 컬럼으로 주가 시계열 판별' },
  'detect.portfolio.weight': { skillId: '01_data_detection', description: 'asset/ticker + weight/allocation/ratio 컬럼으로 포트폴리오 비중 판별' },
  'detect.transaction.execution': { skillId: '01_data_detection', description: 'date + side + quantity + price 컬럼으로 거래내역 판별' },
  'detect.market_indicator.value': { skillId: '01_data_detection', description: 'date + value/price 컬럼으로 시장 지표 판별' },
  'detect.unknown.fallback': { skillId: '01_data_detection', description: '지원 규칙 미충족 시 기본 프로파일링으로 전환' },
  'metric.price.max_drawdown': { skillId: '02_metric_rules', description: 'total_return, volatility, max_drawdown, trend_label 계산' },
  'metric.portfolio.top_weight': { skillId: '02_metric_rules', description: '총 비중, Top1 비중, 집중도 계산' },
  'metric.transaction.buy_sell_ratio': { skillId: '02_metric_rules', description: '매수/매도 금액과 비율 계산' },
  'metric.market_indicator.period_change': { skillId: '02_metric_rules', description: '시장 지표 최신값과 기간 변화율 계산' },
  'metric.unknown.row_count': { skillId: '02_metric_rules', description: '지원되지 않는 데이터의 행 수와 컬럼 프로파일링' },
  'chart.price.dual_axis_drawdown': { skillId: '03_chart_selection', description: 'Close/Return dual-axis 라인 차트와 drawdown mini visual 선택' },
  'chart.portfolio.allocation_bar_gauge': { skillId: '03_chart_selection', description: '자산별 비중 막대 차트와 concentration gauge 선택' },
  'chart.transaction.buy_sell_bar_meter': { skillId: '03_chart_selection', description: '매수/매도 금액 bar와 flow meter 선택' },
  'chart.market_indicator.sparkline': { skillId: '03_chart_selection', description: '시장 지표 추세 라인 선택' },
  'chart.unknown.table_preview': { skillId: '03_chart_selection', description: '지원되지 않는 데이터는 테이블 미리보기 중심으로 표시' },
  'insight.risk.drawdown_warning': { skillId: '04_insight_generation', description: 'max_drawdown이 -10% 이하일 때 위험 관리 문장 생성' },
  'insight.risk.drawdown_limited': { skillId: '04_insight_generation', description: 'max_drawdown이 제한적일 때 중립 위험 문장 생성' },
  'insight.portfolio.concentration_high': { skillId: '04_insight_generation', description: 'Top1 비중 30% 이상이면 집중도 경고 생성' },
  'insight.portfolio.concentration_normal': { skillId: '04_insight_generation', description: 'Top1 비중이 낮으면 분산 상태 문장 생성' },
  'insight.transaction.overtrade_watch': { skillId: '04_insight_generation', description: '거래 횟수 과다 시 과매매 점검 문장 생성' },
  'insight.transaction.activity_normal': { skillId: '04_insight_generation', description: '거래 횟수 보통이면 활동 정상 문장 생성' },
  'insight.market_indicator.trend': { skillId: '04_insight_generation', description: '시장 지표 변화 방향 요약 문장 생성' },
  'insight.unknown.safe_summary': { skillId: '04_insight_generation', description: '지원되지 않는 구조는 안전한 기본 요약만 생성' },
  'layout.dashboard.evidence_first': { skillId: '05_report_layout', description: 'KPI, 차트, 리포트 요약, Skills 실행 근거, 데이터 미리보기 순서 배치' },
};

const has = (cols: string[], names: string[]) => names.find(n => cols.includes(n));
const match = (cols: string[], canonical: keyof typeof COLUMN_ALIASES) => has(cols, COLUMN_ALIASES[canonical]);
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

const normalizeColumn = (v: string) => v.toLowerCase().trim().replace(/\s+/g, '').replace(/[()（）]/g, '');
const normalizeSide = (v: string) => {
  const s = String(v ?? '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('sell') || s.includes('매도') || s === 's') return 'sell';
  if (s.includes('buy') || s.includes('매수') || s === 'b') return 'buy';
  return s;
};

const num = (v: string | number | undefined) => {
  if (typeof v === 'number') return v;
  const cleaned = String(v ?? '0').replace(/,/g, '').replace('%', '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

function numericWarning(rows: Row[], columns: string[]) {
  const warnings: string[] = [];
  columns.filter(Boolean).forEach(col => {
    const bad = rows.findIndex(r => {
      const raw = r[col];
      if (raw === undefined || String(raw).trim() === '') return false;
      return !Number.isFinite(Number(String(raw).replace(/,/g, '').replace('%', '').trim()));
    });
    if (bad >= 0) warnings.push(`숫자 변환 경고: ${col} 컬럼 ${bad + 1}번째 행 값이 숫자로 해석되지 않았습니다.`);
  });
  return warnings;
}

function columnMapping(detection: Detection): ColumnMapping[] {
  const labels: Record<string, string> = {
    date: '날짜/시간', close: '가격/값', value: '지표값', ticker: '종목/자산', weight: '비중', side: '매매 방향', quantity: '수량', price: '체결가',
  };
  return Object.entries(detection.mapped).map(([canonical, source]) => ({ canonical, source, label: labels[canonical] ?? canonical }));
}

export function validateRows(rows: Row[], detection: Detection): ValidationResult {
  const detectedColumns = Object.keys(rows[0] ?? {});
  const recommendations = [
    'price_timeseries: date/일자 + close/종가 + open/high/low/volume 중 하나',
    'portfolio_allocation: ticker/종목코드 + weight/평가비중',
    'transaction_log: date/일자 + side/매매 + quantity/수량 + price/체결가',
  ];
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!rows.length) errors.push('빈 CSV입니다. 헤더와 최소 1개 데이터 행이 필요합니다.');
  if (rows.length && !detectedColumns.length) errors.push('컬럼 헤더를 감지하지 못했습니다. 첫 줄에 컬럼명을 넣어주세요.');
  if (detection.dataType === 'unknown') warnings.push(`추천 컬럼 안내: 감지된 컬럼(${detectedColumns.join(', ') || '없음'})이 지원 규칙과 충분히 일치하지 않습니다.`);
  const numericCols = [detection.mapped.close, detection.mapped.value, detection.mapped.weight, detection.mapped.quantity, detection.mapped.price].filter(Boolean);
  warnings.push(...numericWarning(rows, numericCols));
  return { errors, warnings, recommendations, detectedColumns };
}

function buildReportSections(analysis: Omit<Analysis, 'reportSections'>): ReportSection[] {
  const firstKpi = analysis.kpis[0];
  const riskDetail = analysis.riskVisual.kind === 'none'
    ? analysis.riskVisual.helper
    : `${analysis.riskVisual.label}: ${analysis.riskVisual.helper}`;
  const contractCount = buildRuleContract(analysis.trace).matched.length;
  return [
    { title: '핵심 요약', value: firstKpi?.value ?? `${analysis.series.length} rows`, detail: analysis.insights[0] ?? '입력 데이터 기반 요약을 생성했습니다.', tone: firstKpi?.tone ?? 'neutral' },
    { title: '위험 포인트', value: analysis.riskVisual.kind === 'none' ? 'N/A' : analysis.riskVisual.label, detail: riskDetail, tone: analysis.riskVisual.kind === 'none' ? 'neutral' : 'warn' },
    { title: '생성된 화면', value: `${analysis.trace.length}단계`, detail: 'KPI, 차트, 위험 시각화, 근거 타임라인, 데이터 미리보기로 자동 구성', tone: 'good' },
    { title: 'Skills 계약', value: `${contractCount}/${analysis.trace.length} matched`, detail: '화면 trace rule id가 Implemented demo rules catalog와 일치', tone: contractCount === analysis.trace.length ? 'good' : 'warn' },
  ];
}

function withDerived(base: Omit<Analysis, 'reportSections' | 'columnMapping' | 'warnings' | 'recommendations'>, extraWarnings: string[] = []): Analysis {
  const validation = validateRows(base.series?.length ? [] : [], base.detection);
  const numericWarnings = validateRowsForDetection(base.detection, base.series, extraWarnings);
  const partial = { ...base, columnMapping: columnMapping(base.detection), warnings: numericWarnings, recommendations: validation.recommendations } as Omit<Analysis, 'reportSections'>;
  return { ...partial, reportSections: buildReportSections(partial) };
}

function validateRowsForDetection(detection: Detection, rowsOrSeries: any[], extraWarnings: string[]) {
  // Analyzer functions pass original-row numeric diagnostics through extraWarnings.
  const warnings = [...extraWarnings];
  if (detection.dataType === 'unknown') warnings.push('추천 컬럼 안내: date/close, ticker/weight, side/quantity/price 중 하나의 구조로 업로드하면 자동 대시보드가 생성됩니다.');
  return warnings;
}

function baseTrace(detection: Detection): TraceStep {
  const ruleMap: Record<string, string> = {
    price_timeseries: 'detect.price_timeseries.ohlcv',
    portfolio_allocation: 'detect.portfolio.weight',
    transaction_log: 'detect.transaction.execution',
    market_indicator: 'detect.market_indicator.value',
    unknown: 'detect.unknown.fallback',
  };
  return {
    step: '01',
    skillId: '01_data_detection',
    ruleId: ruleMap[detection.dataType] ?? 'detect.unknown.fallback',
    label: '데이터 유형 판별',
    evidence: detection.reasons,
    output: `${detection.dataType} · confidence ${Math.round(detection.confidence * 100)}%`,
  };
}

function layoutTrace(sections: string): TraceStep {
  return {
    step: '05',
    skillId: '05_report_layout',
    ruleId: 'layout.dashboard.evidence_first',
    label: '리포트 레이아웃 배치',
    evidence: ['KPI, 차트, generated report summary, 위험 요약, Skills 실행 근거, 데이터 미리보기 순서로 배치'],
    output: sections,
  };
}

export function buildRuleContract(trace: TraceStep[]): RuleContract {
  const items = trace.map(step => {
    const catalog = IMPLEMENTED_RULE_CATALOG[step.ruleId];
    return {
      ruleId: step.ruleId,
      skillId: step.skillId,
      status: catalog ? 'matched' as const : 'unmatched' as const,
      description: catalog?.description ?? 'Implemented demo rules catalog에 없음',
    };
  });
  return { matched: items.filter(i => i.status === 'matched'), unmatched: items.filter(i => i.status === 'unmatched') };
}

export function detect(rows: Row[]): Detection {
  const cols = Object.keys(rows[0] ?? {}).map(normalizeColumn);
  const original = Object.keys(rows[0] ?? {});
  const normalizedToOriginal = (name?: string) => {
    if (!name) return undefined;
    const idx = cols.indexOf(name);
    return idx >= 0 ? original[idx] : name;
  };
  const date = match(cols, 'date');
  const close = match(cols, 'close');
  const open = match(cols, 'open');
  const high = match(cols, 'high');
  const low = match(cols, 'low');
  const volume = match(cols, 'volume');
  const weight = match(cols, 'weight');
  const ticker = match(cols, 'ticker');
  const side = match(cols, 'side');
  const quantity = match(cols, 'quantity');

  if (date && close && (open || high || low || volume)) {
    return { dataType: 'price_timeseries', confidence: 0.92, reasons: ['date/일자 컬럼 존재', `${normalizedToOriginal(close)} 컬럼 존재`, 'OHLCV/거래량 보조 컬럼 존재'], mapped: { date: normalizedToOriginal(date)!, close: normalizedToOriginal(close)! } };
  }
  if (ticker && weight) {
    return { dataType: 'portfolio_allocation', confidence: 0.9, reasons: ['자산 식별 컬럼 존재', '비중/평가비중 컬럼 존재'], mapped: { ticker: normalizedToOriginal(ticker)!, weight: normalizedToOriginal(weight)! } };
  }
  if (date && side && quantity && close) {
    return { dataType: 'transaction_log', confidence: 0.88, reasons: ['date/side/quantity/price 구조 감지', '한글 매수/매도 alias 지원'], mapped: { date: normalizedToOriginal(date)!, side: normalizedToOriginal(side)!, quantity: normalizedToOriginal(quantity)!, price: normalizedToOriginal(close)! } };
  }
  if (date && close) {
    return { dataType: 'market_indicator', confidence: 0.65, reasons: ['날짜와 숫자 값 컬럼 존재'], mapped: { date: normalizedToOriginal(date)!, value: normalizedToOriginal(close)! } };
  }
  return { dataType: 'unknown', confidence: 0.3, reasons: ['지원 규칙과 충분히 일치하지 않음'], mapped: {} };
}

export function analyze(rows: Row[]): Analysis {
  const detection = detect(rows);
  const validation = validateRows(rows, detection);
  if (detection.dataType === 'price_timeseries') return analyzePrice(rows, detection, validation.warnings);
  if (detection.dataType === 'portfolio_allocation') return analyzePortfolio(rows, detection, validation.warnings);
  if (detection.dataType === 'transaction_log') return analyzeTransactions(rows, detection, validation.warnings);
  if (detection.dataType === 'market_indicator') return analyzeMarketIndicator(rows, detection, validation.warnings);
  return withDerived({
    detection,
    kpis: [{ label: '행 수', value: String(rows.length) }],
    insights: ['지원되지 않는 구조이므로 기본 프로파일링만 수행했습니다.'],
    chartReason: 'unknown 데이터는 기본 테이블 요약만 표시합니다.',
    series: rows,
    trace: [
      baseTrace(detection),
      { step: '02', skillId: '02_metric_rules', ruleId: 'metric.unknown.row_count', label: '기본 프로파일링', evidence: [`${rows.length} rows`], output: `행 수 ${rows.length}` },
      { step: '03', skillId: '03_chart_selection', ruleId: 'chart.unknown.table_preview', label: '차트 대체', evidence: ['지원 데이터 유형과 불일치'], output: '테이블 미리보기 우선' },
      { step: '04', skillId: '04_insight_generation', ruleId: 'insight.unknown.safe_summary', label: '안전 인사이트', evidence: ['투자 권유 금지 원칙 적용'], output: '기본 요약만 생성' },
      layoutTrace('fallback profile layout'),
    ],
    riskVisual: { kind: 'none', label: '지원 대기', helper: '지원되지 않는 구조는 위험 시각화를 생략합니다.' },
  }, validation.warnings);
}

function analyzePrice(rows: Row[], detection: Detection, warnings: string[]): Analysis {
  const d = detection.mapped.date;
  const c = detection.mapped.close;
  const sorted = [...rows].sort((a, b) => String(a[d]).localeCompare(String(b[d])));
  const prices = sorted.map(r => num(r[c])).filter(Number.isFinite);
  const first = prices[0] || 1;
  const last = prices[prices.length - 1] || first;
  const returns = prices.slice(1).map((p, i) => p / prices[i] - 1);
  const totalReturn = last / first - 1;
  const avg = returns.reduce((a, b) => a + b, 0) / Math.max(returns.length, 1);
  const vol = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / Math.max(returns.length, 1)) * Math.sqrt(252);
  let peak = first, mdd = 0;
  const series = sorted.map((r) => {
    const close = num(r[c]);
    peak = Math.max(peak, close);
    const drawdown = close / peak - 1;
    mdd = Math.min(mdd, drawdown);
    return { date: r[d], close, cumulativeReturn: close / first - 1, drawdown, drawdownPct: drawdown * 100 };
  });
  const trend = totalReturn >= 0 ? '상승 관찰' : '약세 관찰';
  const kpis: Kpi[] = [
    { label: '총 수익률', value: pct(totalReturn), tone: totalReturn >= 0 ? 'good' : 'bad' },
    { label: '연환산 변동성', value: pct(vol), tone: vol >= 0.3 ? 'warn' : 'neutral' },
    { label: '최대 낙폭', value: pct(mdd), tone: mdd <= -0.1 ? 'bad' : 'neutral' },
    { label: '추세', value: trend, tone: totalReturn >= 0 ? 'good' : 'warn' }
  ];
  const insights = [
    totalReturn >= 0 ? '분석 기간 동안 가격 상승 흐름이 관찰됩니다.' : '분석 기간 동안 가격 약세 흐름이 관찰됩니다.',
    mdd <= -0.1 ? '최대 낙폭이 10%를 초과하여 위험 관리가 필요한 구간이 존재합니다.' : '분석 기간 내 최대 낙폭은 제한적인 수준입니다.',
    vol >= 0.3 ? '연환산 변동성이 높은 편이므로 가격 변동 위험이 큽니다.' : '연환산 변동성은 과도하지 않은 수준입니다.',
    '본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다.'
  ];
  return withDerived({
    detection,
    kpis,
    insights,
    chartReason: 'date와 close 컬럼이 존재하여 가격 추세와 누적 수익률 라인 차트를 생성했습니다.',
    series,
    riskVisual: { kind: 'drawdown', label: 'Max drawdown', value: mdd, helper: `${pct(mdd)}까지 하락한 구간을 별도 위험 스트립으로 표시` },
    trace: [
      baseTrace(detection),
      { step: '02', skillId: '02_metric_rules', ruleId: 'metric.price.max_drawdown', label: '가격 KPI 계산', evidence: [`first=${first}`, `last=${last}`, `mdd=${pct(mdd)}`, `vol=${pct(vol)}`], output: `${kpis.length} KPIs 생성` },
      { step: '03', skillId: '03_chart_selection', ruleId: 'chart.price.dual_axis_drawdown', label: '가격 차트 선택', evidence: ['date + close 컬럼 매핑', 'drawdown series 계산'], output: 'Close/Return dual-axis + drawdown strip' },
      { step: '04', skillId: '04_insight_generation', ruleId: mdd <= -0.1 ? 'insight.risk.drawdown_warning' : 'insight.risk.drawdown_limited', label: '위험 인사이트 생성', evidence: [`max_drawdown=${pct(mdd)}`, `total_return=${pct(totalReturn)}`], output: `${insights.length} insights` },
      layoutTrace('KPI + generated report + dual-axis chart + drawdown risk strip + evidence timeline'),
    ],
  }, warnings);
}

function analyzePortfolio(rows: Row[], detection: Detection, warnings: string[]): Analysis {
  const t = detection.mapped.ticker;
  const w = detection.mapped.weight;
  const series = rows.map(r => {
    const raw = num(r[w]);
    const weight = raw > 1 ? raw / 100 : raw;
    return { name: r[t], weight };
  });
  const total = series.reduce((a, b) => a + b.weight, 0);
  const top = [...series].sort((a, b) => b.weight - a.weight)[0];
  const topWeight = top?.weight || 0;
  const kpis: Kpi[] = [
    { label: '자산 수', value: String(series.length) },
    { label: '총 비중', value: pct(total), tone: Math.abs(total - 1) > 0.05 ? 'warn' : 'good' },
    { label: 'Top1 비중', value: pct(topWeight), tone: topWeight >= 0.3 ? 'bad' : 'neutral' },
    { label: '집중도', value: topWeight >= 0.3 ? '높음' : '보통', tone: topWeight >= 0.3 ? 'warn' : 'good' }
  ];
  const insights = [
    `가장 큰 보유 자산은 ${top?.name ?? 'N/A'}이며 비중은 ${pct(topWeight)}입니다.`,
    topWeight >= 0.3 ? '단일 자산 비중이 30% 이상으로 포트폴리오 집중도가 높습니다.' : '단일 자산 집중도는 과도하지 않은 수준입니다.',
    '본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다.'
  ];
  return withDerived({
    detection,
    kpis,
    insights,
    chartReason: 'ticker와 weight 컬럼이 존재하여 자산별 비중 막대 차트를 생성했습니다.',
    series,
    riskVisual: { kind: 'concentration', label: 'Top1 concentration', value: topWeight, helper: `${top?.name ?? 'Top asset'} 비중 ${pct(topWeight)}` },
    trace: [
      baseTrace(detection),
      { step: '02', skillId: '02_metric_rules', ruleId: 'metric.portfolio.top_weight', label: '포트폴리오 KPI 계산', evidence: [`assets=${series.length}`, `total_weight=${pct(total)}`, `top1=${pct(topWeight)}`], output: `${kpis.length} KPIs 생성` },
      { step: '03', skillId: '03_chart_selection', ruleId: 'chart.portfolio.allocation_bar_gauge', label: '비중 차트 선택', evidence: ['asset + weight 컬럼 매핑', 'Top1 concentration 계산'], output: 'allocation bar + concentration gauge' },
      { step: '04', skillId: '04_insight_generation', ruleId: topWeight >= 0.3 ? 'insight.portfolio.concentration_high' : 'insight.portfolio.concentration_normal', label: '집중도 인사이트 생성', evidence: [`top1_weight=${pct(topWeight)}`], output: `${insights.length} insights` },
      layoutTrace('KPI + generated report + allocation chart + concentration gauge + evidence timeline'),
    ],
  }, warnings);
}

function analyzeTransactions(rows: Row[], detection: Detection, warnings: string[]): Analysis {
  const side = detection.mapped.side;
  const q = detection.mapped.quantity;
  const p = detection.mapped.price;
  let buy = 0, sell = 0;
  rows.forEach(r => {
    const amount = num(r[q]) * num(r[p]);
    normalizeSide(r[side]) === 'sell' ? sell += amount : buy += amount;
  });
  const ratio = buy / Math.max(sell, 1);
  const kpis: Kpi[] = [
    { label: '거래 수', value: String(rows.length) },
    { label: '매수 금액', value: buy.toFixed(0) },
    { label: '매도 금액', value: sell.toFixed(0) },
    { label: '거래 상태', value: rows.length >= 20 ? '과다 점검' : '보통', tone: rows.length >= 20 ? 'warn' : 'neutral' }
  ];
  const insights = [
    `총 매수 금액은 ${buy.toFixed(0)}, 총 매도 금액은 ${sell.toFixed(0)}입니다.`,
    rows.length >= 20 ? '거래 횟수가 많아 과매매 여부를 점검할 필요가 있습니다.' : '거래 횟수는 샘플 기준 과도하지 않습니다.',
    '본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다.'
  ];
  return withDerived({
    detection,
    kpis,
    insights,
    chartReason: 'side, quantity, price 컬럼이 존재하여 매수/매도 금액 비교 차트를 생성했습니다.',
    series: [{ name: 'buy', amount: buy }, { name: 'sell', amount: sell }],
    riskVisual: { kind: 'buy_sell', label: 'Buy/Sell flow', buy, sell, ratio, helper: `매수/매도 금액 비율 ${ratio.toFixed(2)}x` },
    trace: [
      baseTrace(detection),
      { step: '02', skillId: '02_metric_rules', ruleId: 'metric.transaction.buy_sell_ratio', label: '거래 KPI 계산', evidence: [`buy=${buy.toFixed(0)}`, `sell=${sell.toFixed(0)}`, `ratio=${ratio.toFixed(2)}x`], output: `${kpis.length} KPIs 생성` },
      { step: '03', skillId: '03_chart_selection', ruleId: 'chart.transaction.buy_sell_bar_meter', label: '거래 차트 선택', evidence: ['side + quantity + price 컬럼 매핑', 'buy/sell amount 집계'], output: 'buy/sell bar + flow meter' },
      { step: '04', skillId: '04_insight_generation', ruleId: rows.length >= 20 ? 'insight.transaction.overtrade_watch' : 'insight.transaction.activity_normal', label: '거래 인사이트 생성', evidence: [`trade_count=${rows.length}`, `buy_sell_ratio=${ratio.toFixed(2)}x`], output: `${insights.length} insights` },
      layoutTrace('KPI + generated report + buy/sell chart + flow meter + evidence timeline'),
    ],
  }, warnings);
}

function analyzeMarketIndicator(rows: Row[], detection: Detection, warnings: string[]): Analysis {
  const d = detection.mapped.date;
  const v = detection.mapped.value;
  const sorted = [...rows].sort((a, b) => String(a[d]).localeCompare(String(b[d])));
  const values = sorted.map(r => num(r[v]));
  const first = values[0] || 1;
  const last = values[values.length - 1] || first;
  const change = last / first - 1;
  const series = sorted.map(r => ({ date: r[d], close: num(r[v]), cumulativeReturn: num(r[v]) / first - 1 }));
  const kpis: Kpi[] = [
    { label: '최근 값', value: last.toFixed(2), tone: 'neutral' },
    { label: '기간 변화', value: pct(change), tone: change >= 0 ? 'good' : 'warn' },
    { label: '관측 수', value: String(rows.length), tone: 'neutral' },
    { label: '추세', value: change >= 0 ? '상승' : '하락', tone: change >= 0 ? 'good' : 'warn' },
  ];
  const insights = [
    `시장 지표는 기간 초 대비 ${pct(change)} 변화했습니다.`,
    change >= 0 ? '지표 방향은 상승으로 관찰됩니다.' : '지표 방향은 하락으로 관찰됩니다.',
    '본 결과는 투자 권유가 아니라 입력 데이터 기반 요약입니다.'
  ];
  return withDerived({
    detection,
    kpis,
    insights,
    chartReason: 'date와 value/price 컬럼이 존재하여 시장 지표 추세 라인을 생성했습니다.',
    series,
    riskVisual: { kind: 'none', label: '시장 지표', helper: `기간 변화율 ${pct(change)}를 보조 지표로 표시합니다.` },
    trace: [
      baseTrace(detection),
      { step: '02', skillId: '02_metric_rules', ruleId: 'metric.market_indicator.period_change', label: '시장 지표 KPI 계산', evidence: [`first=${first}`, `last=${last}`, `change=${pct(change)}`], output: `${kpis.length} KPIs 생성` },
      { step: '03', skillId: '03_chart_selection', ruleId: 'chart.market_indicator.sparkline', label: '지표 차트 선택', evidence: ['date + value 컬럼 매핑'], output: 'indicator trend line' },
      { step: '04', skillId: '04_insight_generation', ruleId: 'insight.market_indicator.trend', label: '지표 인사이트 생성', evidence: [`period_change=${pct(change)}`], output: `${insights.length} insights` },
      layoutTrace('KPI + generated report + indicator line + evidence timeline'),
    ],
  }, warnings);
}
