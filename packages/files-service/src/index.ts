import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import filesRoutes from './routes/files.routes';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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
    message: 'Files Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Ready check (verifica conexión a BD y directorio de uploads)
app.get('/ready', async (req, res) => {
  try {
    const { PrismaClient } = await import('@obra360/shared');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    // Verificar directorio de uploads
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      throw new Error('Upload directory does not exist');
    }

    res.json({
      success: true,
      message: 'Files Service is ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Files Service is not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Rutas
app.use('/api/files', filesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores de Multer
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado grande. Tamaño máximo: ${process.env.MAX_FILE_SIZE || '50MB'}`,
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos o campo incorrecto',
      });
    }

    if (err.message && err.message.includes('Tipo de archivo no permitido')) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next(err);
  }
);

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
  console.log('\n🛑 Shutting down Files Service...');
  const { PrismaClient } = await import('@obra360/shared');
  const prisma = new PrismaClient();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Files Service running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Ready check: http://localhost:${PORT}/ready`);
  console.log(`📁 API: http://localhost:${PORT}/api/files`);
  console.log(`📂 Upload directory: ${path.resolve(process.env.UPLOAD_DIR || './uploads')}`);
});

export default app;
