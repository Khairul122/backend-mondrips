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

// Dynamic CORS middleware - supports wildcard patterns
app.use('*', async (c, next) => {
  const requestOrigin = c.req.header('Origin');
  const corsOriginsConfig = c.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
  
  // Function to check if origin matches allowed patterns
  const isOriginAllowed = (origin: string): boolean => {
    if (!origin) return false;
    
    for (const pattern of corsOriginsConfig) {
      const trimmedPattern = pattern.trim();
      
      // Exact match
      if (trimmedPattern === origin) return true;
      
      // Wildcard pattern: *.example.com matches sub.example.com, api.example.com, etc.
      if (trimmedPattern.startsWith('*.')) {
        const baseDomain = trimmedPattern.slice(2); // Remove '*.'
        if (origin.endsWith('.' + baseDomain) || origin === baseDomain) return true;
      }
      
      // Wildcard pattern: https://*.vercel.app matches any subdomain
      if (trimmedPattern.includes('*')) {
        const regexPattern = trimmedPattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '[^.]+');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(origin)) return true;
      }
    }
    return false;
  };
  
  // Determine allowed origin for this request
  const allowedOrigin = (requestOrigin && isOriginAllowed(requestOrigin)) 
    ? requestOrigin 
    : corsOriginsConfig[0]?.trim() || '*';
  
  const corsMiddleware = cors({
    origin: allowedOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

app.use('/api/auth/*', (c, next) => {
  // Validate DB binding exists
  if (!c.env.DB) {
    console.error('❌ D1 Database binding is undefined! Check wrangler.toml and deployment.');
    throw new Error('Database binding not configured. Please check wrangler.toml and ensure D1 database is properly bound.');
  }
  // Pass D1Database directly to UserRepository (no wrapper)
  c.set('userRepository', new UserRepository(c.env.DB));
  return next();
});

// Validate DB and R2 bindings for other routes
app.use('/api/sosial-media/*', (c, next) => {
  if (!c.env.DB) {
    console.error('❌ D1 Database binding is undefined!');
    throw new Error('Database binding not configured.');
  }
  return next();
});

app.use('/api/collaboration-sliders/*', (c, next) => {
  if (!c.env.DB) {
    console.error('❌ D1 Database binding is undefined!');
    throw new Error('Database binding not configured.');
  }
  // R2 validation - skip if not enabled yet
  // Uncomment after enabling R2:
  // if (!c.env.UPLOADS) {
  //   console.error('❌ R2 Bucket binding is undefined! Check wrangler.toml and deployment.');
  //   throw new Error('R2 Bucket binding not configured.');
  // }
  return next();
});

app.route('/api/auth', authRoutes);
app.route('/api/sosial-media', sosialMediaRoutes);
app.route('/api/collaboration-sliders', collaborationSliderRoutes);

// Alternative short routes (without /api/auth prefix)
app.route('/auth', authRoutes);

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
  console.error('❌ Error:', err);
  console.error('Stack:', err.stack);
  
  // Check for specific binding errors
  if (err.message.includes('Database binding')) {
    return c.json(
      {
        success: false,
        message: 'Database configuration error. Please contact administrator.',
        error: 'D1 Database binding not configured',
      },
      500
    );
  }
  
  return c.json(
    {
      success: false,
      message: err.message || 'Internal server error',
    },
    500
  );
});

export default app;
