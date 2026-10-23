const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Định nghĩa kiểu trả về rõ ràng là Record<string, string> để TypeScript không báo lỗi HeadersInit
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Task 2 & 3: Tải danh mục sản phẩm từ Backend
export async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Không thể tải menu từ server");
    return await res.json();
  } catch (error) {
    console.warn("Lỗi kết nối Backend:", error);
    return null;
  }
}

// Task 6 & 10.4: Gửi promotionCode động lên Backend
export async function createOrder(
  items: { productId: number; qty: number; size?: string }[],
  promotionCode?: string
) {
  const payload: { items: typeof items; promotionCode?: string } = { items };

  if (promotionCode && promotionCode.trim()) {
    payload.promotionCode = promotionCode.trim().toUpperCase();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Tạo đơn hàng thất bại.");
  }
  return data;
}

// Task 8 & 10.2: Thanh toán có Idempotency-Key
export async function processPayment(orderId: number, method: "WALLET" | "CARD") {
  const idempotencyKey =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem-${orderId}-${Date.now()}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
    ...getAuthHeader(),
  };

  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      orderId,
      method,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Giao dịch thanh toán thất bại.");
  }
  return data;
}