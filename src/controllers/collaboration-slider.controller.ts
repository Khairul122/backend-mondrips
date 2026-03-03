import { Context } from 'hono';
import { CollaborationSliderService } from '../services/collaboration-slider.service';
import { z } from 'zod';
import { AppEnv } from '../types';

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

// File upload helpers
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}_${randomStr}.${ext}`;
}

async function validateFile(file: File): Promise<void> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

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

      const contentType = c.req.header('Content-Type') || '';

      // Handle multipart/form-data (file upload to R2)
      if (contentType.includes('multipart/form-data')) {
        // Check if R2 is enabled
        if (!c.env.UPLOADS) {
          return c.json(
            {
              success: false,
              message: 'R2 storage not configured. Please use image_path URL instead or enable R2 bucket.',
            },
            503
          );
        }

        const formData = await c.req.parseFormData();
        
        const imageFile = formData.get('image') as File;
        if (!imageFile || imageFile.size === 0) {
          return c.json(
            {
              success: false,
              message: 'Image file is required',
            },
            400
          );
        }

        // Validate file
        await validateFile(imageFile);

        // Generate unique filename and upload to R2
        const filename = generateUniqueFilename(imageFile.name);
        const arrayBuffer = await imageFile.arrayBuffer();
        await c.env.UPLOADS.put(filename, arrayBuffer, {
          httpMetadata: { contentType: imageFile.type },
        });

        // Create public URL (using Workers.dev domain or custom domain)
        const imageUrl = `https://mondrips-uploads.mondrips.workers.dev/${filename}`;

        // Get other form fields
        const title = formData.get('title') as string;
        const description = formData.get('description') as string | null;
        const link_url = formData.get('link_url') as string | null;
        const display_order = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0;
        const is_active = formData.get('is_active') ? parseInt(formData.get('is_active') as string) : 1;

        if (!title) {
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
          title,
          image_path: imageUrl,
          description: description ?? null,
          link_url: link_url ?? null,
          display_order,
          is_active,
        });

        return c.json(
          {
            success: true,
            message: 'Collaboration slider created successfully',
            data: slider,
          },
          201
        );
      }

      // Handle application/json (URL-based image_path)
      const body = await c.req.json();
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
        if (error.message.includes('file') || error.message.includes('image')) {
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

      const service = new CollaborationSliderService(c.env.DB, c.env.UPLOADS);
      const oldSlider = await service.findById(id, user.id_user);
      let newImagePath = oldSlider.image_path;
      let shouldDeleteOldImage = false;

      const contentType = c.req.header('Content-Type') || '';

      // Handle multipart/form-data (file upload)
      if (contentType.includes('multipart/form-data')) {
        const formData = await c.req.parseFormData();
        const imageFile = formData.get('image') as File;

        // If new image is uploaded
        if (imageFile && imageFile.size > 0) {
          await validateFile(imageFile);
          
          const filename = generateUniqueFilename(imageFile.name);
          const arrayBuffer = await imageFile.arrayBuffer();
          await c.env.UPLOADS.put(filename, arrayBuffer, {
            httpMetadata: { contentType: imageFile.type },
          });

          const imageUrl = `https://mondrips-uploads.mondrips.workers.dev/${filename}`;
          newImagePath = imageUrl;
          shouldDeleteOldImage = true;
        }

        // Get other form fields
        const title = formData.get('title') as string | undefined;
        const description = formData.get('description') as string | null | undefined;
        const linkUrl = formData.get('link_url') as string | null | undefined;
        const displayOrder = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : undefined;
        const isActive = formData.get('is_active') ? parseInt(formData.get('is_active') as string) : undefined;

        const validatedData = updateSliderSchema.parse({
          title,
          image_path: newImagePath,
          description: description !== undefined ? description : null,
          link_url: linkUrl !== undefined ? linkUrl : null,
          display_order: displayOrder,
          is_active: isActive,
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
          shouldDeleteOldImage ? oldSlider.image_path : null
        );

        // Delete old image from R2 if replaced
        if (shouldDeleteOldImage && oldSlider.image_path && !oldSlider.image_path.includes('placeholder')) {
          try {
            const oldFilename = oldSlider.image_path.split('/').pop();
            if (oldFilename) {
              await c.env.UPLOADS.delete(oldFilename);
            }
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
          }
        }

        return c.json({
          success: true,
          message: 'Collaboration slider updated successfully',
          data: slider,
        });
      }

      // Handle application/json (URL-based image_path)
      const body = await c.req.json();
      const title = body.title as string | undefined;
      const image_path = body.image_path as string | undefined;
      const description = body.description as string | undefined;
      const linkUrl = body.link_url as string | undefined;
      const displayOrder = body.display_order as number | undefined;
      const isActive = body.is_active as number | undefined;

      // Check if image_path is being updated
      if (image_path && image_path !== oldSlider.image_path) {
        shouldDeleteOldImage = true;
        newImagePath = image_path;
      }

      const validatedData = updateSliderSchema.parse({
        title,
        image_path: newImagePath,
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
        shouldDeleteOldImage ? oldSlider.image_path : null
      );

      // Delete old image from R2 if replaced
      if (shouldDeleteOldImage && oldSlider.image_path && !oldSlider.image_path.includes('placeholder')) {
        try {
          const oldFilename = oldSlider.image_path.split('/').pop();
          if (oldFilename) {
            await c.env.UPLOADS.delete(oldFilename);
          }
        } catch (deleteError) {
          console.error('Failed to delete old image:', deleteError);
        }
      }

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
        if (error.message.includes('file') || error.message.includes('image')) {
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
      const slider = await service.findById(id, user.id_user);

      // Delete associated image from R2
      if (slider.image_path && !slider.image_path.includes('placeholder')) {
        try {
          const filename = slider.image_path.split('/').pop();
          if (filename) {
            await c.env.UPLOADS.delete(filename);
          }
        } catch (deleteError) {
          console.error('Failed to delete image from R2:', deleteError);
        }
      }

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
