"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  // Bản chất: 3 state này map chính xác với 3 trường yêu cầu của API Swagger
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State xử lý giao diện
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt tự tải lại trang khi bấm submit
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Bắn API tới Endpoint POST /auth/register
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Nếu API trả về mảng lỗi (thường do class-validator của NestJS)
        if (Array.isArray(data.message)) {
          throw new Error(data.message.join(", "));
        }
        throw new Error(data.message || "Đăng ký thất bại, vui lòng thử lại.");
      }

      // Luồng thành công: Hiển thị thông báo và tự động chuyển về trang Login sau 2 giây
      setSuccessMsg("Tạo tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 font-sans text-[#35251f]">
      <div className="w-full max-w-md rounded-[2.5rem] border border-[#eee3d7] bg-white p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </Link>
          <h1 className="mt-6 text-2xl font-black" style={{ fontFamily: "Georgia, serif" }}>
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 text-sm text-[#8b796b]">Đăng ký thành viên để tích điểm Loyalty</p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 border border-red-200">
              ❌ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700 border border-green-200">
              ✓ {successMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b796b]">Họ và Tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-[#e5d8ca] bg-[#faf7f2] px-4 py-3 text-sm outline-none transition focus:border-[#a16b4b] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b796b]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-xl border border-[#e5d8ca] bg-[#faf7f2] px-4 py-3 text-sm outline-none transition focus:border-[#a16b4b] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b796b]">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#e5d8ca] bg-[#faf7f2] px-4 py-3 text-sm outline-none transition focus:border-[#a16b4b] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || successMsg !== ""}
            className="mt-4 w-full rounded-2xl bg-[#35251f] py-4 text-sm font-bold text-white transition hover:bg-[#634536] disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-[#8b796b]">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-[#a16b4b] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}