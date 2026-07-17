'use strict';
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createLeadAction, 
  updateLeadAction, 
  updateLeadStatusAction, 
  deleteLeadAction, 
  convertLeadToClientAction 
} from '@/app/actions/leads';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Edit2, 
  Trash2, 
  UserPlus, 
  ArrowLeftRight, 
  Building,
  Mail,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface Lead {
  id: string;
  title: string;
  contactName: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string; // Prospect, Contacted, Proposal Sent, Negotiating, Won, Lost
  pipelineValue: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadsClientProps {
  initialLeads: Lead[];
}

const STAGES = ['Prospect', 'Contacted', 'Proposal Sent', 'Negotiating', 'Won', 'Lost'];

export default function LeadsClient({ initialLeads }: LeadsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formError, setFormError] = useState('');

  // 1. Calculate Metrics
  const activeLeads = initialLeads.filter(l => ['Prospect', 'Contacted', 'Proposal Sent', 'Negotiating'].includes(l.status));
  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.pipelineValue, 0);
  
  const wonDeals = initialLeads.filter(l => l.status === 'Won').length;
  const lostDeals = initialLeads.filter(l => l.status === 'Lost').length;
  
  const totalClosed = wonDeals + lostDeals;
  const conversionRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;

  // 2. Column Grouping
  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = initialLeads.filter(l => l.status === stage);
    return acc;
  }, {} as Record<string, Lead[]>);

  // 3. Actions
  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createLeadAction(formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setCreateModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleEditLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLead) return;
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateLeadAction(selectedLead.id, formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setEditModalOpen(false);
        setSelectedLead(null);
        router.refresh();
      }
    });
  };

  const handleDeleteLead = (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    startTransition(async () => {
      const result = await deleteLeadAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleMoveStage = (id: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const currentIndex = STAGES.indexOf(currentStatus);
    let newIndex = currentIndex;
    
    if (direction === 'forward' && currentIndex < STAGES.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      startTransition(async () => {
        await updateLeadStatusAction(id, STAGES[newIndex]);
        router.refresh();
      });
    }
  };

  const handleConvertToClient = (id: string) => {
    startTransition(async () => {
      const result = await convertLeadToClientAction(id);
      if (result.error) {
        alert(result.error);
      } else if (result.client) {
        alert('Lead successfully converted to Client!');
        router.push(`/clients/${result.client.id}`);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pipeline Value</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(totalPipelineValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across active stages</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Won Deals</p>
            <p className="text-2xl font-bold mt-2 text-emerald-500">{wonDeals}</p>
            <p className="text-xs text-muted-foreground mt-1">Converted to clients</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lost Deals</p>
            <p className="text-2xl font-bold mt-2 text-red-500">{lostDeals}</p>
            <p className="text-xs text-muted-foreground mt-1">Failed to close</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
            <p className="text-2xl font-bold mt-2 text-indigo-500">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Won / Total Closed Deals</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Percent className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold">Pipeline Board</h2>
        <button
          onClick={() => {
            setFormError('');
            setCreateModalOpen(true);
          }}
          className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="overflow-x-auto pb-4 flex space-x-6 min-h-[500px]">
        {STAGES.map((stage) => {
          const leads = leadsByStage[stage] || [];
          return (
            <div key={stage} className="flex-1 min-w-[280px] max-w-[320px] bg-muted/30 rounded-2xl p-4 border border-border/60 flex flex-col h-full">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-foreground">{stage}</span>
                  <span className="bg-muted border border-border text-[10px] text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {leads.length}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {formatCurrency(leads.reduce((sum, l) => sum + l.pipelineValue, 0))}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-card/40 border border-dashed border-border/80 rounded-xl text-center">
                    <span className="text-[11px] text-muted-foreground">No leads in this stage</span>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="bg-card border border-border hover:border-primary/45 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative"
                    >
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{lead.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{lead.contactName}</p>
                      
                      {lead.company && (
                        <div className="flex items-center text-[10px] text-muted-foreground mt-1.5">
                          <Building className="h-3 w-3 mr-1 text-slate-400" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                        <span className="text-xs font-bold text-primary">{formatCurrency(lead.pipelineValue)}</span>
                        
                        {/* Control buttons */}
                        <div className="flex items-center space-x-0.5">
                          {stage === 'Won' && (
                            <button
                              onClick={() => handleConvertToClient(lead.id)}
                              className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                              title="Convert to Client Database"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setFormError('');
                              setEditModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-foreground hover:bg-muted cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Navigation controls */}
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-dashed border-border/40">
                        <button
                          disabled={STAGES.indexOf(stage) === 0}
                          onClick={() => handleMoveStage(lead.id, stage, 'backward')}
                          className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <span className="text-[9px] text-muted-foreground uppercase font-semibold">Move Stage</span>
                        <button
                          disabled={STAGES.indexOf(stage) === STAGES.length - 1}
                          onClick={() => handleMoveStage(lead.id, stage, 'forward')}
                          className="p-1 text-slate-400 hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

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
            <h2 className="text-xl font-bold mb-4">Add Sales Lead</h2>

            <form onSubmit={handleCreateLead} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Lead Title / Project Opportunity *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Website Redesign Project"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    placeholder="Sarah Jenkins"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="sarah@acme.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Status / Pipeline Stage
                  </label>
                  <select
                    name="status"
                    defaultValue="Prospect"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Est. Pipeline Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pipelineValue"
                    defaultValue="0.00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Deal Notes / Details
                </label>
                <textarea
                  name="notes"
                  rows={3}
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
                  <span>Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Lead Details</h2>

            <form onSubmit={handleEditLead} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Lead Title / Project Opportunity *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={selectedLead.title}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    defaultValue={selectedLead.contactName}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={selectedLead.company || ''}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={selectedLead.email}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={selectedLead.phone || ''}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Status / Pipeline Stage
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedLead.status}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Est. Pipeline Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pipelineValue"
                    defaultValue={selectedLead.pipelineValue}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Deal Notes / Details
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={selectedLead.notes || ''}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedLead(null);
                  }}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
