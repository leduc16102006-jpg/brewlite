
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderSuccess from "@/components/OrderSuccess";

function SuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") || "1042";
  const rawStatus = searchParams.get("status");

  const status =
    rawStatus === "PENDING" || rawStatus === "PAYMENT_FAILED"
      ? rawStatus
      : "PAID";

  return <OrderSuccess orderId={orderId} status={status} />;
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#806e62]">
          Đang chuẩn bị đơn hàng của bạn...
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
