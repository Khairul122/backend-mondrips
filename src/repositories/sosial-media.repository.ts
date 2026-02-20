import Database from '../config/database';
import { SosialMedia, CreateSosialMediaDTO, UpdateSosialMediaDTO } from '../models/sosial-media.model';

export class SosialMediaRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: number): Promise<SosialMedia | null> {
    const row = await this.db.first<SosialMedia>(
      'SELECT * FROM sosial_media WHERE id = ? LIMIT 1',
      [id]
    );
    return row || null;
  }

  async findByUserId(userId: number): Promise<SosialMedia[]> {
    const rows = await this.db.query<SosialMedia>(
      'SELECT * FROM sosial_media WHERE id_user = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async create(data: CreateSosialMediaDTO): Promise<number> {
    const id = await this.db.insert(
      `INSERT INTO sosial_media (id_user, nama_platform, username_path, icon_class, link_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        data.id_user,
        data.nama_platform,
        data.username_path,
        data.icon_class || null,
        data.link_url,
      ]
    );
    return id;
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

    await this.db.execute(
      `UPDATE sosial_media SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM sosial_media WHERE id = ?', [id]);
    return (result.meta?.changes || 0) > 0;
  }

  async exists(id: number): Promise<boolean> {
    const result = await this.db.first<{ count: number }>(
      'SELECT COUNT(*) as count FROM sosial_media WHERE id = ?',
      [id]
    );
    return result ? result.count > 0 : false;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const result = await this.db.first<{ count: number }>(
      'SELECT COUNT(*) as count FROM sosial_media WHERE id = ? AND id_user = ?',
      [id, userId]
    );
    return result ? result.count > 0 : false;
  }
}
