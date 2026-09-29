'use strict';
'use server';

import { db } from '@/lib/db';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

export interface BetaApplicationState {
  success?: boolean;
  error?: string;
}

export async function applyBetaAction(
  prevState: BetaApplicationState,
  formData: FormData
): Promise<BetaApplicationState> {
  const name = (formData.get('name') as string || '').trim();
  const emailInput = (formData.get('email') as string || '').trim();
  const freelanceType = (formData.get('freelanceType') as string || '').trim();
  const activeClients = (formData.get('activeClients') as string || '').trim();
  const currentTools = (formData.get('currentTools') as string || '').trim();
  const mainProblem = (formData.get('mainProblem') as string || '').trim();

  // 1. Validate required fields
  if (!name || !emailInput || !freelanceType || !activeClients || !currentTools || !mainProblem) {
    return { error: 'Please fill in all required fields.' };
  }

  // 2. Character length validations
  if (name.length > 100) {
    return { error: 'Name cannot exceed 100 characters.' };
  }

  if (freelanceType.length > 100) {
    return { error: 'Freelance work type cannot exceed 100 characters.' };
  }

  if (currentTools.length > 1000) {
    return { error: 'Current tools description cannot exceed 1,000 characters.' };
  }

  if (mainProblem.length > 1000) {
    return { error: 'Main problem description cannot exceed 1,000 characters.' };
  }

  // 3. Email validation & normalization
  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    // 4. Privacy-safe deduplication check
    // If applicant with this email already exists in PENDING or APPROVED status,
    // we return success gracefully without throwing an error or leaking applicant records.
    const existing = await db.betaApplicant.findFirst({
      where: {
        email,
        status: { in: ['PENDING', 'APPROVED', 'REGISTERED'] },
      },
    });

    if (existing) {
      // Safe acknowledgement without database leak
      return { success: true };
    }

    // 5. Create new applicant record
    await db.betaApplicant.create({
      data: {
        name,
        email,
        freelanceType,
        activeClients,
        currentTools,
        mainProblem,
        status: 'PENDING',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[applyBetaAction Exception]:', error);
    return { error: 'An unexpected error occurred while submitting your application. Please try again.' };
  }
}
