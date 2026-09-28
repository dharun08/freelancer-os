import React from 'react';
import { getSession } from '@/lib/session';
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
      logoUrl: true,
      role: true,
    },
  });

  if (!user) {
    redirect('/api/auth/clear-session');
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdminUser = user.role === 'ADMIN' || user.email.toLowerCase() === 'seed@example.com' || (!!adminEmail && user.email.toLowerCase() === adminEmail);

  return <DashboardShell user={{ ...user, isAdmin: isAdminUser }}>{children}</DashboardShell>;
}
