"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import CartSidebar from "../../components/CartSideBar";

export default function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  mainImage,
  setMainImage,
  quantity,
  increaseQty,
  decreaseQty,
  isAdding,
  setIsAdding,
}) {
  const modalRef = useRef(null);

  const getImageSrcThumbs = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/thumbs/${image}`;
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  if (!quickViewProduct) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-4 md:py-0 overflow-y-auto"
        onClick={(e) =>
          e.target === e.currentTarget && setQuickViewProduct(null)
        }
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            duration: 0.25,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="relative w-full max-w-5xl rounded-3xl p-4 md:p-10 shadow-2xl bg-white backdrop-blur-xl border border-white/20 my-auto"
          ref={modalRef}
        >
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-3 right-3 md:top-5 md:right-5 p-1 md:p-2 rounded-full bg-white/70 hover:bg-red-100 transition z-[110] cursor-pointer"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-red-500" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Image Section */}
            <div className="order-1 md:order-none">
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden">
                {(mainImage || quickViewProduct.image) && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mainImage || quickViewProduct.image}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={getImageSrc(mainImage || quickViewProduct.image)}
                        alt={quickViewProduct.name || "Image not found!"}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {quickViewProduct.image_g && (
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto scrollbar-hide py-2">
                  {(() => {
                    const matches =
                      quickViewProduct.image_g.match(/src="([^"]+)"/g) || [];
                    const imageUrls = matches.map((src) =>
                      src.replace(/src="|"/g, "")
                    );
                    const allImages = [
                      getImageSrcThumbs(quickViewProduct.image),
                      ...imageUrls,
                    ].filter(
                      (img, index, self) => img && self.indexOf(img) === index
                    );

                    return allImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setMainImage(img)}
                        className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm ${
                          img === mainImage
                            ? "border-[#A00300] ring-1 ring-[#A00300]"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`thumb-${i}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover rounded-md"
                        />
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-between order-2 md:order-none">
              <div>
                {quickViewProduct.promo_tag && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
                      {quickViewProduct.promo_tag}
                    </span>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 capitalize">
                  {quickViewProduct.name}
                </h2>

                {Number(quickViewProduct?.review) > 0 && (
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">
                      {Number(quickViewProduct.review).toFixed(1)}
                    </span>
                  </div>
                )}

                <div className="mb-3 md:mb-4">
                  {(quickViewProduct.promo_price ||
                    quickViewProduct.sale_price ||
                    quickViewProduct.price) && (
                    <>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                        ₹
                        {Number(
                          quickViewProduct.promo_price ||
                            quickViewProduct.sale_price ||
                            quickViewProduct.price
                        ).toFixed(2)}
                      </span>
                      {quickViewProduct.promo_price &&
                        quickViewProduct.cost && (
                          <>
                            <span className="ml-2 sm:ml-4 text-lg sm:text-xl text-gray-400 line-through">
                              ₹{Number(quickViewProduct.cost).toFixed(2)}
                            </span>
                            <span className="ml-2 sm:ml-4 text-sm sm:text-base text-red-600 font-semibold">
                              {Math.round(
                                ((quickViewProduct.cost -
                                  quickViewProduct.promo_price) /
                                  quickViewProduct.cost) *
                                  100
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                    </>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                  {quickViewProduct.description ||
                    "This premium product offers exceptional quality and design."}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/products/${quickViewProduct.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors rounded-lg shadow-md cursor-pointer"
                  >
                    View Full Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* {button} */}
              <div className="flex flex-col gap-4 mt-10 md:mt-0">
                {/* Quantity + Add to Cart Row */}
                <div className="flex items-center justify-between gap-4 ">
                  {/* Quantity Controller */}
                  <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/40 backdrop-blur-md shadow-md overflow-hidden h-12 px-1">
                    {/* Decrease Button */}
                    <button
                      onClick={decreaseQty}
                      disabled={quantity <= 0}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                        quantity <= 0
                          ? "bg-gray-100 cursor-not-allowed text-gray-400"
                          : "bg-white hover:bg-gray-100 text-gray-600"
                      } active:scale-95`}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 " />
                    </button>

                    {/* Quantity Display */}
                    <div className="w-10 text-center font-semibold text-gray-800 select-none">
                      {quantity}
                    </div>

                    {/* Increase Button */}
                    <button
                      onClick={increaseQty}
                      disabled={quantity >= (quickViewProduct?.quantity || 100)}
                      className={`w-10 h-10 flex items-center justify-center relative rounded-lg transition-all duration-200 cursor-pointer ${
                        quantity >= (quickViewProduct?.quantity || 100)
                          ? "bg-gray-100 cursor-not-allowed text-gray-400"
                          : "bg-white hover:bg-gray-100 text-gray-600"
                      } active:scale-95`}
                      aria-label={
                        quantity >= (quickViewProduct?.quantity || 100)
                          ? `Max ${quickViewProduct?.quantity || 100} available`
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-4 h-4" />
                      {quantity >= (quickViewProduct?.quantity || 100) && (
                        <span className="absolute -bottom-6 text-[10px] text-red-500 font-medium whitespace-nowrap">
                          Max {quickViewProduct?.quantity || 100} available
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Add to Cart with slower left-to-right fill */}
                  <div className="relative w-full flex justify-center">
                    {/* Floating GIF loader */}
                    {isAdding && (
                      <div className="absolute -top-16 z-50">
                        <img
                          src="/add.gif"
                          alt="Loading..."
                          className="w-14 h-14"
                        />
                      </div>
                    )}

                    <button
                      disabled={isAdding}
                      onClick={async () => {
                        if (isAdding) return;
                        setIsAdding(true);
                        await new Promise((resolve) =>
                          setTimeout(resolve, 2500)
                        );

                        try {
                          // Get or create cart ID
                          let cartId = localStorage.getItem("cart_id");
                          if (!cartId) {
                            cartId =
                              Math.random().toString(36).substring(2, 15) +
                              Math.random().toString(36).substring(2, 15);
                            localStorage.setItem("cart_id", cartId);
                          }

                          // Get existing cart
                          const existingCart = JSON.parse(
                            localStorage.getItem("cart_data") || "[]"
                          );

                          // Update cart
                          const existingItemIndex = existingCart.findIndex(
                            (item) => item.id === quickViewProduct.id
                          );

                          const updatedCart =
                            existingItemIndex >= 0
                              ? existingCart.map((item, i) =>
                                  i === existingItemIndex
                                    ? {
                                        ...item,
                                        qty: item.qty + quantity,
                                      }
                                    : item
                                )
                              : [
                                  ...existingCart,
                                  {
                                    id: quickViewProduct.id,
                                    name: quickViewProduct.name,
                                    qty: quantity,
                                    price: quickViewProduct.cost,
                                    image: quickViewProduct.image,
                                  },
                                ];

                          // Update state and storage
                          localStorage.setItem(
                            "cart_data",
                            JSON.stringify(updatedCart)
                          );
                          setCartItems(updatedCart);

                          // Close quick view first, then open cart
                          setQuickViewProduct(null);

                          setIsCartOpen(true);

                          toast.success("Added to cart!");
                        } catch (error) {
                          console.error("Add to cart error:", error);
                          toast.error("Failed to add to cart");
                        } finally {
                          setIsAdding(false);
                        }
                      }}
                      className={`group relative flex-1 overflow-hidden rounded-xl py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                        isAdding
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:border-transparent"
                      }`}
                      style={{
                        isolation: "isolate", // Creates new stacking context
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white">
                        <ShoppingCart className="w-5 h-5" />
                        {isAdding ? "Adding..." : "Add to Cart"}
                      </span>
                      <span
                        className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-[900ms] ease-in-out group-hover:w-full z-[1] rounded-xl"
                        style={{
                          transitionProperty: "width, background-color",
                          willChange: "width",
                        }}
                      />
                      <span className="absolute inset-0 z-[-1] rounded-xl border border-transparent group-hover:border-white" />
                    </button>
                  </div>
                  {isCartOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCartOpen(false)}
                      />
                      <CartSidebar
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                      />
                    </>
                  )}
                </div>

                {/* Buy It Now with same slow animation */}
                <button
                  onClick={async () => {
                    // 1. Get or create cart ID
                    let cartId = localStorage.getItem("cart_id");
                    if (!cartId) {
                      cartId =
                        Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
                      localStorage.setItem("cart_id", cartId);
                    }

                    const payload = {
                      selected_country: "IN",
                      product_id: quickViewProduct.id,
                      historypincode: 614624,
                      qty: quantity,
                      cart_id: cartId,
                    };

                    try {
                      // 2. Get or refresh token
                      let token = localStorage.getItem("authToken");

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

                      if (!token) token = await fetchToken();

                      // 3. Send API request
                      let response = await fetch("/api/addcart", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      });

                      // 4. Retry on 401
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

                      // 5. Final result
                      const result = await response.json();
                      console.log("Add to cart result:", result);

                      if (result.redirect_link) {
                        window.location.href = result.redirect_link; // Immediate redirect
                      } else {
                        console.warn("No redirect link returned from API");
                      }
                    } catch (error) {
                      console.error("Buy it now failed:", error);
                    }
                  }}
                  className="group relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold border-1 border-white transition-all duration-500 ease-in-out hover:border-black cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white group-hover:text-black transition-colors duration-500 ease-in-out">
                    Buy It Now
                  </span>
                  <span className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-[900ms] ease-in-out group-hover:w-full z-0"></span>
                  <span className="absolute inset-0 bg-black z-[-1] rounded-xl"></span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
