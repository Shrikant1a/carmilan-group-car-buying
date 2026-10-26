/**
 * Cryptographic helper for secure client/offline password hashing.
 * Uses standard SHA-256 via Web Crypto API with cryptographic salt.
 * In live production with Supabase, Supabase Auth handles server-side bcrypt/argon2.
 */

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const effectiveSalt = salt || generateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':' + effectiveSalt);

  // Check if crypto.subtle is available (browser and modern Node.js)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash: hashHex, salt: effectiveSalt };
  }

  // Fallback lightweight string hash for environments without Web Crypto
  let hashVal = 0;
  const combined = password + ':' + effectiveSalt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hashVal = (hashVal << 5) - hashVal + char;
    hashVal |= 0;
  }
  return { hash: Math.abs(hashVal).toString(16).padStart(16, '0'), salt: effectiveSalt };
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const result = await hashPassword(password, salt);
  return result.hash === storedHash;
}

export function generateSalt(length = 16): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 18);
}
