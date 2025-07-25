"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImagesSliderDemo() {
  const [desktopImages, setDesktopImages] = useState([]);
  const [mobileImages, setMobileImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // default immediately
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const baseUrl = "https://marketplace.yuukke.com/assets/uploads/";

  // Immediately fetch images on mount
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchImages = async () => {
      hasFetched.current = true;
      setLoading(true);
      try {
        const endpoint = isMobile ? "/api/mobslider" : "/api/slider";
        const res = await fetch(endpoint);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        const formatted = Object.values(data).map((item) => ({
          src: `${baseUrl}${item.image}`,
          href: item.link || "#",
          title: item.title || "",
        }));

        // Preload images
        await Promise.all(
          formatted.map(
            (img) =>
              new Promise((resolve) => {
                const image = new Image();
                image.src = img.src;
                image.onload = resolve;
                image.onerror = resolve;
              })
          )
        );

        isMobile ? setMobileImages(formatted) : setDesktopImages(formatted);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    const handleResize = () => {
      const current = window.innerWidth < 768;
      setIsMobile(current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const images = isMobile ? mobileImages : desktopImages;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % images.length),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  const slideVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  };

  // {added auto-slide}
  useEffect(() => {
    if (images.length <= 1) return; // Don't auto-slide if only 1 image

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images, currentIndex]);

  return (
    <div
      {...swipeHandlers}
      className="relative w-full aspect-[540/283] md:h-auto md:aspect-[16/5] overflow-hidden touch-pan-x"
      style={{ perspective: "1000px" }}
    >
      {loading || isMobile === null ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
      ) : images.length > 0 ? (
        <>
          <AnimatePresence mode="wait">
            <motion.a
              key={currentIndex}
              href={images[currentIndex]?.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideVariants}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 block w-full h-full"
            >
              <img
                src={images[currentIndex]?.src}
                alt={images[currentIndex]?.title || "Slide"}
                className="object-contain w-full h-full"
                loading="eager"
              />
            </motion.a>
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + images.length) % images.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition z-50"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % images.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition z-50"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 z-50 w-full flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-red-600 scale-110 shadow"
                    : "bg-red-600/40 hover:bg-red-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No slides available</p>
        </div>
      )}
    </div>
  );
}
