import React from 'react';
import { db } from '@/lib/db';
import InvoicesClient from './InvoicesClient';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const invoices = await db.invoice.findMany({
    include: {
      client: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  });

  const clients = await db.client.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      company: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Invoice Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Issue detailed, itemized invoices, monitor payment statuses, and review outstanding accounts balances.
        </p>
      </div>

      <InvoicesClient initialInvoices={invoices} clients={clients} />
    </div>
  );
}
