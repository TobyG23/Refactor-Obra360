import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  customerId: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assignedToId?: string;
  priority?: string;
  dueDate?: Date;
  startDate?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateDiscussionInput {
  message: string;
  projectId?: string;
  taskId?: string;
  parentId?: string;
}

export interface AssignContractorInput {
  userId: string;
  role?: string;
}
