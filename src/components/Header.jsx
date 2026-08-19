'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, MessageCircle } from 'lucide-react';
import LogoSecretGesture from './LogoSecretGesture';
import AdminAuthModal from './AdminAuthModal';

export default function Header({ siteTitle = "BenRU" }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar tamaño de pantalla o al hacer click en un enlace
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '#proyectos', label: 'Portafolio' },
    { href: '#beneficios', label: 'Beneficios' },
    { href: '#paquetes', label: 'Precios' },
    { href: '#faq', label: 'Preguntas' },
  ];

  return (
    <>
      <header className="header-container">
        {/* Logotipo BeHRU con el secreto de 5 clics */}
        <LogoSecretGesture
          logoText={siteTitle}
          onSecretTrigger={() => setIsAuthModalOpen(true)}
        />

        {/* Navegación Desktop */}
        <div className="desktop-nav-wrapper">
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </a>
            ))}
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

        {/* Botón Hamburguesa Móvil */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={26} color="#ebcdba" /> : <Menu size={26} color="#ebcdba" />}
        </button>
      </header>

      {/* Drawer / Menú Desplegable Móvil */}
      <div
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mobile-menu-content">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', textAlign: 'center' }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href="https://wa.me/573000000000?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20proyecto"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-behru"
              style={{
                width: '100%',
                padding: '0.95rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={18} />
              Cotizar mi proyecto
            </a>

            <p style={{ fontSize: '0.8rem', color: '#dedbef', opacity: 0.7, margin: 0, textAlign: 'center' }}>
              Ruben Torrealba · BeHRU 2026
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop oscuro para móvil */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modal Oculto de Autenticación */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

