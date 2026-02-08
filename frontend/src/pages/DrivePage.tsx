import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { docsApi } from "../api/endpoints";
import type { Doc } from "../api/types";
import { useAuth } from "../auth/AuthContext";

export default function DrivePage() {
  const nav = useNavigate();
  const { token, logout } = useAuth();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    if (!token) return;
    setErr(null);
    setLoading(true);
    try {
      const list = await docsApi.list(token);
      setDocs(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createDoc() {
    if (!token) return;
    if (!title.trim()) return;

    setCreating(true);
    setErr(null);
    try {
      const doc = await docsApi.create(token, { title: title.trim(), content: "" });
      setTitle("");
      nav(`/docs/${doc._id}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to create document");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22 }}>My Drive</h1>
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
        >
          Logout
        </button>
      </header>

      <section style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New document title"
          style={{ flex: 1 }}
        />
        <button disabled={creating || !title.trim()} onClick={createDoc}>
          {creating ? "Creating..." : "Create"}
        </button>
        <button onClick={refresh}>Refresh</button>
      </section>

      {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}

      <section style={{ marginTop: 16 }}>
        {loading ? (
          <div>Loading…</div>
        ) : docs.length === 0 ? (
          <div>No documents yet.</div>
        ) : (
          <ul style={{ display: "grid", gap: 10, paddingLeft: 16 }}>
            {docs.map((d) => (
              <li key={d._id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{d._id}</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link to={`/docs/${d._id}`}>Open</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
