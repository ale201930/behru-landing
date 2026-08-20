'use client';

import { useState, useMemo, useEffect } from 'react';

const DEMO_COLLABORATORS = [
  { id: 'col-1', name: 'Adrián Lucena', role: 'Copywriting', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'col-2', name: 'Maider Tomasena', role: 'Copywriting', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { id: 'col-3', name: 'Eileen Rovira', role: 'Gestión & Creatividad', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { id: 'col-4', name: 'Javier Quesada', role: 'Estrategia Digital', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'col-5', name: 'Mateo González', role: 'Trafficker VIP', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
];

export default function PeopleShowcase({ initialItems = [] }) {
  const items = useMemo(() => {
    if (initialItems && initialItems.length > 0) {
      if (initialItems.length < 5) {
        const realUrls = new Set(initialItems.map(i => i.url));
        const neededDemos = DEMO_COLLABORATORS.filter(d => !realUrls.has(d.url)).slice(0, 5 - initialItems.length);
        return [...initialItems, ...neededDemos];
      }
      return initialItems;
    }
    return DEMO_COLLABORATORS;
  }, [initialItems]);

  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 960) {
        setVisibleCount(3);
      } else {
        setVisibleCount(5);
      }
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (startIndex > maxIndex) {
      setStartIndex(Math.max(0, maxIndex));
    }
  }, [maxIndex, startIndex]);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto 4.5rem auto', textAlign: 'center', position: 'relative' }}>
      
      {/* Encabezado Estilo Jhonny Lubo */}
      <div style={{ maxWidth: '850px', margin: '0 auto 3rem auto' }}>
        <h3 style={{
          fontSize: 'clamp(1.85rem, 3.2vw, 2.75rem)',
          fontWeight: '900',
          fontFamily: 'Outfit, sans-serif',
          lineHeight: 1.2,
          color: '#ffffff',
          marginBottom: '0.75rem'
        }}>
          Nombres que estuvieron presentes en<br />
          <span style={{ color: '#ebcdba' }}>los proyectos donde colaboré con diseño.</span>
        </h3>
      </div>

      {/* Carrusel de Tarjetas de Personas / Colaboradores en Stack con Resplandor Central */}
      <div className="portfolio-carousel-wrapper" style={{ position: 'relative', width: '100%' }}>
        
        {/* Glow de Fondo Morado en el Centro (Idéntico a jhonnylubo.com) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -45%)',
          width: '500px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(75, 39, 118, 0.25) 50%, transparent 80%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Stack de Tarjetas de Personas en Abanico U */}
        <div className="portfolio-stack-container" style={{ position: 'relative', zIndex: 10, minHeight: '440px' }}>
          {visibleItems.map((person, idx) => {
            const isHovered = hoveredId === (person.id || idx);
            const isSingle = visibleCount === 1;
            const centerIdx = Math.floor(visibleCount / 2);
            const offset = idx - centerIdx; // -2, -1, 0, 1, 2

            // Arco en forma de U / Abanico idéntico a la imagen de referencia (jhonnylubo.com)
            // El centro es el más alto, las tarjetas laterales caen en altura (translateY positivo) y rotan hacia afuera.
            let rotateDeg = 0;
            let translateY = 0;

            if (!isSingle) {
              if (visibleCount === 5) {
                // Rotaciones: -16deg, -8deg, 0deg, 8deg, 16deg
                rotateDeg = offset * 8;
                // Curva de arco: el centro está en 0 (más alto), las laterales bajan progresivamente (25px y 65px)
                translateY = Math.pow(Math.abs(offset), 1.8) * 22;
              } else if (visibleCount === 3) {
                rotateDeg = offset * 10;
                translateY = Math.abs(offset) * 25;
              }
            }

            let baseScale = isSingle ? 1 : 0.94;
            if (offset === 0) baseScale = isSingle ? 1 : 1.05;
            else if (Math.abs(offset) === 1) baseScale = 0.97;
            else baseScale = 0.90;

            let zIndexValue = 10 - Math.abs(offset);
            if (isHovered) zIndexValue = 50;

            return (
              <div
                key={person.id || idx}
                onMouseEnter={() => setHoveredId(person.id || idx)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: visibleCount === 1 ? 'min(270px, 85vw)' : visibleCount === 3 ? '210px' : '215px',
                  height: visibleCount === 1 ? '420px' : '390px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginLeft: (idx === 0 || visibleCount === 1) ? 0 : '-18px',
                  transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered
                    ? `translateY(${translateY - 20}px) rotate(0deg) scale(1.12)`
                    : `translateY(${translateY}px) rotate(${rotateDeg}deg) scale(${baseScale})`,
                  transformOrigin: 'bottom center',
                  zIndex: zIndexValue,
                  border: isHovered
                    ? '2.5px solid #ebcdba'
                    : offset === 0
                    ? '2.5px solid rgba(235, 205, 186, 0.8)'
                    : '1px solid rgba(235, 205, 186, 0.2)',
                  backgroundColor: '#121016',
                  boxShadow: isHovered
                    ? '0 30px 80px rgba(147, 51, 234, 0.95), 0 0 40px rgba(235, 205, 186, 0.7)'
                    : offset === 0
                    ? '0 25px 60px rgba(147, 51, 234, 0.85), 0 0 30px rgba(235, 205, 186, 0.4)'
                    : '0 12px 35px rgba(0,0,0,0.7)',
                }}
              >
                {/* Foto de la Persona */}
                <img
                  src={person.url || person.thumbnail || person.thumbnail_url}
                  alt={person.name || person.title || 'Colaborador'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    filter: Math.abs(offset) > 1 && !isHovered ? 'brightness(0.75) contrast(1.05)' : 'none'
                  }}
                />

                {/* Resplandor Inferior Dinámico de Color Estilo Jhonny Lubo */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isHovered || offset === 0
                    ? 'linear-gradient(to top, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.5) 35%, rgba(18, 16, 22, 0.1) 65%, transparent 100%)'
                    : Math.abs(offset) === 1
                    ? 'linear-gradient(to top, rgba(168, 85, 247, 0.92) 0%, rgba(126, 34, 206, 0.45) 35%, transparent 100%)'
                    : 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.45) 35%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem 1rem 1.25rem 1rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1.3rem',
                      fontWeight: '900',
                      margin: '0 0 0.25rem 0',
                      color: '#ffffff',
                      fontFamily: 'Outfit, sans-serif',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                    }}>
                      {person.name || person.title || 'Nombre'}
                    </h4>
                    <p style={{
                      fontSize: '0.825rem',
                      color: '#ebcdba',
                      fontWeight: '700',
                      margin: 0,
                      opacity: 0.95,
                      textShadow: '0 1px 5px rgba(0,0,0,0.8)'
                    }}>
                      {person.role || person.description || 'Colaboración'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de Navegación Centrados Abajo en Cápsula (Estilo Jhonny Lubo: ←  →) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2.5rem',
          position: 'relative',
          zIndex: 60
        }}>
          <button
            onClick={() => setStartIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, items.length - visibleCount)))}
            aria-label="Anterior"
            style={{
              width: '90px',
              height: '42px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(75, 39, 118, 0.45)',
              border: '1.5px solid rgba(235, 205, 186, 0.5)',
              color: '#ebcdba',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 25px rgba(75, 39, 118, 0.6), 0 0 15px rgba(235, 205, 186, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ebcdba';
              e.currentTarget.style.color = '#121016';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(75, 39, 118, 0.45)';
              e.currentTarget.style.color = '#ebcdba';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ←
          </button>
          <button
            onClick={() => setStartIndex((prev) => (prev < maxIndex ? prev + 1 : 0))}
            aria-label="Siguiente"
            style={{
              width: '90px',
              height: '42px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(75, 39, 118, 0.45)',
              border: '1.5px solid rgba(235, 205, 186, 0.5)',
              color: '#ebcdba',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 25px rgba(75, 39, 118, 0.6), 0 0 15px rgba(235, 205, 186, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ebcdba';
              e.currentTarget.style.color = '#121016';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(75, 39, 118, 0.45)';
              e.currentTarget.style.color = '#ebcdba';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
