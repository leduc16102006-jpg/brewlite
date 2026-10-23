 //Trạng thái giỏ hàng toàn cục
//Giỏ hàng được lưu trong localStorage để khi F5 tải lại trang không bị mất dữ liệu:
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  size: string;
  toppings: string[];
  qty: number;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "qty">) => void;
  updateQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalQty: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("brewlite_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi đọc giỏ hàng", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("brewlite_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, "id" | "qty">) => {
    setItems((prev) => {
      // Gom nhóm nếu cùng sản phẩm, cùng size và cùng topping
      const existing = prev.find(
        (it) =>
          it.productId === newItem.productId &&
          it.size === newItem.size &&
          JSON.stringify(it.toppings.sort()) === JSON.stringify(newItem.toppings.sort())
      );

      if (existing) {
        return prev.map((it) =>
          it.id === existing.id ? { ...it, qty: it.qty + 1 } : it
        );
      }

      return [
        ...prev,
        {
          ...newItem,
          id: `${newItem.productId}-${newItem.size}-${Date.now()}`,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("brewlite_cart");
  };

  const totalQty = items.reduce((acc, it) => acc + it.qty, 0);
  const totalPrice = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalQty,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}