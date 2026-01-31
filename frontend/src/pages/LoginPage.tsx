import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
    console.log("LOGINPAGE CENTERED VERSION");
  const nav = useNavigate();
  const { setAuth } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await authApi.login(login, password);
      setAuth(res.token, res.user);
      nav("/drive");
    } catch (e: any) {
      setErr(e?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-vh-100 w-100 d-flex align-items-center justify-content-center">
    <div className="w-100 px-3" style={{ maxWidth: 520 }}>
      <h1 className="text-center mb-4">Login</h1>

      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={onSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Email or username</label>
          <input
            className="form-control"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <div className="mt-3 text-center">
        No account? <Link to="/register">Register</Link>
      </div>
    </div>
  </div>
)}
