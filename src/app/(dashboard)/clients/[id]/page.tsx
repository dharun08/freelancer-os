import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  FolderKanban, 
  Receipt, 
  Clock,
  ExternalLink 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const client = await db.client.findFirst({
    where: { id, userId: session.userId },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { issueDate: 'desc' },
      },
      followUps: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Calculate quick stats
  const totalBudget = client.projects.reduce((sum, p) => sum + p.budget, 0);
  const paidInvoices = client.invoices.filter((i) => i.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const outstandingInvoices = client.invoices.filter((i) => i.status !== 'Paid');
  const outstandingBalance = outstandingInvoices.reduce((sum, i) => sum + i.outstandingAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
      case 'Inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'Lost':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/50';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/clients"
            className="p-2 border border-border rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-3xl font-extrabold tracking-tight">{client.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>
            {client.company && (
              <p className="text-muted-foreground flex items-center mt-1 text-sm">
                <Building className="h-4 w-4 mr-1.5 text-slate-400" />
                {client.company}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Contract Budget</p>
          <p className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(totalBudget)}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {client.projects.length} projects</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Realized</p>
          <p className="text-2xl font-bold mt-2 text-emerald-500">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">From {paidInvoices.length} paid invoices</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Balance</p>
          <p className="text-2xl font-bold mt-2 text-amber-500">{formatCurrency(outstandingBalance)}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {outstandingInvoices.length} unpaid invoices</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Follow-Ups Pending</p>
          <p className="text-2xl font-bold mt-2 text-indigo-500">
            {client.followUps.filter((f) => f.status === 'Pending').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Scheduled calls/tasks</p>
        </div>
      </div>

      {/* Client Detail Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-lg border-b border-border pb-3">Contact Details</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </span>
                <a href={`mailto:${client.email}`} className="flex items-center text-primary hover:underline font-medium">
                  <Mail className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </a>
              </div>

              {client.phone && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Phone
                  </span>
                  <a href={`tel:${client.phone}`} className="flex items-center text-foreground hover:underline font-medium">
                    <Phone className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </a>
                </div>
              )}

              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Client Since
                </span>
                <div className="flex items-center font-medium">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {client.notes && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Internal Notes
                  </span>
                  <div className="p-3 bg-muted/50 border border-border/60 rounded-xl text-xs leading-relaxed text-muted-foreground italic whitespace-pre-line">
                    {client.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <FolderKanban className="h-5 w-5 mr-2 text-indigo-500" />
                <span>Associated Projects</span>
              </h3>
              <span className="text-xs bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {client.projects.length} Total
              </span>
            </div>

            {client.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No projects registered for this client.</p>
            ) : (
              <div className="space-y-3">
                {client.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-primary/25 transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{project.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Budget: {formatCurrency(project.budget)} • Status:{' '}
                        <span className="text-foreground font-medium">{project.status}</span>
                      </p>
                    </div>
                    <Link
                      href={`/projects?id=${project.id}`}
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-emerald-500" />
                <span>Invoices & Billings</span>
              </h3>
              <span className="text-xs bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {client.invoices.length} Total
              </span>
            </div>

            {client.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No invoices issued to this client.</p>
            ) : (
              <div className="space-y-3">
                {client.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-primary/25 transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {invoice.invoiceNumber}{' '}
                        <span
                          className={`ml-2 text-[10px] px-1.5 py-0.2 rounded-full border ${
                            invoice.status === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Issued: {new Date(invoice.issueDate).toLocaleDateString()} • Due:{' '}
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(invoice.totalAmount)}</p>
                      {invoice.status !== 'Paid' && (
                        <p className="text-[10px] text-amber-500 font-medium">
                          {formatCurrency(invoice.outstandingAmount)} due
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-Ups Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                <span>Follow-Up Reminders</span>
              </h3>
              <span className="text-xs bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {client.followUps.filter((f) => f.status === 'Pending').length} Pending
              </span>
            </div>

            {client.followUps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No scheduled follow-up tasks.</p>
            ) : (
              <div className="space-y-3">
                {client.followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-primary/25 transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {followUp.title}{' '}
                        <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-1.5 py-0.2 rounded-full border border-border">
                          {followUp.type}
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {new Date(followUp.dueDate).toLocaleDateString()} at{' '}
                        {new Date(followUp.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {followUp.notes && <p className="text-xs text-slate-500 mt-1 italic">{followUp.notes}</p>}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          followUp.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                        }`}
                      >
                        {followUp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
