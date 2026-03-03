import { D1Database } from '@cloudflare/workers-types';

export class Database {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const result = await stmt.all();
      return (result as any).results as T[] || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async first<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const result = await stmt.first();
      return result as T | null;
    } catch (error) {
      console.error('Database.first() error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<any> {
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      return await stmt.run();
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  async insert(sql: string, params: unknown[] = []): Promise<number> {
    try {
      const result = await this.execute(sql, params);
      return (result as any).meta?.last_row_id || 0;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }
}

export default Database;
