import mysql from 'mysql2/promise';

// Detección automática de TiDB Serverless / Nube o Local (127.0.0.1 evita problemas de resolución IPv6 en Windows)
const host = process.env.DB_HOST || '127.0.0.1';
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
  connectTimeout: 5000,
  ssl: isTiDB ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
});

pool.on('error', (err) => {
  console.warn('MySQL Pool warning:', err.message);
});

export default pool;

