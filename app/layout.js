import "./globals.css";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import { AuthProvider } from "./utils/AuthContext";
import LoaderWrapper from "./components/Loader/LoaderWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MobileBottomBar from "./components/MobileBottomBar";
import ReduxProvider from "./ReduxProvider";

export const metadata = {
  title: "Yuukke",
  description:
    "Looking for conscious fashion, eco-friendly home goods, or natural beauty products? Explore our marketplace of women-owned businesses dedicated to positive change. Shop with intention and support a more sustainable future",

  openGraph: {
    title: "Yuukke",
    description:
      "Looking for conscious fashion, eco-friendly home goods, or natural beauty products? Explore our marketplace of women-owned businesses dedicated to positive change. Shop with intention and support a more sustainable future.",
    url: "https://shop.yuukke.com",
    siteName: "Yuukke",
    images: [
      {
        url: "https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/logo_for_in.jpg",
        alt: "Yuukke Marketplace - Explore Authentic Indian Products",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
        />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          <LoaderWrapper>
            <AuthProvider>
              <main className="pb-16 md:pb-0">
                <Navbar />
                {children}
                <Footer />
              </main>
              <MobileBottomBar />

              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastStyle={{
                  backgroundColor: "#ffffff",
                  color: "#333333",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
                bodyClassName="font-sans text-sm"
              />
            </AuthProvider>
          </LoaderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
