import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import CartDrawer from "./components/CartDrawer";
import { useCart } from "./cart/CartContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";

function ScrollToTop() {
  const { pathname } = useLocation();
  const { closeDrawer } = useCart();
  useEffect(() => {
    window.scrollTo(0, 0);
    closeDrawer();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
