import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const css = readFileSync(join(root, 'src/styles.css'), 'utf8');

const requiredAppMarkers = [
  'hero-visual',
  'trust-ribbon',
  'command-label',
  'design-proof-grid',
  'metric-spark',
  'evidence-orbit',
  'getdesign-reference-strip',
  'quick-stats-panel',
  'rule-ledger',
];

const requiredCssMarkers = [
  '--ink:',
  '--surface-glass:',
  '--stripe-purple:',
  '--getdesign-pink:',
  '.hero-visual',
  '.trust-ribbon',
  '.design-proof-grid',
  '.metric-spark',
  '.evidence-orbit',
  '.getdesign-reference-strip',
  '.quick-stats-panel',
  '.rule-ledger',
  'backdrop-filter: blur',
];

for (const marker of requiredAppMarkers) {
  assert.ok(app.includes(marker), `App.tsx missing premium design marker: ${marker}`);
}

for (const marker of requiredCssMarkers) {
  assert.ok(css.includes(marker), `styles.css missing premium design marker: ${marker}`);
}

assert.ok(/grid-template-columns:\s*minmax\(0,\s*1\.05fr\)\s+minmax\(320px,\s*0\.95fr\)/.test(css), 'hero should use a two-column premium composition on desktop');
assert.ok(css.includes('@media (max-width: 720px)'), 'mobile breakpoint must remain');
assert.ok(css.includes('.hero-visual { display: none; }') || css.includes('.hero-visual{display:none;}'), 'small-screen visual should be hidden/stacked safely');

const brightThemeMarkers = [
  '--sky:',
  '--mint:',
  '--coral:',
  '--sun:',
  'bright-palette',
  'linear-gradient(135deg, #38bdf8, #34d399)',
];
for (const marker of brightThemeMarkers) {
  assert.ok(css.includes(marker), `styles.css missing bright theme marker: ${marker}`);
}
assert.ok(!css.includes('linear-gradient(135deg, #111 0%, #18181b 58%, #064e3b 120%)'), 'dark-card must not use the old black/green muddy gradient');
assert.ok(!css.includes('linear-gradient(145deg, #111, #18181b 72%, #022c22)'), 'insight-panel must not use the old black/green muddy gradient');
assert.ok(!app.includes('fill="#111111"'), 'bar charts should use the bright theme color, not black bars');
assert.ok(!app.includes('stroke="#111111"'), 'line charts should use the bright theme color, not black lines');

console.log('design-tests: ok');
