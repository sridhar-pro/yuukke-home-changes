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

const LanguageSwitcher = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

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
            gaTrack: true,
            gaId: "UA-XXXXX-X",
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
      document.body.appendChild(script);

      window.googleTranslateElementInit = loadGoogleTranslate;
    } else {
      loadGoogleTranslate();
    }
  }, []);

  useEffect(() => {
    const getLanguage = () => {
      const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
      const langCode = match?.[1]?.toLowerCase();

      if (!langCode) {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        const defaultLang = isMobile ? "hi" : "en";

        document.cookie = `googtrans=/en/${defaultLang}; path=/;`;
        setCurrentLang(langMap[defaultLang] || "EN");

        setTimeout(() => {
          const select = document.querySelector(".goog-te-combo");
          if (select) {
            select.value = defaultLang;
            const evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", true, true);
            select.dispatchEvent(evt);
          }
        }, 500);
      } else {
        setCurrentLang(langMap[langCode] || "EN");
      }
    };

    getLanguage();
  }, []);

  const handleTranslate = (lang) => {
    document.cookie = `googtrans=/en/${lang}; path=/;`;
    setCurrentLang(langMap[lang] || "EN");

    setTimeout(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = lang;
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        select.dispatchEvent(evt);
      } else {
        window.location.reload();
      }
    }, 300);
  };

  const pathname = usePathname();

  useEffect(() => {
    const applyTranslation = () => {
      const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
      const langCode = match?.[1]?.toLowerCase() || "en";
      setCurrentLang(langMap[langCode] || "EN");

      if (langCode !== "en" && window.google?.translate?.TranslateElement) {
        setTimeout(() => {
          const select = document.querySelector(".goog-te-combo");
          if (select) {
            select.value = langCode;
            const evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", true, true);
            select.dispatchEvent(evt);
          }
        }, 300);
      }
    };

    const timeout = setTimeout(applyTranslation, 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  const handleToggle = () => {
    setShowDropdown((prev) => {
      if (!prev) {
        document.body.style.overflow = "hidden";
        return true;
      }
      document.body.style.overflow = "";
      return false;
    });
  };

  return (
    <div
      className="relative inline-block text-left"
      translate="no"
      ref={dropdownRef}
    >
      <button
        ref={buttonRef}
        className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition notranslate"
        title="Translate"
        aria-label="Translate"
        onClick={handleToggle}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleToggle();
        }}
      >
        <Globe className="w-4 md:w-5 h-4 md:h-5 text-gray-800" />
        <span className="text-sm font-medium text-gray-800">{currentLang}</span>
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-50 notranslate"
          translate="no"
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
              onTouchEnd={() => {
                handleTranslate(code);
                setShowDropdown(false);
                document.body.style.overflow = "";
              }}
              className={`flex items-center justify-between w-full text-left px-4 py-3 hover:bg-gray-50 ${
                currentLang === label ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-gray-700">{labelMap(label)}</span>
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

const labelMap = (code) =>
  ({
    EN: "English",
    HI: "हिंदी",
    TA: "தமிழ்",
    GU: "ગુજરાતી",
    TE: "తెలుగు",
  }[code]);

export default LanguageSwitcher;
