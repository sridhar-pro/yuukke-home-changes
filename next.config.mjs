/** @type {import('next').NextConfig} */

const BASE_API = "https://marketplace.betalearnings.com/api/v1/Marketv2";
const LIVE_API = "https://marketplace.yuukke.com/api/v1/Marketv2";

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

  i18n: {
    locales: ["en", "ta"],
    defaultLocale: "en",
    localeDetection: false,
  },

  async rewrites() {
    return [
      {
        source: "/api/giftBox",
        destination: `${LIVE_API}/giftBox`,
      },
      {
        source: "/api/addGiftCard",
        destination: `${LIVE_API}/addGiftCard`,
      },
      {
        source: "/api/addGiftAddons",
        destination: `${LIVE_API}/giftAddons`,
      },
      {
        source: "/api/homeCategory",
        destination: `${LIVE_API}/homeCategory`,
      },
      {
        source: "/api/quantityCheck",
        destination: `${LIVE_API}/getProductDetails/`,
      },
      {
        source: "/api/slider",
        destination: `${LIVE_API}/slider`,
      },
      {
        source: "/api/mobslider",
        destination: `${LIVE_API}/mobile_slider`,
      },
      {
        source: "/api/newarrival",
        destination: `${LIVE_API}/newArraivals`,
      },
      {
        source: "/api/featuredproducts",
        destination: `${LIVE_API}/featuredProducts`,
      },
      {
        source: "/api/festivalproducts",
        destination: `${LIVE_API}/festivalProducts`,
      },
      {
        source: "/api/wellnessproducts",
        destination: `${LIVE_API}/wellnessProducts`,
      },
      {
        source: "/api/giftproducts",
        destination: `${LIVE_API}/getGiftsProducts`,
      },
      {
        source: "/api/corporategiftproducts",
        destination: `${LIVE_API}/getCorporateGifts`,
      },
      {
        source: "/api/returngiftproducts",
        destination: `${LIVE_API}/getReturnGifts`,
      },
      { source: "/api/vendorlogo", destination: `${LIVE_API}/vendorLogo` },
      {
        source: "/api/getNews",
        destination: `${LIVE_API}/getNews`,
      },
      {
        source: "/api/getProducts",
        destination: `${LIVE_API}/getProducts`,
      },
      {
        source: "/api/addcart",
        destination: `${LIVE_API}/addTOCart`,
      },
      {
        source: "/api/login",
        destination: "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      },
      {
        source: "/api/pincode",
        destination:
          "https://marketplace.yuukke.com/api/v1/Marketv2/uservalidatepincode",
      },
    ];
  },
};

export default nextConfig;
