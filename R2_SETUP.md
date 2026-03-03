# 🪣 R2 Storage Setup Guide

## ⚠️ Penting: R2 Harus Diaktifkan Terlebih Dahulu

Cloudflare memerlukan aktivasi R2 melalui Dashboard sebelum bisa digunakan melalui CLI.

---

## 📋 Langkah-Langkah Setup R2

### 1. **Aktivasi R2 di Cloudflare Dashboard**

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Klik menu **R2** di sidebar kiri
3. Klik **Enable R2** (jika belum aktif)
4. Setujui syarat dan ketentuan

### 2. **Buat R2 Bucket**

**Via Dashboard (Recommended):**
1. Di halaman R2, klik **Create bucket**
2. Nama bucket: `mondrips-uploads`
3. Klik **Create bucket**

**Via CLI (Setelah R2 aktif):**
```bash
npx wrangler r2 bucket create mondrips-uploads
```

### 3. **Verifikasi Bucket**

```bash
npx wrangler r2 bucket list
```

Output yang diharapkan:
```
┌─────────────────────┬──────────┬──────────────────────┐
│ Name                │ Location │ Created              │
├─────────────────────┼──────────┼──────────────────────┤
│ mondrips-uploads    │ auto     │ 2026-03-02 22:00:00  │
└─────────────────────┴──────────┴──────────────────────┘
```

### 4. **Deploy ke Production**

Setelah bucket dibuat, deploy worker:

```bash
npx wrangler deploy --env production
```

---

## 🔧 Konfigurasi yang Sudah Siap

File `wrangler.toml` sudah dikonfigurasi dengan benar:

```toml
# Cloudflare R2 Storage for file uploads
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "mondrips-uploads"

# Production environment
[env.production]
name = "backend-mondrips-production"

[[env.production.r2_buckets]]
binding = "UPLOADS"
bucket_name = "mondrips-uploads"
```

---

## 📝 Cara Menggunakan R2 Upload

### **Create Slider dengan File Upload**

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/collaboration-sliders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=LA MOUCHE" \
  -F "image=@/path/to/image.jpg" \
  -F "description=Collaboration partner" \
  -F "link_url=https://partner.com" \
  -F "display_order=1" \
  -F "is_active=1"
```

### **Create Slider dengan URL (Alternatif)**

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/collaboration-sliders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "LA MOUCHE",
    "image_path": "https://example.com/image.jpg",
    "description": "Collaboration partner",
    "link_url": "https://partner.com",
    "display_order": 1,
    "is_active": 1
  }'
```

### **Update Slider dengan Ganti Gambar**

```bash
curl -X PUT https://backend-mondrips-production.mondrips-api.workers.dev/api/collaboration-sliders/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=LA MOUCHE Updated" \
  -F "image=@/path/to/new-image.jpg" \
  -F "description=Updated description"
```

---

## 🗑️ Mengelola R2 Bucket

### **List Objects di Bucket**

```bash
npx wrangler r2 object list mondrips-uploads
```

### **Download Object**

```bash
npx wrangler r2 object get mondrips-uploads/1709395200_abc123.jpg --file downloaded-image.jpg
```

### **Upload Object Manual**

```bash
npx wrangler r2 object put mondrips-uploads/test-image.jpg --file test-image.jpg
```

### **Delete Object**

```bash
npx wrangler r2 object delete mondrips-uploads/1709395200_abc123.jpg
```

---

## 💰 Pricing R2 (Update 2026)

| Tier | Storage | Operations | Cost/Month |
|------|---------|------------|------------|
| **Free** | 10 GB | 10M reads, 1M writes | **$0** |
| **Paid** | >10 GB | Additional ops | $0.015/GB + ops |

**Estimasi Biaya:**
- 1000 gambar @ 500KB = 500MB → **Gratis**
- 10,000 gambar @ 500KB = 5GB → **Gratis**
- 50,000 gambar @ 500KB = 25GB → ~$0.23/bulan

---

## 🔗 Public URL untuk Images

Images di R2 dapat diakses via:

```
https://mondrips-uploads.mondrips.workers.dev/{filename}
```

**Contoh:**
```
https://mondrips-uploads.mondrips.workers.dev/1709395200_abc123.jpg
```

### **Custom Domain (Optional)**

Untuk menggunakan custom domain:

1. Di Cloudflare Dashboard → R2 → Bucket → Settings
2. Klik **Custom domains**
3. Add custom domain (misal: `images.mondrips.com`)
4. Verify domain ownership

---

## 🛠️ Troubleshooting

### **Error: Please enable R2 through the Cloudflare Dashboard**

**Solusi:**
1. Login ke Cloudflare Dashboard
2. Klik menu R2
3. Enable R2 jika belum aktif
4. Tunggu beberapa menit
5. Retry create bucket

### **Error: Bucket not found**

**Solusi:**
```bash
# Pastikan bucket ada
npx wrangler r2 bucket list

# Jika tidak ada, buat bucket
npx wrangler r2 bucket create mondrips-uploads
```

### **Error: R2 Bucket binding is undefined**

**Solusi:**
1. Pastikan `[[r2_buckets]]` ada di `wrangler.toml`
2. Pastikan bucket sudah dibuat
3. Redeploy: `npx wrangler deploy --env production`

---

## 📚 Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/r2/)

---

**Last Updated:** March 2, 2026
**Status:** ⏳ Menunggu aktivasi R2 di Cloudflare Dashboard
