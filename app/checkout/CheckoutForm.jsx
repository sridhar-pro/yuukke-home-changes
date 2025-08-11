"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet2 } from "lucide-react"; // Adjust if you're using different icon lib
import RazorpayButton from "./RazorpayButton";
import { useAuth } from "@/app/utils/AuthContext";
import { setLocalStorageWithEvent } from "../utils/storageEvents";
import { toast } from "react-toastify";
import { validateFormData } from "../utils/validateForm";

const CheckoutForm = ({
  onPaymentSuccess,
  onPaymentFailure,
  cartItems = [],
  subtotal = 0,
  total,
  tax = 0,
  shipping = 0,
}) => {
  const razorRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    country: "",
    contact: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error as user types
    setFormError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      lastName: "",
      email: "",
      country: "",
      contact: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pin: "",
    });
  };

  const { getValidToken, isAuthReady } = useAuth();

  const [formError, setFormError] = useState({});

  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);
  const formRef = useRef(null);

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry",
    "Ladakh",
    "Jammu and Kashmir",
  ];

  //   const [showSuccess, setShowSuccess] = useState(false);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  const handleOrderAndPay = async () => {
    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      console.warn("❌ Form validation failed", errors);
      return;
    }

    setFormError({});

    try {
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        return;
      }

      const token = await getValidToken();

      const cartId = localStorage.getItem("cart_id");

      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: `${formData.name} ${formData.lastName}`,
          email: formData.email,
          phone: formData.contact,
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pin,
          country: formData.country || "India",
        },
        cart_id: cartId,
      };

      console.log("📦 Sending payload to /api/createOrder:", customerPayload);

      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Error Response:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      console.log("✅ Order created successfully:", result);
      // 👇 Trigger Razorpay button via ref

      // 🧾 Store order data in localStorage
      localStorage.setItem("order_id_data", JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id, // send just what you need
        })
      );

      razorRef.current?.click();
    } catch (err) {
      console.error("🚨 Order creation error:", err);
      toast.error(
        err.message || "Something went wrong while creating the order."
      );
    }
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  return (
    <div className="flex-1 order-1 lg:order-none overflow-y-auto px-6 lg:px-12 py-6 lg:py-8 scrollbar-hide">
      <div ref={formRef} className="space-y-6 pb-0 md:pb-16">
        {/* Contact Section */}
        <div className="relative">
          <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
          <button
            className="absolute top-0 right-0 text-sm underline text-gray-700 hover:text-black transition"
            onClick={() =>
              (window.location.href =
                "https://marketplace.yuukke.com/shop/login")
            }
          >
            Log in
          </button>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full mt-2 rounded-lg px-4 py-3 bg-white"
            value={formData.email}
            onChange={handleChange}
          />
          {formError.email && (
            <p className="text-red-600 text-sm mt-1">{formError.email}</p>
          )}

          <label className="mt-2 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              defaultChecked
              className="accent-black bg-white"
            />
            Email us for news and offers
          </label>
        </div>

        {/* Delivery Section */}
        <div>
          <h1 className="text-xl font-[800] tracking-tight ">Delivery</h1>
          {/* Country Selector */}
          <div className="relative mt-2">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full appearance-none rounded-lg px-4 py-3 bg-white border text-sm pr-10 ${
                formError.country ? "border-red-500" : "border-gray-400"
              } ${formData.country === "" ? "text-gray-400" : "text-black"}`}
            >
              <option value="" disabled hidden>
                Country
              </option>
              <option value="india">India</option>
            </select>

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
              ▼
            </span>

            {formError.country && (
              <p className="text-red-600 text-sm mt-1">{formError.country}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name Field */}
            <div className="flex flex-col">
              <input
                type="text"
                name="name"
                placeholder="First name"
                className="input bg-white"
                value={formData.name}
                onChange={handleChange}
              />
              {formError.name && (
                <p className="text-red-600 text-sm mt-1">{formError.name}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="flex flex-col">
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                className="input bg-white"
                value={formData.lastName || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address Fields */}
          {/* Address Line 1 */}
          <div className="mt-4">
            <input
              type="text"
              name="addressLine1"
              placeholder="Flat, House no, Building, Company"
              className="input w-full pr-10 bg-white"
              value={formData.addressLine1}
              onChange={handleChange}
            />
            {formError.addressLine1 && (
              <p className="text-red-600 text-sm mt-1">
                {formError.addressLine1}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="mt-4">
            <input
              type="text"
              name="addressLine2"
              placeholder="Area, Street, Village"
              className="input w-full bg-white"
              value={formData.addressLine2}
              onChange={handleChange}
            />
            {formError.addressLine2 && (
              <p className="text-red-600 text-sm mt-1">
                {formError.addressLine2}
              </p>
            )}
          </div>

          {/* City, State, PIN */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <input
                type="text"
                name="city"
                placeholder="City"
                className="input bg-white w-full"
                value={formData.city}
                onChange={handleChange}
              />
              {formError.city && (
                <p className="text-red-600 text-sm mt-1">{formError.city}</p>
              )}
            </div>

            {/* State */}
            <div className="relative">
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`input bg-white appearance-none pr-10 w-full px-4 py-3 border border-gray-400 rounded-lg text-sm ${
                  formData.state === "" ? "text-gray-400" : "text-black"
                }`}
              >
                <option value="" disabled hidden>
                  State
                </option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                ▼
              </span>
              {formError.state && (
                <p className="text-red-600 text-sm mt-1">{formError.state}</p>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <input
                type="text"
                name="pin"
                placeholder="PIN code"
                className="input bg-white w-full"
                value={formData.pin}
                maxLength={6}
                inputMode="numeric"
                pattern="\d*"
                onChange={async (e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Strip non-digits

                  if (val.length <= 6) {
                    handleChange({ target: { name: "pin", value: val } });
                  }

                  if (val.length === 6 && isAuthReady) {
                    const cartId = localStorage.getItem("cart_id");

                    if (!cartId) {
                      console.warn("🛒 No cart_id found in localStorage");
                      return;
                    }

                    try {
                      const token = await getValidToken();
                      const res = await fetch("/api/shipping", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          cart_id: cartId,
                          pincode: val,
                        }),
                      });

                      if (!res.ok)
                        throw new Error("Failed to fetch shipping details");

                      const result = await res.json();
                      console.log("🚚 Shipping API result:", result);

                      const shippingData = result?.cart;
                      setLocalStorageWithEvent(
                        "cart_shipping_details",
                        shippingData
                      );
                      console.log("📦 Shipping data saved:", shippingData);
                    } catch (err) {
                      console.error("🚨 Error fetching shipping data:", err);
                    }
                  }
                }}
              />
              {formError.pin && (
                <p className="text-red-600 text-sm mt-1">{formError.pin}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <input
            type="tel"
            name="contact"
            placeholder="Phone"
            className="input mt-4 bg-white"
            value={formData.contact}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            autoComplete="off"
          />
          {formError.contact && (
            <p className="text-red-600 text-sm mt-1">{formError.contact}</p>
          )}
        </div>

        <div className="w-full lg:w-[400px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto py-8 border-t lg:border-t-0 lg:border-l border-gray-300 block md:hidden">
          <div className="space-y-6">
            <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

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
                      Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                      Number(item.qty)
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

            {/* Pay Now (Mobile Only) */}
            {/* <div className="block lg:hidden">
          <RazorpayButton />
        </div> */}
          </div>
        </div>

        {/* Payment Section */}
        <div className="">
          <h1 className="text-xl font-[800] tracking-tight">Payment</h1>
          <p className="text-gray-400 text-xs">
            All transactions are secure and encrypted.
          </p>

          <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
            <label
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between "
              onClick={handleToggle}
            >
              <div className="flex items-start gap-2 sm:items-center">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={selectedMethod === "razorpay"}
                  onChange={handleRadioChange}
                  className="accent-black w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Razorpay Secure
                  <br className="block sm:hidden" />
                  <br className="hidden lg:block" />
                  <span className="text-xs text-gray-600">
                    (UPI, Cards, Wallets, NetBanking)
                  </span>
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 justify-end sm:justify-normal">
                <img
                  src="/upi.svg"
                  alt="UPI"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/visa.svg"
                  alt="Visa"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/master.svg"
                  alt="Master"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/rupay.svg"
                  alt="Rupay"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <div className="relative group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer group-hover:bg-gray-200">
                    +16
                  </div>
                  <div className="absolute bottom-12 right-0 hidden group-hover:grid grid-cols-4 gap-2 bg-black shadow-xl rounded-lg border p-2 z-20 w-[176px]">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <img
                        key={i}
                        src={`/${i + 1}.svg`}
                        alt={`Payment ${i + 1}`}
                        className="w-7 h-7 object-contain"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </label>

            <AnimatePresence initial={false}>
              <motion.div
                key={showInfo ? "visible" : "hidden"}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  marginBottom: showInfo ? 16 : 0, // Prevents button jump
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {showInfo && (
                  <div className="border-t pt-4 mt-6 text-center bg-gray-50">
                    <div className="flex justify-center mb-3">
                      <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                      After clicking “Pay now”, you'll be redirected to Cashfree
                      Payments to securely complete your purchase using UPI,
                      Cards, Wallets or NetBanking.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Button Section */}
        <div className="mt-6">
          {/* Trigger */}
          <button
            onClick={handleOrderAndPay}
            className="py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 bg-black text-white hover:bg-gray-900"
          >
            Proceed to Pay
          </button>

          {/* Hidden RazorpayButton for manual trigger */}
          <div style={{ display: "none" }}>
            <RazorpayButton
              ref={razorRef}
              total={total}
              formData={formData}
              clearForm={clearForm}
              onSuccess={onPaymentSuccess}
              onFailure={onPaymentFailure}
              formError={formError}
              setFormError={setFormError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
