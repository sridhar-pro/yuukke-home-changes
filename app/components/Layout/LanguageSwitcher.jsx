"use client";
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";

const langMap = {
  en: "EN",
  hi: "HI",
  ta: "TA",
  gu: "GU",
  te: "TE",
};

const LanguageSwitcher = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN"); // Default to English
  const dropdownRef = useRef(null);

  // 🧠 Detect clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌐 Inject Google Translate script
  // 🌐 Inject Google Translate script AND re-initialize on route changes
  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,ta,gu,te",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // 👀 Create script if not already present
    if (!window.google?.translate?.TranslateElement) {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = loadGoogleTranslate;
    } else {
      // Already injected, just re-init
      loadGoogleTranslate();
    }
  }, []);

  // 📡 Get current language from cookie
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
    const langCode = match?.[1]?.toLowerCase();

    if (!langCode) {
      // No language set, default to Hindi
      document.cookie = "googtrans=/en/hi; path=/;";
      setCurrentLang("HI");

      // Trigger translation
      setTimeout(() => {
        const event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = "hi";
          select.dispatchEvent(event);
        }
      }, 500);
    } else {
      setCurrentLang(langMap[langCode] || "EN");
    }
  }, []);

  // 🈂️ Switch language
  const handleTranslate = (lang) => {
    // 🍪 Set the cookie correctly even for English
    document.cookie = `googtrans=/en/${lang}; path=/;`;

    // 🔁 Force a re-translation
    setTimeout(() => {
      const event = document.createEvent("HTMLEvents");
      event.initEvent("change", true, true);
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = lang;
        select.dispatchEvent(event);
      } else {
        // fallback to full reload if not ready
        window.location.href = window.location.pathname;
      }
    }, 500);
  };

  const pathname = usePathname();

  // Reapply the translation on route change
  useEffect(() => {
    const applyTranslation = () => {
      const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
      const langCode = match?.[1]?.toLowerCase() || "en";
      setCurrentLang(langMap[langCode] || "EN");

      // Force translate if not English
      if (langCode !== "en" && window.google?.translate?.TranslateElement) {
        const event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = langCode;
          select.dispatchEvent(event);
        }
      }
    };

    const timeout = setTimeout(applyTranslation, 300); // wait for Google to be ready
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div
      className="relative inline-block text-left"
      translate="no"
      ref={dropdownRef}
    >
      {/* 🌐 Language Switcher Button with Prefix */}
      <button
        className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition notranslate"
        title="Translate"
        aria-label="Translate"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <Globe className="w-4 md:w-5 h-4 md:h-5 text-gray-800" />
        <span className="text-sm font-medium text-gray-800">{currentLang}</span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white shadow-md rounded-md z-50 notranslate"
          translate="no"
        >
          {Object.entries(langMap).map(([code, label]) => (
            <button
              key={code}
              onClick={() => {
                handleTranslate(code);
                setShowDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {`${labelMap(label)} - ${label}`}
            </button>
          ))}
        </div>
      )}

      {/* Hidden mount point */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

// 🏷️ Optional: Make the labels a little prettier (fallback if needed)
const labelMap = (code) =>
  ({
    EN: "English",
    HI: "हिंदी",
    TA: "தமிழ்",
    GU: "ગુજરાતી",
    TE: "తెలుగు",
  }[code]);

export default LanguageSwitcher;
