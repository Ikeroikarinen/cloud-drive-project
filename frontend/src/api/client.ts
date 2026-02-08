export const API_BASE = "http://localhost:3001";

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: any;
};

export async function requestJson<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}
