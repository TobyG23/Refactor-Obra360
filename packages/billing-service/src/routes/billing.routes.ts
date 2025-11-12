import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticate, authorizeStaff } from '../middlewares/auth.middleware';

const router = Router();
const controller = new BillingController();

router.use(authenticate);

// Invoices (solo STAFF puede crear/editar, CUSTOMER puede ver los suyos)
router.post('/invoices', authorizeStaff, (req, res) => controller.createInvoice(req, res));
router.get('/invoices', (req, res) => controller.getInvoices(req, res));
router.get('/invoices/:id', (req, res) => controller.getInvoiceById(req, res));
router.put('/invoices/:id', authorizeStaff, (req, res) => controller.updateInvoice(req, res));
router.delete('/invoices/:id', authorizeStaff, (req, res) => controller.deleteInvoice(req, res));

// Proposals (solo STAFF puede crear/editar, CUSTOMER puede ver los suyos)
router.post('/proposals', authorizeStaff, (req, res) => controller.createProposal(req, res));
router.get('/proposals', (req, res) => controller.getProposals(req, res));
router.get('/proposals/:id', (req, res) => controller.getProposalById(req, res));
router.put('/proposals/:id', authorizeStaff, (req, res) => controller.updateProposal(req, res));
router.delete('/proposals/:id', authorizeStaff, (req, res) => controller.deleteProposal(req, res));

export default router;
