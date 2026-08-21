import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testChunkAssembly() {
  console.log('Testing chunk assembly...');
  const uploadId = `test_chunk_${Date.now()}`;
  
  // 1. Upload 3 small 1MB chunk buffers to Supabase Storage
  const chunk1 = Buffer.from('CHUNK_1_DATA_');
  const chunk2 = Buffer.from('CHUNK_2_DATA_');
  const chunk3 = Buffer.from('CHUNK_3_DATA_FINAL');

  console.log('Uploading 3 chunk buffers...');
  await supabase.storage.from('media').upload(`chunks/${uploadId}/chunk_0`, chunk1, { contentType: 'application/octet-stream', upsert: true });
  await supabase.storage.from('media').upload(`chunks/${uploadId}/chunk_1`, chunk2, { contentType: 'application/octet-stream', upsert: true });
  await supabase.storage.from('media').upload(`chunks/${uploadId}/chunk_2`, chunk3, { contentType: 'application/octet-stream', upsert: true });

  console.log('Fetching chunk buffers back...');
  const { data: d1 } = await supabase.storage.from('media').download(`chunks/${uploadId}/chunk_0`);
  const { data: d2 } = await supabase.storage.from('media').download(`chunks/${uploadId}/chunk_1`);
  const { data: d3 } = await supabase.storage.from('media').download(`chunks/${uploadId}/chunk_2`);

  const buf1 = Buffer.from(await d1.arrayBuffer());
  const buf2 = Buffer.from(await d2.arrayBuffer());
  const buf3 = Buffer.from(await d3.arrayBuffer());

  const fullBuffer = Buffer.concat([buf1, buf2, buf3]);
  console.log('Assembled text:', fullBuffer.toString('utf-8'));

  const finalFilename = `assembled_${Date.now()}.txt`;
  await supabase.storage.from('media').upload(finalFilename, fullBuffer, { contentType: 'text/plain', upsert: true });

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(finalFilename);
  console.log('Assembled Public URL:', publicUrlData.publicUrl);

  // Cleanup chunks
  await supabase.storage.from('media').remove([
    `chunks/${uploadId}/chunk_0`,
    `chunks/${uploadId}/chunk_1`,
    `chunks/${uploadId}/chunk_2`
  ]);
  console.log('Chunks cleaned up successfully!');
}

testChunkAssembly();
