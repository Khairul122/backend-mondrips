# ⚠️ CLOUDFLARE WORKERS DEPLOYMENT GUIDE

## IMPORTANT WARNING

**This project is NOT compatible with Cloudflare Workers in its current state.**

### Why It Won't Work

| Node.js Package | Cloudflare Workers Alternative |
|-----------------|-------------------------------|
| `mysql2` | Cloudflare D1 (SQLite) or external DB via HTTP |
| `bcryptjs` | Web Crypto API (`crypto.subtle`) |
| `jsonwebtoken` | Hono JWT (`hono/jwt`) or Cloudflare Access |
| `@hono/node-server` | Hono native Workers runtime |
| `fs`, `path`, `url` | Web APIs or Cloudflare KV/R2 |
| `dotenv` | Wrangler `[vars]` or `wrangler secret` |
| File System Upload | Cloudflare R2 Storage |

---

## Option 1: Deploy to Node.js-Compatible Platform (Recommended)

### Railway.app
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add MySQL plugin
railway add mysql

# 5. Deploy
railway up
```

### Render.com
```bash
# 1. Create render.yaml in project root
# 2. Push to Git repository
# 3. Connect repository in Render dashboard
# 4. Add MySQL database service
# 5. Deploy automatically on push
```

### VPS (Manual Deployment)
```bash
# 1. Clone repository
git clone <repo-url> backend-mondrips
cd backend-mondrips

# 2. Install dependencies
bun install

# 3. Configure .env
cp .env.example .env
# Edit .env with production values

# 4. Run migrations
mysql -u root -p < migrations/001_create_users_table.sql
mysql -u root -p < migrations/002_create_sosial_media_table.sql
mysql -u root -p < migrations/003_create_collaboration_sliders_table.sql

# 5. Install PM2
npm install -g pm2

# 6. Start with PM2
pm2 start "bun run src/index.ts" --name mondrips-api

# 7. Save PM2 configuration
pm2 save

# 8. Setup PM2 startup
pm2 startup
```

---

## Option 2: Refactor for Cloudflare Workers

If you insist on using Cloudflare Workers, here's the refactor roadmap:

### Step 1: Install Workers-Compatible Dependencies

```bash
# Remove Node.js-specific packages
bun remove @hono/node-server bcryptjs jsonwebtoken mysql2 dotenv

# Install Workers-compatible packages
bun add hono @hono/zod-validator
bun install @cloudflare/workers-types -D
```

### Step 2: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "cf-typegen": "wrangler types"
  }
}
```

### Step 3: Create Worker Entry Point (src/worker.ts)

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

// Routes here...

export default app;
```

### Step 4: Use Cloudflare D1 for Database

```bash
# Create D1 database
npx wrangler d1 create db_mondrips

# Update wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "db_mondrips"
database_id = "your-database-id"
```

### Step 5: Use Cloudflare R2 for File Storage

```bash
# Create R2 bucket
npx wrangler r2 bucket create mondrips-uploads

# Update wrangler.toml
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "mondrips-uploads"
```

### Step 6: Set Secrets

```bash
# Database password (if using external DB)
npx wrangler secret put DB_PASSWORD

# JWT Secret
npx wrangler secret put JWT_SECRET

# Any other sensitive variables
npx wrangler secret put <SECRET_NAME>
```

### Step 7: Deploy

```bash
# Login to Cloudflare
npx wrangler login

# Deploy to production
npx wrangler deploy

# Deploy to specific environment
npx wrangler deploy --env production
npx wrangler deploy --env staging
```

---

## Wrangler CLI Commands Reference

### Authentication
```bash
npx wrangler login
npx wrangler whoami
npx wrangler logout
```

### Development
```bash
npx wrangler dev          # Start local development server
npx wrangler dev --local  # Use local mode
```

### Deployment
```bash
npx wrangler deploy              # Deploy to production
npx wrangler deploy --env staging  # Deploy to staging
npx wrangler deploy --dry-run    # Test deployment without publishing
```

### Secrets Management
```bash
npx wrangler secret put DB_PASSWORD       # Set secret
npx wrangler secret list                  # List all secrets
npx wrangler secret delete SECRET_NAME    # Delete secret
```

### Database (D1)
```bash
npx wrangler d1 create db_mondrips        # Create database
npx wrangler d1 info db_mondrips          # Show database info
npx wrangler d1 execute db_mondrips --file=migrations/001.sql
```

### Storage (R2)
```bash
npx wrangler r2 bucket create mondrips-uploads
npx wrangler r2 object put mondrips-uploads/file.jpg --file=./file.jpg
```

### Logs & Monitoring
```bash
npx wrangler tail                    # Stream logs in real-time
npx wrangler tail --env production   # Stream production logs
```

---

## Recommended Alternative: Use Hono with Node.js Runtime

Since this project is already built with Hono, you can deploy to any Node.js-compatible platform without refactoring:

### Supported Platforms:
- ✅ Railway.app
- ✅ Render.com
- ✅ Fly.io
- ✅ DigitalOcean App Platform
- ✅ Heroku
- ✅ VPS (with PM2/Docker)

### Example: Railway Deployment

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   railway init
   ```

3. Add MySQL database:
   ```bash
   railway add mysql
   ```

4. Set environment variables:
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set DB_HOST=mysql.railway.internal
   ```

5. Deploy:
   ```bash
   railway up
   ```

---

## Conclusion

**Current State:** ❌ Not compatible with Cloudflare Workers

**Recommended Action:** Deploy to Railway, Render, or VPS for zero-code-change deployment.

**If Workers Required:** Full refactor needed (estimated 20-40 hours of development time).
