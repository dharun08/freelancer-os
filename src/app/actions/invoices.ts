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

  const invoiceNumber = formData.get('invoiceNumber') as string;
  const clientId = formData.get('clientId') as string;
  const status = formData.get('status') as string || 'Draft';
  
  const issueDateStr = formData.get('issueDate') as string;
  const dueDateStr = formData.get('dueDate') as string;
  
  const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
  const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();

  if (!invoiceNumber || !clientId || !dueDateStr) {
    return { error: 'Invoice number, client, and due date are required.' };
  }

  try {
    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: { id: clientId, userId: session.userId },
    });
    if (!client) {
      return { error: 'Invalid client selection.' };
    }

    // Check if invoice number is unique for this user
    const existing = await db.invoice.findFirst({
      where: { 
        userId: session.userId,
        invoiceNumber,
      },
    });

    if (existing) {
      return { error: `Invoice number "${invoiceNumber}" is already in use for your account.` };
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
