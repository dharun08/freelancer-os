import React from 'react';
import LandingPage from '@/components/landing/LandingPage';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const session = await getSession();
  return <LandingPage isLoggedIn={!!session} />;
}
