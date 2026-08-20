import pool from '@/lib/db';

// Datos por defecto (fallback si la BD en Laragon aún no ha sido poblada)
export const DEFAULT_CONFIG = {
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

export const DEFAULT_MEDIA = [
  {
    id: 1,
    media_type: 'image',
    section: 'gallery',
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
 * Ejecuta una query con timeout explícito y siempre retorna un valor (nunca rechaza).
 * Esto previene unhandledRejection cuando MySQL/Laragon no está disponible.
 */
async function safeQuery(sql, fallback = []) {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 4000)
    );
    const query = pool.query(sql);
    const [rows] = await Promise.race([query, timeout]);
    return rows ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Obtiene las configuraciones de texto y los elementos multimedia para la landing.
 */
export async function getLandingContent() {
  try {
    const configRows = await safeQuery('SELECT section_key, content_value FROM landing_config', []);
    const mediaRows = await safeQuery('SELECT * FROM landing_media WHERE is_active = 1 ORDER BY display_order ASC', []);

    const config = { ...DEFAULT_CONFIG };
    if (Array.isArray(configRows)) {
      configRows.forEach((row) => {
        config[row.section_key] = row.content_value;
      });
    }

    const formattedMedia = (Array.isArray(mediaRows) && mediaRows.length > 0 ? mediaRows : DEFAULT_MEDIA).map(row => ({
      ...row,
      thumbnail: row.thumbnail_url || row.thumbnail || null
    }));

    return {
      config,
      media: formattedMedia,
    };
  } catch {
    return {
      config: DEFAULT_CONFIG,
      media: DEFAULT_MEDIA,
    };
  }
}
