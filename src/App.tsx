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
import { ArrowUpRight, BookOpen, FileUp, Sparkles, Upload } from 'lucide-react';
import { analyze, Analysis, buildRuleContract, Row, RiskVisual, validateRows } from '@/lib/analysis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SkillsInspector, SkillId } from '@/components/skills-inspector';

const samples = [
  { label: '주가 시계열', url: '/samples/price_timeseries.csv', desc: '가격 추세와 누적 수익률' },
  { label: '포트폴리오 비중', url: '/samples/portfolio_allocation.csv', desc: '자산별 집중도와 비중' },
  { label: '거래내역', url: '/samples/transaction_log.csv', desc: '매수·매도 규모와 빈도' },
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

function toneVariant(tone?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (tone === 'bad') return 'destructive';
  if (tone === 'warn') return 'secondary';
  if (tone === 'good') return 'default';
  return 'outline';
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

function VolumeStrip({ series }: { series: any[] }) {
  const hasVolume = series.some(s => Number(s.volume) > 0);
  if (!hasVolume) return null;
  const totalVolume = series.reduce((a, s) => a + Number(s.volume || 0), 0);
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">일별 거래량</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">합계 {totalVolume.toLocaleString()}</span>
      </div>
      <ResponsiveContainer width="100%" height={56}>
        <BarChart data={series} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--popover)',
              fontSize: 12,
            }}
            formatter={(v) => Number(v).toLocaleString()}
          />
          <Bar dataKey="volume" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskPanel({ risk, series }: { risk: RiskVisual; series: any[] }) {
  if (risk.kind === 'drawdown') {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{risk.label}</span>
          <span className="text-base font-semibold tabular-nums text-destructive">
            {(risk.value * 100).toFixed(2)}%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 1', 0]} />
            <XAxis hide dataKey="date" />
            <Tooltip
              formatter={(v) => `${Number(v).toFixed(2)}%`}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--popover)',
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="drawdownPct" stroke="var(--destructive)" fill="url(#ddFill)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground">{risk.helper}</p>
      </div>
    );
  }

  if (risk.kind === 'concentration') {
    const pctValue = Math.min(100, Math.max(0, risk.value * 100));
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{risk.label}</span>
          <span className="text-base font-semibold tabular-nums">{pctValue.toFixed(1)}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full',
              pctValue >= 30 ? 'bg-destructive' : pctValue >= 20 ? 'bg-foreground/70' : 'bg-foreground/40',
            )}
            style={{ width: `${pctValue}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>0%</span>
          <span>30% watch</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-muted-foreground">{risk.helper}</p>
      </div>
    );
  }

  if (risk.kind === 'buy_sell') {
    const total = Math.max(risk.buy + risk.sell, 1);
    const buyPct = (risk.buy / total) * 100;
    const sellPct = (risk.sell / total) * 100;
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{risk.label}</span>
          <span className="text-base font-semibold tabular-nums">{risk.ratio.toFixed(2)}x</span>
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded-md bg-muted text-[11px] font-medium">
          <span className="flex items-center justify-center bg-foreground text-background" style={{ width: `${buyPct}%` }}>
            Buy {buyPct.toFixed(0)}%
          </span>
          <span className="flex items-center justify-center bg-destructive text-background" style={{ width: `${sellPct}%` }}>
            Sell {sellPct.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{risk.helper}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground">{risk.helper}</div>
  );
}

function compactDateTick(value: unknown) {
  const parts = String(value ?? '').split('-');
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return String(value ?? '');
}

function MainChart({ analysis, series }: { analysis: Analysis; series: any[] }) {
  const isLine = analysis.detection.dataType === 'price_timeseries' || analysis.detection.dataType === 'market_indicator';
  const isPrice = analysis.detection.dataType === 'price_timeseries';
  if (isLine) {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
          <XAxis
            dataKey="date"
            tickFormatter={compactDateTick}
            interval="preserveStartEnd"
            minTickGap={42}
            tickMargin={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          />
          <YAxis
            yAxisId="price"
            domain={['dataMin - 3', 'dataMax + 3']}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            stroke="transparent"
          />
          <YAxis
            yAxisId="return"
            orientation="right"
            tickFormatter={v => `${v}%`}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            stroke="transparent"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--popover)',
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="line"
            iconSize={12}
            wrapperStyle={{
              fontSize: 11,
              color: 'var(--muted-foreground)',
              paddingBottom: 10,
            }}
          />
          <Line
            yAxisId="price"
            name={isPrice ? '종가' : '지표값'}
            dataKey="close"
            stroke="var(--foreground)"
            strokeWidth={2.2}
            dot={false}
          />
          {isPrice && (
            <Line
              yAxisId="price"
              name="MA20"
              dataKey="ma20"
              stroke="var(--chart-2)"
              strokeWidth={1.4}
              strokeDasharray="5 3"
              dot={false}
              connectNulls
            />
          )}
          {isPrice && (
            <Line
              yAxisId="price"
              name="MA60"
              dataKey="ma60"
              stroke="var(--chart-4)"
              strokeWidth={1.4}
              strokeDasharray="8 4"
              dot={false}
              connectNulls
            />
          )}
          <Line
            yAxisId="return"
            name="누적 수익률"
            dataKey="cumulativeReturnPct"
            stroke="var(--muted-foreground)"
            strokeWidth={1.6}
            strokeDasharray="2 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
        <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} stroke="transparent" />
        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} stroke="transparent" />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--popover)',
            fontSize: 12,
          }}
        />
        <Bar
          dataKey={analysis.detection.dataType === 'transaction_log' ? 'amount' : 'weight'}
          fill="var(--foreground)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
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
  const [, setLastPrompt] = useState('초기 샘플 자동 분석');
  const [, setRunCount] = useState(0);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [skillsInitial, setSkillsInitial] = useState<SkillId>('01_data_detection');

  const openSkill = (skill?: SkillId) => {
    if (skill) setSkillsInitial(skill);
    setSkillsOpen(true);
  };

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
  const previewRows = rows.slice(0, 8);
  const confidence = analysis ? Math.round(analysis.detection.confidence * 100) : 0;
  const mode = focusMode(query);
  const contract = analysis ? buildRuleContract(analysis.trace) : null;
  const chartSeries = useMemo(
    () => analysis?.series.map(point => ({
      ...point,
      cumulativeReturnPct: typeof point.cumulativeReturn === 'number' ? point.cumulativeReturn * 100 : point.cumulativeReturn,
    })) ?? [],
    [analysis],
  );
  const periodLabel = useMemo(() => {
    const dates = chartSeries.map(s => s.date).filter(Boolean);
    if (!dates.length) return '—';
    if (dates.length === 1) return String(dates[0]);
    return `${dates[0]} ~ ${dates[dates.length - 1]}`;
  }, [chartSeries]);
  const riskSignals = useMemo(
    () => analysis?.kpis.filter(k => k.tone === 'bad' || k.tone === 'warn') ?? [],
    [analysis],
  );
  const warnings = [...parseState.warnings, ...(analysis?.warnings ?? [])].filter((v, i, arr) => arr.indexOf(v) === i);
  const unsupported = analysis?.detection.dataType === 'unknown';
  const showDiagnostic = parseState.errors.length > 0 || warnings.length > 0 || unsupported;
  const primaryKpis = analysis?.kpis.slice(0, 4) ?? [];
  const secondaryKpis = analysis?.kpis.slice(4) ?? [];
  const proofStats = analysis
    ? [
        { label: 'Detected', value: detectionLabel(analysis.detection.dataType), detail: `${confidence}% confidence` },
        { label: 'Skills run', value: `${analysis.trace.length} steps`, detail: analysis.trace.map(t => t.step).join(' → ') },
        { label: 'Rule contract', value: `${contract?.matched.length ?? 0}/${analysis.trace.length}`, detail: contract?.unmatched.length ? 'needs review' : 'all matched' },
        { label: 'Dashboard', value: 'Generated', detail: 'KPI · chart · insight · trace' },
      ]
    : [];
  const proofFlow = ['CSV input', 'Skills pipeline', 'Trace matched', 'Dashboard generated'];
  const traceSnapshot = analysis
    ? analysis.trace.map(item => ({
        ...item,
        matched: Boolean(contract?.matched.some(rule => rule.ruleId === item.ruleId)),
      }))
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
              IS
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">InvestSkill Lens</span>
              <span className="text-[11px] text-muted-foreground">투자 데이터 자동 분석 대시보드</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => openSkill('00_root')} className="gap-2">
            <BookOpen data-icon="inline-start" />
            분석 규칙
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">데이터 소스</span>
            {samples.map(sample => (
              <Button
                key={sample.url}
                variant={activeSample === sample.url ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveSample(sample.url);
                  setLastPrompt(`${sample.label} 샘플 자동 분석`);
                  loadCsv(sample.url).then(({ rows, state }) => {
                    setRows(rows);
                    setParseState(state);
                  });
                }}
              >
                {sample.label}
              </Button>
            ))}
            <label
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent',
                activeSample === 'uploaded' && 'border-foreground bg-foreground text-background hover:bg-foreground',
              )}
            >
              <Upload data-icon="inline-start" className="size-4" />
              CSV 업로드
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => onFile(e.target.files?.[0])}
              />
            </label>
            <Separator orientation="vertical" className="!h-6" />
            <Badge variant="secondary" className="font-mono text-[11px]">
              {analysis ? detectionLabel(analysis.detection.dataType) : 'detecting…'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {rows.length.toLocaleString()} rows · confidence {confidence}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2">
            <Sparkles className="ml-2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="분석 초점을 입력해 보세요. 예) 위험 위주로 보여줘"
              className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button onClick={runAnalysis} disabled={isRunning || !rows.length} size="sm">
              {isRunning ? '분석 중…' : 'Analyze'}
            </Button>
          </div>
        </section>

        {showDiagnostic && (
          <Alert variant={parseState.errors.length || unsupported ? 'destructive' : 'default'}>
            <AlertTitle>
              {parseState.errors.length
                ? 'CSV를 다시 확인해주세요'
                : unsupported
                  ? '지원되지 않는 구조입니다'
                  : '데이터 품질 경고'}
            </AlertTitle>
            <AlertDescription>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {parseState.errors.map(item => <li key={item}>{item}</li>)}
                {warnings.map(item => <li key={item}>{item}</li>)}
              </ul>
              {parseState.recommendations.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  추천 매핑: {parseState.recommendations.join(' · ')}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <>
            <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {primaryKpis.map((k, idx) => (
                <Card
                  key={k.label}
                  className={cn(
                    'overflow-hidden border-foreground/15 shadow-sm',
                    idx === 0
                      ? 'bg-foreground text-background'
                      : 'bg-card ring-1 ring-foreground/10',
                    k.tone === 'bad' && 'border-destructive/40 ring-destructive/20',
                  )}
                >
                  <CardHeader className="gap-2 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardDescription className={cn('text-xs font-medium', idx === 0 && 'text-background/70')}>
                        {k.label}
                      </CardDescription>
                      <Badge
                        variant={idx === 0 ? 'secondary' : toneVariant(k.tone)}
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {k.tone === 'good'
                          ? 'positive'
                          : k.tone === 'bad'
                            ? 'negative'
                            : k.tone === 'warn'
                              ? 'watch'
                              : 'neutral'}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
                      {k.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/25 p-3 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="bg-background shadow-none">
                <CardHeader className="pb-3">
                  <CardDescription>Proof flow</CardDescription>
                  <CardTitle className="text-base">CSV가 Skills.md contract를 지나 화면으로 바뀐 경로</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                    {proofStats.map(stat => (
                      <div key={stat.label} className="flex flex-col gap-1 rounded-lg border bg-card p-3">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</span>
                        <strong className="text-sm tabular-nums">{stat.value}</strong>
                        <span className="text-[11px] text-muted-foreground">{stat.detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {proofFlow.map((step, index) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className="rounded-md border bg-background px-2 py-1 font-medium text-foreground">{step}</span>
                        {index < proofFlow.length - 1 && <span className="font-mono">→</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background shadow-none">
                <CardHeader className="pb-3">
                  <CardDescription>Current trace snapshot</CardDescription>
                  <CardTitle className="text-base">현재 분석에 실제 적용된 5개 rule</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {traceSnapshot.map(item => (
                    <button
                      key={`snapshot-${item.step}-${item.ruleId}`}
                      type="button"
                      onClick={() => openSkill(item.skillId as SkillId)}
                      className="flex w-full items-center gap-2 rounded-lg border bg-card p-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-semibold">
                        {item.step}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[11px]">{item.ruleId}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{item.output}</span>
                      </span>
                      <Badge variant={item.matched ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                        {item.matched ? 'matched' : 'review'}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </section>

            {secondaryKpis.length > 0 && (
              <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {secondaryKpis.map(k => (
                  <Card key={k.label} className="bg-card/70">
                    <CardHeader className="gap-1 pb-2">
                      <CardDescription className="text-[11px]">{k.label}</CardDescription>
                      <CardTitle className="text-xl tabular-nums">{k.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant={toneVariant(k.tone)} className="text-[10px]">
                        {k.tone === 'good'
                          ? 'positive'
                          : k.tone === 'bad'
                            ? 'negative'
                            : k.tone === 'warn'
                              ? 'watch'
                              : 'neutral'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="bg-transparent shadow-none ring-0 lg:col-span-2">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <CardDescription>근거 확인용 시각화</CardDescription>
                    <CardTitle className="text-base text-muted-foreground">{analysis.chartReason}</CardTitle>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant="outline" className="font-mono text-[11px]">{mode}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <MainChart analysis={analysis} series={chartSeries} />
                  {analysis.detection.dataType === 'price_timeseries' && (
                    <VolumeStrip series={chartSeries} />
                  )}
                  <RiskPanel risk={analysis.riskVisual} series={chartSeries} />
                </CardContent>
              </Card>

              <Card className="bg-transparent shadow-none ring-0">
                <CardHeader>
                  <CardDescription>보조 분석 요약</CardDescription>
                  <CardTitle>근거와 리스크</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5 rounded-md bg-muted/30 p-2.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">분석 기간</span>
                      <strong className="text-xs tabular-nums">{periodLabel}</strong>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-md bg-muted/30 p-2.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">데이터 수</span>
                      <strong className="text-xs tabular-nums">{rows.length.toLocaleString()} rows</strong>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-md bg-muted/30 p-2.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">분석 모드</span>
                      <strong className="text-xs">{mode}</strong>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-md bg-muted/30 p-2.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">마지막 실행</span>
                      <strong className="text-xs tabular-nums">{formatTime(lastRunAt)}</strong>
                    </div>
                  </div>

                  {riskSignals.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        주의 시그널 ({riskSignals.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {riskSignals.map(sig => (
                          <Badge key={sig.label} variant={toneVariant(sig.tone)} className="text-[10px] font-normal">
                            {sig.label} · <span className="ml-1 font-mono">{sig.value}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">핵심 인사이트</span>
                    <ul className="flex flex-col gap-1.5 leading-snug">
                      {analysis.insights.slice(0, 3).map((insight, idx) => (
                        <li key={insight} className="flex gap-2 text-sm">
                          <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold tabular-nums">
                            {idx + 1}
                          </span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="skills">
              <Tabs defaultValue="insights" className="gap-4">
                <TabsList>
                  <TabsTrigger value="insights">인사이트</TabsTrigger>
                  <TabsTrigger value="trace">분석 단계</TabsTrigger>
                  <TabsTrigger value="ledger">규칙 카탈로그</TabsTrigger>
                  <TabsTrigger value="preview">데이터 미리보기</TabsTrigger>
                </TabsList>

                <TabsContent value="insights">
                  <Card>
                    <CardHeader>
                      <CardDescription>규칙 기반 자동 인사이트</CardDescription>
                      <CardTitle>자동 생성 리포트</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-medium text-muted-foreground">리포트 섹션</span>
                        {analysis.reportSections.map(section => (
                          <div key={section.title} className="flex flex-col gap-1 rounded-lg border bg-card p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">{section.title}</span>
                              <Badge variant={toneVariant(section.tone)} className="text-[10px]">
                                {section.tone ?? 'neutral'}
                              </Badge>
                            </div>
                            <strong className="text-base font-semibold tabular-nums">{section.value}</strong>
                            <p className="text-xs text-muted-foreground">{section.detail}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          전체 인사이트 ({analysis.insights.length})
                        </span>
                        <ol className="flex flex-col gap-2 text-sm">
                          {analysis.insights.map((insight, idx) => (
                            <li key={insight} className="flex gap-2 rounded-lg border bg-card p-3">
                              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-semibold tabular-nums">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="leading-snug">{insight}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trace">
                  <Card>
                    <CardHeader>
                      <CardDescription>분석 단계 추적</CardDescription>
                      <CardTitle>판별 → 지표 → 차트 → 인사이트 → 레이아웃</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-3">
                        {analysis.trace.map(item => {
                          const itemContract = contract?.matched.find(m => m.ruleId === item.ruleId);
                          return (
                            <div key={`${item.step}-${item.ruleId}`} className="flex gap-3 rounded-lg border bg-card p-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                                {item.step}
                              </div>
                              <div className="flex flex-1 flex-col gap-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="font-mono text-[10px]">
                                    {skillNames[item.skillId] ?? item.skillId}
                                  </Badge>
                                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{item.ruleId}</code>
                                  <Badge
                                    variant={itemContract ? 'default' : 'secondary'}
                                    className="text-[10px]"
                                  >
                                    {itemContract ? '일치' : '미정의'}
                                  </Badge>
                                </div>
                                <strong className="text-sm">{item.label}</strong>
                                <p className="text-xs text-muted-foreground">{item.evidence.join(' · ')}</p>
                                <span className="text-xs">{item.output}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ledger">
                  <Card>
                    <CardHeader>
                      <CardDescription>적용된 분석 규칙</CardDescription>
                      <CardTitle>규칙 카탈로그</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">단계</TableHead>
                            <TableHead>규칙 ID</TableHead>
                            <TableHead>결과</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.trace.map(item => (
                            <TableRow key={`ledger-${item.ruleId}`}>
                              <TableCell className="font-medium">
                                {skillNames[item.skillId] ?? item.step}
                              </TableCell>
                              <TableCell>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{item.ruleId}</code>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.output}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card>
                    <CardHeader className="flex-row items-center justify-between">
                      <div>
                        <CardDescription>Input preview</CardDescription>
                        <CardTitle>{rows.length.toLocaleString()} rows · 상위 8행</CardTitle>
                      </div>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {columns.length} cols
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {columns.map(c => <TableHead key={c}>{c}</TableHead>)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewRows.map((row, idx) => (
                              <TableRow key={idx}>
                                {columns.map(c => (
                                  <TableCell key={c} className="font-mono text-xs">
                                    {row[c]}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            <section className="rounded-lg border bg-muted/40 p-4">
              <div className="flex flex-wrap items-start gap-3">
                <FileUp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-1 text-xs text-muted-foreground">
                  <strong className="text-foreground">컬럼 매핑 근거</strong>
                  <p>
                    {analysis.columnMapping.map(m => `${m.label}: ${m.source}`).join(' · ')}
                  </p>
                  <p className="text-[11px]">
                    판별 사유: {analysis.detection.reasons.join(' · ')}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground">
          <strong className="text-sm text-foreground">투자 유의사항</strong>
          <p>
            InvestSkill Lens는 입력 CSV를 정의된 분석 규칙으로 요약하는 교육용 자동 리포트입니다.
            매수·매도 추천, 투자자문, 수익 보장을 제공하지 않습니다.
          </p>
        </footer>
      </main>

      <SkillsInspector open={skillsOpen} onOpenChange={setSkillsOpen} initial={skillsInitial} />
    </div>
  );
}
