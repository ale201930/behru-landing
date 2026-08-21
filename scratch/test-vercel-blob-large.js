import { put } from '@vercel/blob';

const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_thO3gQ0oDk9CWAUI_uYIxxieooyc8dJZCep0ht19NsH6A7D';

async function testVercelBlobLarge() {
  console.log('Testing Vercel Blob with 100MB dummy file...');
  const dummy100MB = Buffer.alloc(100 * 1024 * 1024);
  const filename = `test_100mb_${Date.now()}.mp4`;

  try {
    const blob = await put(filename, dummy100MB, {
      access: 'public',
      token: token,
      contentType: 'video/mp4'
    });
    console.log('Vercel Blob Upload SUCCESS:', blob.url);

    // Cleanup test blob if possible
  } catch (err) {
    console.error('Vercel Blob Upload ERROR:', err.message);
  }
}

testVercelBlobLarge();
