
"use client";

import { useMemo, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "PAYMENT_FAILED";

type Order = {
  id: number;
  createdAt: string;
  total: number;
  status: OrderStatus;
  itemNames: string[];
  image: string;
};

const sampleOrders: Order[] = [
  {
    id: 1042,
    createdAt: "21/10/2026 · 14:32",
    total: 65000,
    status: "PAID",
    itemNames: ["Latte", "Size M"],
    image: "/images/latte.jpg",
  },
  {
    id: 1038,
    createdAt: "20/10/2026 · 09:15",
    total: 39000,
    status: "PENDING",
    itemNames: ["Americano", "Size S"],
    image: "/images/americano.jpg",
  },
  {
    id: 1025,
    createdAt: "18/10/2026 · 16:48",
    total: 55000,
    status: "CANCELLED",
    itemNames: ["Cappuccino", "Size M"],
    image: "/images/cappuccino.jpg",
  },
  {
    id: 1019,
    createdAt: "17/10/2026 · 10:20",
    total: 45000,
    status: "PAYMENT_FAILED",
    itemNames: ["Bạc Xỉu", "Size S"],
    image: "/images/bac-xiu.jpg",
  },
];

const filters = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Thành công", value: "PAID" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Thanh toán lỗi", value: "PAYMENT_FAILED" },
] as const;

const statusInfo: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-green-100 text-green-800",
    dot: "bg-green-600",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  PAYMENT_FAILED: {
    label: "Thanh toán lỗi",
    className: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const orders = useMemo(() => {
    if (activeFilter === "ALL") return sampleOrders;

    return sampleOrders.filter(
      (order) => order.status === activeFilter
    );
  }, [activeFilter]);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35251f]">
      {/* Header */}
      <header className="border-b border-[#e9dfd4] bg-[#faf7f2]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
          <a href="/" className="text-2xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </a>

          <a
            href="/"
            className="rounded-full border border-[#e5d8ca] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#a16b4b]"
          >
            ← Về menu
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        {/* Page heading */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#35251f] px-7 py-9 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-8 -top-16 h-52 w-52 rounded-full border-[28px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-36 h-44 w-44 rounded-full bg-[#a16b4b]/25 blur-2xl" />

          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#d8b99d]">
              Your coffee journey
            </p>

            <h1 className="text-4xl font-black sm:text-5xl"
                  style={{ fontFamily: "Georgia, serif" }}>
              Đơn hàng của bạn<span className="text-[#c99b76]"></span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-[#e0d1c4] sm:text-base">
              Mỗi đơn hàng là một khoảnh khắc nhỏ dành cho bạn.
              Cùng xem lại những lựa chọn yêu thích nhé.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs text-[#e0d1c4]">Tổng số đơn</p>
                <p className="mt-1 text-2xl font-black">
                  {sampleOrders.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs text-[#e0d1c4]">Đơn thành công</p>
                <p className="mt-1 text-2xl font-black">
                  {sampleOrders.filter((o) => o.status === "PAID").length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter */}
        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a16b4b]">
                Order history
              </p>
              <h2 className="mt-1 text-3xl font-black"
                style={{ fontFamily: "Georgia, serif" }}>
                Lịch sử đơn hàng
              </h2>
            </div>

            <span className="text-sm text-[#8b796b]">
              {orders.length} đơn hàng
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#35251f] text-white shadow-md"
                      : "border border-[#e5d8ca] bg-white text-[#806e62] hover:border-[#a16b4b] hover:text-[#35251f]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Orders */}
        <section className="mt-5 space-y-4">
          {orders.map((order) => {
            const status = statusInfo[order.status];

            return (
              <article
                key={order.id}
                className="group rounded-3xl border border-[#eee3d7] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#ddc7b3] hover:shadow-lg sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#f3e8db]">
                      <img
                        src={order.image}
                        alt={order.itemNames[0]}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black"
                          style={{ fontFamily: "Georgia, serif" }}>
                          Đơn hàng #{order.id}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-[#998778]">
                        {order.createdAt}
                      </p>

                      <p className="mt-2 text-sm text-[#806e62]">
                        {order.itemNames.join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[#f0e8df] pt-4 sm:min-w-40 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="text-xs text-[#998778]">Tổng tiền</p>
                      <p className="mt-1 text-xl font-black text-[#a16b4b]">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-[#a49385]">
                      BrewLite
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#ddcbbb] bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3e8db] text-3xl">
                ☕
              </div>

              <h3 className="mt-5 text-xl font-black">
                Chưa có đơn hàng ở đây
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b796b]">
                Bạn thử chọn trạng thái khác hoặc quay lại menu để
                khám phá thức uống yêu thích nhé.
              </p>

              <button
                onClick={() => setActiveFilter("ALL")}
                className="mt-5 rounded-full bg-[#35251f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#634536]"
              >
                Xem tất cả đơn hàng
              </button>
            </div>
          )}
        </section>

        <footer className="mt-12 pb-4 text-center">
          <p className="text-sm text-[#a49385]">
            BrewLite · Chậm một chút, yêu nhiều hơn.
          </p>
        </footer>
      </div>
    </main>
  );
}
