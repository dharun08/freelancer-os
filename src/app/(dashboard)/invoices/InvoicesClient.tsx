'use strict';

'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoiceAction, markInvoiceAsPaidAction, deleteInvoiceAction } from '@/app/actions/invoices';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  DollarSign, 
  Clock, 
  CheckCircle,
  X,
  PlusCircle,
  MinusCircle,
  Loader2,
  Receipt
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string; // Draft, Sent, Paid, Overdue
  issueDate: Date;
  dueDate: Date;
  itemsJson: string;
  totalAmount: number;
  outstandingAmount: number;
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

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  clients: ClientOption[];
}

interface InvoiceItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoicesClient({ initialInvoices, clients }: InvoicesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Itemized Input list state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemInput[]>([
    { description: '', quantity: 1, rate: 0.0 }
  ]);

  // Generated Invoice number state
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');

  useEffect(() => {
    if (createModalOpen) {
      // Generate a unique invoice number default
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setNextInvoiceNumber(`INV-2026-${randomId}`);
      setInvoiceItems([{ description: '', quantity: 1, rate: 0.0 }]);
    }
  }, [createModalOpen]);

  // Calculate metrics
  const totalInvoiced = initialInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = initialInvoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstanding = initialInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

  // Dynamic filter logic
  const filteredInvoices = initialInvoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client.company && inv.client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Auto calculate if overdue
    const isOverdue = inv.status !== 'Paid' && new Date(inv.dueDate) < new Date();
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Overdue') {
        matchesStatus = isOverdue;
      } else {
        matchesStatus = inv.status === statusFilter && !isOverdue;
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, rate: 0.0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (invoiceItems.length === 1) return;
    const next = [...invoiceItems];
    next.splice(index, 1);
    setInvoiceItems(next);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItemInput, val: any) => {
    const next = [...invoiceItems];
    if (field === 'quantity') {
      next[index].quantity = parseInt(val) || 0;
    } else if (field === 'rate') {
      next[index].rate = parseFloat(val) || 0.0;
    } else {
      next[index].description = val;
    }
    setInvoiceItems(next);
  };

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.currentTarget);

    // Validate invoice items
    const hasEmptyItem = invoiceItems.some(i => !i.description.trim());
    if (hasEmptyItem) {
      setFormError('Please fill in descriptions for all invoice items.');
      return;
    }

    startTransition(async () => {
      const result = await createInvoiceAction(formData, JSON.stringify(invoiceItems));
      if (result.error) {
        setFormError(result.error);
      } else {
        setCreateModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleMarkAsPaid = (id: string) => {
    if (!confirm('Mark this invoice as fully paid?')) return;
    startTransition(async () => {
      const result = await markInvoiceAsPaidAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    startTransition(async () => {
      const result = await deleteInvoiceAction(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  // Dynamic calculations
  const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  const getStatusBadge = (inv: Invoice) => {
    const isOverdue = inv.status !== 'Paid' && new Date(inv.dueDate) < new Date();
    
    if (isOverdue) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/50">
          Overdue
        </span>
      );
    }

    switch (inv.status) {
      case 'Draft':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800">
            Draft
          </span>
        );
      case 'Sent':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">
            Sent
          </span>
        );
      case 'Paid':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50">
            Paid
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Billed</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(totalInvoiced)}</p>
            <p className="text-xs text-muted-foreground mt-1">Gross accounts receivables</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold mt-2 text-emerald-500">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground mt-1">Realized business revenue</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Balance</p>
            <p className="text-2xl font-bold mt-2 text-amber-500">{formatCurrency(totalOutstanding)}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting client clearing</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search invoices by number or client name..."
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
              <option value="All">All Invoices</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (clients.length === 0) {
                alert('Please create a Client first before generating an invoice.');
                return;
              }
              setFormError('');
              setCreateModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No invoices found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mt-1">
            Build itemized billing templates and issue requests to clients to collect revenue.
          </p>
        </div>
      )}

      {/* Invoices List Table */}
      {filteredInvoices.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{invoice.client.name}</div>
                      {invoice.client.company && (
                        <div className="text-xs text-muted-foreground">{invoice.client.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice)}</td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {invoice.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                            title="Mark as Paid"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                          title="Delete Invoice"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Create New Invoice</h2>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    required
                    value={nextInvoiceNumber}
                    onChange={(e) => setNextInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Bill To Client *
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // +14 days default
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    defaultValue="Sent"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Line Items Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Itemized Details</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-primary flex items-center space-x-1 hover:underline cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Item Description"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm focus:outline-none text-center"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Rate ($)"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(index, 'rate', e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-semibold pr-2">
                        {formatCurrency(item.quantity * item.rate)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={invoiceItems.length === 1}
                        className="text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal summary display */}
              <div className="border-t border-border pt-4 flex justify-between items-center bg-muted/30 p-4 rounded-xl">
                <span className="text-sm font-semibold text-muted-foreground">Total Invoice Value:</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(invoiceSubtotal)}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
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
                  <span>Generate Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
