import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@obra360/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Notifications Service is healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'Notifications Service is ready' });
  } catch (error) {
    res.status(503).json({ success: false, message: 'Service not ready' });
  }
});

// Get notifications for user
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const notifications = await prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: req.body.userId,
        type: req.body.type || 'IN_APP',
        priority: req.body.priority || 'NORMAL',
        title: req.body.title,
        message: req.body.message,
        metadata: req.body.metadata || {},
      },
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error al crear notificación' });
  }
});

// Mark as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error' });
  }
});

// Mark all as read
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const userId = req.body.userId;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error' });
  }
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`🔔 Notifications Service running on port ${PORT}`);
});

export default app;
