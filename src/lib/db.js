import mysql from 'mysql2/promise';

// Detección automática de TiDB Serverless / Nube o Local
const host = process.env.DB_HOST || 'localhost';
const isTiDB = host.includes('tidbcloud.com') || process.env.DB_SSL === 'true';

// Configuración del Pool de conexiones para MySQL Local & TiDB Serverless (Vercel)
const pool = mysql.createPool({
  host: host,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'landing_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: isTiDB ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
});

export default pool;
