import { query } from '../config/database';
import { CollaborationSlider, CreateCollaborationSliderDTO, UpdateCollaborationSliderDTO } from '../models/collaboration-slider.model';

export class CollaborationSliderRepository {
  async findById(id: number): Promise<CollaborationSlider | null> {
    const rows = await query(
      'SELECT * FROM collaboration_sliders WHERE id = ? LIMIT 1',
      [id]
    ) as CollaborationSlider[];
    return rows[0] || null;
  }

  async findAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders ORDER BY display_order ${orderBy}, created_at DESC`;
    const rows = await query(sql) as CollaborationSlider[];
    return rows;
  }

  async findActiveAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE is_active = 1 ORDER BY display_order ${orderBy}, created_at DESC`;
    const rows = await query(sql) as CollaborationSlider[];
    return rows;
  }

  async findByUserId(userId: number, orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE id_user = ? ORDER BY display_order ${orderBy}, created_at DESC`;
    const rows = await query(sql, [userId]) as CollaborationSlider[];
    return rows;
  }

  async create(data: CreateCollaborationSliderDTO): Promise<number> {
    const result = await query(
      `INSERT INTO collaboration_sliders (id_user, title, image_path, description, link_url, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.id_user,
        data.title,
        data.image_path,
        data.description || null,
        data.link_url || null,
        data.display_order || 0,
        data.is_active !== undefined ? data.is_active : 1,
      ]
    ) as { insertId: number };
    return result.insertId;
  }

  async update(id: number, data: UpdateCollaborationSliderDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.image_path !== undefined) {
      fields.push('image_path = ?');
      values.push(data.image_path);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.link_url !== undefined) {
      fields.push('link_url = ?');
      values.push(data.link_url);
    }
    if (data.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE collaboration_sliders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM collaboration_sliders WHERE id = ?',
      [id]
    ) as { affectedRows: number };
    return result.affectedRows > 0;
  }

  async exists(id: number): Promise<boolean> {
    const rows = await query(
      'SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ?',
      [id]
    ) as { count: number }[];
    return rows[0].count > 0;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const rows = await query(
      'SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ? AND id_user = ?',
      [id, userId]
    ) as { count: number }[];
    return rows[0].count > 0;
  }

  async findByIdWithImage(id: number): Promise<CollaborationSlider | null> {
    const rows = await query(
      'SELECT id, image_path FROM collaboration_sliders WHERE id = ? LIMIT 1',
      [id]
    ) as Pick<CollaborationSlider, 'id' | 'image_path'>[];
    return rows[0] as unknown as CollaborationSlider | null;
  }
}
