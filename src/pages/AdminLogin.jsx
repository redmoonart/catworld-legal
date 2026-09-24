import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/AdminAuthContext";

export default function AdminLogin() {
  const { session, loading, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && session) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError("خطأ في البريد الإلكتروني أو كلمة السر");
    else navigate("/admin");
  }

  return (
    <div className="admin-auth-screen" dir="rtl">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>🛍️ إدارة متجري</h1>
        <p className="admin-auth-sub">Kids of the Future</p>
        <label>
          البريد الإلكتروني
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>
        <label>
          كلمة السر
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="admin-auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
