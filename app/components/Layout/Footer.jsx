"use client";
import { useEffect, useState, useMemo } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useAuth } from "@/app/utils/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/slices/categorySlice";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const dispatch = useDispatch();
  const { isAuthReady, getValidToken } = useAuth();

  const reduxCategories = useSelector((state) => state.categories.list);
  const loading = useSelector((state) => state.categories.loading);
  const error = useSelector((state) => state.categories.error);

  const [apiCategories, setApiCategories] = useState([]);

  const staticSection = {
    title: "Quick Links",
    links: [
      {
        name: "ODOP Registration",
        slug: "https://marketplace.yuukke.com/odop_register",
      },
      {
        name: "Seller Registration",
        slug: "https://marketplace.yuukke.com/seller_register",
      },
      {
        name: "Empowering Community",
        slug: "https://marketplace.yuukke.com/empowering-community",
      },
      {
        name: "How To Gain YuukkeMints",
        slug: "https://marketplace.yuukke.com/gain-yuukkemints",
      },
    ],
  };

  // ✅ Fetch and sync once auth is ready
  useEffect(() => {
    if (isAuthReady && reduxCategories.length === 0) {
      dispatch(fetchCategories(getValidToken));
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (reduxCategories?.length > 0) {
      setApiCategories(reduxCategories);
    }
  }, [reduxCategories]);

  const footerData = useMemo(() => {
    return [staticSection, ...apiCategories];
  }, [apiCategories]);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center py-10">
  //       <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
  //       <span className="ml-3 text-sm text-gray-500"></span>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-600">
        <AlertTriangle className="w-6 h-6 mb-2" />
        <p className="font-semibold text-sm">
          Oops! Something went wrong loading the footer.
        </p>
        <p className="text-xs text-gray-500">({error})</p>
      </div>
    );
  }

  return (
    <footer className="bg-white text-sm text-[#911439]">
      {/* Subscribe Section */}
      <div className="w-full py-6 bg-white p-4">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-10 px-4 max-w-[105rem] mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-40 ml-0 md:ml-6 text-center md:text-left">
            <img
              src="/subscribe.png"
              alt="Logo"
              className="w-20 h-20 object-contain mx-auto md:mx-0"
            />
            <p className="text-[#911439] font-semibold text-2xl md:text-[2rem]">
              Get offers in your inbox
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="p-[2px] rounded bg-gradient-to-r from-red-700 to-red-800 w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
              <input
                type="email"
                placeholder="Enter your mail here"
                className="w-full px-3 py-2 rounded outline-none bg-white text-black text-sm sm:text-base"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-950 to-red-900 text-white px-4 py-2 rounded-sm hover:from-blue-800 hover:to-blue-950 transition w-full md:w-56">
              Subscribe Me!
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="w-full px-4">
        <div className="w-full mx-auto px-0 md:px-6 py-6">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-[#911439] rounded-full animate-spin" />
              <span className="ml-3 text-sm text-gray-500"></span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 text-red-600">
              <AlertTriangle className="w-5 h-5 mb-1" />
              <p className="text-xs">Couldn’t load more links. ({error})</p>
            </div>
          ) : (
            footerData.map((section, index) => (
              <motion.div
                key={`section-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={
                  section.title === "Quick Links"
                    ? "border-y border-gray-300 w-full py-6"
                    : "py-2"
                }
              >
                <div className="text-xs">
                  {section.title === "Quick Links" ? (
                    <h4 className="font-bold underline">
                      {section.title
                        .replace(/&#039;/g, "'")
                        .replace(/&amp;/g, "&")}
                    </h4>
                  ) : (
                    <a
                      href={`https://marketplace.yuukke.com/category/${section.parentSlug}`}
                      className="font-bold underline hover:text-[#6e0e2d]"
                    >
                      {section.title
                        .replace(/&#039;/g, "'")
                        .replace(/&amp;/g, "&")}
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2 text-[#911439]">
                    {section.links.map((link, idx) => (
                      <span key={`link-${index}-${idx}`}>
                        {idx > 0 && <span className="mx-0 md:mx-1">|</span>}
                        <a
                          href={
                            link.slug.startsWith("http")
                              ? link.slug
                              : `https://marketplace.yuukke.com/category/${link.parentSlug}/${link.slug}`
                          }
                          className="hover:underline"
                        >
                          {link.name
                            .replace(/&#039;/g, "'")
                            .replace(/&amp;/g, "&")}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-300 mt-0 pt-0">
        <div className="max-w-[105rem] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Logo on the far left (or center on mobile) */}
            <div className="md:w-1/4 w-full flex justify-center md:justify-start">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-40 h-16 md:h-40 object-contain"
              />
            </div>

            {/* Text & Payment icons */}
            <div className="md:w-3/4 w-full flex flex-col items-center md:items-end text-center md:text-left text-gray-400 text-xs md:text-base font-medium">
              <p className="max-w-7xl">
                Your one-stop destination for an unparalleled shopping
                experience. We pride ourselves on offering a diverse and
                carefully curated selection of high-quality products across
                various categories. From fashion and accessories to home
                essentials and beyond, Yuukke is committed to bringing you items
                that enrich your life while prioritizing sustainability.
              </p>

              {/* Payment Icons below */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-end gap-2">
                <img
                  src="/mastercard.png"
                  alt="Mastercard"
                  className="w-20 h-20 object-contain"
                />
                <img
                  src="/maestro.png"
                  alt="Maestro"
                  className="w-20 h-20  object-contain"
                />
                <img
                  src="/american_express.png"
                  alt="Amex"
                  className="w-20 h-20  object-contain"
                />
                <img
                  src="/paypal.png"
                  alt="PayPal"
                  className="w-20 h-20  object-contain"
                />
                <img
                  src="/visa.jpg"
                  alt="Visa"
                  className="w-20 h-20  object-contain"
                />
                {/* <img
                  src="/razorpay.png"
                  alt="Maestro"
                  className="w-20 h-20  object-contain"
                />
                <img
                  src="/shiprocket.webp"
                  alt="Maestro"
                  className="w-20 h-20  object-contain"
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div
        className="bg-gradient-to-r from-blue-950 to-[#911439] text-white text-sm px-4 sm:px-8 md:px-16 lg:px-20 py-6"
        translate="no"
      >
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between text-center md:text-left">
          {/* Copyright */}
          <div className="text-xs sm:text-sm">
            ©2025 Yuukke Global Ventures Private Limited.
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              Shipping
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              Returns & Refund
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              T&C
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>

          {/* Socials */}
          <div className="flex justify-center md:justify-end items-center gap-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Follow us</span>
            <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-300 cursor-pointer" />
            <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-300 cursor-pointer" />
            <FaLinkedinIn className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-300 cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
