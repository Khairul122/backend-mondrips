import { D1Database } from '@cloudflare/workers-types';
import { SosialMedia, CreateSosialMediaDTO, UpdateSosialMediaDTO } from '../models/sosial-media.model';

export class SosialMediaRepository {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async findById(id: number): Promise<SosialMedia | null> {
    const row = await this.db
      .prepare('SELECT * FROM sosial_media WHERE id = ? LIMIT 1')
      .bind(id)
      .first();
    return (row as SosialMedia) || null;
  }

  async findByUserId(userId: number): Promise<SosialMedia[]> {
    const rows = await this.db
      .prepare('SELECT * FROM sosial_media WHERE id_user = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();
    return (rows as any).results as SosialMedia[] || [];
  }

  async create(data: CreateSosialMediaDTO): Promise<number> {
    const result = await this.db
      .prepare(
        `INSERT INTO sosial_media (id_user, nama_platform, username_path, icon_class, link_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        data.id_user,
        data.nama_platform,
        data.username_path,
        data.icon_class || null,
        data.link_url
      )
      .run();
    return (result as any).meta?.last_row_id || 0;
  }

  async update(id: number, data: UpdateSosialMediaDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.nama_platform !== undefined) {
      fields.push('nama_platform = ?');
      values.push(data.nama_platform);
    }
    if (data.username_path !== undefined) {
      fields.push('username_path = ?');
      values.push(data.username_path);
    }
    if (data.icon_class !== undefined) {
      fields.push('icon_class = ?');
      values.push(data.icon_class);
    }
    if (data.link_url !== undefined) {
      fields.push('link_url = ?');
      values.push(data.link_url);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db
      .prepare(`UPDATE sosial_media SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM sosial_media WHERE id = ?')
      .bind(id)
      .run();
    return (result as any).meta?.changes > 0;
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM sosial_media WHERE id = ?')
      .bind(id)
      .first();
    return result ? (result as any).count > 0 : false;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM sosial_media WHERE id = ? AND id_user = ?')
      .bind(id, userId)
      .first();
    return result ? (result as any).count > 0 : false;
  }

  async findByUserIdAndId(id: number, userId: number): Promise<SosialMedia | null> {
    const row = await this.db
      .prepare('SELECT * FROM sosial_media WHERE id = ? AND id_user = ? LIMIT 1')
      .bind(id, userId)
      .first();
    return (row as SosialMedia) || null;
  }
}
