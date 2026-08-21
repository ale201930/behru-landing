import pool from '@/lib/db';

// Datos por defecto (fallback si la BD en Laragon aún no ha sido poblada)
export const DEFAULT_CONFIG = {
  site_title: 'BeHRU',
  
  // 1. Inicio / Hero Banner & WhatsApp
  hero_title: 'Tu Feed no necesita más visitas, sino mejores decisiones',
  hero_subtitle: 'Diseñamos y desarrollamos experiencias interactivas personalizadas para impulsar tus ventas y destacar tu marca.',
  hero_badge_text: 'Solo para infoproductores que buscan calidad superior',
  hero_cta_text: 'Cotizar mi proyecto',
  whatsapp_phone: '573000000000',

  // 2. Personas / Colaboradores
  people_section_title: 'Nombres que estuvieron presentes en lo que hoy ves',
  people_section_subtitle: 'Especialistas e infoproductores con los que he tenido la oportunidad de colaborar.',

  // 3. Diseños & Videos (Portafolio & Showcase)
  portfolio_title: 'Tu diseño determina la percepción.',
  portfolio_subtitle: 'Y la percepción, las ventas.',
  portfolio_description: 'Grandes infoproductores confían en mí para elevar sus conversiones. La razón es sencilla: entienden que el diseño no es decoración, sino percepción.',
  video_title: 'Edición de Video de Alto Impacto',
  video_subtitle: 'Videos diseñados con retención, ritmo y animaciones personalizadas para captar la atención de tu audiencia desde el primer segundo.',

  // 4. Propuesta de Valor & Beneficios (La decisión se convierte en resultados)
  value_pretitle: 'Lo visual se convierte en decisión',
  value_title: 'La decisión se convierte en resultados.',
  value_subtitle: 'Así es como colaborar conmigo marca la diferencia y mejora tus resultados.',
  value_card1_title: 'Enfoque Inicial',
  value_card1_desc: 'Alineamos objetivos, eliminamos dudas, creamos un plan claro. Todo en menos tiempo del que imaginas.',
  value_card2_title: 'Personalización que destaca',
  value_card2_desc: 'Mientras otros repiten plantillas, yo creo algo único para ti, imposible de ignorar.',
  value_card3_title: 'Diseño con Propósito',
  value_card3_desc: 'Cada detalle visual existe solo si ayuda a tu conversión. Nada de adornos innecesarios; solo decisiones visuales que impulsan a actuar.',
  value_card4_title: 'Copywriting persuasivo (opcional)',
  value_card4_desc: 'Si lo deseas, sumamos a un especialista que sabe escribir con precisión lo que tu audiencia necesita leer para actuar.',

  // 5. Proceso de Colaboración (Colaboración efectiva, resultados inevitables)
  process_title: 'Colaboración efectiva, resultados inevitables',
  process_subtitle: 'Claridad desde el inicio hasta la entrega. El acuerdo y la entrega de tu proyecto en 5 pasos.',
  process_step1_title: 'Acuerdo directo',
  process_step1_desc: 'Definimos exactamente lo que necesitas, tiempos y precio, recursos que debes enviarnos, sin complicaciones innecesarias.',
  process_step2_title: 'Comodidad en cada pago',
  process_step2_desc: 'Puedes usar Visa, MasterCard o USDT. Pagas 50% al iniciar, 50% al entregar.',
  process_step3_title: 'Revisión estratégica',
  process_step3_desc: 'Recibes una propuesta inicial que incluye 1 revisión para ajustes precisos.',
  process_step4_title: 'Implementación responsive',
  process_step4_desc: 'Montaje del diseño aprobado y optimización de carga para cada dispositivo.',
  process_step5_title: 'Entrega de recursos',
  process_step5_desc: 'Concluimos cuando recibes todos los recursos utilizados en alta calidad y formatos optimizados.',
  process_cta_text: 'Cotizar mi Landing',

  // 6. Inversión & Paquetes (Un paquete diseñado para infoproductores...)
  package_title: 'Un paquete diseñado para infoproductores que buscan calidad superior.',
  package_subtitle: 'Todo lo esencial para potenciar la percepción y conversión de tu negocio.',
  package_includes_title: 'Lo que incluye mi servicio:',
  package_bullet1: 'Investigación de mercado clave',
  package_bullet2: 'Estructura de contenido eficaz',
  package_bullet3: 'Prototipo estratégico inicial',
  package_bullet4: 'Implementación responsive a medida',
  package_bullet5: 'Desarrollo técnico completo',
  package_bullet6: 'Velocidad de carga excepcional',
  package_bullet7: 'Integración simple hosting/dominio',
  package_bullet8: 'Entrega de archivos optimizados y en alta resolución',
  package_bullet9: 'Comunicación persuasiva (opcional)',
  package_tag: 'Valor por Landing Page',
  price_amount: '$ 360 USD',
  price_subtitle: '(Ajustado según complejidad, cantidad y tamaño de páginas)',

  // 7. Sobre Ruben Torrealba (Soy Ruben Torrealba, diseñador especializado...)
  about_title: 'Soy Ruben Torrealba, diseñador especializado en landing pages y diseño para redes sociales',
  about_p1: 'Mis 7 cafés diarios son solo el combustible que impulsa mi obsesión por el diseño de landing pages.',
  about_p2: 'Después de muchos proyectos de landing pages y diseño para redes sociales, aprendí algo simple pero poderoso:',
  about_highlight: 'La percepción lo es todo.',
  about_p3: 'Tu producto puede ser excepcional, pero la verdadera influencia está en cómo lo presentas al mundo.',
  about_quote: '«No vendes solo tu producto; vendes la percepción de valor que lo rodea. Ahí comienza el éxito real».',

  // 8. Preguntas Frecuentes & Footer
  faq_title: 'Respuestas claras a preguntas esenciales',
  faq_subtitle: 'Conoce cómo trabajo, qué esperar y por qué confiarme tu proyecto es una decisión acertada.',
  faq1_q: '¿Cómo demuestras tu compromiso con la excelencia y la calidad en cada proyecto?',
  faq1_a: 'Tratando cada proyecto como si fuera propio. Cuidamos cada detalle visual, la narrativa persuasiva y la velocidad de carga para garantizar conversiones reales.',
  faq2_q: '¿Qué diferencia a tu servicio?',
  faq2_a: 'No solo diseñamos páginas bonitas; combinamos diseño gráfico de alto nivel, narrativa estratégica y código a medida enfocado en ventas.',
  faq3_q: '¿Cómo garantizas que mi landing page se destaque entre la competencia?',
  faq3_a: 'Creamos un concepto visual 100% auténtico y personalizado para tu marca, huyendo de plantillas genéricas o soluciones prefabricadas.',
  faq4_q: '¿Cuánto tiempo tardas en entregar una landing page personalizada?',
  faq4_a: 'El tiempo habitual de entrega oscila entre 5 y 10 días hábiles dependiendo de la complejidad y los recursos disponibles.',
  faq5_q: '¿Qué pasa si necesito ajustes o cambios tras recibir mi landing page?',
  faq5_a: 'Cada paquete incluye rondas de revisión estratégicas para afinar cada detalle hasta que el resultado sea 100% perfecto para ti.',
  faq6_q: '¿Es necesario tener todo listo antes de la contratación del diseño?',
  faq6_a: 'No necesariamente. Podemos orientarte con la estructura de contenidos y el copy persuasivo durante la fase inicial del proyecto.',
  footer_copyright: 'Ruben Torrealba · BeHRU 2026. Todos los derechos reservados.'
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
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 8000)
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
