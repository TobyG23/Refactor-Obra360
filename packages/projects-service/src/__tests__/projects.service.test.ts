import { ProjectsService } from '../services/projects.service';
import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '@obra360/shared';

// Mock Prisma Client
jest.mock('@obra360/shared', () => {
  const actualModule = jest.requireActual('@obra360/shared');
  return {
    ...actualModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      project: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectAssignment: {
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      task: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      discussion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      discussionMessage: {
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    })),
  };
});

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    projectsService = new ProjectsService();
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return all projects for STAFF users', async () => {
      const userId = 'user-123';
      const userRole = UserRole.STAFF;

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          status: ProjectStatus.IN_PROGRESS,
        },
        {
          id: 'project-2',
          name: 'Project 2',
          status: ProjectStatus.PLANNING,
        },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await projectsService.getProjects(userId, userRole);

      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        include: {
          client: {
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
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return only client projects for CLIENT users', async () => {
      const userId = 'client-123';
      const userRole = UserRole.CLIENT;

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Client Project',
          clientId: userId,
          status: ProjectStatus.IN_PROGRESS,
        },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      await projectsService.getProjects(userId, userRole);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clientId: userId,
          },
        })
      );
    });

    it('should return assigned projects for CONTRACTOR users', async () => {
      const userId = 'contractor-123';
      const userRole = UserRole.CONTRACTOR;

      const mockProjects = [
        {
          id: 'project-1',
          name: 'Assigned Project',
        },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      await projectsService.getProjects(userId, userRole);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            assignments: {
              some: {
                userId,
              },
            },
          },
        })
      );
    });
  });

  describe('getProjectById', () => {
    it('should return project by id for authorized user', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;

      const mockProject = {
        id: projectId,
        name: 'Test Project',
        description: 'Test Description',
        status: ProjectStatus.IN_PROGRESS,
        client: { id: 'client-123', email: 'client@example.com' },
        assignments: [],
        tasks: [],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await projectsService.getProjectById(projectId, userId, userRole);

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: expect.any(Object),
      });
    });

    it('should throw error if project not found', async () => {
      const projectId = 'invalid-project';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        projectsService.getProjectById(projectId, userId, userRole)
      ).rejects.toThrow('Proyecto no encontrado');
    });

    it('should throw error if CLIENT tries to access project not owned', async () => {
      const projectId = 'project-123';
      const userId = 'client-123';
      const userRole = UserRole.CLIENT;

      const mockProject = {
        id: projectId,
        clientId: 'different-client',
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(
        projectsService.getProjectById(projectId, userId, userRole)
      ).rejects.toThrow('No tienes permiso para acceder a este proyecto');
    });

    it('should throw error if CONTRACTOR not assigned to project', async () => {
      const projectId = 'project-123';
      const userId = 'contractor-123';
      const userRole = UserRole.CONTRACTOR;

      const mockProject = {
        id: projectId,
        assignments: [],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(
        projectsService.getProjectById(projectId, userId, userRole)
      ).rejects.toThrow('No tienes permiso para acceder a este proyecto');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project Description',
        clientId: 'client-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const mockProject = {
        id: 'project-123',
        ...projectData,
        status: ProjectStatus.PLANNING,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.create.mockResolvedValue(mockProject);

      const result = await projectsService.createProject(projectData);

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ...projectData,
          status: ProjectStatus.PLANNING,
          progress: 0,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;
      const updateData = {
        name: 'Updated Project Name',
        status: ProjectStatus.IN_PROGRESS,
      };

      const mockProject = {
        id: projectId,
        clientId: 'client-123',
      };

      const mockUpdatedProject = {
        ...mockProject,
        ...updateData,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await projectsService.updateProject(
        projectId,
        updateData,
        userId,
        userRole
      );

      expect(result).toEqual(mockUpdatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should throw error if project not found', async () => {
      const projectId = 'invalid-project';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;
      const updateData = { name: 'Updated Name' };

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        projectsService.updateProject(projectId, updateData, userId, userRole)
      ).rejects.toThrow('Proyecto no encontrado');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;

      const mockProject = { id: projectId };
      const mockDeletedProject = { ...mockProject, deletedAt: new Date() };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.delete.mockResolvedValue(mockDeletedProject);

      const result = await projectsService.deleteProject(projectId, userId, userRole);

      expect(result).toEqual(mockDeletedProject);
      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: projectId },
      });
    });
  });

  describe('assignUser', () => {
    it('should assign a user to a project', async () => {
      const projectId = 'project-123';
      const assignUserId = 'contractor-123';

      const mockProject = { id: projectId };
      const mockUser = {
        id: assignUserId,
        role: UserRole.CONTRACTOR,
      };
      const mockAssignment = {
        id: 'assignment-123',
        projectId,
        userId: assignUserId,
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.projectAssignment.create.mockResolvedValue(mockAssignment);

      const result = await projectsService.assignUser(projectId, assignUserId);

      expect(result).toEqual(mockAssignment);
      expect(prisma.projectAssignment.create).toHaveBeenCalledWith({
        data: {
          projectId,
          userId: assignUserId,
        },
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
      });
    });

    it('should throw error if project not found', async () => {
      const projectId = 'invalid-project';
      const assignUserId = 'user-123';

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        projectsService.assignUser(projectId, assignUserId)
      ).rejects.toThrow('Proyecto no encontrado');
    });

    it('should throw error if user not found', async () => {
      const projectId = 'project-123';
      const assignUserId = 'invalid-user';

      prisma.project.findUnique.mockResolvedValue({ id: projectId });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        projectsService.assignUser(projectId, assignUserId)
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('getTasks', () => {
    it('should return tasks for a project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const userRole = UserRole.STAFF;

      const mockProject = { id: projectId };
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: TaskStatus.TODO,
        },
        {
          id: 'task-2',
          title: 'Task 2',
          status: TaskStatus.IN_PROGRESS,
        },
      ];

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await projectsService.getTasks(projectId, userId, userRole);

      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        projectId: 'project-123',
        title: 'New Task',
        description: 'Task Description',
        priority: TaskPriority.HIGH,
        assignedToId: 'user-123',
      };

      const mockProject = { id: taskData.projectId };
      const mockTask = {
        id: 'task-123',
        ...taskData,
        status: TaskStatus.TODO,
        createdAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.task.create.mockResolvedValue(mockTask);

      const result = await projectsService.createTask(taskData);

      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalled();
    });

    it('should throw error if project not found', async () => {
      const taskData = {
        projectId: 'invalid-project',
        title: 'New Task',
      };

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(projectsService.createTask(taskData)).rejects.toThrow(
        'Proyecto no encontrado'
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 'task-123';
      const updateData = {
        status: TaskStatus.DONE,
        progress: 100,
      };

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const mockUpdatedTask = {
        ...mockTask,
        ...updateData,
      };

      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await projectsService.updateTask(taskId, updateData);

      expect(result).toEqual(mockUpdatedTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should throw error if task not found', async () => {
      const taskId = 'invalid-task';
      const updateData = { status: TaskStatus.DONE };

      prisma.task.findUnique.mockResolvedValue(null);

      await expect(projectsService.updateTask(taskId, updateData)).rejects.toThrow(
        'Tarea no encontrada'
      );
    });
  });
});
