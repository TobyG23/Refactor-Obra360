import { Response } from 'express';
import { AuthRequest } from '../types';
import { BillingService } from '../services/billing.service';

const billingService = new BillingService();

export class BillingController {
  async createInvoice(req: AuthRequest, res: Response) {
    try {
      const invoice = await billingService.createInvoice(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Invoice creado', data: invoice });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
  }

  async getInvoices(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.role === 'CUSTOMER' ? req.user!.userId : undefined;
      const invoices = await billingService.getInvoices(customerId);
      res.json({ success: true, data: invoices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener invoices' });
    }
  }

  async getInvoiceById(req: AuthRequest, res: Response) {
    try {
      const invoice = await billingService.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(404).json({ success: false, message: 'Invoice no encontrado' });
    }
  }

  async updateInvoice(req: AuthRequest, res: Response) {
    try {
      const invoice = await billingService.updateInvoice(req.params.id, req.body);
      res.json({ success: true, message: 'Invoice actualizado', data: invoice });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Error al actualizar' });
    }
  }

  async deleteInvoice(req: AuthRequest, res: Response) {
    try {
      await billingService.deleteInvoice(req.params.id);
      res.json({ success: true, message: 'Invoice eliminado' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Error al eliminar' });
    }
  }

  async createProposal(req: AuthRequest, res: Response) {
    try {
      const proposal = await billingService.createProposal(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Proposal creado', data: proposal });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
    }
  }

  async getProposals(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.role === 'CUSTOMER' ? req.user!.userId : undefined;
      const proposals = await billingService.getProposals(customerId);
      res.json({ success: true, data: proposals });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener proposals' });
    }
  }

  async getProposalById(req: AuthRequest, res: Response) {
    try {
      const proposal = await billingService.getProposalById(req.params.id);
      res.json({ success: true, data: proposal });
    } catch (error) {
      res.status(404).json({ success: false, message: 'Proposal no encontrado' });
    }
  }

  async updateProposal(req: AuthRequest, res: Response) {
    try {
      const proposal = await billingService.updateProposal(req.params.id, req.body);
      res.json({ success: true, message: 'Proposal actualizado', data: proposal });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Error al actualizar' });
    }
  }

  async deleteProposal(req: AuthRequest, res: Response) {
    try {
      await billingService.deleteProposal(req.params.id);
      res.json({ success: true, message: 'Proposal eliminado' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Error al eliminar' });
    }
  }
}
