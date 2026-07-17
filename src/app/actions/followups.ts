'use strict';
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createFollowUpAction(formData: FormData) {
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
    const followUp = await db.followUp.create({
      data: {
        title,
        type,
        dueDate,
        status: 'Pending',
        notes,
        clientId,
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
  try {
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
  try {
    const followUp = await db.followUp.findUnique({
      where: { id },
      select: { clientId: true },
    });

    await db.followUp.delete({
      where: { id },
    });

    revalidatePath('/follow-ups');
    revalidatePath('/clients');
    if (followUp?.clientId) {
      revalidatePath(`/clients/${followUp.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete follow up:', error);
    return { error: 'Something went wrong while deleting the follow-up.' };
  }
}
