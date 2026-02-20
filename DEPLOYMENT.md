# Cloudflare Workers Deployment Guide

## 🚀 Quick Start

This project has been fully refactored for **Cloudflare Workers** runtime with:
- **D1 Database** instead of MySQL
- **R2 Storage** instead of filesystem
- **Web Crypto API** instead of bcryptjs/jsonwebtoken
- **Hono native runtime** instead of @hono/node-server

---

## 📋 Prerequisites

```bash
# Install Node.js 18+ or Bun
node --version  # v18.x or higher

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
npx wrangler login
```

---

## 🛠 Setup Steps

### Step 1: Install Dependencies

```bash
# Install all dependencies
bun install

# Or using npm
npm install
```

### Step 2: Create D1 Database

```bash
# Create the database
npx wrangler d1 create db_mondrips

# Output will show database_id, copy it!
# Example output:
# ✅ Created database 'db_mondrips'
# database_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Update `wrangler.toml` with your `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-actual-database-id-here"
```

### Step 3: Create R2 Bucket

```bash
# Create the bucket
npx wrangler r2 bucket create mondrips-uploads
```

Update `wrangler.toml` with your bucket name:

```toml
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "mondrips-uploads"
```

### Step 4: Execute Database Migrations

```bash
# Run the schema
npx wrangler d1 execute db_mondrips --file=schema.sql

# Or for local development
npx wrangler d1 execute db_mondrips --local --file=schema.sql
```

### Step 5: Set Secrets

```bash
# JWT Secret (REQUIRED)
npx wrangler secret put JWT_SECRET
# Enter a strong random string (min 32 characters)

# Optional: Admin user email for future features
npx wrangler secret put ADMIN_EMAIL
```

---

## ▶️ Running Locally

```bash
# Start development server
npx wrangler dev

# Access at: http://localhost:8787
# API Docs: http://localhost:8787/docs
# Health: http://localhost:8787/health
```

### Local Development with D1

```bash
# Use local D1 (SQLite file)
npx wrangler dev --local

# Reset local database
npx wrangler d1 execute db_mondrips --local --file=schema.sql
```

---

## 🌐 Deploy to Production

```bash
# Deploy to production
npx wrangler deploy

# Deploy to specific environment
npx wrangler deploy --env production
npx wrangler deploy --env staging
```

After deployment, your API will be available at:
```
https://backend-mondrips.workers.dev
```

---

## 🔧 Environment Configuration

### wrangler.toml Variables

| Variable | Type | Description |
|----------|------|-------------|
| `JWT_EXPIRES_IN` | var | Access token expiry (e.g., "15m") |
| `REMEMBER_TOKEN_EXPIRES_IN` | var | Remember token expiry (e.g., "30d") |
| `NODE_ENV` | var | Environment name |
| `CORS_ORIGINS` | var | Comma-separated allowed origins |
| `JWT_SECRET` | secret | **Required** JWT signing key |

### Setting Secrets

```bash
# List all secrets
npx wrangler secret list

# Set a secret
npx wrangler secret put JWT_SECRET

# Delete a secret
npx wrangler secret delete SECRET_NAME
```

---

## 📊 Database Management

### View D1 Database

```bash
# Database info
npx wrangler d1 info db_mondrips

# Execute query
npx wrangler d1 execute db_mondrips --command="SELECT * FROM users LIMIT 10"

# Export data
npx wrangler d1 export db_mondrips --output=backup.sql
```

### Run Migrations

```bash
# Single migration file
npx wrangler d1 execute db_mondrips --file=migrations/001_users.sql

# Multiple files (create a combined schema.sql)
npx wrangler d1 execute db_mondrips --file=schema.sql
```

---

## 📦 R2 Storage Management

```bash
# List objects
npx wrangler r2 object list mondrips-uploads

# Upload object
npx wrangler r2 object put mondrips-uploads/test.jpg --file=./test.jpg

# Download object
npx wrangler r2 object get mondrips-uploads/test.jpg --output=./downloaded.jpg

# Delete object
npx wrangler r2 object delete mondrips-uploads/test.jpg
```

---

## 🐛 Debugging & Logs

```bash
# Stream logs in real-time
npx wrangler tail

# Production logs
npx wrangler tail --env production

# Filter logs
npx wrangler tail --status error
```

---

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | Cookie | Refresh Token |
| POST | `/api/auth/logout` | Bearer | Logout |
| PUT | `/api/auth/change-password` | Bearer | Change Password |
| GET | `/api/auth/me` | Bearer | Get Profile |

### Social Media

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sosial-media` | Bearer | List |
| GET | `/api/sosial-media/:id` | Bearer | Get |
| POST | `/api/sosial-media` | Bearer | Create |
| PUT | `/api/sosial-media/:id` | Bearer | Update |
| DELETE | `/api/sosial-media/:id` | Bearer | Delete |

### Collaboration Sliders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/collaboration-sliders/public` | No | Active Sliders |
| GET | `/api/collaboration-sliders` | Bearer | List User's |
| GET | `/api/collaboration-sliders/:id` | Bearer | Get |
| POST | `/api/collaboration-sliders` | Bearer | Create (multipart) |
| PUT | `/api/collaboration-sliders/:id` | Bearer | Update (multipart) |
| DELETE | `/api/collaboration-sliders/:id` | Bearer | Delete |
| PATCH | `/api/collaboration-sliders/:id/order` | Bearer | Update Order |
| PATCH | `/api/collaboration-sliders/:id/status` | Bearer | Toggle Status |

---

## 🔐 Security Notes

### Password Hashing

- Uses **Web Crypto API** SHA-256 ( Workers-compatible)
- No external dependencies (bcryptjs removed)

### JWT Tokens

- Custom implementation using **Web Crypto API** HMAC
- HS256 algorithm
- Automatic expiration validation

### File Uploads

- Stored in **R2 Bucket** (not filesystem)
- Validation: JPG, JPEG, PNG, WEBP only
- Max size: 2MB
- Unique filenames prevent overwrites

---

## ⚠️ Important Notes

### D1 Limitations

- D1 uses **SQLite**, not MySQL
- Some SQL syntax may differ
- No foreign key constraints enforcement (use application-level validation)
- `AUTO_INCREMENT` → `AUTOINCREMENT` (single word)

### R2 Storage

- Files are stored with unique filenames
- Old files are deleted on update/replace
- No nested folders (flat structure)

### Workers Limitations

- Max 10ms CPU time per request (free tier)
- Max 128MB memory
- No persistent filesystem
- Cold starts possible (use Cron Triggers to keep warm)

---

## 🆘 Troubleshooting

### Error: "Database not found"

```bash
# Verify database_id in wrangler.toml
npx wrangler d1 info db_mondrips
```

### Error: "Bucket not found"

```bash
# Verify bucket exists
npx wrangler r2 bucket list
```

### Error: "Invalid JWT_SECRET"

```bash
# Ensure secret is set
npx wrangler secret list
npx wrangler secret put JWT_SECRET
```

### Error: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules
bun install
```

---

## 📚 Additional Resources

- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Hono for Cloudflare Workers](https://hono.dev/getting-started/cloudflare-workers)

---

## 🎯 Next Steps

1. ✅ Run `npx wrangler login`
2. ✅ Create D1: `npx wrangler d1 create db_mondrips`
3. ✅ Create R2: `npx wrangler r2 bucket create mondrips-uploads`
4. ✅ Update `wrangler.toml` with IDs
5. ✅ Set secrets: `npx wrangler secret put JWT_SECRET`
6. ✅ Run migrations: `npx wrangler d1 execute db_mondrips --file=schema.sql`
7. ✅ Test locally: `npx wrangler dev`
8. ✅ Deploy: `npx wrangler deploy`

---

**Ready to deploy! 🚀**
