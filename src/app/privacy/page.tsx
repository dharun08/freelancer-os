import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Shield, Lock, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
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
            Legal & Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Private Beta Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground">
            Last Updated: September 2026 • Freelancer OS Private Beta
          </p>
        </div>

        {/* Beta Notice Banner */}
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-xs text-amber-500 leading-relaxed">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-sm mb-1">Important Private Beta Notice</strong>
            <span>
              Freelancer OS is an early-stage product in active private beta testing. Please do not store confidential legal documents, bank account credentials, credit card details, passwords, or highly sensitive client data in the workspace.
            </span>
          </div>
        </div>

        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed bg-card border border-border p-6 sm:p-10 rounded-3xl shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Eye className="h-4 w-4 mr-2 text-indigo-500" />
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              During the private beta, we collect information you directly provide when applying for access, creating an account, or entering data into your workspace:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground pl-2">
              <li><strong>Account Information:</strong> Your name, email address, company name, and password hash.</li>
              <li><strong>Beta Application Details:</strong> Your freelance craft, estimated active clients, and operational tool usage.</li>
              <li><strong>Workspace Content:</strong> Client names, project summaries, invoice line items, and outreach notes entered by you.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Lock className="h-4 w-4 mr-2 text-indigo-500" />
              <span>2. How We Protect Your Data</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              We employ standard cryptographic measures including bcrypt hashing for passwords and HMAC-SHA256 signed session tokens. Multi-tenant database isolation ensures that your workspace data is scoped exclusively to your authenticated user account.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Shield className="h-4 w-4 mr-2 text-indigo-500" />
              <span>3. Data Sharing & Third Parties</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              We do not sell, rent, or trade your personal or workspace information. Data is only processed on secure cloud infrastructure providers (such as Vercel and Supabase PostgreSQL) required to host and execute the application.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground">4. Data Deletion & Inquiries</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              If at any time during or after the private beta you wish to delete your account or wipe your workspace records, please reach out to us at{' '}
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
