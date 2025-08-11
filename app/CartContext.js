"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // 👇 This lazy initializer runs only once when component mounts
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart_data");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    // 💾 Sync cart to localStorage on any cartItems change
    if (cartItems.length > 0) {
      localStorage.setItem("cart_data", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("cart_data"); // Optional: clean up empty cart
    }
  }, [cartItems]);

  const addToCart = (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    const updatedCart = existing
      ? cartItems.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      : [...cartItems, { ...product, qty: 1 }];

    setCartItems(updatedCart);
  };

  const removeFromCart = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
  };

  const updateCartItem = (id, newQty) => {
    // Ensure quantity is at least 1
    const validatedQty = Math.max(1, newQty);

    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          return { ...item, qty: validatedQty };
        }
        return item;
      })
      .filter((item) => item.qty > 0);

    localStorage.setItem("cart_data", JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    // Return the updated quantity for potential use
    return validatedQty;
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
