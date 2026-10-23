const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==================== PRODUCT ====================

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  version: number;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(
      `Không thể lấy danh sách sản phẩm: ${response.status}`,
    );
  }

  return response.json();
}

// ==================== ORDER ====================

export type OrderTopping = {
  id: string;
  name: string;
  price: number;
};

export type CreateOrderItem = {
  productId: number;
  qty: number;
  size?: string;
  toppings?: OrderTopping[];
};

export type CreateOrderPayload = {
  items: CreateOrderItem[];
  promotionCode?: string;
};

export type CreatedOrderItem = {
  id: number;
  productId: number;
  qty: number;
  size: string | null;
  sizeExtra: number;
  toppings: OrderTopping[] | null;
  lineTotal: number;
  product?: Product;
};

export type CreatedOrder = {
  id: number;
  userId: number;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  promotionId: number | null;
  createdAt: string;
  updatedAt: string;
  items: CreatedOrderItem[];
};

/**
 * Tạo đơn hàng mới.
 * Yêu cầu accessToken lấy từ API đăng nhập.
 */
export async function createOrder(
  payload: CreateOrderPayload,
  accessToken: string,
): Promise<CreatedOrder> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    throw new Error(
      message || `Không thể tạo đơn hàng. Mã lỗi: ${response.status}`,
    );
  }

  return data as CreatedOrder;
}