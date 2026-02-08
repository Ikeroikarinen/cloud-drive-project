import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { docsApi } from "../api/endpoints";
import type { Doc } from "../api/types";
import { useAuth } from "../auth/AuthContext";

export default function DocEditorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();

  const docId = useMemo(() => id ?? "", [id]);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const [editorEmail, setEditorEmail] = useState("");
  const [busyEditors, setBusyEditors] = useState(false);
  const [busyLock, setBusyLock] = useState(false);

  async function load() {
    if (!token || !docId) return;
    setErr(null);
    setLoading(true);
    try {
      const d = await docsApi.get(token, docId);
      setDoc(d);
      setTitle(d.title);
      setContent(d.content);

      const anyDoc = d as any;
      setPublicToken(anyDoc.publicToken ?? null);
      setIsPublic(Boolean(anyDoc.isPublic));
    } catch (e: any) {
      setErr(e?.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  // best effort: try acquire lock on mount and release on unmount
  useEffect(() => {
    if (!token || !docId) return;
    docsApi.lock(token, docId).catch(() => {});
    return () => {
      docsApi.unlock(token, docId).catch(() => {});
    };
  }, [token, docId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, docId]);

  async function save() {
    if (!token || !docId) return;
    setSaving(true);
    setErr(null);
    try {
      const updated = await docsApi.update(token, docId, { title, content });
      setDoc(updated);

      const anyDoc = updated as any;
      setPublicToken(anyDoc.publicToken ?? null);
      setIsPublic(Boolean(anyDoc.isPublic));
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function setPublic(makePublic: boolean) {
    if (!token || !docId) return;
    setErr(null);
    try {
      const res = await docsApi.share(token, docId, makePublic);
      setIsPublic(Boolean((res as any).isPublic));
      setPublicToken((res as any).publicToken ?? null);

      // varmista state myös doc-objektiin (helpottaa UI:ta)
      setDoc((prev) =>
        prev
          ? ({
              ...prev,
              isPublic: Boolean((res as any).isPublic),
              publicToken: (res as any).publicToken ?? null,
            } as any)
          : prev
      );
    } catch (e: any) {
      setErr(e?.message || "Failed to share");
    }
  }

  async function copyPublicUrl() {
    if (!publicToken) return;
    const url = `${window.location.origin}/public/${publicToken}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback
      prompt("Copy this link:", url);
    }
  }

  async function addEditor() {
    if (!token || !docId) return;
    const email = editorEmail.trim();
    if (!email) return;

    setBusyEditors(true);
    setErr(null);
    try {
      await docsApi.addEditor(token, docId, email);
      setEditorEmail("");
      await load(); // refetch -> saat editorIds + lock + share -tilat ajan tasalle
    } catch (e: any) {
      setErr(e?.message || "Failed to add editor");
    } finally {
      setBusyEditors(false);
    }
  }

  async function removeEditor(editorId: string) {
    if (!token || !docId) return;
    if (!confirm("Remove editor access?")) return;

    setBusyEditors(true);
    setErr(null);
    try {
      await docsApi.removeEditor(token, docId, editorId);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to remove editor");
    } finally {
      setBusyEditors(false);
    }
  }

  async function lockNow() {
    if (!token || !docId) return;
    setBusyLock(true);
    setErr(null);
    try {
      await docsApi.lock(token, docId);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to lock");
    } finally {
      setBusyLock(false);
    }
  }

  async function unlockNow() {
    if (!token || !docId) return;
    setBusyLock(true);
    setErr(null);
    try {
      await docsApi.unlock(token, docId);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to unlock");
    } finally {
      setBusyLock(false);
    }
  }

  async function removeDoc() {
    if (!token || !docId) return;
    if (!confirm("Delete this document?")) return;
    setErr(null);
    try {
      await docsApi.remove(token, docId);
      nav("/");
    } catch (e: any) {
      setErr(e?.message || "Failed to delete");
    }
  }

  const publicUrl = publicToken ? `${window.location.origin}/public/${publicToken}` : null;

  const editorIds = (doc as any)?.editorIds as string[] | undefined;
  const lockedBy = (doc as any)?.lockedBy as string | null | undefined;
  const lockedAt = (doc as any)?.lockedAt as string | null | undefined;

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/">← Back</Link>
          <h1 style={{ fontSize: 20 }}>{doc?.title ?? "Document"}</h1>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={removeDoc}>Delete</button>
          <button disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading…</div>
      ) : (
        <>
          {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}

          {/* Lock status */}
          <section
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>Lock</strong>{" "}
                {lockedBy ? (
                  <span style={{ opacity: 0.85 }}>
                    (lockedBy: <code>{lockedBy}</code>
                    {lockedAt ? ` @ ${new Date(lockedAt).toLocaleString()}` : ""})
                  </span>
                ) : (
                  <span style={{ opacity: 0.75 }}>(not locked)</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button disabled={busyLock} onClick={lockNow}>
                  {busyLock ? "..." : "Acquire lock"}
                </button>
                <button disabled={busyLock} onClick={unlockNow}>
                  {busyLock ? "..." : "Release lock"}
                </button>
              </div>
            </div>
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              Lock prevents simultaneous edits. App also tries to lock automatically when opening the editor.
            </div>
          </section>

          {/* Editor */}
          <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Content</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                style={{ width: "100%" }}
              />
            </label>
          </section>

          {/* Public share */}
          <section style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPublic(true)}>{isPublic ? "Update public link" : "Create public link"}</button>

            {isPublic && (
              <button onClick={() => setPublic(false)} style={{ opacity: 0.9 }}>
                Disable public link
              </button>
            )}

            {publicUrl ? (
              <>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  Open public link
                </a>
                <button onClick={copyPublicUrl}>Copy link</button>
              </>
            ) : (
              <span style={{ opacity: 0.8 }}>No public link yet</span>
            )}
          </section>

          {/* Editors */}
          <section
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <strong>Editors (edit access)</strong>
              <span style={{ opacity: 0.75, fontSize: 13 }}>Add by email, remove by id</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={editorEmail}
                onChange={(e) => setEditorEmail(e.target.value)}
                placeholder="editor@example.com"
                style={{ minWidth: 260 }}
              />
              <button disabled={busyEditors} onClick={addEditor}>
                {busyEditors ? "..." : "Add editor"}
              </button>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              {(editorIds?.length ?? 0) === 0 ? (
                <div style={{ opacity: 0.8 }}>No editors added yet.</div>
              ) : (
                editorIds!.map((eid) => (
                  <div
                    key={eid}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 6,
                      padding: "8px 10px",
                      gap: 12,
                    }}
                  >
                    <code style={{ overflowWrap: "anywhere" }}>{eid}</code>
                    <button disabled={busyEditors} onClick={() => removeEditor(eid)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
