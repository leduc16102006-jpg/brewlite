
"use client";

type OrderSuccessProps = {
  orderId: number | string;
  status?: "PAID" | "PENDING" | "PAYMENT_FAILED";
};

export default function OrderSuccess({
  orderId,
  status = "PAID",
}: OrderSuccessProps) {
  const isPaid = status === "PAID";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf7f2] px-5 py-12 text-[#35251f]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ead9c6]/60 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#dce8d6]/70 blur-2xl" />

      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#eee3d7] bg-white shadow-[0_24px_80px_rgba(72,48,32,0.10)]">
        {/* Brand header */}
        <div className="flex items-center justify-between border-b border-[#f0e8df] px-7 py-5">
          <a href="/" className="text-xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </a>

          <span className="rounded-full bg-[#f6f0e8] px-3 py-1.5 text-xs font-semibold text-[#806e62]">
            YOUR COFFEE MOMENT
          </span>
        </div>

        <div className="px-7 pb-8 pt-10 text-center sm:px-10 sm:pb-10">
          {/* Success icon */}
          <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#e8f1e3]" />
            <div className="absolute inset-2 rounded-full border border-[#c9dfc1]" />
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="relative h-14 w-14"
              aria-hidden="true"
            >
              <path
                d="M12 24.5L20 32L36 16"
                stroke="#4F8054"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -right-1 top-1 text-xl">✦</span>
            <span className="absolute -bottom-1 left-0 text-lg text-[#a16b4b]">
              ✦
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-4xl"
            style={{ fontFamily: "Georgia, serif" }}>
            {isPaid ? (
              <>
                Đặt hàng
                <br />
                thành công!
              </>
            ) : (
              <>
                Đơn hàng
                <br />
                đã được tạo!
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#8b796b]">
            {isPaid
              ? "Cà phê ngon đang chờ bạn. Cảm ơn bạn đã chọn BrewLite!"
              : "Đơn hàng của bạn đã được ghi nhận. Vui lòng kiểm tra trạng thái nhé."}
          </p>

          {/* Order information */}
          <div className="mt-8 rounded-2xl border border-[#eee3d7] bg-[#faf7f2] p-5 text-left">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#998778]">
              Mã đơn hàng của bạn
            </p>

            <p className="mt-2 text-center text-4xl font-black tracking-tight text-[#805238]">
              #{orderId}
            </p>

            <div className="my-5 border-t border-dashed border-[#ddcbbb]" />

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#806e62]">Trạng thái</span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  isPaid
                    ? "bg-[#e3efdf] text-[#3e7045]"
                    : status === "PENDING"
                      ? "bg-[#fff0c9] text-[#946500]"
                      : "bg-[#fbe4e1] text-[#a43f36]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status}
              </span>
            </div>
          </div>

          {/* Pickup note */}
          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#f4eee6] p-4 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl">
              ☕
            </div>
            <div>
              <p className="font-bold text-[#493329]">
                {isPaid ? "Mời bạn tới quầy lấy nước!" : "Một chút lưu ý"}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#806e62]">
                {isPaid
                  ? "Đưa mã đơn hàng cho nhân viên để nhận thức uống của bạn nhé."
                  : "Khi đơn hàng được thanh toán thành công, bạn có thể tới quầy nhận nước."}
              </p>
            </div>
          </div>

          <a
            href="/"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#35251f] px-6 py-4 font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#634536] hover:shadow-lg"
          >
            Về trang chủ
            <span aria-hidden="true">→</span>
          </a>

          <p className="mt-6 text-xs tracking-[0.2em] text-[#b2a397]">
            SLOW DOWN · SIP · ENJOY
          </p>
        </div>
      </section>
    </main>
  );
}
