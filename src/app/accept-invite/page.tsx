import React from 'react';
import Link from 'next/link';
import { getInviteDetails } from '@/app/actions/auth';
import AcceptInviteForm from './AcceptInviteForm';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AcceptInvitePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const resolvedSearchParams = await searchParams;
  const token = typeof resolvedSearchParams.token === 'string' ? resolvedSearchParams.token : '';

  const inviteDetails = token ? await getInviteDetails(token) : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <span className="text-white font-extrabold text-xs">F</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Freelancer<span className="text-indigo-500 font-extrabold">OS</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {!inviteDetails ? (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-5">
              <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  Invalid or Expired Invitation
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This private beta invitation link is invalid, has expired, or has already been used to create an account.
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Go to Login
                </Link>
                <Link
                  href="/join-beta"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                >
                  Apply for Beta
                </Link>
              </div>
            </div>
          ) : (
            <AcceptInviteForm
              token={token}
              name={inviteDetails.name}
              email={inviteDetails.email}
            />
          )}
        </div>
      </main>
    </div>
  );
}
