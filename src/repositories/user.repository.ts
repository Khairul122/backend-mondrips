import { query } from '../config/database';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model';

export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const rows = await query(
      'SELECT * FROM users WHERE id_user = ? LIMIT 1',
      [id]
    ) as User[];
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    ) as User[];
    return rows[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const rows = await query(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    ) as User[];
    return rows[0] || null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const rows = await query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    ) as User[];
    return rows[0] || null;
  }

  async findByRememberToken(token: string): Promise<User | null> {
    const rows = await query(
      'SELECT * FROM users WHERE remember_token = ? LIMIT 1',
      [token]
    ) as User[];
    return rows[0] || null;
  }

  async create(data: CreateUserDTO): Promise<number> {
    const result = await query(
      `INSERT INTO users (email, username, password, full_name, role, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.email,
        data.username,
        data.password,
        data.full_name,
        data.role || 'user',
        1,
      ]
    ) as { insertId: number };
    return result.insertId;
  }

  async update(id: number, data: UpdateUserDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.username !== undefined) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }
    if (data.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(data.full_name);
    }
    if (data.role !== undefined) {
      fields.push('role = ?');
      values.push(data.role);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active);
    }
    if (data.remember_token !== undefined) {
      fields.push('remember_token = ?');
      values.push(data.remember_token);
    }
    if (data.last_login !== undefined) {
      fields.push('last_login = ?');
      values.push(data.last_login);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id_user = ?`,
      values
    );

    return true;
  }

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    let params: unknown[] = [email];

    if (excludeId) {
      sql += ' AND id_user != ?';
      params.push(excludeId);
    }

    const rows = await query(sql, params) as { count: number }[];
    return rows[0].count > 0;
  }

  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    let params: unknown[] = [username];

    if (excludeId) {
      sql += ' AND id_user != ?';
      params.push(excludeId);
    }

    const rows = await query(sql, params) as { count: number }[];
    return rows[0].count > 0;
  }
}
