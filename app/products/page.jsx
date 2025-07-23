"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Tag,
  Sparkles,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const hasFetched = useRef(false);
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [inStock, setInStock] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);

  const [sortBy, setSortBy] = useState("1f"); // default to "Featured"

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        const token = await getValidToken();

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
      try {
        const data = await fetchWithAuth("/api/homeCategory");

        if (!data) {
          console.warn("⚠️ No category data received.");
          return;
        }

        console.log("✅ Categories fetched:", data); // <- YOUR GLORIOUS CONSOLE LOG
        setCategories(data);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      }
    };

    fetchCategories();
  }, [getValidToken, isAuthReady]);

  const sortOptions = [
    { value: "1f", label: "Featured" },
    { value: "1bs", label: "Best Seller" },
    { value: "1nto", label: "Newest" },
    { value: "1plth", label: "Price: Low to High" },
    { value: "1phtl", label: "Price: High to Low" },
  ];

  const fetchProductsByCategory = async (
    categoryId,
    subcategoryId,
    subSubcategoryId,
    page = 1 // <- ✨ Accept page as a param
  ) => {
    const token = localStorage.getItem("authToken");

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
        min_price: "1",
        max_price: "",
        in_stock: "1",
        page: `${page}`, // <- ✨ Use the dynamic page here
        sort_by_v: "1plth",
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

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      console.log("✅ Products fetched for:", {
        categoryId,
        subcategoryId,
        subSubcategoryId,
      });
      console.log("📦 Products response:", data);

      setProducts(data?.products || []);
    } catch (err) {
      console.error("❌ Fetching products failed:", err);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchProductsByCategory(null); // load all products by default
  }, []);

  return (
    <div className="min-h-screen  ">
      <div className="px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-80 space-y-6"
          >
            {/* Availability Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6"
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

            {/* Categories Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-black uppercase">
                  Categories
                </h3>
              </div>

              <div className="space-y-3">
                {categories.map((cat, index) => {
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
                            const isCatSelected = selectedCategory === cat.id;
                            setSelectedCategory(isCatSelected ? null : cat.id);
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
                              transition={{ duration: 0.4, ease: "easeInOut" }}
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
                                      transition={{ delay: subIndex * 0.05 }}
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
                                          sub.sub_subcategories?.length > 0 && (
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

            {/* Price Range Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-black italic uppercase">
                  Price Range
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          Number.parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          Number.parseInt(e.target.value) || 1000,
                        ])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Apply Filter
                </motion.button>
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
            <div className="flex items-center justify-between mb-8">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#A00300]/20 focus:border-[#A00300] transition-all font-medium"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div> */}
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            {/* Products Grid */}

            {products.length > 0 ? (
              <motion.div
                layout
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product, index) => (
                  <Link href={`/products/${product.slug}`} key={product.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group rounded-3xl bg-white transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      <div className="relative">
                        <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
                          <Image
                            src={getImageSrc(product.image)}
                            alt={product.name || "Image not found!"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </div>

                        <div className="absolute top-3 right-3 flex gap-2 z-10">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:bg-white transition-all"
                            onClick={(e) => e.preventDefault()} // Prevents link navigation on heart click
                          >
                            <Heart className="w-4 h-4 text-gray-700" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xs md:text-base font-semibold line-clamp-2 mb-0.5 md:mb-1 capitalize">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1 mt-1">
                            {product.promo_price &&
                            product.end_date &&
                            new Date(product.end_date) > new Date() ? (
                              <>
                                <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                                  <p className="text-sm md:text-lg font-bold ">
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
                              <p
                                className={`text-sm md:text-lg font-bold ${
                                  isOutOfStock
                                    ? "text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                ₹{Number(product.price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 p-10">
                No products found!
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
