import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = [
    { title: 'Flyer Principal', file: '1787066858777_Flyer_1.png' },
    { title: 'Wembanyama Edit', file: '1787067369324_Wembayama-Flyer.png' },
    { title: 'Flyer Edición 2', file: '1787066747480_Flyer_2__1_.png' },
    { title: 'Frase de Marca', file: '1787067404793_Confi_a-en-el-destello-que-te-gui_a-desde-adentro.png' },
    { title: 'Match Day FCB', file: '1787066896922_Day-Match-NCTy-FCB.png' },
  ];

  const db = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: 'bsLz7YmJUPa5utn.root',
    password: 'gmb5SRdGzNhD7Yyn',
    database: 'landing_db',
    port: 4000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  let order = 1;
  for (const item of files) {
    const filePath = path.join(uploadsDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const destinationPath = `designs/${Date.now()}_${item.file}`;

    console.log(`Uploading ${item.title}...`);
    const { data, error } = await supabase.storage
      .from('media')
      .upload(destinationPath, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error uploading:', error);
      continue;
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(destinationPath);
    const publicUrl = publicData.publicUrl;
    console.log(`[SUCCESS] ${item.title} -> ${publicUrl}`);

    await db.query(
      'INSERT INTO landing_media (media_type, section, title, description, url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      ['image', 'gallery', item.title, 'Diseño BeHRU', publicUrl, order++]
    );
  }

  const [active] = await db.query('SELECT id, section, title, url FROM landing_media WHERE is_active = 1 AND section = ?', ['gallery']);
  console.log('Total Active Gallery Items:', active.length);
  await db.end();
}

main();
