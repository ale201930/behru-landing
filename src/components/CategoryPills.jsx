'use client';

export default function CategoryPills() {
  const pills = [
    { icon: '📹', label: "VSL's" },
    { icon: '🔄', label: 'Evergreen' },
    { icon: '🎯', label: 'Mentorías' },
    { icon: '🚀', label: 'Lanzamientos' },
    { icon: '📦', label: 'Infoproductos' },
    { icon: '👥', label: 'Captación de leads' },
    { icon: '⚙️', label: 'Low Ticket' },
    { icon: '💎', label: 'High Ticket' },
    { icon: '⭐', label: 'Membresías' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '0.65rem',
      maxWidth: '850px',
      margin: '2rem auto 3.5rem auto'
    }}>
      {pills.map((pill, idx) => (
        <div
          key={idx}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            border: '1px dashed rgba(235, 205, 186, 0.4)',
            backgroundColor: 'rgba(75, 39, 118, 0.15)',
            color: '#dedbef',
            fontSize: '0.875rem',
            fontWeight: '600',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ebcdba';
            e.currentTarget.style.backgroundColor = 'rgba(75, 39, 118, 0.4)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(235, 205, 186, 0.4)';
            e.currentTarget.style.backgroundColor = 'rgba(75, 39, 118, 0.15)';
            e.currentTarget.style.color = '#dedbef';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>{pill.icon}</span>
          <span>{pill.label}</span>
        </div>
      ))}
    </div>
  );
}
