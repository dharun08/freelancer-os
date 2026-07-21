import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ClientsClient from './ClientsClient';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await db.client.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      projects: true,
      invoices: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clients Database</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client accounts, view project connections, and track outstanding invoices.
          </p>
        </div>
      </div>

      <ClientsClient initialClients={clients} />
    </div>
  );
}
