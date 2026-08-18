'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      // Redirigir al Dashboard de Administración
      onClose();
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(30, 30, 28, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#1e1e1c',
        border: '1px solid rgba(235, 205, 186, 0.3)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(75, 39, 118, 0.5)',
        color: '#ffffff',
        position: 'relative',
        fontFamily: 'var(--font-open-sauce)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#dedbef',
            fontSize: '1.25rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <img
            src="/images/logo_header.png"
            alt="BenRU Logo"
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 1rem auto',
              imageRendering: 'high-quality',
            }}
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: '#ffffff', fontFamily: 'var(--font-open-sauce)' }}>
            Acceso Administrativo
          </h2>
          <p style={{ color: '#dedbef', fontSize: '0.875rem', margin: 0 }}>
            Inicia sesión para gestionar el contenido de la landing.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ebcdba', marginBottom: '0.5rem' }}>
              Usuario o Correo
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@ejemplo.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(222, 219, 239, 0.2)',
                backgroundColor: '#28173f',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ebcdba', marginBottom: '0.5rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(222, 219, 239, 0.2)',
                backgroundColor: '#28173f',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #ebcdba 0%, #f3dfd1 100%)',
              color: '#1e1e1c',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 8px 20px rgba(235, 205, 186, 0.3)',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
