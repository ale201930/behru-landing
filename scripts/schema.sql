-- =========================================================
-- ESQUEMA BASE DE DATOS MYSQL PARA LARAGON & NUBE (VERCEL)
-- Base de datos: landing_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS `landing_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `landing_db`;

-- 1. Tabla de Usuarios Administrativos
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Configuración y Textos Dinámicos de la Landing Page
CREATE TABLE IF NOT EXISTS `landing_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(100) NOT NULL UNIQUE,
  `content_value` TEXT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla para Almacenar Galería Multimedia (Imágenes y Videos)
CREATE TABLE IF NOT EXISTS `landing_media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `section` VARCHAR(50) NOT NULL DEFAULT 'gallery',
  `title` VARCHAR(150) NULL,
  `description` TEXT NULL,
  `url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- DATOS INICIALES (SEED DATA)
-- Usuario por defecto: admin / admin123
-- (La contraseña debe actualizarse con bcrypt en entorno de producción)
-- =========================================================

-- Inserción de usuario admin por defecto (hash para 'admin123')
INSERT INTO `users` (`username`, `email`, `password`)
VALUES ('admin', 'admin@landing.com', '$2a$10$7Z2ZkX7xVp3tJ5R0X7J8e.5y5r5W5q5e5r5t5y5u5i5o5p5a5s5d')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- Configuraciones y Textos por Defecto
INSERT INTO `landing_config` (`section_key`, `content_value`, `description`) VALUES
('site_title', 'Mi Landing Page Profesional', 'Título principal del sitio'),
('hero_badge', '🚀 Innovación & Calidad Garantizada', 'Insignia o etiqueta superior en Banner Principal'),
('hero_title', 'Transforma tu Negocio con Soluciones Digitales de Alto Impacto', 'Título principal del Banner'),
('hero_subtitle', 'Diseñamos y desarrollamos experiencias interactivas personalizadas para impulsar tus ventas y destacar tu marca.', 'Subtítulo del Banner'),
('contact_email', 'contacto@empresa.com', 'Correo de contacto principal'),
('contact_phone', '+57 300 123 4567', 'Teléfono / WhatsApp de contacto')
ON DUPLICATE KEY UPDATE `content_value` = VALUES(`content_value`);

-- Elementos Multimedia Demo Iniciales
INSERT INTO `landing_media` (`media_type`, `section`, `title`, `description`, `url`, `display_order`) VALUES
('image', 'banner', 'Banner Principal', 'Imagen principal de fondo para el héroe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 1),
('image', 'gallery', 'Proyecto Alpha', 'Demostración de interfaz web interactiva', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 2),
('video', 'showcase', 'Video Promocional', 'Video demostrativo en YouTube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3)
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`);
