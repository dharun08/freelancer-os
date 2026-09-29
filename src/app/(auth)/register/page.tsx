'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Private Beta</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Invitation-Only Access
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Freelancer OS is currently in invite-only private beta. Direct account registration is restricted.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-xl">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-200">
            Looking for early access?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Apply to join our private beta cohort. We review applications and send single-use activation invitations within 24–48 hours.
          </p>
        </div>

        <Link
          href="/join-beta"
          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <span>Apply for Private Beta</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 text-center space-y-1.5">
        <p className="font-medium text-slate-300">
          Already received an invitation link?
        </p>
        <p className="text-slate-500">
          Please open the unique invitation link provided by your workspace administrator to set up your password and complete registration.
        </p>
      </div>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
