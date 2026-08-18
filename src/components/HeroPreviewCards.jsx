'use client';

import { useState } from 'react';

export default function HeroPreviewCards({
  img1 = '/images/edit_promo.png',
  img2 = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
  img3 = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);

  const images = [
    { id: 1, url: img1, title: 'Edit Promocional 1' },
    { id: 2, url: img2, title: 'Edit Promocional 2' },
    { id: 3, url: img3, title: 'Edit Promocional 3' },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.75rem', position: 'relative' }}>
        {images.map((item, idx) => {
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setSelectedImg(item)}
              title="Haz clic para ver esta imagen en alta definición"
              style={{
                width: '100px',
                height: '130px',
                borderRadius: '14px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered
                  ? 'translateY(-14px) scale(1.15) rotate(-1deg)'
                  : 'translateY(0) scale(1) rotate(0deg)',
                zIndex: isHovered ? 40 : 10,
                border: isHovered
                  ? '2.5px solid #ebcdba'
                  : '1.5px solid rgba(235, 205, 186, 0.4)',
                backgroundColor: '#28173f',
                boxShadow: isHovered
                  ? '0 25px 50px rgba(75, 39, 118, 0.95), 0 0 30px rgba(235, 205, 186, 0.6)'
                  : '0 10px 25px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                  imageRendering: 'high-quality',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Modal Lightbox de Vista Previa en Alta Definición */}
      {selectedImg && (
        <div
          onClick={() => setSelectedImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 16, 22, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button
            onClick={() => setSelectedImg(null)}
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

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxHeight: '85vh',
              maxWidth: '90vw',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(75, 39, 118, 0.95), 0 0 40px rgba(235, 205, 186, 0.5)',
              border: '2px solid #ebcdba',
              backgroundColor: '#121016'
            }}
          >
            <img
              src={selectedImg.url}
              alt="Edit Ampliado"
              style={{
                maxHeight: '80vh',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'high-quality'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
