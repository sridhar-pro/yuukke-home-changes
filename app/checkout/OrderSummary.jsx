"use client";

import { useEffect, useState } from "react";

const OrderSummary = () => {
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
    updateSummaryFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    const handleCustomStorageUpdate = (e) => {
      if (e.detail.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange); // other tabs
    window.addEventListener("local-storage-update", handleCustomStorageUpdate); // same tab

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-update",
        handleCustomStorageUpdate
      );
    };
  }, []);

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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Discount code or gift card"
            className="input flex-1 bg-white"
          />
          <button className="bg-gray-200 text-sm text-gray-600 font-bold px-4 rounded-md">
            Apply
          </button>
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
