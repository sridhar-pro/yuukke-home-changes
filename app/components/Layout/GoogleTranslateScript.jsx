"use client";
import { useEffect } from "react";

const GoogleTranslateScript = () => {
  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,ta",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      } else {
        setTimeout(loadGoogleTranslate, 500);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = loadGoogleTranslate;
    } else {
      loadGoogleTranslate(); // If script already present
    }
  }, []);

  return null;
};

export default GoogleTranslateScript;
