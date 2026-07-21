import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LeadsClient from './LeadsClient';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const leads = await db.lead.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">Lead Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Track sales prospects, manage deal negotiations, and convert won deals into client records.
        </p>
      </div>

      <LeadsClient initialLeads={leads} />
    </div>
  );
}
