// components/FullScreenLoader.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "@/public/loader.json";

const FullScreenLoader = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }} // fade out duration
        >
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 100, width: 100 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoader;
