"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/lib/api";

// Danh mục chuẩn đầy đủ 10 món theo Seed của Backend Task 2
const defaultProducts = [
  { id: 1, name: "Americano", price: 39000, category: "Cà phê đen", image: "/images/americano.jpg" },
  { id: 2, name: "Latte", price: 55000, category: "Cà phê sữa", image: "/images/latte.jpg" },
  { id: 3, name: "Bac Xiu", price: 45000, category: "Cà phê sữa", image: "/images/latte.jpg" },
  { id: 4, name: "Black coffee", price: 35000, category: "Cà phê đen", image: "/images/americano.jpg" },
  { id: 5, name: "Macchiato", price: 55000, category: "Cà phê sữa", image: "/images/latte.jpg" },
  { id: 6, name: "Milk coffee", price: 45000, category: "Cà phê sữa", image: "/images/latte.jpg" },
  { id: 7, name: "Espresso", price: 35000, category: "Cà phê đen", image: "/images/americano.jpg" },
  { id: 8, name: "Cappuccino", price: 55000, category: "Cà phê sữa", image: "/images/latte.jpg" },
  { id: 9, name: "Mocha", price: 59000, category: "Khác", image: "/images/latte.jpg" },
  { id: 10, name: "Cold Brew", price: 49000, category: "Cà phê đen", image: "/images/americano.jpg" },
];

const toppingsList = [
  { name: "Trân châu", price: 7000 },
  { name: "Extra shot", price: 10000 },
  { name: "Kem cheese", price: 10000 },
];

export default function HomePage() {
  const { addToCart, totalQty } = useCart();
  const [products, setProducts] = useState<any[]>(defaultProducts);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [size, setSize] = useState<"S" | "M" | "L">("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  useEffect(() => {
    // 1. Kiểm tra trạng thái đăng nhập
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    // 2. Tải 10 món thật từ API Backend Task 2
    async function loadData() {
      const data = await getProducts();
      if (data && Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setToastMsg("Đã đăng xuất thành công!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const calculateCustomPrice = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    if (size === "M") base += 5000;
    if (size === "L") base += 10000;
    selectedToppings.forEach((topName) => {
      const top = toppingsList.find((t) => t.name === topName);
      if (top) base += top.price;
    });
    return base;
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    const finalPrice = calculateCustomPrice();

    addToCart({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: finalPrice,
      size,
      toppings: selectedToppings,
      image: selectedProduct.imageUrl || selectedProduct.image || "/images/latte.jpg",
    });

    setSelectedProduct(null);
    setSelectedToppings([]);
    setSize("M");

    setToastMsg(`Đã thêm ${selectedProduct.name} vào giỏ hàng!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const categories = ["Tất cả", "Cà phê đen", "Cà phê sữa", "Khác"];
  const filteredProducts =
    activeCategory === "Tất cả"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35251f]">
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#35251f] px-5 py-4 text-white shadow-2xl transition animate-bounce">
          <span>☕ {toastMsg}</span>
          <Link href="/cart" className="rounded-lg bg-[#a16b4b] px-3 py-1 text-xs font-bold hover:bg-[#8f5a3b]">
            Vào giỏ ngay →
          </Link>
        </div>
      )}

      {/* Navbar Điều Hướng */}
      <header className="sticky top-0 z-40 border-b border-[#e9dfd4] bg-[#faf7f2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full border border-[#e5d8ca] bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:border-[#a16b4b]"
            >
              <span>🛒 Giỏ hàng</span>
              {totalQty > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a16b4b] text-[11px] font-black text-white">
                  {totalQty}
                </span>
              )}
            </Link>

            <Link
              href="/orders"
              className="rounded-full border border-[#e5d8ca] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[#a16b4b]"
            >
              Lịch sử đơn
            </Link>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#35251f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#634536]"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Menu Header & Filter Category */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a16b4b]">FIND YOUR FAVORITE</p>
          <h1 className="mt-2 text-4xl font-black" style={{ fontFamily: "Georgia, serif" }}>MENU</h1>
          <p className="mt-1 text-sm text-[#8b796b]">Những lựa chọn dành riêng cho bạn mỗi ngày ({products.length} món)</p>

          <div className="mt-6 flex justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeCategory === cat
                    ? "bg-[#35251f] text-white"
                    : "border border-[#e5d8ca] bg-white text-[#806e62] hover:border-[#a16b4b]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lưới sản phẩm (Hiển thị đầy đủ 10 món) */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="rounded-3xl border border-[#eee3d7] bg-white p-5 shadow-sm transition hover:shadow-lg">
              <div className="h-44 w-full overflow-hidden rounded-2xl bg-[#f3e8db]">
                <img
                  src={p.imageUrl || p.image || "/images/latte.jpg"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-xs text-[#8b796b]">{p.category || "Cà phê"}</p>
                </div>
                <p className="font-black text-[#a16b4b]">
                  {new Intl.NumberFormat("vi-VN").format(p.price)}đ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(p)}
                className="mt-4 w-full rounded-xl bg-[#35251f] py-2.5 text-xs font-bold text-white transition hover:bg-[#634536]"
              >
                Chọn món & Tùy chỉnh +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal tùy chỉnh */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black">{selectedProduct.name}</h2>
            <p className="text-xs text-[#8b796b] mt-1">Tùy chỉnh thức uống theo sở thích của bạn</p>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase text-[#8b796b]">1. Chọn size</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["S", "M", "L"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`rounded-xl border p-2 text-center text-xs font-bold transition ${
                      size === s ? "border-[#a16b4b] bg-[#faf7f2] text-[#a16b4b]" : "border-[#e5d8ca]"
                    }`}
                  >
                    Size {s} {s === "M" ? "(+5k)" : s === "L" ? "(+10k)" : "(Gốc)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase text-[#8b796b]">2. Thêm topping</p>
              <div className="mt-2 space-y-2">
                {toppingsList.map((top) => {
                  const checked = selectedToppings.includes(top.name);
                  return (
                    <label key={top.name} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#eee3d7] p-2.5 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) setSelectedToppings(selectedToppings.filter((t) => t !== top.name));
                            else setSelectedToppings([...selectedToppings, top.name]);
                          }}
                          className="accent-[#a16b4b]"
                        />
                        <span>{top.name}</span>
                      </div>
                      <span className="text-[#a16b4b]">+{new Intl.NumberFormat("vi-VN").format(top.price)}đ</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#faf7f2] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8b796b]">Tổng tiền tạm tính</p>
                <p className="text-lg font-black text-[#a16b4b]">
                  {new Intl.NumberFormat("vi-VN").format(calculateCustomPrice())}đ
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-xl border border-[#e5d8ca] px-3 py-2 text-xs font-bold text-stone-500"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="rounded-xl bg-[#35251f] px-4 py-2 text-xs font-bold text-white hover:bg-[#634536]"
                >
                  Xác nhận lựa chọn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}