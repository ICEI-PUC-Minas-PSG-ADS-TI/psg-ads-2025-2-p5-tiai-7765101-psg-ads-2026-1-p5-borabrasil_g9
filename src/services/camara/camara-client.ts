const CAMARA_BASE_URL = "https://dadosabertos.camara.leg.br/api/v2";

/** Direct fetch to Câmara API — used server-side only (Route Handlers) */
export async function camaraFetchDirect<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  let url = `${CAMARA_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Câmara API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

/** Cached fetch via local Route Handler — used client-side */
export async function camaraFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const apiRoute = mapCamaraEndpointToRoute(endpoint, params);

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

function mapCamaraEndpointToRoute(
  endpoint: string,
  params?: Record<string, string>,
): string {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";

  // /deputados → /api/deputados
  if (endpoint === "/deputados") {
    return `/api/deputados${qs}`;
  }

  // /deputados/{id} → /api/deputados/{id}
  const deputadoMatch = endpoint.match(/^\/deputados\/(\d+)$/);
  if (deputadoMatch) {
    return `/api/deputados/${deputadoMatch[1]}${qs}`;
  }

  // /votacoes → /api/votacoes/camara
  if (endpoint === "/votacoes") {
    return `/api/votacoes/camara${qs}`;
  }

  // /votacoes/{id}/votos → /api/votacoes/camara/{id}/votos
  const votosMatch = endpoint.match(/^\/votacoes\/([^/]+)\/votos$/);
  if (votosMatch) {
    return `/api/votacoes/camara/${votosMatch[1]}/votos${qs}`;
  }

  // /votacoes/{id}/orientacoes → /api/votacoes/camara/{id}/orientacoes
  const orientMatch = endpoint.match(/^\/votacoes\/([^/]+)\/orientacoes$/);
  if (orientMatch) {
    return `/api/votacoes/camara/${orientMatch[1]}/orientacoes${qs}`;
  }

  // /proposicoes → /api/proposicoes
  if (endpoint === "/proposicoes") {
    return `/api/proposicoes${qs}`;
  }

  // /proposicoes/{id}/temas → /api/proposicoes/{id}/temas
  const temasMatch = endpoint.match(/^\/proposicoes\/(\d+)\/temas$/);
  if (temasMatch) {
    return `/api/proposicoes/${temasMatch[1]}/temas${qs}`;
  }

  // Fallback: direct API call for uncached endpoints
  let url = `${CAMARA_BASE_URL}${endpoint}`;
  if (params) {
    url += `?${new URLSearchParams(params).toString()}`;
  }
  return url;
}
