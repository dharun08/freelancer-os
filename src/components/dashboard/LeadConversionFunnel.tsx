import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Percent 
} from 'lucide-react';

export interface LeadConversionFunnelProps {
  leads: Array<{
    id: string;
    status: string;
    pipelineValue?: number;
  }>;
}

const FUNNEL_STAGES = [
  { name: 'Prospect', color: 'indigo', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-500', bar: 'bg-indigo-500' },
  { name: 'Contacted', color: 'blue', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500' },
  { name: 'Proposal Sent', color: 'purple', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-500', bar: 'bg-purple-500' },
  { name: 'Negotiating', color: 'amber', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-500', bar: 'bg-amber-500' },
  { name: 'Won', color: 'emerald', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-500', bar: 'bg-emerald-500' },
] as const;

export default function LeadConversionFunnel({ leads }: LeadConversionFunnelProps) {
  // 1. Group leads by status safely
  const stageCounts: Record<string, number> = {
    'Prospect': 0,
    'Contacted': 0,
    'Proposal Sent': 0,
    'Negotiating': 0,
    'Won': 0,
    'Lost': 0,
  };

  leads.forEach((lead) => {
    if (stageCounts[lead.status] !== undefined) {
      stageCounts[lead.status]++;
    }
  });

  const totalLeads = leads.length;
  const prospectCount = stageCounts['Prospect'];
  const wonCount = stageCounts['Won'];
  const lostCount = stageCounts['Lost'];

  // Overall conversion: Won / Prospect * 100 (safely handled when Prospect is 0)
  const overallConversionRate = prospectCount > 0 
    ? (wonCount / prospectCount) * 100 
    : 0;

  const formattedOverall = Number.isFinite(overallConversionRate)
    ? overallConversionRate % 1 === 0
      ? `${overallConversionRate}%`
      : `${overallConversionRate.toFixed(1)}%`
    : '0%';

  // Max count for proportional bars
  const maxStageCount = Math.max(
    ...FUNNEL_STAGES.map((s) => stageCounts[s.name]),
    1
  );

  // 2. Compute stage-to-stage conversions
  const stagesWithMetrics = FUNNEL_STAGES.map((stage, idx) => {
    const count = stageCounts[stage.name];
    let conversionFromPrev: number | null = null;

    if (idx > 0) {
      const prevCount = stageCounts[FUNNEL_STAGES[idx - 1].name];
      if (prevCount > 0) {
        conversionFromPrev = Math.round((count / prevCount) * 100);
      } else {
        conversionFromPrev = 0;
      }
    }

    return {
      ...stage,
      count,
      conversionFromPrev,
      barPercent: Math.max(Math.round((count / maxStageCount) * 100), count > 0 ? 8 : 0),
    };
  });

  // Empty state if user has no leads
  if (totalLeads === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Target className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Lead Conversion Funnel</h3>
              <p className="text-xs text-muted-foreground">Current distribution across pipeline stages</p>
            </div>
          </div>
          <Link href="/leads" className="text-xs text-primary hover:underline flex items-center">
            <span>View leads</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="py-8 space-y-3 max-w-sm mx-auto text-center">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Target className="h-6 w-6 opacity-60" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">No leads yet</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add your first lead to start tracking your conversion pipeline.
          </p>
          <div className="pt-2">
            <Link
              href="/leads"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add First Lead</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header with Title and Key Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Lead Conversion Funnel</h3>
            <p className="text-xs text-muted-foreground">Current distribution across active sales stages</p>
          </div>
        </div>

        {/* Overall Conversion & Lost metrics */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overall conversion: <strong>{formattedOverall}</strong></span>
          </div>

          {lostCount > 0 && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              <XCircle className="h-3.5 w-3.5" />
              <span>Lost: <strong>{lostCount}</strong></span>
            </div>
          )}

          <Link
            href="/leads"
            className="text-xs text-primary hover:underline inline-flex items-center ml-1 font-medium"
          >
            <span>View leads</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Desktop & Tablet Funnel: Step-by-Step Flow */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 items-stretch">
        {stagesWithMetrics.map((stage, idx) => (
          <div key={stage.name} className="flex flex-col relative group">
            {/* Stage Card */}
            <div className={`flex-1 rounded-2xl border ${stage.border} ${stage.bg} p-4 flex flex-col justify-between space-y-3 transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate" title={stage.name}>
                  {stage.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stage.bg} ${stage.text}`}>
                  #{idx + 1}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black tracking-tight text-foreground">{stage.count}</span>
                  <span className="text-[11px] text-muted-foreground">{stage.count === 1 ? 'lead' : 'leads'}</span>
                </div>

                {/* Relative proportional visual bar */}
                <div className="h-1.5 w-full bg-background/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.barPercent}%` }}
                  />
                </div>
              </div>

              {/* Conversion from previous stage */}
              <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40 flex items-center justify-between">
                <span>Stage conv:</span>
                {idx === 0 ? (
                  <span className="font-semibold text-foreground/80">Base (100%)</span>
                ) : (
                  <span className={`font-bold ${stage.conversionFromPrev && stage.conversionFromPrev > 0 ? stage.text : 'text-muted-foreground'}`}>
                    ↓ {stage.conversionFromPrev}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Funnel: Vertical Progression Stack */}
      <div className="md:hidden space-y-3">
        {stagesWithMetrics.map((stage, idx) => (
          <React.Fragment key={stage.name}>
            <div className={`rounded-2xl border ${stage.border} ${stage.bg} p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stage.bg} ${stage.text}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground">{stage.name}</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-black text-foreground">{stage.count}</span>
                  <span className="text-xs text-muted-foreground">{stage.count === 1 ? 'lead' : 'leads'}</span>
                </div>
              </div>

              {/* Proportional visual bar */}
              <div className="h-2 w-full bg-background/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${stage.barPercent}%` }}
                />
              </div>

              {idx > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Conversion from {FUNNEL_STAGES[idx - 1].name}:</span>
                  <span className={`font-bold ${stage.conversionFromPrev && stage.conversionFromPrev > 0 ? stage.text : 'text-muted-foreground'}`}>
                    ↓ {stage.conversionFromPrev}%
                  </span>
                </div>
              )}
            </div>

            {/* Downward transition indicator for mobile */}
            {idx < stagesWithMetrics.length - 1 && (
              <div className="flex items-center justify-center py-0.5">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/60">
                  <ArrowDown className="h-3 w-3 text-indigo-500" />
                  <span>
                    {stagesWithMetrics[idx + 1].conversionFromPrev !== null
                      ? `↓ ${stagesWithMetrics[idx + 1].conversionFromPrev}% to ${stagesWithMetrics[idx + 1].name}`
                      : 'Next stage'}
                  </span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
