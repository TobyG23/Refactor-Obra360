import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import billingRoutes from './routes/billing.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Billing Service is healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    const { PrismaClient } = await import('@obra360/shared');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    res.json({ success: true, message: 'Billing Service is ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ success: false, message: 'Billing Service is not ready', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.use('/api/billing', billingRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const shutdown = async () => {
  console.log('\n🛑 Shutting down Billing Service...');
  const { PrismaClient } = await import('@obra360/shared');
  const prisma = new PrismaClient();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`🚀 Billing Service running on port ${PORT}`);
  console.log(`💰 API: http://localhost:${PORT}/api/billing`);
});

export default app;
