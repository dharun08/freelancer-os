'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme/ThemeProvider';
import { logoutAction } from '@/app/actions/auth';
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  Receipt,
  Clock,
  LineChart,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Search,
  User as UserIcon,
  ChevronRight,
  Home,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2
} from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    companyName: string | null;
    logoUrl: string | null;
    role?: string;
    isAdmin?: boolean;
  };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigationSections = [
    {
      title: 'WORKSPACE',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', href: '/leads', icon: Target },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Follow-Ups', href: '/follow-ups', icon: Clock },
        { name: 'Invoices', href: '/invoices', icon: Receipt },
        { name: 'Revenue Analytics', href: '/revenue', icon: LineChart },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
    ...(user.isAdmin
      ? [
          {
            title: 'ADMIN',
            items: [
              { name: 'Beta Applicants', href: '/admin/beta-applicants', icon: ShieldCheck },
            ],
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    // Client-safe feedback acknowledgement
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackModalOpen(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-200">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2">
            {user.logoUrl ? (
              <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img src={user.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0">
                <span className="text-white font-extrabold text-sm">F</span>
              </div>
            )}
            <span className="text-lg font-bold tracking-tight text-foreground">
              Freelancer<span className="text-indigo-500 font-extrabold">OS</span>
            </span>
          </Link>
          <button
            className="rounded-lg p-1.5 hover:bg-muted md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-5 px-4 py-5 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Workspace Info Footer */}
        <div className="border-t border-border p-4 bg-muted/40">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.companyName || 'Freelancer'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center flex-1 max-w-lg">
            <button
              className="mr-4 rounded-lg p-2 hover:bg-muted md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search clients, projects, or invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-muted/50 border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Home Icon */}
            <Link
              href="/dashboard"
              className="rounded-xl p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Dashboard"
              aria-label="Dashboard"
            >
              <Home className="h-4 w-4" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-semibold">
                  <UserIcon className="h-4 w-4" />
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-20 py-1.5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <Link
                        href="/admin/beta-applicants"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-indigo-500 hover:bg-indigo-500/10 transition-colors duration-150"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Beta Applicants</span>
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Persistent Beta Indicator Banner */}
        <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Private Beta
            </span>
            <span className="text-foreground/90 font-medium">
              We'd love your feedback as we refine Freelancer OS with our early users.
            </span>
          </div>
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm cursor-pointer shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Send Feedback</span>
          </button>
        </div>

        {/* Feedback Modal */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>

              {feedbackSent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Thank you for your feedback!</h3>
                  <p className="text-xs text-muted-foreground">
                    Your insights help make Freelancer OS better for every solo creator.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                      <span>Share Beta Feedback</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Encountered a bug or have an idea to improve your workflow? Let us know!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Your Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what's working well or what we should improve..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={`mailto:support@freelanceros.com?subject=Freelancer OS Beta Feedback - ${user.name}`}
                      className="text-xs text-indigo-500 hover:underline font-medium"
                    >
                      Or email us directly
                    </a>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setFeedbackModalOpen(false)}
                        className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
