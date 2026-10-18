"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-emerald-800">
          Hoàn tất bước thanh toán!
        </h1>

        <p className="mt-3 text-stone-600">
          Bạn đã hoàn thành luồng thanh toán mô phỏng của BrewLite.
        </p>

        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Lưu ý: Đây là kết quả mô phỏng trên Frontend.
          Đơn hàng chưa được xác nhận bởi Backend.
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
        >
          Quay lại Menu
        </button>
      </section>
    </main>
  );
}