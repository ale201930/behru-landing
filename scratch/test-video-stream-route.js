import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testFullStreamPipeline() {
  const uploadId = `vid_test_${Date.now()}`;
  console.log('Testing full stream pipeline for:', uploadId);

  // 1. Upload 2 parts of 10MB each
  const p0 = Buffer.alloc(10 * 1024 * 1024, 'X');
  const p1 = Buffer.alloc(10 * 1024 * 1024, 'Y');

  await supabase.storage.from('media').upload(`video_parts/${uploadId}/part_0`, p0, { contentType: 'application/octet-stream', upsert: true });
  await supabase.storage.from('media').upload(`video_parts/${uploadId}/part_1`, p1, { contentType: 'application/octet-stream', upsert: true });

  const manifest = {
    uploadId,
    mimeType: 'video/mp4',
    totalSize: 20 * 1024 * 1024,
    partsCount: 2,
    partSizes: [p0.length, p1.length]
  };

  await supabase.storage.from('media').upload(`video_parts/${uploadId}/manifest.json`, Buffer.from(JSON.stringify(manifest)), { contentType: 'application/json', upsert: true });

  console.log('Manifest uploaded successfully!');

  // 2. Read manifest back
  const { data: mData } = await supabase.storage.from('media').download(`video_parts/${uploadId}/manifest.json`);
  const loadedManifest = JSON.parse(await mData.text());
  console.log('Loaded manifest:', loadedManifest);

  // 3. Test downloading part 0
  const { data: p0Data } = await supabase.storage.from('media').download(`video_parts/${uploadId}/part_0`);
  const buf0 = Buffer.from(await p0Data.arrayBuffer());
  console.log('Part 0 downloaded byte length:', buf0.length);

  // Cleanup
  await supabase.storage.from('media').remove([
    `video_parts/${uploadId}/part_0`,
    `video_parts/${uploadId}/part_1`,
    `video_parts/${uploadId}/manifest.json`
  ]);
  console.log('Cleaned up test parts.');
}

testFullStreamPipeline();
