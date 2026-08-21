'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateLandingConfig, saveMediaItem, deleteMediaItem } from '@/app/actions/contentActions';
import { upload } from '@vercel/blob/client';

export default function AdminDashboardClient({ initialConfig, initialMedia, user }) {
  const [config, setConfig] = useState(initialConfig);
  const [mediaList, setMediaList] = useState(initialMedia);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'herostrip' | 'images' | 'people' | 'videos'
  const [configStep, setConfigStep] = useState(1); // 1: Hero | 2: Cita | 3: Diseños/Videos | 4: Precios | 5: FAQs
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Formulario para la tira de imágenes del Hero (hero_strip)
  const [heroStripForm, setHeroStripForm] = useState({
    title: '',
    url: '',
    media_type: 'image',
    section: 'hero_strip'
  });

  // Formulario para Personas / Colaboradores (people)
  const [peopleForm, setPeopleForm] = useState({
    title: '',
    description: '',
    url: '',
    media_type: 'image',
    section: 'people'
  });

  // Formulario para Imagen de Portafolio / Diseños
  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    url: '',
    media_type: 'image',
    section: 'gallery'
  });

  // Formulario para Video
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    media_type: 'video',
    section: 'showcase'
  });

  useEffect(() => {
    if (initialMedia) {
      setMediaList(initialMedia);
    }
  }, [initialMedia]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  // Subida de archivos al servidor con fragmentos de 2.5MB
  const handleFileUpload = async (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadProgress(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);

    setMessage(`⏳ Subiendo ${file.name} (${fileSizeMB} MB) en fragmentos seguros (0%)...`);

    try {
      const CHUNK_SIZE = 2.5 * 1024 * 1024; // 2.5 MB por fragmento (100% compatible con Vercel)
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // 1. Iniciar sesión de fragmentos
      const startFd = new FormData();
      startFd.append('action', 'start');
      startFd.append('filename', file.name);

      const startRes = await fetch('/api/upload/chunk', { method: 'POST', body: startFd });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.uploadId) {
        throw new Error(startData.error || 'Error iniciando sesión de fragmentos');
      }

      const { uploadId, safeName } = startData;

      // 2. Subir fragmentos uno a uno con avance en porcentaje real
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunkBlob = file.slice(start, end);

        const chunkFd = new FormData();
        chunkFd.append('action', 'upload_chunk');
        chunkFd.append('uploadId', uploadId);
        chunkFd.append('chunkIndex', i.toString());
        chunkFd.append('chunk', chunkBlob, `chunk_${i}`);

        const chunkRes = await fetch('/api/upload/chunk', { method: 'POST', body: chunkFd });
        if (!chunkRes.ok) {
          const chunkErr = await chunkRes.json();
          throw new Error(chunkErr.error || `Error subiendo fragmento ${i + 1}/${totalChunks}`);
        }

        const percent = Math.round(((i + 1) / totalChunks) * 85);
        setUploadProgress(percent);
        setMessage(`⏳ Transmitiendo ${file.name} (${fileSizeMB} MB) — ${i + 1}/${totalChunks} fragmentos (${percent}%)...`);
      }

      // 3. Finalizar y ensamblar partes en la nube
      setMessage(`⏳ Ensamblando ${file.name} (${fileSizeMB} MB) en la nube...`);
      const completeFd = new FormData();
      completeFd.append('action', 'complete');
      completeFd.append('uploadId', uploadId);
      completeFd.append('safeName', safeName);
      completeFd.append('totalChunks', totalChunks.toString());
      completeFd.append('mimeType', file.type || 'video/mp4');

      const completeRes = await fetch('/api/upload/chunk', { method: 'POST', body: completeFd });
      const completeData = await completeRes.json();

      if (!completeRes.ok || !completeData.url) {
        throw new Error(completeData.error || 'Error al ensamblar partes del video');
      }

      const url = completeData.url;

      if (formType === 'image') setImageForm(prev => ({ ...prev, url }));
      else if (formType === 'people') setPeopleForm(prev => ({ ...prev, url }));
      else if (formType === 'video') setVideoForm(prev => ({ ...prev, url }));
      else if (formType === 'thumbnail') setVideoForm(prev => ({ ...prev, thumbnail: url }));
      else if (formType === 'hero_strip') setHeroStripForm(prev => ({ ...prev, url }));

      setMessage(`✅ ¡${file.name} (${fileSizeMB} MB) subido y publicado con éxito!`);
      setUploadProgress(100);

    } catch (err) {
      console.error('Error al subir archivo fragmentado:', err);
      setMessage('❌ Error al subir archivo: ' + (err.message || 'Error de conexión'));
      setUploadProgress(0);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    setMessage('');
    try {
      await updateLandingConfig(config);
      setMessage('✅ Toda la configuración de la landing page fue guardada correctamente');
    } catch (err) {
      setMessage('❌ Error guardando configuración: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageForm.url) return;
    try {
      const res = await saveMediaItem(imageForm);
      if (res?.item) setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      setMessage('✅ Imagen del portafolio publicada correctamente');
      setImageForm({ title: '', description: '', url: '', media_type: 'image', section: 'gallery' });
      router.refresh();
    } catch (err) { setMessage('❌ Error guardando imagen: ' + err.message); }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.url) return;
    try {
      const res = await saveMediaItem(videoForm);
      if (res?.item) setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      setMessage('✅ Edit de Video publicado correctamente');
      setVideoForm({ title: '', description: '', url: '', thumbnail: '', media_type: 'video', section: 'showcase' });
      router.refresh();
    } catch (err) { setMessage('❌ Error guardando video: ' + err.message); }
  };

  const handleAddHeroStrip = async (e) => {
    e.preventDefault();
    if (!heroStripForm.url) return;
    try {
      const res = await saveMediaItem(heroStripForm);
      if (res?.item) setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      setMessage('✅ Imagen de la tira del Hero publicada correctamente');
      setHeroStripForm({ title: '', url: '', media_type: 'image', section: 'hero_strip' });
      router.refresh();
    } catch (err) { setMessage('❌ Error guardando imagen del hero strip: ' + err.message); }
  };

  const handleAddPeople = async (e) => {
    e.preventDefault();
    if (!peopleForm.url) return;
    try {
      const res = await saveMediaItem(peopleForm);
      if (res?.item) setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      setMessage('✅ Persona / Colaborador publicado correctamente');
      setPeopleForm({ title: '', description: '', url: '', media_type: 'image', section: 'people' });
      router.refresh();
    } catch (err) { setMessage('❌ Error guardando persona: ' + err.message); }
  };

  const handleDeleteMedia = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este recurso?')) return;
    try {
      await deleteMediaItem(id);
      setMediaList(mediaList.filter(m => m.id !== id));
      setMessage('✅ Recurso eliminado de la landing');
    } catch (err) { setMessage('❌ Error eliminando: ' + err.message); }
  };

  const imagesList = mediaList.filter(m => (m.media_type === 'image' || m.section === 'gallery' || m.section === 'portfolio_cards') && m.section !== 'hero_strip' && m.section !== 'people' && m.section !== 'collaborators');
  const videosList = mediaList.filter(m => m.media_type === 'video' || m.section === 'showcase');
  const heroStripList = mediaList.filter(m => m.section === 'hero_strip');
  const peopleList = mediaList.filter(m => m.section === 'people' || m.section === 'collaborators');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#121016',
      color: '#ffffff',
      fontFamily: 'var(--font-open-sauce), sans-serif'
    }}>
      
      {/* 1. PANEL LATERAL IZQUIERDO (SIDEBAR FIJO DE ALTURA COMPLETA) */}
      <aside style={{
        width: '275px',
        backgroundColor: '#181420',
        borderRight: '1px solid rgba(235, 205, 186, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem 1.25rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 50,
        flexShrink: 0
      }}>
        <div>
          {/* Logo del Sistema (sin redundancia de texto BeHRU) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2.5rem', padding: '0 0.5rem', alignItems: 'flex-start' }}>
            <img src="/images/logo_header.png" alt="BeHRU Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <span style={{
              fontSize: '0.675rem',
              fontWeight: '800',
              color: '#ebcdba',
              backgroundColor: '#4b2776',
              border: '1px solid rgba(235, 205, 186, 0.3)',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              letterSpacing: '0.06em'
            }}>
              PANEL ADMINISTRADOR
            </span>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => setActiveTab('config')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: '12px',
                border: activeTab === 'config' ? '1.5px solid #ebcdba' : '1px solid transparent',
                backgroundColor: activeTab === 'config' ? '#4b2776' : 'transparent',
                color: activeTab === 'config' ? '#ebcdba' : '#cbd5e1',
                fontSize: '0.925rem',
                fontWeight: activeTab === 'config' ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <span>📝 Modificar Landing</span>
            </button>

            <button
              onClick={() => setActiveTab('herostrip')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: '12px',
                border: activeTab === 'herostrip' ? '1.5px solid #ebcdba' : '1px solid transparent',
                backgroundColor: activeTab === 'herostrip' ? '#4b2776' : 'transparent',
                color: activeTab === 'herostrip' ? '#ebcdba' : '#cbd5e1',
                fontSize: '0.925rem',
                fontWeight: activeTab === 'herostrip' ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <span>🎴 Tira Hero</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(235, 205, 186, 0.2)', padding: '0.2rem 0.55rem', borderRadius: '999px', color: '#ebcdba' }}>
                {heroStripList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: '12px',
                border: activeTab === 'images' ? '1.5px solid #ebcdba' : '1px solid transparent',
                backgroundColor: activeTab === 'images' ? '#4b2776' : 'transparent',
                color: activeTab === 'images' ? '#ebcdba' : '#cbd5e1',
                fontSize: '0.925rem',
                fontWeight: activeTab === 'images' ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <span>🖼️ Diseños / Portafolio</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(235, 205, 186, 0.2)', padding: '0.2rem 0.55rem', borderRadius: '999px', color: '#ebcdba' }}>
                {imagesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: '12px',
                border: activeTab === 'people' ? '1.5px solid #ebcdba' : '1px solid transparent',
                backgroundColor: activeTab === 'people' ? '#4b2776' : 'transparent',
                color: activeTab === 'people' ? '#ebcdba' : '#cbd5e1',
                fontSize: '0.925rem',
                fontWeight: activeTab === 'people' ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <span>👥 Personas / Clientes</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(235, 205, 186, 0.2)', padding: '0.2rem 0.55rem', borderRadius: '999px', color: '#ebcdba' }}>
                {peopleList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: '12px',
                border: activeTab === 'videos' ? '1.5px solid #ebcdba' : '1px solid transparent',
                backgroundColor: activeTab === 'videos' ? '#4b2776' : 'transparent',
                color: activeTab === 'videos' ? '#ebcdba' : '#cbd5e1',
                fontSize: '0.925rem',
                fontWeight: activeTab === 'videos' ? '800' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <span>🎬 Edits de Video</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(235, 205, 186, 0.2)', padding: '0.2rem 0.55rem', borderRadius: '999px', color: '#ebcdba' }}>
                {videosList.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Botones Inferiores de Acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(235, 205, 186, 0.15)' }}>
          <a
            href="/?fromAdmin=true"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(75, 39, 118, 0.4)',
              border: '1px solid #ebcdba',
              color: '#ebcdba',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '700'
            }}
          >
            👁️ Ver Landing Page
          </a>

          {/* Botón de Cerrar Sesión con el color dorado del logotipo (#ebcdba) */}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#ebcdba',
              color: '#121016',
              fontWeight: '900',
              cursor: 'pointer',
              fontSize: '0.85rem',
              boxShadow: '0 4px 15px rgba(235, 205, 186, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.25s ease'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL CENTRADA Y SEPARADA DEL MENU */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto', backgroundColor: '#121016' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* Notificaciones / Mensajes */}
          {message && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: message.startsWith('✅') ? 'rgba(34, 197, 94, 0.2)' : message.startsWith('⏳') ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${message.startsWith('✅') ? '#22c55e' : message.startsWith('⏳') ? '#eab308' : '#ef4444'}`,
              marginBottom: '2rem',
              color: '#ffffff',
              fontWeight: '600'
            }}>
              {message}
            </div>
          )}

          {/* Barra de Progreso de Subida */}
          {uploadingFile && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#ebcdba', fontSize: '0.85rem', fontWeight: '700' }}>Subiendo archivo a la nube...</span>
                <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '800' }}>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, #4b2776, #ebcdba)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* MÓDULO 1: MODIFICAR LANDING PAGE EN PASOS SECTORIZADOS */}
          {activeTab === 'config' && (
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit, sans-serif', margin: '0 0 0.4rem 0' }}>
                  📝 Modificar Landing Page <span style={{ color: '#ebcdba' }}>Paso a Paso</span>
                </h1>
                <p style={{ color: '#dedbef', fontSize: '0.9rem', margin: 0 }}>
                  Edite libremente todo el texto de las 8 divisiones de la landing page.
                </p>
              </div>

              {/* Selector Horizontal de Pasos (Wizard Navigator - 8 Divisiones) */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {[
                  { step: 1, label: '⚡ 1. Inicio' },
                  { step: 2, label: '👥 2. Personas' },
                  { step: 3, label: '🖼️ 3. Diseños & Videos' },
                  { step: 4, label: '🌟 4. Resultados' },
                  { step: 5, label: '🤝 5. Colaboración' },
                  { step: 6, label: '💰 6. Paquetes & Tarifas' },
                  { step: 7, label: '☕ 7. Sobre Ruben' },
                  { step: 8, label: '❓ 8. FAQs & Footer' }
                ].map(s => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setConfigStep(s.step)}
                    style={{
                      padding: '0.55rem 0.95rem',
                      borderRadius: '999px',
                      border: configStep === s.step ? '1.5px solid #ebcdba' : '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: configStep === s.step ? '#4b2776' : '#181420',
                      color: configStep === s.step ? '#ebcdba' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: configStep === s.step ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* PASO 1: HERO / INICIO */}
                {configStep === 1 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      ⚡ Sección 1: Inicio (Hero Banner Principal) & WhatsApp
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título Principal del Hero
                        </label>
                        <input
                          type="text"
                          value={config.hero_title || ''}
                          onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Subtítulo del Hero
                        </label>
                        <textarea
                          rows={3}
                          value={config.hero_subtitle || ''}
                          onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Badge / Texto sobre el Botón de Cotización
                          </label>
                          <input
                            type="text"
                            value={config.hero_badge_text || ''}
                            onChange={(e) => setConfig({ ...config, hero_badge_text: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Texto del Botón CTA de Cotizar
                          </label>
                          <input
                            type="text"
                            value={config.hero_cta_text || ''}
                            onChange={(e) => setConfig({ ...config, hero_cta_text: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Número de WhatsApp para Cotizaciones (ej: 573000000000)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 573000000000"
                          value={config.whatsapp_phone || ''}
                          onChange={(e) => setConfig({ ...config, whatsapp_phone: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 2: PERSONAS QUE ESTUVIERON DESDE EL INICIO */}
                {configStep === 2 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      👥 Sección 2: Personas y Colaboradores (Nombres que estuvieron presentes...)
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título Principal de la Sección de Personas
                        </label>
                        <input
                          type="text"
                          value={config.people_section_title || ''}
                          onChange={(e) => setConfig({ ...config, people_section_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Subtítulo o Descripción de la Sección
                        </label>
                        <input
                          type="text"
                          value={config.people_section_subtitle || ''}
                          onChange={(e) => setConfig({ ...config, people_section_subtitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 3: DISEÑOS & VIDEOS */}
                {configStep === 3 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      🖼️ Sección 3: Diseños & Videos (Tu diseño determina la percepción)
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Título Sección Diseños
                          </label>
                          <input
                            type="text"
                            value={config.portfolio_title || ''}
                            onChange={(e) => setConfig({ ...config, portfolio_title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Subtítulo Sección Diseños
                          </label>
                          <input
                            type="text"
                            value={config.portfolio_subtitle || ''}
                            onChange={(e) => setConfig({ ...config, portfolio_subtitle: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Descripción Sección Diseños
                        </label>
                        <textarea
                          rows={2}
                          value={config.portfolio_description || ''}
                          onChange={(e) => setConfig({ ...config, portfolio_description: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Título Sección Videos
                          </label>
                          <input
                            type="text"
                            value={config.video_title || ''}
                            onChange={(e) => setConfig({ ...config, video_title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Subtítulo Sección Videos
                          </label>
                          <input
                            type="text"
                            value={config.video_subtitle || ''}
                            onChange={(e) => setConfig({ ...config, video_subtitle: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 4: RESULTADOS & 4 TARJETAS DE VALOR */}
                {configStep === 4 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      🌟 Sección 4: Resultados (La decisión se convierte en resultados) & 4 Tarjetas
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Texto Pre-título (sobre las 5 estrellas)
                        </label>
                        <input
                          type="text"
                          value={config.value_pretitle || ''}
                          onChange={(e) => setConfig({ ...config, value_pretitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título Principal de Resultados
                        </label>
                        <input
                          type="text"
                          value={config.value_title || ''}
                          onChange={(e) => setConfig({ ...config, value_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Subtítulo o Descripción de Resultados
                        </label>
                        <textarea
                          rows={2}
                          value={config.value_subtitle || ''}
                          onChange={(e) => setConfig({ ...config, value_subtitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* 4 Tarjetas de Propuestas de Valor */}
                      <h3 style={{ fontSize: '1rem', color: '#ebcdba', margin: '1rem 0 0.5rem 0', fontWeight: '700' }}>🎴 Las 4 Tarjetas de Propuesta de Valor:</h3>

                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '700' }}>
                            Tarjeta {num}: Título y Descripción
                          </label>
                          <input
                            type="text"
                            placeholder={`Título Tarjeta ${num}`}
                            value={config[`value_card${num}_title`] || ''}
                            onChange={(e) => setConfig({ ...config, [`value_card${num}_title`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                          <textarea
                            rows={2}
                            placeholder={`Descripción Tarjeta ${num}`}
                            value={config[`value_card${num}_desc`] || ''}
                            onChange={(e) => setConfig({ ...config, [`value_card${num}_desc`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 5: COLABORACIÓN EFECTIVA (5 PASOS DEL PROCESO) */}
                {configStep === 5 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      🤝 Sección 5: Colaboración Efectiva (Los 5 Pasos del Acuerdo)
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título Sección Colaboración
                        </label>
                        <input
                          type="text"
                          value={config.process_title || ''}
                          onChange={(e) => setConfig({ ...config, process_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Subtítulo o Descripción del Acuerdo
                        </label>
                        <textarea
                          rows={2}
                          value={config.process_subtitle || ''}
                          onChange={(e) => setConfig({ ...config, process_subtitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Los 5 Pasos del Proceso */}
                      <h3 style={{ fontSize: '1rem', color: '#ebcdba', margin: '0.5rem 0 0.25rem 0', fontWeight: '700' }}>📋 Los 5 Pasos del Acuerdo:</h3>

                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '700' }}>
                            Paso {num}: Título y Descripción
                          </label>
                          <input
                            type="text"
                            placeholder={`Título Paso ${num}`}
                            value={config[`process_step${num}_title`] || ''}
                            onChange={(e) => setConfig({ ...config, [`process_step${num}_title`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                          <textarea
                            rows={2}
                            placeholder={`Descripción Paso ${num}`}
                            value={config[`process_step${num}_desc`] || ''}
                            onChange={(e) => setConfig({ ...config, [`process_step${num}_desc`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Texto Botón Cotizar Landing
                        </label>
                        <input
                          type="text"
                          value={config.process_cta_text || ''}
                          onChange={(e) => setConfig({ ...config, process_cta_text: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 6: PAQUETE & TARIFAS */}
                {configStep === 6 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      💰 Sección 6: Paquetes, Tarifas e Inclusiones del Servicio
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título del Paquete
                        </label>
                        <input
                          type="text"
                          value={config.package_title || ''}
                          onChange={(e) => setConfig({ ...config, package_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Subtítulo o Descripción del Paquete
                        </label>
                        <input
                          type="text"
                          value={config.package_subtitle || ''}
                          onChange={(e) => setConfig({ ...config, package_subtitle: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Encabezado de la lista ("Lo que incluye mi servicio:")
                        </label>
                        <input
                          type="text"
                          value={config.package_includes_title || ''}
                          onChange={(e) => setConfig({ ...config, package_includes_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Lista de las 9 inclusiones */}
                      <h3 style={{ fontSize: '0.95rem', color: '#ebcdba', margin: '0.5rem 0 0.25rem 0', fontWeight: '700' }}>📌 Ítems Incluidos en el Paquete:</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bNum) => (
                          <div key={bNum}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                              Ítem {bNum}
                            </label>
                            <input
                              type="text"
                              value={config[`package_bullet${bNum}`] || ''}
                              onChange={(e) => setConfig({ ...config, [`package_bullet${bNum}`]: e.target.value })}
                              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                            />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Etiqueta Tarjeta (ej: Valor por Landing Page)
                          </label>
                          <input
                            type="text"
                            value={config.package_tag || ''}
                            onChange={(e) => setConfig({ ...config, package_tag: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Precio Destacado
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: $ 360 USD"
                            value={config.price_amount || ''}
                            onChange={(e) => setConfig({ ...config, price_amount: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Nota bajo el Precio
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: (Ajustado según complejidad...)"
                            value={config.price_subtitle || ''}
                            onChange={(e) => setConfig({ ...config, price_subtitle: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 7: SOBRE RUBEN TORREALBA */}
                {configStep === 7 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      ☕ Sección 7: Sobre Ruben Torrealba (Biografía & Filosofía)
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Título Principal Sobre Mí
                        </label>
                        <input
                          type="text"
                          value={config.about_title || ''}
                          onChange={(e) => setConfig({ ...config, about_title: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Párrafo 1 (ej: Mis 7 cafés diarios...)
                        </label>
                        <textarea
                          rows={2}
                          value={config.about_p1 || ''}
                          onChange={(e) => setConfig({ ...config, about_p1: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Párrafo 2 (ej: Después de muchos proyectos...)
                        </label>
                        <textarea
                          rows={2}
                          value={config.about_p2 || ''}
                          onChange={(e) => setConfig({ ...config, about_p2: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Frase Destacada ("La percepción lo es todo.")
                        </label>
                        <input
                          type="text"
                          value={config.about_highlight || ''}
                          onChange={(e) => setConfig({ ...config, about_highlight: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Párrafo 3 (ej: Tu producto puede ser excepcional...)
                        </label>
                        <textarea
                          rows={2}
                          value={config.about_p3 || ''}
                          onChange={(e) => setConfig({ ...config, about_p3: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Cita / Bloque entre comillas («No vendes solo tu producto...»)
                        </label>
                        <textarea
                          rows={3}
                          value={config.about_quote || ''}
                          onChange={(e) => setConfig({ ...config, about_quote: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 8: PREGUNTAS FRECUENTES (FAQS) & FOOTER */}
                {configStep === 8 && (
                  <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                      ❓ Sección 8: Preguntas Frecuentes (Las 6 Preguntas FAQs) & Footer
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Título Sección FAQs
                          </label>
                          <input
                            type="text"
                            value={config.faq_title || ''}
                            onChange={(e) => setConfig({ ...config, faq_title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Subtítulo Sección FAQs
                          </label>
                          <input
                            type="text"
                            value={config.faq_subtitle || ''}
                            onChange={(e) => setConfig({ ...config, faq_subtitle: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Las 6 Preguntas & Respuestas de FAQs */}
                      <h3 style={{ fontSize: '1rem', color: '#ebcdba', margin: '0.5rem 0 0.25rem 0', fontWeight: '700' }}>❓ Las 6 Preguntas y Respuestas:</h3>

                      {[1, 2, 3, 4, 5, 6].map((fNum) => (
                        <div key={fNum} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '700' }}>
                            Pregunta FAQ #{fNum}
                          </label>
                          <input
                            type="text"
                            placeholder={`Pregunta ${fNum}`}
                            value={config[`faq${fNum}_q`] || ''}
                            onChange={(e) => setConfig({ ...config, [`faq${fNum}_q`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                          <textarea
                            rows={2}
                            placeholder={`Respuesta ${fNum}`}
                            value={config[`faq${fNum}_a`] || ''}
                            onChange={(e) => setConfig({ ...config, [`faq${fNum}_a`]: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}

                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Texto de Derechos Reservados (Footer)
                        </label>
                        <input
                          type="text"
                          value={config.footer_copyright || ''}
                          onChange={(e) => setConfig({ ...config, footer_copyright: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Navegación del Wizard y Guardado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={configStep === 1}
                    onClick={() => setConfigStep(prev => Math.max(1, prev - 1))}
                    style={{
                      padding: '0.85rem 1.5rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: configStep === 1 ? 'transparent' : '#181420',
                      color: configStep === 1 ? '#64748b' : '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: configStep === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Paso Anterior
                  </button>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {configStep < 8 && (
                      <button
                        type="button"
                        onClick={() => setConfigStep(prev => Math.min(8, prev + 1))}
                        style={{
                          padding: '0.85rem 1.5rem',
                          borderRadius: '999px',
                          border: '1.5px solid #ebcdba',
                          backgroundColor: '#4b2776',
                          color: '#ebcdba',
                          fontWeight: '800',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        Siguiente Paso →
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={savingConfig}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#ebcdba',
                        color: '#121016',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(235, 205, 186, 0.45)'
                      }}
                    >
                      {savingConfig ? 'Guardando...' : '💾 Guardar Configuración'}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

        {/* MÓDULO 2: TIRA HERO */}
        {activeTab === 'herostrip' && (
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit, sans-serif', margin: '0 0 0.4rem 0' }}>
                🎴 Tira de Imágenes del <span style={{ color: '#ebcdba' }}>Hero Banner</span>
              </h1>
              <p style={{ color: '#dedbef', fontSize: '0.9rem', margin: 0 }}>
                Administre las imágenes del carrusel vertical deslizante del lado derecho del banner principal.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Formulario Agregar */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  + Agregar Imagen a la Tira Hero
                </h2>

                <form onSubmit={handleAddHeroStrip} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Título o Etiqueta Corta
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Edit VIP #1"
                      value={heroStripForm.title}
                      onChange={(e) => setHeroStripForm({ ...heroStripForm, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      O pega la URL de la Imagen
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... .jpg o .png"
                      value={heroStripForm.url}
                      onChange={(e) => setHeroStripForm({ ...heroStripForm, url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    backgroundColor: 'rgba(75, 39, 118, 0.35)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px dashed #ebcdba',
                    textAlign: 'center'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '800' }}>
                      📁 Cargar Imagen desde Dispositivo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'hero_strip')}
                      disabled={uploadingFile}
                      style={{ color: '#dedbef', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={uploadingFile}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#4b2776',
                        color: '#ebcdba',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                      }}
                    >
                      + Publicar en Tira Hero
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Activos */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  Imágenes Activas en la Tira ({heroStripList.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {heroStripList.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay imágenes personalizadas agregadas a la tira aún.</p>
                  ) : (
                    heroStripList.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        backgroundColor: '#0f172a',
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(235, 205, 186, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                          <img src={item.url} alt={item.title} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #ebcdba', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#ffffff', fontSize: '1rem', fontWeight: '800' }}>{item.title || 'Imagen Hero'}</h4>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO 3: DISEÑOS / PORTAFOLIO */}
        {activeTab === 'images' && (
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit, sans-serif', margin: '0 0 0.4rem 0' }}>
                🖼️ Portafolio de <span style={{ color: '#ebcdba' }}>Diseños y Gráficos</span>
              </h1>
              <p style={{ color: '#dedbef', fontSize: '0.9rem', margin: 0 }}>
                Cargue y gestione los trabajos de diseño exhibidos en el carrusel de creaciones.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Formulario Agregar */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  + Agregar Trabajo de Diseño
                </h2>

                <form onSubmit={handleAddImage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Título del Proyecto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Promo Red & Black"
                      value={imageForm.title}
                      onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Subtítulo o Categoría
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Dirección de Arte"
                      value={imageForm.description}
                      onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    backgroundColor: 'rgba(75, 39, 118, 0.35)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px dashed #ebcdba',
                    textAlign: 'center'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '800' }}>
                      📁 Cargar Foto desde Dispositivo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      disabled={uploadingFile}
                      style={{ color: '#dedbef', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      O pega la URL de la Foto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... .jpg o .png"
                      value={imageForm.url}
                      onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={uploadingFile}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#4b2776',
                        color: '#ebcdba',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                      }}
                    >
                      + Publicar Diseño en Portafolio
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Activos */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  Diseños Activos en la Landing ({imagesList.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {imagesList.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay imágenes personalizadas publicadas. Se muestran las demos por defecto.</p>
                  ) : (
                    imagesList.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        backgroundColor: '#0f172a',
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(235, 205, 186, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                          <img src={item.url} alt={item.title} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #ebcdba', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#ffffff', fontSize: '1rem', fontWeight: '800' }}>{item.title || 'Diseño'}</h4>
                            <p style={{ margin: '0 0 0.25rem 0', color: '#ebcdba', fontSize: '0.85rem', fontWeight: '700' }}>{item.description || 'Portafolio'}</p>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO 4: PERSONAS / CLIENTES */}
        {activeTab === 'people' && (
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit, sans-serif', margin: '0 0 0.4rem 0' }}>
                👥 Personas y <span style={{ color: '#ebcdba' }}>Colaboraciones</span>
              </h1>
              <p style={{ color: '#dedbef', fontSize: '0.9rem', margin: 0 }}>
                Administre las fotos de expertos, clientes e infoproductores con los que ha colaborado.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Formulario Agregar */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  + Agregar Persona / Colaborador
                </h2>

                <form onSubmit={handleAddPeople} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Nombre de la Persona
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Adrián Lucena"
                      value={peopleForm.title}
                      onChange={(e) => setPeopleForm({ ...peopleForm, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Especialidad / Rol
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Copywriting / Estrategia"
                      value={peopleForm.description}
                      onChange={(e) => setPeopleForm({ ...peopleForm, description: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    backgroundColor: 'rgba(75, 39, 118, 0.35)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px dashed #ebcdba',
                    textAlign: 'center'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '800' }}>
                      📁 Cargar Foto de la Persona desde Dispositivo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'people')}
                      disabled={uploadingFile}
                      style={{ color: '#dedbef', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      O pega URL de la Foto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... .jpg o .png"
                      value={peopleForm.url}
                      onChange={(e) => setPeopleForm({ ...peopleForm, url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={uploadingFile}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#4b2776',
                        color: '#ebcdba',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                      }}
                    >
                      + Publicar Persona / Colaborador
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Activos */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  Personas / Clientes Activos ({peopleList.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {peopleList.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay colaboradores personalizados agregados aún.</p>
                  ) : (
                    peopleList.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        backgroundColor: '#0f172a',
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(235, 205, 186, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                          <img src={item.url} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #ebcdba', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#ffffff', fontSize: '1rem', fontWeight: '800' }}>{item.title || 'Colaborador'}</h4>
                            <p style={{ margin: '0 0 0.25rem 0', color: '#ebcdba', fontSize: '0.85rem', fontWeight: '700' }}>{item.description || 'Especialista'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO 5: EDITS DE VIDEO */}
        {activeTab === 'videos' && (
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit, sans-serif', margin: '0 0 0.4rem 0' }}>
                🎬 Edits de <span style={{ color: '#ebcdba' }}>Video</span>
              </h1>
              <p style={{ color: '#dedbef', fontSize: '0.9rem', margin: 0 }}>
                Cargue y gestione los videos de demostración para el carrusel de edits de video.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Formulario Agregar */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  + Agregar Edit de Video
                </h2>

                <form onSubmit={handleAddVideo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Título del Video
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Showreel Edición 2026"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Descripción Corta
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Edición Dinámica de Alta Conversión"
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    backgroundColor: 'rgba(75, 39, 118, 0.35)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px dashed #ebcdba',
                    textAlign: 'center'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.5rem', fontWeight: '800' }}>
                      📁 Cargar Archivo MP4 desde PC / Teléfono
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      disabled={uploadingFile}
                      style={{ color: '#dedbef', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      O ingresa URL / Enlace (YouTube / Vimeo / MP4)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://... .mp4 o https://youtube.com/..."
                      value={videoForm.url}
                      onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{
                    gridColumn: '1 / -1',
                    backgroundColor: '#0f172a',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #334155'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.4rem', fontWeight: '700' }}>
                      🖼️ Carátula / Portada del Video (Opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'thumbnail')}
                      disabled={uploadingFile}
                      style={{ color: '#dedbef', fontSize: '0.8rem', width: '100%', marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      placeholder="O pega URL de portada (opcional)"
                      value={videoForm.thumbnail}
                      onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={uploadingFile}
                      style={{
                        padding: '0.85rem 2rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#4b2776',
                        color: '#ebcdba',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                      }}
                    >
                      + Publicar Video Edit
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Activos */}
              <div style={{ backgroundColor: '#181420', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff', borderBottom: '1px solid rgba(235, 205, 186, 0.15)', paddingBottom: '0.75rem' }}>
                  Edits de Video Activos ({videosList.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {videosList.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay videos personalizados cargados aún.</p>
                  ) : (
                    videosList.map((item) => {
                      const thumb = item.thumbnail || item.thumbnail_url;
                      return (
                        <div key={item.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1.5rem',
                          backgroundColor: '#0f172a',
                          padding: '1rem 1.25rem',
                          borderRadius: '14px',
                          border: '1px solid rgba(235, 205, 186, 0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '65px',
                              height: '55px',
                              backgroundColor: '#28173f',
                              borderRadius: '8px',
                              border: '1px solid #ebcdba',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {thumb ? (
                                <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '1.3rem' }}>🎬</span>
                              )}
                            </div>

                            <div style={{ overflow: 'hidden' }}>
                              <h4 style={{ margin: '0 0 0.25rem 0', color: '#ffffff', fontSize: '1rem', fontWeight: '800' }}>{item.title || 'Video Edit'}</h4>
                              <p style={{ margin: '0 0 0.25rem 0', color: '#ebcdba', fontSize: '0.85rem', fontWeight: '700' }}>{item.description || 'Video'}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item.id)}
                            style={{
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.65rem 1.25rem',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '800',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}
