import mysql from "mysql2/promise";

const globalForMysql = globalThis as unknown as {
  bracketPool: mysql.Pool | undefined;
};

function parsePort(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "3306", 10);
  return Number.isFinite(n) && n > 0 ? n : 3306;
}

function sslOption(): { rejectUnauthorized: boolean } | undefined {
  if (process.env.DB_SSL !== "true") {
    return undefined;
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: true };
}

export function getPool(): mysql.Pool {
  if (globalForMysql.bracketPool) {
    return globalForMysql.bracketPool;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || password === undefined || !database) {
    throw new Error(
      "Missing DB env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are required",
    );
  }

  globalForMysql.bracketPool = mysql.createPool({
    connectionLimit: Number.parseInt(process.env.DB_POOL_LIMIT ?? "3", 10),
    database,
    enableKeepAlive: true,
    host,
    idleTimeout: 20_000,
    maxIdle: 2,
    password,
    port: parsePort(process.env.DB_PORT),
    ssl: sslOption(),
    user,
    waitForConnections: true,
  });

  return globalForMysql.bracketPool;
}

export async function pingDb(): Promise<boolean> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}
