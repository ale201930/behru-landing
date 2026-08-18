import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT) || 3306;

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true,
    });

    const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(sql);
    await connection.end();

    console.log('✅ Database landing_db and initial data created successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('Make sure Laragon / MySQL is running!');
    process.exit(1);
  }
}

initDatabase();
