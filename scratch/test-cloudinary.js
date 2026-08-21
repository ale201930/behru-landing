import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary credentials or URL exist
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
}

async function testSignature() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'behru_videos' },
      process.env.CLOUDINARY_API_SECRET || 'test'
    );
    console.log('Signature generated:', { timestamp, signature });
  } catch (err) {
    console.error('Cloudinary error:', err.message);
  }
}

testSignature();
