'use client';

import { useState, useMemo, useEffect } from 'react';


const DEMO_PORTFOLIO_ITEMS = [
  { id: 1, title: 'Red and Black Party', description: 'Dirección Rojo & Negro', url: '/images/edit_promo.png' },
  { id: 2, title: 'MATCH DAY', description: 'Newcastle vs FC Barcelona', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80' },
  { id: 3, title: 'Promo Día de la Mujer', description: 'Oferta Especial Estética', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
  { id: 4, title: 'Marcus Rashford', description: 'Edición Deportiva Pro', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
  { id: 5, title: 'Hawai Party', description: 'Fiesta Temática Verde', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
  { id: 6, title: 'Golden Trophy VIP', description: 'Edición Exclusiva', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
  { id: 7, title: 'Champion Reel', description: 'Diseño Social Media', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80' },
  { id: 8, title: 'Cyber Vision', description: 'Arte Conceptual Neon', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' }
];

export default function PortfolioCarousel({ initialItems = [] }) {
  const items = useMemo(() => {
    if (initialItems && initialItems.length > 0) {
      if (initialItems.length < 5) {
        const realUrls = new Set(initialItems.map(i => i.url));
        const neededDemos = DEMO_PORTFOLIO_ITEMS.filter(d => !realUrls.has(d.url)).slice(0, 5 - initialItems.length);
        return [...initialItems, ...neededDemos];
      }
      return initialItems;
    }
    return DEMO_PORTFOLIO_ITEMS;
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Asegurar que startIndex no exceda maxIndex cuando cambia el tamaño de pantalla
  useEffect(() => {
    if (startIndex > maxIndex) {
      setStartIndex(Math.max(0, maxIndex));
    }
  }, [maxIndex, startIndex]);

  // Autoplay continuo de los diseños con pausa automática al ponerse encima (hover)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const timer = setInterval(() => {
      setStartIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <>
      <div
        className="portfolio-carousel-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Botón Navegación Izquierda */}
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          aria-label="Anterior"
          className="carousel-arrow carousel-arrow-left"
        >
          ‹
        </button>

        {/* Botón Navegación Derecha */}
        <button
          onClick={handleNext}
          disabled={startIndex >= maxIndex}
          aria-label="Siguiente"
          className="carousel-arrow carousel-arrow-right"
        >
          ›
        </button>

        {/* Stack Solapado Estilo Figma */}
        <div className="portfolio-stack-container">
          {visibleItems.map((item, idx) => {
            const isHovered = hoveredId === item.id;
            const isSingle = visibleCount === 1;
            const isCenter = isSingle ? true : visibleCount === 3 ? idx === 1 : idx === 2;
            const isSubCenter = visibleCount === 5 ? (idx === 1 || idx === 3) : false;

            // Escalas exactas del stack
            let baseScale = isSingle ? 1 : 0.92;
            if (isCenter) baseScale = isSingle ? 1 : 1.08;
            else if (isSubCenter) baseScale = 0.98;

            let zIndexValue = 5;
            if (isCenter) zIndexValue = 20;
            else if (isSubCenter) zIndexValue = 12;
            if (isHovered) zIndexValue = 50;

            return (
              <div
                key={item.id || idx}
                className="portfolio-card-item"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedItem(item)}
                style={{
                  width: visibleCount === 1 ? 'min(280px, 85vw)' : visibleCount === 3 ? '210px' : '215px',
                  height: visibleCount === 1 ? '440px' : '385px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  marginLeft: (idx === 0 || visibleCount === 1) ? 0 : '-28px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered
                    ? 'translateY(-14px) scale(1.08)'
                    : `translateY(${isCenter ? '-8px' : '0'}) scale(${baseScale})`,
                  zIndex: zIndexValue,
                  border: isHovered
                    ? '2.5px solid #ebcdba'
                    : isCenter
                    ? '2px solid rgba(235, 205, 186, 0.7)'
                    : '1px solid rgba(235, 205, 186, 0.25)',
                  backgroundColor: '#28173f',
                  boxShadow: isHovered
                    ? '0 30px 70px rgba(75, 39, 118, 0.95), 0 0 35px rgba(235, 205, 186, 0.6)'
                    : isCenter
                    ? '0 25px 50px rgba(75, 39, 118, 0.8), 0 0 20px rgba(235, 205, 186, 0.3)'
                    : '0 10px 30px rgba(0,0,0,0.6)',
                }}
              >
                {/* Imagen del Edit */}
                <img
                  src={item.url}
                  alt={item.title || 'Edit Design'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                />

                {/* Overlay con Información */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isHovered
                    ? 'linear-gradient(to top, rgba(18,16,22,0.96) 0%, rgba(75,39,118,0.45) 60%, transparent 100%)'
                    : 'linear-gradient(to top, rgba(18,16,22,0.92) 0%, transparent 65%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1.05rem',
                      fontWeight: '900',
                      margin: '0 0 0.25rem 0',
                      color: '#ffffff',
                      fontFamily: 'var(--font-coolvetica)'
                    }}>
                      {item.title || 'Edit Social Media'}
                    </h4>
                    <p style={{
                      fontSize: '0.775rem',
                      color: '#ebcdba',
                      fontWeight: '800',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {item.description || 'Diseño BeHRU'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicadores de Puntos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setStartIndex(dotIdx)}
              aria-label={`Ir al grupo ${dotIdx + 1}`}
              style={{
                width: startIndex === dotIdx ? '32px' : '10px',
                height: '10px',
                borderRadius: '999px',
                backgroundColor: startIndex === dotIdx ? '#ebcdba' : 'rgba(235, 205, 186, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: startIndex === dotIdx ? '0 0 12px rgba(235, 205, 186, 0.6)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* MODAL LIGHTBOX DE DISEÑO COMPLETO EN ALTA RESOLUCIÓN */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 16, 22, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Botón de Cerrar */}
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2.5rem',
              background: '#4b2776',
              border: '2px solid #ebcdba',
              color: '#ebcdba',
              fontSize: '1.5rem',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(75, 39, 118, 0.8)'
            }}
          >
            ✕
          </button>

          {/* Imagen Completa en Alta Resolución Sin Cortes */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxHeight: '85vh',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(75, 39, 118, 0.9), 0 0 40px rgba(235, 205, 186, 0.4)',
              border: '2px solid #ebcdba',
              backgroundColor: '#121016'
            }}
          >
            <img
              src={selectedItem.url}
              alt={selectedItem.title}
              style={{
                maxHeight: '75vh',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            <div style={{
              width: '100%',
              backgroundColor: '#28173f',
              padding: '1.25rem 2rem',
              textAlign: 'center',
              borderTop: '1px solid rgba(235, 205, 186, 0.3)'
            }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-coolvetica)' }}>
                {selectedItem.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#ebcdba', fontWeight: '800', margin: 0 }}>
                {selectedItem.description || 'Diseño BeHRU en Alta Resolución'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
