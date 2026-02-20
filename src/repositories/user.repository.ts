import Database from '../config/database';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model';

export class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.db.first<User>(
      'SELECT * FROM users WHERE id_user = ? LIMIT 1',
      [id]
    );
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.first<User>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.db.first<User>(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return user || null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const user = await this.db.first<User>(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );
    return user || null;
  }

  async findByRememberToken(token: string): Promise<User | null> {
    const user = await this.db.first<User>(
      'SELECT * FROM users WHERE remember_token = ? LIMIT 1',
      [token]
    );
    return user || null;
  }

  async create(data: CreateUserDTO): Promise<number> {
    const id = await this.db.insert(
      `INSERT INTO users (email, username, password, full_name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        data.email,
        data.username,
        data.password,
        data.full_name,
        data.role || 'user',
        1,
      ]
    );
    return id;
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

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.execute(
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

    const result = await this.db.first<{ count: number }>(sql, params);
    return result ? result.count > 0 : false;
  }

  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    let params: unknown[] = [username];

    if (excludeId) {
      sql += ' AND id_user != ?';
      params.push(excludeId);
    }

    const result = await this.db.first<{ count: number }>(sql, params);
    return result ? result.count > 0 : false;
  }
}
