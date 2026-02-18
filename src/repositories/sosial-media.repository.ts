import { query } from '../config/database';
import { SosialMedia, CreateSosialMediaDTO, UpdateSosialMediaDTO } from '../models/sosial-media.model';

export class SosialMediaRepository {
  async findById(id: number): Promise<SosialMedia | null> {
    const rows = await query(
      'SELECT * FROM sosial_media WHERE id = ? LIMIT 1',
      [id]
    ) as SosialMedia[];
    return rows[0] || null;
  }

  async findByUserId(userId: number): Promise<SosialMedia[]> {
    const rows = await query(
      'SELECT * FROM sosial_media WHERE id_user = ? ORDER BY created_at DESC',
      [userId]
    ) as SosialMedia[];
    return rows;
  }

  async create(data: CreateSosialMediaDTO): Promise<number> {
    const result = await query(
      `INSERT INTO sosial_media (id_user, nama_platform, username_path, icon_class, link_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.id_user,
        data.nama_platform,
        data.username_path,
        data.icon_class || null,
        data.link_url,
      ]
    ) as { insertId: number };
    return result.insertId;
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

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE sosial_media SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM sosial_media WHERE id = ?',
      [id]
    ) as { affectedRows: number };
    return result.affectedRows > 0;
  }

  async exists(id: number): Promise<boolean> {
    const rows = await query(
      'SELECT COUNT(*) as count FROM sosial_media WHERE id = ?',
      [id]
    ) as { count: number }[];
    return rows[0].count > 0;
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const rows = await query(
      'SELECT COUNT(*) as count FROM sosial_media WHERE id = ? AND id_user = ?',
      [id, userId]
    ) as { count: number }[];
    return rows[0].count > 0;
  }
}
