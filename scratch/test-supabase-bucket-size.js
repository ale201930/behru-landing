import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test100MB() {
  console.log('Creating 100MB dummy buffer in memory...');
  const dummy100MB = Buffer.alloc(100 * 1024 * 1024); // 100 MB
  const filename = `test_100mb_${Date.now()}.mp4`;

  console.log('Uploading 100MB buffer to media bucket...');
  const { data, error } = await supabase.storage
    .from('media')
    .upload(filename, dummy100MB, {
      contentType: 'video/mp4',
      upsert: true,
    });

  console.log('100MB Upload result:', data, error);

  if (data) {
    const { data: pData } = supabase.storage.from('media').getPublicUrl(filename);
    console.log('Public URL:', pData.publicUrl);
    // Cleanup
    await supabase.storage.from('media').remove([filename]);
    console.log('Cleaned up 100MB file.');
  }
}

test100MB();
