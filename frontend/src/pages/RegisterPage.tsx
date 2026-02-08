import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(username.trim(), email.trim(), password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 44, marginBottom: 18 }}>Register</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="testuser_9999"
            autoComplete="username"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="testuser_9999@example.com"
            autoComplete="email"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
        </label>

        {err && <div style={{ color: "crimson", marginTop: 6 }}>{err}</div>}

        <button disabled={busy} style={{ padding: "12px 16px", borderRadius: 10 }}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 18, opacity: 0.9 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
