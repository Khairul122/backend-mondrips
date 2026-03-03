# 🔐 Authentication API Documentation

Complete documentation for the Mondrips Authentication API, including registration, login, token management, and user profile endpoints.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication Flow](#authentication-flow)
- [Endpoints](#endpoints)
  - [Register](#1-register)
  - [Login](#2-login)
  - [Refresh Token](#3-refresh-token)
  - [Logout](#4-logout)
  - [Change Password](#5-change-password)
  - [Get Current User](#6-get-current-user)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)
- [Code Examples](#code-examples)

---

## 📖 Overview

The Authentication API provides secure user authentication using **JWT (JSON Web Tokens)** with the following features:

| Feature | Description |
|---------|-------------|
| **Access Token** | Short-lived token (15 minutes) for API authentication |
| **Remember Me** | Long-lived HTTPOnly cookie (30 days) for persistent sessions |
| **Token Refresh** | Extend session without re-login using refresh endpoint |
| **Password Security** | SHA-256 hashing using Web Crypto API |
| **Dual Identifier** | Login with email OR username |

---

## 🌐 Base URL

| Environment | URL |
|-------------|-----|
| **Production** | `https://backend-mondrips-production.mondrips-api.workers.dev` |
| **Staging** | `https://backend-mondrips-staging.mondrips-api.workers.dev` |
| **Local** | `http://localhost:8787` |

**All examples below use the production URL. Replace with your environment URL as needed.**

---

## 🔄 Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Login    │───→ Access Token (15 min) + Remember Cookie (30 days)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Calls  │───→ Use Access Token in Authorization header
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Refresh   │───→ Get new Access Token (using cookie)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Logout   │───→ Invalidate session
└─────────────┘
```

---

## 📡 Endpoints

### 1. **Register**

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** ❌ Not required

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Schema:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePass123",
  "full_name": "John Doe",
  "role": "user"
}
```

**Validation Rules:**

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `email` | string | Valid email format, unique | User's email address |
| `username` | string | 3-50 characters, unique | Unique username |
| `password` | string | Min 8 chars, must contain letters and numbers | Password (alphanumeric) |
| `full_name` | string | 1-100 characters | User's full name |
| `role` | string | Optional, enum: `['user', 'admin']`, default: `'user'` | User role (determines access level) |

#### Responses

**✅ Success (201 Created)**
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
    "created_at": "2026-03-01 10:30:00",
    "updated_at": "2026-03-01 10:30:00",
    "last_login": null
  }
}
```

**❌ Error: Email Already Registered (400 Bad Request)**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**❌ Error: Username Already Taken (400 Bad Request)**
```json
{
  "success": false,
  "message": "Username already taken"
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
      "minimum": 3,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 3 character(s)",
      "path": ["username"]
    },
    {
      "code": "invalid_string",
      "validation": "regex",
      "message": "Password must contain letters and numbers",
      "path": ["password"]
    }
  ]
}
```

**❌ Error: Invalid Email Format (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "invalid_string",
      "validation": "email",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

#### Example Request (cURL)

**Register as regular user (default):**
```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "securePass123",
    "full_name": "John Doe"
  }'
```

**Register as admin:**
```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "adminSecurePass123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

---

### 2. **Login**

Authenticate user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Authentication:** ❌ Not required

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Schema:**
```json
{
  "identifier": "user@example.com",
  "password": "securePass123",
  "remember_me": true
}
```

**Validation Rules:**

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `identifier` | string | Required (min 1 char) | Email OR username |
| `password` | string | Required (min 1 char) | User's password |
| `remember_me` | boolean | Optional (default: false) | Enable persistent session |

#### Responses

**✅ Success (200 OK)**
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
      "role": "user",
      "is_active": 1,
      "created_at": "2026-03-01 10:30:00",
      "updated_at": "2026-03-01 10:30:00",
      "last_login": "2026-03-01 12:45:00"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTI5ODAwMCwiZXhwIjoxNzA5Mjk4OTAwfQ.abc123...",
    "token_type": "Bearer",
    "expires_in": "15m"
  }
}
```

**Response Headers:**
```
Set-Cookie: remember_token=abc123def456...; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Strict
```

**❌ Error: Invalid Credentials (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**❌ Error: Account Deactivated (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Account is deactivated"
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
      "path": ["identifier"]
    }
  ]
}
```

#### Example Request (cURL)

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "securePass123",
    "remember_me": true
  }' \
  -c cookies.txt
```

**Note:** The `-c cookies.txt` flag saves cookies to a file for subsequent requests.

---

### 3. **Refresh Token**

Get a new access token using the remember token cookie.

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** ❌ Not required (uses HTTPOnly cookie)

#### Request

**Headers:**
```
Cookie: remember_token=abc123...
```

**Body:** None (authentication via cookie)

#### Responses

**✅ Success (200 OK)**
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

**❌ Error: Remember Token Not Found (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Remember token not found"
}
```

**❌ Error: Invalid Remember Token (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Invalid remember token"
}
```

**❌ Error: Account Deactivated (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

#### Example Request (cURL)

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/refresh \
  -b cookies.txt
```

**Note:** The `-b cookies.txt` flag sends cookies from the file.

---

### 4. **Logout**

Invalidate user session and clear remember token.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** None

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "message": "Logout successful"
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

**❌ Error: Unauthorized (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Example Request (cURL)

```bash
curl -X POST https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. **Change Password**

Update user password with verification.

**Endpoint:** `PUT /api/auth/change-password`

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
  "current_password": "oldSecurePass123",
  "new_password": "newSecurePass456"
}
```

**Validation Rules:**

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `current_password` | string | Required (min 1 char) | Current password |
| `new_password` | string | Min 8 chars, letters + numbers | New password (alphanumeric) |

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**❌ Error: Current Password Incorrect (400 Bad Request)**
```json
{
  "success": false,
  "message": "Current password is incorrect"
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
      "minimum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 8 character(s)",
      "path": ["new_password"]
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
curl -X PUT https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldSecurePass123",
    "new_password": "newSecurePass456"
  }'
```

---

### 6. **Get Current User**

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** ✅ Required (Bearer token)

#### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** None

#### Responses

**✅ Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "id_user": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "user",
    "is_active": 1,
    "created_at": "2026-03-01 10:30:00",
    "updated_at": "2026-03-01 10:30:00",
    "last_login": "2026-03-01 12:45:00"
  }
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

**❌ Error: Unauthorized (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Example Request (cURL)

```bash
curl -X GET https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/me \
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
| **200** | OK | Successful request |
| **201** | Created | Successful registration |
| **400** | Bad Request | Validation error, invalid input |
| **401** | Unauthorized | Missing/invalid token, invalid credentials |
| **500** | Internal Server Error | Server error |

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Email already registered` | Email exists in database | Use different email or login |
| `Username already taken` | Username exists | Choose different username |
| `Invalid credentials` | Wrong email/username or password | Check credentials |
| `Account is deactivated` | User account disabled | Contact support |
| `Access token is required` | No Authorization header | Include Bearer token |
| `Invalid or expired token` | Token expired or invalid | Refresh token or login again |
| `Remember token not found` | No cookie present | Login with remember_me |
| `Invalid remember token` | Cookie token invalid | Login again |
| `Current password is incorrect` | Wrong current password | Enter correct password |
| `Validation error` | Input validation failed | Check error.errors array |

---

## 🔒 Security Best Practices

### Token Storage

**✅ DO:**
- Store access tokens in memory (JavaScript variable)
- Use HTTPOnly cookies for remember tokens (automatic)
- Send tokens over HTTPS only
- Refresh tokens before expiration

**❌ DON'T:**
- Store tokens in localStorage (XSS vulnerability)
- Store tokens in regular cookies (CSRF vulnerability)
- Log tokens in console or server logs
- Share tokens between users

### Password Requirements

- Minimum **8 characters**
- Must contain **letters** (a-z, A-Z)
- Must contain **numbers** (0-9)
- Stored as **SHA-256 hash** (never plain text)

### Token Expiration

| Token Type | Expiry | Storage | Purpose |
|------------|--------|---------|---------|
| **Access Token** | 15 minutes | Client memory | API authentication |
| **Remember Token** | 30 days | HTTPOnly cookie | Session persistence |

### Best Practice Flow

```javascript
// 1. Login and store tokens
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    password: 'securePass123',
    remember_me: true
  })
});

const { data } = await loginResponse.json();
let accessToken = data.access_token; // Store in memory

// 2. Use access token for API calls
async function apiCall(endpoint) {
  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    accessToken = await refreshAccessToken();
    // Retry original request
    return apiCall(endpoint);
  }
  
  return response;
}

// 3. Refresh access token
async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Send cookies
  });
  
  const { data } = await response.json();
  return data.access_token;
}

// 4. Logout
async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  accessToken = null;
}
```

---

## 💻 Code Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Register
async function register(email: string, username: string, password: string, fullName: string, role?: 'user' | 'admin') {
  const response = await fetch('https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, full_name: fullName, role })
  });
  return await response.json();
}

// Login
async function login(identifier: string, password: string, rememberMe = true) {
  const response = await fetch('https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password, remember_me: rememberMe })
  });
  return await response.json();
}

// Get Current User
async function getCurrentUser(accessToken: string) {
  const response = await fetch('https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return await response.json();
}

// Change Password
async function changePassword(accessToken: string, currentPassword: string, newPassword: string) {
  const response = await fetch('https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/change-password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
  });
  return await response.json();
}

// Logout
async function logout(accessToken: string) {
  const response = await fetch('https://backend-mondrips-production.mondrips-api.workers.dev/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include'
  });
  return await response.json();
}
```

### React Hook Example

```typescript
import { useState, createContext, useContext, useEffect } from 'react';

interface User {
  id_user: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchUser(token: string) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setUser(data);
        setAccessToken(token);
      } else {
        // Token expired, try refresh
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          const { data: refreshData } = await refreshResponse.json();
          setAccessToken(refreshData.access_token);
          localStorage.setItem('access_token', refreshData.access_token);
          fetchUser(refreshData.access_token);
        } else {
          localStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(identifier: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password, remember_me: true })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const { data } = await response.json();
    setAccessToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('access_token', data.access_token);
  }

  async function register(email: string, username: string, password: string, fullName: string, role?: 'user' | 'admin') {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, full_name: fullName, role })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('access_token');
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Node.js (Axios)

```javascript
const axios = require('axios');

const API_BASE = 'https://backend-mondrips-production.mondrips-api.workers.dev';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Send cookies
});

// Interceptor to add access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const refreshResponse = await axios.post(`${API_BASE}/api/auth/refresh`, null, {
          withCredentials: true
        });
        
        const newToken = refreshResponse.data.data.access_token;
        localStorage.setItem('access_token', newToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Usage
async function login(identifier, password) {
  const response = await api.post('/api/auth/login', {
    identifier,
    password,
    remember_me: true
  });
  return response.data;
}

async function getCurrentUser() {
  const response = await api.get('/api/auth/me');
  return response.data;
}

async function changePassword(currentPassword, newPassword) {
  const response = await api.put('/api/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
}

async function logout() {
  const response = await api.post('/api/auth/logout');
  return response.data;
}
```

---

## 📚 Related Documentation

- [Swagger UI](/docs) - Interactive API documentation
- [README.md](/README.md) - Project overview
- [DEPLOYMENT.md](/DEPLOYMENT.md) - Deployment guide

---

**Last Updated:** March 1, 2026  
**API Version:** 1.0.0
