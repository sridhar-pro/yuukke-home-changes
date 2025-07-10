"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Package, Percent } from "lucide-react";
import axios from "axios";

const MobileBottomBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No token found");
      return;
    }

    try {
      const res = await axios.post(
        "/api/getProducts",
        {
          filters: {
            page: 1,
            query: searchTerm,
            limit: 10,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.products) {
        setResults(res.data.products);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsSearchOpen(false);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Search Bar Dropdown */}
      {isSearchOpen && (
        <div
          className="fixed inset-x-4 bottom-16 z-50 md:max-w-2xl mx-auto"
          ref={containerRef}
        >
          {/* Dropdown Results ABOVE the search bar */}
          {showDropdown && results.length > 0 && (
            <div className="mb-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto backdrop-blur-sm animate-fade-in-fast">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    router.push(`/products/${product.slug}`);
                    setIsSearchOpen(false);
                    setShowDropdown(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 border-b last:border-none"
                >
                  <img
                    src={`https://marketplace.yuukke.com/assets/uploads/${product.image}`}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-xl shadow-sm"
                  />
                  <div className="flex flex-col justify-center overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {product.details || "Perfect for every occasion!"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Input Bar */}
          <div className="flex items-center bg-white border border-gray-200 shadow-lg rounded-full px-4 py-3 focus-within:ring-2 ring-gray-300 transition-all duration-200">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              autoFocus
              placeholder="Search for the perfect gift..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsSearchOpen(false);
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-red-500 transition duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-md border-t md:hidden">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => router.push("/products")}
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <Package className="w-6 h-6 mb-1 " strokeWidth={2.5} />
            Products
          </button>
          <button
            onClick={() => router.push("/offers")}
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <Percent className="w-6 h-6 mb-1 " strokeWidth={2.5} />
            Offers
          </button>
          <button
            onClick={() => router.push("/login")}
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <User className="w-6 h-6 mb-1 " strokeWidth={2.5} />
            Login
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <Search className="w-6 h-6 mb-1 " strokeWidth={2.5} />
            Search
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileBottomBar;
