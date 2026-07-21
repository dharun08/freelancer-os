'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function updateProfileSettingsAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string || null;
  const logoUrl = formData.get('logoUrl') as string || null;

  if (!name) {
    return { error: 'Name is required.' };
  }

  try {
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        name,
        companyName,
        logoUrl,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update profile settings:', error);
    return { error: 'Failed to update profile settings.' };
  }
}

export async function updatePreferencesAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  const currency = formData.get('currency') as string;
  const timeZone = formData.get('timeZone') as string;
  const dateFormat = formData.get('dateFormat') as string;

  if (!currency || !timeZone || !dateFormat) {
    return { error: 'All preferences fields are required.' };
  }

  try {
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        currency,
        timeZone,
        dateFormat,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return { error: 'Failed to update preferences.' };
  }
}
