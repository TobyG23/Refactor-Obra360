import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' },
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API Gateway is healthy', timestamp: new Date().toISOString() });
});

// Proxies a microservicios
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
}));

app.use('/api/projects', createProxyMiddleware({
  target: process.env.PROJECTS_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/projects': '/api/projects' },
}));

app.use('/api/files', createProxyMiddleware({
  target: process.env.FILES_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/files': '/api/files' },
}));

app.use('/api/billing', createProxyMiddleware({
  target: process.env.BILLING_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/billing': '/api/billing' },
}));

app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api/notifications' },
}));

app.use('/api/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '/api/analytics' },
}));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`🔗 All requests → http://localhost:${PORT}/api/*`);
  console.log(`🔐 Auth Service: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`📁 Projects Service: ${process.env.PROJECTS_SERVICE_URL}`);
  console.log(`📂 Files Service: ${process.env.FILES_SERVICE_URL}`);
  console.log(`💰 Billing Service: ${process.env.BILLING_SERVICE_URL}`);
  console.log(`🔔 Notifications Service: ${process.env.NOTIFICATIONS_SERVICE_URL}`);
  console.log(`📊 Analytics Service: ${process.env.ANALYTICS_SERVICE_URL}`);
});

export default app;
