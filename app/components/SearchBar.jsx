"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, X, SearchIcon } from "lucide-react"; // Premium-feel icons

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("authToken"); // or useAuth()?.token if using context

    if (!token) {
      console.warn("No auth token found. Aborting search.");
      return;
    }

    try {
      const response = await axios.post(
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

      if (response.data?.products) {
        setResults(response.data.products);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400); // debounce
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsActive(false);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-50">
      {!isActive ? (
        <button
          onClick={() => setIsActive(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Open Search"
        >
          <Search className="w-5 md:w-5 h-5 md:h-5 text-black cursor-pointer" />
        </button>
      ) : (
        <div className="flex items-center border rounded-full px-4 py-2 bg-white shadow-md transition-all w-[200px] md:w-[400px] max-w-full">
          <Search className="w-5 h-5 text-gray-400 mr-2" />

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            autoFocus
            placeholder="Search gifts..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsActive(false);
              setShowDropdown(false);
            }}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            aria-label="Close Search"
          >
            <X className="hidden md:flex w-5 h-5 z-50" />
          </button>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div
          className="absolute w-[230px] md:w-[400px] mt-2 bg-white border rounded-xl shadow-2xl max-h-80 overflow-y-auto p-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="w-full">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.slug}`)}
                className="flex gap-3 md:gap-6 items-center px-0 py-3 p-0 md:p-5 bg-white rounded-xl transition-all cursor-pointer border-b border-gray-100 hover:border-gray-300"
              >
                <img
                  src={`https://marketplace.yuukke.com/assets/uploads/${product.image}`}
                  alt={product.name}
                  className="w-12 h-12 md:w-20 md:h-20 rounded-lg object-cover shadow-sm flex-shrink-0"
                />

                <div className="flex flex-col justify-center flex-1">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-xs md:text-base text-gray-500 mt-1 line-clamp-2">
                    {product.details || "A perfect gift for any occasion."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
