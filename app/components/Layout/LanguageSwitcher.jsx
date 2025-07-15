"use client";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const [showDropdown, setShowDropdown] = useState(false);

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
            includedLanguages: "en,hi,ta,gu,te", // Added Gujarati & Telugu
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

  const handleTranslate = (lang) => {
    if (lang === "en") {
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      location.href = window.location.pathname;
      return;
    }

    const googleFrame = document.querySelector("iframe.goog-te-menu-frame");
    if (googleFrame) {
      const innerDoc =
        googleFrame.contentDocument || googleFrame.contentWindow.document;
      const spanTags = innerDoc.querySelectorAll(
        ".goog-te-menu2-item span.text"
      );

      Array.from(spanTags).forEach((el) => {
        if (el.innerHTML.toLowerCase().includes(lang)) {
          el.click();
        }
      });
    } else {
      document.cookie = `googtrans=/en/${lang}`;
      location.reload();
    }
  };

  return (
    <div className="relative inline-block text-left" translate="no">
      {/* 🌐 Language Switcher Button */}
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition notranslate"
        title="Translate"
        aria-label="Translate"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <Globe className="w-5 h-5 text-gray-700" />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white shadow-md rounded-md z-50 notranslate"
          translate="no"
        >
          <button
            onClick={() => {
              handleTranslate("en");
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            English - EN
          </button>
          <button
            onClick={() => {
              handleTranslate("hi");
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            हिंदी - HI
          </button>
          <button
            onClick={() => {
              handleTranslate("ta");
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            தமிழ் - TA
          </button>
          <button
            onClick={() => {
              handleTranslate("gu");
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            ગુજરાતી - GU
          </button>
          <button
            onClick={() => {
              handleTranslate("te");
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            తెలుగు - TE
          </button>
        </div>
      )}

      {/* Translator Mount (hidden but needed) */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default LanguageSwitcher;
