import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16, padding: 24,
          fontFamily: "system-ui, sans-serif", textAlign: "center", background: "#f3f4f6", color: "#111827",
        }}>
          <div style={{ fontSize: "3rem" }}>😿</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>حدث خطأ غير متوقع</h1>
          <p style={{ color: "#6b7280", maxWidth: 420 }}>
            صار خطأ أثناء تحميل الصفحة. جرّب تحديث الصفحة، وإذا استمرت المشكلة تواصل معنا.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#d87943", color: "#fff", border: 0, borderRadius: 999,
              padding: "12px 24px", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
