import { AuthService } from '../services/auth.service';
import { PrismaClient, UserRole } from '@obra360/shared';
import * as passwordUtils from '../utils/password';
import * as jwtUtils from '../utils/jwt';

// Mock Prisma Client
jest.mock('@obra360/shared', () => {
  const actualModule = jest.requireActual('@obra360/shared');
  return {
    ...actualModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});

// Mock password utils
jest.mock('../utils/password');
jest.mock('../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CLIENT,
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue({ ...mockUser, password: hashedPassword });

      const result = await authService.register(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      });
      expect(result).toEqual(mockUser);
      expect(result.password).toBeUndefined();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CLIENT,
      };

      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(userData)).rejects.toThrow(
        'El email ya está registrado'
      );
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CLIENT,
      };

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);
      prisma.refreshToken.create.mockResolvedValue({
        id: 'token-123',
        token: mockTokens.refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(),
      });

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('accessToken', mockTokens.accessToken);
      expect(result).toHaveProperty('refreshToken', mockTokens.refreshToken);
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should throw error with invalid email', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'Password123!',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('should throw error with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        password: 'hashedPassword',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(credentials)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userId = 'user-123';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        role: UserRole.CLIENT,
      };

      const mockRefreshToken = {
        id: 'token-123',
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({ userId });
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue(newTokens);
      prisma.refreshToken.delete.mockResolvedValue(mockRefreshToken);
      prisma.refreshToken.create.mockResolvedValue({
        id: 'new-token-123',
        token: newTokens.refreshToken,
        userId,
        expiresAt: new Date(),
      });

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toEqual(newTokens);
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw error with invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      (jwtUtils.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow();
    });

    it('should throw error if refresh token not found in database', async () => {
      const refreshToken = 'valid-but-not-in-db';
      const userId = 'user-123';

      (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({ userId });
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Token de refresco inválido'
      );
    });

    it('should throw error if refresh token expired', async () => {
      const refreshToken = 'expired-token';
      const userId = 'user-123';

      const mockRefreshToken = {
        id: 'token-123',
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      };

      (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({ userId });
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Token de refresco expirado'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout and delete refresh token', async () => {
      const userId = 'user-123';

      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await authService.logout(userId);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should handle logout even if no tokens exist', async () => {
      const userId = 'user-123';

      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

      await expect(authService.logout(userId)).resolves.not.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should return user if valid', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CLIENT,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.validateUser(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: true,
        },
      });
    });

    it('should throw error if user not found', async () => {
      const userId = 'invalid-user';

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.validateUser(userId)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getUserById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      const userId = 'invalid-user';

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getUserById(userId)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });
});
