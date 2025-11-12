import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface UploadFileInput {
  projectId?: string;
  taskId?: string;
}
