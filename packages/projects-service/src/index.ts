import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import projectsRoutes from './routes/projects.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Projects Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Ready check (verifica conexión a BD)
app.get('/ready', async (req, res) => {
  try {
    const { PrismaClient } = await import('@obra360/shared');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Projects Service is ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Projects Service is not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Rutas
app.use('/api/projects', projectsRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down Projects Service...');
  const { PrismaClient } = await import('@obra360/shared');
  const prisma = new PrismaClient();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Projects Service running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Ready check: http://localhost:${PORT}/ready`);
  console.log(`📁 API: http://localhost:${PORT}/api/projects`);
});

export default app;
