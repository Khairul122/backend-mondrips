import { Context } from 'hono';
import { CollaborationSliderService } from '../services/collaboration-slider.service';
import { z } from 'zod';
import {
  UploadedFile,
  validateFile,
  saveFile,
  generateUniqueFilename,
  deleteFile,
} from '../utils/file-upload';

const createSliderSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional().nullable(),
  link_url: z.string().url('Invalid URL format').optional().nullable(),
  display_order: z.coerce.number().int().optional().default(0),
  is_active: z.coerce.number().int().min(0).max(1).optional().default(1),
});

const updateSliderSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  link_url: z.string().url('Invalid URL format').optional().nullable(),
  display_order: z.coerce.number().int().optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
});

export class CollaborationSliderController {
  private collaborationSliderService: CollaborationSliderService;

  constructor() {
    this.collaborationSliderService = new CollaborationSliderService();
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

      const orderByParam = c.req.query('order') || 'ASC';
      const orderBy = orderByParam.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const sliderList = await this.collaborationSliderService.findAllByUserId(user.id_user, orderBy);

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

  async indexPublic(c: Context) {
    try {
      const orderByParam = c.req.query('order') || 'ASC';
      const orderBy = orderByParam.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const sliderList = await this.collaborationSliderService.findActiveAll(orderBy);

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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const slider = await this.collaborationSliderService.findById(id, user.id_user);

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

      const formData = await c.req.parseBody();
      const imageFile = formData.image as File;
      const title = formData.title as string;
      const description = formData.description as string | undefined;
      const linkUrl = formData.link_url as string | undefined;
      const displayOrder = formData.display_order as string | undefined;
      const isActive = formData.is_active as string | undefined;

      if (!imageFile || !(imageFile instanceof File)) {
        return c.json(
          {
            success: false,
            message: 'Image file is required',
          },
          400
        );
      }

      if (!title) {
        return c.json(
          {
            success: false,
            message: 'Title is required',
          },
          400
        );
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadedFile: UploadedFile = {
        buffer,
        mimeType: imageFile.type,
        originalName: imageFile.name,
        size: imageFile.size,
      };

      validateFile(uploadedFile);

      const uniqueFilename = generateUniqueFilename(imageFile.name);
      const imagePath = saveFile(buffer, uniqueFilename);

      const validatedData = createSliderSchema.parse({
        title,
        description: description || null,
        link_url: linkUrl || null,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
        is_active: isActive !== undefined ? parseInt(isActive) : 1,
      });

      const slider = await this.collaborationSliderService.create(user.id_user, {
        title: validatedData.title,
        image_path: imagePath,
        description: validatedData.description,
        link_url: validatedData.link_url,
        display_order: validatedData.display_order,
        is_active: validatedData.is_active,
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
        if (error.message.includes('Invalid file type') || error.message.includes('File size exceeds')) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      const formData = await c.req.parseBody();
      const imageFile = formData.image as File | undefined;
      const title = formData.title as string | undefined;
      const description = formData.description as string | undefined;
      const linkUrl = formData.link_url as string | undefined;
      const displayOrder = formData.display_order as string | undefined;
      const isActive = formData.is_active as string | undefined;

      const oldSlider = await this.collaborationSliderService.findById(id, user.id_user);
      let imagePath: string | undefined;

      if (imageFile && imageFile instanceof File) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadedFile: UploadedFile = {
          buffer,
          mimeType: imageFile.type,
          originalName: imageFile.name,
          size: imageFile.size,
        };

        validateFile(uploadedFile);

        const uniqueFilename = generateUniqueFilename(imageFile.name);
        imagePath = saveFile(buffer, uniqueFilename);

        if (oldSlider.image_path) {
          deleteFile(oldSlider.image_path);
        }
      }

      const validatedData = updateSliderSchema.parse({
        title,
        description: description || null,
        link_url: linkUrl || null,
        display_order: displayOrder ? parseInt(displayOrder) : undefined,
        is_active: isActive !== undefined ? parseInt(isActive) : undefined,
      });

      const slider = await this.collaborationSliderService.update(
        id,
        user.id_user,
        {
          title: validatedData.title,
          image_path: imagePath,
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
        if (error.message.includes('Invalid file type') || error.message.includes('File size exceeds')) {
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
            message: 'Invalid slider ID',
          },
          400
        );
      }

      await this.collaborationSliderService.delete(id, user.id_user);

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

  async updateOrder(c: Context) {
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

      const slider = await this.collaborationSliderService.update(
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

  async updateStatus(c: Context) {
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

      const slider = await this.collaborationSliderService.update(
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
