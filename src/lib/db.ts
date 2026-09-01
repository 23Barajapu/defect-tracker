import mysql from 'mysql2/promise';

const globalForDb = globalThis as unknown as {
  mysqlPool: mysql.Pool | undefined;
};

export function getDb(): mysql.Pool {
  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistem_pkl_defect',
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: 'utf8mb4_unicode_ci',
    });
  }
  return globalForDb.mysqlPool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const db = getDb();
  const [rows] = await db.execute(sql, params);
  return rows as T;
}
