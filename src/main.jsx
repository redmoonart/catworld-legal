import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { I18nProvider } from "./i18n/I18nContext";
import { ToastProvider } from "./toast/ToastContext";
import { CartProvider } from "./cart/CartContext";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <I18nProvider>
          <ToastProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ToastProvider>
        </I18nProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);
