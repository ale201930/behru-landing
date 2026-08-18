'use client';

import { useState } from 'react';
import LogoSecretGesture from './LogoSecretGesture';
import AdminAuthModal from './AdminAuthModal';

export default function Header({ siteTitle = "BenRU" }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(18, 16, 22, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(222, 219, 239, 0.15)',
        padding: '1.25rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logotipo BeHRU con el secreto de 5 clics */}
        <LogoSecretGesture
          logoText={siteTitle}
          onSecretTrigger={() => setIsAuthModalOpen(true)}
        />

        {/* Navegación sutil y botón de Cotización (SIN botón visible de login) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#proyectos" style={{ color: '#dedbef', textDecoration: 'none', fontSize: '0.925rem', fontWeight: '600', transition: 'color 0.2s' }}>
              Portafolio
            </a>
            <a href="#beneficios" style={{ color: '#dedbef', textDecoration: 'none', fontSize: '0.925rem', fontWeight: '600', transition: 'color 0.2s' }}>
              Beneficios
            </a>
            <a href="#paquetes" style={{ color: '#dedbef', textDecoration: 'none', fontSize: '0.925rem', fontWeight: '600', transition: 'color 0.2s' }}>
              Precios
            </a>
            <a href="#faq" style={{ color: '#dedbef', textDecoration: 'none', fontSize: '0.925rem', fontWeight: '600', transition: 'color 0.2s' }}>
              Preguntas
            </a>
          </nav>

          <a
            href="https://wa.me/573000000000?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20proyecto"
            target="_blank"
            rel="noreferrer"
            className="btn-behru"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Cotizar mi proyecto
          </a>
        </div>
      </header>

      {/* Modal Oculto de Autenticación */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
