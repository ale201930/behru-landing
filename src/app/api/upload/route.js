import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Si no hay BLOB_READ_WRITE_TOKEN (entorno local), guardar localmente como fallback
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const { writeFile, mkdir } = await import('fs/promises');
      const path = await import('path');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.default.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${safeName}`;
      const filePath = path.default.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    }

    // Producción (Vercel): subir a Vercel Blob Storage
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `uploads/${Date.now()}_${safeName}`;

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ success: true, url: blob.url });

  } catch (error) {
    console.error('Error procesando archivo subido:', error);
    return NextResponse.json({ error: 'Error al guardar el archivo: ' + error.message }, { status: 500 });
  }
}
