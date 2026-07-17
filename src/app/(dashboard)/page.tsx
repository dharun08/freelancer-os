import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { 
  Users, 
  FolderKanban, 
  Target, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Clock,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  BellRing,
  ArrowUpRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // 1. Fetch data concurrently
  const [clients, projects, leads, invoices, followUps] = await Promise.all([
    db.client.findMany(),
    db.project.findMany({ include: { client: true } }),
    db.lead.findMany(),
    db.invoice.findMany({ include: { client: true } }),
    db.followUp.findMany({ 
      where: { status: 'Pending' },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
      take: 5
    })
  ]);

  // 2. Compute Dashboard Cards Metrics
  const activeClients = clients.filter(c => c.status === 'Active').length;
  
  const openProjects = projects.filter(p => ['Planning', 'In Progress', 'Review'].includes(p.status)).length;
  
  const activeLeads = leads.filter(l => ['Prospect', 'Contacted', 'Proposal Sent', 'Negotiating'].includes(l.status));
  const pipelineValue = activeLeads.reduce((sum, l) => sum + l.pipelineValue, 0);

  const outstandingInvoicesList = invoices.filter(i => i.status !== 'Paid');
  const outstandingInvoicesCount = outstandingInvoicesList.length;
  const outstandingBalance = outstandingInvoicesList.reduce((sum, i) => sum + i.outstandingAmount, 0);

  // Earnings this month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthPaid = invoices.filter(i => {
    const issueDate = new Date(i.issueDate);
    return i.status === 'Paid' && issueDate >= currentMonthStart;
  });
  const revenueThisMonth = currentMonthPaid.reduce((sum, i) => sum + i.totalAmount, 0);

  // Upcoming deadlines (projects ending in the next 14 days)
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingDeadlinesCount = projects.filter(p => {
    if (!p.plannedEndDate) return false;
    const end = new Date(p.plannedEndDate);
    return p.status !== 'Completed' && end >= now && end <= fourteenDaysFromNow;
  }).length;

  // Follow-ups due today or overdue
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const followUpsDueCount = followUps.filter(f => new Date(f.dueDate) <= todayEnd).length;

  // 3. Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time snapshot of client outreach, contract stages, and monthly cashflow metrics.
          </p>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Clients */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Active Clients</span>
            <span className="text-3xl font-extrabold text-foreground block">{activeClients}</span>
            <span className="text-xs text-muted-foreground block">Partnered accounts</span>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Users className="h-5 w-5" />
          </span>
        </div>

        {/* Open Projects */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Open Projects</span>
            <span className="text-3xl font-extrabold text-foreground block">{openProjects}</span>
            <span className="text-xs text-muted-foreground block">Active opportunities</span>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <FolderKanban className="h-5 w-5" />
          </span>
        </div>

        {/* Pipeline Value */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pipeline Value</span>
            <span className="text-3xl font-extrabold text-indigo-500 block">{formatCurrency(pipelineValue)}</span>
            <span className="text-xs text-muted-foreground block">Sales prospects value</span>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Target className="h-5 w-5" />
          </span>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Receivables</span>
            <span className="text-3xl font-extrabold text-amber-500 block">{formatCurrency(outstandingBalance)}</span>
            <span className="text-xs text-muted-foreground block">{outstandingInvoicesCount} unpaid invoices</span>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Receipt className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Earnings This Month */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-center col-span-1">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Revenue This Month</span>
            <span className="text-2xl font-bold text-emerald-500 mt-1 block">{formatCurrency(revenueThisMonth)}</span>
            <span className="text-xs text-muted-foreground block mt-1">Cleared payouts</span>
          </div>
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <DollarSign className="h-6 w-6" />
          </span>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-center col-span-1">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Upcoming Deadlines</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{upcomingDeadlinesCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">Ending in next 14 days</span>
          </div>
          <span className="p-3 bg-muted rounded-xl text-slate-500">
            <Calendar className="h-6 w-6" />
          </span>
        </div>

        {/* Follow-Ups Due */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex justify-between items-center col-span-1">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Follow-Ups Due</span>
            <span className="text-2xl font-bold text-indigo-500 mt-1 block font-sans">{followUpsDueCount}</span>
            <span className="text-xs text-muted-foreground block mt-1">Tasks scheduled for today</span>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Clock className="h-6 w-6" />
          </span>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Recent activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-4">Quick Operations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/leads"
                className="flex items-center space-x-2.5 p-3.5 bg-muted/40 hover:bg-primary/5 border border-border/80 hover:border-primary/20 rounded-xl transition-all"
              >
                <PlusCircle className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-foreground">Add Sales Lead</span>
              </Link>
              <Link 
                href="/invoices"
                className="flex items-center space-x-2.5 p-3.5 bg-muted/40 hover:bg-primary/5 border border-border/80 hover:border-primary/20 rounded-xl transition-all"
              >
                <PlusCircle className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-foreground">Generate Invoice</span>
              </Link>
              <Link 
                href="/follow-ups"
                className="flex items-center space-x-2.5 p-3.5 bg-muted/40 hover:bg-primary/5 border border-border/80 hover:border-primary/20 rounded-xl transition-all"
              >
                <PlusCircle className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-foreground">Log Follow-Up</span>
              </Link>
            </div>
          </div>

          {/* Active Projects Table */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-bold text-base">Active Contracts</h3>
              <Link href="/projects" className="text-xs text-primary hover:underline flex items-center">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No active contracts found.</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-muted/10 p-3.5 border border-border/60 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{p.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Client: <strong className="text-foreground">{p.client.name}</strong> • Budget: {formatCurrency(p.budget)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-200/20 px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Upcoming Follow-ups list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-bold text-base flex items-center">
                <BellRing className="h-4.5 w-4.5 mr-2 text-indigo-500" />
                <span>Outreach Reminders</span>
              </h3>
              <Link href="/follow-ups" className="text-xs text-primary hover:underline flex items-center">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {followUps.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center italic">No outreach reminders pending.</p>
              ) : (
                followUps.map((f) => (
                  <div key={f.id} className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-xs text-foreground line-clamp-2">{f.title}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50 px-1.5 py-0.2 rounded-full shrink-0">
                        {f.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>Client: {f.client.name}</span>
                      <span>{new Date(f.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
