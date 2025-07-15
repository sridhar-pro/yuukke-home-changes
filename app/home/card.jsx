"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WobbleCard } from "@/app/components/ui/wobble-card";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import CategoriesSection from "./CategorieSection";
import Link from "next/link";

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slides = [
  {
    title: "Lip Balm With Rose & Bee Wax",
    description:
      "Reju's Lip Balm hydrates deeply with rose essence and beeswax, offering a soothing, luxurious feel.",
    shortDescription: "Hydrating balm with rose & beeswax.",
    image: "/sale1.webp",
  },
  {
    title: "Amla Powder",
    description:
      "Made from pure, seedless Amla pulp grown in Rajasthan, this powder nourishes and moisturizes skin and hair with essential fatty acids.",
    shortDescription: "Seedless Amla for skin & hair care.",
    image: "/sale2.webp",
  },
  {
    title: "Terracotta By Sachii 3-d Lotus Incense Stick Holder",
    description:
      "A handcrafted terracotta lotus holder made from refined clay—an artistic and functional incense accessory.",
    shortDescription: "Handcrafted terracotta incense holder.",
    image: "/sale3.webp",
  },
  {
    title: "Idli Podi",
    description:
      "Iniya Organics’ Idli Podi blends tradition and nutrition—a perfect, timeless pairing for idlis.",
    shortDescription: "Flavorful, nutritious mix for idlis.",
    image: "/sale4.webp",
  },
  {
    title: "Biji Da Achaar - Paav Bhaji Masala",
    description:
      "Biji Da Achaar’s Pav Bhaji Masala is a rich, aromatic spice mix that transforms your dish with bold, authentic flavors.",
    shortDescription: "Bold masala for your pav bhaji.",
    image: "/sale5.webp",
  },
];

const categories = [
  {
    title: "Home Decor's",
    image: "/cat1.png",
    link: "/category/sneakers",
  },
  {
    title: "Beauty",
    image: "/cat2.png",
    link: "/category/watches",
  },
  {
    title: "Travel",
    image: "/cat5.png",
    link: "/category/grooming",
  },
  {
    title: "Gifts",
    image: "/cat6.png",
    link: "/category/gifts",
  },
];

export function WobbleCardDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === categories.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, []);

  const current = categories[currentIndex];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[index];

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <CategoriesSection />

      <div className="flex flex-col lg:flex-row gap-10 w-full mt-0 md:mt-6 px-4 sm:px-6 md:px-10 lg:px-20">
        {/* Left Card - 65% width on large screens */}
        <div className="w-full lg:w-[65%] relative" translate="no">
          <WobbleCard containerClassName="min-h-[400px] max-h-[600px] md:max-h-[400px] h-full relative overflow-hidden">
            <div className="flex flex-col md:flex-row lg:flex-row justify-between items-center h-full w-full p-4 gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.6 }}
                  className="flex flex-col md:flex-row justify-between items-center w-full gap-6"
                >
                  {/* Text Section */}
                  <div className="flex flex-col justify-center items-start w-full md:w-1/2">
                    <span className="text-sm text-[var(--primary-color)] font-semibold uppercase">
                      New Arrival !
                    </span>
                    <h2 className="mt-2 text-left text-2xl md:text-3xl lg:text-4xl font-bold text-black">
                      {activeSlide.title}
                    </h2>

                    {/* Mobile Description */}
                    <p className="mt-4 text-sm sm:text-base text-neutral-400 text-justify tracking-tight md:hidden">
                      {activeSlide.shortDescription}
                    </p>

                    {/* Desktop / Tablet Description */}
                    <p className="mt-4 text-sm sm:text-base text-neutral-400 text-justify tracking-tight hidden md:block">
                      {activeSlide.description}
                    </p>
                  </div>

                  {/* Image Section */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[340px] rounded-xl object-contain"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Arrows */}
            <div className="absolute bottom-4 left-4 sm:left-6">
              <button
                onClick={handlePrev}
                className="bg-white hover:bg-neutral-100 text-black p-2 rounded-full shadow-lg transition-all duration-300 border border-neutral-200"
              >
                <FiArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-4 right-4 sm:right-6">
              <button
                onClick={handleNext}
                className="bg-white hover:bg-neutral-100 text-black p-2 rounded-full shadow-lg transition-all duration-300 border border-neutral-200"
              >
                <FiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </WobbleCard>
        </div>

        {/* Right Card - 30% width on large screens */}
        <div className="w-full lg:w-[30%]">
          <WobbleCard containerClassName=" h-full p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-left text-lg sm:text-xl font-semibold text-black">
                DISCOVER TOP DEALS ACROSS ALL CATEGORIES!
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-500">
                From fashion to gadgets, home decor to wellness — explore
                handpicked deals every day and enjoy unbeatable prices.
              </p>
            </div>
            <Link href="https://marketplace.yuukke.com/shop/deal">
              <button className="mt-6 mx-auto text-white bg-[var(--primary-color)] cursor-pointer hover:bg-white hover:text-[var(--primary-color)] font-semibold text-sm px-5 py-2 rounded-full transition">
                Browse All Offers
              </button>
            </Link>
          </WobbleCard>
        </div>
      </div>
    </>
  );
}
