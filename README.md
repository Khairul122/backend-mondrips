# Mondrips API - Cloudflare Workers

A modern, serverless RESTful API built with **Hono Framework** (TypeScript) and deployed on **Cloudflare Workers**. This project uses **Cloudflare D1** (SQLite) for database and **Cloudflare R2** for file storage.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Deployment](#-deployment)

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe development |
| **Hono** | Ultra-lightweight web framework for Edge |
| **Cloudflare Workers** | Serverless Edge runtime |
| **Cloudflare D1** | SQLite database (serverless) |
| **Cloudflare R2** | Object storage for file uploads |
| **Web Crypto API** | Password hashing & JWT (native) |
| **Zod** | Runtime validation |
| **@hono/swagger-ui** | API documentation |

---

## ✨ Features

### Authentication Module
- **User Registration** with email/username uniqueness
- **Login** with JWT Access Token
- **Remember Me** with HTTPOnly cookies
- **Token Refresh** endpoint
- **Logout** with session invalidation
- **Password Change** with verification
- **Profile Retrieval**

### Social Media Management
- Full CRUD for social media links
- User-scoped data (One-to-Many relation)
- URL format validation
- Platform name length constraints

### Collaboration Sliders Management
- **Image Upload** to R2 Storage (JPG, JPEG, PNG, WEBP)
- **Display Order** management
- **Active/Inactive** toggle
- **Public Endpoint** for active sliders
- **Automatic File Cleanup** on delete/update
- **File Validation** (type + size limit 2MB)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Hono Application                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │   Routes   │→ │ Controllers│→ │    Services    │  │   │
│  │  └────────────┘  └────────────┘  └────────────────┘  │   │
│  │                                          ↓             │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │              Repositories (D1 SQL)              │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                      ↓                             │
│  ┌─────────────┐        ┌─────────────┐                     │
│  │  D1 (SQLite)│        │ R2 Storage  │                     │
│  └─────────────┘        └─────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Differences from Node.js Version

| Feature | Node.js Version | Workers Version |
|---------|-----------------|-----------------|
| Database | MySQL | Cloudflare D1 (SQLite) |
| File Storage | Filesystem | Cloudflare R2 |
| Password Hash | bcryptjs | Web Crypto API (SHA-256) |
| JWT | jsonwebtoken | Custom Web Crypto implementation |
| Runtime | Node.js | V8 Isolates (Edge) |

---

## 📁 Folder Structure

```
backend-mondrips/
├── src/
│   ├── config/           # D1 database wrapper
│   │   └── database.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── sosial-media.controller.ts
│   │   └── collaboration-slider.controller.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── sosial-media.service.ts
│   │   └── collaboration-slider.service.ts
│   ├── repositories/     # D1 queries
│   │   ├── user.repository.ts
│   │   ├── sosial-media.repository.ts
│   │   └── collaboration-slider.repository.ts
│   ├── models/           # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── sosial-media.model.ts
│   │   └── collaboration-slider.model.ts
│   ├── middlewares/      # Auth & CORS
│   │   ├── auth.middleware.ts
│   │   └── cors.middleware.ts
│   ├── routes/           # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── sosial-media.routes.ts
│   │   └── collaboration-slider.routes.ts
│   ├── docs/             # Swagger/OpenAPI
│   │   └── swagger.ts
│   ├── utils/            # Utilities
│   │   ├── crypto.ts     # Password hashing
│   │   ├── jwt.ts        # JWT sign/verify
│   │   └── file-upload.ts # R2 operations
│   ├── types.ts          # Type definitions
│   └── index.ts          # Entry point
├── schema.sql            # D1 database schema
├── wrangler.toml         # Workers configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .dev.vars             # Local dev variables
└── DEPLOYMENT.md         # Detailed deployment guide
```

---

## 📋 Prerequisites

```bash
# Node.js 18+ or Bun
node --version  # v18.x or higher

# Wrangler CLI
npm install -g wrangler

# Cloudflare account (free tier works)
npx wrangler login
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Create D1 Database

```bash
npx wrangler d1 create db_mondrips
# Copy the database_id from output
```

Update `wrangler.toml` with your `database_id`.

### 3. Create R2 Bucket

```bash
npx wrangler r2 bucket create mondrips-uploads
```

### 4. Run Migrations

```bash
npx wrangler d1 execute db_mondrips --file=schema.sql
```

### 5. Set Secrets

```bash
npx wrangler secret put JWT_SECRET
# Enter a random string (min 32 characters)
```

### 6. Run Locally

```bash
npx wrangler dev
```

Access at: `http://localhost:8787`

### 7. Deploy

```bash
npx wrangler deploy
```

Live at: `https://backend-mondrips.workers.dev`

---

## ⚙️ Configuration

### wrangler.toml

```toml
name = "backend-mondrips"
main = "src/index.ts"
compatibility_date = "2025-02-18"

[[d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-database-id"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "mondrips-uploads"

[vars]
JWT_EXPIRES_IN = "15m"
REMEMBER_TOKEN_EXPIRES_IN = "30d"
NODE_ENV = "production"
CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"
```

### Secrets (via CLI)

```bash
npx wrangler secret put JWT_SECRET
```

---

## 📚 API Documentation

### Interactive Docs

Access Swagger UI at:
- **Local**: `http://localhost:8787/docs`
- **Production**: `https://backend-mondrips.workers.dev/docs`

### Endpoints Overview

#### Authentication

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/refresh` | Cookie |
| POST | `/api/auth/logout` | Bearer |
| PUT | `/api/auth/change-password` | Bearer |
| GET | `/api/auth/me` | Bearer |

#### Social Media

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/sosial-media` | Bearer |
| POST | `/api/sosial-media` | Bearer |
| PUT | `/api/sosial-media/:id` | Bearer |
| DELETE | `/api/sosial-media/:id` | Bearer |

#### Collaboration Sliders

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/collaboration-sliders/public` | No |
| GET | `/api/collaboration-sliders` | Bearer |
| POST | `/api/collaboration-sliders` | Bearer (multipart) |
| PUT | `/api/collaboration-sliders/:id` | Bearer (multipart) |
| DELETE | `/api/collaboration-sliders/:id` | Bearer |
| PATCH | `/api/collaboration-sliders/:id/order` | Bearer |
| PATCH | `/api/collaboration-sliders/:id/status` | Bearer |

---

## 🔒 Security

### Password Hashing

```typescript
// Uses Web Crypto API SHA-256
const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
```

### JWT Implementation

```typescript
// HS256 with Web Crypto API
const signature = await crypto.subtle.sign('HMAC', key, data);
```

### File Upload Security

- **Type Validation**: Only JPG, JPEG, PNG, WEBP
- **Size Limit**: Max 2MB
- **Unique Names**: Timestamp + random string
- **R2 Storage**: No filesystem access

### CORS

Configurable origins via `CORS_ORIGINS` environment variable.

---

## 🌐 Deployment

### Deploy Commands

```bash
# Production
npx wrangler deploy

# Staging
npx wrangler deploy --env staging

# Dry run (test build)
npx wrangler deploy --dry-run
```

### Environment-Specific Deployments

```bash
# Production
npx wrangler deploy --env production

# Staging
npx wrangler deploy --env staging
```

### Monitoring

```bash
# Real-time logs
npx wrangler tail

# Production logs only
npx wrangler tail --env production
```

---

## 🗄 Database Schema

### Users

```sql
CREATE TABLE users (
  id_user INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  remember_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

### Sosial Media

```sql
CREATE TABLE sosial_media (
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
```

### Collaboration Sliders

```sql
CREATE TABLE collaboration_sliders (
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
```

---

## 🆘 Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| Database not found | Check `database_id` in wrangler.toml |
| Bucket not found | Run `npx wrangler r2 bucket create mondrips-uploads` |
| Invalid JWT_SECRET | Run `npx wrangler secret put JWT_SECRET` |
| Module not found | Run `bun install` or `npm install` |

---

## 📚 Resources

- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Hono Docs](https://hono.dev/)

---

## 📝 License

Proprietary software. All rights reserved.

---

**Built with ❤️ on Cloudflare Workers**
