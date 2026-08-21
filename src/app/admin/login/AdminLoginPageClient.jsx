'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPageClient() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121016',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Resplandor Púrpura de Fondo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(75, 39, 118, 0.15) 50%, transparent 80%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      {/* Tarjeta de Formulario de Login */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#181420',
        border: '1.5px solid rgba(235, 205, 186, 0.3)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6), 0 0 30px rgba(75, 39, 118, 0.4)',
        textAlign: 'center'
      }}>
        {/* Logotipo Nítido */}
        <img
          src="/images/logo_hero.png"
          alt="BeHRU Logo"
          style={{
            height: '65px',
            width: 'auto',
            objectFit: 'contain',
            margin: '0 auto 1.5rem auto',
            display: 'block',
            imageRendering: 'high-quality'
          }}
        />

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            color: '#ffffff',
            margin: '0 0 0.5rem 0'
          }}>
            Panel de <span style={{ color: '#ebcdba' }}>Administración</span>
          </h1>
          <p style={{ color: '#dedbef', fontSize: '0.875rem', margin: 0 }}>
            Ingrese sus credenciales autorizadas para gestionar el sitio.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#ebcdba', marginBottom: '0.4rem' }}>
              Usuario o Correo Electrónico
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#ebcdba', marginBottom: '0.4rem' }}>
              Contraseña de Acceso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.95rem',
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
              padding: '0.95rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#ebcdba',
              color: '#121016',
              fontWeight: '900',
              fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 8px 25px rgba(235, 205, 186, 0.4)',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.75rem',
              transition: 'all 0.25s ease'
            }}
          >
            {loading ? 'Verificando...' : '🔒 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(235, 205, 186, 0.15)', paddingTop: '1.25rem' }}>
          <a
            href="/"
            style={{ color: '#ebcdba', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
          >
            ← Volver a la Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}
