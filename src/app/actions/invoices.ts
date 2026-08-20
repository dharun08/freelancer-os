'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export async function createInvoiceAction(formData: FormData, itemsJson: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const clientId = formData.get('clientId') as string;
  const status = formData.get('status') as string || 'Draft';
  
  const issueDateStr = formData.get('issueDate') as string;
  const dueDateStr = formData.get('dueDate') as string;
  
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();

  if (!clientId || !dueDateStr) {
    return { error: 'Client and due date are required.' };
  }

  try {
    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    // Auto-generate invoice number (INV-YYYY-XXXX) unique per user
    const latest = await db.invoice.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    let nextNum = 1;
    if (latest && latest.invoiceNumber) {
      const parts = latest.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextNum = lastSeq + 1;
      }
    }
    const seq = String(nextNum).padStart(4, '0');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${seq}`;

    // Calculate total amount based on items
    let items: InvoiceItem[] = [];
    try {
      items = JSON.parse(itemsJson);
    } catch (e) {
      return { error: 'Invalid items formatting.' };
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const outstandingAmount = status === 'Paid' ? 0.0 : totalAmount;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        status,
        issueDate,
        dueDate,
        itemsJson,
        totalAmount,
        outstandingAmount,
        userId: session.userId,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true, invoice };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return { error: 'Something went wrong while creating the invoice.' };
  }
}

export async function updateInvoiceAction(id: string, formData: FormData, itemsJson: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const clientId = formData.get('clientId') as string;
  const status = formData.get('status') as string || 'Draft';
  
  const issueDateStr = formData.get('issueDate') as string;
  const dueDateStr = formData.get('dueDate') as string;
  
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();

  if (!clientId || !dueDateStr) {
    return { error: 'Client and due date are required.' };
  }

  try {
    const existing = await db.invoice.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Invoice not found.' };
    }

    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    // Calculate total amount based on items
    let items: InvoiceItem[] = [];
    try {
      items = JSON.parse(itemsJson);
    } catch (e) {
      return { error: 'Invalid items formatting.' };
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const outstandingAmount = status === 'Paid' ? 0.0 : totalAmount;

    const invoice = await db.invoice.update({
      where: { id },
      data: {
        clientId,
        status,
        issueDate,
        dueDate,
        itemsJson,
        totalAmount,
        outstandingAmount,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    if (existing.clientId !== clientId) {
      revalidatePath(`/clients/${existing.clientId}`);
    }
    return { success: true, invoice };
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return { error: 'Something went wrong while updating the invoice.' };
  }
}

export async function markInvoiceAsPaidAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.invoice.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Invoice not found.' };
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: {
        status: 'Paid',
        outstandingAmount: 0.0,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/clients');
    revalidatePath(`/clients/${invoice.clientId}`);
    return { success: true, invoice };
  } catch (error) {
    console.error('Failed to mark invoice as paid:', error);
    return { error: 'Something went wrong while updating the invoice.' };
  }
}

export async function deleteInvoiceAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    const existing = await db.invoice.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) {
      return { error: 'Unauthorized or Invoice not found.' };
    }

    await db.invoice.delete({
      where: { id },
    });

    revalidatePath('/invoices');
    revalidatePath('/clients');
    if (existing.clientId) {
      revalidatePath(`/clients/${existing.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return { error: 'Something went wrong while deleting the invoice.' };
  }
}
