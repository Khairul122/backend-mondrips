import { D1Database } from '@cloudflare/workers-types';

export class Database {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql).bind(...params);
    const result = await stmt.all();
    return result.results as T[];
  }

  async first<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const stmt = this.db.prepare(sql).bind(...params);
    const result = await stmt.first();
    return result as T | null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1Result> {
    const stmt = this.db.prepare(sql).bind(...params);
    return await stmt.run();
  }

  async insert(sql: string, params: unknown[] = []): Promise<number> {
    const result = await this.execute(sql, params);
    return result.meta?.last_row_id || 0;
  }
}

export default Database;
