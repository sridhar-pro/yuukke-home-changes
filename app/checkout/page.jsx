"use client";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ShoppingBag,
  Mail,
  Phone,
  FileText,
  LocateFixed,
} from "lucide-react";
import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/AuthContext";

export default function CheckoutPage({ formData }) {
  const router = useRouter();

  const { getValidToken } = useAuth();

  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("razorpay_payment_id");
    if (storedId) setPaymentId(storedId);

    const handlePaymentIdUpdate = (e) => {
      setPaymentId(e.detail); // Instantly update from custom event
    };

    window.addEventListener("razorpayPaymentIdUpdated", handlePaymentIdUpdate);

    return () => {
      window.removeEventListener(
        "razorpayPaymentIdUpdated",
        handlePaymentIdUpdate
      );
    };
  }, []);

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const storedOrderId = localStorage.getItem("razorpay_order_id");
    if (storedOrderId) setOrderId(storedOrderId);
  }, []);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [showInfo, setShowInfo] = useState(true);

  const handleToggle = () => {
    setShowInfo((prev) => !prev);
  };

  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
  };

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

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  const today = new Date();
  const orderDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7);

  const estimatedDelivery = deliveryDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState(false);

  useEffect(() => {
    if (paymentSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const notifyBackend = async () => {
        const storedOrder = JSON.parse(localStorage.getItem("order_id_data"));
        const saleid = storedOrder?.sale_id;

        if (!saleid) {
          console.warn("🚫 No sale_id found in localStorage!");
          return;
        }

        const token = await getValidToken();
        if (!token) {
          console.error(
            "🔐 Auth token missing! Skipping payment notification."
          );
          return;
        }

        // Save order confirmation data before clearing
        const shippingDetails = localStorage.getItem("cart_shipping_details");
        const taxDetails = localStorage.getItem("cart_tax_details");
        const orderConfirmation = {
          orderDetails: shippingDetails ? JSON.parse(shippingDetails) : null,
          taxDetails: taxDetails ? JSON.parse(taxDetails) : null,
          orderId: idordered,
          paymentId,
          orderDate,
        };
        localStorage.setItem(
          "order_confirmation",
          JSON.stringify(orderConfirmation)
        );

        const payload = {
          saleid,
          msg: "success",
          name: formData?.name,
          email: formData?.email,
          phone: formData?.contact,
          guest: true,
        };

        try {
          const res = await fetch("/api/paymentNotify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          console.log("✅ Payment notification response:", data);

          // Clear only the cart data, keep confirmation data
          const keysToRemove = [
            "cart_tax_details",
            "cart_data",
            "order_id_data",
            "cart_shipping_details",
          ];

          keysToRemove.forEach((key) => localStorage.removeItem(key));

          window.dispatchEvent(
            new CustomEvent("cart-cleared", {
              detail: { clearedKeys: keysToRemove },
            })
          );

          console.log("🧼 Cart data cleared after successful payment.");
        } catch (err) {
          console.error("❌ Failed to send payment notification:", err);
        }
      };

      notifyBackend();
    }
  }, [paymentSuccess]);

  const [idordered, setIdOrdered] = useState(null);

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("order_id_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIdOrdered(parsed?.order_id || null);
      } catch (e) {
        console.error("⚠️ Failed to parse order_id_data from localStorage", e);
      }
    }

    // Listen for instant updates via custom event
    const handleOrderIdUpdate = (e) => {
      setIdOrdered(e.detail); // 👈 no need to re-parse localStorage
    };

    window.addEventListener("orderIdDataUpdated", handleOrderIdUpdate);

    return () => {
      window.removeEventListener("orderIdDataUpdated", handleOrderIdUpdate);
    };
  }, []);

  {
    /* Load order_success_details from localStorage */
  }
  // ✅ Get success data from localStorage
  const orderSuccessData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("order_success_details") || "{}")
      : {};

  // ✅ Convert contents object into array
  const success_orderedItems = orderSuccessData?.contents
    ? Object.values(orderSuccessData.contents)
    : [];

  // ✅ Parse currency strings safely
  const parsePrice = (price) =>
    Number(price?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  // ✅ Summary values
  const success_subtotal = parsePrice(orderSuccessData?.subtotal);
  const success_tax = parsePrice(orderSuccessData?.order_tax);
  const success_shipping = parsePrice(orderSuccessData?.shipping);
  const success_total = parsePrice(orderSuccessData?.grand_total);

  return (
    <div className="min-h-screen bg-gray-100 font-odop">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row min-h-screen lg:h-screen">
        {paymentSuccess ? (
          // 🎉 Full-page success layout
          <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
            >
              {/* 🎉 Success GIF Animation */}
              <motion.img
                src="/Success.gif" // make sure the gif itself is non-looping!
                alt="Success Animation"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, type: "spring", stiffness: 80 }}
                className="w-32 h-32 mx-auto  object-contain"
              />

              {/* Title and message */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-3xl font-bold text-black capitalize"
              >
                Thanks for your order!
              </motion.h1>

              <button
                onClick={() => {
                  router.push("/");

                  setCartItems([]);
                }}
                className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>

              <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
                {/* Header */}
                <div className="bg-green-700 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-xl text-left uppercase">
                      Order ID :{" "}
                      <span className="">{idordered || "Not Available"}</span>
                    </p>
                    <p className="text-xs mt-1 text-left text-yellow-200">
                      Order Date :{" "}
                      <span className="font-medium">{orderDate}</span>{" "}
                    </p>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                  {success_orderedItems.map((item) => (
                    <div
                      key={item.rowid}
                      className="flex items-center gap-4 py-4"
                    >
                      <img
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p
                          className="font-medium text-sm text-left"
                          dangerouslySetInnerHTML={{ __html: item.name }}
                        />
                      </div>
                      <div className="text-right px-5">
                        <p className="text-sm mt-1 text-right">
                          ₹
                          {(parsePrice(item.price) * Number(item.qty)).toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Divider */}
                <hr className="my-3 border-gray-200" />
                {/* Address / Payment / Delivery */}
                <div className="px-5 pb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Payment method</p>
                  <span className="text-sm text-gray-700 break-all">
                    Razorpay • {paymentId || "Not available"}
                  </span>
                </div>
                <hr className="my-3 border-gray-200" />

                {/* Price Summary */}
                <div className="px-5 pb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Item cost</span>
                    <span>₹{success_subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{success_tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping fee</span>
                    <span>₹{success_shipping.toFixed(2)}</span>
                  </div>

                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Cost</span>
                    <span>₹{success_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : paymentFailure ? (
          <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
            >
              <motion.img
                src="/Failure.gif" // make sure the gif itself is non-looping!
                alt="Success Animation"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, type: "spring", stiffness: 80 }}
                className="w-32 h-32 mx-auto  object-contain"
              />

              {/* Title and message */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-3xl font-bold text-black capitalize"
              >
                Payment Failed !
              </motion.h1>

              <button
                onClick={() => {
                  router.push("/");

                  setCartItems([]);
                }}
                className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>

              <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
                {/* Header */}
                <div className="bg-red-600 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-xl text-left uppercase">
                      Order ID :{" "}
                      <span className="">{idordered || "Not Available"}</span>
                    </p>
                    <p className="text-xs mt-1 text-left text-yellow-200">
                      Order Date :{" "}
                      <span className="font-medium">{orderDate}</span>{" "}
                      {/* &nbsp; | */}
                      {/* &nbsp;
                    <span className="text-yellow-300">
                      Estimated delivery : {estimatedDelivery}
                    </span> */}
                    </p>
                  </div>
                  {/* <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm bg-white text-[#A00300] font-semibold rounded-full hover:bg-gray-100 transition">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Download Invoice
                  </button>
                  <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-[#A00300] font-semibold rounded-full transition">
                    Track Order
                  </button>
                </div> */}
                </div>

                {/* Ordered Items */}
                <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <img
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p
                          className="font-medium text-sm text-left"
                          dangerouslySetInnerHTML={{ __html: item.name }}
                        />
                      </div>
                      <div className="text-right px-5">
                        <p className="text-sm mt-1 text-right">
                          ₹
                          {(
                            Number(
                              item.price?.toString().replace(/[^0-9.-]+/g, "")
                            ) * Number(item.qty)
                          ).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <hr className="my-3 border-gray-200" />

                {/* Address / Payment / Delivery */}
                <div className="px-5 pb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Payment method</p>
                  <span className="text-sm text-gray-700 break-all">
                    Razorpay • Payment Failed
                  </span>
                </div>

                <hr className="my-3 border-gray-200" />

                {/* Price Summary */}
                <div className="px-5 pb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Item cost</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping fee</span>
                    <span>₹{shipping.toFixed(2)}</span>{" "}
                    {/* You can make this dynamic if needed */}
                  </div>

                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Cost</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // 🧾 Normal checkout layout (split screen)
          <>
            {/* mob-only */}
            <div className=" border-b border-gray-300 p-6 lg:hidden">
              {/* 🔽 Header toggle for mobile */}
              <div
                className="flex items-center justify-between lg:hidden cursor-pointer"
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              >
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-[400] tracking-tight">
                    Order Summary
                  </h1>
                  {isSummaryOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                <span className="text-xl font-[800] text-gray-800">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              {/* 🧾 Content wrapper */}
              <div
                className={`space-y-6 ${
                  !isSummaryOpen ? "hidden" : ""
                } lg:block`}
              >
                {/* 🛍 Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 mt-6">
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
                          Number(
                            item.price?.toString().replace(/[^0-9.-]+/g, "")
                          ) * Number(item.qty)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* 🎁 Discount Input */}
                <div className="flex gap-2 mt-4">
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
            {/* Left: Scrollable Form Section */}
            <CheckoutForm
              total={total}
              onPaymentSuccess={() => setPaymentSuccess(true)}
              onPaymentFailure={() => setPaymentFailure(true)}
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
            />

            {/* Right: Sticky Summary */}
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              total={total}
              tax={tax}
              shipping={shipping}
              selectedMethod={selectedMethod}
              handleRadioChange={handleRadioChange}
              handleToggle={handleToggle}
              showInfo={showInfo}
            />
          </>
        )}
      </div>
    </div>
  );
}
