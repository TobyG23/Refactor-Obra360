// Shared package - Types, utilities, and Prisma client

export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

// Re-export commonly used types
export type {
  User,
  RefreshToken,
  UserPermission,
  Project,
  ProjectAssignment,
  Task,
  File,
  Discussion,
  Invoice,
  InvoiceItem,
  Proposal,
  Notification,
  NotificationToken,
  ActivityLog,
} from '@prisma/client';

// Utility types
export type UserWithoutPassword = Omit<
  import('@prisma/client').User,
  'password'
>;

export type CreateUserInput = Pick<
  import('@prisma/client').User,
  'email' | 'password' | 'firstName' | 'lastName' | 'role'
>;

export type UpdateUserInput = Partial<
  Omit<import('@prisma/client').User, 'id' | 'createdAt' | 'updatedAt'>
>;
