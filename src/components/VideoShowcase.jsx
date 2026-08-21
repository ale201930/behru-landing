'use client';

import { useState, useMemo, useEffect } from 'react';


const DEMO_VIDEOS = [
  {
    id: 'demo-vid-1',
    title: 'Showreel Edición 2026',
    description: 'Edición de Impacto y Efectos Especiales para Redes Sociales',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-working-in-a-lab-43187-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-vid-2',
    title: 'Reel Promocional Infoproducto',
    description: 'Edición Dinámica de Alta Conversión con Transiciones',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-green-screen-41551-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-vid-3',
    title: 'Motion Graphics BeHRU',
    description: 'Diseño de Marca en Movimiento y Tipografía Animada',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-dj-playing-music-42995-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-vid-4',
    title: 'Cyberpunk Launch Reel',
    description: 'Estética Neón y Edición Sonora Inmersiva',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-gaming-room-with-neon-lights-43285-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-vid-5',
    title: 'VIP Masterclass Teaser',
    description: 'Tráiler Exclusivo para Infoproductores de Éxito',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-computer-39824-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'demo-vid-6',
    title: 'Sport Champion Edit',
    description: 'Edición Deportiva de Máxima Energía',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-skateboarding-in-a-skate-park-at-sunset-41484-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
  }
];

export default function VideoShowcase({ initialVideos = [] }) {
  const videos = useMemo(() => {
    if (initialVideos && initialVideos.length > 0) {
      if (initialVideos.length < 3) {
        const realUrls = new Set(initialVideos.map(v => v.url));
        const neededDemos = DEMO_VIDEOS.filter(d => !realUrls.has(d.url)).slice(0, 3 - initialVideos.length);
        return [...initialVideos, ...neededDemos];
      }
      return initialVideos;
    }
    return DEMO_VIDEOS;
  }, [initialVideos]);

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 960) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const maxIndex = Math.max(0, videos.length - visibleCount);
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  const visibleVideos = videos.slice(startIndex, startIndex + visibleCount);

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/') + '?autoplay=1';
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  const isEmbed = (url) => url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

  return (
    <div style={{ maxWidth: '1200px', margin: '1.5rem auto 0 auto', textAlign: 'center' }}>

      {/* Carrusel de Videos Visibles con Navegación por Botones y Puntos */}
      <div className="video-showcase-wrapper" style={{ position: 'relative', width: '100%' }}>
        
        {/* Botón Anterior */}
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          aria-label="Anterior video"
          className="carousel-arrow carousel-arrow-left"
        >
          ‹
        </button>

        {/* Botón Siguiente */}
        <button
          onClick={handleNext}
          disabled={startIndex >= maxIndex}
          aria-label="Siguiente video"
          className="carousel-arrow carousel-arrow-right"
        >
          ›
        </button>

        {/* Grid Lado a Lado Estilo ViralREELS (Exactamente 3 Videos en 1 Fila) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: visibleCount === 1 ? '1fr' : visibleCount === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '1.5rem',
          maxWidth: visibleCount === 1 ? '340px' : visibleCount === 2 ? '650px' : '960px',
          margin: '0 auto',
          padding: '1rem 0'
        }}>
          {visibleVideos.map((vid, idx) => {
            const isHovered = hoveredId === (vid.id || idx);

            return (
              <div
                key={vid.id || idx}
                onMouseEnter={() => setHoveredId(vid.id || idx)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedVideo(vid)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '380px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'translateY(-10px) scale(1.03)' : 'translateY(0) scale(1)',
                  border: isHovered ? '2.5px solid #ebcdba' : '1px solid rgba(235, 205, 186, 0.25)',
                  boxShadow: isHovered
                    ? '0 25px 55px rgba(75, 39, 118, 0.9), 0 0 30px rgba(235, 205, 186, 0.4)'
                    : '0 12px 30px rgba(0,0,0,0.6)',
                  backgroundColor: '#121016'
                }}
              >
                {/* Video de Fondo en Reproducción Continua */}
                {(() => {
                  const cover = (function(vidItem) {
                    if (vidItem.thumbnail) return { type: 'image', src: vidItem.thumbnail };
                    if (vidItem.thumbnail_url) return { type: 'image', src: vidItem.thumbnail_url };

                    if (vidItem.url && typeof vidItem.url === 'string') {
                      const ytMatch = vidItem.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                      if (ytMatch && ytMatch[1]) {
                        return { type: 'image', src: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` };
                      }
                      if (vidItem.url.includes('.mp4') || vidItem.url.startsWith('/uploads/')) {
                        return { type: 'video', src: `${vidItem.url}#t=0.5` };
                      }
                    }
                    return { type: 'image', src: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80' };
                  })(vid);

                  if (cover.type === 'video' || (vid.url && typeof vid.url === 'string' && (vid.url.endsWith('.mp4') || vid.url.includes('.mp4') || vid.url.startsWith('/uploads/')))) {
                    const videoSrc = vid.url || cover.src;
                    return (
                      <video
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: isHovered ? 'scale(1.06)' : 'scale(1)'
                        }}
                      />
                    );
                  }

                  return (
                    <img
                      src={cover.src}
                      alt={vid.title || 'Video Edit'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isHovered ? 'scale(1.06)' : 'scale(1)'
                      }}
                    />
                  );
                })()}

                {/* Badge Superior Tipo "PILA 01" (Estilo ViralREELS) */}
                <div style={{
                  position: 'absolute',
                  top: '1.2rem',
                  left: '1.2rem',
                  backgroundColor: 'rgba(18, 16, 22, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(235, 205, 186, 0.3)',
                  color: '#ffffff',
                  fontSize: '0.725rem',
                  fontWeight: '900',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  zIndex: 10
                }}>
                  REEL 0{idx + 1}
                </div>

                {/* Gradiente Inferior Elegante con Título y Descripción */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18,16,22,0.95) 0%, rgba(18,16,22,0.4) 40%, transparent 70%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem 1.25rem',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  zIndex: 10
                }}>
                  <h4 style={{
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    margin: '0 0 0.25rem 0',
                    color: '#ffffff',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.25
                  }}>
                    {vid.title || 'Video Edit BeHRU'}
                  </h4>
                  <p style={{
                    fontSize: '0.825rem',
                    color: '#ebcdba',
                    margin: 0,
                    fontWeight: '600',
                    opacity: 0.9
                  }}>
                    {vid.description || 'Haz clic para reproducir en pantalla completa'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Puntos de Paginación */}
        {maxIndex > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1.5rem' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setStartIndex(dotIdx)}
                aria-label={`Ver grupo de videos ${dotIdx + 1}`}
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
        )}
      </div>

      {/* MODAL CINE LIGHTBOX DE REPRODUCCIÓN DE VIDEO EN ALTA RESOLUCIÓN */}
      {selectedVideo && (
        <div
          onClick={() => setSelectedVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 16, 22, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
        >
          {/* Botón de Cerrar */}
          <button
            onClick={() => setSelectedVideo(null)}
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
              boxShadow: '0 0 25px rgba(75, 39, 118, 0.9)'
            }}
          >
            ✕
          </button>

          {/* Contenedor del Reproductor de Video */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 35px 90px rgba(75, 39, 118, 0.95), 0 0 45px rgba(235, 205, 186, 0.4)',
              border: '2px solid #ebcdba',
              backgroundColor: '#121016'
            }}
          >
            <div style={{ aspectRatio: '16/9', width: '100%', backgroundColor: '#000' }}>
              {isEmbed(selectedVideo.url) ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{
              backgroundColor: '#28173f',
              padding: '1.5rem 2rem',
              textAlign: 'left',
              borderTop: '1px solid rgba(235, 205, 186, 0.3)'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-coolvetica)' }}>
                🎬 {selectedVideo.title || 'Video Edit BeHRU'}
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#ebcdba', fontWeight: '600', margin: 0 }}>
                {selectedVideo.description || 'Demostración en Alta Definición'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
