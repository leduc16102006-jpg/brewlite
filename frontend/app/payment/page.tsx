"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = searchParams.get("method") ?? "WALLET";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Mô phỏng xử lý thanh toán trong 1 giây.
      // Chưa kết nối API Backend.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Chuyển sang trang xác nhận đơn hàng.
      router.push("/order-success");
    } catch {
      setError("Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900">
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => router.push("/checkout")}
          className="mb-6 font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Quay lại Checkout
        </button>

        <h1 className="text-3xl font-bold">
          Thanh toán BrewLite
        </h1>

        <p className="mt-2 text-stone-600">
          Vui lòng kiểm tra phương thức thanh toán.
        </p>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Phương thức thanh toán
          </p>

          <p className="mt-2 text-xl font-bold">
            {method === "CARD" ? "💳 Thẻ ngân hàng" : "📱 Ví điện tử"}
          </p>

          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Đây là thanh toán mô phỏng phục vụ bài tập.
            Không có giao dịch tiền thật.
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-3 w-full rounded-xl border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-50"
          >
            Hủy và quay lại
          </button>
        </section>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center">
          Đang tải trang thanh toán...
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}