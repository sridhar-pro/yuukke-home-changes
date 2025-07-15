import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // Add the Google Translate script to the page
    const addScript = () => {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize the Google Translate element
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ta,hi", // English, Tamil, Hindi
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      } catch (error) {
        console.error("Error initializing Google Translate:", error);
      }
    };

    addScript();

    return () => {
      // Cleanup
      const iframes = document.querySelectorAll(
        ".goog-te-menu-frame, .goog-te-banner-frame"
      );
      iframes.forEach((iframe) => iframe.remove());
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="google-translate-container">
      <div id="google_translate_element"></div>

      {/* Add some CSS to style the widget */}
      <style jsx>{`
        .google-translate-container {
          display: inline-block;
          vertical-align: middle;
        }
        .goog-te-gadget {
          font-family: inherit !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        .goog-te-menu-value span {
          color: #4b5563 !important; /* gray-600 */
        }
        .goog-te-menu-value {
          display: flex !important;
          align-items: center !important;
        }
        .goog-te-menu-value:after {
          content: "▼";
          font-size: 0.6rem;
          margin-left: 4px;
          color: #4b5563;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;
