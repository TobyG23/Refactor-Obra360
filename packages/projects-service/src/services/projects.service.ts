import {
  PrismaClient,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  TaskPriority,
  Discussion,
  ProjectAssignment,
  UserRole,
} from '@obra360/shared';
import {
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateDiscussionInput,
  AssignContractorInput,
} from '../types';

const prisma = new PrismaClient();

export class ProjectsService {
  // ============================================================================
  // PROJECTS CRUD
  // ============================================================================

  async getAllProjects(userId: string, userRole: UserRole) {
    // STAFF: Ve todos los proyectos
    if (userRole === UserRole.STAFF) {
      return prisma.project.findMany({
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              files: true,
              discussions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // CUSTOMER: Ve solo sus proyectos
    if (userRole === UserRole.CUSTOMER) {
      return prisma.project.findMany({
        where: {
          customerId: userId,
        },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              files: true,
              discussions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // CONTRACTOR: Ve solo proyectos asignados
    if (userRole === UserRole.CONTRACTOR) {
      return prisma.project.findMany({
        where: {
          assignments: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              files: true,
              discussions: true,
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

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        files: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        discussions: {
          where: {
            parentId: null, // Solo mensajes principales
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        proposals: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    return project;
  }

  async createProject(data: CreateProjectInput, createdById: string) {
    // Verificar que el customer existe
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    if (customer.role !== UserRole.CUSTOMER) {
      throw new Error('El usuario debe ser un cliente');
    }

    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        customerId: data.customerId,
        createdById,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        status: ProjectStatus.DRAFT,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    return prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status as ProjectStatus | undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteProject(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    await prisma.project.delete({
      where: { id },
    });
  }

  // ============================================================================
  // PROJECT ASSIGNMENTS (Contractors)
  // ============================================================================

  async assignContractor(projectId: string, data: AssignContractorInput) {
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // Verificar que el usuario existe y es contractor
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.role !== UserRole.CONTRACTOR) {
      throw new Error('El usuario debe ser un contractor');
    }

    // Verificar que no esté ya asignado
    const existing = await prisma.projectAssignment.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new Error('El contractor ya está asignado a este proyecto');
    }

    return prisma.projectAssignment.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
          },
        },
      },
    });
  }

  async removeContractor(projectId: string, userId: string) {
    const assignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!assignment) {
      throw new Error('Asignación no encontrada');
    }

    await prisma.projectAssignment.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  // ============================================================================
  // TASKS CRUD
  // ============================================================================

  async getTasksByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        files: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        discussions: {
          where: {
            parentId: null,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      throw new Error('Tarea no encontrada');
    }

    return task;
  }

  async createTask(data: CreateTaskInput, createdById: string) {
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // Si hay assignedToId, verificar que el usuario existe
    if (data.assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });

      if (!user) {
        throw new Error('Usuario asignado no encontrado');
      }
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedToId: data.assignedToId,
        createdById,
        priority: (data.priority as TaskPriority) || TaskPriority.MEDIUM,
        dueDate: data.dueDate,
        startDate: data.startDate,
        status: TaskStatus.TODO,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateTask(id: string, data: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new Error('Tarea no encontrada');
    }

    // Si cambia el assignedToId, verificar que existe
    if (data.assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });

      if (!user) {
        throw new Error('Usuario asignado no encontrado');
      }
    }

    return prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus | undefined,
        priority: data.priority as TaskPriority | undefined,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteTask(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new Error('Tarea no encontrada');
    }

    await prisma.task.delete({
      where: { id },
    });
  }

  // ============================================================================
  // DISCUSSIONS
  // ============================================================================

  async getDiscussionsByProject(projectId: string) {
    return prisma.discussion.findMany({
      where: {
        projectId,
        parentId: null, // Solo mensajes principales
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDiscussionsByTask(taskId: string) {
    return prisma.discussion.findMany({
      where: {
        taskId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createDiscussion(data: CreateDiscussionInput, userId: string) {
    // Verificar que project o task existe
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        throw new Error('Proyecto no encontrado');
      }
    }

    if (data.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
      });
      if (!task) {
        throw new Error('Tarea no encontrada');
      }
    }

    // Si es respuesta, verificar que el parent existe
    if (data.parentId) {
      const parent = await prisma.discussion.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new Error('Mensaje padre no encontrado');
      }
    }

    return prisma.discussion.create({
      data: {
        message: data.message,
        projectId: data.projectId,
        taskId: data.taskId,
        userId,
        parentId: data.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteDiscussion(id: string) {
    const discussion = await prisma.discussion.findUnique({
      where: { id },
    });

    if (!discussion) {
      throw new Error('Mensaje no encontrado');
    }

    await prisma.discussion.delete({
      where: { id },
    });
  }
}
