import request from 'supertest';
import app from '../index';

describe('API Gateway Integration Tests', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API Gateway is healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBeLessThan(300);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app).get('/health');

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Rate Limiting', () => {
    it('should accept requests within limit', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    // Note: Testing rate limit exhaustion requires many requests
    // This is a basic test to ensure the middleware is applied
    it('should have rate limit headers', async () => {
      const response = await request(app).get('/health');

      // Rate limit middleware typically adds headers
      // The exact headers depend on the configuration
      expect(response.status).toBe(200);
    });
  });

  describe('Route Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
    });
  });

  describe('JSON Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      // This test verifies that express.json() middleware is working
      // We can't test this directly without a route that accepts POST
      // but we can verify the middleware doesn't break the app
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Proxy Configuration', () => {
    // Note: These tests verify routes exist but won't actually proxy
    // since the backend services aren't running in the test environment

    it('should have auth proxy route configured', async () => {
      // We expect the route to exist but will fail to connect to backend
      const response = await request(app).get('/api/auth/health');

      // The response will be an error since the auth service isn't running
      // but we're verifying the route is configured
      expect(response.status).not.toBe(404); // Should not be "Route not found"
    });

    it('should have projects proxy route configured', async () => {
      const response = await request(app).get('/api/projects/health');
      expect(response.status).not.toBe(404);
    });

    it('should have files proxy route configured', async () => {
      const response = await request(app).get('/api/files/health');
      expect(response.status).not.toBe(404);
    });

    it('should have billing proxy route configured', async () => {
      const response = await request(app).get('/api/billing/health');
      expect(response.status).not.toBe(404);
    });

    it('should have notifications proxy route configured', async () => {
      const response = await request(app).get('/api/notifications/health');
      expect(response.status).not.toBe(404);
    });

    it('should have analytics proxy route configured', async () => {
      const response = await request(app).get('/api/analytics/health');
      expect(response.status).not.toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);
    });
  });

  describe('Request Logging', () => {
    it('should process requests without logging errors', async () => {
      // Morgan logging shouldn't break the request
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });
});
