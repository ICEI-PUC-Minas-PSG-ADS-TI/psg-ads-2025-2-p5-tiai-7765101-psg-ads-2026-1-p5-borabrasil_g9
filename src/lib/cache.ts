// Server-side in-memory cache with TTL and ETag support.
// Used by Route Handlers to avoid hitting external APIs on every request.

interface CacheEntry<T> {
  data: T;
  etag: string | null;
  lastModified: string | null;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, CacheEntry<unknown>>();

// Default TTLs (in ms)
export const TTL = {
  LISTA_PARLAMENTARES: 6 * 60 * 60 * 1000, // 6h — lista muda raramente
  DETALHE_PARLAMENTAR: 24 * 60 * 60 * 1000, // 24h
  VOTACOES: 30 * 60 * 1000, // 30min — pode haver votações novas
  VOTOS: 60 * 60 * 1000, // 1h — votos de uma votação não mudam
  ORIENTACOES: 60 * 60 * 1000, // 1h
  PROPOSICOES: 2 * 60 * 60 * 1000, // 2h
  PRESENCA: 60 * 60 * 1000, // 1h
  BULK: 24 * 60 * 60 * 1000, // 24h — bulk downloads diários
} as const;

export function getCached<T>(key: string): CacheEntry<T> | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    // Expired — but keep for conditional fetch (ETag)
    return { ...entry, data: entry.data };
  }

  return entry;
}

export function isStale(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > entry.ttl;
}

export function setCache<T>(
  key: string,
  data: T,
  ttl: number,
  etag?: string | null,
  lastModified?: string | null,
): void {
  store.set(key, {
    data,
    etag: etag ?? null,
    lastModified: lastModified ?? null,
    timestamp: Date.now(),
    ttl,
  });
}

export function getEtag(key: string): string | null {
  return (store.get(key) as CacheEntry<unknown> | undefined)?.etag ?? null;
}

export function getLastModified(key: string): string | null {
  return (
    (store.get(key) as CacheEntry<unknown> | undefined)?.lastModified ?? null
  );
}

export function invalidate(key: string): void {
  store.delete(key);
}

export function invalidatePrefix(prefix: string): void {
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  });
}

export function getCacheStats(): {
  entries: number;
  keys: string[];
} {
  return {
    entries: store.size,
    keys: Array.from(store.keys()),
  };
}

// Conditional fetch: uses ETag/Last-Modified to avoid re-downloading unchanged data
export async function conditionalFetch<T>(
  url: string,
  cacheKey: string,
  ttl: number,
  headers?: Record<string, string>,
): Promise<{ data: T; fromCache: boolean }> {
  // Check cache first
  const cached = getCached<T>(cacheKey);
  if (cached && !isStale(cacheKey)) {
    return { data: cached.data, fromCache: true };
  }

  // Build conditional headers
  const fetchHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (cached?.etag) {
    fetchHeaders["If-None-Match"] = cached.etag;
  }
  if (cached?.lastModified) {
    fetchHeaders["If-Modified-Since"] = cached.lastModified;
  }

  const response = await fetch(url, { headers: fetchHeaders });

  // 304 Not Modified — data hasn't changed, refresh TTL
  if (response.status === 304 && cached) {
    setCache(cacheKey, cached.data, ttl, cached.etag, cached.lastModified);
    return { data: cached.data, fromCache: true };
  }

  if (!response.ok) {
    // If we have stale cache, return it rather than throwing
    if (cached) {
      console.warn(
        `[cache] Fetch failed (${response.status}) for ${cacheKey}, returning stale data`,
      );
      return { data: cached.data, fromCache: true };
    }
    throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T;
  const etag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");

  setCache(cacheKey, data, ttl, etag, lastModified);
  return { data, fromCache: false };
}
