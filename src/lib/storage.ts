/**
 * Safe localStorage wrappers — silently no-op in private/incognito mode
 * where localStorage access throws SecurityError.
 */

export function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode or storage quota — swallow
  }
}

export function safeStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // swallow
  }
}
