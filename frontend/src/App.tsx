import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Nämä pitää olla olemassa (jos puuttuu, kerro niin teen sulle valmiit)
import DrivePage from "./pages/DrivePage";
import DocEditorPage from "./pages/DocEditorPage";
import PublicDocPage from "./pages/PublicDocPage";

function HomeRedirect() {
  const { token } = useAuth();
  return token ? <Navigate to="/drive" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  const { token, logout } = useAuth();

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link to="/" style={{ fontWeight: 700 }}>
            Cloud Drive
          </Link>

          {token ? (
            <>
              <Link to="/drive">Drive</Link>
              <button onClick={logout} style={{ marginLeft: 8 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <hr style={{ margin: "16px 0" }} />

      <Routes>
        {/* FIX: root route */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/public/:token" element={<PublicDocPage />} />

        {/* Protected routes */}
        <Route
          path="/drive"
          element={
            <RequireAuth>
              <DrivePage />
            </RequireAuth>
          }
        />
        <Route
          path="/docs/:id"
          element={
            <RequireAuth>
              <DocEditorPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
