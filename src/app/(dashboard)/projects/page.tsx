import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import ProjectsClient from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const projects = await db.project.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      client: true,
    },
    orderBy: {
      createdAt: 'desc',
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
        <h1 className="text-3xl font-extrabold tracking-tight">Project Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your ongoing contracts, review visual timelines, and log project milestones.
        </p>
      </div>

      <ProjectsClient initialProjects={projects} clients={clients} />
    </div>
  );
}
