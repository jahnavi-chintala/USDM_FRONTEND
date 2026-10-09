/**
 * Read/write JSON in Web Storage without ever throwing.
 *
 * Storage can be unavailable (private mode, blocked site data, quota exceeded). The UI must
 * keep working in that case, so every failure falls back to the default value or is ignored.
 */

type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(kind: StorageKind, key: string, fallback: T): T {
  try {
    const raw = getStorage(kind)?.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(kind: StorageKind, key: string, value: unknown): void {
  try {
    getStorage(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the value simply is not remembered.
  }
}

export function removeItem(kind: StorageKind, key: string): void {
  try {
    getStorage(kind)?.removeItem(key);
  } catch {
    // Nothing to do.
  }
}
