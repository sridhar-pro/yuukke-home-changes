"use client";
import { useRef, useState, useEffect } from "react";
import { Info, Wallet2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const formRef = useRef(null);

  const [showInfo, setShowInfo] = useState(true);

  const handleToggle = () => {
    setShowInfo((prev) => !prev);
  };

  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const [cartItems, setCartItems] = useState([]);
  const TAX_PERCENT = 0;

  useEffect(() => {
    const storedCart = localStorage.getItem("cart_data");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const tax = +(subtotal * (TAX_PERCENT / 100)).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-odop">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row min-h-screen lg:h-screen">
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
            className={`space-y-6 ${!isSummaryOpen ? "hidden" : ""} lg:block`}
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
                    ₹{item.price * item.qty}
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
              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <p className="text-xs text-gray-500">
                Including ₹{tax} in taxes ({TAX_PERCENT}%)
              </p>
            </div>
          </div>
        </div>

        {/* Left: Scrollable Form Section */}
        <div className="flex-1 order-1 lg:order-none overflow-y-auto px-6 lg:px-12 py-6 lg:py-8 scrollbar-hide">
          <div ref={formRef} className="space-y-6 pb-0 md:pb-16">
            {/* Contact Section */}
            <div className="relative">
              <h1 className="text-xl font-[800] tracking-tight">Contact</h1>

              {/* 🧃 Login button in top-right */}
              <button className="absolute top-0 right-0 text-sm underline text-gray-700 hover:text-black transition">
                Log in
              </button>

              <input
                type="email"
                placeholder="Email"
                className="w-full mt-2 rounded-lg px-4 py-3 bg-white"
              />

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
                <select className="w-full appearance-none rounded-lg px-4 py-3 bg-white border border-gray-400 text-sm pr-10">
                  <option>India</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                  ▼
                </span>
              </div>

              {/* Name Fields */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  className="input bg-white"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="input bg-white"
                />
              </div>

              {/* Address with icon */}
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Flat, House no, Building, Company"
                  className="input w-full pr-10 bg-white"
                />
              </div>

              {/* Apartment */}
              <input
                type="text"
                placeholder="Area, Street, Village"
                className="input mt-4 bg-white"
              />

              {/* City, State, PIN */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="input bg-white"
                />
                {/* State Selector */}
                <div className="relative">
                  <select className="input bg-white appearance-none pr-10">
                    <option>Tamil Nadu</option>
                    <option>Andhra Pradesh</option>
                    <option>Arunachal Pradesh</option>
                    <option>Assam</option>
                    <option>Bihar</option>
                    <option>Chhattisgarh</option>
                    <option>Goa</option>
                    <option>Gujarat</option>
                    <option>Haryana</option>
                    <option>Himachal Pradesh</option>
                    <option>Jharkhand</option>
                    <option>Karnataka</option>
                    <option>Kerala</option>
                    <option>Madhya Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Manipur</option>
                    <option>Meghalaya</option>
                    <option>Mizoram</option>
                    <option>Nagaland</option>
                    <option>Odisha</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Sikkim</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Tripura</option>
                    <option>Uttar Pradesh</option>
                    <option>Uttarakhand</option>
                    <option>West Bengal</option>
                    <option>Andaman and Nicobar Islands</option>
                    <option>Chandigarh</option>
                    <option>Dadra and Nagar Haveli and Daman and Diu</option>
                    <option>Delhi</option>
                    <option>Lakshadweep</option>
                    <option>Puducherry</option>
                    <option>Ladakh</option>
                    <option>Jammu and Kashmir</option>
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="PIN code"
                  className="input bg-white"
                />
              </div>

              {/* Phone */}
              <input
                type="text"
                placeholder="Phone"
                className="input mt-4 bg-white"
              />

              {/* Checkboxes */}
              {/* <div className="mt-4 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-black" />
                  Save this information for next time
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-black" />
                  Text me with news and offers
                </label>
              </div> */}
            </div>

            {/* Payment */}
            <div>
              <h1 className="text-xl font-[800] tracking-tight">Payment</h1>
              <p className="text-gray-400 text-xs">
                All transactions are secure and encrypted.
              </p>

              {/* Payment Option */}
              <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
                <label
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  onClick={handleToggle}
                >
                  {/* 🔘 Radio + Label */}
                  <div className="flex items-start gap-2 sm:items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={selectedMethod === "razorpay"}
                      onChange={handleRadioChange}
                      className="accent-black w-4 h-4 mt-1 sm:mt-0"
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

                  {/* 💳 Logos + +16 dropdown */}
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

                    {/* ➕ 16 Icons Hover */}
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

                {/* 📢 Slide-down extra info */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 border-t pt-4 text-center bg-gray-50"
                    >
                      <div className="flex justify-center mb-3">
                        <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                        After clicking “Pay now”, you'll be redirected to
                        Cashfree Payments to securely complete your purchase
                        using UPI, Cards, Wallets or NetBanking.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden sm:block">
              {/* 💸 Pay Now Button */}
              <button
                onClick={() => alert("Initiating payment...")} // Replace with actual pay logic
                className="mt-6 w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sticky Summary */}
        <div className="w-full lg:w-[400px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-300">
          <div className="space-y-6">
            <h1 className="text-xl font-[800] tracking-tight ">
              Order Summary
            </h1>

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
                    ₹{item.price * item.qty}
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
              {/* <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Shipping <Info size={14} className="text-gray-500" />
                </span>
                <span className="text-gray-600">Enter shipping address</span>
              </div> */}
              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <p className="text-xs text-gray-500">
                Including ₹{tax} in taxes ({TAX_PERCENT}%)
              </p>
            </div>

            <div className="block lg:hidden">
              {/* 💸 Pay Now Button */}
              <button
                onClick={() => alert("Initiating payment...")} // Replace with actual pay logic
                className="mt-6 w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
