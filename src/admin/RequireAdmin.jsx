import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function RequireAdmin({ children }) {
  const { session, loading } = useAdminAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;
  return children;
}
