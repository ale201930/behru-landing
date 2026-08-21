'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroScrollingCards - Tira vertical de miniaturas que se desplazan en bucle infinito hacia arriba.
 * Soporta cualquier cantidad de imágenes (se duplican para crear el loop perfecto).
 */
export default function HeroScrollingCards({ images = [] }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  // Fallback de imágenes por defecto si no hay ninguna cargada
  const fallbackImages = [
    '/images/edit_promo.png',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&q=80',
  ];

  const srcImages = images.length > 0 ? images : fallbackImages;
  // Duplicamos para que el loop sea invisible
  const allImages = [...srcImages, ...srcImages, ...srcImages];

  const CARD_HEIGHT = 148; // px (incluye gap)
  const GAP = 12;
  const SPEED = 0.55; // px por frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalOneSet = srcImages.length * (CARD_HEIGHT + GAP);

    const step = () => {
      posRef.current -= SPEED;
      // cuando llegamos al final del primer set, saltamos sin notarse
      if (Math.abs(posRef.current) >= totalOneSet) {
        posRef.current = 0;
      }
      track.style.transform = `translateY(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [srcImages.length]);

  return (
    <div
      className="hero-scrolling-strip"
      aria-label="Portafolio de edits en movimiento"
    >
      <div ref={trackRef} className="hero-scrolling-track">
        {allImages.map((src, idx) => (
          <div key={idx} className="hero-scroll-card">
            <img
              src={typeof src === 'string' ? src : src.url}
              alt={`Edit ${(idx % srcImages.length) + 1}`}
              loading="lazy"
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
