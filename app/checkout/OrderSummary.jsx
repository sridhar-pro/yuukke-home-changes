"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

const OrderSummary = () => {
  const { getValidToken } = useAuth();

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const updateSummaryFromStorage = () => {
    const shippingRaw = localStorage.getItem("cart_shipping_details");
    const taxRaw = localStorage.getItem("cart_tax_details");

    // If both storage items are missing, reset to empty state
    if (!shippingRaw && !taxRaw) {
      setCartItems([]);
      setSubtotal(0);
      setShipping(0);
      setTax(0);
      setTotal(0);
      return;
    }

    let sourceData = shippingRaw
      ? JSON.parse(shippingRaw)
      : JSON.parse(taxRaw || "{}");

    const itemsArray = Object.values(sourceData.contents || {});
    setCartItems(itemsArray);

    setSubtotal(parseCurrency(sourceData.subtotal));
    setShipping(parseCurrency(sourceData.shipping));
    setTax(parseCurrency(sourceData.total_item_tax));
    setTotal(parseCurrency(sourceData.grand_total));
  };

  useEffect(() => {
    // Initial load
    updateSummaryFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === "cart_shipping_details" || e.key === "cart_tax_details") {
        updateSummaryFromStorage();
      }
    };

    const handleCustomStorageUpdate = (e) => {
      if (
        e.detail.key === "cart_shipping_details" ||
        e.detail.key === "cart_tax_details"
      ) {
        updateSummaryFromStorage();
      }
    };

    // New handler for cart cleared event
    const handleCartCleared = () => {
      setCartItems([]);
      setSubtotal(0);
      setShipping(0);
      setTax(0);
      setTotal(0);
    };

    window.addEventListener("storage", handleStorageChange); // other tabs
    window.addEventListener("local-storage-update", handleCustomStorageUpdate); // same tab
    window.addEventListener("cart-cleared", handleCartCleared); // special clear event

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-update",
        handleCustomStorageUpdate
      );
      window.removeEventListener("cart-cleared", handleCartCleared);
    };
  }, []);

  const [code, setCode] = useState("");

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getValidToken();
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const [isApplied, setIsApplied] = useState(false);

  const handleApply = async () => {
    const cartId = localStorage.getItem("cart_id");

    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    if (!code.trim()) {
      console.warn("⚠️ Please enter a discount code");
      return;
    }

    try {
      // 1️⃣ Apply coupon
      const bodyData = {
        cart_id: cartId,
        coupon_code: code.trim(),
      };

      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: bodyData,
      });

      console.log("🎉 Coupon applied response:", applyResponse);

      // ✅ Show "Applied" blast
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 3000); // Optional fade reset

      // 2️⃣ Fetch updated tax details
      const taxResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      console.log("💰 Updated tax details:", taxResponse);

      // 3️⃣ Update localStorage with new tax details
      localStorage.setItem("cart_tax_details", JSON.stringify(taxResponse));

      // 4️⃣ Trigger UI update instantly
      window.dispatchEvent(
        new CustomEvent("local-storage-update", {
          detail: { key: "cart_tax_details" },
        })
      );
    } catch (error) {
      console.error("❌ Error applying coupon or fetching tax:", error);
    }
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  return (
    <div className="w-full lg:w-[400px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-300 hidden md:block">
      <div className="space-y-6">
        <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

        {/* 🛍 Cart Items */}
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <img
              src={getImageSrc(item.image)}
              alt={item.name}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {item.name} <br /> x {item.qty}
              </p>
              <p className="text-sm mt-1 text-right">
                ₹
                {(
                  Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                  Number(item.qty)
                ).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        {/* 🎁 Discount Input */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Discount code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input flex-1 bg-white"
          />

          <div className="flex flex-col items-center relative">
            <button
              onClick={handleApply}
              disabled={isApplied}
              className={`bg-gray-200 text-sm font-bold p-4 rounded-md relative z-10 transition-all duration-200 ${
                isApplied ? "text-green-600" : "text-gray-600"
              }`}
            >
              {isApplied ? "Applied" : "Apply"}
            </button>

            {isApplied && (
              <span className="mt-1 text-xs text-green-600 font-medium">
                Coupon Applied
              </span>
            )}
          </div>
        </div>

        {/* 📦 Summary */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-2 font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <p className="text-xs text-gray-500">
            Including ₹{tax.toFixed(2)} in taxes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
