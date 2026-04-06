import { sleep } from "@/lib/utils";

// Direct Senado API (used server-side in Route Handlers)
const SENADO_BASE_URL = "https://legis.senado.leg.br/dadosabertos";
const MAX_REQUESTS_PER_SECOND = 10;
const REQUEST_INTERVAL_MS = Math.ceil(1000 / MAX_REQUESTS_PER_SECOND);

let lastRequestTime = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_INTERVAL_MS) {
    await sleep(REQUEST_INTERVAL_MS - elapsed);
  }
  lastRequestTime = Date.now();
}

/** Direct fetch to Senado API — used server-side only (Route Handlers) */
export async function senadoFetchDirect<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  await throttle();

  let url = `${SENADO_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    await sleep(2000);
    return senadoFetchDirect<T>(endpoint, params);
  }

  if (!response.ok) {
    throw new Error(
      `Senado API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

/** Cached fetch via local Route Handler — used client-side */
export async function senadoFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  // Map known Senado endpoints to our cached Route Handlers
  const apiRoute = mapSenadoEndpointToRoute(endpoint, params);

  const response = await fetch(apiRoute);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `API Error: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as { data: T; fromCache: boolean };
  return json.data as T;
}

function mapSenadoEndpointToRoute(
  endpoint: string,
  params?: Record<string, string>,
): string {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";

  // /senador/lista/atual → /api/senadores
  if (endpoint === "/senador/lista/atual") {
    return `/api/senadores${qs}`;
  }

  // /senador/{codigo} → /api/senadores/{codigo}
  const senadorMatch = endpoint.match(/^\/senador\/(\d+)$/);
  if (senadorMatch) {
    return `/api/senadores/${senadorMatch[1]}${qs}`;
  }

  // /votacao → /api/votacoes/senado
  if (endpoint === "/votacao" || endpoint.startsWith("/votacao?")) {
    return `/api/votacoes/senado${qs}`;
  }

  // /plenario/lista/presenca/{inicio}/{fim} → /api/presenca/senado?dataInicio=&dataFim=
  const presencaMatch = endpoint.match(
    /^\/plenario\/lista\/presenca\/([^/]+)\/([^/]+)$/,
  );
  if (presencaMatch) {
    return `/api/presenca/senado?dataInicio=${presencaMatch[1]}&dataFim=${presencaMatch[2]}`;
  }

  // /plenario/votacao/orientacaoBancada/{data} — not yet cached, fall through to direct
  // /processo/{id} — not yet cached, fall through to direct

  // Fallback: direct API call for uncached endpoints
  let url = `https://legis.senado.leg.br/dadosabertos${endpoint}`;
  if (params) {
    url += `?${new URLSearchParams(params).toString()}`;
  }
  return url;
}
