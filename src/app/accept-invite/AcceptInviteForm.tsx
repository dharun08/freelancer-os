'use client';

import React, { useActionState, startTransition } from 'react';
import { acceptInviteAction } from '@/app/actions/auth';
import { Sparkles, User, Mail, Lock, Building, Loader2, ArrowRight } from 'lucide-react';

interface AcceptInviteFormProps {
  token: string;
  name: string;
  email: string;
}

const initialState = {
  error: '',
};

export default function AcceptInviteForm({ token, name, email }: AcceptInviteFormProps) {
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('token', token);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Beta Invitation Accepted</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Create Your Account
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Set your private password to finish activating your Freelancer OS workspace.
        </p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500">
          {state.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={name}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        {/* Company Name (Optional) */}
        <div>
          <label htmlFor="companyName" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Business / Studio Name <span className="text-muted-foreground/60 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Building className="h-4 w-4" />
            </div>
            <input
              id="companyName"
              name="companyName"
              type="text"
              maxLength={100}
              placeholder="e.g. Studio Acme"
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Create Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 characters, uppercase, lowercase & number"
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.
          </p>
        </div>

        {/* Submit button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Workspace...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Enter Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
