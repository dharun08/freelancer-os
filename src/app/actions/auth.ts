'use strict';
'use server';

import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null;
}

export async function registerAction(prevState: any, formData: FormData) {
  // Direct public registration is closed during private beta.
  // Registration is only permitted via approved invitation tokens at /accept-invite.
  return {
    error: 'Freelancer OS is currently in invite-only private beta. Direct registration is disabled. Please apply for beta access at /join-beta.',
  };
}

export async function loginAction(prevState: any, formData: FormData) {
  const emailInput = formData.get('email') as string || '';
  const password = formData.get('password') as string || '';

  const email = emailInput.trim().toLowerCase();

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordsMatch) {
      return { error: 'Invalid email or password.' };
    }

    await createSession(user.id);
  } catch (error: any) {
    console.error('[loginAction Exception]:', error);
    return { error: error?.message || 'Something went wrong during login.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}

export async function getInviteDetails(token: string) {
  if (!token || typeof token !== 'string') return null;

  try {
    const applicant = await db.betaApplicant.findUnique({
      where: { inviteToken: token },
    });

    if (!applicant) return null;
    if (applicant.status !== 'APPROVED') return null;
    if (applicant.claimedAt) return null;
    if (!applicant.inviteExpiresAt || applicant.inviteExpiresAt < new Date()) return null;

    return {
      name: applicant.name,
      email: applicant.email,
    };
  } catch (error) {
    console.error('[getInviteDetails Exception]:', error);
    return null;
  }
}

export async function acceptInviteAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const name = (formData.get('name') as string || '').trim();
  const password = formData.get('password') as string || '';
  const companyName = (formData.get('companyName') as string || '').trim();

  if (!token || !name || !password) {
    return { error: 'All required fields must be filled.' };
  }

  try {
    const applicant = await db.betaApplicant.findUnique({
      where: { inviteToken: token },
    });

    if (!applicant || applicant.status !== 'APPROVED' || applicant.claimedAt) {
      return { error: 'This invitation link is invalid or has already been used.' };
    }

    if (!applicant.inviteExpiresAt || applicant.inviteExpiresAt < new Date()) {
      return { error: 'This invitation has expired. Please contact support.' };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: passwordError };
    }

    const existingUser = await db.user.findUnique({
      where: { email: applicant.email.toLowerCase() },
    });

    if (existingUser) {
      return { error: 'An account with this email address already exists. Please login.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: applicant.email.toLowerCase(),
          passwordHash,
          companyName: companyName || null,
          role: 'USER',
        },
      });

      // Mark invitation as claimed, update status to REGISTERED, link userId, and clear single-use token
      await tx.betaApplicant.update({
        where: { id: applicant.id },
        data: {
          status: 'REGISTERED',
          userId: user.id,
          claimedAt: new Date(),
          inviteToken: null,
        },
      });

      return user;
    });

    await createSession(newUser.id);
  } catch (error: any) {
    console.error('[acceptInviteAction Exception]:', error);
    return { error: error?.message || 'Failed to complete registration.' };
  }

  redirect('/dashboard');
}
