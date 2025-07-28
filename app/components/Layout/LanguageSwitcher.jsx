"use client";
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

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
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (window.google?.translate?.TranslateElement) return;

      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
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
      };
    };

    addGoogleTranslateScript();
  }, []);

  // 📡 Get current language from cookie
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
    const langCode = match?.[1]?.toLowerCase() || "en";
    setCurrentLang(langMap[langCode] || "EN");
  }, []);

  // 🈂️ Switch language
  const handleTranslate = (lang) => {
    if (lang === "en") {
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      location.reload(); // Clear translation
      return;
    }

    const applyTranslation = () => {
      const googleFrame = document.querySelector("iframe.goog-te-menu-frame");
      if (!googleFrame) {
        // Fallback: set cookie and reload
        document.cookie = `googtrans=/en/${lang}`;
        location.reload();
        return;
      }

      const innerDoc =
        googleFrame.contentDocument || googleFrame.contentWindow.document;
      const spanTags = innerDoc.querySelectorAll(
        ".goog-te-menu2-item span.text"
      );

      let clicked = false;
      spanTags.forEach((el) => {
        if (el.innerHTML.toLowerCase().includes(lang) && !clicked) {
          el.click();
          clicked = true;
        }
      });

      if (!clicked) {
        document.cookie = `googtrans=/en/${lang}`;
        location.reload();
      }
    };

    // 🔄 Delay to ensure iframe is loaded
    setTimeout(applyTranslation, 500);
  };

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
        <Globe className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">{currentLang}</span>
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
      <div id="google_translate_element" className="invisible absolute" />
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
