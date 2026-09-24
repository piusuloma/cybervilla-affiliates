/**
 * Talking to cybervilla-affiliates-api.
 *
 * Only the product catalogue so far. Everything else on this dashboard still
 * reads from mock-data.ts and will move across as each part is built.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

export interface ApiProduct {
  /** The store's own product id — what links and orders will point at. */
  id: number;
  name: string;
  description: string;
  price: number;
  /** What the store prices this in. Never assumed; may be absent. */
  currency: string | null;
  category: string | null;
  categoryId: number | null;
  available: boolean;
  /** Relative to the API, not to this app — pass it through productImageUrl(). */
  imageUrl: string;
}

export interface CatalogueState {
  syncedAt: string | null;
  productCount: number;
  /** The copy is older than the backend's freshness window. */
  stale: boolean;
  everSynced: boolean;
  storeConfigured: boolean;
  lastError?: string;
}

export interface ProductsPage {
  products: ApiProduct[];
  page: number;
  perPage: number;
  total: number;
  catalogue: CatalogueState;
}

export interface ApiCategory {
  id: number;
  name: string;
  productCount: number;
}

/** A failure we can show someone, rather than a stack trace. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = "error") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const OFFLINE_MESSAGE =
  "We could not reach the affiliate service. Check your connection and try again.";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    // An aborted request is this component moving on, not a failure to report.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(OFFLINE_MESSAGE, 0, "unreachable");
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Left null — an empty or non-JSON body is handled by the checks below.
  }

  if (!response.ok) {
    const problem = (body ?? {}) as { message?: string; error?: string };
    throw new ApiError(
      problem.message ?? "Something went wrong at our end.",
      response.status,
      problem.error ?? "error",
    );
  }
  return body as T;
}

export function productImageUrl(product: ApiProduct): string {
  return `${API_BASE}${product.imageUrl}`;
}

export function fetchProducts(
  params: { search?: string; categoryId?: number | null; page?: number; perPage?: number },
  signal?: AbortSignal,
): Promise<ProductsPage> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.categoryId) query.set("category", String(params.categoryId));
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));

  const suffix = query.toString();
  return getJson<ProductsPage>(`/products${suffix ? `?${suffix}` : ""}`, signal);
}

export function fetchCategories(signal?: AbortSignal): Promise<{ categories: ApiCategory[] }> {
  return getJson<{ categories: ApiCategory[] }>("/categories", signal);
}
