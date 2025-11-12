import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface CreateInvoiceInput {
  projectId: string;
  customerId: string;
  subtotal: number;
  tax?: number;
  total: number;
  dueDate: Date;
  notes?: string;
  items: InvoiceItemInput[];
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateProposalInput {
  projectId: string;
  customerId: string;
  title: string;
  content: string;
  total: number;
  validUntil?: Date;
  notes?: string;
}
