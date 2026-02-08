import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
