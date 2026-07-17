import React from 'react';
import { db } from '@/lib/db';
import RevenueClient from './RevenueClient';

export const dynamic = 'force-dynamic';

export default async function RevenuePage() {
  const invoices = await db.invoice.findMany({
    include: {
      client: true,
    },
  });

  const clients = await db.client.findMany({
    include: {
      invoices: true,
      projects: true,
    },
  });

  const projects = await db.project.findMany();

  // 1. Calculate General Metrics
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const outstandingRevenue = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);

  const averageProjectValue = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.budget, 0) / projects.length 
    : 0;

  const activeClientsCount = clients.filter((c) => c.status === 'Active').length;
  const clientLTV = activeClientsCount > 0 ? totalRevenue / activeClientsCount : 0;

  // 2. Build Top Clients list (sorted by paid invoice sums)
  const topClients = clients
    .map((c) => {
      const revenue = c.invoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, i) => sum + i.totalAmount, 0);
      const outstanding = c.invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
      return {
        id: c.id,
        name: c.name,
        company: c.company,
        status: c.status,
        projectsCount: c.projects.length,
        revenue,
        outstanding,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // top 5 clients

  // 3. Chart: Monthly Trend line (past 6 months)
  const trendData = [];
  const tempDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(tempDate.getFullYear(), tempDate.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    
    const monthlyPaid = invoices.filter((inv) => {
      const issue = new Date(inv.issueDate);
      return (
        inv.status === 'Paid' &&
        issue.getMonth() === d.getMonth() &&
        issue.getFullYear() === d.getFullYear()
      );
    });
    
    const amount = monthlyPaid.reduce((sum, inv) => sum + inv.totalAmount, 0);
    trendData.push({ name: label, amount });
  }

  // 4. Chart: Revenue by Client (Top 5 clients)
  const clientRevenueData = clients
    .map((c) => {
      const amount = c.invoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, i) => sum + i.totalAmount, 0);
      return { name: c.name, amount };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 5. Chart: Invoice Status Pie Chart
  const statusSummary = { Draft: 0, Sent: 0, Paid: 0, Overdue: 0 };
  invoices.forEach((inv) => {
    const isOverdue = inv.status !== 'Paid' && new Date(inv.dueDate) < new Date();
    if (isOverdue) {
      statusSummary.Overdue += inv.totalAmount;
    } else if (inv.status in statusSummary) {
      statusSummary[inv.status as keyof typeof statusSummary] += inv.totalAmount;
    }
  });

  const pieData = Object.entries(statusSummary).map(([name, value]) => ({
    name,
    value,
  }));

  const metrics = {
    totalRevenue,
    outstandingRevenue,
    averageProjectValue,
    clientLTV,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Revenue Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Perform high-level audits on your business financials, review cashflows, and analyze client LTVs.
        </p>
      </div>

      <RevenueClient
        metrics={metrics}
        topClients={topClients}
        trendData={trendData}
        clientRevenueData={clientRevenueData}
        pieData={pieData}
      />
    </div>
  );
}
