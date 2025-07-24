"use client";
import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { usePathname } from "next/navigation";

const langMap = {
  en: "EN",
  hi: "HI",
  ta: "TA",
  gu: "GU",
  te: "TE",
};

const labelMap = {
  EN: "English",
  HI: "हिंदी",
  TA: "தமிழ்",
  GU: "ગુજરાતી",
  TE: "తెలుగు",
};

const LanguageSwitcher = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        document.body.style.overflow = "";
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Load Google Translate script only once
  useEffect(() => {
    const loadTranslateScript = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: Object.keys(langMap).join(","),
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    if (!window.google?.translate?.TranslateElement) {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      window.googleTranslateElementInit = loadTranslateScript;
      document.body.appendChild(script);
    } else {
      loadTranslateScript();
    }
  }, []);

  // Detect initial language from cookie
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
    const langCode = match?.[1]?.toLowerCase();
    const finalLang =
      langCode ||
      (/Android|iPhone|iPad/i.test(navigator.userAgent) ? "hi" : "en");

    setCurrentLang(langMap[finalLang] || "EN");

    const applyLang = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select && select.value !== finalLang) {
        select.value = finalLang;
        select.dispatchEvent(new Event("change"));
      }
    };

    document.cookie = `googtrans=/en/${finalLang}; path=/;`;
    setTimeout(applyLang, 400);
  }, []);

  // Reapply language on pathname change
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
    const langCode = match?.[1]?.toLowerCase() || "en";
    setCurrentLang(langMap[langCode] || "EN");

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      setTimeout(() => {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
      }, 300);
    }
  }, [pathname]);

  const handleTranslate = (lang) => {
    document.cookie = `googtrans=/en/${lang}; path=/;`;
    setCurrentLang(langMap[lang] || "EN");

    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="relative inline-block text-left notranslate"
      translate="no"
      ref={dropdownRef}
    >
      <button
        ref={buttonRef}
        className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition"
        onClick={() => {
          setShowDropdown((prev) => {
            const next = !prev;
            document.body.style.overflow = next ? "hidden" : "";
            return next;
          });
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setShowDropdown((prev) => {
            const next = !prev;
            document.body.style.overflow = next ? "hidden" : "";
            return next;
          });
        }}
        title="Translate"
        aria-label="Translate"
      >
        <Globe className="w-4 md:w-5 h-4 md:h-5 text-gray-800" />
        <span className="text-sm font-medium text-gray-800">{currentLang}</span>
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-50"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {Object.entries(langMap).map(([code, label]) => (
            <button
              key={code}
              onClick={() => {
                handleTranslate(code);
                setShowDropdown(false);
                document.body.style.overflow = "";
              }}
              className={`flex items-center justify-between w-full text-left px-4 py-3 hover:bg-gray-50 ${
                currentLang === label ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-gray-700">{labelMap[label]}</span>
                <span className="text-xs text-gray-500">({label})</span>
              </div>
              {currentLang === label && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default LanguageSwitcher;
