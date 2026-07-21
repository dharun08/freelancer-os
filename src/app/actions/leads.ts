'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createLeadAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const title = formData.get('title') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string || null;
  const company = formData.get('company') as string || null;
  const status = formData.get('status') as string || 'Prospect';
  const pipelineValue = parseFloat(formData.get('pipelineValue') as string || '0.0');
  const notes = formData.get('notes') as string || null;

  if (!title || !contactName || !email) {
    return { error: 'Title, contact name, and email are required.' };
  }

  try {
    const lead = await db.lead.create({
      data: {
        title,
        contactName,
        email,
        phone,
        company,
        status,
        pipelineValue,
        notes,
        userId: session.userId,
      },
    });
    revalidatePath('/leads');
    return { success: true, lead };
  } catch (error) {
    console.error('Failed to create lead:', error);
    return { error: 'Something went wrong while creating the lead.' };
  }
}

export async function updateLeadStatusAction(id: string, status: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.lead.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Lead not found.' };
    }

    const lead = await db.lead.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/leads');
    return { success: true, lead };
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { error: 'Failed to update lead status.' };
  }
}

export async function updateLeadAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const title = formData.get('title') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string || null;
  const company = formData.get('company') as string || null;
  const status = formData.get('status') as string;
  const pipelineValue = parseFloat(formData.get('pipelineValue') as string || '0.0');
  const notes = formData.get('notes') as string || null;

  if (!title || !contactName || !email) {
    return { error: 'Title, contact name, and email are required.' };
  }

  try {
    const existing = await db.lead.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Lead not found.' };
    }

    const lead = await db.lead.update({
      where: { id },
      data: {
        title,
        contactName,
        email,
        phone,
        company,
        status,
        pipelineValue,
        notes,
      },
    });
    revalidatePath('/leads');
    return { success: true, lead };
  } catch (error) {
    console.error('Failed to update lead:', error);
    return { error: 'Something went wrong while updating the lead.' };
  }
}

export async function deleteLeadAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.lead.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Lead not found.' };
    }

    await db.lead.delete({
      where: { id },
    });
    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { error: 'Something went wrong while deleting the lead.' };
  }
}

export async function convertLeadToClientAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    // 1. Fetch the lead
    const lead = await db.lead.findFirst({
      where: { id, userId: session.userId },
    });

    if (!lead) {
      return { error: 'Lead not found.' };
    }

    // 2. Perform database transaction:
    //    - Create Client
    //    - Update Lead Status to "Won" and set convertedAt
    const result = await db.$transaction(async (tx) => {
      // Check if client with this email already exists
      let client = await tx.client.findFirst({
        where: { email: lead.email, userId: session.userId },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            name: lead.contactName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: 'Active',
            notes: `Converted from Lead: ${lead.title}.\nOriginal Lead Notes:\n${lead.notes || ''}`,
            userId: session.userId,
          },
        });
      }

      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'Won',
          convertedAt: new Date(),
        },
      });

      return { client, lead: updatedLead };
    });

    revalidatePath('/leads');
    revalidatePath('/clients');
    return { success: true, client: result.client };
  } catch (error) {
    console.error('Failed to convert lead to client:', error);
    return { error: 'Something went wrong while converting lead to client.' };
  }
}
