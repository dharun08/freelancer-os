import React from 'react';
import { getSession, deleteSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    },
  });

  if (!user) {
    await deleteSession();
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
