import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const indexCss = readFileSync(join(root, 'src/index.css'), 'utf8');
const componentsJson = JSON.parse(readFileSync(join(root, 'components.json'), 'utf8'));

assert.ok(!existsSync(join(root, 'src/styles.css')), 'legacy src/styles.css must be removed in favor of Tailwind + shadcn');

assert.equal(componentsJson.tailwind.css, 'src/index.css', 'shadcn must point at src/index.css for the global stylesheet');
assert.equal(componentsJson.aliases.ui, '@/components/ui', 'shadcn ui alias must be @/components/ui');
assert.ok(componentsJson.style && componentsJson.style.includes('nova'), 'shadcn style preset should be a nova variant');

assert.ok(indexCss.includes('@import "tailwindcss"'), 'index.css must import Tailwind v4');
assert.ok(indexCss.includes('@theme inline'), 'index.css must define shadcn @theme inline tokens');
assert.ok(indexCss.includes('--primary:'), 'index.css must declare the primary token');
assert.ok(indexCss.includes('--muted-foreground:'), 'index.css must declare muted-foreground token');

const uiDir = join(root, 'src/components/ui');
const installedUi = readdirSync(uiDir).map(name => name.replace(/\.tsx$/, ''));
const requiredUi = ['card', 'button', 'badge', 'tabs', 'table', 'separator', 'alert', 'input'];
for (const ui of requiredUi) {
  assert.ok(installedUi.includes(ui), `shadcn component missing: ${ui}`);
}

const requiredAppImports = [
  '@/components/ui/card',
  '@/components/ui/button',
  '@/components/ui/badge',
  '@/components/ui/tabs',
  '@/components/ui/table',
  '@/components/ui/alert',
  '@/lib/utils',
];
for (const importPath of requiredAppImports) {
  assert.ok(app.includes(importPath), `App.tsx must import from ${importPath}`);
}

const requiredAppComponents = ['<Card', '<Button', '<Badge', '<Tabs', '<TabsList', '<TabsTrigger', '<TabsContent', '<Table'];
for (const tag of requiredAppComponents) {
  assert.ok(app.includes(tag), `App.tsx must render shadcn component: ${tag}`);
}

const removedMarkers = [
  'hero-visual',
  'trust-ribbon',
  'design-proof-grid',
  'evidence-orbit',
  'getdesign-reference-strip',
  'quick-stats-panel',
  'rule-ledger',
  'mobile-proof-strip',
  'Judge-ready',
  'Premium Skills',
  'bright-palette',
];
for (const marker of removedMarkers) {
  assert.ok(!app.includes(marker), `legacy decorative marker should be removed from App.tsx: ${marker}`);
}

assert.ok(!/fill="#[0-9a-fA-F]{3,8}"/.test(app), 'chart fill should use semantic tokens, not raw hex');
assert.ok(!/stroke="#[0-9a-fA-F]{3,8}"/.test(app), 'chart stroke should use semantic tokens, not raw hex');
assert.ok(app.includes('var(--foreground)') || app.includes('var(--primary)'), 'charts must reference shadcn semantic CSS vars');

console.log('design-tests: ok');
