'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Users, 
  ChevronRight, 
  Building,
  ArrowUpRight
} from 'lucide-react';

interface MetricItem {
  totalRevenue: number;
  outstandingRevenue: number;
  averageProjectValue: number;
  clientLTV: number;
}

interface TopClientItem {
  id: string;
  name: string;
  company: string | null;
  status: string;
  projectsCount: number;
  revenue: number;
  outstanding: number;
}

interface ChartDataItem {
  name: string;
  amount: number;
}

interface PieDataItem {
  name: string;
  value: number;
}

interface RevenueClientProps {
  metrics: MetricItem;
  topClients: TopClientItem[];
  trendData: ChartDataItem[];
  clientRevenueData: ChartDataItem[];
  pieData: PieDataItem[];
}

const COLORS = {
  Paid: '#10b981',     // emerald-500
  Sent: '#3b82f6',     // blue-500
  Draft: '#64748b',    // slate-500
  Overdue: '#ef4444'   // red-500
};

export default function RevenueClient({
  metrics,
  topClients,
  trendData,
  clientRevenueData,
  pieData
}: RevenueClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
      case 'Lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Revenue (Paid)</p>
          <p className="text-2xl font-bold mt-2 text-emerald-500">{formatCurrency(metrics.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total closed cashflow</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Awaiting Collection</p>
          <p className="text-2xl font-bold mt-2 text-amber-500">{formatCurrency(metrics.outstandingRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Outstanding receivables</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Contract Value</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(metrics.averageProjectValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Per project opportunity</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Client LTV</p>
          <p className="text-2xl font-bold mt-2 text-indigo-500">{formatCurrency(metrics.clientLTV)}</p>
          <p className="text-xs text-muted-foreground mt-1">Realized value per active client</p>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2/3 width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" />
            <span>Monthly Cashflow Trend</span>
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(v) => [formatCurrency(v as number), 'Revenue']}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billings Status Pie Chart (1/3 width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-indigo-500" />
            <span>Billings Allocation</span>
          </h3>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => [formatCurrency(v as number), 'Amount']}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block" 
                  style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] }}
                />
                <span className="text-muted-foreground">{d.name} ({formatCurrency(d.value)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clients Table (2/3 width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span>Client Lifetime Leaderboard</span>
            <span className="text-xs bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
              Top 5
            </span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-3">
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5 text-center">Projects</th>
                  <th className="py-2.5 text-right">Outstanding</th>
                  <th className="py-2.5 text-right">Lifetime Paid</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-foreground">{client.name}</div>
                      {client.company && (
                        <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                          <Building className="h-3 w-3 mr-1 text-slate-500" />
                          <span>{client.company}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{client.projectsCount}</td>
                    <td className="py-3 text-right font-medium text-amber-500">
                      {client.outstanding > 0 ? formatCurrency(client.outstanding) : '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-500">
                      {formatCurrency(client.revenue)}
                    </td>
                    <td className="py-3 text-right">
                      <Link 
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {topClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground italic">
                      No client revenue logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Revenue Distribution Bar Chart (1/3 width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center">
            <Users className="h-4 w-4 mr-2 text-indigo-500" />
            <span>Distribution by Client</span>
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientRevenueData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip 
                  formatter={(v) => [formatCurrency(v as number), 'Paid Revenue']}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
