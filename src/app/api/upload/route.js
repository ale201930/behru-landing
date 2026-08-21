import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configurar Supabase Client si existen las variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Configurar Cloudinary automáticamente si existen las variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToSupabase(file) {
  if (!supabase) throw new Error('Supabase no está configurado');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}_${safeName}`;

  let { data, error } = await supabase.storage
    .from('media')
    .upload(filename, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

  // Si el bucket no existe, crearlo automáticamente como público
  if (error && (error.message?.includes('not found') || error.statusCode === '404' || error.code === 'NoSuchBucket' || error.error === 'Bucket not found')) {
    try {
      await supabase.storage.createBucket('media', { public: true });
      const retry = await supabase.storage
        .from('media')
        .upload(filename, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
      data = retry.data;
      error = retry.error;
    } catch (createErr) {
      console.warn('Error al auto-crear bucket media en Supabase:', createErr);
    }
  }

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('media')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

async function uploadToCloudinary(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'landing_behru',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

async function saveFileLocally(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}_${safeName}`;
  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // 1. Intentar subir a Supabase Storage si está configurado
    if (supabase) {
      try {
        const supabaseUrlResult = await uploadToSupabase(file);
        return NextResponse.json({ success: true, url: supabaseUrlResult });
      } catch (supabaseError) {
        console.error('Error al subir a Supabase Storage:', supabaseError.message || supabaseError);
      }
    }

    // 2. Intentar subir a Cloudinary si está configurado
    const hasCloudinary = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
    if (hasCloudinary) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        return NextResponse.json({ success: true, url: cloudinaryUrl });
      } catch (cloudinaryError) {
        console.error('Error al subir a Cloudinary:', cloudinaryError);
      }
    }

    // 3. Intentar subir a Vercel Blob si está disponible y no suspendido
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `uploads/${Date.now()}_${safeName}`;

        const blob = await put(filename, file, {
          access: 'public',
          contentType: file.type,
        });

        return NextResponse.json({ success: true, url: blob.url });
      } catch (blobError) {
        console.warn('Vercel Blob suspendido o no disponible:', blobError.message);
      }
    }

    // 4. Fallback: guardar localmente en public/uploads
    const localUrl = await saveFileLocally(file);
    return NextResponse.json({ success: true, url: localUrl });

  } catch (error) {
    console.error('Error procesando archivo subido:', error);
    return NextResponse.json({ error: 'Error al guardar el archivo: ' + error.message }, { status: 500 });
  }
}
