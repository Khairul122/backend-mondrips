import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth.routes';
import { sosialMediaRoutes } from './routes/sosial-media.routes';
import { collaborationSliderRoutes } from './routes/collaboration-slider.routes';
import swaggerDocs from './docs/swagger';
import { AppEnv } from './types';
import { UserRepository } from './repositories/user.repository';

const app = new Hono<{ Bindings: AppEnv['Bindings']; Variables: AppEnv['Variables'] }>();

app.use('*', logger());

app.use('*', async (c, next) => {
  const origins = c.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
  const corsMiddleware = cors({
    origin: origins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

app.use('/api/auth/*', (c, next) => {
  c.set('userRepository', new UserRepository(c.env.DB));
  return next();
});

app.route('/api/auth', authRoutes);
app.route('/api/sosial-media', sosialMediaRoutes);
app.route('/api/collaboration-sliders', collaborationSliderRoutes);

app.route('/', swaggerDocs);

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'Mondrips API',
    version: '1.0.0',
    environment: c.env.NODE_ENV,
    documentation: '/docs',
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

export default app;
