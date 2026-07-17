'use strict';
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createFollowUpAction, completeFollowUpAction, deleteFollowUpAction } from '@/app/actions/followups';
import { 
  Plus, 
  Trash2, 
  Check, 
  Mail, 
  Phone, 
  Video, 
  MessageSquare, 
  MessageCircle,
  Calendar,
  Clock,
  X,
  Loader2,
  BellRing
} from 'lucide-react';

interface FollowUp {
  id: string;
  title: string;
  type: string; // Email, Call, Meeting, LinkedIn, WhatsApp
  dueDate: Date;
  status: string; // Pending, Completed
  notes: string | null;
  clientId: string;
  client: {
    id: string;
    name: string;
    company: string | null;
  };
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface FollowUpsClientProps {
  initialFollowUps: FollowUp[];
  clients: ClientOption[];
}

type TabType = 'today' | 'upcoming' | 'overdue' | 'completed';

export default function FollowUpsClient({ initialFollowUps, clients }: FollowUpsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('today');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Date constants for filter logic
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Grouping/Filtering follow-ups
  const categorizedFollowUps = initialFollowUps.reduce((acc, f) => {
    const dueDate = new Date(f.dueDate);
    
    if (f.status === 'Completed') {
      acc.completed.push(f);
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      acc.today.push(f);
    } else if (dueDate > todayEnd) {
      acc.upcoming.push(f);
    } else if (dueDate < todayStart) {
      acc.overdue.push(f);
    }
    return acc;
  }, { today: [], upcoming: [], overdue: [], completed: [] } as Record<TabType, FollowUp[]>);

  const activeList = categorizedFollowUps[activeTab] || [];

  // Actions
  const handleCreateFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createFollowUpAction(formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setCreateModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleMarkCompleted = (id: string) => {
    startTransition(async () => {
      const result = await completeFollowUpAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDeleteFollowUp = (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    startTransition(async () => {
      const result = await deleteFollowUpAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  // Icon selector based on communication medium
  const getCommIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'Call':
        return <Phone className="h-4 w-4 text-emerald-500" />;
      case 'Meeting':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'LinkedIn':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'WhatsApp':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-500" />;
    }
  };

  const getCommBadgeStyle = (type: string) => {
    switch (type) {
      case 'Email':
        return 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50';
      case 'Call':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
      case 'Meeting':
        return 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      case 'LinkedIn':
        return 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
      case 'WhatsApp':
        return 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-900/50';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top controls and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-background border border-border rounded-xl p-1 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'today' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Due Today</span>
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-indigo-500/10 text-indigo-500 rounded-full font-medium">
              {categorizedFollowUps.today.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Upcoming</span>
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-slate-500/10 text-slate-500 rounded-full font-medium">
              {categorizedFollowUps.upcoming.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overdue' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Overdue</span>
            {categorizedFollowUps.overdue.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-medium animate-pulse">
                {categorizedFollowUps.overdue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'completed' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Completed</span>
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-emerald-500/10 text-emerald-500 rounded-full font-medium">
              {categorizedFollowUps.completed.length}
            </span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (clients.length === 0) {
              alert('Please create a Client first before logging a follow-up reminder.');
              return;
            }
            setFormError('');
            setCreateModalOpen(true);
          }}
          className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Log Follow-Up</span>
        </button>
      </div>

      {/* Empty State */}
      {activeList.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border text-center">
          <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No follow-ups in this section</h3>
          <p className="text-muted-foreground text-sm max-w-xs mt-1">
            Maintain high client retention by scheduling recurring outreach calls, emails, and LinkedIn follow-ups.
          </p>
        </div>
      )}

      {/* Active Follow-Ups list */}
      {activeList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeList.map((f) => (
            <div 
              key={f.id}
              className="bg-card border border-border hover:border-primary/30 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 bg-muted rounded-xl shrink-0">
                      {getCommIcon(f.type)}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{f.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Client: <span className="text-foreground font-semibold">{f.client.name}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCommBadgeStyle(f.type)}`}>
                    {f.type}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-4 mb-4">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span>
                    Due: {new Date(f.dueDate).toLocaleDateString()} at{' '}
                    {new Date(f.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {f.notes && (
                  <div className="p-3 bg-muted/40 border border-border/50 rounded-xl text-xs text-muted-foreground italic mb-4 whitespace-pre-wrap">
                    {f.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/60">
                {f.status === 'Pending' && (
                  <button
                    onClick={() => handleMarkCompleted(f.id)}
                    className="flex items-center space-x-1.5 text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Complete</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteFollowUp(f.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer border border-transparent hover:border-red-500/10"
                  title="Delete Reminder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Log Follow-Up Reminder</h2>

            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Reminder Title / Action *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Schedule discovery call, Review design invoice"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Select Client *
                </label>
                <select
                  name="clientId"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Outreach Medium
                  </label>
                  <select
                    name="type"
                    defaultValue="Email"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Email">Email</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Notes / Context
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Specific details on what needs to be discussed or sent..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 disabled:opacity-60 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
