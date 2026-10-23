"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "---";
  const total = searchParams.get("total") || "0";

  return (
    <div className="w-full max-w-md rounded-[2.5rem] border border-[#eee3d7] bg-white p-8 text-center shadow-xl sm:p-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
        ✓
      </div>

      <h1 className="mt-6 text-2xl font-black" style={{ fontFamily: "Georgia, serif" }}>
        Đặt hàng thành công!
      </h1>
      <p className="mt-2 text-sm text-[#8b796b]">
        Đơn hàng của bạn đã được thanh toán và chuyển đến quầy pha chế.
      </p>

      <div className="mt-6 rounded-2xl bg-[#faf7f2] p-5 text-left border border-[#eee3d7] space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#8b796b]">Mã đơn hàng</span>
          <span className="font-bold text-[#35251f]">#{orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8b796b]">Trạng thái thanh toán</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            PAID
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8b796b]">Tổng số tiền</span>
          <span className="font-bold text-[#a16b4b]">
            {new Intl.NumberFormat("vi-VN").format(Number(total))}đ
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs font-semibold text-amber-800">
        ☕ Vui lòng đến quầy nhận đồ uống khi mã đơn #{orderId} được gọi nhé!
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/orders"
          className="block w-full rounded-2xl bg-[#35251f] py-3.5 text-sm font-bold text-white transition hover:bg-[#634536]"
        >
          Xem lịch sử đơn hàng →
        </Link>
        <Link
          href="/"
          className="block w-full rounded-2xl border border-[#e5d8ca] bg-white py-3.5 text-sm font-bold text-[#35251f] transition hover:border-[#a16b4b]"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 text-[#35251f]">
      <Suspense fallback={<div>Đang tải thông tin đơn hàng...</div>}>
        <ConfirmationContent />
      </Suspense>
    </main>
  );
}