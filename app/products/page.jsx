"use client";

import React from "react";
import { Heart, SlidersHorizontal, ChevronDown, Search } from "lucide-react";

const AllProductsPage = () => {
  const products = [...Array(8)];
  const totalPages = 5;
  const currentPage = 1; // In real use-case, this would be state-managed

  return (
    <div className="min-h-screen bg-white px-4 md:px-10 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[260px]">
          <h2 className="text-2xl font-bold mb-6">Filter products</h2>

          {/* Availability Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="accent-[#A00300]" />
              In Stock Only
            </label>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {[
                "Fashion",
                "Festive Decor & Gifting",
                "Gourmet Food",
                "Groceries",
                "Health & Personal Care",
                "Home & Kitchen",
                "Home Decor",
                "Home Furnishing",
                "Jewellery",
                "Stationery",
                "Toys & Games",
                "Travel Accessories",
                "Vegan Foods",
                "Winter Wear",
              ].map((cat, i) => (
                <button
                  key={i}
                  className={`px-3 py-1.5 rounded-md text-sm text-left ${
                    cat === "Fashion"
                      ? "bg-[#A00300] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Price range</h3>
            <input type="range" className="w-full mb-4 accent-[#A00300]" />
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                Min price <br />
                <input
                  type="number"
                  defaultValue={100}
                  className="w-20 mt-1 p-1 border border-gray-300 rounded text-center"
                />{" "}
                ₹
              </div>
              <div>
                Max price <br />
                <input
                  type="number"
                  defaultValue={500}
                  className="w-20 mt-1 p-1 border border-gray-300 rounded text-center"
                />{" "}
                ₹
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Left: Filters + Sort */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Filters</span>
              </div>

              {/* Sort Dropdown moved left */}
              <div className="relative">
                <button className="flex items-center gap-2 text-sm text-gray-700 border px-3 py-1.5 rounded-2xl">
                  Most popular
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            </div>

            {/* Right: Pagination */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    i + 1 === currentPage
                      ? "bg-[#A00300] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 transition">
                <div className="relative aspect-square bg-gray-100 rounded mb-3 overflow-hidden">
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  {i % 3 === 1 && (
                    <div className="absolute top-2 left-2 bg-[#A00300] text-white text-xs px-2 py-0.5 rounded">
                      JUST IN!
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {["Air Force 1", "Lebron Black", "SB Low Brown"][i % 3]}
                </div>
                <div className="text-xs text-gray-500">Men's shoes</div>
                <div className="flex gap-2 mt-1 items-center">
                  <span className="text-sm text-gray-400 line-through">
                    ₹250
                  </span>
                  <span className="text-sm text-[#A00300] font-bold">₹199</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllProductsPage;
