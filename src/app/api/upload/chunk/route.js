import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const action = formData.get('action');

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase Storage no está configurado' }, { status: 500 });
    }

    // Acción 1: Iniciar sesión de fragmentos (Chunks)
    if (action === 'start') {
      const filename = formData.get('filename') || 'file';
      const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uploadId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      return NextResponse.json({
        success: true,
        uploadId,
        safeName
      });
    }

    // Acción 2: Subir un fragmento individual (2.5 MB por petición)
    if (action === 'upload_chunk') {
      const uploadId = formData.get('uploadId');
      const chunkIndex = formData.get('chunkIndex');
      const chunkFile = formData.get('chunk');

      if (!uploadId || chunkIndex === null || !chunkFile) {
        return NextResponse.json({ error: 'Parámetros de fragmento incompletos' }, { status: 400 });
      }

      const bytes = await chunkFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const chunkPath = `chunks/${uploadId}/chunk_${chunkIndex}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(chunkPath, buffer, {
          contentType: 'application/octet-stream',
          upsert: true,
        });

      if (error) {
        console.error(`Error guardando fragmento ${chunkIndex}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, chunkIndex });
    }

    // Acción 3: Ensamblar fragmentos en partes de 20MB (Multipart) al completar
    if (action === 'complete') {
      const uploadId = formData.get('uploadId');
      const safeName = formData.get('safeName') || 'video.mp4';
      const totalChunks = parseInt(formData.get('totalChunks'), 10);
      const mimeType = formData.get('mimeType') || 'video/mp4';

      if (!uploadId || isNaN(totalChunks)) {
        return NextResponse.json({ error: 'Datos de finalización inválidos' }, { status: 400 });
      }

      // 1. Descargar y unir todos los fragmentos temporales de 2.5MB
      const chunkBuffers = [];
      const chunkPathsToRemove = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = `chunks/${uploadId}/chunk_${i}`;
        chunkPathsToRemove.push(chunkPath);

        const { data: chunkBlob, error: downloadErr } = await supabase.storage
          .from('media')
          .download(chunkPath);

        if (downloadErr || !chunkBlob) {
          throw new Error(`Error al recuperar fragmento ${i}: ${downloadErr?.message || 'No encontrado'}`);
        }

        const buf = Buffer.from(await chunkBlob.arrayBuffer());
        chunkBuffers.push(buf);
      }

      // Unir todos los buffers de 2.5MB en un único buffer maestro
      const masterBuffer = Buffer.concat(chunkBuffers);
      const totalSize = masterBuffer.length;

      // 2. Si el archivo es menor a 40 MB, guardarlo como archivo único directo
      if (totalSize <= 40 * 1024 * 1024) {
        const finalFilename = `${Date.now()}_${safeName}`;
        const { error: singleErr } = await supabase.storage
          .from('media')
          .upload(finalFilename, masterBuffer, {
            contentType: mimeType,
            upsert: true
          });

        if (!singleErr) {
          // Limpiar chunks
          supabase.storage.from('media').remove(chunkPathsToRemove).catch(() => {});
          const { data: pData } = supabase.storage.from('media').getPublicUrl(finalFilename);
          return NextResponse.json({ success: true, url: pData.publicUrl });
        }
      }

      // 3. Si el archivo supera 40 MB (ej: 134 MB), dividirlo en partes de 20 MB en Supabase Storage
      const PART_SIZE = 20 * 1024 * 1024; // 20 MB por parte (100% dentro del límite de 50MB de Supabase)
      const partsCount = Math.ceil(totalSize / PART_SIZE);
      const partSizes = [];

      for (let p = 0; p < partsCount; p++) {
        const pStart = p * PART_SIZE;
        const pEnd = Math.min(totalSize, pStart + PART_SIZE);
        const partBuf = masterBuffer.subarray(pStart, pEnd);
        partSizes.push(partBuf.length);

        const partPath = `video_parts/${uploadId}/part_${p}`;
        const { error: partErr } = await supabase.storage
          .from('media')
          .upload(partPath, partBuf, {
            contentType: 'application/octet-stream',
            upsert: true
          });

        if (partErr) {
          throw new Error(`Error guardando parte ${p} del video: ${partErr.message}`);
        }
      }

      // Guardar manifiesto de las partes
      const manifest = {
        uploadId,
        mimeType,
        totalSize,
        partSize: PART_SIZE,
        partsCount,
        partSizes,
        createdAt: new Date().toISOString()
      };

      await supabase.storage
        .from('media')
        .upload(`video_parts/${uploadId}/manifest.json`, Buffer.from(JSON.stringify(manifest)), {
          contentType: 'application/json',
          upsert: true
        });

      // Limpiar fragmentos temporales
      supabase.storage.from('media').remove(chunkPathsToRemove).catch(() => {});

      // URL de transmisión propia (/api/video/[id])
      const videoStreamUrl = `/api/video/${uploadId}`;

      return NextResponse.json({
        success: true,
        url: videoStreamUrl
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err) {
    console.error('Error en API chunked upload:', err);
    return NextResponse.json({ error: err.message || 'Error del servidor en fragmentación' }, { status: 500 });
  }
}
