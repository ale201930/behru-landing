import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req) {
  try {
    const { filename, fileType } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: 'El nombre del archivo es requerido' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase Storage no está configurado' }, { status: 500 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${Date.now()}_${safeName}`;

    // Crear URL firmada para subir directamente desde el navegador a Supabase (sin límite de Vercel)
    const { data, error } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(path);

    if (error) {
      console.error('Error al generar URL firmada de Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      publicUrl: publicUrlData.publicUrl
    });
  } catch (err) {
    console.error('Error en API presigned:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
