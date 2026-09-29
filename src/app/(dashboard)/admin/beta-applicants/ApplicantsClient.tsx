'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveBetaApplicantAction, rejectBetaApplicantAction } from '@/app/actions/admin';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  X,
  UserCheck,
  UserX,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface BetaApplicant {
  id: string;
  name: string;
  email: string;
  freelanceType: string;
  activeClients: string;
  currentTools: string;
  mainProblem: string;
  status: 'PENDING' | 'APPROVED' | 'REGISTERED' | 'REJECTED';
  inviteToken: string | null;
  inviteExpiresAt: Date | null;
  claimedAt: Date | null;
  userId: string | null;
  user?: {
    id: string;
    email: string;
    createdAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicantsClientProps {
  initialApplicants: BetaApplicant[];
}

export default function ApplicantsClient({ initialApplicants }: ApplicantsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REGISTERED' | 'REJECTED'>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<BetaApplicant | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Reject confirmation dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [applicantToReject, setApplicantToReject] = useState<BetaApplicant | null>(null);

  // Approve dialog with invite link
  const [approvedLinkModal, setApprovedLinkModal] = useState<{ open: boolean; link: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Funnel metric counts
  const totalCount = initialApplicants.length;
  const pendingCount = initialApplicants.filter((a) => a.status === 'PENDING').length;
  const approvedCount = initialApplicants.filter((a) => a.status === 'APPROVED').length;
  const registeredCount = initialApplicants.filter((a) => a.status === 'REGISTERED').length;
  const rejectedCount = initialApplicants.filter((a) => a.status === 'REJECTED').length;

  // Filter applicants
  const filteredApplicants = initialApplicants.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.freelanceType.toLowerCase().includes(q) ||
      app.currentTools.toLowerCase().includes(q) ||
      app.mainProblem.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Handle Approve
  const handleApprove = (app: BetaApplicant) => {
    startTransition(async () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await approveBetaApplicantAction(app.id, origin);
      if (result.error) {
        alert(result.error);
      } else if (result.inviteLink) {
        setApprovedLinkModal({
          open: true,
          link: result.inviteLink,
          name: app.name,
        });
        router.refresh();
      }
    });
  };

  // Handle Reject Confirm
  const handleConfirmReject = () => {
    if (!applicantToReject) return;
    startTransition(async () => {
      const result = await rejectBetaApplicantAction(applicantToReject.id);
      if (result.error) {
        alert(result.error);
      } else {
        setRejectDialogOpen(false);
        setApplicantToReject(null);
        router.refresh();
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 inline-flex items-center space-x-1">
            <UserCheck className="h-3 w-3" />
            <span>REGISTERED</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20 inline-flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 inline-flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>PENDING</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 inline-flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const getAccountBadge = (app: BetaApplicant) => {
    if (app.status === 'REGISTERED' || app.userId || app.claimedAt) {
      return (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <Check className="h-3.5 w-3.5" />
          <span>Account created</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground/80 flex items-center space-x-1">
        <span>Not registered</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer bg-card border rounded-2xl p-4 shadow-sm transition-all hover:border-primary/50 ${
            statusFilter === 'ALL' ? 'ring-2 ring-primary border-primary' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-black mt-2 text-foreground">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">applicants received</p>
        </div>

        {/* Pending */}
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`cursor-pointer bg-card border rounded-2xl p-4 shadow-sm transition-all hover:border-amber-500/50 ${
            statusFilter === 'PENDING' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-foreground">{pendingCount}</p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">awaiting review</p>
        </div>

        {/* Approved */}
        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`cursor-pointer bg-card border rounded-2xl p-4 shadow-sm transition-all hover:border-blue-500/50 ${
            statusFilter === 'APPROVED' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Approved</p>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-foreground">{approvedCount}</p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">invites active</p>
        </div>

        {/* Registered */}
        <div
          onClick={() => setStatusFilter('REGISTERED')}
          className={`cursor-pointer bg-card border rounded-2xl p-4 shadow-sm transition-all hover:border-emerald-500/50 ${
            statusFilter === 'REGISTERED' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Registered</p>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-foreground">{registeredCount}</p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">accounts created</p>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`cursor-pointer bg-card border rounded-2xl p-4 shadow-sm transition-all hover:border-red-500/50 ${
            statusFilter === 'REJECTED' ? 'ring-2 ring-red-500 border-red-500' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Rejected</p>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-foreground">{rejectedCount}</p>
          <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">applications declined</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto p-1 bg-muted/60 rounded-xl">
          {(['ALL', 'PENDING', 'APPROVED', 'REGISTERED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ALL' ? 'All Applicants' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Name & Email</th>
                <th className="py-3.5 px-4">Freelance Type</th>
                <th className="py-3.5 px-4">Active Clients</th>
                <th className="py-3.5 px-4">Current Tools</th>
                <th className="py-3.5 px-4">Main Problem</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No beta applicants found</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      {searchTerm ? 'Try adjusting your search criteria' : 'New applications will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-foreground text-xs">{app.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]" title={app.email}>
                          {app.email}
                        </div>
                      </div>
                    </td>

                    {/* Freelance Type */}
                    <td className="py-3 px-4 text-foreground/90 font-medium">
                      <span className="inline-block bg-muted px-2 py-0.5 rounded-md text-[11px]">
                        {app.freelanceType}
                      </span>
                    </td>

                    {/* Active Clients */}
                    <td className="py-3 px-4 text-foreground/90 font-medium">
                      {app.activeClients}
                    </td>

                    {/* Current Tools */}
                    <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate" title={app.currentTools}>
                      {app.currentTools}
                    </td>

                    {/* Main Problem */}
                    <td className="py-3 px-4 text-muted-foreground max-w-[180px] truncate" title={app.mainProblem}>
                      {app.mainProblem}
                    </td>

                    {/* Applied Date */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Account Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getAccountBadge(app)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end space-x-1.5">
                        {/* View */}
                        <button
                          onClick={() => {
                            setSelectedApplicant(app);
                            setDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                          title="View Full Application"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Approve */}
                        {app.status !== 'REGISTERED' && (
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              app.status === 'APPROVED'
                                ? 'border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                            title={app.status === 'APPROVED' ? 'Regenerate / Copy Invite Link' : 'Approve Application'}
                          >
                            {app.status === 'APPROVED' ? 'Invite Link' : 'Approve'}
                          </button>
                        )}

                        {/* Reject */}
                        {app.status !== 'REGISTERED' && app.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              setApplicantToReject(app);
                              setRejectDialogOpen(true);
                            }}
                            disabled={isPending}
                            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-all"
                            title="Reject Application"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Details Modal */}
      {detailsModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedApplicant.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedApplicant.email}</p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Status</p>
                  <div>{getStatusBadge(selectedApplicant.status)}</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Account</p>
                  <div>{getAccountBadge(selectedApplicant)}</div>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Freelance Craft</p>
                <p className="text-foreground font-medium text-sm">{selectedApplicant.freelanceType}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Active Clients</p>
                <p className="text-foreground font-medium">{selectedApplicant.activeClients}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Current Workflow Tools</p>
                <p className="text-foreground font-medium whitespace-pre-wrap">{selectedApplicant.currentTools}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Primary Challenge / Main Problem</p>
                <p className="text-foreground font-medium whitespace-pre-wrap leading-relaxed">{selectedApplicant.mainProblem}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Submission Timestamp</p>
                <p className="text-foreground font-medium">
                  {new Date(selectedApplicant.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              {selectedApplicant.userId && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                  <p className="text-emerald-500 font-semibold uppercase tracking-wider text-[10px]">Linked User ID</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{selectedApplicant.userId}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-border">
              {selectedApplicant.status !== 'REGISTERED' && (
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleApprove(selectedApplicant);
                  }}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {selectedApplicant.status === 'APPROVED' ? 'Regenerate Invite' : 'Approve Applicant'}
                </button>
              )}
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approved Invite Link Modal */}
      {approvedLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Applicant Approved!</h3>
                <p className="text-xs text-muted-foreground">Invite link for {approvedLinkModal.name}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Send this single-use private beta invitation link directly to the candidate. When they open this link, they will create their password and activate their workspace.
            </p>

            <div className="flex items-center space-x-2 bg-muted/60 p-2 rounded-xl border border-border">
              <input
                type="text"
                readOnly
                value={approvedLinkModal.link}
                className="bg-transparent text-xs text-foreground font-mono w-full focus:outline-none truncate px-1"
              />
              <button
                onClick={() => copyToClipboard(approvedLinkModal.link)}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-all flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              This single-use cryptographic token expires in 7 days. The founder/admin never handles user passwords.
            </p>

            <button
              onClick={() => setApprovedLinkModal(null)}
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={rejectDialogOpen}
        onCancel={() => {
          setRejectDialogOpen(false);
          setApplicantToReject(null);
        }}
        onConfirm={handleConfirmReject}
        isPending={isPending}
        title="Reject Beta Application"
        description={`Are you sure you want to decline the private beta application for "${applicantToReject?.name}" (${applicantToReject?.email})?`}
      />
    </div>
  );
}
