import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { AppEnv } from '../types';

const app = new Hono<{ Bindings: AppEnv['Bindings']; Variables: AppEnv['Variables'] }>();

const getApiDoc = (c: AppEnv) => ({
  openapi: '3.0.0',
  info: {
    title: 'Mondrips API',
    version: '1.0.0',
    description: 'RESTful API for Mondrips - Cloudflare Workers',
  },
  servers: [
    {
      url: 'https://backend-mondrips-production.mondrips-api.workers.dev',
      description: 'Production',
    },
    {
      url: 'https://backend-mondrips-staging.mondrips-api.workers.dev',
      description: 'Staging',
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
    '/api/auth/change-password': {
      put: {
        tags: ['Authentication'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: {
                  current_password: { type: 'string', minLength: 1 },
                  new_password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password changed' },
          '400': { description: 'Validation error' },
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
    '/api/sosial-media/{id}': {
      get: {
        tags: ['Sosial Media'],
        summary: 'Get social media by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Social media retrieved' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Sosial Media'],
        summary: 'Update social media',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSosialMediaRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Sosial Media'],
        summary: 'Delete social media',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Deleted' },
          '404': { description: 'Not found' },
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
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['ASC', 'DESC'] },
          },
        ],
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
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'image_path'],
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 150, example: 'LA MOUCHE' },
                  image_path: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
                  description: { type: 'string', maxLength: 500, nullable: true },
                  link_url: { type: 'string', format: 'uri', nullable: true },
                  display_order: { type: 'integer', example: 1 },
                  is_active: { type: 'integer', minimum: 0, maximum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/collaboration-sliders/{id}': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'Get slider by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Slider retrieved' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Collaboration Sliders'],
        summary: 'Update slider',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 150 },
                  image_path: { type: 'string', format: 'uri' },
                  description: { type: 'string', maxLength: 500, nullable: true },
                  link_url: { type: 'string', format: 'uri', nullable: true },
                  display_order: { type: 'integer' },
                  is_active: { type: 'integer', minimum: 0, maximum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated' },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Collaboration Sliders'],
        summary: 'Delete slider',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Deleted' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/collaboration-sliders/{id}/order': {
      patch: {
        tags: ['Collaboration Sliders'],
        summary: 'Update display order',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['display_order'],
                properties: {
                  display_order: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Order updated' },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/collaboration-sliders/{id}/status': {
      patch: {
        tags: ['Collaboration Sliders'],
        summary: 'Toggle slider status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'integer', minimum: 0, maximum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
} as const);

app.get('/', swaggerUI({ url: '/openapi.json' }));
app.get('/openapi.json', (c) => c.json(getApiDoc(c)));

export default app;
