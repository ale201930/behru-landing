import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Token endpoint para Vercel Blob Client Upload
// El browser sube directo a Vercel Blob sin pasar por el límite de 4.5MB del servidor
export async function POST(request) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Archivo subido a Vercel Blob:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error generando token de blob:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
