"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, ArrowRight, Leaf, Heart, Truck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignUpStep from "./steps/SignUpStep";
import ProfileStep from "./steps/ProfileStep";
import PaymentStep from "./steps/PaymentStep";
import StepIndicator from "./StepIndicator";
import clsx from "clsx";

const steps = ["Sign Up", "Profile", "Payment"];

const MultiStepForm = () => {
  const [showWhy, setShowWhy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hideStepIndicator, setHideStepIndicator] = useState(false);

  const modalRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowWhy(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [currentStep, setCurrentStep] = useState(-1); // -1 means pre-start

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isMobile = window.innerWidth < 640;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SignUpStep nextStep={nextStep} />;
      case 1:
        return <ProfileStep nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return (
          <PaymentStep
            prevStep={prevStep}
            onComplete={() => setHideStepIndicator(true)} // 🎯 this hides stepper
          />
        );
      default:
        return (
          <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden -translate-y-16">
            {/* 🍃 Decorative Leaves with Motion */}
            {[
              { top: "top-24", left: "left-[0rem]" },
              { top: "top-56", left: "left-[6rem]" },
              { top: "top-16", right: "right-[4rem]" },
              { top: "top-40", right: "right-[3rem]" },
            ].map((pos, idx) => (
              <motion.div
                key={idx}
                className={`absolute bounce-opacity ${pos.top} ${
                  pos.left || pos.right
                } text-[#6B1D1D]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
              >
                <Leaf size={22} />
              </motion.div>
            ))}

            {/* 🎯 Hero Text */}
            <motion.div
              className="text-center p-6 space-y-6 max-w-3xl z-10 -translate-y-24 md:-translate-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[2.50rem] font-bold text-[#411111]">
                Welcome to <span className="text-[#6B1D1D]">Yuukke</span>
              </h1>
              <h4 className="text-[1.60rem] font-semibold text-[#3F1F1F]">
                The Marketplace for Conscious Sellers
              </h4>
              <p className="text-gray-600">
                Reach conscious buyers and grow your sustainable business
                effortlessly.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="bg-[#6B1D1D] hover:bg-[#551414] text-white px-24 py-3 cursor-pointer rounded-xl font-medium w-full sm:w-auto flex items-center justify-center gap-2 mx-auto transition"
              >
                <ArrowRight size={18} />
                <span>Start Onboarding</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowWhy(!showWhy)}
                className="bg-transparent hover:bg-gray-100 text-black px-20 py-3 cursor-pointer rounded-xl font-medium w-full sm:w-auto flex items-center justify-center gap-2 mx-auto transition"
              >
                <Info size={18} className="text-gray-700" />
                <span>Why Sell on Yuukke?</span>
              </motion.button>

              <p className="text-sm text-gray-500">
                Trusted by 1,000+ sustainable brands
              </p>
            </motion.div>

            {/* 🚪 Modal: Onboarding */}
            {showModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <motion.div
                  ref={modalRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                >
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setCurrentStep(1);
                    }}
                    className="absolute top-4 right-4 text-[#6B1D1D] hover:text-[#551414] transition border rounded-full p-1 bg-white"
                  >
                    <X size={16} className="text-gray-900" />
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* 🌿 Modal: Why Yuukke */}
            {showWhy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <motion.div
                  ref={modalRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                >
                  <button
                    onClick={() => setShowWhy(false)}
                    className="absolute top-4 right-4 text-[#6B1D1D] hover:text-[#551414] transition border rounded-full p-1 bg-white"
                  >
                    <X size={16} className="text-gray-900" />
                  </button>

                  <h2 className="text-2xl font-bold mb-6 text-[#6B1D1D] text-center">
                    Why Choose Yuukke?
                  </h2>

                  <ul className="space-y-6 text-gray-700 text-left">
                    {[
                      {
                        icon: <Heart className="text-[#6B1D1D]" size={20} />,
                        title: "More Eco Buyers",
                        text: "Connect with customers who actively seek sustainable products and care about the environment.",
                      },
                      {
                        icon: <Leaf className="text-[#6B1D1D]" size={20} />,
                        title: "Verified Eco Tags",
                        text: "Showcase your environmental credentials with our verified eco-certification system.",
                      },
                      {
                        icon: <Truck className="text-[#6B1D1D]" size={20} />,
                        title: "Lower Carbon Logistics",
                        text: "Use our eco-friendly shipping network with 30% lower carbon footprint.",
                      },
                    ].map((item, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                      >
                        <div className="bg-red-100 rounded-full p-2">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#160909]">
                            {item.title}
                          </h4>
                          <p>{item.text}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-6">
      {/* Step Indicator */}
      {!hideStepIndicator && currentStep >= 0 && (
        <StepIndicator currentStep={currentStep} />
      )}

      {/* Step Content */}
      <div className="w-full mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        {/* {currentStep >= 0 && currentStep < steps.length - 1 && (
          <div className="mt-8 text-center">
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default MultiStepForm;
