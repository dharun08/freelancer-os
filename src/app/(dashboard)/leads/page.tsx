import React from 'react';
import { db } from '@/lib/db';
import LeadsClient from './LeadsClient';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
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
