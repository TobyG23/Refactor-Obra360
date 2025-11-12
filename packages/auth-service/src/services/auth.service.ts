import { PrismaClient, User, UserRole } from '@obra360/shared';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiration,
} from '../utils/jwt';
import { LoginResponse, RegisterInput, LoginInput } from '../types';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterInput): Promise<LoginResponse> {
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(data.password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.CUSTOMER,
        phone: data.phone,
      },
    });

    // Generar tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Guardar refresh token en BD
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('Usuario desactivado');
    }

    // Generar tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Guardar refresh token en BD
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verificar el refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Refresh token inválido');
    }

    // Verificar que el token existe en la BD y no ha expirado
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Refresh token no encontrado');
    }

    if (storedToken.expiresAt < new Date()) {
      // Eliminar token expirado
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token expirado');
    }

    // Verificar que el usuario sigue activo
    if (!storedToken.user.isActive) {
      throw new Error('Usuario desactivado');
    }

    // Generar nuevos tokens
    const jwtPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    // Eliminar el token antiguo y crear uno nuevo
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Eliminar el refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar password del objeto
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    resourceId?: string
  ): Promise<boolean> {
    // Obtener usuario con su rol
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          where: {
            resource: resource as any,
            action: action as any,
            resourceId: resourceId || null,
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    // STAFF tiene todos los permisos
    if (user.role === UserRole.STAFF) {
      return true;
    }

    // Si hay permisos específicos configurados, usarlos
    if (user.permissions.length > 0) {
      return user.permissions[0].allowed;
    }

    // Permisos por defecto según rol
    if (user.role === UserRole.CUSTOMER) {
      // Customers pueden ver sus proyectos, tasks, files, discussions
      if (
        ['PROJECTS', 'TASKS', 'FILES', 'DISCUSSIONS'].includes(resource) &&
        action === 'VIEW'
      ) {
        return true;
      }
      // Customers pueden crear discussions
      if (resource === 'DISCUSSIONS' && action === 'CREATE') {
        return true;
      }
      return false;
    }

    if (user.role === UserRole.CONTRACTOR) {
      // Contractors pueden ver proyectos, tasks, files, discussions asignados
      if (
        ['PROJECTS', 'TASKS', 'FILES', 'DISCUSSIONS'].includes(resource) &&
        ['VIEW', 'CREATE'].includes(action)
      ) {
        return true;
      }
      // Contractors pueden editar sus tasks asignadas
      if (resource === 'TASKS' && action === 'EDIT') {
        return true;
      }
      return false;
    }

    return false;
  }
}
