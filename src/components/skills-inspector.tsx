import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const SKILL_FILES = [
  { id: '00_root', label: '전체 정의서', url: '/Skills.md', subtitle: '분석 규칙 인덱스' },
  { id: '01_data_detection', label: '01 · 판별', url: '/skills/01_data_detection.md', subtitle: '데이터 유형 판별' },
  { id: '02_metric_rules', label: '02 · 지표', url: '/skills/02_metric_rules.md', subtitle: '지표 계산' },
  { id: '03_chart_selection', label: '03 · 시각화', url: '/skills/03_chart_selection.md', subtitle: '시각화 선택' },
  { id: '04_insight_generation', label: '04 · 인사이트', url: '/skills/04_insight_generation.md', subtitle: '인사이트 생성' },
  { id: '05_report_layout', label: '05 · 레이아웃', url: '/skills/05_report_layout.md', subtitle: '리포트 배치' },
] as const;

export type SkillId = (typeof SKILL_FILES)[number]['id'];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SkillId;
};

export function SkillsInspector({ open, onOpenChange, initial }: Props) {
  const [active, setActive] = useState<SkillId>(initial ?? '01_data_detection');
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial && open) setActive(initial);
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    const target = SKILL_FILES.find(f => f.id === active);
    if (!target || content[active]) return;
    fetch(target.url)
      .then(r => (r.ok ? r.text() : Promise.reject(new Error(`${r.status}`))))
      .then(text => setContent(prev => ({ ...prev, [active]: text })))
      .catch(() => setContent(prev => ({ ...prev, [active]: `# 로드 실패\n\n${target.url} 를 가져올 수 없습니다.` })));
  }, [active, open, content]);

  const activeMeta = SKILL_FILES.find(f => f.id === active);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!max-w-3xl w-full sm:!max-w-3xl gap-0 p-0 flex flex-col">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            분석 규칙 정의서
            <Badge variant="outline" className="font-mono text-[10px]">read-only</Badge>
          </SheetTitle>
          <SheetDescription>
            현재 화면이 따르는 분석 규칙 모음. 데이터 판별 → 지표 → 시각화 → 인사이트 → 레이아웃 순서로 정의됩니다.
          </SheetDescription>
        </SheetHeader>
        <Tabs value={active} onValueChange={(v) => setActive(v as SkillId)} className="flex flex-1 flex-col gap-0 overflow-hidden">
          <div className="border-b px-4 py-2">
            <TabsList className="h-auto flex-wrap gap-1">
              {SKILL_FILES.map(f => (
                <TabsTrigger key={f.id} value={f.id} className="text-xs">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {activeMeta && (
              <p className="mt-2 px-1 text-[11px] text-muted-foreground">{activeMeta.subtitle} · <code>{activeMeta.url}</code></p>
            )}
          </div>
          {SKILL_FILES.map(f => (
            <TabsContent
              key={f.id}
              value={f.id}
              className="flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-6 py-5">
                  <MarkdownView source={content[f.id] ?? '로드 중…'} />
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MarkdownView({ source }: { source: string }) {
  return (
    <div className="text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mt-1 mb-3 text-xl font-semibold tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-6 mb-2 text-lg font-semibold tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-4 mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h3>,
          p: ({ children }) => <p className="my-2 text-sm leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc pl-5 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5 text-sm">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code className="block w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
                  {children}
                </code>
              );
            }
            return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">{children}</code>;
          },
          pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-md bg-muted/60 p-0">{children}</pre>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
          tr: ({ children }) => <tr className="border-b last:border-b-0">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-muted-foreground">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-muted-foreground/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-foreground underline underline-offset-2" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-border" />,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

export const SKILL_LABEL: Record<string, SkillId> = {
  '01_data_detection': '01_data_detection',
  '02_metric_rules': '02_metric_rules',
  '03_chart_selection': '03_chart_selection',
  '04_insight_generation': '04_insight_generation',
  '05_report_layout': '05_report_layout',
};
