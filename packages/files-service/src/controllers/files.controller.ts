import { Response } from 'express';
import { AuthRequest } from '../types';
import { FilesService } from '../services/files.service';
import { UserRole } from '@obra360/shared';
import path from 'path';
import { formatFileSize } from '../utils/storage';

const filesService = new FilesService();

export class FilesController {
  async uploadFile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo',
        });
      }

      const { projectId, taskId } = req.body;

      if (!projectId && !taskId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere projectId o taskId',
        });
      }

      const file = await filesService.uploadFile(
        req.file,
        req.user.userId,
        projectId,
        taskId
      );

      res.status(201).json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: {
          ...file,
          sizeFormatted: formatFileSize(file.size),
        },
      });
    } catch (error) {
      // Si hubo un error y el archivo ya se subió, lo eliminamos
      if (req.file) {
        const fs = require('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo:', unlinkError);
        }
      }

      res.status(400).json({
        success: false,
        message: 'Error al subir archivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async uploadMultipleFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos',
        });
      }

      const { projectId, taskId } = req.body;

      if (!projectId && !taskId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere projectId o taskId',
        });
      }

      const uploadedFiles = await Promise.all(
        req.files.map((file) =>
          filesService.uploadFile(file, req.user!.userId, projectId, taskId)
        )
      );

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
        data: uploadedFiles.map((file) => ({
          ...file,
          sizeFormatted: formatFileSize(file.size),
        })),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al subir archivos',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAllFiles(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const files = await filesService.getAllFiles(
        req.user.userId,
        req.user.role as UserRole
      );

      res.json({
        success: true,
        data: files.map((file) => ({
          ...file,
          sizeFormatted: formatFileSize(file.size),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getFilesByProject(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;

      const files = await filesService.getFilesByProject(projectId);

      res.json({
        success: true,
        data: files.map((file) => ({
          ...file,
          sizeFormatted: formatFileSize(file.size),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getFilesByTask(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;

      const files = await filesService.getFilesByTask(taskId);

      res.json({
        success: true,
        data: files.map((file) => ({
          ...file,
          sizeFormatted: formatFileSize(file.size),
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getFileById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const file = await filesService.getFileById(id);

      res.json({
        success: true,
        data: {
          ...file,
          sizeFormatted: formatFileSize(file.size),
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Archivo no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al obtener archivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async downloadFile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const file = await filesService.getFileById(id);
      const filePath = filesService.getFilePath(file);

      // Verificar que el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo físico no encontrado en el servidor',
        });
      }

      // Configurar headers para descarga
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      res.setHeader('Content-Type', file.mimeType);

      // Enviar archivo
      res.sendFile(filePath);
    } catch (error) {
      if (error instanceof Error && error.message === 'Archivo no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al descargar archivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteFile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await filesService.deleteFileById(id);

      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Archivo no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al eliminar archivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
