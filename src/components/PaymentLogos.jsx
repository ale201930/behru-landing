'use client';

export default function PaymentLogos() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2.5rem',
      marginTop: '1.25rem',
      paddingTop: '0.25rem'
    }}>
      {/* PayPal (Texto limpio en Open Sauce Sans sin el icono SVG de la P) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'default',
          opacity: 0.95
        }}
        title="PayPal"
      >
        <span style={{
          fontFamily: 'var(--font-open-sauce), "Open Sauce Sans", sans-serif',
          fontSize: '1.2rem',
          fontWeight: '800',
          fontStyle: 'italic',
          color: '#ffffff',
          letterSpacing: '-0.02em'
        }}>
          PayPal
        </span>
      </div>

      {/* Binance (Icono de diamante + texto en Open Sauce Sans) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          color: '#ffffff',
          cursor: 'default',
          opacity: 0.95
        }}
        title="Binance"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 2l3.6 3.6-3.6 3.6-3.6-3.6L12 2zm-7.2 7.2L8.4 12.8 4.8 16.4 1.2 12.8 4.8 9.2zm14.4 0l3.6 3.6-3.6 3.6-3.6-3.6 3.6-3.6zM12 16.4l3.6 3.6-3.6 3.6-3.6-3.6 3.6-3.6zm0-7.2l3.6 3.6L12 16.4l-3.6-3.6L12 9.2z"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-open-sauce), "Open Sauce Sans", sans-serif',
          fontSize: '0.85rem',
          fontWeight: '800',
          letterSpacing: '0.08em'
        }}>
          BINANCE
        </span>
      </div>

      {/* VISA (Texto estilizado en Open Sauce Sans) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'default',
          opacity: 0.95
        }}
        title="VISA"
      >
        <span style={{
          fontSize: '1.25rem',
          fontWeight: '900',
          fontStyle: 'italic',
          fontFamily: 'var(--font-open-sauce), "Open Sauce Sans", sans-serif',
          color: '#ffffff',
          letterSpacing: '0.12em',
          transform: 'skewX(-6deg)',
          display: 'inline-block'
        }}>
          VISA
        </span>
      </div>
    </div>
  );
}
