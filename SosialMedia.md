# 📱 Social Media API Documentation

Complete documentation for the Mondrips Social Media Management API, including CRUD operations for managing social media links.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Data Model](#data-model)
- [Endpoints](#endpoints)
  - [List All Social Media](#1-list-all-social-media)
  - [Get Social Media by ID](#2-get-social-media-by-id)
  - [Create Social Media](#3-create-social-media)
  - [Update Social Media](#4-update-social-media)
  - [Delete Social Media](#5-delete-social-media)
- [Error Handling](#error-handling)
- [Security](#security)
- [Code Examples](#code-examples)

---

## 📖 Overview

The Social Media API allows users to manage social media links with full CRUD operations.

**Features:**
- ✅ Create, Read, Update, Delete social media links
- ✅ **Public endpoint** for listing all social media (`GET /api/sosial-media/public`)
- ✅ **Authenticated endpoint** for managing your own social media
- ✅ User-scoped data for write operations (users can only modify their own data)
- ✅ URL format validation
- ✅ Platform name and username path constraints
- ✅ Automatic timestamps (created_at, updated_at)

**Available Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sosial-media/public` | ❌ **Public** | List all social media (public access) |
| GET | `/api/sosial-media` | ✅ Required | List social media: **Admin** sees all, **User** sees only their own |
| GET | `/api/sosial-media/:id` | ✅ Required | Get social media by ID (must be owner or admin) |
| POST | `/api/sosial-media` | ✅ Required | Create new social media |
| PUT | `/api/sosial-media/:id` | ✅ Required | Update social media (must be owner) |
| DELETE | `/api/sosial-media/:id` | ✅ Required | Delete social media (must be owner) |

---

## 👥 Role-Based Access Control

The `GET /api/sosial-media` endpoint implements role-based filtering:

| User Role | Data Returned |
|-----------|---------------|
| **admin** | ✅ ALL social media from ALL users |
| **user** | ✅ Only social media owned by the authenticated user |

**Example:**
- Admin logs in and calls `GET /api/sosial-media` → Returns all social media links from all users
- Regular user logs in and calls `GET /api/sosial-media` → Returns only that user's social media links

**Note:** This applies only to `GET /api/sosial-media`. Other endpoints (POST, PUT, DELETE) still require ownership validation.

---

## 🌐 Base URL

| Environment | URL |
|-------------|-----|
| **Production** | `https://backend-mondrips-production.mondrips-api.workers.dev` |
| **Staging** | `https://backend-mondrips-staging.mondrips-api.workers.dev` |
| **Local** | `http://localhost:8787` |

**All examples below use the production URL. Replace with your environment URL as needed.**

---

## 📊 Data Model

### Sosial Media Object

```typescript
interface SosialMedia {
  id: number;              // Auto-generated unique ID
  id_user: number;         // Owner's user ID
  nama_platform: string;   // Platform name (e.g., "Instagram", "Twitter")
  username_path: string;   // Username or handle (e.g., "@johndoe")
  icon_class: string | null; // CSS class for icon (optional)
  link_url: string;        // Full URL to profile
  created_at: string;      // Creation timestamp (ISO format)
  updated_at: string;      // Last update timestamp (ISO format)
}
```

### Field Specifications

| Field | Type | Constraints | Description | Example |
|-------|------|-------------|-------------|---------|
| `id` | integer | Auto-increment, primary key | Unique identifier | `1` |
| `id_user` | integer | Foreign key to users | Owner's user ID | `1` |
| `nama_platform` | string | 1-50 characters, required | Platform name | `"Instagram"` |
| `username_path` | string | 1-255 characters, required | Username or handle | `"@johndoe"` |
| `icon_class` | string | Max 100 characters, optional | CSS icon class | `"fab fa-instagram"` |
| `link_url` | string | Valid URL format, required | Full profile URL | `"https://instagram.com/johndoe"` |
| `created_at` | datetime | Auto-generated | Creation timestamp | `"2026-03-01 10:30:00"` |
| `updated_at` | datetime | Auto-updated | Last update timestamp | `"2026-03-01 12:45:00"` |

---

## 📡 Endpoints

### 1. **List All Social Media (Public)**

Retrieve all social media links from all users (public access).

**Endpoint:** `GET /api/sosial-media/public`

**Authentication:** ❌ **Not required** (Public endpoint)

#### Request

No authentication required.

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_user": 1,
      "nama_platform": "Instagram",
      "username_path": "@johndoe",
      "icon_class": "fab fa-instagram",
      "link_url": "https://instagram.com/johndoe",
      "created_at": "2026-03-01 10:30:00",
      "updated_at": "2026-03-01 10:30:00"
    },
    {
      "id": 2,
      "id_user": 2,
      "nama_platform": "Twitter",
      "username_path": "@janedoe_tw",
      "icon_class": "fab fa-twitter",
      "link_url": "https://twitter.com/janedoe_tw",
      "created_at": "2026-03-01 11:00:00",
      "updated_at": "2026-03-01 11:00:00"
    }
  ]
}
```

**✅ Success - Empty List (200 OK)**
```json
{
  "success": true,
  "data": []
}
```

#### Example Request (cURL)

```bash
curl -X GET https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media/public
```

---

### 2. **List Your Social Media**

Retrieve all social media links for the authenticated user.

**Endpoint:** `GET /api/sosial-media`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Role-Based Response

| User Role | Data Returned |
|-----------|---------------|
| **admin** | ALL social media from ALL users |
| **user** | Only social media owned by the authenticated user |

#### Responses

**✅ Success (200 OK) - Admin User**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_user": 1,
      "nama_platform": "Instagram",
      "username_path": "@johndoe",
      "icon_class": "fab fa-instagram",
      "link_url": "https://instagram.com/johndoe",
      "created_at": "2026-03-01 10:30:00",
      "updated_at": "2026-03-01 10:30:00"
    },
    {
      "id": 2,
      "id_user": 2,
      "nama_platform": "Twitter",
      "username_path": "@janedoe",
      "icon_class": "fab fa-twitter",
      "link_url": "https://twitter.com/janedoe",
      "created_at": "2026-03-01 11:00:00",
      "updated_at": "2026-03-01 11:00:00"
    }
  ]
}
```

**✅ Success (200 OK) - Regular User**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_user": 1,
      "nama_platform": "Instagram",
      "username_path": "@johndoe",
      "icon_class": "fab fa-instagram",
      "link_url": "https://instagram.com/johndoe",
      "created_at": "2026-03-01 10:30:00",
      "updated_at": "2026-03-01 10:30:00"
    }
  ]
}
```

**❌ Error: Access Token Required (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

#### Example Request (cURL)

```bash
curl -X GET https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. **Get Social Media by ID**

Retrieve a specific social media link by ID.

**Endpoint:** `GET /api/sosial-media/:id`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**
- `id` (integer) - Social media ID

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "id_user": 1,
    "nama_platform": "Instagram",
    "username_path": "@johndoe",
    "icon_class": "fab fa-instagram",
    "link_url": "https://instagram.com/johndoe",
    "created_at": "2026-03-01 10:30:00",
    "updated_at": "2026-03-01 10:30:00"
  }
}
```

**❌ Error: Invalid Social Media ID (400 Bad Request)**
```json
{
  "success": false,
  "message": "Invalid social media ID"
}
```

**❌ Error: Social Media Not Found (404 Not Found)**
```json
{
  "success": false,
  "message": "Social media not found"
}
```

**❌ Error: Access Token Required (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**❌ Error: Invalid or Expired Token (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### Example Request (cURL)

```bash
curl -X GET https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. **Create Social Media**

Create a new social media link for the authenticated user.

**Endpoint:** `POST /api/sosial-media`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body Schema:**
```json
{
  "nama_platform": "Instagram",
  "username_path": "@johndoe",
  "icon_class": "fab fa-instagram",
  "link_url": "https://instagram.com/johndoe"
}
```

**Validation Rules:**

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `nama_platform` | string | Required, 1-50 characters | Platform name |
| `username_path` | string | Required, 1-255 characters | Username or handle |
| `icon_class` | string | Optional, max 100 characters, nullable | CSS icon class |
| `link_url` | string | Required, valid URL format | Full profile URL |

#### Responses

**✅ Success (201 Created)**
```json
{
  "success": true,
  "message": "Social media created successfully",
  "data": {
    "id": 1,
    "id_user": 1,
    "nama_platform": "Instagram",
    "username_path": "@johndoe",
    "icon_class": "fab fa-instagram",
    "link_url": "https://instagram.com/johndoe",
    "created_at": "2026-03-01 10:30:00",
    "updated_at": "2026-03-01 10:30:00"
  }
}
```

**❌ Error: Validation Error (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["nama_platform"]
    },
    {
      "code": "invalid_string",
      "validation": "url",
      "message": "Invalid URL format",
      "path": ["link_url"]
    }
  ]
}
```

**❌ Error: Validation Error - Platform Too Long (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "too_big",
      "maximum": 50,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at most 50 character(s)",
      "path": ["nama_platform"]
    }
  ]
}
```

**❌ Error: Validation Error - Username Path Too Long (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "too_big",
      "maximum": 255,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at most 255 character(s)",
      "path": ["username_path"]
    }
  ]
}
```

**❌ Error: Invalid URL Format (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_string",
      "validation": "url",
      "message": "Invalid URL format",
      "path": ["link_url"]
    }
  ]
}
```

**❌ Error: Access Token Required (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**❌ Error: Invalid or Expired Token (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### Example Request (cURL)

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nama_platform": "Instagram",
    "username_path": "@johndoe",
    "icon_class": "fab fa-instagram",
    "link_url": "https://instagram.com/johndoe"
  }'
```

---

### 4. **Update Social Media**

Update an existing social media link.

**Endpoint:** `PUT /api/sosial-media/:id`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters:**
- `id` (integer) - Social media ID

**Body Schema (all fields optional):**
```json
{
  "nama_platform": "Instagram Official",
  "username_path": "@johndoe_official",
  "icon_class": "fab fa-instagram-square",
  "link_url": "https://instagram.com/johndoe_official"
}
```

**Validation Rules:**

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `nama_platform` | string | Optional, 1-50 characters | Platform name |
| `username_path` | string | Optional, 1-255 characters | Username or handle |
| `icon_class` | string | Optional, max 100 characters, nullable | CSS icon class |
| `link_url` | string | Optional, valid URL format | Full profile URL |

**Note:** Only include fields you want to update. Omitted fields remain unchanged.

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "message": "Social media updated successfully",
  "data": {
    "id": 1,
    "id_user": 1,
    "nama_platform": "Instagram Official",
    "username_path": "@johndoe_official",
    "icon_class": "fab fa-instagram-square",
    "link_url": "https://instagram.com/johndoe_official",
    "created_at": "2026-03-01 10:30:00",
    "updated_at": "2026-03-01 14:20:00"
  }
}
```

**❌ Error: Invalid Social Media ID (400 Bad Request)**
```json
{
  "success": false,
  "message": "Invalid social media ID"
}
```

**❌ Error: Social Media Not Found (404 Not Found)**
```json
{
  "success": false,
  "message": "Social media not found"
}
```

**❌ Error: Validation Error (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_string",
      "validation": "url",
      "message": "Invalid URL format",
      "path": ["link_url"]
    }
  ]
}
```

**❌ Error: Access Token Required (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**❌ Error: Invalid or Expired Token (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### Example Request (cURL)

**Update all fields:**
```bash
curl -X PUT https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nama_platform": "Instagram Official",
    "username_path": "@johndoe_official",
    "icon_class": "fab fa-instagram-square",
    "link_url": "https://instagram.com/johndoe_official"
  }'
```

**Update single field (partial update):**
```bash
curl -X PUT https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "link_url": "https://instagram.com/newusername"
  }'
```

---

### 5. **Delete Social Media**

Delete a social media link.

**Endpoint:** `DELETE /api/sosial-media/:id`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters:**
- `id` (integer) - Social media ID

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "message": "Social media deleted successfully"
}
```

**❌ Error: Invalid Social Media ID (400 Bad Request)**
```json
{
  "success": false,
  "message": "Invalid social media ID"
}
```

**❌ Error: Social Media Not Found (404 Not Found)**
```json
{
  "success": false,
  "message": "Social media not found"
}
```

**❌ Error: Access Token Required (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**❌ Error: Invalid or Expired Token (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### Example Request (cURL)

```bash
curl -X DELETE https://backend-mondrips-production.mondrips-api.workers.dev/api/sosial-media/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ⚠️ Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]  // Only for validation errors
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (create) |
| **400** | Bad Request | Validation error, invalid ID format |
| **401** | Unauthorized | Missing/invalid token (protected endpoints only) |
| **404** | Not Found | Social media not found or not owned by user |
| **500** | Internal Server Error | Server error |

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Access token is required` | No Authorization header (protected endpoints) | Include Bearer token |
| `Invalid or expired token` | Token expired or invalid | Refresh token or login again |
| `Invalid social media ID` | ID is not a valid integer | Use valid integer ID |
| `Social media not found` | ID doesn't exist or not owned by user | Check ID and ownership |
| `Validation error` | Input validation failed | Check error.errors array |
| `Invalid URL format` | URL doesn't match valid format | Use full URL (https://...) |
| `String must contain at least 1 character(s)` | Empty string provided | Provide non-empty value |
| `String must contain at most X character(s)` | String too long | Reduce character count |

**Note:** The `GET /api/sosial-media` endpoint is public and does not return authentication errors.

### Validation Error Details

When validation fails, the `errors` array contains detailed information:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["nama_platform"]
    },
    {
      "code": "invalid_string",
      "validation": "url",
      "message": "Invalid URL format",
      "path": ["link_url"]
    }
  ]
}
```

**Error object fields:**
- `code`: Error type (e.g., `too_small`, `too_big`, `invalid_string`)
- `minimum`/`maximum`: Constraint value
- `type`: Data type (e.g., `string`)
- `message`: Human-readable error message
- `path`: Array showing which field failed (e.g., `["nama_platform"]`)

---

## 🔒 Security

### Authentication

| Endpoint | Auth Required | Description |
|----------|---------------|-------------|
| `GET /api/sosial-media/public` | ❌ **Not required** | Public endpoint - anyone can access all social media |
| `GET /api/sosial-media` | ✅ Required | Get **your own** social media list |
| `GET /api/sosial-media/:id` | ✅ Required | Get social media by ID (must be owner) |
| `POST /api/sosial-media` | ✅ Required | Create new social media |
| `PUT /api/sosial-media/:id` | ✅ Required | Update social media (must be owner) |
| `DELETE /api/sosial-media/:id` | ✅ Required | Delete social media (must be owner) |

**How to authenticate (for protected endpoints):**
1. Login via `/api/auth/login` endpoint
2. Extract `access_token` from response
3. Include token in Authorization header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### User Ownership Validation

For protected endpoints (GET by ID, POST, PUT, DELETE), users can **only** access their own social media data:

- ✅ User can view their own social media (via `GET /api/sosial-media`)
- ✅ User can view their own social media by ID
- ✅ User can update their own social media
- ✅ User can delete their own social media
- ❌ User **cannot** access another user's social media (returns 404)

**Example:**
```
User A (id_user: 1) tries to access Social Media ID 5 owned by User B (id_user: 2)
→ Response: 404 "Social media not found"
```

### Data Isolation

The API enforces data isolation at the repository level for protected endpoints:

```sql
-- Query includes user ID filter for protected endpoints
SELECT * FROM sosial_media
WHERE id = ? AND id_user = ?
```

This ensures users cannot access, modify, or delete other users' data even if they guess the ID.

### Public vs Protected Endpoints

- **Public Endpoint** (`GET /api/sosial-media/public`): Returns ALL social media from ALL users. Useful for displaying social links on a public page.

- **Protected Endpoint** (`GET /api/sosial-media`): Returns ONLY the authenticated user's social media. Used for user dashboard/management.

---

## 💻 Code Examples

### JavaScript/TypeScript (Fetch API)

```typescript
const API_BASE = 'https://backend-mondrips-production.mondrips-api.workers.dev';

// Get all social media links (public - no auth required)
async function getAllSocialMedia() {
  const response = await fetch(`${API_BASE}/api/sosial-media/public`);
  const { data } = await response.json();
  return data;
}

// Get your social media links (requires auth)
async function getMySocialMedia(accessToken: string) {
  const response = await fetch(`${API_BASE}/api/sosial-media`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const { data } = await response.json();
  return data;
}

// Get social media by ID (requires auth)
async function getSocialMediaById(accessToken: string, id: number) {
  const response = await fetch(`${API_BASE}/api/sosial-media/${id}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const { data } = await response.json();
  return data;
}

// Create social media (requires auth)
async function createSocialMedia(accessToken: string, socialMedia: {
  nama_platform: string;
  username_path: string;
  icon_class?: string;
  link_url: string;
}) {
  const response = await fetch(`${API_BASE}/api/sosial-media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(socialMedia)
  });
  const { data } = await response.json();
  return data;
}

// Update social media
async function updateSocialMedia(accessToken: string, id: number, updates: {
  nama_platform?: string;
  username_path?: string;
  icon_class?: string | null;
  link_url?: string;
}) {
  const response = await fetch(`${API_BASE}/api/sosial-media/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const { data } = await response.json();
  return data;
}

// Delete social media
async function deleteSocialMedia(accessToken: string, id: number) {
  const response = await fetch(`${API_BASE}/api/sosial-media/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const { message } = await response.json();
  return message;
}

// Usage example
async function example() {
  // First, login to get access token
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'user@example.com',
      password: 'securePass123',
      remember_me: true
    })
  });
  
  const { data: loginData } = await loginResponse.json();
  const accessToken = loginData.access_token;
  
  // Create social media
  const instagram = await createSocialMedia(accessToken, {
    nama_platform: 'Instagram',
    username_path: '@johndoe',
    icon_class: 'fab fa-instagram',
    link_url: 'https://instagram.com/johndoe'
  });
  
  console.log('Created:', instagram);

  // Get all social media (public endpoint - no auth required)
  const allSocialMedia = await getAllSocialMedia();
  console.log('All social media (public):', allSocialMedia);

  // Get your social media (requires auth)
  const mySocialMedia = await getMySocialMedia(accessToken);
  console.log('My social media:', mySocialMedia);

  // Update social media
  const updated = await updateSocialMedia(accessToken, instagram.id, {
    username_path: '@johndoe_official'
  });
  
  console.log('Updated:', updated);
  
  // Delete social media
  await deleteSocialMedia(accessToken, instagram.id);
  console.log('Deleted successfully');
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface SocialMedia {
  id: number;
  id_user: number;
  nama_platform: string;
  username_path: string;
  icon_class: string | null;
  link_url: string;
  created_at: string;
  updated_at: string;
}

export function useSocialMedia(accessToken: string | null) {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://backend-mondrips-production.mondrips-api.workers.dev';

  // Fetch all social media (public endpoint)
  const fetchAllSocialMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/sosial-media/public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch social media');
      }
      
      const { data } = await response.json();
      setSocialMedia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create social media
  const createSocialMedia = async (input: {
    nama_platform: string;
    username_path: string;
    icon_class?: string;
    link_url: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/sosial-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken!}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create social media');
      }
      
      setSocialMedia(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update social media
  const updateSocialMedia = async (id: number, updates: {
    nama_platform?: string;
    username_path?: string;
    icon_class?: string | null;
    link_url?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/sosial-media/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken!}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update social media');
      }
      
      setSocialMedia(prev => prev.map(item => 
        item.id === id ? result.data : item
      ));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete social media
  const deleteSocialMedia = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/sosial-media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken!}` }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete social media');
      }
      
      setSocialMedia(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount and token change
  useEffect(() => {
    if (accessToken) {
      fetchSocialMedia();
    }
  }, [accessToken]);

  return {
    socialMedia,
    loading,
    error,
    fetchSocialMedia,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
  };
}

// Usage in component
function SocialMediaManager() {
  const { accessToken } = useAuth(); // Assume useAuth hook exists
  const { socialMedia, loading, error, createSocialMedia, updateSocialMedia, deleteSocialMedia } = useSocialMedia(accessToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    await createSocialMedia({
      nama_platform: formData.get('nama_platform') as string,
      username_path: formData.get('username_path') as string,
      icon_class: formData.get('icon_class') as string || undefined,
      link_url: formData.get('link_url') as string
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Social Media Links</h2>
      
      <form onSubmit={handleSubmit}>
        <input name="nama_platform" placeholder="Platform Name" required />
        <input name="username_path" placeholder="Username" required />
        <input name="icon_class" placeholder="Icon Class" />
        <input name="link_url" placeholder="URL" type="url" required />
        <button type="submit">Add Social Media</button>
      </form>

      <ul>
        {socialMedia.map((item) => (
          <li key={item.id}>
            <h3>{item.nama_platform}</h3>
            <p>{item.username_path}</p>
            <a href={item.link_url} target="_blank" rel="noopener noreferrer">
              {item.link_url}
            </a>
            <button onClick={() => deleteSocialMedia(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const API_BASE = 'https://backend-mondrips-production.mondrips-api.workers.dev';

class SocialMediaAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAll() {
    const response = await this.api.get('/api/sosial-media');
    return response.data.data;
  }

  async getById(id) {
    const response = await this.api.get(`/api/sosial-media/${id}`);
    return response.data.data;
  }

  async create(data) {
    const response = await this.api.post('/api/sosial-media', data);
    return response.data.data;
  }

  async update(id, data) {
    const response = await this.api.put(`/api/sosial-media/${id}`, data);
    return response.data.data;
  }

  async delete(id) {
    const response = await this.api.delete(`/api/sosial-media/${id}`);
    return response.data.message;
  }
}

// Usage
async function main() {
  // Login first
  const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
    identifier: 'user@example.com',
    password: 'securePass123',
    remember_me: true
  });

  const accessToken = loginResponse.data.data.access_token;
  const socialMediaAPI = new SocialMediaAPI(accessToken);

  // Create
  const instagram = await socialMediaAPI.create({
    nama_platform: 'Instagram',
    username_path: '@johndoe',
    icon_class: 'fab fa-instagram',
    link_url: 'https://instagram.com/johndoe'
  });
  console.log('Created:', instagram);

  // Get all
  const all = await socialMediaAPI.getAll();
  console.log('All:', all);

  // Update
  const updated = await socialMediaAPI.update(instagram.id, {
    username_path: '@johndoe_official'
  });
  console.log('Updated:', updated);

  // Delete
  await socialMediaAPI.delete(instagram.id);
  console.log('Deleted successfully');
}

main().catch(console.error);
```

### Python (Requests)

```python
import requests

API_BASE = 'https://backend-mondrips-production.mondrips-api.workers.dev'

class SocialMediaAPI:
    def __init__(self, access_token):
        self.access_token = access_token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def get_all(self):
        response = self.session.get(f'{API_BASE}/api/sosial-media')
        response.raise_for_status()
        return response.json()['data']
    
    def get_by_id(self, id):
        response = self.session.get(f'{API_BASE}/api/sosial-media/{id}')
        response.raise_for_status()
        return response.json()['data']
    
    def create(self, data):
        response = self.session.post(f'{API_BASE}/api/sosial-media', json=data)
        response.raise_for_status()
        return response.json()['data']
    
    def update(self, id, data):
        response = self.session.put(f'{API_BASE}/api/sosial-media/{id}', json=data)
        response.raise_for_status()
        return response.json()['data']
    
    def delete(self, id):
        response = self.session.delete(f'{API_BASE}/api/sosial-media/{id}')
        response.raise_for_status()
        return response.json()['message']

# Usage
def main():
    # Login first
    login_response = requests.post(f'{API_BASE}/api/auth/login', json={
        'identifier': 'user@example.com',
        'password': 'securePass123',
        'remember_me': True
    })
    
    access_token = login_response.json()['data']['access_token']
    api = SocialMediaAPI(access_token)
    
    # Create
    instagram = api.create({
        'nama_platform': 'Instagram',
        'username_path': '@johndoe',
        'icon_class': 'fab fa-instagram',
        'link_url': 'https://instagram.com/johndoe'
    })
    print('Created:', instagram)
    
    # Get all
    all_social_media = api.get_all()
    print('All:', all_social_media)
    
    # Update
    updated = api.update(instagram['id'], {
        'username_path': '@johndoe_official'
    })
    print('Updated:', updated)
    
    # Delete
    api.delete(instagram['id'])
    print('Deleted successfully')

if __name__ == '__main__':
    main()
```

---

## 📚 Related Documentation

- [Authentication.md](/Authentication.md) - Authentication API documentation
- [README.md](/README.md) - Project overview
- [Swagger UI](/docs) - Interactive API documentation

---

**Last Updated:** March 1, 2026  
**API Version:** 1.0.0
