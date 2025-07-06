"use client";
import { useEffect, useState } from "react";
import FullScreenLoader from "./FullScreenLoader";

const LoaderWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePageLoad = () => {
      setTimeout(() => setLoading(false), 1000); // optional delay for dramatic flair 💃
    };

    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
      return () => window.removeEventListener("load", handlePageLoad);
    }
  }, []);

  return (
    <>
      <FullScreenLoader visible={loading} />
      {!loading && children}
    </>
  );
};

export default LoaderWrapper;
