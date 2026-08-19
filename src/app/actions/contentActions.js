'use server';

import pool from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
