'use server';

import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Datos por defecto (fallback si la BD en Laragon aún no ha sido poblada)
const DEFAULT_CONFIG = {
  site_title: 'BenRU',
  hero_title: 'Tu Feed no necesita más visitas, sino mejores decisiones',
  hero_subtitle: 'Diseñamos y desarrollamos experiencias interactivas personalizadas para impulsar tus ventas y destacar tu marca.',
  hero_badge_text: 'Solo para infoproductores que buscan calidad superior',
  hero_cta_text: 'Cotizar mi proyecto',
  whatsapp_phone: '573000000000',
  hero_preview_img_1: '/images/edit_promo.png',
  hero_preview_img_2: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
  hero_preview_img_3: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
  price_amount: '$ 360 USD',
  price_subtitle: 'Ajustable según complejidad, cantidad y tamaño de página',
  about_quote: '«No vendes solo tu producto; vendes la percepción de valor que lo rodea. Ahí comienza el éxito real».',
};

const DEFAULT_MEDIA = [
  {
    id: 1,
    media_type: 'image',
    section: 'banner',
    title: 'Banner Principal',
    description: 'Fondo del héroe',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    media_type: 'image',
    section: 'gallery',
    title: 'Demostración de Plataforma',
    description: 'Vista de panel de control',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    media_type: 'video',
    section: 'showcase',
    title: 'Video Demostrativo',
    description: 'Video de presentación',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    display_order: 3,
    is_active: 1
  }
];

/**
 * Obtiene las configuraciones de texto y los elementos multimedia para la landing.
 */
export async function getLandingContent() {
  try {
    const [configRows] = await pool.query('SELECT section_key, content_value FROM landing_config');
    const [mediaRows] = await pool.query('SELECT * FROM landing_media WHERE is_active = 1 ORDER BY display_order ASC');

    const config = { ...DEFAULT_CONFIG };
    configRows.forEach((row) => {
      config[row.section_key] = row.content_value;
    });

    const formattedMedia = (mediaRows.length > 0 ? mediaRows : DEFAULT_MEDIA).map(row => ({
      ...row,
      thumbnail: row.thumbnail_url || row.thumbnail || null
    }));

    return {
      config,
      media: formattedMedia,
    };
  } catch (error) {
    console.warn('Conexión a MySQL no disponible aún, usando datos por defecto:', error.message);
    return {
      config: DEFAULT_CONFIG,
      media: DEFAULT_MEDIA,
    };
  }
}

/**
 * Actualiza configuraciones de texto de la landing (solo para administradores autenticados).
 */
export async function updateLandingConfig(configObject) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('No autorizado para realizar esta acción');
  }

  try {
    for (const [key, value] of Object.entries(configObject)) {
      await pool.query(
        `INSERT INTO landing_config (section_key, content_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)`,
        [key, value]
      );
    }
    revalidatePath('/');
    return { success: true, message: 'Configuración actualizada correctamente' };
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    throw new Error('Falló la actualización en la base de datos MySQL');
  }
}

/**
 * Agrega o actualiza un elemento multimedia (URL de imagen o enlace de video).
 */
export async function saveMediaItem(mediaData) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('No autorizado para realizar esta acción');
  }

  const { id, media_type, section, title, description, url, thumbnail, thumbnail_url, display_order } = mediaData;
  const finalThumbnail = thumbnail_url || thumbnail || null;

  try {
    let savedId = id;
    if (id) {
      await pool.query(
        `UPDATE landing_media 
         SET media_type = ?, section = ?, title = ?, description = ?, url = ?, thumbnail_url = ?, display_order = ? 
         WHERE id = ?`,
        [media_type, section, title, description, url, finalThumbnail, display_order || 0, id]
      );
    } else {
      const [result] = await pool.query(
        `INSERT INTO landing_media (media_type, section, title, description, url, thumbnail_url, display_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [media_type, section, title, description, url, finalThumbnail, display_order || 0]
      );
      savedId = result.insertId;
    }
    revalidatePath('/');
    revalidatePath('/admin/dashboard');

    const [rows] = await pool.query('SELECT * FROM landing_media WHERE id = ?', [savedId]);
    const item = rows[0] || { id: savedId, ...mediaData, thumbnail_url: finalThumbnail, thumbnail: finalThumbnail };

    return { success: true, message: 'Elemento multimedia guardado correctamente', item };
  } catch (error) {
    console.error('Error guardando elemento multimedia:', error);
    throw new Error('Error al guardar en MySQL');
  }
}

/**
 * Elimina o desactiva un elemento multimedia.
 */
export async function deleteMediaItem(id) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('No autorizado para realizar esta acción');
  }

  try {
    await pool.query('DELETE FROM landing_media WHERE id = ?', [id]);
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Elemento eliminado correctamente' };
  } catch (error) {
    console.error('Error eliminando elemento multimedia:', error);
    throw new Error('Error al eliminar en MySQL');
  }
}
