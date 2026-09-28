import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Sparkles, Scale, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30">
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
      <main className="flex-1 py-12 px-6 sm:px-12 max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Private Beta Terms
          </h1>
          <p className="text-xs text-muted-foreground">
            Effective Date: September 2026 • Freelancer OS Private Beta Program
          </p>
        </div>

        {/* Beta Notice Banner */}
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-xs text-amber-500 leading-relaxed">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-sm mb-1">Private Beta Agreement</strong>
            <span>
              By accessing Freelancer OS during this private beta period, you acknowledge that the platform is under active development and may experience feature adjustments, service interruptions, or software bugs.
            </span>
          </div>
        </div>

        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed bg-card border border-border p-6 sm:p-10 rounded-3xl shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
              <span>1. Beta Program Scope & Access</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Freelancer OS provides access to this private beta free of charge to a selected group of early freelancers. Access is granted at our sole discretion through invitation tokens and may be modified, suspended, or discontinued as we iterate towards general release.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Scale className="h-4 w-4 mr-2 text-indigo-500" />
              <span>2. Acceptable Use & User Responsibility</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              You agree to use the workspace solely for lawful freelance management purposes. You agree not to upload malicious software, attempt unauthorized data access, probe system vulnerabilities, or store sensitive financial/banking credentials or confidential client agreements.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-indigo-500" />
              <span>3. Product Iterations & Availability</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              As part of the beta process, we continuously deploy updates, performance refinements, and schema adjustments. While we strive for seamless uptime and data persistence, the service is provided on an "as-is" and "as-available" basis without express warranties.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground">4. Feedback & Intellectual Property</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Any feedback, suggestions, or ideas you submit regarding Freelancer OS may be utilized to improve the platform without obligation or compensation. All software design, codebase, and branding remain the property of Freelancer OS.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground">5. Contact</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              For questions regarding these beta terms, please contact us at{' '}
              <a href="mailto:support@freelanceros.com" className="text-indigo-500 underline font-medium">
                support@freelanceros.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 px-6 sm:px-12 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Freelancer OS Private Beta.
      </footer>
    </div>
  );
}
