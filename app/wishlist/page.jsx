"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, Minus, Plus, IndianRupee } from "lucide-react";

export default function WishListPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Polaroid Snap Touch",
      color: "Red",
      price: 99.89,
      quantity: 1,
      image: "/",
      delivery: "Feb 1 +₹150",
      deliveryFree: false,
    },
    {
      id: 2,
      name: "Xbox Matt One Controller",
      color: "Yellow",
      price: 49.99,
      quantity: 1,
      image: "/",
      delivery: "Today, free",
      deliveryFree: true,
    },
    {
      id: 3,
      name: "JBL Wireless Headphones",
      color: "Dark Blue",
      price: 71.69,
      quantity: 1,
      image: "/",
      delivery: "Today, free",
      deliveryFree: true,
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const delivery = 150;
  const promocodeDiscount = 354.8;
  const tax = subtotal * 0.07;
  const total = subtotal + delivery - promocodeDiscount + tax;

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-white to-white px-6 py-10">
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-[2fr_1fr] gap-12">
        {/* Cart Section */}
        <section className="p-2">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              You have {cartItems.length} items in your cart.
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white rounded-xl shadow-sm p-5 border"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover shadow-md"
                  />

                  <div className="flex-1 w-full">
                    <h2 className="font-semibold text-lg text-gray-900">
                      {item.name}
                    </h2>
                    <p className="text-sm text-gray-500">Color: {item.color}</p>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className="text-blue-600 font-medium">
                        {item.delivery}
                      </span>
                      {item.deliveryFree && (
                        <span className="text-green-600 font-medium">
                          Free Delivery
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-full border hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-full border hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-lg font-bold text-right min-w-[90px] text-gray-800 flex items-center justify-end">
                    <IndianRupee size={16} className="mr-1" />
                    {item.price.toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8">
            <button className="text-sm text-blue-600 flex items-center hover:underline">
              <ChevronLeft size={16} className="mr-1" /> Back to Shopping
            </button>
          </div>
        </section>

        {/* Order Summary */}
        <aside className="bg-white rounded-xl shadow-md p-6 h-fit border">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium flex items-center">
                <IndianRupee size={14} className="mr-1" />
                {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-medium flex items-center">
                <IndianRupee size={14} className="mr-1" />
                {delivery}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pickup Point</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Promo Discount</span>
              <span className="text-green-600 font-medium flex items-center">
                -<IndianRupee size={14} className="mx-1" />
                {promocodeDiscount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium">7%</span>
            </div>
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between items-center text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold flex items-center text-gray-900 text-xl">
              <IndianRupee size={16} className="mr-1" />
              {total.toFixed(2)}
            </span>
          </div>

          <div className="mt-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition-all">
              Proceed to Checkout
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
