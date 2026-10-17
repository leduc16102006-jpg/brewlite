// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-24">
//       <h1 className="text-4xl font-bold text-emerald-600">
//         Hello BrewLite Siuuuuuuuuuuuuuuuuu!
//       </h1>
//       <p className="mt-4 text-gray-600">
//         Hệ thống đặt cà phê không tiền mặt
//       </p>
//     </main>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

const API_URL = "http://localhost:3000/products";

const sizes = [
  { label: "S", extra: 0 },
  { label: "M", extra: 5000 },
  { label: "L", extra: 10000 },
];

const toppings = [
  { id: "pearl", name: "Trân châu", price: 7000 },
  { id: "espresso", name: "Extra shot", price: 10000 },
  { id: "cream", name: "Kem cheese", price: 10000 },
];

const categories = ["Tất cả", "Cà phê đen", "Cà phê sữa", "Khác"];

function getCategory(name: string) {
  const lowerName = name.toLowerCase();

  if (["americano", "espresso", "black coffee"].includes(lowerName)) {
    return "Cà phê đen";
  }

  if (["latte", "cappuccino", "bac xiu", "milk coffee"].includes(lowerName)) {
    return "Cà phê sữa";
  }

  return "Khác";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const totalPrice = selectedProduct
  ? selectedProduct.price +
    (sizes.find((size) => size.label === selectedSize)?.extra ?? 0) +
    toppings
      .filter((topping) => selectedToppings.includes(topping.id))
      .reduce((total, topping) => total + topping.price, 0)
  : 0;

  async function fetchProducts() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Không thể tải sản phẩm");
    }

    const data: Product[] = await response.json();
    setProducts(data);
  } catch {
    // Dữ liệu tạm thời
    setProducts([
      { id: 1, name: "Americano", price: 39000, imageUrl: "/images/americano.jpg" },
      { id: 2, name: "Latte", price: 55000, imageUrl: "/images/latte.jpg" },
      { id: 3, name: "Cappuccino", price: 55000, imageUrl: "/images/cappuccino.jpg" },
      { id: 4, name: "Bạc Xỉu", price: 45000, imageUrl: "/images/bac-xiu.jpg" },
      { id: 5, name: "Black coffee", price: 35000, imageUrl: "/images/black-coffee.jpg" },
      { id: 6, name: "Macchiato", price: 55000, imageUrl: "/images/macchiato.jpg" },
      { id: 7, name: "Espresso", price: 39000, imageUrl: "/images/espresso.jpg" },
      { id: 8, name: "Milk coffee", price: 45000, imageUrl: "/images/milk-coffee.jpg" },
      { id: 9, name: "Mocha", price: 55000, imageUrl: "/images/mocha.jpg" },
      { id: 10, name: "Salty coffee", price: 45000, imageUrl: "/images/salty-coffee.jpg" },
    ]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    void fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        activeCategory === "Tất cả" ||
        getCategory(product.name) === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#35251f]">
      {/* Header */}
      <header className="border-b border-[#e9dfd4] bg-[#faf7f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
          <a href="/" className="text-2xl font-black tracking-tight">
            BREW<span className="text-[#a16b4b]">LITE</span>
          </a>

          {/* <span className="hidden text-sm text-[#806e62] sm:block">
            Your daily coffee ritual
          </span> */}

          <button
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full bg-[#35251f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#634536]"
          >
            Khám phá menu ↓
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 md:grid-cols-2 md:px-10 md:py-20">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#a16b4b]">
            Freshly brewed, just for you
          </p>

          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Một chút cà phê,
            <span className="text-[#a16b4b]"> một chút chill.</span>
          </h1>

          <p className="mt-6 max-w-md leading-7 text-[#806e62]">
            Tìm thức uống yêu thích của bạn và biến mỗi ngày thành một trải
            nghiệm thật đặc biệt.
          </p> 
          

          <button
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 rounded-full bg-[#a16b4b] px-7 py-3.5 font-semibold text-white transition hover:bg-[#805238]"
          >
            Xem menu ngay →
          </button>
        </div>

        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-[2rem] bg-[#e9ddce] p-8 md:min-h-96">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#d2b69a]" />
          <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-[#d9c1a9]" />

          <div className="relative text-center">
            <span className="text-8xl md:text-9xl">☕</span>
            <p className="mt-5 font-serif text-2xl italic text-[#634536]">
              Made with love.
            </p>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#a16b4b]">
            Find your favorite
          </p>
          <h2 className="text-3xl font-black md:text-4xl">MENU</h2>
          <p className="mt-3 text-[#806e62]">
            Những lựa chọn dành riêng cho bạn ngày hôm nay.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm Americano, Latte, Mocha..."
            aria-label="Tìm đồ uống"
            className="w-full rounded-2xl border border-[#e5d8ca] bg-white px-5 py-4 outline-none transition placeholder:text-[#b2a397] focus:border-[#a16b4b] md:max-w-md"
          />
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-[#35251f] text-white"
                  : "border border-[#e5d8ca] bg-white text-[#806e62] hover:border-[#a16b4b]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e5d8ca] border-t-[#a16b4b]" />
            <p className="text-[#806e62]">Đang pha menu cho bạn...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-3xl border border-[#ead6c8] bg-white p-10 text-center">
            <p className="text-4xl">☕</p>
            <p className="mt-4 font-bold">{error}</p>
            <button
              onClick={() => void fetchProducts()}
              className="mt-5 rounded-full bg-[#35251f] px-6 py-3 font-semibold text-white hover:bg-[#634536]"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Product list */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-[#eee4da] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#f0e7dc]">
                  <span className="text-7xl transition duration-300 group-hover:scale-110">
                    ☕
                  </span>

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#806e62]">
                    {getCategory(product.name)}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">{product.name}</h3>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-lg font-extrabold text-[#a16b4b]">
                      {formatPrice(product.price)}
                    </p>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`Xem chi tiết ${product.name}`}
                      className="rounded-full bg-[#35251f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a16b4b]"
                    >
                      Chi tiết +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-3xl bg-white px-5 py-16 text-center">
            <p className="text-5xl">🔎</p>
            <h3 className="mt-4 text-xl font-bold">Chưa tìm thấy món phù hợp</h3>
            <p className="mt-2 text-[#806e62]">
              Bạn thử từ khóa khác hoặc chọn danh mục khác nha.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("Tất cả");
              }}
              className="mt-5 font-bold text-[#a16b4b] underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[#a49385]">
          BrewLite · Chậm một chút, yêu nhiều hơn.
        </p>
      </section>

          {/* Product detail */}
    {selectedProduct && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
        onClick={() => setSelectedProduct(null)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-title"
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#faf7f2] p-7 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-widest text-[#a16b4b]">
              Customize your drink
            </p>

            <button
              onClick={() => setSelectedProduct(null)}
              aria-label="Đóng chi tiết sản phẩm"
              className="rounded-full px-3 py-1 text-xl hover:bg-[#e9ddce]"
            >
              ×
            </button>
          </div>

          <div className="flex h-32 items-center justify-center rounded-2xl bg-[#e9ddce] text-7xl">
            ☕
          </div>

          <h2 id="product-title" className="mt-5 text-2xl font-black">
            {selectedProduct.name}
          </h2>

          <p className="mt-2 text-sm text-[#806e62]">
            Tùy chỉnh thức uống theo sở thích của bạn.
          </p>

          {/* Choose size */}
          <div className="mt-6">
            <h3 className="mb-3 font-bold">1. Chọn size</h3>

            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size.label)}
                  className={`rounded-xl border p-3 transition ${
                    selectedSize === size.label
                      ? "border-[#a16b4b] bg-[#ead9c8] text-[#35251f]"
                      : "border-[#e5d8ca] bg-white"
                  }`}
                >
                  <span className="block font-bold">{size.label}</span>
                  <span className="mt-1 block text-xs">
                    {size.extra === 0
                      ? "Giá gốc"
                      : `+${formatPrice(size.extra)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Choose toppings */}
          <div className="mt-6">
            <h3 className="mb-3 font-bold">2. Thêm topping</h3>

            <div className="space-y-3">
              {toppings.map((topping) => {
                const checked = selectedToppings.includes(topping.id);

                return (
                  <label
                    key={topping.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e5d8ca] bg-white p-4"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedToppings((current) =>
                            checked
                              ? current.filter((id) => id !== topping.id)
                              : [...current, topping.id]
                          );
                        }}
                        className="h-4 w-4 accent-[#a16b4b]"
                      />
                      <span className="font-medium">{topping.name}</span>
                    </span>

                    <span className="text-sm font-semibold text-[#a16b4b]">
                      +{formatPrice(topping.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 rounded-2xl bg-[#eadfd2] p-5">
            <p className="text-sm text-[#806e62]">Tổng tiền tạm tính</p>
            <p className="mt-1 text-2xl font-black text-[#a16b4b]">
              {formatPrice(totalPrice)}
            </p>
          </div>

          <button
            onClick={() => {
              alert(
                `${selectedProduct.name} · Size ${selectedSize}\n` +
                  `Topping: ${
                    toppings
                      .filter((topping) =>
                        selectedToppings.includes(topping.id)
                      )
                      .map((topping) => topping.name)
                      .join(", ") || "Không có"
                  }\nTổng tiền: ${formatPrice(totalPrice)}`
              );
            }}
            className="mt-5 w-full rounded-full bg-[#35251f] py-3.5 font-bold text-white transition hover:bg-[#634536]"
          >
            Xác nhận lựa chọn
          </button>
        </section>
      </div>
    )}
    </main>
  );
}