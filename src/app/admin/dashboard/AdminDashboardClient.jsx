'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateLandingConfig, saveMediaItem, deleteMediaItem } from '@/app/actions/contentActions';

export default function AdminDashboardClient({ initialConfig, initialMedia, user }) {
  const [config, setConfig] = useState(initialConfig);
  const [mediaList, setMediaList] = useState(initialMedia);
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'videos' | 'config'
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (initialMedia) {
      setMediaList(initialMedia);
    }
  }, [initialMedia]);

  // Formulario para Imagen
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

  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  // Función genérica para subir archivo desde la PC o Móvil
  const handleFileUpload = async (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setMessage('⏳ Subiendo archivo desde tu dispositivo...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.url) {
        if (formType === 'image') {
          setImageForm(prev => ({ ...prev, url: data.url }));
        } else if (formType === 'video') {
          setVideoForm(prev => ({ ...prev, url: data.url }));
        } else if (formType === 'thumbnail') {
          setVideoForm(prev => ({ ...prev, thumbnail: data.url }));
        } else if (formType === 'hero_preview_1') {
          setConfig(prev => ({ ...prev, hero_preview_img_1: data.url }));
        } else if (formType === 'hero_preview_2') {
          setConfig(prev => ({ ...prev, hero_preview_img_2: data.url }));
        } else if (formType === 'hero_preview_3') {
          setConfig(prev => ({ ...prev, hero_preview_img_3: data.url }));
        }
        setMessage(`✅ Archivo subido con éxito: ${file.name}`);
      } else {
        setMessage('❌ Error al subir archivo: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      setMessage('❌ Error al subir archivo: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage('');
    try {
      await updateLandingConfig(config);
      setMessage('✅ Textos de la landing guardados correctamente');
    } catch (err) {
      setMessage('❌ Error guardando textos: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageForm.url) return;
    setMessage('');
    try {
      const res = await saveMediaItem(imageForm);
      if (res?.item) {
        setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      }
      setMessage('✅ Imagen del portafolio publicada correctamente');
      setImageForm({ title: '', description: '', url: '', media_type: 'image', section: 'gallery' });
      router.refresh();
    } catch (err) {
      setMessage('❌ Error guardando imagen: ' + err.message);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.url) return;
    setMessage('');
    try {
      const res = await saveMediaItem(videoForm);
      if (res?.item) {
        setMediaList(prev => [...prev.filter(m => m.id !== res.item.id), res.item]);
      }
      setMessage('✅ Edit de Video publicado correctamente');
      setVideoForm({ title: '', description: '', url: '', thumbnail: '', media_type: 'video', section: 'showcase' });
      router.refresh();
    } catch (err) {
      setMessage('❌ Error guardando video: ' + err.message);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este recurso?')) return;
    try {
      await deleteMediaItem(id);
      setMediaList(mediaList.filter(m => m.id !== id));
      setMessage('✅ Recurso eliminado de la landing');
    } catch (err) {
      setMessage('❌ Error eliminando: ' + err.message);
    }
  };

  const imagesList = mediaList.filter(m => m.media_type === 'image' || m.section === 'gallery' || m.section === 'portfolio_cards');
  const videosList = mediaList.filter(m => m.media_type === 'video' || m.section === 'showcase');

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: 'var(--font-open-sauce)' }}>
      
      {/* Top Header Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(235, 205, 186, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/images/logo_header.png" alt="BenRU Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain', imageRendering: 'high-quality' }} />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: '#ffffff', fontFamily: 'var(--font-open-sauce)' }}>
              Panel Administrador <span style={{ color: '#ebcdba' }}>BeHRU</span>
            </h1>
            <p style={{ color: '#dedbef', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Suba archivos directamente desde su PC o dispositivo móvil para alimentar la Landing Page.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <a
            href="/"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              backgroundColor: '#4b2776',
              border: '1px solid #ebcdba',
              color: '#ebcdba',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(75, 39, 118, 0.6)'
            }}
          >
            👁️ Ver Landing Page
          </a>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

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

      {/* Tabs de Navegación del Administrador */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('images')}
          style={{
            padding: '0.85rem 1.75rem',
            borderRadius: '12px',
            border: activeTab === 'images' ? '2px solid #ebcdba' : '1px solid rgba(255,255,255,0.1)',
            backgroundColor: activeTab === 'images' ? '#4b2776' : '#1e293b',
            color: activeTab === 'images' ? '#ebcdba' : '#dedbef',
            fontSize: '1rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'images' ? '0 10px 25px rgba(75, 39, 118, 0.8)' : 'none'
          }}
        >
          🖼️ Imágenes del Portafolio ({imagesList.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '0.85rem 1.75rem',
            borderRadius: '12px',
            border: activeTab === 'videos' ? '2px solid #ebcdba' : '1px solid rgba(255,255,255,0.1)',
            backgroundColor: activeTab === 'videos' ? '#4b2776' : '#1e293b',
            color: activeTab === 'videos' ? '#ebcdba' : '#dedbef',
            fontSize: '1rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'videos' ? '0 10px 25px rgba(75, 39, 118, 0.8)' : 'none'
          }}
        >
          🎬 Edits de Video ({videosList.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          style={{
            padding: '0.85rem 1.75rem',
            borderRadius: '12px',
            border: activeTab === 'config' ? '2px solid #ebcdba' : '1px solid rgba(255,255,255,0.1)',
            backgroundColor: activeTab === 'config' ? '#4b2776' : '#1e293b',
            color: activeTab === 'config' ? '#ebcdba' : '#dedbef',
            fontSize: '1rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'config' ? '0 10px 25px rgba(75, 39, 118, 0.8)' : 'none'
          }}
        >
          📝 Textos de la Landing
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑA 1: IMÁGENES */}
      {activeTab === 'images' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem' }}>
          {/* Formulario Subir Imagen desde PC/Móvil o URL */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba' }}>
              🖼️ Subir Nueva Imagen al Portafolio
            </h2>

            <form onSubmit={handleAddImage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Título del Edit / Imagen
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Promo Red & Black / Edit Especial"
                  value={imageForm.title}
                  onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Descripción / Categoría
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diseño de Impacto / Edición Deportiva"
                  value={imageForm.description}
                  onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              {/* OPCIÓN 1: SUBIR ARCHIVO DESDE LA PC O MÓVIL */}
              <div style={{
                backgroundColor: 'rgba(75, 39, 118, 0.35)',
                padding: '1.15rem',
                borderRadius: '12px',
                border: '1px dashed #ebcdba',
                textAlign: 'center'
              }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#ebcdba', marginBottom: '0.6rem', fontWeight: '800' }}>
                  📁 Cargar Archivo desde mi PC / Teléfono
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  disabled={uploadingFile}
                  style={{ color: '#dedbef', fontSize: '0.85rem' }}
                />
              </div>

              {/* OPCIÓN 2: ENLACE O URL DIRECTO */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  O ingresa URL / Ruta del Archivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... o /uploads/..."
                  value={imageForm.url}
                  onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={uploadingFile}
                style={{
                  padding: '0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#4b2776',
                  color: '#ebcdba',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                }}
              >
                + Publicar Imagen en la Landing
              </button>
            </form>
          </div>

          {/* Lista de Imágenes Actuales */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff' }}>
              Galería de Imágenes Activas en la Landing ({imagesList.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {imagesList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay imágenes personalizadas cargadas aún. Se muestran las demos por defecto.</p>
              ) : (
                imagesList.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backgroundColor: '#0f172a',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #334155'
                  }}>
                    <img src={item.url} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ebcdba' }} />

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#ffffff', fontSize: '0.95rem', fontWeight: '800' }}>{item.title || 'Sin Título'}</h4>
                      <p style={{ margin: '0 0 0.2rem 0', color: '#ebcdba', fontSize: '0.75rem', fontWeight: '700' }}>{item.description || 'Diseño BeHRU'}</p>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.8rem'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 2: EDITS DE VIDEO */}
      {activeTab === 'videos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem' }}>
          {/* Formulario Subir Video desde PC/Móvil o URL */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba' }}>
              🎬 Subir / Agregar Edit de Video
            </h2>

            <form onSubmit={handleAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Título del Edit de Video
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Video Edit Showreel / Reel Promocional"
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
                  placeholder="Ej: Edición Dinámica en Alta Definición"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              {/* OPCIÓN 1: SUBIR ARCHIVO VIDEO O MP4 DESDE PC O MÓVIL */}
              <div style={{
                backgroundColor: 'rgba(75, 39, 118, 0.35)',
                padding: '1.15rem',
                borderRadius: '12px',
                border: '1px dashed #ebcdba',
                textAlign: 'center'
              }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#ebcdba', marginBottom: '0.6rem', fontWeight: '800' }}>
                  📁 Cargar Archivo de Video (MP4) desde mi PC / Teléfono
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  disabled={uploadingFile}
                  style={{ color: '#dedbef', fontSize: '0.85rem' }}
                />
              </div>

              {/* OPCIÓN 2: ENLACE O URL DE VIDEO DIRECTO */}
              <div>
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

              {/* OPCIÓN 3: IMAGEN DE PORTADA / CARÁTULA DEL VIDEO (OPCIONAL) */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #334155'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#ebcdba', marginBottom: '0.4rem', fontWeight: '700' }}>
                  🖼️ Imagen de Portada / Carátula del Video (Opcional)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    disabled={uploadingFile}
                    style={{ color: '#dedbef', fontSize: '0.8rem', flex: 1 }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="O pega URL de imagen de portada (opcional)"
                  value={videoForm.thumbnail}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', marginTop: '0.5rem', fontSize: '0.8rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={uploadingFile}
                style={{
                  padding: '0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#4b2776',
                  color: '#ebcdba',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 8px 20px rgba(75, 39, 118, 0.7)'
                }}
              >
                + Publicar Video Edit en la Landing
              </button>
            </form>
          </div>

          {/* Lista de Videos Actuales */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff' }}>
              Edits de Video Activos en la Landing ({videosList.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {videosList.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay videos personalizados cargados aún. Se muestran las demos en la landing.</p>
              ) : (
                videosList.map((item) => {
                  const thumb = item.thumbnail || item.thumbnail_url;
                  return (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      backgroundColor: '#0f172a',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #334155'
                    }}>
                      <div style={{
                        width: '70px',
                        height: '50px',
                        backgroundColor: '#28173f',
                        borderRadius: '8px',
                        border: '1px solid #ebcdba',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {thumb ? (
                          <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : typeof item.url === 'string' && item.url.includes('.mp4') ? (
                          <video src={`${item.url}#t=0.5`} preload="metadata" muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1.25rem' }}>🎬</span>
                        )}
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h4 style={{ margin: '0 0 0.2rem 0', color: '#ffffff', fontSize: '0.95rem', fontWeight: '800' }}>{item.title || 'Video Edit'}</h4>
                        <p style={{ margin: '0 0 0.2rem 0', color: '#ebcdba', fontSize: '0.75rem', fontWeight: '700' }}>{item.description || 'Edición de Video'}</p>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                      </div>

                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 3: CONFIGURACIÓN DE LA LANDING Y FOTOS DE INICIO */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* SECCIÓN A: FOTOS PEQUEÑAS DE PREVISUALIZACIÓN DEL INICIO (HERO) */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ebcdba' }}>
                📸 Fotos Pequeñas del Inicio (Hero)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Suba o cambie las 3 imágenes pequeñas que aparecen debajo del título principal en el inicio.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {/* Foto Pequeña 1 */}
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Foto Pequeña 1
                  </label>
                  {config.hero_preview_img_1 && (
                    <img
                      src={config.hero_preview_img_1}
                      alt="Previsualización 1"
                      style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ebcdba', margin: '0 auto 0.75rem auto', display: 'block' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'hero_preview_1')}
                    disabled={uploadingFile}
                    style={{ color: '#dedbef', fontSize: '0.75rem', width: '100%', marginBottom: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="URL de imagen 1"
                    value={config.hero_preview_img_1 || ''}
                    onChange={(e) => setConfig({ ...config, hero_preview_img_1: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Foto Pequeña 2 */}
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Foto Pequeña 2
                  </label>
                  {config.hero_preview_img_2 && (
                    <img
                      src={config.hero_preview_img_2}
                      alt="Previsualización 2"
                      style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ebcdba', margin: '0 auto 0.75rem auto', display: 'block' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'hero_preview_2')}
                    disabled={uploadingFile}
                    style={{ color: '#dedbef', fontSize: '0.75rem', width: '100%', marginBottom: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="URL de imagen 2"
                    value={config.hero_preview_img_2 || ''}
                    onChange={(e) => setConfig({ ...config, hero_preview_img_2: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Foto Pequeña 3 */}
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Foto Pequeña 3
                  </label>
                  {config.hero_preview_img_3 && (
                    <img
                      src={config.hero_preview_img_3}
                      alt="Previsualización 3"
                      style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ebcdba', margin: '0 auto 0.75rem auto', display: 'block' }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'hero_preview_3')}
                    disabled={uploadingFile}
                    style={{ color: '#dedbef', fontSize: '0.75rem', width: '100%', marginBottom: '0.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="URL de imagen 3"
                    value={config.hero_preview_img_3 || ''}
                    onChange={(e) => setConfig({ ...config, hero_preview_img_3: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN B: TEXTOS DEL BANNER PRINCIPAL (HERO) Y CONTACTO */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba' }}>
                ⚡ Banner Principal (Hero) & WhatsApp
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Título Principal del Banner
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
                    Subtítulo del Banner Principal
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
                      Texto sobre el Botón de Cotizar
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
                      Texto del Botón de Cotización
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

            {/* SECCIÓN C: TARIFAS, PRECIOS Y FRASES */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '18px', padding: '2rem', border: '1px solid rgba(235, 205, 186, 0.2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ebcdba' }}>
                💰 Tarifas, Precios & Frases Destacadas
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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
                      Nota Bajo el Precio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ajustable según complejidad..."
                      value={config.price_subtitle || ''}
                      onChange={(e) => setConfig({ ...config, price_subtitle: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Cita Destacada (Frase de Valor sobre Ruben Torrealba)
                  </label>
                  <textarea
                    rows={2}
                    value={config.about_quote || ''}
                    onChange={(e) => setConfig({ ...config, about_quote: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              style={{
                padding: '1rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#4b2776',
                color: '#ebcdba',
                fontWeight: '800',
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(75, 39, 118, 0.8), 0 0 20px rgba(235, 205, 186, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {savingConfig ? '💾 Guardando Cambios...' : '✅ Guardar Toda la Configuración de la Landing'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
