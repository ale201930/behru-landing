import Header from '@/components/Header';
import CustomCursor from '@/components/CustomCursor';
import FaqAccordion from '@/components/FaqAccordion';
import PortfolioCarousel from '@/components/PortfolioCarousel';
import VideoShowcase from '@/components/VideoShowcase';
import PaymentLogos from '@/components/PaymentLogos';
import ValuePropositionsGrid from '@/components/ValuePropositionsGrid';
import HeroScrollingCards from '@/components/HeroScrollingCards';
import PeopleShowcase from '@/components/PeopleShowcase';
import { getLandingContent } from '@/lib/content';

export const revalidate = 0;

export default async function HomePage() {
  const { config, media } = await getLandingContent();

  const portfolioEdits = media.filter(
    (m) =>
      (m.media_type === 'image' || m.section === 'gallery' || m.section === 'portfolio_cards') &&
      m.section !== 'people' &&
      m.section !== 'collaborators' &&
      m.section !== 'hero_strip' &&
      m.section !== 'showcase'
  );
  const videoEdits = media.filter(
    (m) =>
      (m.media_type === 'video' || m.section === 'showcase') &&
      m.section !== 'people' &&
      m.section !== 'collaborators' &&
      m.section !== 'hero_strip'
  );
  const peopleMedia = media.filter((m) => m.section === 'people' || m.section === 'collaborators');
  const heroStripMedia = media.filter((m) => m.section === 'hero_strip');
  const heroStripImages = (
    heroStripMedia.length > 0
      ? heroStripMedia
      : media.filter(
          (m) =>
            (m.section === 'gallery' || m.section === 'portfolio_cards') &&
            m.section !== 'people' &&
            m.section !== 'collaborators'
        )
  )
    .map((m) => m.url)
    .filter(Boolean);

  return (
    <div style={{ backgroundColor: '#121016', color: '#ffffff', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <CustomCursor />
      <div className="fijo-blur" />

      {/* Header público de BeHRU */}
      <Header siteTitle="BenRU" />

      {/* 1. HERO SECTION */}
      <section id="inicio" className="hero-section">
        {/* Imagen de Ruben — prominente, nítida, lado derecho-centro */}
        <div className="hero-portrait-wrapper">
          <img
            src="/images/ruben_portrait.webp"
            alt="Ruben Torrealba BeHRU"
            className="hero-portrait-img"
          />
          {/* Degradado izquierdo para legibilidad del texto */}
          <div className="hero-portrait-shadow" />
        </div>

        {/* Glow morado ambiental */}
        <div className="hero-purple-glow" />

        {/* Columna izquierda: título, subtítulo, badge y CTA */}
        <div className="hero-content-col">
          <h1 className="hero-title">
            {config.hero_title || "Transforma tu negocio con soluciones digitales de Alto Impacto"}
          </h1>

          <p className="hero-subtitle">
            {config.hero_subtitle || "Diseñamos y desarrollamos experiencias interactivas personalizadas para impulsar tus ventas y destacar tu marca."}
          </p>

          <p className="hero-badge-text">
            {config.hero_badge_text || "Solo para infoproductores que buscan calidad superior"}
          </p>

          <div className="hero-cta-wrapper">
            <a
              href={`https://wa.me/${config.whatsapp_phone || '573000000000'}?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20proyecto`}
              target="_blank"
              rel="noreferrer"
              className="btn-behru hero-cta-btn"
            >
              {config.hero_cta_text || "Cotizar mi proyecto"}
            </a>
          </div>
        </div>

        {/* Tira de cards derecha — carrusel vertical infinito */}
        <HeroScrollingCards images={heroStripImages} />
      </section>

      {/* 2. SECTION 2: PORTFOLIO SHOWCASE */}
      <section id="proyectos" style={{
        background: 'linear-gradient(180deg, #121016 0%, #2c1646 50%, #121016 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(235, 205, 186, 0.15)',
        borderBottom: '1px solid rgba(235, 205, 186, 0.15)'
      }}>
        {/* A. Carrusel de Personas / Colaboradores (Estilo Jhonny Lubo) */}
        <PeopleShowcase initialItems={peopleMedia} />

        {/* B. Encabezado Original de las Fotos / Trabajos de Diseño */}
        <div style={{ maxWidth: '900px', margin: '3.5rem auto 2.5rem auto', paddingTop: '2.5rem', borderTop: '1px dashed rgba(235, 205, 186, 0.2)' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Tu diseño determina la percepción.<br />
            <span style={{ color: '#ebcdba' }}>Y la percepción, las ventas.</span>
          </h2>

          <p style={{ color: '#dedbef', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '780px', margin: '0 auto' }}>
            Grandes infoproductores confían en mí para elevar sus conversiones.<br />
            La razón es sencilla: entienden que el diseño no es decoración, sino percepción.<br />
            Quiero que conozcas algunas de mis creaciones y expertos con los que he tenido la oportunidad de colaborar.
          </p>
        </div>

        {/* Carrusel Interactivo de Fotos / Diseños */}
        <div style={{ marginBottom: '5rem' }}>
          <PortfolioCarousel initialItems={portfolioEdits} />
        </div>

        {/* C. Encabezado Exclusivo para la Sección de Edits de Video */}
        <div style={{ maxWidth: '900px', margin: '0 auto 2.5rem auto', paddingTop: '2.5rem', borderTop: '1px dashed rgba(235, 205, 186, 0.2)' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}>
            Edición de Video de <span style={{ color: '#ebcdba' }}>Alto Impacto</span>
          </h2>
          <p style={{ color: '#dedbef', fontSize: '1rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            Videos diseñados con retención, ritmo y animaciones personalizadas para captar la atención de tu audiencia desde el primer segundo.
          </p>
        </div>

        {/* Sección de Demostración de Video Edits Dinámicos */}
        <VideoShowcase initialVideos={videoEdits} />

        {/* Botón CTA Cotizar Mi Proyecto con Espaciado Destacado */}
        <div style={{ marginTop: '4.5rem', marginBottom: '1.5rem' }}>
          <a
            href="https://wa.me/573000000000?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20proyecto"
            target="_blank"
            rel="noreferrer"
            className="btn-behru"
            style={{
              padding: '1.1rem 3rem',
              fontSize: '1.05rem',
              boxShadow: '0 12px 35px rgba(235, 205, 186, 0.45)'
            }}
          >
            Cotizar mi proyecto
          </a>
        </div>
      </section>

      {/* 3. SECTION 3: 5 STARS & 4 VALUE PROPOSITIONS */}
      <section id="beneficios" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            {/* 5 Estrellas Doradas Resaltadas */}
            <div style={{
              color: '#ffc107',
              fontSize: '2.5rem',
              letterSpacing: '0.4rem',
              marginBottom: '1.25rem',
              filter: 'drop-shadow(0 0 15px rgba(255, 193, 7, 0.45))'
            }}>
              ★★★★★
            </div>

            <p style={{
              fontSize: '1.15rem',
              color: '#ffffff',
              fontWeight: '700',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-open-sauce), sans-serif'
            }}>
              Lo visual se convierte en decisión
            </p>

            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: '900',
              fontFamily: 'var(--font-open-sauce), sans-serif',
              marginBottom: '1rem',
              lineHeight: 1.2,
              color: '#ffffff'
            }}>
              La decisión <span style={{ color: '#ebcdba' }}>se convierte en resultados.</span>
            </h2>

            <p style={{
              color: '#dedbef',
              fontSize: '1.05rem',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontFamily: 'var(--font-open-sauce), sans-serif'
            }}>
              Así es como colaborar conmigo marca la diferencia y mejora tus resultados.
            </p>
          </div>

          {/* Grilla de 4 Tarjetas de Propuesta de Valor estilo Figma */}
          <ValuePropositionsGrid />
        </div>
      </section>
      <section style={{
        background: 'linear-gradient(180deg, #121016 0%, #2c1646 50%, #121016 100%)',
        padding: '6rem 2rem',
        borderTop: '1px solid rgba(235, 205, 186, 0.15)',
        borderBottom: '1px solid rgba(235, 205, 186, 0.15)',
        overflow: 'hidden'
      }}>
        <div className="grid-2col">
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', lineHeight: 1.15 }}>
              Colaboración efectiva,<br />
              <span style={{ color: '#ebcdba' }}>resultados inevitables</span>
            </h2>
            <p style={{ color: '#dedbef', fontSize: '1rem', marginBottom: '2.5rem' }}>
              Claridad desde el inicio hasta la entrega. El acuerdo y la entrega de tu proyecto en 5 pasos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.12)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>Acuerdo directo</h4>
                <p style={{ fontSize: '0.9rem', color: '#dedbef', margin: 0, lineHeight: 1.5 }}>
                  Definimos exactamente lo que necesitas, tiempos y precio, recursos que debes enviarnos, sin complicaciones innecesarias.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.12)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>Comodidad en cada pago</h4>
                <p style={{ fontSize: '0.9rem', color: '#dedbef', margin: 0, lineHeight: 1.5 }}>
                  Puedes usar Visa, MasterCard o USDT. Pagas 50% al iniciar, 50% al entregar.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.12)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>Revisión estratégica</h4>
                <p style={{ fontSize: '0.9rem', color: '#dedbef', margin: 0, lineHeight: 1.5 }}>
                  Recibes una propuesta inicial que incluye 1 revisión para ajustes precisos.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.12)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>Implementación responsive</h4>
                <p style={{ fontSize: '0.9rem', color: '#dedbef', margin: 0, lineHeight: 1.5 }}>
                  Montaje del diseño aprobado y optimización de carga para cada dispositivo que incluye 1 revisión para ajustes precisos.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.12)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>Entrega de recursos</h4>
                <p style={{ fontSize: '0.9rem', color: '#dedbef', margin: 0, lineHeight: 1.5 }}>
                  Concluimos cuando recibes todos los recursos utilizados en alta calidad y formatos optimizados.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${config.whatsapp_phone || '573000000000'}?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20landing`}
              target="_blank"
              rel="noreferrer"
              className="btn-behru"
              style={{
                padding: '0.95rem 2.5rem',
                fontSize: '0.95rem',
                fontWeight: '800',
                borderRadius: '9999px',
                boxShadow: '0 12px 30px rgba(235, 205, 186, 0.4)'
              }}
            >
              Cotizar mi Landing
            </a>
          </div>

          {/* Composición Gráfica: Isotipo (Fondo) + Landing Mockup (Frente) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '480px'
          }}>
            {/* Isotipo en Forma de B (Fondo Suave detrás de la Laptop) */}
            <img
              src="/images/isotipo.png"
              alt="Isotipo BenRU"
              style={{
                position: 'absolute',
                width: '85%',
                maxWidth: '450px',
                right: '-2%',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.55,
                zIndex: 0,
                pointerEvents: 'none',
                imageRendering: 'high-quality',
                filter: 'drop-shadow(0 0 25px rgba(235, 205, 186, 0.15))'
              }}
            />

            {/* Mockup Principal de Dispositivos (Laptop + Smartphones) */}
            <img
              src="/images/landing.webp"
              alt="Dispositivos Landing BenRU"
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '580px',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.85))',
                imageRendering: 'high-quality'
              }}
            />
          </div>
        </div>
      </section>

      {/* 5. SECTION 5: PRICING CARD ($360 USD) */}
      <section id="paquetes" style={{
        padding: '6rem 2rem',
        borderBottom: '1px solid rgba(235, 205, 186, 0.15)'
      }}>
        <div className="grid-2col pricing-grid">
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', lineHeight: 1.2 }}>
              Un paquete diseñado para infoproductores que buscan <span style={{ color: '#ebcdba' }}>calidad superior</span>.
            </h2>
            <p style={{ color: '#dedbef', fontSize: '1rem', marginBottom: '2rem' }}>
              Todo lo esencial para potenciar la percepción y conversión de tu negocio.
            </p>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ffffff' }}>
              Lo que incluye mi servicio:
            </h4>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: '#dedbef', fontSize: '0.95rem', padding: 0 }}>
              <li>→ Investigación de mercado clave</li>
              <li>→ Estructura de contenido eficaz</li>
              <li>→ Prototipo estratégico inicial</li>
              <li>→ Implementación responsive a medida</li>
              <li>→ Desarrollo técnico completo</li>
              <li>→ Velocidad de carga excepcional</li>
              <li>→ Integración simple hosting/dominio</li>
              <li>→ Entrega de archivos optimizados y en alta resolución</li>
              <li>→ Comunicación persuasiva (opcional)</li>
            </ul>
          </div>

          {/* Pricing Box (Tarjeta Derecha en Morado Destacado) */}
          <div className="behru-card" style={{
            padding: '3rem 2.5rem',
            textAlign: 'center',
            background: 'linear-gradient(145deg, #4b2776 0%, #221237 100%)',
            border: '2px solid #ebcdba',
            boxShadow: '0 25px 60px rgba(75, 39, 118, 0.8), 0 0 30px rgba(235, 205, 186, 0.25)'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#dedbef',
              border: '1px solid rgba(222, 219, 239, 0.35)',
              padding: '0.45rem 1.4rem',
              borderRadius: '999px',
              display: 'inline-block',
              marginBottom: '1.5rem'
            }}>
              Valor por Landing Page
            </span>

            <div style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              color: '#ffffff',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              {config.price_amount || '$ 360 USD'}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#dedbef', marginBottom: '1.5rem', maxWidth: '280px', margin: '0 auto 1.5rem auto', opacity: 0.9 }}>
              {config.price_subtitle || '(Ajustado según complejidad, cantidad y tamaño de páginas)'}
            </p>

            {/* Línea Divisora Horizontal Fina */}
            <div style={{ borderBottom: '1px solid rgba(222, 219, 239, 0.15)', margin: '1.5rem 0 2rem 0' }} />

            <a
              href={`https://wa.me/${config.whatsapp_phone || '573000000000'}?text=Hola%20Ruben,%20quiero%20cotizar%20mi%20paquete`}
              target="_blank"
              rel="noreferrer"
              className="btn-behru"
              style={{ width: '100%', marginBottom: '1.75rem' }}
            >
              Quiero cotizar mi proyecto
            </a>

            {/* Componente de Logotipos de Pago Profesionales (PayPal, Binance, VISA) */}
            <PaymentLogos />
          </div>
        </div>
      </section>

      {/* 6. SECTION 6: ABOUT RUBEN TORREALBA (Foto ajustada ligeramente más pequeña) */}
      <section className="about-section" style={{
        borderTop: '1px solid rgba(235, 205, 186, 0.15)',
        borderBottom: '1px solid rgba(235, 205, 186, 0.15)',
        backgroundColor: '#121016'
      }}>
        {/* Imagen de Fondo Completa Ajustada Ligeramente Más Pequeña */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <img
            src="/images/Para landing 2.png"
            alt="Soy Ruben Torrealba BeHRU"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'right center',
              display: 'block',
              imageRendering: 'high-quality'
            }}
          />
        </div>

        {/* Contenido de Texto a la Izquierda sobre el lado oscuro de la imagen */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '620px' }}>
          <h2 style={{
            fontSize: 'clamp(2.1rem, 3.8vw, 3rem)',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '1.75rem',
            lineHeight: 1.2,
            color: '#ffffff'
          }}>
            Soy <span style={{ color: '#ebcdba' }}>Ruben Torrealba</span>, diseñador especializado en <span style={{ color: '#ebcdba' }}>landing pages y diseño para redes sociales</span>
          </h2>

          <p style={{ color: '#dedbef', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Mis 7 cafés diarios son solo el combustible que impulsa mi obsesión por el diseño de landing pages.
          </p>

          <p style={{ color: '#dedbef', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Después de muchos proyectos de landing pages y diseño para redes sociales, aprendí algo simple pero poderoso:
          </p>

          <p style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            La percepción lo es todo.
          </p>

          <p style={{ color: '#dedbef', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            Tu producto puede ser excepcional, pero la verdadera influencia está en cómo lo presentas al mundo.
          </p>

          <blockquote style={{
            color: '#ebcdba',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            fontWeight: '600',
            lineHeight: 1.6,
            borderLeft: '4px solid #ebcdba',
            paddingLeft: '1.25rem',
            margin: 0
          }}>
            {config.about_quote || '«No vendes solo tu producto; vendes la percepción de valor que lo rodea. Ahí comienza el éxito real».'}
          </blockquote>
        </div>
      </section>

      {/* 7. SECTION 7: FAQS ACCORDION */}
      <section id="faq" className="faq-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem' }}>
            Respuestas claras a <span style={{ color: '#ebcdba' }}>preguntas esenciales</span>
          </h2>
          <p style={{ color: '#dedbef', fontSize: '1rem' }}>
            Conoce cómo trabajo, qué esperar y por qué confiarme tu proyecto es una decisión acertada.
          </p>
        </div>

        {/* Componente Interactivo de Acordeón */}
        <FaqAccordion />
      </section>

      {/* 8. FOOTER */}
      <footer style={{
        backgroundColor: '#121016',
        borderTop: '1px solid rgba(235, 205, 186, 0.15)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        color: '#dedbef',
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/images/logo_hero.png"
            alt="BenRU Logo"
            style={{
              height: '65px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              imageRendering: 'high-quality',
            }}
          />
        </div>
        <p style={{ marginBottom: '0.5rem', color: '#dedbef' }}>Todos los Derechos Reservados.</p>
        <p style={{ fontWeight: '700', color: '#ebcdba' }}>Ruben Torrealba 2026</p>
      </footer>
    </div>
  );
}
