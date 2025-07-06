// components/ProductCard.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";

const ProductCard = ({ 
  product, 
  onQuickView, 
  isOutOfStock,
  getImageSrc,
  showPromoTag,
  hasPromo,
  promoPrice,
  originalPrice,
  discountPercent,
  review
}) => {
  return (
    <motion.div
      key={product.id}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        },
      }}
      whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
      className={`relative group rounded-3xl p-3 md:p-4 flex flex-col h-full ${
        isOutOfStock ? "bg-gray-50 cursor-not-allowed" : "bg-white"
      }`}
    >
      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/10 z-[100] rounded-2xl flex items-center justify-center">
          <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
            Out of Stock
          </span>
        </div>
      )}

      {/* Business Type Badges */}
      {product.business_type === "3" && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
          Premium
        </span>
      )}

      {product.business_type === "2" && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
          Verified
        </span>
      )}

      {/* Wishlist */}
      {!isOutOfStock && (
        <div className="relative group">
          <div className={`absolute top-2 right-2 md:top-3 md:right-3 z-10 hover:z-[70] transition-z-index duration-200`}>
            <button
              onClick={() => {
                window.location.href = "https://marketplace.yuukke.com/shop/login/";
              }}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#A00300]/10 transition cursor-pointer"
            >
              <Heart className="text-gray-500 w-4 h-4 md:w-5 md:h-5 group-hover:text-[#A00300]" />
            </button>
          </div>
        </div>
      )}

      {/* Product Image */}
      <Link
        href={!isOutOfStock ? `/products/${product.slug || product.id}` : "#"}
        passHref
      >
        <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
          <Image
            src={getImageSrc(product.image)}
            alt={product.name || "Image not found!"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-contain ${isOutOfStock ? "opacity-70" : ""}`}
          />
          {/* Hover Image */}
          {!isOutOfStock && product.image_g && (() => {
            const matches = product.image_g?.match(/src="([^"]+)"/g) || [];
            const urls = matches.map((src) => src.replace(/src="|"/g, ""));
            const hoverImage = urls[1];
            return hoverImage && (
              <Image
                src={hoverImage}
                alt="Hover preview"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
              />
            );
          })()}
        </div>
      </Link>

      {/* Quick View Buttons */}
      {!isOutOfStock && (
        <>
          <div className="hidden md:block absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition hover:bg-[#A00300] group/quickview cursor-pointer pointer-events-auto"
              >
                <Eye className="text-gray-700 w-6 h-6 group-hover/quickview:text-white transition-colors" />
              </button>
            </div>
          </div>

          <div className="md:hidden absolute bottom-[7rem] right-3 z-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="min-w-[40px] min-h-[40px] w-10 h-10 bg-[#A00300] cursor-pointer rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
              aria-label="Quick View"
            >
              <Eye className="text-white w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Product Info */}
      <div className="flex flex-col h-full">
        <div className="min-h-[50px] md:min-h-[60px]">
          {showPromoTag && (
            <div className="mb-1 md:mb-2">
              <span className="inline-flex items-center bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                {product.promo_tag}
              </span>
            </div>
          )}
          <Link href={`/products/${product.slug}`} passHref>
            <h3
              className={`text-xs md:text-base font-semibold line-clamp-2 mb-0.5 md:mb-1 capitalize ${
                isOutOfStock
                  ? "text-gray-500"
                  : "text-gray-900 hover:text-[#A00300]"
              } cursor-pointer transition-colors`}
            >
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          {review > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      i < Math.floor(review) ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 ml-1">
                ({Number(review.toFixed(1))})
              </span>
            </div>
          )}
        </div>

        <div className="mt-0">
          <div className="space-y-1 mt-1">
            {hasPromo ? (
              <>
                <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                  <p
                    className={`text-sm md:text-lg font-bold ${
                      isOutOfStock ? "text-gray-500" : "text-[#A00300]"
                    }`}
                  >
                    ₹{promoPrice.toFixed(2)}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 line-through">
                    ₹{originalPrice.toFixed(2)}
                  </p>
                </div>
                <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                  {discountPercent}% OFF
                </span>
              </>
            ) : (
              <p
                className={`text-sm md:text-lg font-bold ${
                  isOutOfStock ? "text-gray-500" : "text-gray-900"
                }`}
              >
                ₹{originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;