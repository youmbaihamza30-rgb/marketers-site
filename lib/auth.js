import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabaseServer';

const SESSION_COOKIE = 'session';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function bufToBase64Url(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToBase64Url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToStr(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64)));
}

async function getKey() {
  const secret = process.env.SESSION_SECRET || 'fallback_secret_key_marketers_2026';
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// role: 'admin' | 'marketer'
export async function createSessionToken(role) {
  const payload = JSON.stringify({ role, iat: Date.now() });
  const payloadB64 = strToBase64Url(payload);
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const sigB64 = bufToBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await getKey();
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
    const expectedSigB64 = bufToBase64Url(expectedSig);
    if (expectedSigB64 !== sigB64) return null;
    const payload = JSON.parse(base64UrlToStr(payloadB64));
    if (Date.now() - payload.iat > THIRTY_DAYS * 1000) return null;
    return payload; // { role, iat }
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };

// التحقق المباشر من الرموز بدون انتظار قاعدة البيانات
export async function checkPassword(password) {
  if (password === '0101') {
    return 'admin';
  }
  if (password === '0011') {
    return 'marketer';
  }
  return null;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
