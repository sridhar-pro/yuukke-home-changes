// components/ProductGrid.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCards";

const ProductGrid = ({ products, getImageSrc, onQuickView }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      variants={containerVariants}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      {products.map((product) => {
        const hasPromo =
          product.promotion === "1" || (product.discount && product.discount > 0);
        const promoPrice = product.promo_price
          ? Number(product.promo_price)
          : product.sale_price
          ? Number(product.sale_price)
          : Number(product.price);
        const review = Number(product.review);
        const originalPrice = Number(product.cost);
        const discountPercent = hasPromo
          ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100)
          : 0;
        const showPromoTag = product.promo_tag && hasPromo;

        // Handle quantity check
        const quantityStr = product.quantity?.toString() || "";
        const quantityNum = parseFloat(quantityStr);
        const isOutOfStock =
          quantityStr === "0" ||
          quantityStr === "" ||
          isNaN(quantityNum) ||
          quantityNum <= 0;

        return (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
            isOutOfStock={isOutOfStock}
            getImageSrc={getImageSrc}
            showPromoTag={showPromoTag}
            hasPromo={hasPromo}
            promoPrice={promoPrice}
            originalPrice={originalPrice}
            discountPercent={discountPercent}
            review={review}
          />
        );
      })}
    </motion.div>
  );
};

export default ProductGrid;