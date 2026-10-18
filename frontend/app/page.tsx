"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
};

type Topping = {
  id: number;
  name: string;
  price: number;
};

type CartItem = {
  key: string;
  product: Product;
  size: "S" | "M" | "L";
  toppings: Topping[];
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Đen đá",
    description: "Cà phê đậm đà, dùng cùng đá mát lạnh",
    price: 25000,
    emoji: "🧊",
  },
  {
    id: 2,
    name: "Sữa đá",
    description: "Cà phê truyền thống kết hợp sữa đặc",
    price: 30000,
    emoji: "☕",
  },
  {
    id: 3,
    name: "Bạc xỉu",
    description: "Sữa béo dịu nhẹ cùng chút cà phê thơm",
    price: 35000,
    emoji: "🥛",
  },
  {
    id: 4,
    name: "Cà phê muối",
    description: "Cà phê thơm kết hợp lớp kem muối béo mặn",
    price: 39000,
    emoji: "☕",
  },
  {
    id: 5,
    name: "Espresso",
    description: "Cà phê nguyên chất đậm vị",
    price: 30000,
    emoji: "☕",
  },
  {
    id: 6,
    name: "Americano",
    description: "Espresso pha loãng với nước nóng",
    price: 35000,
    emoji: "🖤",
  },
  {
    id: 7,
    name: "Cappuccino",
    description: "Espresso kết hợp sữa nóng và bọt sữa",
    price: 45000,
    emoji: "☕",
  },
  {
    id: 8,
    name: "Latte",
    description: "Espresso hòa quyện cùng sữa tươi",
    price: 45000,
    emoji: "🥛",
  },
  {
    id: 9,
    name: "Mocha",
    description: "Cà phê kết hợp chocolate và sữa",
    price: 49000,
    emoji: "🍫",
  },
  {
    id: 10,
    name: "Macchiato",
    description: "Espresso với một lớp bọt sữa mịn",
    price: 45000,
    emoji: "☕",
  },
];

const toppings: Topping[] = [
  { id: 1, name: "Trân châu đen", price: 5000 },
  { id: 2, name: "Trân châu trắng", price: 5000 },
  { id: 3, name: "Thạch cà phê", price: 5000 },
  { id: 4, name: "Thạch trái cây", price: 5000 },
  { id: 5, name: "Kem cheese", price: 10000 },
  { id: 6, name: "Pudding trứng", price: 8000 },
];

const sizePrices = {
  S: 0,
  M: 5000,
  L: 10000,
};

export default function Home() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedSize, setSelectedSize] =
    useState<"S" | "M" | "L">("M");

  const [selectedToppings, setSelectedToppings] =
    useState<Topping[]>([]);

  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const getUnitPrice = (
    product: Product,
    size: "S" | "M" | "L",
    selected: Topping[],
  ) => {
    const toppingTotal = selected.reduce(
      (sum, topping) => sum + topping.price,
      0,
    );

    return product.price + sizePrices[size] + toppingTotal;
  };

  const getSelectedTotal = () => {
    if (!selectedProduct) return 0;

    return (
      getUnitPrice(selectedProduct, selectedSize, selectedToppings) *
      quantity
    );
  };

  const openCustomizer = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedToppings([]);
    setQuantity(1);
  };

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((current) => {
      const exists = current.some((item) => item.id === topping.id);

      if (exists) {
        return current.filter((item) => item.id !== topping.id);
      }

      return [...current, topping];
    });
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    const itemKey = [
      selectedProduct.id,
      selectedSize,
      ...selectedToppings.map((item) => item.id).sort((a, b) => a - b),
    ].join("-");

    setCart((current) => {
      const existing = current.find((item) => item.key === itemKey);

      if (existing) {
        return current.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...current,
        {
          key: itemKey,
          product: selectedProduct,
          size: selectedSize,
          toppings: [...selectedToppings],
          quantity,
        },
      ];
    });

    setSelectedProduct(null);
  };

  const updateCartQuantity = (key: string, change: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      getUnitPrice(item.product, item.size, item.toppings) *
        item.quantity,
    0,
  );

  return (
  <main className="min-h-screen bg-stone-100 text-stone-900">
    {/* Thanh điều hướng */}
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        {/* Logo BrewLite */}
        <Link
          href="/"
          className="text-2xl font-bold text-emerald-700"
        >
          ☕ BrewLite
        </Link>

        {/* Nút giỏ hàng */}
<button
  type="button"
  onClick={() => {
    if (cartCount === 0) { // Hoặc cart.length === 0 tùy thuộc vào state giỏ hàng của bạn
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    router.push("/checkout");
  }}
  className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
>
  🛒 Giỏ hàng ({cartCount})
</button>
      </div>
    </header>

      {/* Banner */}
      <section className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="mb-3 font-medium text-emerald-300">
            CÀ PHÊ NGON, ĐẶT HÀNG NHANH
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Bắt đầu ngày mới với một ly cà phê yêu thích
          </h1>

          <p className="mt-4 max-w-xl text-emerald-100">
            Khám phá thực đơn BrewLite và tùy chỉnh đồ uống theo sở thích.
          </p>

          <a
            href="#menu"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-emerald-900 hover:bg-emerald-50"
          >
            Khám phá thực đơn
          </a>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <p className="font-semibold text-emerald-700">BREWLITE MENU</p>
          <h2 className="mt-2 text-3xl font-bold">Thực đơn của chúng tôi</h2>
          <p className="mt-2 text-stone-600">
            Chọn món, size và topping bạn yêu thích.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-emerald-50 text-7xl">
                {product.emoji}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold">{product.name}</h3>

                <p className="mt-2 min-h-12 text-sm text-stone-600">
                  {product.description}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="font-bold text-emerald-800">
                    Từ {formatPrice(product.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => openCustomizer(product)}
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    + Thêm món
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cửa sổ tùy chỉnh món */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-stone-200 p-5">
              <div>
                <h2 id="customizer-title" className="text-2xl font-bold">
                  {selectedProduct.emoji} {selectedProduct.name}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Tùy chỉnh đồ uống của bạn
                </p>
              </div>

              <button
                type="button"
                aria-label="Đóng cửa sổ"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg px-3 py-1 text-2xl text-stone-500 hover:bg-stone-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Chọn size */}
              <div>
                <h3 className="mb-3 font-bold">1. Chọn size</h3>

                <div className="grid grid-cols-3 gap-3">
                  {(["S", "M", "L"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl border p-3 ${
                        selectedSize === size
                          ? "border-emerald-700 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700"
                          : "border-stone-200 hover:border-emerald-500"
                      }`}
                    >
                      <span className="block font-bold">Size {size}</span>
                      <span className="mt-1 block text-sm">
                        {sizePrices[size] === 0
                          ? "Giá gốc"
                          : `+${formatPrice(sizePrices[size])}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn topping */}
              <div>
                <h3 className="mb-1 font-bold">2. Chọn topping</h3>
                <p className="mb-3 text-sm text-stone-500">
                  Có thể chọn nhiều loại topping.
                </p>

                <div className="space-y-2">
                  {toppings.map((topping) => {
                    const checked = selectedToppings.some(
                      (item) => item.id === topping.id,
                    );

                    return (
                      <label
                        key={topping.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                          checked
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-stone-200 hover:border-emerald-400"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTopping(topping)}
                            className="h-4 w-4 accent-emerald-700"
                          />

                          <span>{topping.name}</span>
                        </span>

                        <span className="text-sm font-medium text-emerald-800">
                          +{formatPrice(topping.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Chọn số lượng */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold">3. Số lượng</h3>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="h-9 w-9 rounded-lg border border-stone-300 text-lg hover:bg-stone-100"
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>

                  <span className="min-w-5 text-center font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(99, current + 1))
                    }
                    className="h-9 w-9 rounded-lg border border-stone-300 text-lg hover:bg-stone-100"
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Giá và nút xác nhận */}
            <div className="border-t border-stone-200 bg-stone-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-stone-600">Tổng tiền</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {formatPrice(getSelectedTotal())}
                </span>
              </div>

              <button
                type="button"
                onClick={addToCart}
                className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Giỏ hàng */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 id="cart-title" className="text-2xl font-bold">
                Giỏ hàng ({cartCount})
              </h2>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Đóng giỏ hàng"
                className="rounded-lg px-3 py-1 text-2xl text-stone-500 hover:bg-stone-100"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <p className="py-10 text-center text-stone-500">
                  Giỏ hàng của bạn đang trống.
                </p>
              ) : (
                cart.map((item) => (
                  <article
                    key={item.key}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">
                          {item.product.emoji} {item.product.name}
                        </h3>

                        <p className="mt-1 text-sm text-stone-600">
                          Size {item.size}
                        </p>

                        <p className="mt-1 text-sm text-stone-600">
                          Topping:{" "}
                          {item.toppings.length
                            ? item.toppings.map((t) => t.name).join(", ")
                            : "Không có"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCart((current) =>
                            current.filter((cartItem) => cartItem.key !== item.key),
                          )
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.key, -1)}
                          className="h-8 w-8 rounded-lg border hover:bg-stone-100"
                          aria-label="Giảm số lượng trong giỏ"
                        >
                          −
                        </button>

                        <span className="font-semibold">{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.key, 1)}
                          className="h-8 w-8 rounded-lg border hover:bg-stone-100"
                          aria-label="Tăng số lượng trong giỏ"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-emerald-800">
                        {formatPrice(
                          getUnitPrice(
                            item.product,
                            item.size,
                            item.toppings,
                          ) * item.quantity,
                        )}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="border-t bg-stone-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() =>
                  alert(
                    "Giỏ hàng đã sẵn sàng. Bước tiếp theo sẽ kết nối API đặt hàng và thanh toán.",
                  )
                }
                className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
        © 2026 BrewLite — Hệ thống đặt cà phê trực tuyến.
      </footer>
    </main>
  );
}