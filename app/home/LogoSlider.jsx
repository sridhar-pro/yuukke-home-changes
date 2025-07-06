"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/AuthContext";

const LogoSlider = () => {
  const [logos, setLogos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { getValidToken } = useAuth();
  const hasFetched = useRef(false); // Add this ref

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchWithAuth = async (url, retry = false) => {
      const token = await getValidToken();
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 && !retry) {
        localStorage.removeItem("authToken");
        return fetchWithAuth(url, true);
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    };

    const fetchLogos = async () => {
      try {
        const data = await fetchWithAuth("/api/vendorlogo");
        const logoUrls = data.map((vendor) => ({
          id: vendor.id,
          slug: vendor.slug,
          logo: `https://marketplace.yuukke.com/assets/uploads/${vendor.store_logo}`,
        }));
        setLogos(logoUrls);
      } catch (error) {
        console.error("Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, [getValidToken]);

  return (
    <div className="relative w-full overflow-hidden py-8 bg-white mb-16">
      <div className="mx-auto px-8 max-w-[1400px]">
        <div
          className={`relative w-full ${
            isMobile ? "overflow-x-auto" : "overflow-hidden"
          }`}
        >
          <div
            className={`flex gap-16 md:gap-40 w-max ${
              !isMobile ? "logo-slider-track" : ""
            }`}
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {[...logos, ...logos, ...logos].map((vendor, idx) => (
              <div key={`logo-${idx}`} className="flex-shrink-0 w-32 h-20">
                <a
                  href={`https://marketplace.yuukke.com/seller/${vendor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={vendor.logo}
                    alt={`logo-${vendor.slug}`}
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar for WebKit browsers */}
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        .logo-slider-track {
          animation: slide 120s linear infinite;
        }
        .logo-slider-track:hover {
          animation-play-state: paused !important;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LogoSlider;
