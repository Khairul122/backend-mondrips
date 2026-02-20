-- D1 Database Schema for Cloudflare Workers
-- Database: db_mondrips

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id_user INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER NOT NULL DEFAULT 1,
  remember_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_remember_token ON users(remember_token);
CREATE INDEX IF NOT EXISTS idx_is_active ON users(is_active);

-- Trigger for updated_at on users
CREATE TRIGGER IF NOT EXISTS users_updated_at 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id_user = NEW.id_user;
END;

-- Sosial Media Table
CREATE TABLE IF NOT EXISTS sosial_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_user INTEGER NOT NULL,
  nama_platform TEXT NOT NULL,
  username_path TEXT NOT NULL,
  icon_class TEXT,
  link_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_id_user_sosmed ON sosial_media(id_user);
CREATE INDEX IF NOT EXISTS idx_nama_platform ON sosial_media(nama_platform);

-- Trigger for updated_at on sosial_media
CREATE TRIGGER IF NOT EXISTS sosial_media_updated_at 
AFTER UPDATE ON sosial_media
BEGIN
  UPDATE sosial_media SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Collaboration Sliders Table
CREATE TABLE IF NOT EXISTS collaboration_sliders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_path TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_user INTEGER NOT NULL,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_id_user_sliders ON collaboration_sliders(id_user);
CREATE INDEX IF NOT EXISTS idx_display_order ON collaboration_sliders(display_order);
CREATE INDEX IF NOT EXISTS idx_is_active ON collaboration_sliders(is_active);

-- Trigger for updated_at on collaboration_sliders
CREATE TRIGGER IF NOT EXISTS collaboration_sliders_updated_at 
AFTER UPDATE ON collaboration_sliders
BEGIN
  UPDATE collaboration_sliders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
