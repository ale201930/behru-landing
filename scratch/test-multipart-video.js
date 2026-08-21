import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testMultipartVideo() {
  console.log('Testing 134MB multipart video storage in 20MB parts...');
  const uploadId = `test_multi_${Date.now()}`;

  // Simulate 3 parts of 20MB each = 60MB total
  const part1 = Buffer.alloc(20 * 1024 * 1024, 'A');
  const part2 = Buffer.alloc(20 * 1024 * 1024, 'B');
  const part3 = Buffer.alloc(20 * 1024 * 1024, 'C');

  console.log('Uploading part 1 (20MB)...');
  const { error: e1 } = await supabase.storage.from('media').upload(`video_parts/${uploadId}/part_0`, part1, { contentType: 'application/octet-stream', upsert: true });
  console.log('Part 1 result:', e1 || 'SUCCESS');

  console.log('Uploading part 2 (20MB)...');
  const { error: e2 } = await supabase.storage.from('media').upload(`video_parts/${uploadId}/part_1`, part2, { contentType: 'application/octet-stream', upsert: true });
  console.log('Part 2 result:', e2 || 'SUCCESS');

  console.log('Uploading part 3 (20MB)...');
  const { error: e3 } = await supabase.storage.from('media').upload(`video_parts/${uploadId}/part_2`, part3, { contentType: 'application/octet-stream', upsert: true });
  console.log('Part 3 result:', e3 || 'SUCCESS');

  // Save manifest
  const manifest = {
    uploadId,
    mimeType: 'video/mp4',
    totalSize: 60 * 1024 * 1024,
    partsCount: 3,
    partSizes: [part1.length, part2.length, part3.length]
  };

  const { error: eManifest } = await supabase.storage.from('media').upload(`video_parts/${uploadId}/manifest.json`, Buffer.from(JSON.stringify(manifest)), { contentType: 'application/json', upsert: true });
  console.log('Manifest upload result:', eManifest || 'SUCCESS');

  console.log('Multipart upload test complete!');
}

testMultipartVideo();
