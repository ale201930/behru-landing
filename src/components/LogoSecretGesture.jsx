'use client';

import { useSecretGesture } from '@/hooks/useSecretGesture';

export default function LogoSecretGesture({ onSecretTrigger, logoText = "BenRU", className = "" }) {
  const { handleClick } = useSecretGesture(onSecretTrigger, 5, 2500);

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
      className={`interactive-hover ${className}`}
    >
      <img
        src="/images/logo_header.png"
        alt="BenRU Logo"
        style={{
          height: '52px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          imageRendering: 'high-quality',
        }}
      />
    </div>
  );
}
