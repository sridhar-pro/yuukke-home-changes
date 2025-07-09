"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/app/utils/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  fadeInUp,
} from "@/app/utils/variants";
import ProductGalleryPage from "./ProductGallery";
import RelatedProductPage from "./RelatedProduct";

export default function ProductPage() {
  const { getValidToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const handleSave = async (retry = false) => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    const toastId = toast.loading("Validating pincode...");

    try {
      const token = await getValidToken();
      if (!token) {
        if (!retry) {
          localStorage.removeItem("authToken");
          await login(); // 👈 implement your login logic
          toast.dismiss(toastId);
          return handleSave(true); // 🔁 retry once
        } else {
          throw new Error("Authentication failed");
        }
      }

      const res = await fetch("/api/pincode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pincode, country: "IN" }),
      });

      const data = await res.json();
      const result = data?.data?.data;

      if (result?.pincode && result?.country === "IN" && result?.city) {
        setCity(result.city); // ✅ dynamically set city from API
        setShowPopup(false);
        setLocationUpdated(true); // ✅ mark update

        toast.update(toastId, {
          render: "Location updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Invalid pincode or city not found.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error validating pincode:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong while fetching city.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // Get params correctly
  const params = useParams();
  const slug = params?.slug;

  useEffect(() => {
    const fetchProductDetails = async (retry = false) => {
      try {
        if (!slug) return;
        setLoading(true);

        const productSlug = Array.isArray(slug) ? slug[0] : slug;

        const token = await getValidToken();
        if (!token) {
          if (!retry) {
            localStorage.removeItem("authToken");
            await login(); // 🔁 force re-login if token missing
            return fetchProductDetails(true);
          } else {
            throw new Error("Authentication failed");
          }
        }

        const response = await fetch("/api/quantityCheck", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug: productSlug,
            id: productSlug.split("-").pop() || "",
          }),
        });

        if (response.status === 401 && !retry) {
          localStorage.removeItem("authToken");
          return await fetchProductDetails(true); // 🔁 silent retry
        }

        if (!response.ok) {
          // Don't throw ugly 401 error to frontend
          if (retry) throw new Error("Failed to fetch product details.");
          else return;
        }

        const data = await response.json();
        if (!data?.data?.[0]) throw new Error("Product data not found");
        console.log("data:", data);

        const p = data.data[0];

        setProduct({
          id: p.id,
          name: p.name,
          description: p.product_details || "No description available",
          price: p.price ? parseFloat(p.price.toString().replace(/,/g, "")) : 0,
          promo_price: p.promo_price
            ? parseFloat(p.promo_price.toString().replace(/,/g, ""))
            : null,
          end_date: p.end_date,
          promo_tag: p.promo_tag,
          quantity: p.quantity,
          review: p.review,
          review_count: p.review,
          category: p.category,
          brand: p.brand,
          weight: p.weight,
          dimensions: p.dimensions,
          image: p.p_image || "/placeholder-product.jpg",
          image_g: p.product_image || [],
          store_details: p.store_details || [],
          sellerproduct: p.sellerproduct || [],
          related_items: p.related_items || [],
          seller: p.seller || {},
          length: p.length || 0,
          width: p.width || 0,
          height: p.height || 0,
          weight: p.weight || 0,
          product_returnable: p.product_returnable,
          minimum_order_qty: p.minimum_order_qty,
          minimum_order_limit: p.minimum_order_limit,
        });

        setSelectedImage(p.p_image || "/placeholder-product.jpg");
      } catch (err) {
        // Only log error silently, no frontend display for first-time 401s
        console.error("[Silent Catch] Product fetch failed:", err.message);

        if (retry) {
          setError("Something went wrong loading product."); // ✅ only after retry
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug, getValidToken]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          href="/"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-gray-600 mb-4">Product not found</div>
        <Link
          href="/"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  // Main product display
  return (
    <div className="min-h-screen relative">
      {/* Product Content - Full width layout */}
      <ProductGalleryPage />

      {/* Related Products Section */}
      <RelatedProductPage />
    </div>
  );
}
