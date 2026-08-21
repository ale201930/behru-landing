'use client';

import { useState } from 'react';

export default function FaqAccordion({ config = {} }) {
  const faqsList = [
    {
      q: config.faq1_q || "¿Cómo demuestras tu compromiso con la excelencia y la calidad en cada proyecto?",
      a: config.faq1_a || "Tratando cada proyecto como si fuera propio. Cuidamos cada detalle visual, la narrativa persuasiva y la velocidad de carga para garantizar conversiones reales."
    },
    {
      q: config.faq2_q || "¿Qué diferencia a tu servicio?",
      a: config.faq2_a || "No solo diseñamos páginas bonitas; combinamos diseño gráfico de alto nivel, narrativa estratégica y código a medida enfocado en ventas."
    },
    {
      q: config.faq3_q || "¿Cómo garantizas que mi landing page se destaque entre la competencia?",
      a: config.faq3_a || "Creamos un concepto visual 100% auténtico y personalizado para tu marca, huyendo de plantillas genéricas o soluciones prefabricadas."
    },
    {
      q: config.faq4_q || "¿Cuánto tiempo tardas en entregar una landing page personalizada?",
      a: config.faq4_a || "El tiempo habitual de entrega oscila entre 5 y 10 días hábiles dependiendo de la complejidad y los recursos disponibles."
    },
    {
      q: config.faq5_q || "¿Qué pasa si necesito ajustes o cambios tras recibir mi landing page?",
      a: config.faq5_a || "Cada paquete incluye rondas de revisión estratégicas para afinar cada detalle hasta que el resultado sea 100% perfecto para ti."
    },
    {
      q: config.faq6_q || "¿Es necesario tener todo listo antes de la contratación del diseño?",
      a: config.faq6_a || "No necesariamente. Podemos orientarte con la estructura de contenidos y el copy persuasivo durante la fase inicial del proyecto."
    }
  ];
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {faqsList.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="faq-item">
            <button
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.05rem',
                textAlign: 'left',
                cursor: 'pointer',
                gap: '1rem'
              }}
            >
              <span>{faq.q}</span>
              <span style={{
                fontSize: '1.5rem',
                lineHeight: 1,
                color: '#ebcdba',
                transition: 'transform 0.3s ease',
                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
              }}>
                +
              </span>
            </button>

            {isOpen && (
              <div style={{
                padding: '0 1.5rem 1.25rem 1.5rem',
                color: '#dedbef',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                borderTop: '1px solid rgba(222, 219, 239, 0.15)'
              }}>
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
