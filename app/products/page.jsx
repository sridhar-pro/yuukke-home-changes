"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  SlidersHorizontal,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "@/app/utils/variants";

const AllProductsPage = () => {
  const { getValidToken } = useAuth();
  const hasFetched = useRef(false); // Add this ref

  const options = [
    { label: "Featured", value: "1f" },
    { label: "Best Seller", value: "1bs" },
    { label: "New to Old", value: "1nto" },
    { label: "Price: Low to High", value: "1plth" },
    { label: "Price: High to Low", value: "1phtl" },
  ];

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);

  const [minPrice, setMinPrice] = useState(1);
  const [maxPrice, setMaxPrice] = useState(0);

  const [inStockOnly, setInStockOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleStart, setVisibleStart] = useState(1); // for pagination chunks

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(options[0]);

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsOpen(false);
    // 👉 Trigger sort/filter logic here if needed

    // Re-fetch products with selected sort
    fetchProductsByCategory(
      selectedCategory,
      minPrice,
      maxPrice,
      false,
      1,
      option.value // ✅ pass selected sort value
    );
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchWithAuth = async (url, retry = false) => {
      const token = await getValidToken();
      // console.log("🔐 Using token:", token);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 && !retry) {
        console.warn("⚠️ Token expired, retrying...");
        localStorage.removeItem("authToken");
        return fetchWithAuth(url, true);
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    };

    const fetchCategories = async () => {
      try {
        const data = await fetchWithAuth("/api/homeCategory");
        // console.log("📦 Category Data:", data);

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [getValidToken]);

  useEffect(() => {
    fetchProductsByCategory(); // ⬅️ no category ID = fetch all products
  }, []);

  const handleCategorySelect = (categoryId) => {
    fetchProductsByCategory(categoryId); // ⬅️ fetch products for selected category
  };

  const fetchProductsByCategory = async (
    categoryId = null,
    min = minPrice,
    max = maxPrice,
    inStock = false,
    page = 1,
    sortValue = ""
  ) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error("No auth token found");

      const limit = 24;
      const offset = (page - 1) * limit;

      const filters = {
        gifts_products: "",
        query: "",
        category: categoryId ? { id: categoryId } : {},
        subcategory: "",
        sub_subcategory: "",
        brand: "",
        sorting: "name-asc",
        min_price: String(min),
        max_price: String(max),
        page: String(page),
        sort_by_v: sortValue,
        limit: String(limit),
        offset: String(offset),
        in_stock: inStock ? "1" : "0",
      };

      const response = await fetch("/api/getProducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filters }),
      });

      const result = await response.json();
      console.log("data ->", result);

      if (result?.products) {
        setProducts(result.products);
        setTotalPages(Number(result.info.total_page || 1)); // ✅ update totalPages
        setCurrentPage(Number(result.info.page || 1)); // ✅ sync current page
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 md:px-10 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[260px]">
          <h2 className="text-2xl font-bold mb-6 uppercase">Filter products</h2>

          {/* Availability Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Availability
            </h3>

            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#A00300]/5 hover:to-[#D44A47]/5 cursor-pointer transition-all duration-300 border border-gray-200 hover:border-[#A00300]/30 shadow-sm hover:shadow-md"
            >
              {/* Hidden Input */}
              <input
                type="checkbox"
                className="sr-only"
                checked={inStockOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInStockOnly(checked);
                  fetchProductsByCategory(null, minPrice, maxPrice, checked); // 👈 keeping same logic
                }}
              />

              {/* Custom Checkbox UI */}
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  inStockOnly
                    ? "bg-gradient-to-br from-[#A00300] to-[#D44A47] border-[#A00300] shadow-lg"
                    : "border-gray-300 bg-white group-hover:border-[#A00300]/50"
                }`}
              >
                <AnimatePresence>
                  {inStockOnly && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label Text */}
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                In Stock Only
              </span>
            </motion.label>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Shop by Category
            </h3>

            <div className="flex flex-col space-y-3">
              {categories.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A00300]/10 to-[#D44A47]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div
                      className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                        isSelected
                          ? "border-[#A00300]/30 shadow-lg shadow-[#A00300]/20"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedCategory(isSelected ? null : cat.id);
                          setSelectedSubcategory(null);
                          fetchProductsByCategory(cat.id, minPrice, maxPrice);
                        }}
                        className={`w-full flex justify-between items-center px-6 py-5 text-left transition-all duration-300 rounded-2xl ${
                          isSelected
                            ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-lg"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              isSelected ? "bg-white" : "bg-[#A00300]"
                            }`}
                          ></div>
                          <span className="text-base font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 transform transition-transform duration-300 ${
                            isSelected ? "rotate-180" : ""
                          }`}
                        />
                      </motion.button>

                      <AnimatePresence>
                        {isSelected && cat.subcategories?.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 pt-2">
                              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
                              <ul className="space-y-2">
                                {cat.subcategories.map((sub, subIndex) => {
                                  const isSubSelected =
                                    selectedSubcategory === sub.id;

                                  return (
                                    <motion.li
                                      key={sub.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        delay: subIndex * 0.05,
                                      }}
                                    >
                                      <motion.button
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                          setSelectedSubcategory(
                                            isSubSelected ? null : sub.id
                                          )
                                        }
                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                          isSubSelected
                                            ? "bg-gradient-to-r from-[#A00300]/10 to-[#D44A47]/10 text-[#A00300] border border-[#A00300]/20"
                                            : "hover:bg-gray-100 text-gray-700 border border-transparent"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                              isSubSelected
                                                ? "bg-[#A00300]"
                                                : "bg-gray-400"
                                            }`}
                                          ></div>
                                          <span>{sub.name}</span>
                                        </div>
                                        {sub.sub_subcategories?.length > 0 && (
                                          <ChevronDown
                                            className={`h-4 w-4 transform transition-transform duration-300 ${
                                              isSubSelected ? "rotate-180" : ""
                                            }`}
                                          />
                                        )}
                                      </motion.button>

                                      <AnimatePresence>
                                        {isSubSelected &&
                                          sub.sub_subcategories?.length > 0 && (
                                            <motion.ul
                                              initial={{
                                                height: 0,
                                                opacity: 0,
                                              }}
                                              animate={{
                                                height: "auto",
                                                opacity: 1,
                                              }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3 }}
                                              className="pl-8 mt-2 space-y-2"
                                            >
                                              {sub.sub_subcategories.map(
                                                (subsub, subsubIndex) => (
                                                  <motion.li
                                                    key={subsub.id}
                                                    initial={{
                                                      opacity: 0,
                                                      x: -10,
                                                    }}
                                                    animate={{
                                                      opacity: 1,
                                                      x: 0,
                                                    }}
                                                    transition={{
                                                      duration: 0.2,
                                                      delay: subsubIndex * 0.03,
                                                    }}
                                                  >
                                                    <motion.button
                                                      whileHover={{
                                                        scale: 1.02,
                                                        x: 2,
                                                      }}
                                                      onClick={() =>
                                                        console.log(
                                                          "Sub-sub selected:",
                                                          subsub.slug
                                                        )
                                                      }
                                                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#A00300] cursor-pointer transition-all duration-300 p-2 rounded-lg hover:bg-gray-50"
                                                    >
                                                      <Circle className="h-2 w-2 fill-current" />
                                                      <span>{subsub.name}</span>
                                                    </motion.button>
                                                  </motion.li>
                                                )
                                              )}
                                            </motion.ul>
                                          )}
                                      </AnimatePresence>
                                    </motion.li>
                                  );
                                })}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Price Range (moved lower) */}
          {/* <div className="mb-6 mt-10">
        <h3 className="text-lg font-semibold mb-3">Price range</h3>

        <div className="flex justify-between text-sm text-gray-600">
          <div>
            Min price <br />
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-20 mt-1 p-1 border border-gray-300 rounded text-center"
            />{" "}
            ₹
          </div>
          <div>
            Max price <br />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-20 mt-1 p-1 border border-gray-300 rounded text-center"
            />{" "}
            ₹
          </div>
        </div>
      </div> */}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Left: Filters + Sort */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Filters</span>
              </div> */}

              {/* Sort Dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 border px-3 py-1.5 rounded-2xl bg-white hover:bg-gray-50 transition"
                >
                  {selectedSort.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-200 shadow-md rounded-md z-50">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortSelect(option)}
                        className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          selectedSort.value === option.value
                            ? "bg-gray-100 font-medium"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Search Bar */}
            {/* <div className="flex-1 max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            </div> */}

            {/* Right: Pagination */}
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              {/* Left Arrow */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() =>
                  visibleStart > 1 && setVisibleStart(visibleStart - 4)
                }
                disabled={visibleStart === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {Array.from(
                  { length: Math.min(4, totalPages - visibleStart + 1) },
                  (_, i) => {
                    const pageNum = visibleStart + i;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.06 }}
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchProductsByCategory(
                            selectedCategory,
                            minPrice,
                            maxPrice,
                            inStockOnly,
                            pageNum
                          );
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                          pageNum === currentPage
                            ? "bg-[#A00300] text-white border-transparent shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  }
                )}
              </div>

              {/* Right Arrow */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() =>
                  visibleStart + 4 <= totalPages &&
                  setVisibleStart(visibleStart + 4)
                }
                disabled={visibleStart + 4 > totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Product Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, i) => {
              const imageUrl = `https://marketplace.yuukke.com/assets/uploads/${product.image}`;
              const actualPrice = product.promo_price || product.price;
              const hasPromo = !!product.promo_price;

              return (
                <Link href={`/products/${product.slug}`} key={product.id || i}>
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-lg p-3 transition cursor-pointer hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-gray-100 rounded mb-3 overflow-hidden">
                      <button
                        onClick={() =>
                          (window.location.href =
                            "https://marketplace.yuukke.com/shop/login/")
                        }
                        className="absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>

                      {product.promo_price !== null &&
                        product.promo_price !== undefined &&
                        product.price > product.promo_price && (
                          <div className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-[2px] rounded z-10">
                            {Math.round(
                              ((product.price - product.promo_price) /
                                product.price) *
                                100
                            )}
                            % OFF
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

                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {product.name}
                    </div>
                    {/* <div className="text-xs text-gray-500">
                      {product.subtitle || "Healthy Snack"}
                    </div> */}

                    <div className="flex gap-2 mt-1 items-center">
                      {hasPromo && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{parseFloat(product.price).toFixed(0)}
                        </span>
                      )}
                      <span className="text-sm text-[#A00300] font-bold">
                        ₹{parseFloat(actualPrice).toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AllProductsPage;
