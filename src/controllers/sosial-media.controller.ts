import { Context } from 'hono';
import { SosialMediaService } from '../services/sosial-media.service';
import { z } from 'zod';

const createSosialMediaSchema = z.object({
  nama_platform: z.string().min(1).max(50),
  username_path: z.string().min(1).max(255),
  icon_class: z.string().max(100).optional().nullable(),
  link_url: z.string().url('Invalid URL format'),
});

const updateSosialMediaSchema = z.object({
  nama_platform: z.string().min(1).max(50).optional(),
  username_path: z.string().min(1).max(255).optional(),
  icon_class: z.string().max(100).optional().nullable(),
  link_url: z.string().url('Invalid URL format').optional(),
});

export class SosialMediaController {
  private sosialMediaService: SosialMediaService;

  constructor() {
    this.sosialMediaService = new SosialMediaService();
  }

  async index(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const sosialMediaList = await this.sosialMediaService.findAllByUserId(user.id_user);

      return c.json({
        success: true,
        data: sosialMediaList,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          500
        );
      }

      return c.json(
        {
          success: false,
          message: 'Failed to retrieve social media list',
        },
        500
      );
    }
  }

  async show(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json(
          {
            success: false,
            message: 'Invalid social media ID',
          },
          400
        );
      }

      const sosialMedia = await this.sosialMediaService.findById(id, user.id_user);

      return c.json({
        success: true,
        data: sosialMedia,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          message: 'Failed to retrieve social media',
        },
        500
      );
    }
  }

  async store(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const body = await c.req.json();
      const validated = createSosialMediaSchema.parse(body);

      const sosialMedia = await this.sosialMediaService.create(user.id_user, validated);

      return c.json(
        {
          success: true,
          message: 'Social media created successfully',
          data: sosialMedia,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors,
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          message: 'Failed to create social media',
        },
        500
      );
    }
  }

  async update(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json(
          {
            success: false,
            message: 'Invalid social media ID',
          },
          400
        );
      }

      const body = await c.req.json();
      const validated = updateSosialMediaSchema.parse(body);

      const sosialMedia = await this.sosialMediaService.update(id, user.id_user, validated);

      return c.json({
        success: true,
        message: 'Social media updated successfully',
        data: sosialMedia,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors,
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          message: 'Failed to update social media',
        },
        500
      );
    }
  }

  async destroy(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json(
          {
            success: false,
            message: 'Invalid social media ID',
          },
          400
        );
      }

      await this.sosialMediaService.delete(id, user.id_user);

      return c.json({
        success: true,
        message: 'Social media deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          message: 'Failed to delete social media',
        },
        500
      );
    }
  }
}
