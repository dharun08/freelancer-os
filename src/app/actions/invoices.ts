'use strict';
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export async function createInvoiceAction(formData: FormData, itemsJson: string) {
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
    // Check if invoice number is unique
    const existing = await db.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (existing) {
      return { error: `Invoice number "${invoiceNumber}" is already in use.` };
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
  try {
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
  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: { clientId: true },
    });

    await db.invoice.delete({
      where: { id },
    });

    revalidatePath('/invoices');
    revalidatePath('/clients');
    if (invoice?.clientId) {
      revalidatePath(`/clients/${invoice.clientId}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return { error: 'Something went wrong while deleting the invoice.' };
  }
}
