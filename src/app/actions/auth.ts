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
  const name = formData.get('name') as string;
  const emailInput = formData.get('email') as string || '';
  const password = formData.get('password') as string || '';
  const companyName = formData.get('companyName') as string || '';

  const email = emailInput.trim().toLowerCase();

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required.' };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'An account with this email address already exists.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        companyName,
      },
    });

    await createSession(newUser.id);
  } catch (error: any) {
    console.error('[registerAction Exception]:', error);
    return { error: error?.message || 'Something went wrong during registration.' };
  }

  redirect('/');
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

  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
