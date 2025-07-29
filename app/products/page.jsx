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
  ChevronsLeft,
  ChevronsRight,
  Heart,
  IndianRupee,
  PackageCheck,
  Wallet,
  SlidersHorizontal,
  Filter,
  X,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function AllProductsPage() {
  const productCache = useRef({});
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

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort by";

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
    retry = false
  ) => {
    const token = localStorage.getItem("authToken");
    console.time("🛒 fetchProducts");
    setIsLoading(true);
    setHasLoadedOnce(false);

    const isValidId = (val) => val !== null && val !== undefined;

    const cacheKey = JSON.stringify({
      categoryId,
      subcategoryId,
      subSubcategoryId,
      page,
      sortValue,
      inStockValue,
      priceRange,
    });

    // 🧠 1. Check in-memory cache first
    if (productCache.current[cacheKey]) {
      console.log("⚡️Using cached data for:", cacheKey);
      const cached = productCache.current[cacheKey];
      setProducts(cached.products);
      setTotalPages(cached.totalPages);
      setHasLoadedOnce(true);
      setIsLoading(false);
      console.timeEnd("🛒 fetchProducts");
      return;
    }

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
          true // retry = true
        );
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      console.log("✅ Products fetched from API for:", {
        categoryId,
        subcategoryId,
        subSubcategoryId,
      });

      setProducts(data?.products || []);
      setTotalPages(data?.info?.total_page || 1);
      setHasLoadedOnce(true);

      // 💾 2. Save to memory cache
      productCache.current[cacheKey] = {
        products: data?.products || [],
        totalPages: data?.info?.total_page || 1,
      };
    } catch (err) {
      console.error("❌ Fetching products failed:", err);
      setHasLoadedOnce(true);
    } finally {
      setIsLoading(false);
      console.timeEnd("🛒 fetchProducts");
    }
  };

  useEffect(() => {
    if (!isAuthReady || categories.length === 0) return;

    const timeout = setTimeout(() => {
      fetchProductsByCategory(
        selectedCategory,
        selectedSubcategory,
        selectedSubSubcategory,
        currentPage,
        sortBy,
        inStock
      );
    }, 300); // Wait for 300ms of silence before firing

    return () => clearTimeout(timeout);
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

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Stacked on top for mobile */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-80"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-6"
            >
              {/* Clear Filters Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span>Filters</span>

                  {/* Selected Category Badge */}
                  {(selectedCategory ||
                    selectedSubcategory ||
                    selectedSubSubcategory) && (
                    <div className="flex items-center gap-1 ml-2">
                      {selectedCategory && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[10rem]">
                          {getCategoryName(selectedCategory)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Clear Button */}
                {(selectedCategory ||
                  selectedSubcategory ||
                  selectedSubSubcategory ||
                  inStock ||
                  priceRange !== 100000) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                      setSelectedSubSubcategory(null);
                      setInStock(false);
                      setPriceRange(0);
                      fetchProductsByCategory(null, null, null);
                    }}
                    className="text-gray-400 hover:text-black transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-3 border- border-gray-200 b pb-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                  <PackageCheck className="w-4 h-4 text-gray-500" />
                  Availability
                </div>

                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all px-3 py-2 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    In Stock Only
                  </span>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-all ${
                        inStock ? "bg-emerald-500" : ""
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                          inStock ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </motion.label>
              </div>

              {/* Price Filter */}
              <div className="space-y-4 border-b border-gray-200  pb-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  Price Filter
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 font-medium font-mono">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-500" />0
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                      1,00,000
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-black
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                  }}
                  whileTap={{ scale: 0.96 }}
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
                  className="w-full bg-white text-gray-800 py-2 px-3 rounded-md font-medium border border-gray-200 
        hover:bg-gray-50 transition-all text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-1 text-sm">
                    <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                    Apply
                  </span>

                  <span className="flex items-center gap-1 bg-gray-100 text-gray-600 rounded px-2 py-1 text-xs shadow-inner">
                    <IndianRupee className="w-3 h-3" />
                    {priceRange.toLocaleString()}
                  </span>
                </motion.button>
              </div>

              {/* Categories Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-4 sm:p-2"
              >
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-bold text-black uppercase tracking-wide">
                    Categories
                  </h3>
                </div>

                <div className="space-y-3">
                  {loadingCategories
                    ? [...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-5 w-2/3 rounded bg-gray-200 animate-pulse"
                        />
                      ))
                    : categories.map((cat, index) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <motion.div
                            key={cat.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
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
                              className={`flex items-center justify-between w-full px-1 py-1 text-sm font-medium transition-colors duration-300 group ${
                                isSelected
                                  ? "text-black font-semibold"
                                  : "text-gray-600 hover:text-black"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    isSelected
                                      ? "bg-black"
                                      : "bg-gray-400 group-hover:bg-black"
                                  }`}
                                />
                                <span>{cat.name}</span>
                              </div>
                              {cat.subcategories?.length > 0 && (
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isSelected
                                      ? "rotate-180 text-black"
                                      : "text-gray-400"
                                  }`}
                                />
                              )}
                            </motion.button>

                            <AnimatePresence>
                              {isSelected && cat.subcategories?.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="ml-4 mt-1 space-y-3"
                                >
                                  {cat.subcategories.map((sub, subIndex) => {
                                    const isSubSelected =
                                      selectedSubcategory === sub.id;
                                    return (
                                      <motion.button
                                        key={sub.id}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: subIndex * 0.03 }}
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
                                        className={`flex items-center gap-2 w-full text-left text-sm transition-colors duration-200 ${
                                          isSubSelected
                                            ? "text-black font-medium"
                                            : "text-gray-500 hover:text-black"
                                        }`}
                                      >
                                        {isSubSelected ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-300" />
                                        )}
                                        {sub.name}
                                        {sub.sub_subcategories?.length > 0 && (
                                          <ChevronDown
                                            className={`w-3 h-3 ml-auto ${
                                              isSubSelected
                                                ? "rotate-180 text-black"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                </div>
              </motion.div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 sm:mb-8">
              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-52" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full rounded-xl border border-gray-200 bg-white/90 backdrop-blur-md py-2 px-4 pr-10 text-left shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:ring-1 focus:ring-[#A00300]/30 focus:border-[#A00300] text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
                >
                  {selected}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute mt-1 w-full rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-lg z-10 overflow-hidden animate-fade-in">
                    {sortOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsOpen(false);
                        }}
                        className={`cursor-pointer px-4 py-2 text-xs sm:text-sm transition-all duration-150 ${
                          option.value === sortBy
                            ? "bg-[#FFF0EE] text-[#A00300] font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center sm:justify-end gap-1.5 py-3 w-full sm:w-auto">
                {/* First Page */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronsLeft className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Prev */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Pages */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                    const startPage = Math.max(
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
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm"
                        }`}
                      >
                        {pageNumber}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Last Page */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronsRight className="w-4 h-4 text-gray-600" />
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
                        <h3
                          className="text-xs sm:text-sm md:text-base font-semibold line-clamp-2 mb-1 capitalize"
                          style={{ minHeight: "2.75rem" }} // ~2 lines of text height
                        >
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between mt-1">
                          {product.promo_price &&
                          product.end_date &&
                          new Date(product.end_date) > new Date() ? (
                            <div className="flex items-center justify-between w-full">
                              {/* Prices */}
                              <div className="flex items-baseline gap-1.5 md:gap-2">
                                <p className="text-sm md:text-lg font-bold">
                                  ₹{Number(product.promo_price).toFixed(2)}
                                </p>
                                <p className="text-xs md:text-sm text-gray-400 line-through">
                                  ₹{Number(product.price).toFixed(2)}
                                </p>
                              </div>

                              {/* OFF Tag */}
                              <span className="text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg ml-2 whitespace-nowrap">
                                {Math.round(
                                  ((Number(product.price) -
                                    Number(product.promo_price)) /
                                    Number(product.price)) *
                                    100
                                )}
                                % OFF
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm md:text-lg font-bold text-gray-900">
                              ₹{Number(product.price).toFixed(2)}
                            </p>
                          )}
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
