import { API_URL } from './config';
import { readJSON, writeJSON } from './storage';
import type { Tokens } from './types';

const TOKEN_KEY = 'academia.tokens';

let tokens: Tokens | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export async function loadTokens(): Promise<Tokens | null> {
  if (tokens) return tokens;
  const stored = await readJSON<Tokens>(TOKEN_KEY);
  tokens = stored && stored.accessToken && stored.refreshToken ? stored : null;
  return tokens;
}

export function currentTokens(): Tokens | null {
  return tokens;
}

export async function saveTokens(next: Tokens): Promise<void> {
  tokens = next;
  await writeJSON(TOKEN_KEY, next);
}

export async function clearTokens(): Promise<void> {
  tokens = null;
  await writeJSON(TOKEN_KEY, null);
}

/**
 * Rotating refresh token exchange. Concurrent callers share a single request,
 * so parallel 401s cannot revoke each other's token.
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const current = tokens ?? (await loadTokens());
    if (!current?.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (!response.ok) return false;

      const payload = (await response.json()) as { data?: Partial<Tokens> };
      const next = payload?.data;
      if (!next?.accessToken || !next.refreshToken) return false;

      await saveTokens({ accessToken: next.accessToken, refreshToken: next.refreshToken });
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
