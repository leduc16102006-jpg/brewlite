"use client";

import Link from "next/link";
import useCart from "@/hooks/useCart";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#35251f] md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-[#a16b4b]">
              ← Tiếp tục mua hàng
            </Link>

            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              Giỏ hàng của bạn
            </h1>

            <p className="mt-2 text-[#806e62]">
              Kiểm tra lại những thức uống bạn đã chọn.
            </p>
          </div>

          <Link href="/" className="text-xl font-black">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </Link>
        </header>

        {/* Empty cart */}
        {items.length === 0 ? (
          <section className="rounded-3xl border border-[#eee4da] bg-white px-6 py-16 text-center">
            <div className="text-6xl">☕</div>

            <h2 className="mt-5 text-2xl font-bold">
              Giỏ hàng đang trống
            </h2>

            <p className="mt-3 text-[#806e62]">
              Hãy chọn một thức uống yêu thích để bắt đầu nhé!
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-full bg-[#35251f] px-7 py-3 font-semibold text-white transition hover:bg-[#634536]"
            >
              Khám phá menu
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* Product list */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Sản phẩm ({totalItems})
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Bạn có chắc muốn xóa toàn bộ giỏ hàng?"
                      )
                    ) {
                      clearCart();
                    }
                  }}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>

              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-5 rounded-3xl border border-[#eee4da] bg-white p-5 sm:flex-row"
                >
                  {/* Product image */}
                  <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f0e7dc] text-5xl sm:w-36">
                    {item.imageUrl.startsWith("http") ||
                    item.imageUrl.startsWith("/") ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{item.imageUrl || "☕"}</span>
                    )}
                  </div>

                  {/* Product information */}
                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold">{item.name}</h3>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-[#806e62]">
                        Kích cỡ: {item.size}
                      </p>

                      <p className="mt-1 text-sm text-[#806e62]">
                        Topping:{" "}
                        {item.toppings.length > 0
                          ? item.toppings
                              .map((topping) => topping.name)
                              .join(", ")
                          : "Không có"}
                      </p>

                      <p className="mt-2 text-sm text-[#806e62]">
                        Đơn giá: {formatPrice(item.unitPrice)}
                      </p>
                    </div>

                    {/* Quantity and subtotal */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-full border border-[#e5d8ca]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Giảm số lượng ${item.name}`}
                          className="h-10 w-10 rounded-l-full font-bold transition hover:bg-[#f5eee7] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Tăng số lượng ${item.name}`}
                          className="h-10 w-10 rounded-r-full font-bold transition hover:bg-[#f5eee7]"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-black text-[#a16b4b]">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Order summary */}
            <aside className="rounded-3xl border border-[#eee4da] bg-white p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-black">Tóm tắt đơn hàng</h2>

              <div className="mt-6 flex justify-between gap-4 text-[#806e62]">
                <span>Tổng số lượng</span>

                <span className="font-semibold text-[#35251f]">
                  {totalItems} món
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4 text-[#806e62]">
                <span>Tạm tính</span>

                <span className="font-semibold text-[#35251f]">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="my-6 border-t border-dashed border-[#e5d8ca]" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-bold">Tổng thanh toán</span>

                <span className="text-xl font-black text-[#a16b4b]">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#806e62]">
                Tổng tiền được cập nhật tự động khi bạn thay đổi số lượng sản phẩm.
              </p>

              {/* Navigate to checkout */}
              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-[#35251f] px-5 py-3.5 text-center font-bold text-white transition hover:bg-[#634536]"
              >
                Tiến hành đặt hàng →
              </Link>

              <Link
                href="/"
                className="mt-4 block text-center text-sm font-semibold text-[#a16b4b] hover:underline"
              >
                Tiếp tục chọn thức uống
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}