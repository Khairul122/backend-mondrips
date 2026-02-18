import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';

const app = new Hono();

const apiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Mondrips API',
    version: '1.0.0',
    description: 'RESTful API for Mondrips Authentication System',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
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
          image_path: { type: 'string', example: 'public/uploads/sliders/1698765432_abc123.jpg' },
          description: { type: 'string', nullable: true, example: 'Collaboration partner since 2023' },
          link_url: { type: 'string', nullable: true, format: 'uri', example: 'https://lamouche.com' },
          display_order: { type: 'integer', example: 1 },
          is_active: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'username', 'password', 'full_name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          username: { type: 'string', minLength: 3, maxLength: 50, example: 'johndoe' },
          password: { type: 'string', minLength: 8, example: 'Password123' },
          full_name: { type: 'string', minLength: 1, maxLength: 100, example: 'John Doe' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'Password123' },
          remember_me: { type: 'boolean', example: true },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              token_type: { type: 'string', example: 'Bearer' },
              expires_in: { type: 'string', example: '15m' },
            },
          },
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
      UpdateSosialMediaRequest: {
        type: 'object',
        properties: {
          nama_platform: { type: 'string', minLength: 1, maxLength: 50, example: 'Facebook' },
          username_path: { type: 'string', minLength: 1, maxLength: 255, example: '@johndoe_fb' },
          icon_class: { type: 'string', maxLength: 100, nullable: true, example: 'fa-facebook' },
          link_url: { type: 'string', format: 'uri', example: 'https://facebook.com/johndoe' },
        },
      },
      CreateCollaborationSliderRequest: {
        type: 'object',
        required: ['title', 'image'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 150, example: 'LA MOUCHE' },
          image: { type: 'string', format: 'binary', description: 'Image file (JPG, JPEG, PNG, WEBP, max 2MB)' },
          description: { type: 'string', maxLength: 500, nullable: true, example: 'Premium collaboration partner' },
          link_url: { type: 'string', format: 'uri', nullable: true, example: 'https://lamouche.com' },
          display_order: { type: 'integer', example: 1 },
          is_active: { type: 'integer', minimum: 0, maximum: 1, example: 1 },
        },
      },
      UpdateCollaborationSliderRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 150, example: 'NADSA' },
          image: { type: 'string', format: 'binary', description: 'New image file (optional)' },
          description: { type: 'string', maxLength: 500, nullable: true, example: 'Updated description' },
          link_url: { type: 'string', format: 'uri', nullable: true, example: 'https://nadsa.com' },
          display_order: { type: 'integer', example: 2 },
          is_active: { type: 'integer', minimum: 0, maximum: 1, example: 0 },
        },
      },
      UpdateOrderRequest: {
        type: 'object',
        required: ['display_order'],
        properties: {
          display_order: { type: 'integer', example: 5 },
        },
      },
      UpdateStatusRequest: {
        type: 'object',
        required: ['is_active'],
        properties: {
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
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or duplicate email/username',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
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
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using remember token cookie',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        access_token: { type: 'string' },
                        token_type: { type: 'string' },
                        expires_in: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid or missing remember token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/change-password': {
      put: {
        tags: ['Authentication'],
        summary: 'Change user password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: {
                  current_password: { type: 'string', example: 'OldPassword123' },
                  new_password: { type: 'string', minLength: 8, example: 'NewPassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password changed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid current password or validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/sosial-media': {
      get: {
        tags: ['Sosial Media'],
        summary: 'Get all social media links for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Social media list retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SosialMedia' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Sosial Media'],
        summary: 'Create a new social media link',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSosialMediaRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Social media created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SosialMedia' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/sosial-media/{id}': {
      get: {
        tags: ['Sosial Media'],
        summary: 'Get a specific social media link by ID',
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
          '200': {
            description: 'Social media retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/SosialMedia' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Social media not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Sosial Media'],
        summary: 'Update a specific social media link',
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
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateSosialMediaRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Social media updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SosialMedia' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Social media not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Sosial Media'],
        summary: 'Delete a specific social media link',
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
          '200': {
            description: 'Social media deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Social media not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/collaboration-sliders/public': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'Get all active collaboration sliders (public endpoint)',
        parameters: [
          {
            name: 'order',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'ASC' },
            description: 'Sort order by display_order',
          },
        ],
        responses: {
          '200': {
            description: 'Active sliders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CollaborationSlider' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/collaboration-sliders': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'Get all collaboration sliders for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'order',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'ASC' },
            description: 'Sort order by display_order',
          },
        ],
        responses: {
          '200': {
            description: 'Collaboration sliders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CollaborationSlider' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Collaboration Sliders'],
        summary: 'Create a new collaboration slider',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateCollaborationSliderRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Collaboration slider created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CollaborationSlider' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/collaboration-sliders/{id}': {
      get: {
        tags: ['Collaboration Sliders'],
        summary: 'Get a specific collaboration slider by ID',
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
          '200': {
            description: 'Collaboration slider retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/CollaborationSlider' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Slider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Collaboration Sliders'],
        summary: 'Update a specific collaboration slider',
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
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/UpdateCollaborationSliderRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Collaboration slider updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CollaborationSlider' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Slider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Collaboration Sliders'],
        summary: 'Delete a specific collaboration slider',
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
          '200': {
            description: 'Collaboration slider deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Slider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/collaboration-sliders/{id}/order': {
      patch: {
        tags: ['Collaboration Sliders'],
        summary: 'Update display order of a collaboration slider',
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
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Display order updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CollaborationSlider' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Slider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/collaboration-sliders/{id}/status': {
      patch: {
        tags: ['Collaboration Sliders'],
        summary: 'Update active status of a collaboration slider',
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
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStatusRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CollaborationSlider' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Slider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

app.get('/', swaggerUI({ url: '/api-docs/openapi.json' }));
app.get('/openapi.json', (c) => c.json(apiDoc));

export default app;
