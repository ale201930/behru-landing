import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testSignedUpload() {
  const filename = `signed_test_${Date.now()}.txt`;
  console.log('Generating signed upload URL for:', filename);

  const { data: signedData, error: signedErr } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(filename);

  if (signedErr) {
    console.error('Error generating signed URL:', signedErr);
    return;
  }

  console.log('Signed URL:', signedData.signedUrl);

  // Perform HTTP PUT directly to signedUrl
  const testContent = 'Hello signed upload!';
  const res = await fetch(signedData.signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: testContent,
  });

  console.log('PUT response status:', res.status);
  const text = await res.text();
  console.log('PUT response body:', text);

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filename);
  console.log('Public URL:', publicUrlData.publicUrl);
}

testSignedUpload();
