"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);

    router.push(
      `/payment?method=${encodeURIComponent(paymentMethod)}`
    );
  };

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900">
      <div className="mx-auto max-w-3xl">

        {/* Quay lại */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Quay lại
        </button>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold">
          Thanh toán đơn hàng
        </h1>

        <p className="mt-2 text-stone-600">
          Hoàn tất lựa chọn để tiếp tục đặt cà phê tại BrewLite.
        </p>

        {/* Phương thức thanh toán */}
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Phương thức thanh toán
          </h2>

          <div className="mt-5 space-y-4">

            {/* Ví điện tử */}
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 p-4 hover:border-emerald-600">
              <input
                type="radio"
                name="payment"
                value="WALLET"
                checked={paymentMethod === "WALLET"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="h-4 w-4 accent-emerald-700"
              />

              <span className="text-2xl">📱</span>

              <div>
                <p className="font-semibold">
                  Ví điện tử
                </p>

                <p className="text-sm text-stone-500">
                  Thanh toán mô phỏng bằng ví điện tử.
                </p>
              </div>
            </label>

            {/* Thẻ ngân hàng */}
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 p-4 hover:border-emerald-600">
              <input
                type="radio"
                name="payment"
                value="CARD"
                checked={paymentMethod === "CARD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="h-4 w-4 accent-emerald-700"
              />

              <span className="text-2xl">💳</span>

              <div>
                <p className="font-semibold">
                  Thẻ ngân hàng
                </p>

                <p className="text-sm text-stone-500">
                  Thanh toán mô phỏng bằng thẻ.
                </p>
              </div>
            </label>

          </div>

          {/* Thông báo */}
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Đây là chức năng thanh toán thử nghiệm.
            Chưa có giao dịch tiền thật.
          </div>

          {/* Nút thanh toán */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading
              ? "Đang xử lý..."
              : "Tiếp tục thanh toán"}
          </button>

        </section>
      </div>
    </main>
  );
}