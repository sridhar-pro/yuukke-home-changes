"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, IndianRupee, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { setLocalStorageWithEvent } from "../utils/storageEvents";

const CartSidebar = ({ isOpen, onClose, cartItems = [], setCartItems }) => {
  // Format price to show 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  // Memoized RecommendedProductsSlider component
  const RecommendedProductsSlider = React.memo(
    ({ cartItems = [], updateCartItem, setCartItems }) => {
      const [recommendedProducts, setRecommendedProducts] = useState([]);
      const [currentIndex, setCurrentIndex] = useState(0);

      useEffect(() => {
        const cachedProducts = localStorage.getItem("festivalProducts");
        if (cachedProducts) {
          try {
            const parsedProducts = JSON.parse(cachedProducts);
            setRecommendedProducts(
              Array.isArray(parsedProducts) ? parsedProducts : []
            );
          } catch (error) {
            console.error("Error parsing cached products:", error);
            setRecommendedProducts([]);
          }
        }
      }, []);

      useEffect(() => {
        if (recommendedProducts.length > 1) {
          const interval = setInterval(() => {
            setCurrentIndex((prev) =>
              prev === recommendedProducts.length - 1 ? 0 : prev + 1
            );
          }, 5000);
          return () => clearInterval(interval);
        }
      }, [recommendedProducts.length]);

      const handlePrev = () => {
        setCurrentIndex((prev) =>
          prev === 0 ? recommendedProducts.length - 1 : prev - 1
        );
      };

      const handleNext = () => {
        setCurrentIndex((prev) =>
          prev === recommendedProducts.length - 1 ? 0 : prev + 1
        );
      };

      const handleAddToCart = () => {
        if (!setCartItems || typeof setCartItems !== "function") {
          console.error("setCartItems is not available");
          return;
        }

        const currentProduct = recommendedProducts[currentIndex];
        const existingItem = cartItems.find(
          (item) => item.id === currentProduct.id
        );

        try {
          if (existingItem) {
            updateCartItem(currentProduct.id, existingItem.qty + 1);
          } else {
            const updatedCart = [
              ...cartItems,
              {
                ...currentProduct,
                qty: 1,
                price: currentProduct.price,
                image: currentProduct.image,
              },
            ];
            setCartItems(updatedCart);
            localStorage.setItem("cart_data", JSON.stringify(updatedCart));
          }
          toast.success(
            existingItem ? `Increased quantity!` : `Added to cart!`
          );
        } catch (error) {
          console.error("Cart update failed:", error);
          toast.error("Failed to update cart");
        }
      };

      if (recommendedProducts.length === 0) return null;

      return (
        <div className="relative">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mx-2 transition-opacity duration-300">
            {/* Navigation Arrows */}
            {recommendedProducts.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10"
                  aria-label="Previous product"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10"
                  aria-label="Next product"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Product Image */}
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={getImageSrc(recommendedProducts[currentIndex]?.image)}
                alt={recommendedProducts[currentIndex]?.name || "Product"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base line-clamp-1">
                {recommendedProducts[currentIndex]?.name}
              </h4>
              <div className="flex items-center mt-1">
                <IndianRupee className="w-3 h-3 mr-1" />
                <span className="font-medium">
                  {formatPrice(recommendedProducts[currentIndex]?.price || 0)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
              onClick={handleAddToCart}
            >
              Add
            </button>
          </div>
        </div>
      );
    }
  );

  const syncCartWithServer = async (productId, qty) => {
    const cartId =
      localStorage.getItem("cart_id") ||
      (() => {
        const id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", id);
        return id;
      })();

    const payload = {
      selected_country: "IN",
      product_id: productId,
      historypincode: 614624,
      qty,
      cart_id: cartId,
    };

    const fetchToken = async () => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "Admin@123",
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("authToken", data.token);
        return data.token;
      } else {
        throw new Error("Authentication failed");
      }
    };

    let token = localStorage.getItem("authToken");
    if (!token) token = await fetchToken();

    let response = await fetch("/api/addcart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      const retryToken = await fetchToken();
      response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${retryToken}`,
        },
        body: JSON.stringify(payload),
      });
    }

    const result = await response.json();
    console.log("🔁 Cart sync result:", result);
  };

  const updateCartItem = (id, newQty) => {
    const validatedQty = Math.max(1, newQty);

    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          return { ...item, qty: validatedQty };
        }
        return item;
      })
      .filter((item) => item.qty > 0);

    localStorage.setItem("cart_data", JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    // 🆕 Sync to server
    syncCartWithServer(id, validatedQty).catch(console.error);

    return validatedQty;
  };

  const incrementQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      const newQty = updateCartItem(id, item.qty + 1);
      toast.success(`Quantity updated to ${newQty}`);
    }
  };

  const decrementQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      if (item.qty > 1) {
        const newQty = updateCartItem(id, item.qty - 1);
        toast.success(`Quantity updated to ${newQty}`);
      } else {
        removeItem(id);
      }
    }
  };

  const removeItem = async (id) => {
    const currentCart = [...cartItems];

    try {
      // Optimistically remove from UI
      const updatedCart = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedCart);
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));

      // 🔍 STEP 1: Find matching rowid from tax data
      const taxData = JSON.parse(
        localStorage.getItem("cart_tax_details") || "{}"
      );
      const cartId = localStorage.getItem("cart_id");

      let rowidToDelete = null;

      if (taxData.contents && typeof taxData.contents === "object") {
        for (const [key, item] of Object.entries(taxData.contents)) {
          if (item.product_id === id || item.id === id) {
            rowidToDelete = item.rowid || key; // Use rowid from the item itself, fallback to key
            break;
          }
        }
      }

      if (!rowidToDelete) {
        console.warn("⚠️ Row ID not found for product ID:", id);
      } else {
        delete taxData.contents[rowidToDelete]; // 🧽 Clean that rowid!
        setLocalStorageWithEvent("cart_tax_details", taxData); // 🗂️ Update tax data

        const token = localStorage.getItem("authToken");
        const removeRes = await fetch("/api/cartRemove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            rowid: rowidToDelete,
          }),
        });

        const removeData = await removeRes.json();
        console.log("🧹 Server cart removal response:", removeData);

        if (removeData.status === "success") {
          const serverTaxData = removeData.cart_data || {};
          const localTaxData = { ...taxData };

          // Clean the same rowid from server data just in case it’s stale
          if (
            serverTaxData.contents &&
            typeof serverTaxData.contents === "object" &&
            rowidToDelete
          ) {
            delete serverTaxData.contents[rowidToDelete];
          }

          // Final merged data: fallback to local if server data still has ghosts
          const finalTaxData = {
            ...serverTaxData,
            contents: {
              ...(serverTaxData.contents || {}),
            },
          };

          setLocalStorageWithEvent("cart_tax_details", finalTaxData);

          const customEvent = new CustomEvent("local-storage-update", {
            detail: { key: "cart_tax_details" },
          });
          window.dispatchEvent(customEvent);

          console.log("🧹 Final merged and cleaned tax data:", finalTaxData);
        }
      }

      // 🧼 Clear redirect links if needed
      if (updatedCart.length === 0) {
        localStorage.removeItem("last_redirect_link");
        localStorage.removeItem("cart_redirect_link");
        localStorage.removeItem("cart_id");
        localStorage.removeItem("cart_data"); // 🧹 Don't forget to kill the cart data itself!
        localStorage.removeItem("cart_tax_details");
      }

      // 🧈 Toast success
      toast.success(
        <div className="text-center">
          Item removed from cart
          <button
            className="ml-3 text-blue-500 hover:text-blue-700 font-medium"
            onClick={() => {
              setCartItems(currentCart);
              localStorage.setItem("cart_data", JSON.stringify(currentCart));
              toast.dismiss();
            }}
          >
            Undo
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    } catch (error) {
      console.error("❌ Error removing item:", error);
      setCartItems(currentCart);
      localStorage.setItem("cart_data", JSON.stringify(currentCart));

      console.log("🕵️ Found rowid:", rowidToDelete);

      toast.error(
        <div className="text-center">
          Failed to remove item
          <button
            className="ml-3 text-blue-500 hover:text-blue-700 font-medium"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: false,
        }
      );
    }
  };

  const handleCheckout = async () => {
    try {
      // Get cart ID and auth token
      const cartId = localStorage.getItem("cart_id");
      let token = localStorage.getItem("authToken");

      if (!cartId || cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      // Handle authentication if token doesn't exist
      if (!token) {
        const authRes = await fetch(
          "https://marketplace.yuukke.com/api/v1/Auth/api_login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          }
        );
        const authData = await authRes.json();
        if (authData.status === "success") {
          token = authData.token;
          localStorage.setItem("authToken", token);
        } else {
          throw new Error("Authentication failed");
        }
      }

      // Prepare payload for EACH ITEM in the cart
      // We'll process items one by one to match your add-to-cart flow
      for (const item of cartItems) {
        const payload = {
          selected_country: "IN",
          product_id: item.id,
          historypincode: 614624,
          qty: item.qty,
          cart_id: cartId,
        };

        const response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.status !== "success") {
          throw new Error(result.message || "Failed to process cart items");
        }

        // Store the redirect link if provided
        if (result.redirect_link) {
          localStorage.setItem("cart_redirect_link", result.redirect_link);
        }
      }

      // After all items are processed, redirect
      const redirectLink = localStorage.getItem("cart_redirect_link");
      if (redirectLink) {
        window.location.href = redirectLink;
      } else {
        throw new Error("No checkout link available");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to proceed to checkout");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-transparent backdrop-blur-md transition-opacity"
            onClick={onClose}
          />

          {/* Cart Sidebar (unchanged) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[30rem] lg:w-[37rem] bg-white shadow-lg z-[100] rounded-l-3xl overflow-hidden"
          >
            <div className="p-12 sm:p-14 h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-8">
                <h2 className="text-3xl sm:text-4xl font-medium">Cart</h2>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-900 hover:text-white border-2 border-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items */}
              <motion.div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                {cartItems && cartItems.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="py-4 pb-8"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 px-2">
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-white">
                            {item.image ? (
                              <img
                                src={getImageSrc(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 h-16 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm sm:text-lg line-clamp-2 pr-2">
                                {item.name}
                              </h3>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-500 hover:text-black transition p-1 ml-2 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-medium flex items-center text-sm sm:text-base">
                                <IndianRupee className="w-3 h-3 mr-1" />
                                {formatPrice(item.price * item.qty)}
                              </span>
                              <div className="flex items-center bg-gray-50 rounded-sm overflow-hidden">
                                <button
                                  onClick={() => decrementQty(item.id)}
                                  className="px-2 py-2 hover:bg-gray-100 transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm">{item.qty}</span>
                                <button
                                  onClick={() => incrementQty(item.id)}
                                  className="px-2 py-2 hover:bg-gray-100 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div className="border-t border-gray-300 pt-6 pb-6">
                      <h3 className="text-lg font-medium mb-4 px-2 text-gray-900">
                        You May Also Like
                      </h3>
                      <RecommendedProductsSlider
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p>Your cart is empty</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Footer */}
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-950">Subtotal</span>
                  <span className="font-bold flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {formatPrice(
                      cartItems.reduce(
                        (sum, item) => sum + item.price * item.qty,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Shipping and taxes calculated at checkout
                </div>
                <div className="flex justify-end">
                  {/* <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-1/2 bg-red-500 text-sm text-white py-3 mb-8 md:mb-0 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </motion.button> */}
                  <div
                    onClick={() => {
                      onClose?.(); // ✅ close the cart
                    }}
                  >
                    <Link href="/checkout">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-500 text-sm text-white py-3 px-3 mb-8 md:mb-0 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
                      >
                        Proceed to Checkout
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
