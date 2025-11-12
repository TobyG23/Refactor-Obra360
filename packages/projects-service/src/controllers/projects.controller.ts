import { Response } from 'express';
import { AuthRequest } from '../types';
import { ProjectsService } from '../services/projects.service';
import { UserRole } from '@obra360/shared';

const projectsService = new ProjectsService();

export class ProjectsController {
  // ============================================================================
  // PROJECTS
  // ============================================================================

  async getAllProjects(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const projects = await projectsService.getAllProjects(
        req.user.userId,
        req.user.role as UserRole
      );

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyectos',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProjectById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const project = await projectsService.getProjectById(id);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Proyecto no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al obtener proyecto',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createProject(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const { name, description, customerId, startDate, endDate, budget } =
        req.body;

      if (!name || !customerId) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y cliente son requeridos',
        });
      }

      const project = await projectsService.createProject(
        {
          name,
          description,
          customerId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          budget: budget ? parseFloat(budget) : undefined,
        },
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: project,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear proyecto',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, status, startDate, endDate, budget } =
        req.body;

      const project = await projectsService.updateProject(id, {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
      });

      res.json({
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: project,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Proyecto no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar proyecto',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await projectsService.deleteProject(id);

      res.json({
        success: true,
        message: 'Proyecto eliminado exitosamente',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Proyecto no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al eliminar proyecto',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // PROJECT ASSIGNMENTS
  // ============================================================================

  async assignContractor(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { userId, role } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido',
        });
      }

      const assignment = await projectsService.assignContractor(projectId, {
        userId,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'Contractor asignado exitosamente',
        data: assignment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al asignar contractor',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async removeContractor(req: AuthRequest, res: Response) {
    try {
      const { projectId, userId } = req.params;

      await projectsService.removeContractor(projectId, userId);

      res.json({
        success: true,
        message: 'Contractor removido exitosamente',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Asignación no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al remover contractor',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // TASKS
  // ============================================================================

  async getTasksByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      const tasks = await projectsService.getTasksByProject(projectId);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tareas',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const task = await projectsService.getTaskById(id);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Tarea no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al obtener tarea',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createTask(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const {
        title,
        description,
        projectId,
        assignedToId,
        priority,
        dueDate,
        startDate,
      } = req.body;

      if (!title || !projectId) {
        return res.status(400).json({
          success: false,
          message: 'Título y proyecto son requeridos',
        });
      }

      const task = await projectsService.createTask(
        {
          title,
          description,
          projectId,
          assignedToId,
          priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
        },
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear tarea',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        status,
        priority,
        assignedToId,
        dueDate,
        startDate,
        endDate,
      } = req.body;

      const task = await projectsService.updateTask(id, {
        title,
        description,
        status,
        priority,
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: task,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Tarea no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar tarea',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await projectsService.deleteTask(id);

      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Tarea no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al eliminar tarea',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ============================================================================
  // DISCUSSIONS
  // ============================================================================

  async getDiscussionsByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      const discussions = await projectsService.getDiscussionsByProject(projectId);

      res.json({
        success: true,
        data: discussions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener discusiones',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDiscussionsByTask(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;

      const discussions = await projectsService.getDiscussionsByTask(taskId);

      res.json({
        success: true,
        data: discussions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener discusiones',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createDiscussion(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const { message, projectId, taskId, parentId } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Mensaje es requerido',
        });
      }

      if (!projectId && !taskId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere projectId o taskId',
        });
      }

      const discussion = await projectsService.createDiscussion(
        {
          message,
          projectId,
          taskId,
          parentId,
        },
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Mensaje creado exitosamente',
        data: discussion,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear mensaje',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteDiscussion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await projectsService.deleteDiscussion(id);

      res.json({
        success: true,
        message: 'Mensaje eliminado exitosamente',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Mensaje no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al eliminar mensaje',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
