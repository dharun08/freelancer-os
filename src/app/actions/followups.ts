'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createFollowUpAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const title = formData.get('title') as string;
  const type = formData.get('type') as string || 'Email';
  const notes = formData.get('notes') as string || null;
  const clientId = formData.get('clientId') as string;
  
  const dueDateStr = formData.get('dueDate') as string;
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();

  if (!title || !clientId || !dueDateStr) {
    return { error: 'Title, client, and due date are required.' };
  }

  try {
    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    const followUp = await db.followUp.create({
      data: {
        title,
        type,
        dueDate,
        status: 'Pending',
        notes,
        clientId,
        userId: session.userId,
      },
    });

    revalidatePath('/follow-ups');
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true, followUp };
  } catch (error) {
    console.error('Failed to create follow up:', error);
    return { error: 'Something went wrong while creating the follow-up.' };
  }
}

export async function completeFollowUpAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.followUp.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Follow-up not found.' };
    }

    const followUp = await db.followUp.update({
      where: { id },
      data: {
        status: 'Completed',
      },
    });

    revalidatePath('/follow-ups');
    revalidatePath('/clients');
    revalidatePath(`/clients/${followUp.clientId}`);
    return { success: true, followUp };
  } catch (error) {
    console.error('Failed to complete follow up:', error);
    return { error: 'Something went wrong while updating the follow-up.' };
  }
}

export async function deleteFollowUpAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.followUp.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Follow-up not found.' };
    }

    await db.followUp.delete({
      where: { id },
    });

    revalidatePath('/follow-ups');
    revalidatePath('/clients');
    if (existing.clientId) {
      revalidatePath(`/clients/${existing.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete follow up:', error);
    return { error: 'Something went wrong while deleting the follow-up.' };
  }
}
