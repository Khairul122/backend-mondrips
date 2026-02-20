export interface JWTPayload {
  id_user: number;
  email: string;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64UrlEncode = (data: ArrayBuffer): string => {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (base64: string): Uint8Array => {
  const base64WithPads = base64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64WithPads);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const signJWT = async (header: object, payload: object, secret: string): Promise<string> => {
  const headerBase64 = base64UrlEncode(encoder.encode(JSON.stringify(header)).buffer);
  const payloadBase64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)).buffer);
  const data = `${headerBase64}.${payloadBase64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureBase64 = base64UrlEncode(signature);

  return `${data}.${signatureBase64}`;
};

const verifyJWT = async (token: string, secret: string): Promise<JWTPayload> => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerBase64, payloadBase64, signatureBase64] = parts;
  const data = `${headerBase64}.${payloadBase64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signature = base64UrlDecode(signatureBase64);
  const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));

  if (!isValid) {
    throw new Error('Invalid token signature');
  }

  const payloadBytes = base64UrlDecode(payloadBase64);
  const payload = JSON.parse(decoder.decode(payloadBytes)) as JWTPayload;

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired');
  }

  return payload;
};

export const generateAccessToken = async (payload: Omit<JWTPayload, 'exp' | 'iat'>, secret: string, expiresIn: string): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = parseExpiration(expiresIn);
  
  const token = await signJWT(header, { ...payload, iat: now, exp: now + exp }, secret);
  
  return token;
};

const parseExpiration = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
};

export { signJWT as jwtSign, verifyJWT };
