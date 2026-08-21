import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || !supabase) {
      return new Response('Video no encontrado o Supabase no configurado', { status: 404 });
    }

    // 1. Descargar manifiesto del video multipart
    const { data: manifestData, error: manifestErr } = await supabase.storage
      .from('media')
      .download(`video_parts/${id}/manifest.json`);

    if (manifestErr || !manifestData) {
      // Intentar servir como archivo único directo si existe en media/
      const { data: singleFileUrlData } = supabase.storage.from('media').getPublicUrl(id);
      if (singleFileUrlData?.publicUrl) {
        return NextResponse.redirect(singleFileUrlData.publicUrl);
      }
      return new Response('Manifiesto de video no encontrado', { status: 404 });
    }

    const manifestText = await manifestData.text();
    const manifest = JSON.parse(manifestText);

    const totalSize = manifest.totalSize;
    const mimeType = manifest.mimeType || 'video/mp4';

    // 2. Gestionar peticiones de rango HTTP (Range Requests para reproducción fluida)
    const rangeHeader = req.headers.get('range');

    if (!rangeHeader) {
      // Si no hay encabezado Range, transmitir la primera parte o todo
      const { data: part0Data, error: part0Err } = await supabase.storage
        .from('media')
        .download(`video_parts/${id}/part_0`);

      if (part0Err || !part0Data) {
        return new Response('Error al cargar fragmento inicial', { status: 500 });
      }

      const buffer = Buffer.from(await part0Data.arrayBuffer());

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': totalSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }

    // Parsear encabezado Range: bytes=start-end
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
    const chunkSize = (end - start) + 1;

    // Calcular qué partes de 20MB corresponden a ese rango de bytes
    const PART_SIZE = manifest.partSize || (20 * 1024 * 1024);
    const startPartIndex = Math.floor(start / PART_SIZE);
    const startOffsetInPart = start % PART_SIZE;

    const { data: targetPartData, error: partErr } = await supabase.storage
      .from('media')
      .download(`video_parts/${id}/part_${startPartIndex}`);

    if (partErr || !targetPartData) {
      return new Response('Error cargando fragmento solicitado', { status: 500 });
    }

    const partBuffer = Buffer.from(await targetPartData.arrayBuffer());
    const slicedBuffer = partBuffer.subarray(startOffsetInPart, Math.min(partBuffer.length, startOffsetInPart + chunkSize));

    return new Response(slicedBuffer, {
      status: 206, // Partial Content
      headers: {
        'Content-Type': mimeType,
        'Content-Range': `bytes ${start}-${start + slicedBuffer.length - 1}/${totalSize}`,
        'Content-Length': slicedBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (err) {
    console.error('Error en API de transmisión de video:', err);
    return new Response('Error interno al transmitir video', { status: 500 });
  }
}
