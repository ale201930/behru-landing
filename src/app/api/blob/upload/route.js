import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Token endpoint para Vercel Blob Client Upload
// El browser sube directo a Vercel Blob (hasta 500MB) sin pasar por el límite de 4.5MB de funciones serverless
export async function POST(request) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        return {
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB máximo para videos 4K/HD
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Archivo subido con éxito a Vercel Blob:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error generando token de blob:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

