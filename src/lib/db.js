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
  // Silenciar errores de pool cuando Laragon/MySQL no está corriendo
  if (process.env.NODE_ENV !== 'production') {
    console.warn('MySQL Pool warning (normal si Laragon no está activo):', err.code || err.message);
  }
});

// Suprimir unhandledRejection de conexiones MySQL cuando la BD no está disponible
// Esto evita el error "undefined" en el overlay de Next.js en desarrollo
if (typeof process !== 'undefined') {
  process.removeAllListeners?.('unhandledRejection');
  process.on('unhandledRejection', (reason) => {
    if (!reason) return;
    if (
      reason?.code === 'ECONNREFUSED' ||
      reason?.code === 'ER_ACCESS_DENIED_ERROR' ||
      (typeof reason?.message === 'string' && (
        reason.message.includes('mysql') ||
        reason.message.includes('ECONNREFUSED') ||
        reason.message.includes('connect')
      ))
    ) {
      return;
    }
  });
}

export default pool;

