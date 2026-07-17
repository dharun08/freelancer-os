import React from 'react';
import { db } from '@/lib/db';
import FollowUpsClient from './FollowUpsClient';

export const dynamic = 'force-dynamic';

export default async function FollowUpsPage() {
  const followUps = await db.followUp.findMany({
    include: {
      client: true,
    },
    orderBy: {
      dueDate: 'asc',
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
        <h1 className="text-3xl font-extrabold tracking-tight">Follow-Ups & Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Stay on top of client communication, manage outreach reminders, and log your touchpoints.
        </p>
      </div>

      <FollowUpsClient initialFollowUps={followUps} clients={clients} />
    </div>
  );
}
