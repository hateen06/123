import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) {
  assert.ok(fs.existsSync(path), `${path} must exist`);
  return fs.readFileSync(path, 'utf8');
}

function includes(text, needle, label = needle) {
  assert.ok(text.includes(needle), `missing ${label}`);
}

const readme = read('README.md');
const skills = read('Skills.md');
const proposal = read('docs/proposal-pdf-script.md');
const template = read('docs/proposal-pdf-template.md');

for (const text of [readme]) {
  includes(text, 'Live Demo', 'README live demo section');
  includes(text, '30초 심사 루트', 'README 30-second judge route');
  includes(text, 'No API key, no login, no backend', 'README no-key claim');
  includes(text, 'DAKER 평가축 대응', 'README judging-axis table');
  includes(text, 'Verified on 2026-04-25', 'README verified date');
  includes(text, 'npm run test:analysis', 'README analysis verification command');
  includes(text, 'npm run test:design', 'README design verification command');
  includes(text, '390px overflow', 'README mobile verification');
  includes(text, 'prompt는 분석 초점 UI', 'README prompt clarification');
}

for (const text of [skills]) {
  includes(text, 'CSV rows -> detection -> metrics -> chart -> insight -> layout', 'root Skills contract');
  includes(text, 'skills/01_data_detection.md', 'root Skills index 01');
  includes(text, 'detect.price_timeseries.ohlcv', 'root Skills implemented rule id');
  includes(text, 'metric.portfolio.top_weight', 'root Skills portfolio rule id');
  includes(text, 'chart.transaction.buy_sell_bar_meter', 'root Skills transaction chart id');
  includes(text, 'public/skills/*.md', 'root Skills mirror note');
  includes(text, 'Declared future rules', 'root Skills future boundary');
  includes(text, '매수·매도 추천 금지', 'root Skills safety boundary');
}

for (const [name, text] of [['proposal', proposal], ['template', template]]) {
  includes(text, '기술 구현 결과', `${name} implementation result wording`);
  includes(text, '현재 제출 구현 범위', `${name} current submission scope wording`);
  includes(text, '제출 후 확장 후보', `${name} post-submission extension wording`);
  includes(text, '매수/매도 금액', `${name} transaction wording`);
  includes(text, 'allocation bar + concentration gauge', `${name} portfolio chart wording`);
  includes(text, 'generated report summary', `${name} generated report summary`);
  includes(text, 'trace contract badge', `${name} trace contract badge`);
  assert.ok(!text.includes('기술 구현 계획'), `${name} must not use future implementation plan wording`);
  assert.ok(!text.includes('MVP 구현 범위'), `${name} must not use old MVP wording`);
  assert.ok(!text.includes('추가 구현 후보'), `${name} must not use old extra implementation wording`);
  assert.ok(!text.includes('거래 승률'), `${name} must not claim unsupported win-rate metric`);
  assert.ok(!text.includes('Bar/Donut Chart'), `${name} must not claim unsupported donut chart`);
}

console.log('submission-tests: ok');
