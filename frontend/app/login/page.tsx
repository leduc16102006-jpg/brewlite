"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("Password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      // Lưu JWT Token tự động vào localStorage
      localStorage.setItem("accessToken", data.accessToken);

      // Chuyển hướng thẳng sang trang Lịch sử đơn hàng
      router.push("/orders");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 text-[#35251f]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#eee3d7] bg-white p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </Link>
          <h1 className="mt-4 text-2xl font-black" style={{ fontFamily: "Georgia, serif" }}>
            Đăng nhập tài khoản
          </h1>
          <p className="mt-2 text-sm text-[#8b796b]">
            Đăng nhập để theo dõi lịch sử đơn hàng của bạn
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8b796b]">
              Email tài khoản
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-[#e5d8ca] px-4 py-3 text-sm outline-none transition focus:border-[#a16b4b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8b796b]">
              Mật khẩu
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[#e5d8ca] px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#a16b4b]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-[#a16b4b]"
                aria-label="Ẩn hoặc hiện mật khẩu"
              >
                {showPassword ? (
                  /* Biểu tượng con mắt gạch chéo (Ẩn) */
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  /* Biểu tượng con mắt mở (Hiện) */
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#35251f] py-3.5 text-sm font-bold text-white transition hover:bg-[#634536] disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#8b796b]">
          <Link href="/orders" className="hover:underline">
            ← Quay lại trang lịch sử đơn
          </Link>
        </div>
      </div>
    </main>
  );
}