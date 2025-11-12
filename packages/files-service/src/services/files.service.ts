import { PrismaClient, File, UserRole } from '@obra360/shared';
import { deleteFile } from '../utils/storage';
import path from 'path';

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export class FilesService {
  async uploadFile(
    file: Express.Multer.File,
    uploadedById: string,
    projectId?: string,
    taskId?: string
  ) {
    // Verificar que project o task existe
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        // Eliminar archivo subido
        await deleteFile(file.path);
        throw new Error('Proyecto no encontrado');
      }
    }

    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        // Eliminar archivo subido
        await deleteFile(file.path);
        throw new Error('Tarea no encontrada');
      }
    }

    // Crear registro en BD
    return prisma.file.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        projectId,
        taskId,
        uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getFilesByProject(projectId: string) {
    return prisma.file.findMany({
      where: { projectId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFilesByTask(taskId: string) {
    return prisma.file.findMany({
      where: { taskId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFileById(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    return file;
  }

  async getAllFiles(userId: string, userRole: UserRole) {
    // STAFF: ve todos los archivos
    if (userRole === UserRole.STAFF) {
      return prisma.file.findMany({
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // CUSTOMER: ve solo archivos de sus proyectos
    if (userRole === UserRole.CUSTOMER) {
      return prisma.file.findMany({
        where: {
          project: {
            customerId: userId,
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // CONTRACTOR: ve solo archivos de proyectos asignados
    if (userRole === UserRole.CONTRACTOR) {
      return prisma.file.findMany({
        where: {
          project: {
            assignments: {
              some: {
                userId: userId,
              },
            },
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return [];
  }

  async deleteFileById(id: string) {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    // Eliminar archivo físico del servidor
    try {
      await deleteFile(file.path);
    } catch (error) {
      console.error('Error al eliminar archivo físico:', error);
      // Continuar de todos modos para eliminar el registro de BD
    }

    // Eliminar registro de BD
    await prisma.file.delete({
      where: { id },
    });
  }

  getFilePath(file: File): string {
    return path.resolve(file.path);
  }
}
