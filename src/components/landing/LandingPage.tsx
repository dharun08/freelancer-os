'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  FolderKanban, 
  Target, 
  Receipt, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Layers,
  Palette,
  Code,
  PenTool,
  Video,
  Megaphone,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface LandingPageProps {
  isLoggedIn?: boolean;
}

export default function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  const problemItems = [
    { app: 'WhatsApp', purpose: 'Client conversations', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { app: 'Excel', purpose: 'Payments', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { app: 'Notion', purpose: 'Projects', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
    { app: 'Email', purpose: 'Leads', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { app: 'Notes', purpose: 'Follow-ups', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { app: 'Memory', purpose: 'Everything else', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  ];

  const features = [
    {
      title: 'Clients',
      description: 'Keep all your client information in one place.',
      icon: Users,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Projects',
      description: 'Track projects, deadlines and progress.',
      icon: FolderKanban,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Leads',
      description: 'Manage opportunities from prospect to won.',
      icon: Target,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
      title: 'Invoices',
      description: 'Track invoices, payments and overdue amounts.',
      icon: Receipt,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Follow-ups',
      description: 'Know who you need to contact and when.',
      icon: Clock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
  ];

  const targetRoles = [
    { label: 'Designers', icon: Palette },
    { label: 'Developers', icon: Code },
    { label: 'Writers', icon: PenTool },
    { label: 'Video Editors', icon: Video },
    { label: 'Marketers', icon: Megaphone },
    { label: 'Consultants', icon: Briefcase },
    { label: 'Other Solo Freelancers', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <header className="h-20 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <span className="text-white font-extrabold text-base">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Freelancer<span className="text-indigo-500 font-extrabold">OS</span>
          </span>
          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hidden sm:inline-block">
            Private Beta
          </span>
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/join-beta"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Join Private Beta</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-6 sm:px-12 max-w-6xl mx-auto text-center">
        {/* Glow background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Private Beta Now Open</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
          Your freelance business, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            finally organized.
          </span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl font-medium text-foreground/80 max-w-2xl mx-auto">
          Stop managing your freelance business across five different apps.
        </p>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Freelancer OS brings your clients, projects, invoices, leads and follow-ups into one simple workspace — so you always know what's happening in your freelance business.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/join-beta"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 cursor-pointer"
          >
            <span>Join Private Beta</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-base transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Product Walkthrough Video Section */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            See how Freelancer OS works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            Take a quick look at how Freelancer OS brings your clients, projects, leads, invoices and follow-ups into one place.
          </p>
        </div>

        <div className="relative mx-auto rounded-2xl sm:rounded-3xl border border-border bg-card/60 shadow-2xl shadow-indigo-500/5 p-2 sm:p-3.5 backdrop-blur-sm transition-all overflow-hidden">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 aspect-video w-full flex items-center justify-center">
            <video
              src="/freelancer-os-demo.mp4"
              controls
              playsInline
              preload="metadata"
              width={1280}
              height={720}
              className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
              title="Freelancer OS Product Walkthrough"
              aria-label="Freelancer OS product walkthrough demo video"
            >
              <source src="/freelancer-os-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* 1. Problem Section */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Your freelance business is probably scattered everywhere.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Juggling multiple apps causes missed follow-ups, lost context, and billing delays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {problemItems.map((item, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.color}`}>
                    {item.app}
                  </span>
                  <span className="text-muted-foreground font-medium text-xs">→</span>
                  <span className="text-sm font-semibold text-foreground">{item.purpose}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-base sm:text-lg font-bold text-indigo-500">
              Freelancer OS brings it together in one simple workspace.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Built specifically to eliminate clutter and streamline solo freelance operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border hover:border-indigo-500/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Target User Section */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border px-6 sm:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Built for freelancers who have outgrown spreadsheets.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
            Especially freelancers managing multiple clients and projects without needing complex business software.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {targetRoles.map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 text-sm font-semibold text-foreground"
                >
                  <Icon className="h-4 w-4 text-indigo-500" />
                  <span>{role.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Private Beta Section */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-b from-card to-card/60 border border-border rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-block mb-4">
            Early Access
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Be one of the first users.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Freelancer OS is currently in private beta. Beta access is free while we refine the product with a small group of real freelancers.
          </p>

          <div className="mt-8">
            <Link
              href="/join-beta"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <span>Join Private Beta</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-border bg-card/40 px-6 sm:px-12 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-base font-bold tracking-tight text-foreground">
                Freelancer<span className="text-indigo-500 font-extrabold">OS</span>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your freelance business, finally organized.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/join-beta" className="hover:text-foreground transition-colors">
                Join Private Beta
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <p className="flex items-center space-x-1.5 text-amber-500/90 font-medium">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>
                Private Beta: Please don't enter passwords, banking information, confidential documents, or sensitive client information.
              </span>
            </p>
            <p>© {new Date().getFullYear()} Freelancer OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
