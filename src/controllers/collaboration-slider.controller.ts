import { Context } from 'hono';
import { CollaborationSliderService } from '../services/collaboration-slider.service';
import { z } from 'zod';
import { AppEnv } from '../types';
// R2 upload temporarily disabled
// import {
//   UploadedFile,
//   validateFile,
//   saveFile,
//   generateUniqueFilename,
//   deleteFile,
// } from '../utils/file-upload';

const createSliderSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional().nullable().default(null),
  link_url: z.string().url('Invalid URL format').optional().nullable().default(null),
  display_order: z.coerce.number().int().default(0),
  is_active: z.coerce.number().int().min(0).max(1).default(1),
});

const updateSliderSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  link_url: z.string().url('Invalid URL format').optional().nullable(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
});

export class CollaborationSliderController {
  constructor() {}

  async index(c: Context<AppEnv>) {
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

      const orderByParam = c.req.query('order') || 'ASC';
      const orderBy = orderByParam.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const sliderList = await service.findAllByUserId(user.id_user, orderBy);

      return c.json({
        success: true,
        data: sliderList,
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
          message: 'Failed to retrieve collaboration sliders',
        },
        500
      );
    }
  }

  async indexPublic(c: Context<AppEnv>) {
    try {
      const orderByParam = c.req.query('order') || 'ASC';
      const orderBy = orderByParam.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const sliderList = await service.findActiveAll(orderBy);

      return c.json({
        success: true,
        data: sliderList,
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
          message: 'Failed to retrieve collaboration sliders',
        },
        500
      );
    }
  }

  async show(c: Context<AppEnv>) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const slider = await service.findById(id, user.id_user);

      return c.json({
        success: true,
        data: slider,
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
          message: 'Failed to retrieve collaboration slider',
        },
        500
      );
    }
  }

  async store(c: Context<AppEnv>) {
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
      
      // Simple validation
      if (!body.title) {
        return c.json(
          {
            success: false,
            message: 'Title is required',
          },
          400
        );
      }

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const slider = await service.create(user.id_user, {
        title: body.title,
        image_path: body.image_path || 'placeholder.jpg',
        description: body.description ?? null,
        link_url: body.link_url ?? null,
        display_order: body.display_order ?? 0,
        is_active: body.is_active ?? 1,
      });

      return c.json(
        {
          success: true,
          message: 'Collaboration slider created successfully',
          data: slider,
        },
        201
      );
    } catch (error) {
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
          message: 'Failed to create collaboration slider',
        },
        500
      );
    }
  }

  async update(c: Context<AppEnv>) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const body = await c.req.json();
      const title = body.title as string | undefined;
      const image_path = body.image_path as string | undefined;
      const description = body.description as string | undefined;
      const linkUrl = body.link_url as string | undefined;
      const displayOrder = body.display_order as number | undefined;
      const isActive = body.is_active as number | undefined;

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const oldSlider = await service.findById(id, user.id_user);

      // Temporarily disabled file upload - use provided image_path or keep old one
      const imagePath = image_path || oldSlider.image_path;

      const validatedData = updateSliderSchema.parse({
        title,
        image_path: imagePath,
        description: description || null,
        link_url: linkUrl || null,
        display_order: displayOrder !== undefined ? displayOrder : undefined,
        is_active: isActive !== undefined ? isActive : undefined,
      });

      const slider = await service.update(
        id,
        user.id_user,
        {
          title: validatedData.title,
          image_path: validatedData.image_path,
          description: validatedData.description,
          link_url: validatedData.link_url,
          display_order: validatedData.display_order,
          is_active: validatedData.is_active,
        },
        oldSlider.image_path
      );

      return c.json({
        success: true,
        message: 'Collaboration slider updated successfully',
        data: slider,
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
          message: 'Failed to update collaboration slider',
        },
        500
      );
    }
  }

  async destroy(c: Context<AppEnv>) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      await service.delete(id, user.id_user);

      return c.json({
        success: true,
        message: 'Collaboration slider deleted successfully',
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
          message: 'Failed to delete collaboration slider',
        },
        500
      );
    }
  }

  async updateOrder(c: Context<AppEnv>) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const body = await c.req.json();
      const displayOrder = parseInt(body.display_order);

      if (isNaN(displayOrder)) {
        return c.json(
          {
            success: false,
            message: 'Display order must be a number',
          },
          400
        );
      }

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const slider = await service.update(
        id,
        user.id_user,
        { display_order: displayOrder },
        null
      );

      return c.json({
        success: true,
        message: 'Display order updated successfully',
        data: slider,
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
          message: 'Failed to update display order',
        },
        500
      );
    }
  }

  async updateStatus(c: Context<AppEnv>) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const body = await c.req.json();
      const isActive = parseInt(body.is_active);

      if (isNaN(isActive) || (isActive !== 0 && isActive !== 1)) {
        return c.json(
          {
            success: false,
            message: 'is_active must be 0 or 1',
          },
          400
        );
      }

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const slider = await service.update(
        id,
        user.id_user,
        { is_active: isActive },
        null
      );

      return c.json({
        success: true,
        message: 'Status updated successfully',
        data: slider,
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
          message: 'Failed to update status',
        },
        500
      );
    }
  }
}
