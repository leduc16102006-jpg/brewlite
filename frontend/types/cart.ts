export type CartTopping = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  imageUrl: string;
  size: string;
  basePrice: number;
  toppings: CartTopping[];
  quantity: number;
  unitPrice: number;
};

export type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};