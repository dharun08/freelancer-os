'use client';

import React, { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { applyBetaAction, BetaApplicationState } from '@/app/actions/beta';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Send,
  User,
  Mail,
  Briefcase,
  Users,
  Layers,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const initialState: BetaApplicationState = {
  success: false,
  error: '',
};

const FREELANCE_TYPES = [
  'Designer',
  'Developer',
  'Writer',
  'Video Editor',
  'Marketer',
  'Consultant',
  'Other',
];

const ACTIVE_CLIENT_OPTIONS = ['0–1', '2–5', '6–10', '11+'];

export default function JoinBetaPage() {
  const [state, formAction, isPending] = useActionState(applyBetaAction, initialState);
  const [selectedType, setSelectedType] = React.useState('Designer');
  const [customType, setCustomType] = React.useState('');
  const [selectedClients, setSelectedClients] = React.useState('2–5');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const finalType = selectedType === 'Other' ? customType || 'Other' : selectedType;
    formData.set('freelanceType', finalType);
    formData.set('activeClients', selectedClients);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-xl">
          {state?.success ? (
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Thanks for applying!
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Freelancer OS is currently in private beta. We'll review your application and contact you if you're selected for the beta.
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Private Beta Application</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Join the Private Beta
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tell us a bit about your freelance business so we can tailor your onboarding experience.
                </p>
              </div>

              {state?.error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-500 flex items-start space-x-2">
                  <span className="font-bold shrink-0">Error:</span>
                  <span>{state.error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Your Full Name *
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
                      placeholder="e.g. Maya Chen"
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="maya@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 3. Freelance Work Type */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Freelance Work Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FREELANCE_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          selectedType === type
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {selectedType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Please specify your freelance craft..."
                      value={customType}
                      maxLength={100}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="mt-2.5 w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                </div>

                {/* 4. Active Clients */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Approximate Active Clients *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ACTIVE_CLIENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setSelectedClients(opt)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          selectedClients === opt
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Current Tools */}
                <div>
                  <label htmlFor="currentTools" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    What do you currently use to manage your freelance business? *
                  </label>
                  <textarea
                    id="currentTools"
                    name="currentTools"
                    rows={2}
                    required
                    maxLength={1000}
                    placeholder="e.g. WhatsApp for chats, Google Sheets for invoicing, Notion for tasks..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* 6. Main Problem to Organize */}
                <div>
                  <label htmlFor="mainProblem" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    What would you most like Freelancer OS to help you organize? *
                  </label>
                  <textarea
                    id="mainProblem"
                    name="mainProblem"
                    rows={2}
                    required
                    maxLength={1000}
                    placeholder="e.g. Keeping track of client follow-ups and overdue payments in one spot..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Apply for Private Beta</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
