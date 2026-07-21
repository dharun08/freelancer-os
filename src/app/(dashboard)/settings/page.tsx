import React from 'react';
import { db } from '@/lib/db';
import { getSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      companyName: true,
      logoUrl: true,
      currency: true,
      timeZone: true,
      dateFormat: true,
    },
  });

  if (!user) {
    await deleteSession();
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your workspace profile details and regional client invoice display preferences.
        </p>
      </div>

      <SettingsClient user={user} />
    </div>
  );
}
