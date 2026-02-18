# Mondrips Backend API

A modern, secure, and scalable RESTful API backend built with **Hono Framework** (TypeScript) and **MySQL**. This project implements Clean Architecture principles with a clear separation of concerns between Controllers, Services, and Repositories.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Running the Server](#-running-the-server)
- [API Documentation](#-api-documentation)
- [Security & Code Standards](#-security--code-standards)
- [Database Schema](#-database-schema)

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe JavaScript superset |
| **Hono** | Lightweight, fast web framework |
| **Bun / Node.js** | JavaScript runtime |
| **MySQL** | Relational database |
| **mysql2** | MySQL client with Promise support |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT-based authentication |
| **Zod** | Runtime type validation |
| **@hono/swagger-ui** | Interactive API documentation |

---

## ✨ Features

### Authentication Module
- **User Registration** with email and username uniqueness validation
- **Login** with JWT Access Token generation
- **Remember Me** functionality with long-lived HTTPOnly cookies
- **Token Refresh** endpoint for seamless session extension
- **Logout** with token invalidation
- **Password Change** with current password verification
- **Profile Retrieval** for authenticated users

### Social Media Management
- **Create** social media links tied to authenticated user
- **Read** list of all social media accounts (filtered by user)
- **Update** existing social media information
- **Delete** social media entries
- **Validation**: URL format validation, platform name length limits

### Collaboration Sliders Management
- **Create** sliders with image upload (JPG, JPEG, PNG, WEBP)
- **Read** all sliders with ordering by `display_order`
- **Read Public** endpoint for active sliders only (no auth required)
- **Update** slider data with optional image replacement
- **Delete** slider with automatic file cleanup
- **Reorder** sliders via dedicated endpoint
- **Toggle Status** (active/inactive) via dedicated endpoint
- **File Management**:
  - Automatic unique filename generation (timestamp + random string)
  - File size validation (max 2MB)
  - File type validation (images only)
  - Automatic deletion of old files on update/delete

---

## 📁 Folder Structure

```
backend-mondrips/
├── src/
│   ├── config/           # Database configuration and connection pool
│   │   └── database.ts
│   ├── controllers/      # Request handlers, input validation, response formatting
│   │   ├── auth.controller.ts
│   │   ├── sosial-media.controller.ts
│   │   └── collaboration-slider.controller.ts
│   ├── services/         # Business logic, orchestration layer
│   │   ├── auth.service.ts
│   │   ├── sosial-media.service.ts
│   │   └── collaboration-slider.service.ts
│   ├── repositories/     # Database queries, data access layer
│   │   ├── user.repository.ts
│   │   ├── sosial-media.repository.ts
│   │   └── collaboration-slider.repository.ts
│   ├── models/           # TypeScript interfaces and DTOs
│   │   ├── user.model.ts
│   │   ├── sosial-media.model.ts
│   │   └── collaboration-slider.model.ts
│   ├── middlewares/      # Custom middleware (auth, CORS, etc.)
│   │   ├── auth.middleware.ts
│   │   └── cors.middleware.ts
│   ├── routes/           # Route definitions and endpoint mapping
│   │   ├── auth.routes.ts
│   │   ├── sosial-media.routes.ts
│   │   └── collaboration-slider.routes.ts
│   ├── docs/             # OpenAPI/Swagger documentation
│   │   └── swagger.ts
│   ├── utils/            # Utility functions (file upload, helpers)
│   │   └── file-upload.ts
│   └── index.ts          # Application entry point
├── migrations/           # SQL migration scripts for database setup
│   ├── 001_create_users_table.sql
│   ├── 002_create_sosial_media_table.sql
│   └── 003_create_collaboration_sliders_table.sql
├── public/
│   └── uploads/
│       └── sliders/      # Uploaded slider images (auto-created)
├── certs/                # SSL/TLS certificates for HTTPS (optional)
├── .env                  # Environment variables (do not commit)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

| Software | Minimum Version | Recommended |
|----------|-----------------|-------------|
| **Node.js** | v18.x | v20.x LTS |
| **Bun** (optional) | v1.0.x | Latest |
| **MySQL** | v5.7 | v8.0+ |
| **Git** | Any | Latest |

### Optional Tools
- **XAMPP / Laragon / WAMP** - For local MySQL server management
- **phpMyAdmin / MySQL Workbench** - For database visualization

---

## 🚀 Installation & Setup

### Step 1: Clone or Download

```bash
# Navigate to the project directory
cd D:\ProjekFullStack

# If cloning from repository
git clone <repository-url> backend-mondrips
cd backend-mondrips

# Or if copying manually, ensure the folder is named 'backend-mondrips'
```

### Step 2: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
# Use any text editor (VS Code, Notepad++, etc.)
```

**Required Environment Variables:**

```env
PORT=3000
HOST=localhost

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_mondrips

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
REMEMBER_TOKEN_EXPIRES_IN=30d

NODE_ENV=development

HTTPS=false
HTTPS_KEY_PATH=./certs/server.key
HTTPS_CERT_PATH=./certs/server.crt
```

### Step 4: Setup Database

```bash
# Option 1: Using MySQL CLI
mysql -u root -p < migrations/001_create_users_table.sql
mysql -u root -p < migrations/002_create_sosial_media_table.sql
mysql -u root -p < migrations/003_create_collaboration_sliders_table.sql

# Option 2: Using phpMyAdmin
# 1. Open phpMyAdmin in browser
# 2. Create database 'db_mondrips'
# 3. Import each .sql file from migrations/ folder
```

### Step 5: Create Upload Directory

The upload directory is created automatically on first run. However, you can create it manually:

```bash
mkdir -p public/uploads/sliders
```

---

## ⚙️ Configuration

### Database Configuration

Edit the database connection in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL server host | `localhost` |
| `DB_PORT` | MySQL server port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | `db_mondrips` |

### JWT Configuration

| Variable | Description | Recommended |
|----------|-------------|-------------|
| `JWT_SECRET` | Secret key for signing tokens | 32+ random characters |
| `JWT_EXPIRES_IN` | Access token validity | `15m` |
| `REMEMBER_TOKEN_EXPIRES_IN` | Remember me token validity | `30d` |

---

## ▶️ Running the Server

### Development Mode (with hot-reload)

```bash
# Using Bun
bun run dev

# Using Node.js with ts-node
npx ts-node src/index.ts
```

### Production Mode

```bash
# Using Bun
bun run start

# Using Node.js
node dist/index.ts
```

### HTTPS Mode

```bash
# 1. Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes

# 2. Set HTTPS=true in .env

# 3. Run with HTTPS
bun run start:https
```

### Default Server Info

| Endpoint | URL |
|----------|-----|
| **Base URL** | `http://localhost:3000` |
| **API Documentation** | `http://localhost:3000/api-docs` |
| **Health Check** | `http://localhost:3000/health` |
| **OpenAPI JSON** | `http://localhost:3000/openapi.json` |

---

## 📚 API Documentation

### Interactive Documentation

Access the Swagger UI at: **`http://localhost:3000/api-docs`**

The Swagger UI provides:
- Interactive API testing directly from browser
- Request/response schema visualization
- Authentication token management
- Try-it-out functionality for all endpoints

### API Endpoints Overview

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login with credentials |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Logout user |
| PUT | `/api/auth/change-password` | Bearer | Change password |
| GET | `/api/auth/me` | Bearer | Get current user |

#### Social Media

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sosial-media` | Bearer | List user's social media |
| GET | `/api/sosial-media/:id` | Bearer | Get specific social media |
| POST | `/api/sosial-media` | Bearer | Create social media |
| PUT | `/api/sosial-media/:id` | Bearer | Update social media |
| DELETE | `/api/sosial-media/:id` | Bearer | Delete social media |

#### Collaboration Sliders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/collaboration-sliders/public` | No | Get active sliders |
| GET | `/api/collaboration-sliders` | Bearer | List user's sliders |
| GET | `/api/collaboration-sliders/:id` | Bearer | Get specific slider |
| POST | `/api/collaboration-sliders` | Bearer | Create slider (multipart) |
| PUT | `/api/collaboration-sliders/:id` | Bearer | Update slider (multipart) |
| DELETE | `/api/collaboration-sliders/:id` | Bearer | Delete slider |
| PATCH | `/api/collaboration-sliders/:id/order` | Bearer | Update display order |
| PATCH | `/api/collaboration-sliders/:id/status` | Bearer | Toggle active status |

---

## 🔒 Security & Code Standards

### Authentication & Authorization

- **JWT-based authentication** with short-lived access tokens
- **HTTPOnly cookies** for remember-me functionality (prevents XSS)
- **Middleware protection** on all authenticated endpoints
- **Role-based access control** ready (role field in users table)

### Input Validation

- **Zod schema validation** on all request bodies
- **URL format validation** for link fields
- **Length constraints** on all string inputs
- **Type coercion** for numeric fields (display_order, is_active)

### File Upload Security

| Feature | Implementation |
|---------|----------------|
| **File Type Validation** | Only JPG, JPEG, PNG, WEBP allowed |
| **File Size Limit** | Maximum 2MB per file |
| **Unique Filenames** | Timestamp + random string prevents overwrites |
| **Automatic Cleanup** | Old files deleted on update/delete |
| **Directory Isolation** | Files stored in dedicated `public/uploads/sliders/` |

### Password Security

- **bcrypt hashing** with 12 salt rounds
- **Never stored in plain text**
- **Minimum 8 characters** with alphanumeric requirement

### CORS Configuration

```typescript
{
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}
```

### Clean Architecture Principles

1. **Controllers**: Handle HTTP requests, validate input, format responses
2. **Services**: Contain business logic, orchestrate repositories
3. **Repositories**: Direct database interaction, no business logic
4. **Models**: TypeScript interfaces and DTOs for type safety

### Error Handling

- Consistent JSON response format: `{ success: boolean, message: string, data?: any }`
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Zod validation errors include field-specific messages
- Global error handler for uncaught exceptions

---

## 🗄 Database Schema

### Users Table

```sql
users (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,          -- bcrypt hashed
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active TINYINT(1) DEFAULT 1,
  remember_token VARCHAR(255) NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP NULL
)
```

### Social Media Table

```sql
sosial_media (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_user BIGINT NOT NULL,                  -- FK to users(id_user)
  nama_platform VARCHAR(50) NOT NULL,
  username_path VARCHAR(255) NOT NULL,
  icon_class VARCHAR(100) NULL,
  link_url TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
)
```

### Collaboration Sliders Table

```sql
collaboration_sliders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  image_path VARCHAR(255) NOT NULL,         -- Path to uploaded file
  description TEXT NULL,
  link_url VARCHAR(255) NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  id_user BIGINT NOT NULL,                  -- FK to users(id_user)
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
)
```

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Support

For questions, issues, or feature requests, please contact the development team or refer to the API documentation at `/api-docs`.

---

**Built with ❤️ using Hono & TypeScript**
