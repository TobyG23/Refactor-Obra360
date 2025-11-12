import axios from 'axios';

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export const verifyToken = async (
  token: string
): Promise<{
  userId: string;
  email: string;
  role: string;
} | null> => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      const user = response.data.data;
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const checkPermission = async (
  token: string,
  resource: string,
  action: string,
  resourceId?: string
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${AUTH_SERVICE_URL}/api/auth/check-permission`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          resource,
          action,
          resourceId,
        },
      }
    );

    if (response.data.success) {
      return response.data.data.hasPermission;
    }

    return false;
  } catch (error) {
    return false;
  }
};
