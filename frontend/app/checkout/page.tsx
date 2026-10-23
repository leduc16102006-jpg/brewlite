"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "@/hooks/useCart";
import { createOrder } from "@/lib/api";

type PaymentMethod = "cash" | "bank" | "card";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function CheckoutPage() {
  const router = useRouter();

  const { items, totalItems, totalPrice, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const paymentMethods = [
    {
      id: "cash" as const,
      icon: "💵",
      title: "Tiền mặt khi nhận hàng",
      description: "Thanh toán trực tiếp khi nhận đồ uống.",
    },
    {
      id: "bank" as const,
      icon: "🏦",
      title: "Chuyển khoản ngân hàng",
      description:
        "Thông tin chuyển khoản sẽ được cung cấp khi tích hợp thanh toán.",
    },
    {
      id: "card" as const,
      icon: "💳",
      title: "Thanh toán bằng thẻ",
      description:
        "Thanh toán qua cổng thanh toán khi được tích hợp.",
    },
  ];

  async function handlePayment() {
    if (isSubmitting) return;

    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage(
        "Giỏ hàng đang trống. Vui lòng chọn món trước khi đặt hàng.",
      );
      return;
    }

    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      setErrorMessage(
        "Số lượng món không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.",
      );
      return;
    }

    const selectedMethod = paymentMethods.find(
      (method) => method.id === paymentMethod,
    );

    if (!selectedMethod) {
      setErrorMessage("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (paymentMethod !== "cash") {
      setErrorMessage(
        "Phương thức chuyển khoản và thẻ chưa được tích hợp. Vui lòng chọn tiền mặt khi nhận hàng.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.quantity,
          size: item.size,
          toppings: (item.toppings ?? []).map((topping) => ({
            id: topping.id,
            name: topping.name,
            price: topping.price,
          })),
        })),
      };

      // Gọi backend tạo đơn hàng thật.
      const createdOrder = await createOrder(payload, accessToken);

      // Lưu kết quả backend trả về để trang xác nhận sử dụng.
      const orderForConfirmation = {
        ...createdOrder,
        orderId: createdOrder.id,
        items: createdOrder.items.map((orderItem) => {
          const cartItem = items.find(
            (item) =>
              item.productId === orderItem.productId &&
              item.size === orderItem.size,
          );

          return {
            ...orderItem,
            name: orderItem.product?.name ?? cartItem?.name ?? "Sản phẩm",
            imageUrl: cartItem?.imageUrl ?? "",
            quantity: orderItem.qty,
            unitPrice:
              orderItem.qty > 0
                ? orderItem.lineTotal / orderItem.qty
                : 0,
            toppings: orderItem.toppings ?? [],
          };
        }),
        totalItems,
        totalPrice: createdOrder.total,
        paymentMethod: selectedMethod.title,
        paymentMethodId: paymentMethod,
        createdAt: createdOrder.createdAt,
        status: "Chờ xác nhận",
      };

      localStorage.setItem(
        "brewlite-last-order",
        JSON.stringify(orderForConfirmation),
      );

      // Chỉ xóa giỏ hàng khi backend đã tạo đơn thành công.
      clearCart();

      router.push("/order-confirmation");
    } catch (error) {
      console.error("Không thể tạo đơn hàng:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#35251f] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/cart"
              className="text-sm font-semibold text-[#a16b4b] hover:underline"
            >
              ← Quay lại giỏ hàng
            </Link>

            <h1 className="mt-4 text-3xl font-black md:text-4xl">
              Thanh toán
            </h1>

            <p className="mt-2 text-[#806e62]">
              Kiểm tra đơn hàng và chọn phương thức thanh toán.
            </p>
          </div>

          <Link href="/" className="text-xl font-black">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </Link>
        </header>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-[#eee4da] bg-white px-6 py-16 text-center">
            <div className="text-6xl">☕</div>

            <h2 className="mt-5 text-2xl font-bold">
              Giỏ hàng đang trống
            </h2>

            <p className="mt-3 text-[#806e62]">
              Bạn cần chọn ít nhất một món trước khi thanh toán.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-full bg-[#35251f] px-7 py-3 font-semibold text-white transition hover:bg-[#634536]"
            >
              Khám phá menu
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-[#eee4da] bg-white p-6 md:p-8">
              <h2 className="text-xl font-black">
                Phương thức thanh toán
              </h2>

              <p className="mt-2 text-sm text-[#806e62]">
                Vui lòng chọn một phương thức để tiếp tục.
              </p>

              <div className="mt-6 space-y-4">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                        isSelected
                          ? "border-[#a16b4b] bg-[#faf3ec] ring-1 ring-[#a16b4b]"
                          : "border-[#eee4da] hover:border-[#c5a58d] hover:bg-[#fdfaf7]"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl">
                        {method.icon}
                      </span>

                      <span className="flex-1">
                        <span className="block font-bold">
                          {method.title}
                        </span>

                        <span className="mt-1 block text-sm text-[#806e62]">
                          {method.description}
                        </span>
                      </span>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#a16b4b]"
                            : "border-[#cbbbad]"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#a16b4b]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f1e9] p-4 text-sm leading-6 text-[#806e62]">
                {paymentMethod === "cash" && (
                  <>
                    <strong className="text-[#35251f]">
                      Thanh toán khi nhận hàng
                    </strong>
                    <p>
                      Đơn hàng sẽ được tạo trên hệ thống và chờ xác nhận.
                      Bạn thanh toán trực tiếp khi nhận đồ uống.
                    </p>
                  </>
                )}

                {paymentMethod === "bank" && (
                  <>
                    <strong className="text-[#35251f]">
                      Chuyển khoản ngân hàng
                    </strong>
                    <p>
                      Chức năng chuyển khoản chưa được tích hợp.
                      Vui lòng chọn tiền mặt khi nhận hàng để tiếp tục.
                    </p>
                  </>
                )}

                {paymentMethod === "card" && (
                  <>
                    <strong className="text-[#35251f]">
                      Thanh toán bằng thẻ
                    </strong>
                    <p>
                      Chức năng thanh toán bằng thẻ chưa được tích hợp.
                      Chưa có giao dịch thực tế nào được thực hiện.
                    </p>
                  </>
                )}
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}
            </section>

            <aside className="rounded-3xl border border-[#eee4da] bg-white p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-black">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.name}</p>

                      <p className="mt-1 text-sm text-[#806e62]">
                        Size {item.size} × {item.quantity}
                      </p>

                      {item.toppings?.length > 0 && (
                        <p className="mt-1 text-xs text-[#806e62]">
                          Topping:{" "}
                          {item.toppings
                            .map((topping) => topping.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <span className="whitespace-nowrap text-sm font-bold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-dashed border-[#e5d8ca]" />

              <div className="flex justify-between text-sm text-[#806e62]">
                <span>Tổng số lượng</span>
                <span>{totalItems} món</span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="font-bold">Tổng thanh toán</span>

                <span className="text-xl font-black text-[#a16b4b]">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={isSubmitting}
                className="mt-7 w-full rounded-full bg-[#35251f] px-5 py-3.5 font-bold text-white transition hover:bg-[#634536] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : "Xác nhận đơn hàng →"}
              </button>

              <Link
                href="/cart"
                className="mt-4 block text-center text-sm font-semibold text-[#a16b4b] hover:underline"
              >
                Quay lại giỏ hàng
              </Link>

              <p className="mt-5 text-center text-xs leading-5 text-[#806e62]">
                Đơn hàng sẽ được tạo trên hệ thống sau khi backend xác nhận
                thành công.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}