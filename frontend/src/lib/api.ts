export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function getApiBaseUrl(): string {
  const envUrl =
    (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env?.STORE_API_URL)
      ? String(import.meta.env.STORE_API_URL)
      : typeof process !== "undefined" && process.env?.STORE_API_URL
      ? process.env.STORE_API_URL
      : "";

  if (!envUrl?.trim()) {
    throw new Error("STORE_API_URL is not configured. Set STORE_API_URL in your environment.");
  }

  return envUrl.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  if (ABSOLUTE_URL_RE.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

async function handleError(res: Response): Promise<never> {
  const body = await res.text();
  let message = `API request failed with status ${res.status}`;

  try {
    const payload = JSON.parse(body);
    if (payload?.error) message = String(payload.error);
    else if (payload?.message) message = String(payload.message);
  } catch {
    if (body) message = body;
  }

  throw new Error(message);
}

async function request<T>(method: string, path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const init: RequestInit = {
    method,
    ...options,
    headers,
  };

  if (options.body !== undefined) {
    if (options.body instanceof FormData || typeof options.body === "string") {
      init.body = options.body as unknown as BodyInit;
    } else {
      init.body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }
  }

  const url = buildUrl(path);
  const res = await fetch(url, init);
  if (!res.ok) {
    await handleError(res);
  }
  return parseResponse<T>(res);
}

export const api = {
  request,
  getApiBaseUrl,
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "body">) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">) =>
    request<T>("PUT", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "body">) => request<T>("DELETE", path, options),
};
