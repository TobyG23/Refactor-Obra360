import { FilesService } from '../services/files.service';
import { PrismaClient, FileType, FileStatus } from '@obra360/shared';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock Prisma Client
jest.mock('@obra360/shared', () => {
  const actualModule = jest.requireActual('@obra360/shared');
  return {
    ...actualModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      file: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      fileVersion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      fileShare: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
    })),
  };
});

// Mock fs/promises
jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('FilesService', () => {
  let filesService: FilesService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    filesService = new FilesService();
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      const fileData = {
        filename: 'test.pdf',
        originalName: 'test-document.pdf',
        path: '/uploads/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };
      const userId = 'user-123';
      const projectId = 'project-123';

      const mockFile = {
        id: 'file-123',
        name: fileData.originalName,
        filename: fileData.filename,
        path: fileData.path,
        size: fileData.size,
        mimeType: fileData.mimetype,
        type: FileType.DOCUMENT,
        status: FileStatus.ACTIVE,
        projectId,
        uploadedById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.findUnique.mockResolvedValue({ id: projectId });
      prisma.file.create.mockResolvedValue(mockFile);

      const result = await filesService.uploadFile(fileData, userId, projectId);

      expect(result).toEqual(mockFile);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(prisma.file.create).toHaveBeenCalled();
    });

    it('should throw error if project not found', async () => {
      const fileData = {
        filename: 'test.pdf',
        originalName: 'test-document.pdf',
        path: '/uploads/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };
      const userId = 'user-123';
      const projectId = 'invalid-project';

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        filesService.uploadFile(fileData, userId, projectId)
      ).rejects.toThrow('Proyecto no encontrado');
    });

    it('should detect correct file type from mimetype', async () => {
      const imageFile = {
        filename: 'image.png',
        originalName: 'photo.png',
        path: '/uploads/image.png',
        mimetype: 'image/png',
        size: 2048,
      };
      const userId = 'user-123';
      const projectId = 'project-123';

      prisma.project.findUnique.mockResolvedValue({ id: projectId });
      prisma.file.create.mockImplementation((data: any) => {
        return Promise.resolve({
          ...data.data,
          id: 'file-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await filesService.uploadFile(imageFile, userId, projectId);

      expect(prisma.file.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: FileType.IMAGE,
          }),
        })
      );
    });
  });

  describe('getFilesByProject', () => {
    it('should return all files for a project', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';

      const mockFiles = [
        {
          id: 'file-1',
          name: 'file1.pdf',
          type: FileType.DOCUMENT,
          size: 1024,
          status: FileStatus.ACTIVE,
        },
        {
          id: 'file-2',
          name: 'file2.png',
          type: FileType.IMAGE,
          size: 2048,
          status: FileStatus.ACTIVE,
        },
      ];

      prisma.project.findUnique.mockResolvedValue({ id: projectId });
      prisma.file.findMany.mockResolvedValue(mockFiles);

      const result = await filesService.getFilesByProject(projectId, userId);

      expect(result).toEqual(mockFiles);
      expect(prisma.file.findMany).toHaveBeenCalledWith({
        where: {
          projectId,
          status: FileStatus.ACTIVE,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          versions: {
            orderBy: {
              versionNumber: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw error if project not found', async () => {
      const projectId = 'invalid-project';
      const userId = 'user-123';

      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        filesService.getFilesByProject(projectId, userId)
      ).rejects.toThrow('Proyecto no encontrado');
    });
  });

  describe('getFileById', () => {
    it('should return a file by id', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        name: 'test.pdf',
        type: FileType.DOCUMENT,
        size: 1024,
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);

      const result = await filesService.getFileById(fileId, userId);

      expect(result).toEqual(mockFile);
      expect(prisma.file.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          project: true,
          versions: {
            orderBy: {
              versionNumber: 'desc',
            },
          },
        },
      });
    });

    it('should throw error if file not found', async () => {
      const fileId = 'invalid-file';
      const userId = 'user-123';

      prisma.file.findUnique.mockResolvedValue(null);

      await expect(
        filesService.getFileById(fileId, userId)
      ).rejects.toThrow('Archivo no encontrado');
    });
  });

  describe('downloadFile', () => {
    it('should return file path for download', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        path: '/uploads/test.pdf',
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      mockFs.access.mockResolvedValue(undefined);

      const result = await filesService.downloadFile(fileId, userId);

      expect(result).toEqual({ path: mockFile.path });
      expect(mockFs.access).toHaveBeenCalledWith(mockFile.path, (fs as any).constants.F_OK);
    });

    it('should throw error if file is deleted', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        path: '/uploads/test.pdf',
        status: FileStatus.DELETED,
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);

      await expect(
        filesService.downloadFile(fileId, userId)
      ).rejects.toThrow('Archivo no encontrado o no disponible');
    });

    it('should throw error if physical file does not exist', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        path: '/uploads/test.pdf',
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(
        filesService.downloadFile(fileId, userId)
      ).rejects.toThrow('El archivo físico no existe');
    });
  });

  describe('deleteFile', () => {
    it('should soft delete a file', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      const mockUpdatedFile = {
        ...mockFile,
        status: FileStatus.DELETED,
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      prisma.file.update.mockResolvedValue(mockUpdatedFile);

      const result = await filesService.deleteFile(fileId, userId);

      expect(result).toEqual(mockUpdatedFile);
      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: fileId },
        data: { status: FileStatus.DELETED },
      });
    });

    it('should throw error if file not found', async () => {
      const fileId = 'invalid-file';
      const userId = 'user-123';

      prisma.file.findUnique.mockResolvedValue(null);

      await expect(
        filesService.deleteFile(fileId, userId)
      ).rejects.toThrow('Archivo no encontrado');
    });
  });

  describe('createVersion', () => {
    it('should create a new file version', async () => {
      const fileId = 'file-123';
      const fileData = {
        filename: 'test-v2.pdf',
        originalName: 'test-document-v2.pdf',
        path: '/uploads/test-v2.pdf',
        mimetype: 'application/pdf',
        size: 2048,
      };
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      const mockVersions = [
        { versionNumber: 1 },
        { versionNumber: 2 },
      ];

      const mockNewVersion = {
        id: 'version-123',
        fileId,
        filename: fileData.filename,
        path: fileData.path,
        size: fileData.size,
        versionNumber: 3,
        uploadedById: userId,
        createdAt: new Date(),
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      prisma.fileVersion.findMany.mockResolvedValue(mockVersions);
      prisma.fileVersion.create.mockResolvedValue(mockNewVersion);

      const result = await filesService.createVersion(fileId, fileData, userId);

      expect(result).toEqual(mockNewVersion);
      expect(prisma.fileVersion.create).toHaveBeenCalledWith({
        data: {
          fileId,
          filename: fileData.filename,
          path: fileData.path,
          size: fileData.size,
          mimeType: fileData.mimetype,
          versionNumber: 3,
          uploadedById: userId,
        },
      });
    });

    it('should create version 1 if no previous versions exist', async () => {
      const fileId = 'file-123';
      const fileData = {
        filename: 'test.pdf',
        originalName: 'test-document.pdf',
        path: '/uploads/test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      };
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      prisma.fileVersion.findMany.mockResolvedValue([]);
      prisma.fileVersion.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: 'version-123',
          ...data.data,
          createdAt: new Date(),
        });
      });

      await filesService.createVersion(fileId, fileData, userId);

      expect(prisma.fileVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            versionNumber: 1,
          }),
        })
      );
    });
  });

  describe('shareFile', () => {
    it('should create a shareable link for a file', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';
      const expiresInDays = 7;

      const mockFile = {
        id: fileId,
        status: FileStatus.ACTIVE,
        project: { id: 'project-123' },
      };

      const mockShare = {
        id: 'share-123',
        fileId,
        token: 'share-token-123',
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        createdById: userId,
      };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      prisma.fileShare.create.mockResolvedValue(mockShare);

      const result = await filesService.shareFile(fileId, userId, expiresInDays);

      expect(result).toEqual(mockShare);
      expect(prisma.fileShare.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fileId,
            createdById: userId,
          }),
        })
      );
    });

    it('should throw error if file not found', async () => {
      const fileId = 'invalid-file';
      const userId = 'user-123';

      prisma.file.findUnique.mockResolvedValue(null);

      await expect(
        filesService.shareFile(fileId, userId)
      ).rejects.toThrow('Archivo no encontrado');
    });
  });

  describe('getFileByShareToken', () => {
    it('should return file for valid share token', async () => {
      const token = 'share-token-123';

      const mockShare = {
        id: 'share-123',
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accessCount: 5,
        file: {
          id: 'file-123',
          name: 'test.pdf',
          path: '/uploads/test.pdf',
        },
      };

      prisma.fileShare.findUnique.mockResolvedValue(mockShare);
      prisma.fileShare.update.mockResolvedValue({ ...mockShare, accessCount: 6 });

      const result = await filesService.getFileByShareToken(token);

      expect(result).toEqual(mockShare.file);
      expect(prisma.fileShare.update).toHaveBeenCalledWith({
        where: { token },
        data: { accessCount: { increment: 1 } },
      });
    });

    it('should throw error if share token not found', async () => {
      const token = 'invalid-token';

      prisma.fileShare.findUnique.mockResolvedValue(null);

      await expect(
        filesService.getFileByShareToken(token)
      ).rejects.toThrow('Enlace de compartición no válido');
    });

    it('should throw error if share token expired', async () => {
      const token = 'expired-token';

      const mockShare = {
        id: 'share-123',
        token,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      prisma.fileShare.findUnique.mockResolvedValue(mockShare);

      await expect(
        filesService.getFileByShareToken(token)
      ).rejects.toThrow('El enlace de compartición ha expirado');
    });
  });
});
