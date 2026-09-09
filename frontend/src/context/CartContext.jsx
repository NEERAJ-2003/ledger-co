import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (_) {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const data = await api.addToCart(productId, quantity);
    setCart(data);
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const data = await api.updateCartItem(itemId, quantity);
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const data = await api.removeCartItem(itemId);
    setCart(data);
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        refresh,
        addToCart,
        updateItem,
        removeItem,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
