import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@obra360/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Analytics Service is healthy', timestamp: new Date().toISOString() });
});

// Dashboard KPIs
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const [totalProjects, totalTasks, totalFiles, totalUsers] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.file.count(),
      prisma.user.count(),
    ]);

    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: true,
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totals: { projects: totalProjects, tasks: totalTasks, files: totalFiles, users: totalUsers },
        projectsByStatus,
        tasksByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener analytics' });
  }
});

// Project analytics
app.get('/api/analytics/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { tasks: true, files: true, discussions: true, assignments: true } },
        tasks: { select: { status: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    const tasksByStatus = project.tasks.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        project: { id: project.id, name: project.name, status: project.status },
        counts: project._count,
        tasksByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// Activity logs
app.get('/api/analytics/activity', async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`);
});

export default app;
