import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { role: true, email: true },
  });

  if (!user) return false;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && user.email.toLowerCase() === adminEmail) {
    return true;
  }

  // Default seed/founder email fallback
  if (user.email.toLowerCase() === 'seed@example.com') {
    return true;
  }

  return user.role === 'ADMIN';
}
