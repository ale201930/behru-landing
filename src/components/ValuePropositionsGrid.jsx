'use client';

export default function ValuePropositionsGrid() {
  const cards = [
    {
      id: 1,
      title: 'Enfoque Inicial',
      description: 'Alineamos objetivos, eliminamos dudas, creamos un plan claro. Todo en menos tiempo del que imaginas.',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" x2="18" y1="12" y2="12" />
          <line x1="6" x2="2" y1="12" y2="12" />
          <line x1="12" x2="12" y1="6" y2="2" />
          <line x1="12" x2="12" y1="22" y2="18" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Personalización que destaca',
      description: 'Mientras otros repiten plantillas, yo creo algo único para ti, imposible de ignorar.',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
          <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
          <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
          <path d="M2 12a10 10 0 0 1 18-6" />
          <path d="M2 16h.01" />
          <path d="M21.8 16c.2-2 .131-5.354 0-6" />
          <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
          <path d="M8.65 22c.21-.66.45-1.32.57-2" />
          <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Diseño con Propósito',
      description: 'Cada detalle visual existe solo si ayuda a tu conversión. Nada de adornos innecesarios; solo decisiones visuales que impulsan a actuar.',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Copywriting persuasivo (opcional)',
      description: 'Si lo deseas, sumamos a un especialista que sabe escribir con precisión lo que tu audiencia necesita leer para actuar.',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      )
    }
  ];

  return (
    <div className="value-cards-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className="value-card interactive-hover"
          style={{
            backgroundColor: '#8e796c',
            backgroundImage: 'linear-gradient(135deg, #968174 0%, #857265 100%)',
            borderRadius: '22px',
            border: '1px solid rgba(235, 205, 186, 0.25)',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default'
          }}
        >
          {/* Icono Oficial Lucide Vectors (Line-Art perfecto sin dependencias externas) */}
          <div style={{
            width: '64px',
            height: '64px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))'
          }}>
            {card.icon}
          </div>

          {/* Textos: Título y Descripción */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '0.6rem',
              fontFamily: 'var(--font-open-sauce), sans-serif',
              lineHeight: 1.25
            }}>
              {card.title}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontSize: '0.975rem',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: 'var(--font-open-sauce), sans-serif'
            }}>
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
