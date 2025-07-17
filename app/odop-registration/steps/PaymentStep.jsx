"use client";

import { useEffect, useState } from "react";
import { Building2, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { IconDeviceMobile } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Congratulations from "./Congrats";

const PaymentStep = ({ prevStep, onComplete }) => {
  const [method, setMethod] = useState("yuukke");
  const [bankAccount, setBankAccount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState({});
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (method === "bank") {
      if (!bankAccount.trim()) {
        newErrors.bankAccount = "Bank account number is required.";
      } else if (!/^\d{10,18}$/.test(bankAccount)) {
        newErrors.bankAccount = "Bank account number must be 10-18 digits.";
      }
    } else if (method === "upi") {
      if (!upiId.trim()) {
        newErrors.upiId = "UPI ID is required.";
      } else if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
        newErrors.upiId = "Enter a valid UPI ID (e.g. name@upi).";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) return;

    // Fetch data from localStorage
    const name = localStorage.getItem("userName") || "";
    const phoneNumber = localStorage.getItem("userPhone") || "";
    const formData = JSON.parse(localStorage.getItem("businessInfo") || "{}");
    const paymentMethod = localStorage.getItem("paymentMethod") || "";
    const bankAccount = localStorage.getItem("bankAccount") || "";
    const upiId = localStorage.getItem("upiId") || "";

    // Build payload
    const payload = {
      firstname: name,
      phone_no: Number(phoneNumber),
      store_name: formData.businessName || "",
      address: formData.address || "",
      pincode: Number(formData.pincode) || "",
      state: formData.state || "",
      city: formData.city || "",
      bank_account_no: paymentMethod === "bank" ? bankAccount : "",
      upi_id: paymentMethod === "upi" ? upiId : "",
    };

    try {
      const res = await fetch("/api/odopregister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Registration failed:", err);
        alert("Registration failed. Please check details and try again.");
        return;
      }

      const responseData = await res.json();
      console.log("✅ Registration successful:", responseData);

      // 🪄 Extract token and store for later use
      if (responseData.data?.token) {
        localStorage.setItem("Token", responseData.data.token);
      } else {
        console.warn("⚠️ Token not found in response");
      }

      setIsSetupComplete(true);
      onComplete();
    } catch (error) {
      console.error("🔥 Unexpected error during registration:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  if (isSetupComplete) {
    return <Congratulations />;
  }

  return (
    <motion.div
      className="w-full max-w-xl mx-auto mt-10 px-4 py-8 bg-white rounded-xl -translate-y-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <div className="text-left mb-8 flex items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6B1D1D]" />
            <h1 className="text-2xl font-bold text-[#6B1D1D]">Payment Setup</h1>
          </div>
          <p className="text-sm text-gray-500">
            Secure payment setup to get paid for your sales
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6 text-left">
        <p className="text-sm font-medium text-[#6B1D1D] mb-2">
          Select Payment Method
        </p>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            id="bank"
            name="paymentMethod"
            value="bank"
            checked={method === "bank"}
            onChange={() => setMethod("bank")}
            className="accent-[#6B1D1D] w-4 h-4"
          />
          <label
            htmlFor="bank"
            className="flex items-center gap-2 text-sm text-gray-800"
          >
            <Building2 className="w-4 h-4 text-[#6B1D1D]" />
            Bank Account
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="upi"
            name="paymentMethod"
            value="upi"
            checked={method === "upi"}
            onChange={() => setMethod("upi")}
            className="accent-[#6B1D1D] w-4 h-4"
          />
          <label
            htmlFor="upi"
            className="flex items-center gap-2 text-sm text-gray-800"
          >
            <IconDeviceMobile className="w-4 h-4 text-[#6B1D1D]" />
            UPI
          </label>
        </div>
      </div>

      {/* Input Fields */}
      <div className="text-left mb-6">
        {method === "bank" ? (
          <>
            <label
              htmlFor="bankAccount"
              className="block text-sm font-medium text-[#6B1D1D] mb-1"
            >
              Bank Account Number
            </label>
            <input
              id="bankAccount"
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Enter your bank account number"
              className={`w-full px-4 py-2 border ${
                errors.bankAccount ? "border-red-500" : "border-transparent"
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.bankAccount && (
              <p className="text-xs text-red-600 mt-1">{errors.bankAccount}</p>
            )}
          </>
        ) : (
          <>
            <label
              htmlFor="upiId"
              className="block text-sm font-medium text-[#6B1D1D] mb-1"
            >
              UPI ID
            </label>
            <input
              id="upiId"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter your UPI ID"
              className={`w-full px-4 py-2 border ${
                errors.upiId ? "border-red-500" : "border-transparent"
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.upiId && (
              <p className="text-xs text-red-600 mt-1">{errors.upiId}</p>
            )}
          </>
        )}
      </div>

      {/* Security Message */}
      <div className="flex items-center gap-2 text-xs text-[#6B1D1D] bg-gray-100 p-3 rounded-2xl">
        <Lock className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-transparent text-[#6B1D1D] hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#6B1D1D] text-white hover:bg-[#501212] transition"
        >
          Complete Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
