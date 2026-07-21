'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string || 'Planning';
  const budget = parseFloat(formData.get('budget') as string || '0.0');
  const clientId = formData.get('clientId') as string;
  
  const startDateStr = formData.get('startDate') as string;
  const plannedEndDateStr = formData.get('plannedEndDate') as string;
  const actualEndDateStr = formData.get('actualEndDate') as string;
  
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const plannedEndDate = plannedEndDateStr ? new Date(plannedEndDateStr) : null;
  const actualEndDate = actualEndDateStr ? new Date(actualEndDateStr) : null;

  if (!name || !clientId) {
    return { error: 'Project name and client are required.' };
  }

  try {
    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        status,
        budget,
        clientId,
        startDate,
        plannedEndDate,
        actualEndDate,
        userId: session.userId,
      },
    });
    revalidatePath('/projects');
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true, project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { error: 'Something went wrong while creating the project.' };
  }
}

export async function updateProjectStatusAction(id: string, status: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.project.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Project not found.' };
    }

    const project = await db.project.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/projects');
    return { success: true, project };
  } catch (error) {
    console.error('Failed to update project status:', error);
    return { error: 'Failed to update project status.' };
  }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string;
  const budget = parseFloat(formData.get('budget') as string || '0.0');
  const clientId = formData.get('clientId') as string;
  
  const startDateStr = formData.get('startDate') as string;
  const plannedEndDateStr = formData.get('plannedEndDate') as string;
  const actualEndDateStr = formData.get('actualEndDate') as string;
  
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const plannedEndDate = plannedEndDateStr ? new Date(plannedEndDateStr) : null;
  const actualEndDate = status === 'Completed' && actualEndDateStr ? new Date(actualEndDateStr) : null;

  if (!name || !clientId) {
    return { error: 'Project name and client are required.' };
  }

  try {
    const existing = await db.project.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Project not found.' };
    }

    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    const project = await db.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        budget,
        clientId,
        startDate,
        plannedEndDate,
        actualEndDate: status === 'Completed' ? actualEndDate : null,
      },
    });
    revalidatePath('/projects');
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true, project };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { error: 'Something went wrong while updating the project.' };
  }
}

export async function deleteProjectAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.project.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Project not found.' };
    }

    await db.project.delete({
      where: { id },
    });

    revalidatePath('/projects');
    revalidatePath('/clients');
    if (existing.clientId) {
      revalidatePath(`/clients/${existing.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { error: 'Something went wrong while deleting the project.' };
  }
}
