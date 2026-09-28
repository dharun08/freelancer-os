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
  X
} from 'lucide-react';

interface BetaApplicant {
  id: string;
  name: string;
  email: string;
  freelanceType: string;
  activeClients: string;
  currentTools: string;
  mainProblem: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  inviteToken: string | null;
  inviteExpiresAt: Date | null;
  claimedAt: Date | null;
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<BetaApplicant | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Reject confirmation dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [applicantToReject, setApplicantToReject] = useState<BetaApplicant | null>(null);

  // Approve dialog with invite link
  const [approvedLinkModal, setApprovedLinkModal] = useState<{ open: boolean; link: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute counts
  const totalCount = initialApplicants.length;
  const pendingCount = initialApplicants.filter((a) => a.status === 'PENDING').length;
  const approvedCount = initialApplicants.filter((a) => a.status === 'APPROVED').length;
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

  const getStatusBadge = (status: string, claimed: boolean) => {
    if (claimed) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20">
          Account Active
        </span>
      );
    }
    switch (status) {
      case 'APPROVED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Applied</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{totalCount}</p>
          </div>
          <span className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">{pendingCount}</p>
          </div>
          <span className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved Access</p>
            <p className="text-2xl font-bold mt-1 text-emerald-500">{approvedCount}</p>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Declined</p>
            <p className="text-2xl font-bold mt-1 text-red-500">{rejectedCount}</p>
          </div>
          <span className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <XCircle className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Filter and search control bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
        {/* Status filter tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab === 'ALL' ? 'All Applicants' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, craft..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Freelance Craft</th>
                <th className="px-6 py-4">Active Clients</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground italic">
                    No beta applicants found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-foreground truncate" title={applicant.name}>
                        {applicant.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={applicant.email}>
                        {applicant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        {applicant.freelanceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {applicant.activeClients} clients
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(applicant.status, !!applicant.claimedAt)}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(applicant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            setDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="View Application Answers"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {applicant.status === 'PENDING' && (
                          <>
                            <button
                              disabled={isPending}
                              onClick={() => handleApprove(applicant)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => {
                                setApplicantToReject(applicant);
                                setRejectDialogOpen(true);
                              }}
                              className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-xs font-semibold rounded-lg border border-red-500/20 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {applicant.status === 'APPROVED' && !applicant.claimedAt && applicant.inviteToken && (
                          <button
                            onClick={() => {
                              const origin = typeof window !== 'undefined' ? window.location.origin : '';
                              const inviteLink = `${origin}/accept-invite?token=${applicant.inviteToken}`;
                              setApprovedLinkModal({
                                open: true,
                                link: inviteLink,
                                name: applicant.name,
                              });
                            }}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xs font-semibold rounded-lg border border-indigo-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Invite Link</span>
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

      {/* Application Details Modal */}
      {detailsModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setDetailsModalOpen(false);
                setSelectedApplicant(null);
              }}
              className="absolute top-5 right-5 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Application Review
              </span>
              <h2 className="text-xl font-bold text-foreground mt-2">{selectedApplicant.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedApplicant.email}</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                  Craft & Active Clients
                </p>
                <p className="text-foreground font-medium">
                  {selectedApplicant.freelanceType} • {selectedApplicant.activeClients} Active Clients
                </p>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                  Current Tools Used
                </p>
                <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {selectedApplicant.currentTools}
                </div>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                  What they want Freelancer OS to organize
                </p>
                <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {selectedApplicant.mainProblem}
                </div>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                  Status & Date
                </p>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedApplicant.status, !!selectedApplicant.claimedAt)}
                  <span className="text-xs text-muted-foreground">
                    Applied on {new Date(selectedApplicant.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedApplicant(null);
                }}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Close
              </button>
              {selectedApplicant.status === 'PENDING' && (
                <button
                  onClick={() => {
                    handleApprove(selectedApplicant);
                    setDetailsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Approve Applicant
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approved / Invite Link Modal */}
      {approvedLinkModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-5 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">
                Applicant Approved!
              </h2>
              <p className="text-xs text-muted-foreground">
                Share this secure, single-use invitation link with{' '}
                <strong className="text-foreground">{approvedLinkModal.name}</strong> so they can create their account and password.
              </p>
            </div>

            <div className="p-3 bg-muted/50 border border-border rounded-xl flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={approvedLinkModal.link}
                className="bg-transparent text-xs text-foreground font-mono w-full truncate focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(approvedLinkModal.link)}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shrink-0 transition-all flex items-center space-x-1"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              This single-use cryptographic token expires in 7 days. The applicant will choose their own password.
            </p>

            <button
              onClick={() => setApprovedLinkModal(null)}
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all"
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
