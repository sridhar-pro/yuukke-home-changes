"use client";
import { ChevronDown, Menu, X, MapPin, Clipboard } from "lucide-react";
import { IoMdArrowRoundForward, IoMdArrowRoundBack } from "react-icons/io";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../SearchBar";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingCart } from "lucide-react";
import CartSidebar from "../CartSideBar";
import { useAuth } from "@/app/utils/AuthContext";

const messages = [
  "Yuukke Anniversary Sale – Enjoy 30% OFF Sitewide • Handcrafted • Eco‑Friendly • Gift‑Ready • Limited Time Only – Shop Now!",
  "Enjoy free shipping on orders above Rs. 700!",
];

export default function Navbar() {
  const [language, setLanguage] = useState("EN");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const languages = ["EN", "GU", "HI", "TA", "TE"];

  const [productsOpen, setProductsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!isAuthReady) return;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        const token = await getValidToken();
        if (token) return token;

        console.warn(`⏳ Token attempt ${attempt + 1} failed. Retrying...`);
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
      <div className="bg-black text-white text-xs md:text-sm lg:text-base h-14 md:h-10 flex items-center justify-center font-serif relative overflow-hidden">
        <button onClick={handlePrev} className="absolute left-5 md:left-48">
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

        <button onClick={handleNext} className="absolute right-5 md:right-48">
          <IoMdArrowRoundForward className="w-4 h-4 text-white opacity-90" />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#f9f9f959] shadow-sm px-6 py-3 top-0 z-[100] font-serif">
        <div className="px-3 flex justify-between items-center mt-0 md:mt-5 mb-0 md:mb-5">
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
                  href="#"
                  className="group transition-all flex items-center gap-1 py-2 px-1 font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  Products
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div className="absolute left-0 top-full mt-1 w-[42rem] bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
                  {productCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {productCategories.map((category) => (
                        <a
                          key={category.id || category.slug}
                          href={`https://marketplace.yuukke.com/category/${category.slug}`}
                          className="group flex flex-col items-center hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-black text-center">
                            {category.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No categories available
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
                  ODOP
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out px-4 py-3 w-56">
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    Uttar Pradesh
                  </a>
                  <a
                    href="https://marketplace.yuukke.com/odop_register"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    ODOP Registration
                  </a>
                </div>
              </div>

              {/* Offers Link */}
              <Link
                href="https://marketplace.yuukke.com/shop/deal"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                Offers
              </Link>

              {/* Gifts Link */}
              <Link
                href="https://gift.yuukke.com/"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                Gifts
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3 ml-3 md:ml-0">
            <div className="hidden md:flex space-x-6">
              <SearchBar />
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

              <a
                href="https://marketplace.yuukke.com/shop/wishlist"
                aria-label="Favorites"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Heart className="w-5 h-5 text-black " />
              </a>

              {/* <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ShoppingCart className="w-5 h-5 text-black cursor-pointer" />
              </button> */}

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

              {/* Overlay and CartSidebar - appears when cart is open */}
              <>
                {/* Always mounted */}
                <CartSidebar
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              </>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4 px-2 py-1">
              <SearchBar />
              <button
                aria-label="Profile"
                onClick={() =>
                  (window.location.href =
                    "https://marketplace.yuukke.com/shop/login")
                }
              >
                <User className="w-5 h-5 text-black" />
              </button>
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

              {/* Overlay and CartSidebar - appears when cart is open */}
              {isCartOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsCartOpen(false)}
                  />
                  <CartSidebar
                    isOpen={isCartOpen} // pass state here
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                  />
                </>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 px-4 space-y-2 text-lg text-gray-700">
            <div className="block py-1">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full text-left hover:text-black transition"
              >
                Products {isProductsOpen ? "▲" : "▼"}
              </button>
              {isProductsOpen && (
                <div className="ml-4 mt-2 space-y-0 text-gray-600">
                  {productCategories.map((category) => (
                    <a
                      key={category.id}
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
                ODOP {isOdopOpen ? "▲" : "▼"}
              </button>
              {isOdopOpen && (
                <div className="ml-4 mt-2 space-y-1 text-gray-600">
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                  >
                    Uttar Pradesh
                  </a>

                  <a
                    href="https://marketplace.yuukke.com/odop_register"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                  >
                    ODOP Registration
                  </a>
                </div>
              )}
            </div>

            <a
              href={`${
                process.env.NEXT_PUBLIC_BASE_URL
              }/shop/deal?returnUrl=${encodeURIComponent(origin + "/offers")}`}
              className="block py-1 hover:text-black transition"
            >
              Offers
            </a>

            <Link href="/" className="block py-1 hover:text-black transition">
              Gifts
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
