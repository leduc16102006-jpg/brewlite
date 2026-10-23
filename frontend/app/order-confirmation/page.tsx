"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: string;
  productId?: string;
  name: string;
  imageUrl?: string;
  size?: string;
  toppings?: { name: string; price: number }[];
  quantity: number;
  unitPrice: number;
};

type OrderInfo = {
  orderId: string;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
  status: string;
};

const STORAGE_KEY = "brewlite-last-order";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(STORAGE_KEY);

      if (savedOrder) {
        const parsedOrder: unknown = JSON.parse(savedOrder);

        if (
          typeof parsedOrder === "object" &&
          parsedOrder !== null &&
          "orderId" in parsedOrder &&
          "items" in parsedOrder &&
          Array.isArray(parsedOrder.items)
        ) {
          setOrder(parsedOrder as OrderInfo);
        }
      }
    } catch (error) {
      console.error("Không thể tải thông tin đơn hàng:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#35251f]">
        <p>Đang tải thông tin đơn hàng...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-5 py-10 text-[#35251f]">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🛒</div>
          <h1 className="text-2xl font-bold">Chưa có thông tin đơn hàng</h1>
          <p className="mt-3 text-gray-600">
            Bạn chưa có đơn hàng nào được lưu để xác nhận. Hãy quay lại chọn
            món và hoàn tất các bước đặt hàng.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#6f4e37] px-6 py-3 font-semibold text-white transition hover:bg-[#543a29]"
          >
            Quay lại chọn món
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#35251f] md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold tracking-wide">
            ☕ BrewLite
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#6f4e37] hover:underline"
          >
            Tiếp tục mua hàng
          </Link>
        </header>

        <section className="mb-8 rounded-2xl bg-white p-6 text-center shadow-sm md:p-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <h1 className="text-3xl font-bold">
            Đặt hàng thành công!
          </h1>

          <p className="mt-3 text-gray-600">
            Cảm ơn bạn đã lựa chọn BrewLite. Thông tin đơn hàng của bạn được
            hiển thị bên dưới.
          </p>

          <div className="mt-6 inline-block rounded-xl bg-[#faf7f2] px-6 py-4">
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="mt-1 text-xl font-bold text-[#6f4e37]">
              {order.orderId}
            </p>
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">Chi tiết đơn hàng</h2>

            <div className="space-y-5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#faf7f2]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">☕</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{item.name}</h3>

                    {item.size && (
                      <p className="mt-1 text-sm text-gray-500">
                        Kích cỡ: {item.size}
                      </p>
                    )}

                    {item.toppings && item.toppings.length > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Topping:{" "}
                        {item.toppings
                          .map((topping) => topping.name)
                          .join(", ")}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Tổng số lượng</span>
                <span className="font-medium">{order.totalItems} món</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Phương thức thanh toán</span>
                <span className="text-right font-medium">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Thời gian đặt</span>
                <span className="text-right font-medium">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("vi-VN")
                    : "Chưa có thông tin"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Trạng thái</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                  {order.status}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-[#6f4e37]">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="mt-6 block rounded-xl bg-[#6f4e37] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#543a29]"
            >
              Quay về trang chủ
            </Link>

            <Link
              href="/cart"
              className="mt-3 block rounded-xl border border-[#6f4e37] px-5 py-3 text-center font-semibold text-[#6f4e37] transition hover:bg-[#faf7f2]"
            >
              Xem giỏ hàng
            </Link>
          </aside>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          BrewLite — Cảm ơn bạn đã đồng hành cùng chúng tôi!
        </p>
      </div>
    </main>
  );
}