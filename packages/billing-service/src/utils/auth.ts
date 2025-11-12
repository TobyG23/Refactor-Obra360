import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export const verifyToken = async (token: string) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.success) {
      const user = response.data.data;
      return { userId: user.id, email: user.email, role: user.role };
    }
    return null;
  } catch (error) {
    return null;
  }
};
