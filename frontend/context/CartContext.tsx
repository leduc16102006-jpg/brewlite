
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartContextType, CartItem } from "@/types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "brewlite-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Đọc giỏ hàng đã lưu trên trình duyệt
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart as CartItem[]);
        }
      }
    } catch (error) {
      console.error("Không thể tải giỏ hàng:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Lưu giỏ hàng sau khi tải dữ liệu ban đầu
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Không thể lưu giỏ hàng:", error);
    }
  }, [items, loaded]);

  // Thêm sản phẩm vào giỏ hàng
  function addItem(item: Omit<CartItem, "id" | "quantity">) {
    setItems((currentItems) => [
      ...currentItems,
      {
        ...item,
        id: crypto.randomUUID(),
        quantity: 1,
      },
    ]);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }

  // Cập nhật số lượng sản phẩm
  function updateQuantity(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }

  // Xóa toàn bộ giỏ hàng
  function clearCart() {
    setItems([]);
  }

  // Tổng số lượng sản phẩm
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  // Tổng tiền của giỏ hàng
  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
      ),
    [items]
  );

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook lấy dữ liệu và các hàm của giỏ hàng
export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext phải được sử dụng bên trong CartProvider"
    );
  }

  return context;
}
