import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname;
const sourcePath = join(root, 'src/lib/analysis.ts');
const outDir = join('/tmp', 'daker-investskill-lens-tests');
const outPath = join(outDir, 'analysis.cjs');
mkdirSync(outDir, { recursive: true });
const source = readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
    strict: true,
  },
  fileName: sourcePath,
});
writeFileSync(outPath, compiled.outputText);
const require = createRequire(import.meta.url);
const { analyze, detect, buildRuleContract, validateRows } = require(outPath);

function priceRows() {
  return [
    { date: '2024-01-01', open: '100', close: '100', volume: '1000' },
    { date: '2024-01-02', open: '101', close: '105', volume: '1200' },
    { date: '2024-01-03', open: '103', close: '98', volume: '1100' },
  ];
}

function portfolioRows() {
  return [
    { ticker: 'AAA', weight: '0.42' },
    { ticker: 'BBB', weight: '0.28' },
    { ticker: 'CCC', weight: '0.30' },
  ];
}

function transactionRows() {
  return [
    { date: '2024-01-01', side: 'buy', quantity: '2', price: '100' },
    { date: '2024-01-02', side: 'sell', quantity: '1', price: '120' },
  ];
}

{
  const result = analyze(priceRows());
  assert.equal(result.detection.dataType, 'price_timeseries');
  assert.ok(Array.isArray(result.trace), 'analysis exposes trace array');
  assert.deepEqual(result.trace.map(t => t.skillId), [
    '01_data_detection',
    '02_metric_rules',
    '03_chart_selection',
    '04_insight_generation',
    '05_report_layout',
  ]);
  assert.ok(result.trace.some(t => t.ruleId === 'detect.price_timeseries.ohlcv'));
  assert.ok(result.trace.some(t => t.ruleId === 'metric.price.max_drawdown'));
  assert.ok(result.trace.some(t => t.ruleId === 'chart.price.dual_axis_drawdown'));
  assert.ok(result.riskVisual?.kind === 'drawdown');
  assert.ok(result.riskVisual.value < 0, 'price drawdown visual has negative drawdown value');
  assert.ok(result.reportSections?.some(s => s.title === '핵심 요약'), 'generated report summary exists');
  assert.ok(result.columnMapping?.some(m => m.canonical === 'close' && m.source === 'close'));
}

{
  const result = analyze(portfolioRows());
  assert.equal(result.detection.dataType, 'portfolio_allocation');
  assert.ok(result.trace.some(t => t.ruleId === 'metric.portfolio.top_weight'));
  assert.equal(result.riskVisual?.kind, 'concentration');
  assert.equal(result.riskVisual.label, 'Top1 concentration');
  assert.ok(result.riskVisual.value > 0.4);
  assert.ok(result.reportSections?.some(s => s.title === '위험 포인트'));
}

{
  const result = analyze(transactionRows());
  assert.equal(result.detection.dataType, 'transaction_log');
  assert.ok(result.trace.some(t => t.ruleId === 'metric.transaction.buy_sell_ratio'));
  assert.equal(result.riskVisual?.kind, 'buy_sell');
  assert.ok(result.riskVisual.buy > result.riskVisual.sell);
}

{
  const koreanPrice = [
    { 일자: '2024-01-01', 시가: '100', 종가: '100', 거래량: '1000' },
    { 일자: '2024-01-02', 시가: '100', 종가: '110', 거래량: '900' },
  ];
  assert.equal(detect(koreanPrice).dataType, 'price_timeseries');

  const koreanPortfolio = [
    { 종목코드: '005930', 평가비중: '45%' },
    { 종목코드: '000660', 평가비중: '55%' },
  ];
  assert.equal(detect(koreanPortfolio).dataType, 'portfolio_allocation');

  const koreanTx = [
    { 일자: '2024-01-01', 종목: 'AAA', 매매: '매수', 수량: '2', 체결가: '100' },
    { 일자: '2024-01-02', 종목: 'AAA', 매매: '매도', 수량: '1', 체결가: '120' },
  ];
  const tx = analyze(koreanTx);
  assert.equal(tx.detection.dataType, 'transaction_log');
  assert.equal(tx.riskVisual.kind, 'buy_sell');
  assert.equal(tx.riskVisual.sell, 120, 'Korean 매도 is aggregated as sell');
}

{
  const invalidRows = [{ date: '2024-01-01', open: '100', close: 'N/A', volume: '1000' }];
  const validation = validateRows(invalidRows, detect(invalidRows));
  assert.ok(validation.warnings.some(w => w.includes('숫자 변환')));

  const empty = validateRows([], detect([]));
  assert.ok(empty.errors.some(e => e.includes('빈 CSV')));
  assert.ok(empty.recommendations.some(r => r.includes('date')));

  const unknown = analyze([{ memo: 'hello', category: 'cash' }]);
  assert.equal(unknown.trace.length, 5);
  assert.ok(unknown.warnings.some(w => w.includes('추천 컬럼')));
}

{
  const contract = buildRuleContract(analyze(priceRows()).trace);
  assert.equal(contract.unmatched.length, 0, 'all trace rule ids are declared in implemented rules');
  assert.ok(contract.matched.every(item => item.status === 'matched'));
  assert.ok(contract.matched.some(item => item.ruleId === 'layout.dashboard.evidence_first'));
}

console.log('analysis-tests: ok');
