import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyze, Analysis, buildRuleContract, Row, RiskVisual, validateRows } from './lib/analysis';

const samples = [
  ['주가 시계열', '/samples/price_timeseries.csv', '가격 추세와 누적 수익률'],
  ['포트폴리오 비중', '/samples/portfolio_allocation.csv', '자산별 집중도와 비중'],
  ['거래내역', '/samples/transaction_log.csv', '매수·매도 규모와 빈도'],
] as const;

type ParseState = {
  errors: string[];
  warnings: string[];
  detectedColumns: string[];
  recommendations: string[];
};

const emptyParseState: ParseState = { errors: [], warnings: [], detectedColumns: [], recommendations: [] };

const skillNames: Record<string, string> = {
  '01_data_detection': 'Detect',
  '02_metric_rules': 'Metric',
  '03_chart_selection': 'Chart',
  '04_insight_generation': 'Insight',
  '05_report_layout': 'Layout',
};

async function loadCsv(url: string): Promise<{ rows: Row[]; state: ParseState }> {
  const text = await fetch(url).then(r => r.text());
  return parseCsv(text);
}

function parseCsv(text: string): { rows: Row[]; state: ParseState } {
  if (!text.trim()) {
    return {
      rows: [],
      state: {
        errors: ['빈 CSV입니다. 헤더와 최소 1개 데이터 행이 필요합니다.'],
        warnings: [],
        detectedColumns: [],
        recommendations: validateRows([], analyze([]).detection).recommendations,
      },
    };
  }
  const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data.filter(row => Object.values(row).some(v => String(v ?? '').trim() !== ''));
  const parserErrors = parsed.errors.map(err => `CSV parse error: ${err.message}${err.row !== undefined ? ` (row ${err.row})` : ''}`);
  const analysis = analyze(rows);
  const validation = validateRows(rows, analysis.detection);
  return {
    rows,
    state: {
      errors: [...parserErrors, ...validation.errors],
      warnings: [...validation.warnings, ...analysis.warnings],
      detectedColumns: validation.detectedColumns,
      recommendations: validation.recommendations,
    },
  };
}

function detectionLabel(type?: string) {
  if (type === 'price_timeseries') return '주가 시계열';
  if (type === 'portfolio_allocation') return '포트폴리오 비중';
  if (type === 'transaction_log') return '거래내역';
  if (type === 'market_indicator') return '시장 지표';
  return 'Unsupported';
}

function toneLabel(tone?: string) {
  if (tone === 'good') return 'positive';
  if (tone === 'bad') return 'negative';
  if (tone === 'warn') return 'watch';
  return 'neutral';
}

function focusMode(query: string) {
  const q = query.toLowerCase();
  if (q.includes('위험') || q.includes('risk') || q.includes('낙폭')) return '위험 우선';
  if (q.includes('수익') || q.includes('성과') || q.includes('return')) return '성과 우선';
  if (q.includes('요약') || q.includes('summary')) return '요약 우선';
  return '균형 분석';
}

function formatTime(date?: Date | null) {
  if (!date) return '대기 중';
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
}

function RiskVisualPanel({ risk, series }: { risk: RiskVisual; series: any[] }) {
  if (risk.kind === 'drawdown') {
    return (
      <div className="risk-visual">
        <div className="risk-head">
          <span>{risk.label}</span>
          <strong>{(risk.value * 100).toFixed(2)}%</strong>
        </div>
        <ResponsiveContainer width="100%" height={92}>
          <AreaChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 1', 0]} />
            <XAxis hide dataKey="date" />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} labelStyle={{ color: '#111' }} />
            <Area type="monotone" dataKey="drawdownPct" stroke="#ef4444" fill="url(#drawdownFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <p>{risk.helper}</p>
      </div>
    );
  }

  if (risk.kind === 'concentration') {
    const pctValue = Math.min(100, Math.max(0, risk.value * 100));
    return (
      <div className="risk-visual gauge-visual">
        <div className="risk-head">
          <span>{risk.label}</span>
          <strong>{pctValue.toFixed(1)}%</strong>
        </div>
        <div className="gauge-track"><span style={{ width: `${pctValue}%` }} /></div>
        <div className="gauge-scale"><span>0%</span><span>30% watch</span><span>100%</span></div>
        <p>{risk.helper}</p>
      </div>
    );
  }

  if (risk.kind === 'buy_sell') {
    const total = Math.max(risk.buy + risk.sell, 1);
    const buyPct = (risk.buy / total) * 100;
    const sellPct = (risk.sell / total) * 100;
    return (
      <div className="risk-visual flow-visual">
        <div className="risk-head">
          <span>{risk.label}</span>
          <strong>{risk.ratio.toFixed(2)}x</strong>
        </div>
        <div className="flow-stack">
          <span className="buy" style={{ width: `${buyPct}%` }}>Buy {buyPct.toFixed(0)}%</span>
          <span className="sell" style={{ width: `${sellPct}%` }}>Sell {sellPct.toFixed(0)}%</span>
        </div>
        <p>{risk.helper}</p>
      </div>
    );
  }

  return <div className="risk-visual"><p>{risk.helper}</p></div>;
}

function ExecutionSummary({ analysis, rows }: { analysis: Analysis; rows: Row[] }) {
  const contract = buildRuleContract(analysis.trace);
  return (
    <section className="execution-summary" aria-label="generated report summary">
      <article className="summary-lead">
        <p className="section-kicker">Generated report summary</p>
        <h2>{detectionLabel(analysis.detection.dataType)} 리포트가 자동 생성됐습니다.</h2>
        <p>{rows.length.toLocaleString()}개 행에서 {analysis.kpis.length}개 KPI, {analysis.trace.length}단계 Skills trace, {analysis.reportSections.length}개 리포트 섹션을 구성했습니다.</p>
      </article>
      <div className="summary-cards">
        {analysis.reportSections.map(section => (
          <article className={`summary-card ${toneLabel(section.tone)}`} key={section.title}>
            <span>{section.title}</span>
            <strong>{section.value}</strong>
            <p>{section.detail}</p>
          </article>
        ))}
      </div>
      <div className="contract-strip" aria-label="trace skills contract badge">
        <span className={contract.unmatched.length ? 'contract-badge warn' : 'contract-badge matched'}>
          {contract.unmatched.length ? 'contract review needed' : 'Trace ↔ Skills contract matched'}
        </span>
        <small>{contract.matched.length}/{analysis.trace.length} rule ids matched with Implemented demo rules</small>
      </div>
    </section>
  );
}

function DiagnosticsPanel({ parseState, analysis }: { parseState: ParseState; analysis: Analysis | null }) {
  const warnings = [...parseState.warnings, ...(analysis?.warnings ?? [])].filter((v, i, arr) => arr.indexOf(v) === i);
  const unsupported = analysis?.detection.dataType === 'unknown';
  if (!parseState.errors.length && !warnings.length && !unsupported) return null;
  return (
    <section className={parseState.errors.length || unsupported ? 'diagnostic-panel error' : 'diagnostic-panel'} aria-label="csv diagnostics">
      <div>
        <p className="section-kicker">CSV readiness</p>
        <h2>{parseState.errors.length ? 'CSV를 다시 확인해주세요.' : unsupported ? '지원되지 않는 구조입니다.' : '데이터 품질 경고'}</h2>
      </div>
      {parseState.errors.length > 0 && <ul>{parseState.errors.map(item => <li key={item}>{item}</li>)}</ul>}
      {warnings.length > 0 && <ul>{warnings.map(item => <li key={item}>{item}</li>)}</ul>}
      <div className="diagnostic-grid">
        <div><strong>감지된 컬럼</strong><p>{parseState.detectedColumns.join(', ') || '없음'}</p></div>
        <div><strong>추천 매핑</strong><p>{parseState.recommendations.join(' · ')}</p></div>
      </div>
    </section>
  );
}

export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [parseState, setParseState] = useState<ParseState>(emptyParseState);
  const [activeSample, setActiveSample] = useState('/samples/price_timeseries.csv');
  const [query, setQuery] = useState('수익률과 위험을 한 화면에서 요약해줘');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);
  const [lastPrompt, setLastPrompt] = useState('초기 샘플 자동 분석');
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    loadCsv('/samples/price_timeseries.csv').then(({ rows, state }) => {
      setRows(rows);
      setParseState(state);
    });
  }, []);

  useEffect(() => {
    if (rows.length) {
      const next = analyze(rows);
      setAnalysis(next);
      const validation = validateRows(rows, next.detection);
      setParseState(state => ({
        ...state,
        warnings: [...state.warnings, ...next.warnings, ...validation.warnings].filter((v, i, arr) => arr.indexOf(v) === i),
        detectedColumns: validation.detectedColumns,
        recommendations: validation.recommendations,
      }));
      setLastRunAt(new Date());
      setRunCount(count => count + 1);
    } else {
      setAnalysis(null);
    }
  }, [rows]);

  const runAnalysis = () => {
    if (!rows.length || isRunning) return;
    setIsRunning(true);
    window.setTimeout(() => {
      setAnalysis(analyze(rows));
      setLastPrompt(query.trim() || '기본 균형 분석');
      setLastRunAt(new Date());
      setRunCount(count => count + 1);
      setIsRunning(false);
    }, 380);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed.rows);
    setParseState(parsed.state);
    setActiveSample('uploaded');
    setLastPrompt(`${file.name} 업로드 분석`);
  };

  const columns = useMemo(() => Object.keys(rows[0] ?? {}).slice(0, 6), [rows]);
  const previewRows = rows.slice(0, 5);
  const confidence = analysis ? Math.round(analysis.detection.confidence * 100) : 0;
  const mode = focusMode(query);
  const contract = analysis ? buildRuleContract(analysis.trace) : null;
  const chartSeries = useMemo(
    () => analysis?.series.map(point => ({
      ...point,
      cumulativeReturnPct: typeof point.cumulativeReturn === 'number' ? point.cumulativeReturn * 100 : point.cumulativeReturn,
    })) ?? [],
    [analysis]
  );
  const heroKpi = analysis?.reportSections[0] ?? null;
  const riskKpi = analysis?.reportSections.find(section => section.title === '위험 포인트') ?? null;
  const contractScore = contract && analysis ? `${contract.matched.length}/${analysis.trace.length}` : '—';

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">IS</div>
          <div>
            <strong>InvestSkill Lens</strong>
            <span>Skills.md powered investment dashboard</span>
          </div>
        </div>
        <nav className="nav-pills" aria-label="dashboard sections">
          <a href="#overview">Overview</a>
          <a href="#summary">Report</a>
          <a href="#chart">Chart</a>
          <a href="#skills">Skills</a>
        </nav>
        <div className="topbar-actions" aria-label="getdesign inspired compact actions">
          <span className="star-pill">Rule score {contractScore}</span>
          <a className="topbar-cta" href="#skills">Open Skills.md</a>
        </div>
      </header>

      <section className="hero-card" id="overview">
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="trust-ribbon" aria-label="submission proof badges">
              <span>Judge-ready</span>
              <span>Browser only</span>
              <span>Skills contract {contractScore}</span>
            </div>
            <p className="eyebrow">Premium Skills execution dashboard</p>
            <h1>투자 CSV가 바로 심사용 리포트 화면으로 변환됩니다.</h1>
            <p className="hero-desc">
              데이터 판별, KPI 계산, 차트 선택, 위험 인사이트, 리포트 배치를 Skills.md 실행 근거와 함께 한 화면에서 증명합니다.
            </p>
          </div>

          <aside className="hero-visual" aria-label="premium dashboard preview">
            <div className="evidence-orbit"><span /> <span /> <span /></div>
            <div className="hero-visual-card primary">
              <small>Generated report</small>
              <strong>{heroKpi?.value ?? 'Ready'}</strong>
              <p>{heroKpi?.detail ?? '샘플 CSV를 자동 분석해 리포트 섹션을 구성합니다.'}</p>
            </div>
            <div className="design-proof-grid">
              <div><span>Contract</span><strong>{contractScore}</strong></div>
              <div><span>Trace</span><strong>{analysis?.trace.length ?? 0} steps</strong></div>
              <div><span>Risk</span><strong>{riskKpi?.value ?? '—'}</strong></div>
            </div>
            <div className="quick-stats-panel" aria-label="getdesign quick stats">
              <p className="terminal-kicker">▸ Quick Stats</p>
              <dl>
                <div><dt>Rows</dt><dd>{rows.length.toLocaleString()}</dd></div>
                <div><dt>Detected</dt><dd>{analysis ? detectionLabel(analysis.detection.dataType) : 'Ready'}</dd></div>
                <div><dt>Confidence</dt><dd>{confidence}%</dd></div>
                <div><dt>Updated</dt><dd>{formatTime(lastRunAt)}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        <div className="hero-command" aria-label="analysis command bar">
          <span className={isRunning ? 'command-dot running' : 'command-dot'} />
          <label className="command-label" htmlFor="analysisPrompt">Ask</label>
          <input id="analysisPrompt" value={query} onChange={e => setQuery(e.target.value)} aria-label="analysis prompt" />
          <button onClick={runAnalysis} disabled={isRunning || !rows.length}>{isRunning ? 'Running…' : 'Analyze'}</button>
        </div>
        <div className="run-strip" aria-label="analysis run state">
          <span>mode <strong>{mode}</strong></span>
          <span>runs <strong>{runCount}</strong></span>
          <span>last <strong>{formatTime(lastRunAt)}</strong></span>
          <span>contract <strong>{contract ? `${contract.matched.length}/${analysis?.trace.length ?? 0}` : '대기'}</strong></span>
          <span className="last-prompt">prompt <strong>{lastPrompt}</strong></span>
        </div>
        {analysis && (
          <div className="mobile-proof-strip" aria-label="mobile first screen proof">
            <strong>Generated report ready</strong>
            <span>Skills contract {contract?.matched.length ?? 0}/{analysis.trace.length} matched</span>
            <span>Quick Stats · {rows.length.toLocaleString()} rows · confidence {confidence}%</span>
          </div>
        )}
        <div className="hero-disclaimer" aria-label="investment disclaimer quick note">
          투자 참고용 자동 리포트이며, 매수·매도 추천이나 수익 보장을 의미하지 않습니다.
        </div>
        <div className="sample-row" aria-label="sample datasets">
          {samples.map(([label, url, desc]) => (
            <button
              key={url}
              className={activeSample === url ? 'sample-chip active' : 'sample-chip'}
              onClick={() => {
                setActiveSample(url);
                setLastPrompt(`${label} 샘플 자동 분석`);
                loadCsv(url).then(({ rows, state }) => {
                  setRows(rows);
                  setParseState(state);
                });
              }}
              title={desc}
            >
              {label}
            </button>
          ))}
          <label className={activeSample === 'uploaded' ? 'sample-chip upload active' : 'sample-chip upload'}>
            CSV 업로드
            <input type="file" accept=".csv" onChange={e => onFile(e.target.files?.[0])} />
          </label>
        </div>
      </section>

      <section className="getdesign-reference-strip" aria-label="skills systems inspired from">
        <span>SKILLS SYSTEMS INSPIRED FROM:</span>
        {['CSV Detect', 'Metric Rules', 'Chart Choice', 'Risk Insight', 'Report Layout', 'Trace Contract'].map(item => (
          <a href="#skills" key={item}>{item}</a>
        ))}
      </section>

      <DiagnosticsPanel parseState={parseState} analysis={analysis} />

      {analysis && (
        <>
          <ExecutionSummary analysis={analysis} rows={rows} />

          <section className="metric-grid" aria-label="summary metrics">
            <article className="metric-card dark-card">
              <span>Detected data</span>
              <strong>{detectionLabel(analysis.detection.dataType)}</strong>
              <small>{rows.length.toLocaleString()} rows · confidence {confidence}%</small>
              <i className="metric-spark" aria-hidden="true" />
            </article>
            {analysis.kpis.map(k => (
              <article className={`metric-card ${toneLabel(k.tone)}`} key={k.label}>
                <span>{k.label}</span>
                <strong>{k.value}</strong>
                <small>{toneLabel(k.tone)}</small>
                <i className="metric-spark" aria-hidden="true" />
              </article>
            ))}
          </section>

          <section className="workspace-grid">
            <article className="panel chart-panel" id="chart">
              <div className="panel-head">
                <div>
                  <p className="section-kicker">Auto visualization</p>
                  <h2>자동 생성 차트</h2>
                </div>
                <div className="period-pills" aria-label="analysis meta badges">
                  <span className="active">ALL</span>
                  <span>{mode}</span>
                  <span>{analysis.trace.length} rules</span>
                </div>
              </div>
              <p className="chart-reason">{analysis.chartReason}</p>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height={340}>
                  {analysis.detection.dataType === 'price_timeseries' || analysis.detection.dataType === 'market_indicator' ? (
                    <LineChart data={chartSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 11 }} />
                      <YAxis yAxisId="price" domain={['dataMin - 3', 'dataMax + 3']} tick={{ fill: '#737373', fontSize: 11 }} />
                      <YAxis yAxisId="return" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: '#737373', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e5e7eb' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#525252' }} />
                      <Line yAxisId="price" name={analysis.detection.dataType === 'market_indicator' ? 'Value' : 'Close'} dataKey="close" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                      <Line yAxisId="return" name="Return %" dataKey="cumulativeReturnPct" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={chartSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#737373', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e5e7eb' }} />
                      <Bar dataKey={analysis.detection.dataType === 'transaction_log' ? 'amount' : 'weight'} fill="#38bdf8" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <RiskVisualPanel risk={analysis.riskVisual} series={chartSeries} />
            </article>

            <aside className="panel insight-panel">
              <div className="panel-head compact">
                <div>
                  <p className="section-kicker">Rule-based insight</p>
                  <h2>핵심 판단</h2>
                </div>
                <span className="status-badge">실행 완료</span>
              </div>
              <ul className="insight-list">
                {analysis.insights.map((i, idx) => (
                  <li key={i}><span>{String(idx + 1).padStart(2, '0')}</span>{i}</li>
                ))}
              </ul>
              <div className="rule-card">
                <strong>컬럼 매핑</strong>
                {analysis.columnMapping.map(m => <p key={`${m.canonical}-${m.source}`}>• {m.label}: <code>{m.source}</code></p>)}
              </div>
              <div className="rule-card">
                <strong>판별 근거</strong>
                {analysis.detection.reasons.map(r => <p key={r}>• {r}</p>)}
              </div>
            </aside>
          </section>

          <section className="lower-grid" id="skills">
            <article className="panel report-panel" id="summary">
              <div className="panel-head">
                <div>
                  <p className="section-kicker">Generated report sections</p>
                  <h2>자동 리포트 구성</h2>
                </div>
                <span className="row-count">{analysis.reportSections.length} sections</span>
              </div>
              <div className="report-list">
                {analysis.reportSections.map(section => (
                  <div className="report-row" key={section.title}>
                    <span>{section.title}</span>
                    <strong>{section.value}</strong>
                    <p>{section.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel skill-flow">
              <div className="panel-head">
                <div>
                  <p className="section-kicker">Skills execution trace</p>
                  <h2>Skills.md 실행 근거</h2>
                </div>
                <span className="row-count">{analysis.trace.length} applied</span>
              </div>
              <div className="trace-timeline">
                {analysis.trace.map(item => {
                  const itemContract = contract?.matched.find(m => m.ruleId === item.ruleId);
                  return (
                    <div className="trace-item" key={`${item.step}-${item.ruleId}`}>
                      <div className="trace-index">{item.step}</div>
                      <div className="trace-body">
                        <div className="trace-title">
                          <span>{skillNames[item.skillId] ?? item.skillId}</span>
                          <code>{item.ruleId}</code>
                        </div>
                        <div className="trace-contract">
                          <span className={itemContract ? 'mini-contract matched' : 'mini-contract warn'}>{itemContract ? 'matched implemented rule' : 'unmatched'}</span>
                        </div>
                        <strong>{item.label}</strong>
                        <p>{item.evidence.join(' · ')}</p>
                        <small>{item.output}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="panel rule-ledger" aria-label="rule ledger table">
              <div className="panel-head">
                <div>
                  <p className="section-kicker"># Rule Ledger</p>
                  <h2>적용 규칙 카탈로그</h2>
                </div>
                <span className="row-count">Sortable proof</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Step</th><th>Rule ID</th><th>Output</th></tr>
                  </thead>
                  <tbody>
                    {analysis.trace.map(item => (
                      <tr key={`ledger-${item.ruleId}`}>
                        <td>{skillNames[item.skillId] ?? item.step}</td>
                        <td><code>{item.ruleId}</code></td>
                        <td>{item.output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel data-preview">
              <div className="panel-head">
                <div>
                  <p className="section-kicker">Input preview</p>
                  <h2>데이터 샘플</h2>
                </div>
                <span className="row-count">{rows.length} rows</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx}>{columns.map(c => <td key={c}>{row[c]}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}

      <footer className="disclaimer-footer" aria-label="investment disclaimer">
        <strong>투자 유의사항</strong>
        <span>InvestSkill Lens는 입력 CSV를 Skills.md 규칙으로 요약하는 교육용 자동 리포트입니다. 매수·매도 추천, 투자자문, 수익 보장을 제공하지 않습니다.</span>
      </footer>
    </main>
  );
}
