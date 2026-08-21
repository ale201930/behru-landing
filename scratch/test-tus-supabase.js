import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTus() {
  console.log('Testing Supabase TUS Upload Endpoint...');
  const endpoint = `${supabaseUrl}/storage/v1/upload/resumable`;
  console.log('Resumable Endpoint:', endpoint);

  // Check if supabase.storage.from().upload with duplex/chunk options works
  const dummyBuffer = Buffer.alloc(1024 * 1024 * 5); // 5MB dummy
  const filename = `tus_test_${Date.now()}.mp4`;

  console.log('Testing upload with service role key...');
  const { data, error } = await supabase.storage
    .from('media')
    .upload(filename, dummyBuffer, {
      contentType: 'video/mp4',
      duplex: 'half',
      upsert: true,
    });

  console.log('Upload result:', data, error);
}

testTus();
