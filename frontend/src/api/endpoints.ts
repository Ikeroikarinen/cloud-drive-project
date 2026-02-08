import { requestJson } from "./client";
import type { AuthResponse, Doc, PublicDoc, ShareResponse } from "./types";

export const authApi = {
  register: (username: string, email: string, password: string) =>
    requestJson<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: { username, email, password },
    }),

  login: (login: string, password: string) =>
    requestJson<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { login, password },
    }),
};

export const meApi = {
  get: (token: string) => requestJson<{ ok: boolean; userId: string }>("/api/me", { token }),
};

export const docsApi = {
  list: (token: string) => requestJson<Doc[]>("/api/docs", { token }),

  get: (token: string, id: string) => requestJson<Doc>(`/api/docs/${id}`, { token }),

  create: (token: string, input: { title: string; content?: string }) =>
    requestJson<Doc>("/api/docs", { method: "POST", token, body: input }),

  update: (token: string, id: string, input: { title: string; content: string }) =>
    requestJson<Doc>(`/api/docs/${id}`, { method: "PATCH", token, body: input }),

  remove: (token: string, id: string) =>
    requestJson<{ ok: boolean }>(`/api/docs/${id}`, { method: "DELETE", token }),

  // backend vaatii body: { isPublic: boolean }
  share: (token: string, id: string, isPublic: boolean) =>
    requestJson<ShareResponse>(`/api/docs/${id}/share`, {
      method: "POST",
      token,
      body: { isPublic },
    }),

  addEditor: (token: string, id: string, email: string) =>
    requestJson<{ ok: boolean; editorIds?: string[] }>(`/api/docs/${id}/editors`, {
      method: "POST",
      token,
      body: { email },
    }),

  removeEditor: (token: string, id: string, editorId: string) =>
    requestJson<{ ok: boolean; editorIds?: string[] }>(`/api/docs/${id}/editors/${editorId}`, {
      method: "DELETE",
      token,
    }),

  lock: (token: string, id: string) =>
    requestJson<any>(`/api/docs/${id}/lock`, { method: "POST", token, body: {} }),

  unlock: (token: string, id: string) =>
    requestJson<any>(`/api/docs/${id}/unlock`, { method: "POST", token, body: {} }),
};

export const publicApi = {
  get: (token: string) => requestJson<PublicDoc>(`/api/public/${token}`),
};
