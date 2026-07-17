import React from 'react';
import { db } from '@/lib/db';
import ProjectsClient from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    include: {
      client: true,
    },
    orderBy: {
      createdAt: 'desc',
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
        <h1 className="text-3xl font-extrabold tracking-tight">Project Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your ongoing contracts, review visual timelines, and log project milestones.
        </p>
      </div>

      <ProjectsClient initialProjects={projects} clients={clients} />
    </div>
  );
}
