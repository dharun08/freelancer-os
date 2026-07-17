'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  createClientAction, 
  updateClientAction, 
  deleteClientAction 
} from '@/app/actions/clients';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Mail,
  Phone,
  Building,
  Loader2,
  X,
  Users
} from 'lucide-react';

interface ClientWithRelations {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  projects: any[];
  invoices: any[];
}

interface ClientsClientProps {
  initialClients: ClientWithRelations[];
}

export default function ClientsClient({ initialClients }: ClientsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);
  const [formError, setFormError] = useState('');

  // Filtering Logic
  const filteredClients = initialClients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createClientAction(formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setCreateModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleEditClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    setFormError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClientAction(selectedClient.id, formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setEditModalOpen(false);
        setSelectedClient(null);
        router.refresh();
      }
    });
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    startTransition(async () => {
      const result = await deleteClientAction(selectedClient.id);
      if (result.error) {
        alert(result.error);
      } else {
        setDeleteModalOpen(false);
        setSelectedClient(null);
        router.refresh();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50';
      case 'Inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'Lost':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/50';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-background border border-border rounded-xl px-3 py-1.5 text-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-sm text-foreground pr-2 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Grid/Table Toggle */}
          <div className="flex items-center bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Client Button */}
          <button
            onClick={() => {
              setFormError('');
              setCreateModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No clients found</h3>
          <p className="text-muted-foreground text-sm max-w-xs text-center mt-1">
            Try adjusting your search query or filters, or create a new client record.
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="bg-card border border-border hover:border-primary/40 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {client.name}
                    </h3>
                    {client.company && (
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Building className="h-3 w-3 mr-1" />
                        <span className="truncate">{client.company}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 shrink-0 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-2 shrink-0 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/80">
                <div className="flex items-center space-x-4 text-xs">
                  <div>
                    <span className="font-bold text-foreground">{client.projects.length}</span>
                    <span className="text-muted-foreground ml-1">Projects</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">
                      {client.invoices.filter(i => i.status === 'Paid').length}/{client.invoices.length}
                    </span>
                    <span className="text-muted-foreground ml-1">Invoices</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Link
                    href={`/clients/${client.id}`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="View Details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setFormError('');
                      setEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredClients.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Projects</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      <Link href={`/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{client.company || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{client.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{client.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{client.projects.length}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          href={`/clients/${client.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setFormError('');
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>

            <form onSubmit={handleCreateClient} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
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
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue="Active"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Notes / Details
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
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setSelectedClient(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Client Details</h2>

            <form onSubmit={handleEditClient} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedClient.name}
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
                    defaultValue={selectedClient.company || ''}
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
                    defaultValue={selectedClient.email}
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
                    defaultValue={selectedClient.phone || ''}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={selectedClient.status}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Notes / Details
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={selectedClient.notes || ''}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedClient(null);
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold mb-2">Delete Client?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <strong className="text-foreground">{selectedClient.name}</strong>? This action is permanent and will delete all associated projects, invoices, and follow-ups.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted cursor-pointer"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={isPending}
                className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {isPending && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
