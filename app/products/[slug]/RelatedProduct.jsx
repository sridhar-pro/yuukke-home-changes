"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/app/utils/variants";
import Head from "next/head";

export default function RelatedProductPage() {
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  // Get params correctly
  const params = useParams();
  const slug = params?.slug;

  useEffect(() => {
    if (!slug) return;

    const productSlug = Array.isArray(slug) ? slug[0] : slug;
    const localKey = `product-${productSlug}`;
    const cached = localStorage.getItem(localKey);

    if (!cached) {
      console.warn("⚠️ No cached product data found in localStorage");
      setError("Product details not found.");
      return;
    }

    try {
      setLoading(true);
      const parsed = JSON.parse(cached);
      const p = parsed.data;

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
      console.error("❌ Error parsing cached product data:", err);
      setError("Failed to load cached product.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

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
    <>
      {product && (
        <Head>
          <title>{`${product.name} | Your Brand Name`}</title>
          <meta
            name="description"
            content={
              product.description?.slice(0, 150) ||
              "Check out this amazing product from our store!"
            }
          />
          <meta property="og:title" content={`${product.name}`} />
          <meta property="og:description" content={product.description} />
          <meta property="og:image" content={product.image} />
        </Head>
      )}

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
                const hasValidPromo =
                  item?.promo_price !== null &&
                  item?.promo_price !== undefined &&
                  !isNaN(Number(item.promo_price)) &&
                  Number(item.promo_price) > 0 &&
                  Number(item.promo_price) < Number(item.price) &&
                  item?.end_date &&
                  new Date(item.end_date).getTime() > Date.now();

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
                          src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
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
                        {/* Left: Price and strikethrough */}
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-sm font-bold text-[#A00300]">
                            ₹
                            {hasValidPromo
                              ? Number(item.promo_price).toFixed(2)
                              : Number(item.price).toFixed(2)}
                          </p>

                          {hasValidPromo && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{Number(item.price).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Right: % OFF */}
                        {hasValidPromo && (
                          <span className="text-[10px] font-bold text-red-600 ml-auto">
                            {Math.round(
                              ((Number(item.price) - Number(item.promo_price)) /
                                Number(item.price)) *
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
    </>
  );
}
