"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
  Heart,
  Truck,
  Clock,
  RefreshCw,
  Info,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Store,
  Package,
  MapPin,
  ChevronDown,
  Undo2,
  BadgeCheck,
  Tag,
  Eye,
  ChevronUp,
  X,
} from "lucide-react";
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
import CartSidebar from "@/app/components/CartSideBar";

export default function ProductPage() {
  const { getValidToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [showPopup, setShowPopup] = useState(false);
  const [pincode, setPincode] = useState("600001");
  const [city, setCity] = useState("Chennai"); // default city
  const [locationUpdated, setLocationUpdated] = useState(false);

  const handleUpdate = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

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

  const [isAdding, setIsAdding] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [viewerCount, setViewerCount] = useState(
    () => Math.floor(Math.random() * 16) + 15
  );
  const [lastUpdated, setLastUpdated] = useState("just now");

  const [showFullDesc, setShowFullDesc] = useState(false);

  const { isShort, limitedText } = useMemo(() => {
    if (!product?.description) return { isShort: true, limitedText: "" };

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = product.description;

    const fullText = tempDiv.textContent.trim();
    const words = fullText.split(/\s+/);

    // If within limit, no need to trim
    if (words.length <= 70) {
      return { isShort: true, limitedText: fullText };
    }

    // Slice first 70 words
    const trimmed = words.slice(0, 70).join(" ");

    // Find the last period before or at 70-word cutoff
    const lastDotIndex = trimmed.lastIndexOf(".");

    const finalCut =
      lastDotIndex !== -1 && lastDotIndex > 20 // avoid edge case like "No."
        ? trimmed.slice(0, lastDotIndex + 1) // include the period
        : trimmed + "..."; // fallback if no sentence-ending period found

    return { isShort: false, limitedText: finalCut };
  }, [product]);

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);

  useEffect(() => {
    const handleScrollRedirect = (e) => {
      const scrollable = col2Ref.current;
      if (!scrollable) return;

      const scrollPosition = window.scrollY;
      const col2Rect = col2Ref.current.getBoundingClientRect();
      const col2Top = col2Rect.top + window.scrollY;
      const col2Bottom = col2Top + col2Rect.height;

      // Only handle scroll redirection when we're actually within column 2's vertical space
      const isInCol2 =
        scrollPosition >= col2Top && scrollPosition <= col2Bottom;

      if (!isInCol2) return;

      const atTop = scrollable.scrollTop === 0;
      const atBottom =
        Math.abs(
          scrollable.scrollHeight -
            scrollable.clientHeight -
            scrollable.scrollTop
        ) < 2;

      const scrollingDown = e.deltaY > 0;

      const shouldTrap =
        (scrollingDown && !atBottom) || (!scrollingDown && !atTop);

      if (shouldTrap) {
        e.preventDefault();
        scrollable.scrollBy({
          top: e.deltaY,
          behavior: "auto",
        });
      }
    };

    document.addEventListener("wheel", handleScrollRedirect, {
      passive: false,
    });

    return () => {
      document.removeEventListener("wheel", handleScrollRedirect);
    };
  }, []);

  useEffect(() => {
    // Update timestamp every minute
    const timeInterval = setInterval(() => {
      setLastUpdated("1 minute ago");
    }, 60000);

    // Change viewer count more naturally (every 8-15 seconds)
    const countInterval = setInterval(() => {
      const direction = Math.random() < 0.55 ? 1 : -1; // 55% chance to increase
      const amount = Math.floor(Math.random() * 2) + 1; // Change by 1-2

      setViewerCount((prev) => {
        const newCount = prev + direction * amount;
        return Math.max(15, Math.min(30, newCount));
      });
    }, 8000 + Math.random() * 7000); // Random interval between 8-15 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(countInterval);
    };
  }, []);

  // Get params correctly
  const params = useParams();
  const slug = params?.slug;

  // useEffect(() => {
  //   console.log("Dynamic slug from URL:", slug);
  // }, [slug]);

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
          cost: parseFloat((p.cost ?? "0").toString().replace(/,/g, "")) || 0,
          price: parseFloat((p.price ?? "0").toString().replace(/,/g, "")) || 0,
          promo_price:
            parseFloat((p.promo_price ?? "0").toString().replace(/,/g, "")) ||
            0,

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

  const handleBuyNow = async () => {
    const toastId = toast.loading("Processing your order...");
    try {
      if (!product?.id) throw new Error("No product selected");

      // Step 1: Create or get cart ID
      let cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        cartId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", cartId);
      }

      // Step 2: Prepare payload
      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: 614624,
        qty: quantity,
        cart_id: cartId,
      };

      // Step 3: Get token
      let token = localStorage.getItem("authToken");

      const fetchToken = async () => {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "Admin@123" }),
        });

        const data = await res.json();
        if (data.status === "success") {
          localStorage.setItem("authToken", data.token);
          return data.token;
        } else {
          throw new Error("Authentication failed");
        }
      };

      if (!token) token = await fetchToken();

      // Step 4: Attempt to add to cart
      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Step 5: Retry once if unauthorized
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        token = await fetchToken();
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      console.log("Buy Now cart response:", result);

      if (result.redirect_link) {
        toast.update(toastId, {
          render: "Redirecting to checkout...",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        window.location.href = result.redirect_link;
      } else {
        // Server responded but no redirect link
        const errorMessage =
          result?.errors?.length > 0
            ? result.errors.join(", ")
            : "Something went wrong. Please try again.";

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Buy now error:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleAddToCart = async () => {
    if (isAdding || !product?.id) return;
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Step 1: Get or create cart ID
      let cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        cartId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", cartId);
      }

      // Step 2: Get existing cart data
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]"
      );

      // Step 3: Check if item exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      const maxQty = product.quantity || 0;

      // Step 4: Validate quantity
      if (quantity > maxQty) {
        toast.error(`Only ${maxQty} items available in stock.`);
        setIsAdding(false);
        return;
      }

      // Step 5: Update or insert item (replace qty, not add)
      let updatedCart;
      if (existingItemIndex >= 0) {
        updatedCart = existingCart.map((item, i) =>
          i === existingItemIndex
            ? { ...item, qty: quantity } // 👈 REPLACEMENT instead of +=
            : item
        );
      } else {
        updatedCart = [
          ...existingCart,
          {
            id: product.id,
            name: product.name,
            qty: quantity,
            price: product.cost,
            image: product.image,
          },
        ];
      }

      // Step 6: Save updated cart
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      if (typeof setQuickViewProduct === "function") {
        setQuickViewProduct(null);
      }

      if (typeof setIsCartOpen === "function") {
        setIsCartOpen(true);
      }

      const encodedSlug = encodeURIComponent(product.slug || product.id);

      toast.success("🎉 Product added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("❌ Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // Extract gallery images from HTML string if available
  const allImages = [
    product?.image,
    ...(product?.product_image
      ? (product.product_image.match(/src="([^"]+)"/g) || [])
          .map((src) => src.replace(/src="|"/g, ""))
          .filter((url) => url.trim() !== "")
      : []),
  ].filter(Boolean);

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
      <ToastContainer position="bottom-right" />

      {/* Breadcrumb Navigation */}
      <nav className="bg-white py-4 px-6 shadow-sm">
        <div className="container mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-[#A00300] hover:underline">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link href="/products" className="text-[#A00300] hover:underline">
                Products
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="text-gray-600 line-clamp-1">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Content - Full width layout */}
      <div className="w-full flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden mt-8">
        {/* Column 1 - Image Gallery (40%) - Fixed */}
        <div
          ref={col1Ref}
          className="w-full lg:w-[40%] lg:sticky top-0 overflow-hidden order-1"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            {/* Mobile-only Viewer Count */}
            <div className="lg:hidden flex items-center gap-1 text-sm text-gray-600 mb-2 px-4 whitespace-nowrap overflow-x-auto scrollbar-hide">
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-[#A00300] mr-1 flex-shrink-0" />
                <span className="font-medium">
                  {viewerCount} {viewerCount === 1 ? "person is" : "people are"}{" "}
                  currently viewing
                </span>
              </div>
              <span className="text-xs text-gray-400 ml-1">
                (Updated {lastUpdated})
              </span>
            </div>

            {/* 🧭 Vertical Thumbnails (Desktop Only) */}
            {product.image_g?.length > 0 && (
              <div className="hidden lg:block w-20 flex-shrink-0 ml-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 sr-only">
                  Thumbnails
                </h3>
                <div className="flex flex-col gap-3 h-[calc(100vh-160px)] overflow-y-auto py-2 scrollbar-hide">
                  {product.image_g.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === img
                          ? "border-[#A00300]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* 📸 Main Image */}
            <div className="w-full lg:flex-1 flex flex-col px-4 lg:px-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage || "default"}
                  className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={selectedImage || product.image}
                    alt={product?.name || "Product image"}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* 📱 Horizontal Thumbnails for Mobile */}
              {product.image_g?.length > 0 && (
                <div className="mt-4 lg:hidden">
                  <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                    {product.image_g.map((img, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        whileHover={{ scale: 1.05 }}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                          selectedImage === img
                            ? "border-[#A00300]"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile-only Price Section - Placed below thumbnails */}
              <div className="lg:hidden px-4 mt-4 mb-4">
                {/* Product Name & Category */}
                <div>
                  {product.promo_tag && (
                    <div className="mb-1 md:mb-2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-sm font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg shadow-md">
                        <Clock className="w-4 h-4 text-white" />
                        {product.promo_tag}
                      </span>
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
                    {product.name}
                  </h1>

                  {product.category && (
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 uppercase">
                        Category:
                      </span>
                      <span className="text-sm font-semibold text-[#A00300] tracking-wide">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="space-y-4 mt-4">
                  <div className="flex items-end gap-3">
                    <div className="flex items-baseline gap-1">
                      <IndianRupee className="w-6 h-6 text-[#A00300]" />
                      <span className="text-4xl font-bold text-[#A00300]">
                        {Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    {product.cost && product.cost > product.price && (
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span className="text-xl text-gray-500 line-through">
                          {Number(product.cost).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {product.cost && product.cost > product.price && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <span className="font-medium">
                          {Math.round(
                            ((Number(product.cost) - Number(product.price)) /
                              Number(product.cost)) *
                              100
                          )}
                          % OFF
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 - Product Details (35%) - Scrollable */}
        <div
          ref={col2Ref}
          className="w-full lg:w-[35%] px-4 py-0 overflow-visible lg:overflow-y-auto scrollbar-hide order-3 lg:order-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="py-0 px-4">
            <div className="space-y-6">
              {/* Viewer Count */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-[#A00300]" />
                  <span className="font-medium">
                    {viewerCount}{" "}
                    {viewerCount === 1 ? "person is" : "people are"} currently
                    looking at this product!
                    <span className="text-xs text-gray-400 ml-2">
                      (Updated {lastUpdated})
                    </span>
                  </span>
                </div>
              </div>

              {/* Product Name & Category */}
              <div className="">
                {product.promo_tag && (
                  <div className="mb-1 md:mb-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-sm font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg shadow-md">
                      <Clock className="w-4 h-4 text-white" />
                      {product.promo_tag}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase hidden md:flex">
                  {product.name}
                </h1>

                {Number(product.minimum_order_limit) === 1 &&
                  Number(product.minimum_order_qty) > 0 && (
                    <div className="mb-1 md:mb-2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ad0000] to-[#e30f00] text-white text-sm font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                        <span className="text-white font-semibold capitalize">
                          minimum order quantity:
                        </span>
                        {product.minimum_order_qty}
                      </span>
                    </div>
                  )}

                {product.category && (
                  <div className="mt-2 items-center gap-2 hidden md:flex">
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      Category:
                    </span>
                    <span className="text-sm font-semibold text-[#A00300] tracking-wide">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4 ">
                <div className="items-end gap-3 hidden md:flex">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="w-6 h-6 text-[#A00300]" />
                    <span className="text-4xl font-bold text-[#A00300]">
                      {Number(product.promo_price) > 0
                        ? Number(product.promo_price).toFixed(2)
                        : Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Show original price with strike-through if promo_price exists and is less than price */}
                  {Number(product.promo_price) > 0 &&
                    Number(product.promo_price) < Number(product.price) && (
                      <div className="items-center gap-1 hidden md:flex">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span className="text-xl text-gray-500 line-through">
                          {Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                </div>

                {Number(product.promo_price) > 0 &&
                  Number(product.promo_price) < Number(product.price) && (
                    <div className="hidden md:flex items-center gap-3">
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <span className="font-medium">
                          {Math.round(
                            ((Number(product.price) -
                              Number(product.promo_price)) /
                              Number(product.price)) *
                              100
                          )}
                          % OFF
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Highlights */}
              <div
                className={`grid gap-4 mt-6 ${
                  product.product_returnable?.toLowerCase() === "yes"
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {[
                  ...(product.product_returnable?.toLowerCase() === "yes"
                    ? [
                        {
                          icon: <Undo2 className="w-6 h-6 text-[#A00300]" />,
                          title: "Easy Returns",
                        },
                      ]
                    : []),
                  {
                    icon: <BadgeCheck className="w-6 h-6 text-[#A00300]" />,
                    title: "High Quality",
                  },
                  {
                    icon: <Tag className="w-6 h-6 text-[#A00300]" />,
                    title: "Lowest Price",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-md text-center shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="mb-2">{item.icon}</div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 mb-6 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left text-gray-900">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 font-semibold bg-gray-50 w-1/3">
                        Dimension
                      </th>
                      <td className="px-4 py-2">
                        Length - {Math.floor(product.length) ?? "N/A"} cm |
                        Width - {Math.floor(product.width) ?? "N/A"} cm | Height
                        - {Math.floor(product.height) ?? "N/A"} cm
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 font-semibold bg-gray-50">
                        Weight
                      </th>
                      <td className="px-4 py-2">{product.weight} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                  <Info className="w-5 h-5 text-[#A00300] mr-1 mb-1" />
                  Product Details
                </h3>
                <div className="prose prose-lg max-w-none">
                  {isShort ? (
                    <div
                      className="text-gray-700 space-y-4 text-justify"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : showFullDesc ? (
                    <>
                      <div
                        className="text-gray-700 space-y-4 text-justify"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                      <button
                        onClick={() => setShowFullDesc(false)}
                        className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
                      >
                        Read Less
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-700 space-y-4 text-justify">
                        {limitedText}
                      </div>
                      <button
                        onClick={() => setShowFullDesc(true)}
                        className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
                      >
                        Read More
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    </>
                  )}
                </div>

                {/* Static Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    "madeinindia copy.svg",
                    "sustainable icon copy.svg",
                    "handmade copy.svg",
                  ].map((img, i) => (
                    <div
                      key={i}
                      className="flex justify-center items-center p-2"
                    >
                      <Image
                        src={`/${img}`}
                        alt={`Static image ${i + 1}`}
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                  <Store className="w-5 h-5 text-[#A00300] mr-2" />
                  Sold By
                </h3>

                <div className="bg-[#fcfcfc] rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  {product.store_details?.[0]?.store_logo && (
                    <div className="w-full h-[320px] bg-gray-50 flex items-center justify-center px-6">
                      <Image
                        src={`https://marketplace.yuukke.com/assets/uploads/${product.store_details[0].store_logo}`}
                        alt={
                          product.store_details[0].company_name || "Store logo"
                        }
                        width={640}
                        height={519}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}

                  <div className="p-6 text-center">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.store_details?.[0]?.company_name ||
                        "Seller Information"}
                    </h4>

                    {/* {product.review > 0 && (
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(Number(product.review))
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {Number(product.review).toFixed(1)} (
                          {product.review_count || 0} reviews)
                        </span>
                      </div>
                    )} */}

                    {product.store_details?.[0]?.address && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p className="flex items-center justify-center">
                          <MapPin className="w-4 h-4 mr-1 text-[#A00300]" />
                          {product.store_details[0].city},{" "}
                          {product.store_details[0].state},{" "}
                          {product.store_details[0].country}
                        </p>
                      </div>
                    )}

                    {(() => {
                      const type = product.seller?.business_type;

                      if (type === "2") {
                        return (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              Verified Seller
                            </span>
                          </div>
                        );
                      }

                      if (type === "3") {
                        return (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-[#A00300]" />
                            <span className="text-sm font-medium text-[#A00300]">
                              Premium Seller
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Related Products */}
              {product.sellerproduct?.length > 0 && (
                <div className="border-t border-gray-200 pt-6 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                    <Package className="w-5 h-5 text-[#A00300] mr-2" />
                    More from this Seller
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.sellerproduct.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="group"
                      >
                        <div className="relative flex flex-col h-full">
                          {item.promo_price !== null &&
                            item.promo_price !== undefined &&
                            item.price > item.promo_price && (
                              <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-[2px] rounded z-10">
                                {Math.round(
                                  ((item.price - item.promo_price) /
                                    item.price) *
                                    100
                                )}
                                % OFF
                              </div>
                            )}

                          <div className="relative aspect-square bg-gray-50">
                            <Image
                              src={`https://marketplace.yuukke.com/assets/uploads/${item.image}`}
                              alt={item.name}
                              fill
                              className="object-cover w-full h-full transition-opacity group-hover:opacity-85"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                            />
                          </div>

                          <div className="p-3 flex flex-col justify-between h-full">
                            <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </h4>

                            <div className="flex items-center gap-1 text-sm text-gray-800 mt-auto">
                              <IndianRupee className="w-4 h-4 text-[#A00300]" />
                              <span className="font-semibold text-[#A00300]">
                                {Number(
                                  item.promo_price !== null &&
                                    item.promo_price !== undefined
                                    ? item.promo_price
                                    : item.price
                                ).toFixed(2)}
                              </span>

                              {item.promo_price !== null &&
                                item.promo_price !== undefined &&
                                item.price > item.promo_price && (
                                  <span className="text-xs text-gray-400 line-through ml-1">
                                    {Number(item.price).toFixed(2)}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3 - Actions (25%) */}
        <div
          ref={col3Ref}
          className="w-full lg:w-[25%] bg-white px-4 py-6 border-t lg:border-t-0 lg:border-l border-gray-100 order-2 lg:order-3"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-lg text-[#A00300] font-medium uppercase">
                Quantity:
              </span>
              <div className="relative w-24">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="appearance-none w-full py-1 px-3 pr-6 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#A00300] focus:border-[#A00300] bg-white cursor-pointer max-h-[200px] scrollbar-hide overflow-y-auto"
                >
                  {[
                    ...Array(
                      Number(product.quantity) > 0
                        ? Number(product.quantity)
                        : 1
                    ).keys(),
                  ].map((i) => (
                    <option
                      key={i + 1}
                      value={i + 1}
                      disabled={i + 1 > Number(product.quantity)}
                      className={
                        i + 1 > Number(product.quantity) ? "text-gray-400 " : ""
                      }
                    >
                      {i + 1}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 🛒 Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`group relative w-full overflow-hidden rounded-lg py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                    isAdding
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-transparent"
                  }`}
                  style={{ isolation: "isolate" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white">
                    <ShoppingCart className="w-5 h-5" />
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </span>
                  <span
                    className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-300 ease-in-out group-hover:w-full z-[1] rounded-lg"
                    style={{
                      transitionProperty: "width, background-color",
                      willChange: "width",
                    }}
                  />
                  <span className="absolute inset-0 z-[-1] rounded-lg border border-transparent group-hover:border-white" />
                </button>

                {/* Buy Now */}

                <button
                  onClick={handleBuyNow}
                  className={`group relative w-full overflow-hidden rounded-lg py-3 px-4 font-bold shadow-none border border-white transition-all duration-300 ease-in-out hover:border-transparent cursor-pointer`}
                  style={{ isolation: "isolate" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-black text-white">
                    <CreditCard className="w-5 h-5" />
                    Buy Now
                  </span>
                  <span
                    className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-300 ease-in-out group-hover:w-full z-[1] rounded-lg"
                    style={{
                      transitionProperty: "width, background-color",
                      willChange: "width",
                    }}
                  />
                  <span className="absolute inset-0 z-[-1] rounded-lg border border-transparent group-hover:border-black bg-black" />
                </button>
              </div>

              <Link
                href="https://marketplace.yuukke.com/shop/login"
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-medium transition hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 text-[#A00300]" />
                Add to Wishlist
              </Link>
            </div>

            {/* 📍 Delivery Location */}
            <div className="relative">
              {/* 📍 Delivery Location */}
              <div>
                <div className="text-sm text-gray-700 font-medium flex items-center justify-between">
                  <span>Delivery to</span>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1 text-[#A00300] text-xs hover:underline cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    Update Location
                  </button>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    locationUpdated
                      ? "text-green-700 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {city} {pincode}
                </p>
              </div>

              {/* 📦 Pincode Popup */}
              {showPopup && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 w-72">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Update Delivery Location
                    </h3>
                    <button onClick={handleClose}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A00300]"
                    placeholder="Enter 6-digit pincode"
                  />

                  <button
                    onClick={handleSave}
                    className="mt-3 w-full bg-[#A00300] text-white text-sm font-semibold py-2 rounded-md hover:bg-[#880200] transition"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* 🚚 Shipping Info (Optional) */}
            {/*
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Shipping Information
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <Truck className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>Free shipping on orders over ₹500</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>Delivery in 3-5 business days</span>
        </li>
        <li className="flex items-start gap-2">
          <RefreshCw className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>30-day easy returns</span>
        </li>
      </ul>
    </div>
    */}
          </div>
        </div>

        {isCartOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsCartOpen(false)}
            />
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </>
        )}
      </div>

      {/* Related Products Section */}
      {product.related_items?.length > 0 && (
        <section className="w-full border-t border-gray-100 pt-14 pb-20 px-6 bg-white">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Adjust `amount` as needed
            className="w-full mx-auto"
          >
            <div className="flex justify-between items-center mb-10 px-4">
              <h3 className="text-2xl font-semibold uppercase text-[#A00300] tracking-tight">
                Related Products
              </h3>
              <Link
                href="#"
                className="text-sm font-medium text-gray-900  hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-24 gap-y-16 md:gap-y-20">
              {product.related_items.slice(1, 17).map((item) => {
                const hasPromo = item.discount && item.discount > 0;
                const originalPrice = Number(item.cost);
                const promoPrice = Number(item.price);
                const discountPercent = hasPromo
                  ? Math.round(
                      ((originalPrice - promoPrice) / originalPrice) * 100
                    )
                  : 0;

                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="relative group flex flex-col transition"
                    style={{ height: "100%" }}
                  >
                    {/* Premium Badge */}
                    {item.is_premium && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg z-10">
                        Premium
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <button className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#A00300]/10 transition">
                        <Heart className="text-gray-500 w-4 h-4 hover:text-[#A00300]" />
                      </button>
                    </div>

                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="block w-full overflow-hidden group mb-2"
                    >
                      <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                        <Image
                          src={`https://marketplace.yuukke.com/assets/uploads/${item.image}`}
                          alt={item.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          priority={false} // Set to true only for above-the-fold images
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col ml-4">
                      <h4
                        className="text-sm font-semibold text-gray-900 hover:text-[#A00300] transition-colors mb-1 capitalize 
               line-clamp-2 md:line-clamp-none"
                        style={{ maxWidth: "30ch", wordBreak: "break-word" }}
                      >
                        {item.name}
                      </h4>

                      <div className="flex justify-between items-baseline gap-1.5 flex-wrap">
                        {/* Left: Price + Striked price */}
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-sm font-bold text-[#A00300]">
                            ₹
                            {Number(
                              item.promo_price !== null &&
                                item.promo_price !== undefined
                                ? item.promo_price
                                : item.price
                            ).toFixed(2)}
                          </p>

                          {/* Show strikethrough only if promo_price is valid and less than price */}
                          {item.promo_price !== null &&
                            item.promo_price !== undefined &&
                            item.price > item.promo_price && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{Number(item.price).toFixed(2)}
                              </p>
                            )}
                        </div>

                        {/* Right: % OFF */}
                        {item.promo_price !== null &&
                          item.promo_price !== undefined &&
                          item.price > item.promo_price && (
                            <span className="text-[10px] font-bold text-red-600 ml-auto">
                              {Math.round(
                                ((item.price - item.promo_price) / item.price) *
                                  100
                              )}
                              % OFF
                            </span>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
