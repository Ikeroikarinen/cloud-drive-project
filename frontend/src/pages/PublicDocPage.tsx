import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicApi } from "../api/endpoints";
import type { PublicDoc } from "../api/types";

export default function PublicDocPage() {
  const { token } = useParams();
  const publicToken = useMemo(() => token ?? "", [token]);

  const [doc, setDoc] = useState<PublicDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicToken) return;
    setLoading(true);
    setErr(null);

    publicApi
      .get(publicToken)
      .then((d) => setDoc(d))
      .catch((e: any) => setErr(e?.message || "Failed to load public document"))
      .finally(() => setLoading(false));
  }, [publicToken]);

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">← Back</Link>
        <span style={{ opacity: 0.7 }}>Public (read-only)</span>
      </header>

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading…</div>
      ) : err ? (
        <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>
      ) : doc ? (
        <>
          <h1 style={{ marginTop: 16 }}>{doc.title}</h1>
          <div
            style={{
              marginTop: 12,
              whiteSpace: "pre-wrap",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {doc.content}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 12 }}>Not found</div>
      )}
    </div>
  );
}
