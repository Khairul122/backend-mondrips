import Database from '../config/database';
import { CollaborationSlider, CreateCollaborationSliderDTO, UpdateCollaborationSliderDTO } from '../models/collaboration-slider.model';

export class CollaborationSliderRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: number): Promise<CollaborationSlider | null> {
    const row = await this.db.first<CollaborationSlider>(
      'SELECT * FROM collaboration_sliders WHERE id = ? LIMIT 1',
      [id]
    );
    return row || null;
  }

  async findAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders ORDER BY display_order ${orderBy}, created_at DESC`;
    return await this.db.query<CollaborationSlider>(sql);
  }

  async findActiveAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE is_active = 1 ORDER BY display_order ${orderBy}, created_at DESC`;
    return await this.db.query<CollaborationSlider>(sql);
  }

  async findByUserId(userId: number, orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE id_user = ? ORDER BY display_order ${orderBy}, created_at DESC`;
    return await this.db.query<CollaborationSlider>(sql, [userId]);
  }

  async create(data: CreateCollaborationSliderDTO): Promise<number> {
    const id = await this.db.insert(
      `INSERT INTO collaboration_sliders (id_user, title, image_path, description, link_url, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        data.id_user,
        data.title,
        data.image_path,
        data.description || null,
        data.link_url || null,
        data.display_order || 0,
        data.is_active !== undefined ? data.is_active : 1,
      ]
    );
    return id;
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

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.execute(
      `UPDATE collaboration_sliders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM collaboration_sliders WHERE id = ?', [id]);
    return (result.meta?.changes || 0) > 0;
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db.first<{ count: number }>(
      'SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ?',
      [id]
    );
    return result ? result.count > 0 : false;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const result = await this.db.first<{ count: number }>(
      'SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ? AND id_user = ?',
      [id, userId]
    );
    return result ? result.count > 0 : false;
  }
}
