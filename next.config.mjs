/** @type {import('next').NextConfig} */

// 🟢 Toggle this to `true` when testing!
const IS_TEST = false;

// 🔗 API endpoints
const TEST_API = "https://marketplace.betalearnings.com/api/v1/Marketv2";
const LIVE_API = "https://marketplace.yuukke.com/api/v1/Marketv2";

// 🧠 Use BASE_API for general rewrites (based on toggle)
const BASE_API = IS_TEST ? TEST_API : LIVE_API;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "marketplace.betalearnings.com",
      },
      {
        protocol: "https",
        hostname: "marketplace.yuukke.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/giftBox",
        destination: `${BASE_API}/giftBox`,
      },
      {
        source: "/api/addGiftCard",
        destination: `${BASE_API}/addGiftCard`,
      },
      {
        source: "/api/addGiftAddons",
        destination: `${BASE_API}/giftAddons`,
      },
      {
        source: "/api/homeCategory",
        destination: `${BASE_API}/homeCategory`,
      },
      {
        source: "/api/quantityCheck",
        destination: `${BASE_API}/getProductDetails/`,
      },
      {
        source: "/api/slider",
        destination: `${BASE_API}/slider`,
      },
      {
        source: "/api/mobslider",
        destination: `${BASE_API}/mobile_slider`,
      },
      {
        source: "/api/newarrival",
        destination: `${BASE_API}/newArraivals`,
      },
      {
        source: "/api/featuredproducts",
        destination: `${BASE_API}/featuredProducts`,
      },
      {
        source: "/api/festivalproducts",
        destination: `${BASE_API}/festivalProducts`,
      },
      {
        source: "/api/wellnessproducts",
        destination: `${BASE_API}/wellnessProducts`,
      },
      {
        source: "/api/giftproducts",
        destination: `${BASE_API}/getGiftsProducts`,
      },
      {
        source: "/api/corporategiftproducts",
        destination: `${BASE_API}/getCorporateGifts`,
      },
      {
        source: "/api/returngiftproducts",
        destination: `${BASE_API}/getReturnGifts`,
      },
      {
        source: "/api/vendorlogo",
        destination: `${BASE_API}/vendorLogo`,
      },
      {
        source: "/api/getNews",
        destination: `${BASE_API}/getNews`,
      },
      {
        source: "/api/getProducts",
        destination: `${BASE_API}/getProducts`,
      },
      {
        source: "/api/addcart",
        destination: `${BASE_API}/addTOCart`,
      },
      {
        source: "/api/getTax",
        destination: `${BASE_API}/calculateTax`,
      },
      {
        source: "/api/shipping",
        destination: `${BASE_API}/updateshipping`,
      },

      {
        source: "/api/createOrder",
        destination: `${BASE_API}/orderCreatedNext`,
      },
      {
        source: "/api/verifyRazor",
        destination: `${BASE_API}/verifyRazor`,
      },
      {
        source: "/api/paymentNotify",
        destination: `${BASE_API}/paymentNotify`,
      },
      {
        source: "/api/cartRemove",
        destination: `${BASE_API}/cartRemove`,
      },
      {
        source: "/api/applyCoupon",
        destination: `${BASE_API}/applyCoupon`,
      },
      {
        source: "/api/orderTracking",
        destination: `${BASE_API}/orderTracking`,
      },

      // 🔐 These remain constant — always live
      {
        source: "/api/login",
        destination: "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      },
      {
        source: "/api/pincode",
        destination:
          "https://marketplace.yuukke.com/api/v1/Marketv2/uservalidatepincode",
      },
      {
        source: "/api/odopregister",
        destination:
          "https://marketplace.betalearnings.com/api/v1/Marketv2/odopRegister",
      },
    ];
  },
};

export default nextConfig;
