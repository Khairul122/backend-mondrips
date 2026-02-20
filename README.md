# Mondrips API - Cloudflare Workers

A modern, serverless RESTful API built with **Hono Framework** (TypeScript) and deployed on **Cloudflare Workers**. This project uses **Cloudflare D1** (SQLite) for database and features comprehensive authentication, social media management, and collaboration slider management.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Request/Response Examples](#-requestresponse-examples)
- [Security](#-security)
- [Deployment](#-deployment)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

---

## 🛠 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **TypeScript** | Type-safe development | ^5.3.0 |
| **Hono** | Ultra-lightweight web framework for Edge | ^4.3.0 |
| **Cloudflare Workers** | Serverless Edge runtime | Latest |
| **Cloudflare D1** | SQLite database (serverless) | Latest |
| **Zod** | Runtime validation | ^3.22.4 |
| **@hono/swagger-ui** | API documentation | ^0.3.0 |
| **@hono/zod-validator** | Request validation | ^0.2.0 |

### Security & Utilities

| Technology | Purpose |
|------------|---------|
| **Web Crypto API** | Password hashing (SHA-256) & JWT signing (HMAC) |
| **HTTPOnly Cookies** | Secure remember token storage |
| **CORS** | Cross-origin resource sharing |

---

## ✨ Features

### 🔐 Authentication Module
- ✅ **User Registration** with email/username uniqueness validation
- ✅ **Login** with JWT Access Token (15 minutes expiry)
- ✅ **Remember Me** with HTTPOnly cookies (30 days expiry)
- ✅ **Token Refresh** endpoint for seamless session extension
- ✅ **Logout** with session invalidation
- ✅ **Password Change** with current password verification
- ✅ **Profile Retrieval** (GET /api/auth/me)

### 📱 Social Media Management
- ✅ Full **CRUD** operations for social media links
- ✅ User-scoped data (One-to-Many relation)
- ✅ URL format validation
- ✅ Platform name length constraints (1-50 chars)
- ✅ Username path validation (1-255 chars)

### 🎨 Collaboration Sliders Management
- ✅ Full **CRUD** operations for slider management
- ✅ **Display Order** management for custom sorting
- ✅ **Active/Inactive** toggle for visibility control
- ✅ **Public Endpoint** for active sliders (no auth required)
- ✅ **Image Path** support (URL-based, R2 integration ready)
- ✅ User ownership validation

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
│  │  D1 (SQLite)│        │ R2 Storage  │ (Optional)          │
│  └─────────────┘        └─────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

| Layer | Responsibility | Files |
|-------|---------------|-------|
| **Routes** | HTTP method & path definition | `src/routes/*.ts` |
| **Controllers** | Request/Response handling, Zod validation | `src/controllers/*.ts` |
| **Services** | Business logic, token generation | `src/services/*.ts` |
| **Repositories** | D1 database queries (parameterized) | `src/repositories/*.ts` |
| **Models** | TypeScript interfaces & DTOs | `src/models/*.ts` |
| **Middlewares** | Auth validation, CORS | `src/middlewares/*.ts` |

---

## 📁 Folder Structure

```
backend-mondrips/
├── src/
│   ├── config/           # Database configuration
│   │   └── database.ts   # D1 wrapper (direct usage)
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
│   │   └── file-upload.ts # File utilities
│   ├── types.ts          # Type definitions
│   └── index.ts          # Entry point
├── migrations/           # Database migrations
│   ├── 001_create_users_table.sql
│   ├── 002_create_sosial_media_table.sql
│   └── 003_create_collaboration_sliders_table.sql
├── schema.sql            # Combined D1 schema
├── wrangler.toml         # Workers configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

---

## 📋 Prerequisites

```bash
# Node.js 18+ or Bun
node --version  # v18.x or higher

# Wrangler CLI (Cloudflare Workers CLI)
npm install -g wrangler
# or
bun add -g wrangler

# Cloudflare account (free tier sufficient)
# Sign up at: https://dash.cloudflare.com/sign-up/workers
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npx wrangler d1 create db_mondrips
```

**Copy the `database_id` from output** and update `wrangler.toml`.

### 4. Create R2 Bucket (Optional - for file uploads)

```bash
npx wrangler r2 bucket create mondrips-uploads
```

### 5. Run Database Migrations

```bash
npx wrangler d1 execute db_mondrips --remote --file=schema.sql
```

### 6. Set Secrets

```bash
npx wrangler secret put JWT_SECRET
# Enter a strong random string (min 32 characters)
```

### 7. Run Locally

```bash
npx wrangler dev
```

**Access at:**
- 🏠 API: `http://localhost:8787`
- 📖 Docs: `http://localhost:8787/docs`
- 🏥 Health: `http://localhost:8787/health`

### 8. Deploy to Production

```bash
npx wrangler deploy --env production
```

**Live at:** `https://backend-mondrips-production.mondrips-api.workers.dev`

---

## ⚙️ Configuration

### wrangler.toml

```toml
name = "backend-mondrips"
main = "src/index.ts"
compatibility_date = "2025-02-18"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-database-id-here"

# R2 Storage (Optional)
# [[r2_buckets]]
# binding = "UPLOADS"
# bucket_name = "mondrips-uploads"

# Environment Variables
[vars]
JWT_EXPIRES_IN = "15m"
REMEMBER_TOKEN_EXPIRES_IN = "30d"
NODE_ENV = "production"
CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"

# Production Environment
[env.production]
name = "backend-mondrips-production"
compatibility_date = "2025-02-18"

[[env.production.d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-database-id-here"

[env.production.vars]
JWT_EXPIRES_IN = "15m"
REMEMBER_TOKEN_EXPIRES_IN = "30d"
NODE_ENV = "production"
CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"

# Staging Environment
[env.staging]
name = "backend-mondrips-staging"
compatibility_date = "2025-02-18"

[[env.staging.d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-database-id-here"

[env.staging.vars]
JWT_EXPIRES_IN = "15m"
REMEMBER_TOKEN_EXPIRES_IN = "30d"
NODE_ENV = "staging"
CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"
```

### Secrets Management

```bash
# Set a secret
npx wrangler secret put JWT_SECRET

# List all secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete SECRET_NAME
```

---

## 📚 API Documentation

### Interactive Swagger UI

| Environment | URL |
|-------------|-----|
| **Production** | https://backend-mondrips-production.mondrips-api.workers.dev/docs |
| **Staging** | https://backend-mondrips-staging.mondrips-api.workers.dev/docs |
| **Local** | http://localhost:8787/docs |

### OpenAPI Specification

```bash
curl https://backend-mondrips-production.mondrips-api.workers.dev/openapi.json
```

---

## 📡 API Endpoints

### 🔐 Authentication (6 endpoints)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| POST | `/api/auth/refresh` | ❌ (Cookie) | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Logout user |
| PUT | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/auth/me` | ✅ | Get current user |

### 📱 Social Media (5 endpoints)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/sosial-media` | ✅ | List user's social media |
| POST | `/api/sosial-media` | ✅ | Create social media |
| GET | `/api/sosial-media/:id` | ✅ | Get by ID |
| PUT | `/api/sosial-media/:id` | ✅ | Update social media |
| DELETE | `/api/sosial-media/:id` | ✅ | Delete social media |

### 🎨 Collaboration Sliders (8 endpoints)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/collaboration-sliders/public` | ❌ | List active sliders |
| GET | `/api/collaboration-sliders` | ✅ | List user's sliders |
| POST | `/api/collaboration-sliders` | ✅ | Create slider |
| GET | `/api/collaboration-sliders/:id` | ✅ | Get by ID |
| PUT | `/api/collaboration-sliders/:id` | ✅ | Update slider |
| DELETE | `/api/collaboration-sliders/:id` | ✅ | Delete slider |
| PATCH | `/api/collaboration-sliders/:id/order` | ✅ | Update display order |
| PATCH | `/api/collaboration-sliders/:id/status` | ✅ | Toggle status |

---

## 📝 Request/Response Examples

### Register User

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securepass123",
    "full_name": "John Doe"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id_user": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "is_active": 1,
    "created_at": "2026-02-20 16:15:35",
    "updated_at": "2026-02-20 16:15:35",
    "last_login": null
  }
}
```

### Login

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "securepass123",
    "remember_me": true
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id_user": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "role": "user"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": "15m"
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: remember_token=abc123...; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Strict
```

### Refresh Token

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/refresh \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": "15m"
  }
}
```

### Create Social Media

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "nama_platform": "Instagram",
    "username_path": "@johndoe",
    "link_url": "https://instagram.com/johndoe"
  }'
```

### Create Collaboration Slider

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/collaboration-sliders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Partner Banner",
    "image_path": "https://example.com/images/banner.jpg",
    "description": "Our collaboration partner",
    "link_url": "https://partner.com",
    "display_order": 1,
    "is_active": 1
  }'
```

---

## 🔒 Security

### Password Hashing

Uses **Web Crypto API** with SHA-256:

```typescript
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert to hex string...
};
```

### JWT Implementation

Uses **Web Crypto API** with HMAC-SHA256:

```typescript
// Token generation
const key = await crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);
const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
```

### Token Expiry

| Token Type | Expiry | Storage |
|------------|--------|---------|
| **Access Token** | 15 minutes | Client (Bearer header) |
| **Remember Token** | 30 days | HTTPOnly Cookie |

### Security Best Practices

- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Zod validation for all inputs
- ✅ HTTPOnly cookies for remember tokens
- ✅ Secure & SameSite cookie attributes
- ✅ CORS configuration
- ✅ User ownership validation

---

## 🌐 Deployment

### Deploy Commands

```bash
# Deploy to production
npx wrangler deploy --env production

# Deploy to staging
npx wrangler deploy --env staging

# Dry run (test build)
npx wrangler deploy --dry-run --env production
```

### Environment URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://backend-mondrips-production.mondrips-api.workers.dev |
| **Staging** | https://backend-mondrips-staging.mondrips-api.workers.dev |
| **Local** | http://localhost:8787 |

### Monitoring & Logs

```bash
# Real-time logs (all environments)
npx wrangler tail

# Production logs only
npx wrangler tail --env production

# Filter by status
npx wrangler tail --status error
```

### Database Management

```bash
# Database info
npx wrangler d1 info db_mondrips

# Execute migration
npx wrangler d1 execute db_mondrips --remote --file=migrations/001.sql

# List databases
npx wrangler d1 list
```

---

## 🗄 Database Schema

### Users Table

```sql
CREATE TABLE users (
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

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_remember_token ON users(remember_token);
```

### Sosial Media Table

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

CREATE INDEX idx_id_user_sosmed ON sosial_media(id_user);
```

### Collaboration Sliders Table

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

CREATE INDEX idx_id_user_sliders ON collaboration_sliders(id_user);
CREATE INDEX idx_display_order ON collaboration_sliders(display_order);
CREATE INDEX idx_is_active ON collaboration_sliders(is_active);
```

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Health check
curl https://backend-mondrips-production.mondrips-api.workers.dev/health

# Register
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test12345","full_name":"Test User"}'

# Login
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"test12345"}'
```

### Testing with Swagger UI

1. Open Swagger UI at your environment URL
2. Click **Authorize** button
3. Enter Bearer token: `YOUR_ACCESS_TOKEN`
4. Use **Try it out** for any endpoint

---

## 🆘 Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `Database not found` | Invalid `database_id` | Check `wrangler.toml` and run `npx wrangler d1 info` |
| `no such table: users` | Schema not executed | Run `npx wrangler d1 execute db_mondrips --remote --file=schema.sql` |
| `Invalid or expired token` | Token expired | Use `/api/auth/refresh` endpoint |
| `JWT_SECRET not set` | Missing secret | Run `npx wrangler secret put JWT_SECRET` |
| `Module not found` | Dependencies missing | Run `bun install` or `npm install` |
| `this.db.first is not a function` | Wrong DB wrapper usage | Ensure using D1Database directly |

### Debug Commands

```bash
# Check deployment status
npx wrangler deploy --dry-run --env production

# Check database
npx wrangler d1 info db_mondrips

# Check secrets
npx wrangler secret list

# View logs
npx wrangler tail --env production
```

---

## 📚 Resources

### Official Documentation

- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Hono Framework Docs](https://hono.dev/)
- [Zod Validation Docs](https://zod.dev/)

### Community & Support

- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Hono GitHub Discussions](https://github.com/honojs/hono/discussions)

---

## 📝 License

**Proprietary Software** - All rights reserved.

---

## 👨‍💻 Contributors

Built with ❤️ using **Hono Framework** and **Cloudflare Workers**

---

**Last Updated:** February 20, 2026
