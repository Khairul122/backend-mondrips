-- Migration: 002_create_sosial_media_table.sql
-- Database: db_mondrips

USE db_mondrips;

CREATE TABLE IF NOT EXISTS sosial_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user BIGINT UNSIGNED NOT NULL,
    nama_platform VARCHAR(50) NOT NULL,
    username_path VARCHAR(255) NOT NULL,
    icon_class VARCHAR(100) DEFAULT NULL,
    link_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_sosmed FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    INDEX idx_id_user (id_user),
    INDEX idx_nama_platform (nama_platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
