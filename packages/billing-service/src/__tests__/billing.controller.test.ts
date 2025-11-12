import { Request, Response } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { PrismaClient, InvoiceStatus, PaymentStatus, PaymentMethod } from '@obra360/shared';

// Mock Prisma Client
jest.mock('@obra360/shared', () => {
  const actualModule = jest.requireActual('@obra360/shared');
  return {
    ...actualModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      invoice: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
    })),
  };
});

describe('BillingController', () => {
  let billingController: BillingController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    billingController = new BillingController();

    mockRequest = {
      params: {},
      body: {},
      query: {},
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'CLIENT',
      } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getInvoices', () => {
    it('should return all invoices for authenticated user', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-001',
          projectId: 'project-1',
          amount: 1000,
          status: InvoiceStatus.PENDING,
          project: {
            id: 'project-1',
            name: 'Project 1',
          },
        },
        {
          id: 'invoice-2',
          invoiceNumber: 'INV-002',
          projectId: 'project-2',
          amount: 2000,
          status: InvoiceStatus.PAID,
          project: {
            id: 'project-2',
            name: 'Project 2',
          },
        },
      ];

      prisma.invoice.findMany.mockResolvedValue(mockInvoices);

      await billingController.getInvoices(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: {
          project: true,
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoices);
    });

    it('should filter invoices by project if projectId provided', async () => {
      mockRequest.query = { projectId: 'project-123' };

      prisma.invoice.findMany.mockResolvedValue([]);

      await billingController.getInvoices(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'project-123',
          }),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      prisma.invoice.findMany.mockRejectedValue(new Error('Database error'));

      await billingController.getInvoices(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error al obtener facturas',
      });
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice by id', async () => {
      mockRequest.params = { id: 'invoice-123' };

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-001',
        amount: 1000,
        status: InvoiceStatus.PENDING,
        project: {
          id: 'project-1',
          name: 'Project 1',
        },
        payments: [],
      };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);

      await billingController.getInvoiceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: 'invoice-123' },
        include: {
          project: true,
          payments: true,
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoice);
    });

    it('should return 404 if invoice not found', async () => {
      mockRequest.params = { id: 'invalid-invoice' };

      prisma.invoice.findUnique.mockResolvedValue(null);

      await billingController.getInvoiceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Factura no encontrada',
      });
    });
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      mockRequest.body = {
        projectId: 'project-123',
        amount: 5000,
        description: 'First payment',
        dueDate: '2024-12-31',
      };

      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
      };

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-001',
        projectId: 'project-123',
        amount: 5000,
        description: 'First payment',
        status: InvoiceStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        createdAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.create.mockResolvedValue(mockInvoice);

      await billingController.createInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-123' },
      });
      expect(prisma.invoice.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoice);
    });

    it('should return 404 if project not found', async () => {
      mockRequest.body = {
        projectId: 'invalid-project',
        amount: 5000,
      };

      prisma.project.findUnique.mockResolvedValue(null);

      await billingController.createInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Proyecto no encontrado',
      });
    });

    it('should generate sequential invoice numbers', async () => {
      mockRequest.body = {
        projectId: 'project-123',
        amount: 5000,
      };

      const mockProject = { id: 'project-123' };
      const existingInvoices = [
        { invoiceNumber: 'INV-001' },
        { invoiceNumber: 'INV-002' },
      ];

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.invoice.findMany.mockResolvedValue(existingInvoices);
      prisma.invoice.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: 'invoice-123',
          ...data.data,
          createdAt: new Date(),
        });
      });

      await billingController.createInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: 'INV-003',
          }),
        })
      );
    });

    it('should validate required fields', async () => {
      mockRequest.body = {
        // Missing required fields
      };

      await billingController.createInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status', async () => {
      mockRequest.params = { id: 'invoice-123' };
      mockRequest.body = { status: InvoiceStatus.PAID };

      const mockInvoice = {
        id: 'invoice-123',
        status: InvoiceStatus.PENDING,
      };

      const mockUpdatedInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.PAID,
      };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue(mockUpdatedInvoice);

      await billingController.updateInvoiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice-123' },
        data: { status: InvoiceStatus.PAID },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedInvoice);
    });

    it('should return 404 if invoice not found', async () => {
      mockRequest.params = { id: 'invalid-invoice' };
      mockRequest.body = { status: InvoiceStatus.PAID };

      prisma.invoice.findUnique.mockResolvedValue(null);

      await billingController.updateInvoiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should validate status value', async () => {
      mockRequest.params = { id: 'invoice-123' };
      mockRequest.body = { status: 'INVALID_STATUS' };

      await billingController.updateInvoiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('createPayment', () => {
    it('should create a new payment for an invoice', async () => {
      mockRequest.body = {
        invoiceId: 'invoice-123',
        amount: 1000,
        method: PaymentMethod.BANK_TRANSFER,
        reference: 'REF-12345',
      };

      const mockInvoice = {
        id: 'invoice-123',
        amount: 5000,
        status: InvoiceStatus.PENDING,
      };

      const mockPayment = {
        id: 'payment-123',
        invoiceId: 'invoice-123',
        amount: 1000,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.COMPLETED,
        reference: 'REF-12345',
        createdAt: new Date(),
      };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.payment.create.mockResolvedValue(mockPayment);

      await billingController.createPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          invoiceId: 'invoice-123',
          amount: 1000,
          method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.COMPLETED,
          reference: 'REF-12345',
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
    });

    it('should return 404 if invoice not found', async () => {
      mockRequest.body = {
        invoiceId: 'invalid-invoice',
        amount: 1000,
        method: PaymentMethod.BANK_TRANSFER,
      };

      prisma.invoice.findUnique.mockResolvedValue(null);

      await billingController.createPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Factura no encontrada',
      });
    });

    it('should validate payment amount does not exceed invoice amount', async () => {
      mockRequest.body = {
        invoiceId: 'invoice-123',
        amount: 10000,
        method: PaymentMethod.BANK_TRANSFER,
      };

      const mockInvoice = {
        id: 'invoice-123',
        amount: 5000,
        status: InvoiceStatus.PENDING,
      };

      prisma.invoice.findUnique.mockResolvedValue(mockInvoice);
      prisma.payment.findMany.mockResolvedValue([]);

      await billingController.createPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El monto del pago excede el monto de la factura',
      });
    });

    it('should validate required fields', async () => {
      mockRequest.body = {
        // Missing required fields
      };

      await billingController.createPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPaymentsByInvoice', () => {
    it('should return all payments for an invoice', async () => {
      mockRequest.params = { invoiceId: 'invoice-123' };

      const mockPayments = [
        {
          id: 'payment-1',
          invoiceId: 'invoice-123',
          amount: 1000,
          method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.COMPLETED,
        },
        {
          id: 'payment-2',
          invoiceId: 'invoice-123',
          amount: 2000,
          method: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.COMPLETED,
        },
      ];

      prisma.invoice.findUnique.mockResolvedValue({ id: 'invoice-123' });
      prisma.payment.findMany.mockResolvedValue(mockPayments);

      await billingController.getPaymentsByInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { invoiceId: 'invoice-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayments);
    });

    it('should return 404 if invoice not found', async () => {
      mockRequest.params = { invoiceId: 'invalid-invoice' };

      prisma.invoice.findUnique.mockResolvedValue(null);

      await billingController.getPaymentsByInvoice(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
