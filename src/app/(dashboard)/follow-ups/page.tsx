import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import FollowUpsClient from './FollowUpsClient';

export const dynamic = 'force-dynamic';

export default async function FollowUpsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const followUps = await db.followUp.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      client: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  const clients = await db.client.findMany({
    where: {
      userId: session.userId,
    },
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
