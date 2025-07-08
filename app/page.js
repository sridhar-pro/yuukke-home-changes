"use client";

import React from "react";
import dynamic from "next/dynamic";
import LazyLoad from "@/app/components/Loader/LazyLoad"; // Update path based on your folder structure

// 👇 Dynamically load named exports
const WobbleCardDemo = dynamic(
  () => import("./home/card").then((mod) => mod.WobbleCardDemo),
  { suspense: true }
);

const AnimatedTestimonialsDemo = dynamic(
  () =>
    import("./home/AnimatedTestimonialsDemo").then(
      (mod) => mod.AnimatedTestimonialsDemo
    ),
  { suspense: true }
);

// 👇 Default exports
const LogoSlider = dynamic(() => import("./home/LogoSlider"), {
  suspense: true,
});

const Products = dynamic(() => import("./home/Products/Page"), {
  suspense: true,
});

const ImagesSliderDemo = dynamic(
  () => import("./home/slider").then((mod) => mod.ImagesSliderDemo),
  { suspense: true }
);

// 🏁 Main Component
export default function Home() {
  return (
    <>
      <ImagesSliderDemo />

      <WobbleCardDemo />

      <Products />

      <LazyLoad fallbackHeight={300}>
        <AnimatedTestimonialsDemo />
      </LazyLoad>

      <LazyLoad fallbackHeight={200}>
        <LogoSlider />
      </LazyLoad>
    </>
  );
}
