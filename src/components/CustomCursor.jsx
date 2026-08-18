'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Desactivar en pantallas táctiles / móviles
    if (window.innerWidth <= 1024) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseEnterInteractive = () => setIsHovered(true);
    const onMouseLeaveInteractive = () => setIsHovered(false);

    window.addEventListener('mousemove', onMouseMove);

    // Añadir listener a elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .interactive-hover');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterInteractive);
      el.addEventListener('mouseleave', onMouseLeaveInteractive);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive);
        el.removeEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: 'transform 0.05s ease-out',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          width: isHovered ? '48px' : '24px',
          height: isHovered ? '48px' : '24px',
          marginTop: isHovered ? '-24px' : '-12px',
          marginLeft: isHovered ? '-24px' : '-12px',
          borderRadius: '50%',
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(139, 92, 246, 0.25)',
          border: isHovered ? 'none' : '1px solid rgba(216, 180, 254, 0.6)',
          boxShadow: isHovered ? '0 0 25px #ffffff, 0 0 50px rgba(168, 85, 247, 0.8)' : '0 0 15px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          mixBlendMode: isHovered ? 'difference' : 'normal',
        }}
      />
    </div>
  );
}
