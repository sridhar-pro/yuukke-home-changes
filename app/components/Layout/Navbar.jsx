"use client";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { IoMdArrowRoundForward, IoMdArrowRoundBack } from "react-icons/io";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../SearchBar";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingCart } from "lucide-react";
import CartSidebar from "../CartSideBar";
import { useAuth } from "@/app/utils/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

const messages = [
  "Yuukke Anniversary Sale – Enjoy 30% OFF Sitewide • Handcrafted • Eco‑Friendly • Gift‑Ready • Limited Time Only – Shop Now!",
  "Enjoy free shipping on orders above Rs. 700!",
];

export default function Navbar() {
  const { t } = useTranslation();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOdopOpen, setIsOdopOpen] = useState(false);

  const { getValidToken, isAuthReady } = useAuth();

  const [productCategories, setProductCategories] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const toggleCart = () => {
    const storedCart = localStorage.getItem("cart_data");
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      const cartString = JSON.stringify(cartItems);
      const newCartString = JSON.stringify(parsed);

      if (cartString !== newCartString) {
        setCartItems(parsed);
      }
    }

    setIsCartOpen((prev) => !prev);
  };

  const router = useRouter();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setIsProductsOpen(false);
        setIsOdopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

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
          localStorage.removeItem("authToken"); // nuke the junk token
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
          console.warn("⚠️ Got 401. Clearing token and retrying once...");
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
        console.error("🔥 fetchWithAuth failed:", err.message);
        return null;
      }
    };

    const fetchCategories = async () => {
      // Check for cached categories first
      const cached = localStorage.getItem("cachedCategories");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProductCategories(parsed);
          console.log("✅ Loaded categories from cache");
          return; // Skip API call
        } catch (err) {
          console.warn("⚠️ Couldn't parse cached categories. Fetching fresh.");
        }
      }

      // If not cached or bad cache, fetch fresh
      try {
        const data = await fetchWithAuth("/api/homeCategory");
        if (!data) return;

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.yuukke.com/assets/uploads/thumbs/${cat.image}`,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));

        setProductCategories(mapped);
        localStorage.setItem("cachedCategories", JSON.stringify(mapped));
        console.log("🆕 Categories fetched & cached");
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      }
    };

    fetchCategories();
  }, [getValidToken, isAuthReady]);

  // Marquee navigation handlers
  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Marquee */}
      <div
        className="bg-black text-white text-xs md:text-sm lg:text-base h-16 md:h-10 flex items-center justify-center font-serif relative overflow-hidden"
        translate="no"
      >
        <button onClick={handlePrev} className="absolute left-5">
          <IoMdArrowRoundBack className="w-4 h-4 text-white opacity-90" />
        </button>

        <div className="relative w-full max-w-[300px] md:max-w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute text-center px-4"
            >
              {messages[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={handleNext} className="absolute right-5">
          <IoMdArrowRoundForward className="w-4 h-4 text-white opacity-90" />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#f9f9f959] shadow-sm px-0 lg:px-6 py-3 top-0 z-[100] font-serif">
        <div className="px-3 flex justify-around md:justify-between items-center mt-0 md:mt-5 mb-0 md:mb-5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-[125px] h-[50px] lg:w-[170px] lg:h-[45px]">
              <Image
                src="/logo.png"
                alt="MyGiftBox Logo"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-4 text-base font-medium text-neutral-500 mr-[0rem] mt-2 tracking-wider">
            {/* Products Dropdown */}
            <div className="flex items-center space-x-8">
              {/* Products Dropdown - Updated to use group-hover like ODOP */}
              <div className="relative group">
                <Link
                  href="/products"
                  className="group transition-all flex items-center gap-1 py-2 px-1 font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  {t("Products")}
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div className="absolute left-0 top-full mt-1 w-[42rem] bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
                  {productCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {productCategories.map((category) => (
                        <Link
                          key={category.id || category.slug}
                          href={{
                            pathname: "/products",
                            query: { category: category.slug },
                          }}
                          className="group flex flex-col items-center hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-black text-center">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center py-8 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-100"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-200"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* ODOP Dropdown (unchanged, works well) */}
              <div className="relative group">
                <Link
                  href="#"
                  className="transition-all flex items-center gap-1 py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  {t("ODOP")}
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out px-4 py-3 w-56">
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {t("Uttar Pradesh")}
                  </a>
                  {/* <a
                    href="/odop-registration"
                    onClick={(e) => {
                      e.preventDefault(); // Stop default nav
                      document.cookie = "googtrans=/en/hi; path=/;";
                      // Optional: clear the 'reset-reloaded' flag so we don't wipe this translation
                      sessionStorage.removeItem("reset-reloaded");
                      // Now trigger full reload to that page
                      window.location.href = "/odop-registration";
                    }}
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    ODOP Registration
                  </a> */}
                  <Link
                    href="/odop-registration"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    {t("ODOP Registration")}
                  </Link>
                </div>
              </div>

              {/* Offers Link */}
              <Link
                href="https://marketplace.yuukke.com/shop/deal"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Offers")}
              </Link>

              {/* Gifts Link */}
              <Link
                href="https://gift.yuukke.com/"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Gifts")}
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 ml-3 md:ml-0">
            <div className="hidden md:flex space-x-6">
              <SearchBar />

              {/* Profile/Login */}
              <button
                aria-label="Profile"
                className="p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() =>
                  (window.location.href =
                    "https://marketplace.yuukke.com/shop/login")
                }
              >
                <User className="w-5 h-5 text-black cursor-pointer" />
              </button>

              {/* 🌐 Language Switcher (Lucide Globe) */}
              <LanguageSwitcher />

              {/* Wishlist */}
              <a
                href="https://marketplace.yuukke.com/shop/wishlist"
                aria-label="Favorites"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Heart className="w-5 h-5 text-black" />
              </a>

              {/* Cart */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-5 h-5 text-black cursor-pointer" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )}
              </button>

              <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 px-2 py-1.5">
              {/* ✅ Search bar takes flexible width */}
              <div className="flex-1">
                <SearchBar />
              </div>

              {/* ✅ Language Switcher */}
              <div className="flex-shrink-0">
                <LanguageSwitcher />
              </div>

              {/* ✅ Cart Icon */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-4 h-4 text-black" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )}
              </button>

              {/* ✅ Cart Sidebar */}
              {isCartOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
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

              {/* ✅ Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden mt-4 px-4 space-y-2 text-lg text-gray-700"
          >
            <div className="block py-1">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full text-left hover:text-black transition"
              >
                {t("Products")}
                {isProductsOpen ? "▲" : "▼"}
              </button>
              {isProductsOpen && (
                <div className="ml-4 mt-2 space-y-0 text-gray-600">
                  {productCategories.map((category) => (
                    <a
                      key={category.slug}
                      href={`https://marketplace.yuukke.com/category/${category.slug}`}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="block py-1">
              <button
                onClick={() => setIsOdopOpen(!isOdopOpen)}
                className="w-full text-left hover:text-black transition"
              >
                {t("ODOP")}
                {isOdopOpen ? "▲" : "▼"}
              </button>
              {isOdopOpen && (
                <div className="ml-4 mt-2 space-y-1 text-gray-600">
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                  >
                    {t("ODOP Registration")}
                  </a>
                  {/* <a
                    href="/odop-registration"
                    onClick={(e) => {
                      e.preventDefault(); // Stop default nav
                      document.cookie = "googtrans=/en/hi; path=/;";
                      // Optional: clear the 'reset-reloaded' flag so we don't wipe this translation
                      sessionStorage.removeItem("reset-reloaded");
                      // Now trigger full reload to that page
                      window.location.href = "/odop-registration";
                    }}
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-md rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    ODOP Registration
                  </a> */}
                  <Link
                    href="/odop-registration"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-md rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    {t("Uttar Pradesh")}
                  </Link>
                </div>
              )}
            </div>

            <a
              href="https://marketplace.yuukke.com/shop/deal"
              className="block py-1 hover:text-black transition"
            >
              {t("Offers")}
            </a>

            <Link
              href="https://gift.yuukke.com/"
              className="block py-1 hover:text-black transition"
            >
              {t("Gifts")}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
