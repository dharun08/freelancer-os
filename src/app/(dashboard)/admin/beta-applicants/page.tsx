import React from 'react';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import ApplicantsClient from './ApplicantsClient';

export const dynamic = 'force-dynamic';

export default async function AdminBetaApplicantsPage() {
  const isAuthorized = await isAdmin();
  if (!isAuthorized) {
    redirect('/dashboard');
  }

  const applicants = await db.betaApplicant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Beta Applicants</h1>
        <p className="text-muted-foreground mt-1">
          Review, approve, and track private beta candidate onboarding and account creation.
        </p>
      </div>

      <ApplicantsClient initialApplicants={applicants} />
    </div>
  );
}
