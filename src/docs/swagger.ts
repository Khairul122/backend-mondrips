import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { AppEnv } from '../types';

const app = new Hono<{ Bindings: AppEnv['Bindings']; Variables: AppEnv['Variables'] }>();

const apiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Mondrips API',
    version: '1.0.0',
    description: 'RESTful API for Mondrips - Cloudflare Workers',
  },
  servers: [
    {
      url: 'https://backend-mondrips.workers.dev',
      description: 'Cloudflare Workers Production',
    },
    {
      url: 'http://localhost:8787',
      description: 'Local Development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'remember_token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id_user: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          username: { type: 'string', example: 'johndoe' },
          full_name: { type: 'string', example: 'John Doe' },
          role: { type: 'string', example: 'user' },
          is_active: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          last_login: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      SosialMedia: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          id_user: { type: 'integer', example: 1 },
          nama_platform: { type: 'string', example: 'Instagram' },
          username_path: { type: 'string', example: '@johndoe' },
          icon_class: { type: 'string', nullable: true, example: 'fa-instagram' },
          link_url: { type: 'string', format: 'uri', example: 'https://instagram.com/johndoe' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CollaborationSlider: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          id_user: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'LA MOUCHE' },
          image_path: { type: 'string', example: '1698765432_abc123.jpg' },
          description: { type: 'string', nullable: true, example: 'Collaboration partner' },
          link_url: { type: 'string', nullable: true, format: 'uri' },
          display_order: { type: 'integer', example: 1 },
          is_active: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateSosialMediaRequest: {
        type: 'object',
        required: ['nama_platform', 'username_path', 'link_url'],
        properties: {
          nama_platform: { type: 'string', minLength: 1, maxLength: 50, example: 'Instagram' },
          username_path: { type: 'string', minLength: 1, maxLength: 255, example: '@johndoe' },
          icon_class: { type: 'string', maxLength: 100, nullable: true, example: 'fa-instagram' },
          link_url: { type: 'string', format: 'uri', example: 'https://instagram.com/johndoe' },
        },
      },
      CreateCollaborationSliderRequest: {
        type: 'object',
        required: ['title', 'image'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 150, example: 'LA MOUCHE' },
          image: { type: 'string', format: 'binary', description: 'Image file (JPG, JPEG, PNG, WEBP, max 2MB)' },
          description: { type: 'string', maxLength: 500, nullable: true },
          link_url: { type: 'string', format: 'uri', nullable: true },
          display_order: { type: 'integer', example: 1 },
          is_active: { type: 'integer', minimum: 0, maximum: 1, example: 1 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'username', 'password', 'full_name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string', minLength: 3 },
                  password: { type: 'string', minLength: 8 },
                  full_name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string' },
                  password: { type: 'string' },
                  remember_me: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Token refreshed' },
          '401': { description: 'Invalid token' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Logout successful' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/sosial-media': {
      get: {
        tags: ['Sosial Media'],
        summary: 'List social media',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List retrieved' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Sosial Media'],
        summary: 'Create social media',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSosialMediaRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/collaboration-sliders/public': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'List active sliders (public)',
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['ASC', 'DESC'] },
          },
        ],
        responses: {
          '200': { description: 'List retrieved' },
        },
      },
    },
    '/api/collaboration-sliders': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'List user sliders',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List retrieved' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Collaboration Sliders'],
        summary: 'Create slider',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateCollaborationSliderRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' },
        },
      },
    },
  },
};

app.get('/', swaggerUI({ url: '/openapi.json' }));
app.get('/openapi.json', (c) => c.json(apiDoc));

export default app;
