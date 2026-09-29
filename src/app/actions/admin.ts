'use strict';
'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function approveBetaApplicantAction(id: string, originUrl?: string) {
  const isAuthorized = await isAdmin();
  if (!isAuthorized) {
    return { error: 'Unauthorized. Admin access required.' };
  }

  try {
    const applicant = await db.betaApplicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return { error: 'Applicant not found.' };
    }

    // Generate cryptographically secure random single-use token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const updated = await db.betaApplicant.update({
      where: { id },
      data: {
        status: 'APPROVED',
        inviteToken,
        inviteExpiresAt,
      },
    });

    revalidatePath('/admin/beta-applicants');
    revalidatePath('/admin/applicants');

    const baseUrl = originUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl.replace(/\/+$/, '')}/accept-invite?token=${inviteToken}`;

    return {
      success: true,
      inviteLink,
      applicant: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
      },
    };
  } catch (error) {
    console.error('[approveBetaApplicantAction Exception]:', error);
    return { error: 'Failed to approve applicant. Please try again.' };
  }
}

export async function rejectBetaApplicantAction(id: string) {
  const isAuthorized = await isAdmin();
  if (!isAuthorized) {
    return { error: 'Unauthorized. Admin access required.' };
  }

  try {
    const applicant = await db.betaApplicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return { error: 'Applicant not found.' };
    }

    await db.betaApplicant.update({
      where: { id },
      data: {
        status: 'REJECTED',
        inviteToken: null,
        inviteExpiresAt: null,
      },
    });

    revalidatePath('/admin/beta-applicants');
    revalidatePath('/admin/applicants');
    return { success: true };
  } catch (error) {
    console.error('[rejectBetaApplicantAction Exception]:', error);
    return { error: 'Failed to reject applicant.' };
  }
}
