import { D1Database } from '@cloudflare/workers-types';
import { CollaborationSlider, CreateCollaborationSliderDTO, UpdateCollaborationSliderDTO } from '../models/collaboration-slider.model';

export class CollaborationSliderRepository {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async findById(id: number): Promise<CollaborationSlider | null> {
    const row = await this.db
      .prepare('SELECT * FROM collaboration_sliders WHERE id = ? LIMIT 1')
      .bind(id)
      .first();
    return (row as CollaborationSlider) || null;
  }

  async findAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders ORDER BY display_order ${orderBy}, created_at DESC`;
    const result = await this.db.prepare(sql).all();
    return (result as any).results as CollaborationSlider[] || [];
  }

  async findActiveAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE is_active = 1 ORDER BY display_order ${orderBy}, created_at DESC`;
    const result = await this.db.prepare(sql).all();
    return (result as any).results as CollaborationSlider[] || [];
  }

  async findByUserId(userId: number, orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSlider[]> {
    const sql = `SELECT * FROM collaboration_sliders WHERE id_user = ? ORDER BY display_order ${orderBy}, created_at DESC`;
    const result = await this.db.prepare(sql).bind(userId).all();
    return (result as any).results as CollaborationSlider[] || [];
  }

  async create(data: CreateCollaborationSliderDTO): Promise<number> {
    const description = data.description !== undefined && data.description !== null ? data.description : null;
    const link_url = data.link_url !== undefined && data.link_url !== null ? data.link_url : null;
    const display_order = data.display_order !== undefined ? data.display_order : 0;
    const is_active = data.is_active !== undefined ? data.is_active : 1;
    
    const result = await this.db
      .prepare(
        `INSERT INTO collaboration_sliders (id_user, title, image_path, description, link_url, display_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        data.id_user,
        data.title,
        data.image_path,
        description,
        link_url,
        display_order,
        is_active
      )
      .run();
    return (result as any).meta?.last_row_id || 0;
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

    await this.db
      .prepare(`UPDATE collaboration_sliders SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM collaboration_sliders WHERE id = ?')
      .bind(id)
      .run();
    return (result as any).meta?.changes > 0;
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ?')
      .bind(id)
      .first();
    return result ? (result as any).count > 0 : false;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM collaboration_sliders WHERE id = ? AND id_user = ?')
      .bind(id, userId)
      .first();
    return result ? (result as any).count > 0 : false;
  }
}
