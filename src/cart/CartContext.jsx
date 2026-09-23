import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { PRODUCTS } from "../data/products";
import { useI18n } from "../i18n/I18nContext";
import { useToast } from "../toast/ToastContext";
import { pName } from "../lib/product";

const CART_KEY = "kof_cart_v1";
const CartContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function byId(id) {
  return PRODUCTS.find((p) => p.id === Number(id));
}

export function CartProvider({ children }) {
  const { lang } = useI18n();
  const showToast = useToast();
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* localStorage unavailable */
    }
  }, [cart]);

  const addToCart = useCallback(
    (id, qty = 1) => {
      const p = byId(id);
      if (!p || p.stock === false) return;
      setCart((prev) => {
        const line = prev.find((i) => i.id === id);
        if (line) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { id, qty }];
      });
      showToast(`✅ ${pName(p, lang)}`);
    },
    [lang, showToast]
  );

  const setQty = useCallback((id, qty) => {
    qty = Math.max(0, qty);
    setCart((prev) =>
      qty === 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((s, i) => {
      const p = byId(i.id);
      return p ? s + p.price * i.qty : s;
    }, 0),
    [cart]
  );

  const value = useMemo(
    () => ({ cart, addToCart, setQty, removeFromCart, count, subtotal, byId, drawerOpen, openDrawer, closeDrawer }),
    [cart, addToCart, setQty, removeFromCart, count, subtotal, drawerOpen, openDrawer, closeDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
