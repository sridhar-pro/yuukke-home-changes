"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "../utils/variants";
import {
  ChevronDown,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const categorySlugFromQuery = searchParams.get("category");

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [products, setProducts] = useState([]);
  const hasFetched = useRef(false);
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [inStock, setInStock] = useState(false);
  const [priceRange, setPriceRange] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);

  const [sortBy, setSortBy] = useState("1nto"); // default to "Featured"

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  const sortOptions = [
    { value: "1nto", label: "Newest" },
    { value: "1f", label: "Featured" },
    { value: "1bs", label: "Best Seller" },
    { value: "1plth", label: "Price: Low to High" },
    { value: "1phtl", label: "Price: High to Low" },
  ];

  useEffect(() => {
    if (!categorySlugFromQuery || categories.length === 0) return;

    const matchedCategory = categories.find(
      (cat) => cat.slug === categorySlugFromQuery
    );

    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
      // reset sub/subsub categories
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
    }
  }, [categorySlugFromQuery, categories]);

  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        const token = await getValidToken();
        console.log("🕵️‍♂️ Retrieved token:", token);

        if (token && typeof token === "string" && token.length > 10) {
          return token;
        }

        if (attempt === 5) {
          localStorage.removeItem("authToken");
        }

        await wait(delay);
        attempt++;
      }

      throw new Error("❌ Auth token unavailable after multiple retries.");
    };

    const fetchWithAuth = async (url, retry = false) => {
      try {
        const token = await getTokenWithRetry();

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 && !retry) {
          localStorage.removeItem("authToken");
          return await fetchWithAuth(url, true);
        }

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return null;
        }

        return await res.json();
      } catch (err) {
        console.error("🚨 fetchWithAuth error:", err.message);
        return null;
      }
    };

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchWithAuth("/api/homeCategory");

        if (!data) {
          console.warn("⚠️ No category data received.");
          return;
        }

        console.log("✅ Categories fetched:", data);
        setCategories(data);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [getValidToken, isAuthReady]);

  const fetchProductsByCategory = async (
    categoryId,
    subcategoryId,
    subSubcategoryId,
    page = 1,
    sortValue = "1nto",
    inStockValue = false,
    priceRange = [1, 100000],
    retry = false // 🔁 Track if this is a retry
  ) => {
    const token = localStorage.getItem("authToken");
    console.time("🛒 fetchProducts");
    setIsLoading(true);
    setHasLoadedOnce(false); // optional: reset if needed

    const isValidId = (val) => val !== null && val !== undefined;

    const body = {
      filters: {
        gifts_products: "",
        query: "",
        category: isValidId(categoryId) ? { id: categoryId } : {},
        subcategory: isValidId(subcategoryId) ? { id: subcategoryId } : {},
        sub_subcategory: isValidId(subSubcategoryId)
          ? { id: subSubcategoryId }
          : {},
        brand: "",
        sorting: "name-asc",
        min_price: `${priceRange[0]}`,
        max_price: `${priceRange[1]}`,
        in_stock: inStockValue ? "1" : "0",
        page: `${page}`,
        sort_by_v: sortValue,
        limit: 24,
        offset: `${(page - 1) * 24}`,
      },
    };

    try {
      const res = await fetch("/api/getProducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401 && !retry) {
        console.warn("🛑 Unauthorized! Retrying once after clearing token...");
        localStorage.removeItem("authToken");

        return await fetchProductsByCategory(
          categoryId,
          subcategoryId,
          subSubcategoryId,
          page,
          sortValue,
          inStockValue,
          priceRange,
          true // 🔁 Retry now
        );
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      console.log("✅ Products fetched for:", {
        categoryId,
        subcategoryId,
        subSubcategoryId,
      });
      console.log("📦 Products response:", data);

      setProducts(data?.products || []);
      setTotalPages(data?.info?.total_page || 1);
      setHasLoadedOnce(true); // ✅ Set true only after success
    } catch (err) {
      console.error("❌ Fetching products failed:", err);
      setHasLoadedOnce(true); // ✅ Even on error, set true to prevent blink
    } finally {
      setIsLoading(false);
      console.timeEnd("🛒 fetchProducts");
    }
  };

  useEffect(() => {
    if (!isAuthReady || categories.length === 0) return;

    // 👉 If category is selected (via slug or user click), fetch filtered
    if (selectedCategory !== null) {
      fetchProductsByCategory(
        selectedCategory,
        selectedSubcategory,
        selectedSubSubcategory,
        currentPage,
        sortBy,
        inStock
      );
    } else {
      // 👉 Else fetch all products without filters
      fetchProductsByCategory(null, null, null, currentPage, sortBy, inStock);
    }
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    currentPage,
    sortBy,
    inStock,
    isAuthReady,
    categories,
  ]);

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Stacked on top for mobile */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-80 space-y-6"
          >
            {/* Availability Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/60 shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-black uppercase">
                  Availability
                </h3>
              </div>

              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${
                      inStock
                        ? "bg-black border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {inStock && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-sm" />
                      </motion.div>
                    )}
                  </div>
                </div>
                <span className="font-medium text-gray-700">In Stock Only</span>
              </motion.label>
            </motion.div>

            {/* Price Range Section */}
            {/* Price Range Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              {/* Header */}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Price Filter
                </h3>
              </div>

              <div className="space-y-5">
                {/* Slider with min/max labels */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                    <span>₹0</span>
                    <span>₹10,000</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-black
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Combined button with price */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{
                    scale: 0.98,
                    boxShadow: "none",
                  }}
                  onClick={() =>
                    fetchProductsByCategory(
                      selectedCategory,
                      selectedSubcategory,
                      selectedSubSubcategory,
                      currentPage,
                      sortBy,
                      inStock,
                      [0, priceRange]
                    )
                  }
                  className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium 
        hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Apply Filter
                  </span>
                  <span className="flex items-center bg-gray-800 rounded-md px-2 py-1 text-sm">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    {priceRange.toLocaleString()}
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Categories Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/60 shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-black uppercase">
                  Categories
                </h3>
              </div>

              <div className="space-y-3">
                {loadingCategories
                  ? [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl bg-gray-100 animate-pulse border border-gray-200"
                      />
                    ))
                  : categories.map((cat, index) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <motion.div
                          key={cat.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="group relative"
                        >
                          <div
                            className={`relative bg-gray-50 rounded-xl border overflow-hidden transition-all duration-300 ${
                              isSelected
                                ? "border-black/30 shadow-lg shadow-black/10 ring-1 ring-black/20"
                                : "border-gray-200/60 hover:shadow-md hover:border-gray-300/60"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selectedBg"
                                className="absolute inset-0 bg-black/5"
                                transition={{
                                  type: "spring",
                                  bounce: 0.2,
                                  duration: 0.6,
                                }}
                              />
                            )}

                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                const isCatSelected =
                                  selectedCategory === cat.id;
                                setSelectedCategory(
                                  isCatSelected ? null : cat.id
                                );
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                fetchProductsByCategory(
                                  isCatSelected ? null : cat.id,
                                  null,
                                  null
                                );
                              }}
                              className={`relative w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                                isSelected
                                  ? "text-black"
                                  : "text-gray-700 hover:text-black"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <motion.div
                                  animate={{
                                    scale: isSelected ? 1.2 : 1,
                                    rotate: isSelected ? 360 : 0,
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className={`w-2 h-2 rounded-full ${
                                    isSelected
                                      ? "bg-black"
                                      : "bg-gray-400 group-hover:bg-black"
                                  }`}
                                />
                                <span>{cat.name}</span>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1 }}
                                  ></motion.div>
                                )}
                              </div>
                              <motion.div
                                animate={{ rotate: isSelected ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown
                                  className={`w-4 h-4 ${
                                    isSelected ? "text-black" : "text-gray-400"
                                  }`}
                                />
                              </motion.div>
                            </motion.button>

                            <AnimatePresence>
                              {isSelected && cat.subcategories?.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                  }}
                                  className="px-4 pb-3"
                                >
                                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3" />
                                  <ul className="space-y-1">
                                    {cat.subcategories.map((sub, subIndex) => {
                                      const isSubSelected =
                                        selectedSubcategory === sub.id;
                                      return (
                                        <motion.li
                                          key={sub.id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            delay: subIndex * 0.05,
                                          }}
                                          className="relative"
                                        >
                                          <motion.button
                                            whileHover={{ x: 4, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => {
                                              const isSubSelected =
                                                selectedSubcategory === sub.id;
                                              setSelectedSubcategory(
                                                isSubSelected ? null : sub.id
                                              );
                                              setSelectedSubSubcategory(null);
                                              fetchProductsByCategory(
                                                selectedCategory,
                                                isSubSelected ? null : sub.id,
                                                null
                                              );
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                                              isSubSelected
                                                ? "bg-black/10 text-black border border-black/20"
                                                : "text-gray-600 hover:bg-white hover:text-black"
                                            }`}
                                          >
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className={`w-1.5 h-1.5 rounded-full ${
                                                    isSubSelected
                                                      ? "bg-black"
                                                      : "bg-gray-400"
                                                  }`}
                                                />
                                                <span>{sub.name}</span>
                                              </div>
                                              {sub.sub_subcategories?.length >
                                                0 && (
                                                <ChevronDown
                                                  className={`w-3 h-3 transition-transform ${
                                                    isSubSelected
                                                      ? "rotate-180 text-black"
                                                      : "text-gray-400"
                                                  }`}
                                                />
                                              )}
                                            </div>
                                          </motion.button>

                                          <AnimatePresence>
                                            {isSubSelected &&
                                              sub.sub_subcategories?.length >
                                                0 && (
                                                <motion.ul
                                                  initial={{
                                                    opacity: 0,
                                                    scale: 0.95,
                                                    y: -5,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: 0,
                                                  }}
                                                  exit={{
                                                    opacity: 0,
                                                    scale: 0.95,
                                                    y: -5,
                                                  }}
                                                  transition={{ duration: 0.2 }}
                                                  className="absolute left-full top-0 ml-2 w-48 bg-white shadow-lg border border-gray-200 rounded-lg z-10"
                                                >
                                                  {sub.sub_subcategories.map(
                                                    (ssub) => (
                                                      <li key={ssub.id}>
                                                        <button
                                                          onClick={() =>
                                                            console.log(
                                                              "Sub-sub selected:",
                                                              ssub.slug
                                                            )
                                                          }
                                                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-black/5"
                                                        >
                                                          • {ssub.name}
                                                        </button>
                                                      </li>
                                                    )
                                                  )}
                                                </motion.ul>
                                              )}
                                          </AnimatePresence>
                                        </motion.li>
                                      );
                                    })}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
              </div>
            </motion.div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-8 py-2 sm:py-3 pr-8 focus:ring-2 focus:ring-[#A00300]/20 focus:border-[#A00300] transition-all font-medium text-sm sm:text-base"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center sm:justify-end gap-2 py-2 w-full sm:w-auto">
                {/* Prev Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                {/* Dynamic Page Numbers - max 4 at a time */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                    let startPage = Math.max(
                      1,
                      Math.min(currentPage - 1, totalPages - 3)
                    );
                    const pageNumber = startPage + i;

                    return (
                      <motion.button
                        key={pageNumber}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-md"
                            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              // 🧼 skeleton loader
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl bg-white overflow-hidden"
                  >
                    <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 bg-gray-200 animate-pulse"></div>
                    <div className="p-5">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-1/3 bg-gray-200 rounded mt-3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              // ✅ show actual product grid
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="group rounded-xl sm:rounded-3xl bg-white transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative">
                        <div className="relative w-full h-32 sm:h-40 md:h-56 rounded-lg sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 md:mb-4 group">
                          <Image
                            src={getImageSrc(product.image)}
                            alt={product.name || "Image not found!"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </div>

                        {/* Wishlist Button */}
                        <div className="absolute top-3 right-3 flex gap-2 z-10">
                          <button
                            className="p-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:bg-white transition-all"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-5">
                        <h3 className="text-xs sm:text-sm md:text-base font-semibold line-clamp-2 mb-1 capitalize">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1 mt-1">
                            {product.promo_price &&
                            product.end_date &&
                            new Date(product.end_date) > new Date() ? (
                              <>
                                <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                                  <p className="text-sm md:text-lg font-bold">
                                    ₹{Number(product.promo_price).toFixed(2)}
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-400 line-through">
                                    ₹{Number(product.price).toFixed(2)}
                                  </p>
                                </div>

                                <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                                  {Math.round(
                                    ((Number(product.price) -
                                      Number(product.promo_price)) /
                                      Number(product.price)) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </>
                            ) : (
                              <p className="text-sm md:text-lg font-bold text-gray-900">
                                ₹{Number(product.price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : hasLoadedOnce ? (
              // ❌ Show "No products" only AFTER first fetch
              <div className="text-center text-gray-500 p-6 sm:p-10">
                No products found!
              </div>
            ) : null}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
