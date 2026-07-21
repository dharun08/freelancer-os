'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createClientAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string || null;
  const company = formData.get('company') as string || null;
  const status = formData.get('status') as string || 'Active';
  const notes = formData.get('notes') as string || null;

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  try {
    const client = await db.client.create({
      data: {
        name,
        email,
        phone,
        company,
        status,
        notes,
        userId: session.userId,
      },
    });
    revalidatePath('/clients');
    return { success: true, client };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { error: 'Something went wrong while creating the client.' };
  }
}

export async function updateClientAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string || null;
  const company = formData.get('company') as string || null;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string || null;

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  try {
    // Verify client belongs to user
    const existing = await db.client.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Client not found.' };
    }

    const client = await db.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        status,
        notes,
      },
    });
    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return { success: true, client };
  } catch (error) {
    console.error('Failed to update client:', error);
    return { error: 'Something went wrong while updating the client.' };
  }
}

export async function deleteClientAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    // Verify client belongs to user
    const existing = await db.client.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Client not found.' };
    }

    await db.client.delete({
      where: { id },
    });
    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete client:', error);
    return { error: 'Something went wrong while deleting the client.' };
  }
}
