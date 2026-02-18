import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { corsMiddleware } from './middlewares/cors.middleware';
import { authRoutes } from './routes/auth.routes';
import { sosialMediaRoutes } from './routes/sosial-media.routes';
import { collaborationSliderRoutes } from './routes/collaboration-slider.routes';
import swaggerDocs from './docs/swagger';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', corsMiddleware);

app.route('/api/auth', authRoutes);
app.route('/api/sosial-media', sosialMediaRoutes);
app.route('/api/collaboration-sliders', collaborationSliderRoutes);

app.route('/api-docs', swaggerDocs);

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'Mondrips API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Route not found',
    },
    404
  );
});

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      success: false,
      message: 'Internal server error',
    },
    500
  );
});

const port = parseInt(process.env.PORT || '3000');
const host = process.env.HOST || 'localhost';
const useHttps = process.env.HTTPS === 'true';
const httpsKeyPath = process.env.HTTPS_KEY_PATH || './certs/server.key';
const httpsCertPath = process.env.HTTPS_CERT_PATH || './certs/server.crt';

const startServer = () => {
  const serverOptions: any = {
    fetch: app.fetch,
    port,
    hostname: host,
  };

  if (useHttps) {
    const keyPath = path.resolve(__dirname, httpsKeyPath);
    const certPath = path.resolve(__dirname, httpsCertPath);

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('SSL certificates not found. Please generate them first.');
      console.error('Run: openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes');
      process.exit(1);
    }

    serverOptions.key = fs.readFileSync(keyPath);
    serverOptions.cert = fs.readFileSync(certPath);
    console.log(`🔒 HTTPS Server running at https://${host}:${port}`);
  } else {
    console.log(`🚀 HTTP Server running at http://${host}:${port}`);
  }

  console.log(`📚 API Documentation: http${useHttps ? 's' : ''}://${host}:${port}/api-docs`);
  console.log(`💚 Health Check: http${useHttps ? 's' : ''}://${host}:${port}/health`);

  serve(serverOptions);
};

startServer();
