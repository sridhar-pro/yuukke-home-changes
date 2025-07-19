"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TranslationResetWrapper = () => {
  const pathname = usePathname();

  useEffect(() => {
    const isOdopPage = pathname.includes("/odop-registration");

    const match = document.cookie.match(/googtrans=\/en\/(\w{2})/);
    const langCode = match?.[1]?.toLowerCase() || "en";

    if (!isOdopPage && langCode !== "en") {
      const alreadyReset = sessionStorage.getItem("reset-reloaded");
      if (!alreadyReset) {
        document.cookie =
          "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        sessionStorage.setItem("reset-reloaded", "true");
        window.location.reload();
      }
    }
  }, [pathname]);

  return null; // Just doing its job silently like Batman
};

export default TranslationResetWrapper;
