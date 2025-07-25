"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FlipWords } from "../components/ui/flip-words";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../utils/AuthContext";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const controls = useAnimation();
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const hasFetched = useRef(false); // Add this ref

  const words = ["Skincare", "Stationery", "Gift Sets", "Food", "Home Decor's"];

  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || hasFetched.current) return;
    hasFetched.current = true;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        const token = await getValidToken();

        if (token && typeof token === "string" && token.length > 10) {
          return token;
        }

        if (attempt === 5) {
          localStorage.removeItem("authToken"); // force refresh if token exists but is trash
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
          console.warn("⚠️ 401 Unauthorized. Retrying after clearing token...");
          localStorage.removeItem("authToken");
          return await fetchWithAuth(url, true);
        }

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP error ${res.status}:`, errText);
          return null;
        }

        return await res.json();
      } catch (err) {
        console.error("🔥 fetchWithAuth failed:", err.message);
        return null;
      }
    };

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const data = await fetchWithAuth("/api/homeCategory");
        if (!data) return;

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.yuukke.com/assets/uploads/thumbs/${cat.image}`,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));

        setCategories(mapped);
      } catch (err) {
        console.error("🚨 Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [getValidToken, isAuthReady]);

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-20 py-16 relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 max-w-[100rem] mx-auto">
        <div className="mb-6 sm:mb-0 relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--primary-color)]" />
            <span className="text-xs font-medium text-[var(--primary-color)] tracking-widest uppercase">
              Shop by Category
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-medium text-neutral-800">
            Explore our{" "}
            <span className="italic" translate="no">
              <FlipWords words={words} />
            </span>
          </div>
          <div className="absolute -bottom-4 left-0 h-0.5 w-24 bg-gradient-to-r from-[var(--primary-color)] to-transparent"></div>
        </div>

        <Link
          href="https://marketplace.yuukke.com/shop/products"
          className="flex items-center gap-2 text-sm font-medium group relative overflow-hidden px-1"
        >
          <span className="relative z-10">Discover All Categories</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--primary-color)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        </Link>
      </div>

      {/* Slider */}
      <div className="relative overflow-hidden max-w-[95rem] mx-auto scrollbar-hide h-[calc(100%-1px)]">
        {/* Scrolling Categories */}
        <div
          ref={sliderRef}
          className="flex gap-x-8 sm:gap-x-10 items-center px-2 cursor-grab active:cursor-grabbing overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide snap-x snap-mandatory"
          style={{ userSelect: isDragging ? "none" : "auto" }}
        >
          {loading &&
            Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[110px] sm:w-[130px] md:w-[160px] flex flex-col items-center gap-3"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 p-1 shadow-md">
                  <div className="w-full h-full rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-300 shimmer" />
                  </div>
                </div>

                <div className="w-16 sm:w-20 h-3 rounded-full bg-gray-200 shimmer" />
              </div>
            ))}

          {!loading &&
            categories.map((category, index) => (
              <motion.div
                key={index + category.slug}
                className="group flex-shrink-0 snap-start w-[110px] sm:w-[130px] md:w-[160px] flex flex-col items-center"
                custom={index}
                variants={itemVariants}
                initial="initial"
                animate="animate"
              >
                <Link
                  href={`https://marketplace.yuukke.com/category/${category.slug}`}
                  aria-label={`Explore ${category.name} category`}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative w-28 h-28 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 p-1 shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                    <div className="w-full h-full rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center p-2">
                      <motion.div
                        className="relative w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24"
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Image
                          src={category.image}
                          alt={`Shop ${category.name}`}
                          fill
                          className="object-contain drop-shadow-md"
                          quality={100}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </motion.div>
                    </div>
                  </div>
                  <div className="h-[3.5rem] sm:h-[3.75rem] flex items-center justify-center text-center">
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 relative inline-block leading-snug">
                      {category.name}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--primary-color)] group-hover:w-full transition-all duration-300"></span>
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
