import { useState } from "react";
import { ArrowLeft, Check, Shield } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { toast } from "react-toastify";

const SignUpStep = ({ nextStep, prevStep }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [errors, setErrors] = useState({ name: "", phoneNumber: "" });
  const [verified, setVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const validateAndSend = async () => {
    const newErrors = {
      name: name.trim() === "" ? "Name is required" : "",
      phoneNumber:
        phoneNumber.trim() === ""
          ? "Phone number is required"
          : phoneNumber.trim().length !== 10
          ? "Phone number must be exactly 10 digits"
          : "",
    };

    setErrors(newErrors);

    const isValid = Object.values(newErrors).every((error) => error === "");
    if (!isValid) return;

    setIsSending(true); // Start loader
    try {
      const response = await fetch(`/api/send-otp?phone=${phoneNumber}`, {
        method: "GET",
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!response.ok || data?.data?.status === "error") {
        const errorMessage =
          data?.data?.message ||
          data?.error ||
          data?.message ||
          "Failed to send OTP";

        toast.error(errorMessage);
        return;
      }

      localStorage.setItem("userName", name);
      localStorage.setItem("userPhone", `91${phoneNumber}`);

      setStep(2);
    } catch (error) {
      console.error("OTP error:", error);
      alert("Failed to send OTP. Try again.");
    } finally {
      setTimeout(() => {
        setIsSending(false); // Stop loader
      }, 2000);
    }
  };

  const handleVerify = async () => {
    if (code.trim() === "") {
      setOtpError("OTP is required");
      return;
    }

    setIsVerifying(true);

    try {
      const storedPhone = localStorage.getItem("userPhone");

      const response = await fetch(
        `https://marketplace.betalearnings.com/api/v1/Marketv2/verifyotp/${code}/${storedPhone}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data?.data?.status === "error") {
        const errorMessage =
          data?.data?.message ||
          data?.error ||
          data?.message ||
          "OTP verification failed";
        throw new Error(errorMessage);
      }

      // 🕐 Dramatic pause before moving on
      setTimeout(() => {
        setVerified(true);
        setOtpError("");
        nextStep();
      }, 2000);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setOtpError("Invalid OTP. Please try again." || error.message);
    } finally {
      // 🕐 Dramatic pause before moving on
      setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      console.log("Back clicked");
    }
  };

  return (
    <div className="font-odop w-full max-w-md mx-auto mt-10 px-4 py-8 bg-white -translate-y-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-[700] mb-1 text-[#391414]">
          {step === 1 ? "Create Your Account" : "Verify Your Phone"}
        </h1>
        <p className="text-gray-500 text-sm">
          {step === 1
            ? "Join the marketplace revolution"
            : `We sent a code to ${phoneNumber}`}
        </p>
      </div>

      {step === 1 ? (
        <>
          {/* Name Field */}
          <div className="mb-4 text-left">
            <label
              htmlFor="name"
              className="block text-[0.875rem] font-medium text-[#6B1D1D] mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className={`w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500"
                  : "border-transparent focus:ring-red-800"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="mb-2 text-left">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[#6B1D1D] mb-1"
            >
              Phone Number
            </label>

            <div className="flex items-center border border-transparent rounded-2xl focus-within:ring-2 focus-within:ring-red-800 overflow-hidden">
              <span className="px-3 text-sm text-gray-700 border-r border-gray-300">
                +91
              </span>
              <input
                id="phoneNumber"
                type="tel"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                onBlur={() => {
                  if (phoneNumber.length < 10) {
                    setErrors((prev) => ({
                      ...prev,
                      phoneNumber: "Please enter a valid 10-digit number",
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      phoneNumber: "",
                    }));
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-4 py-2 text-sm focus:outline-none ${
                  errors.phoneNumber ? "border border-transparent" : ""
                }`}
              />
            </div>

            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1 mb-4 text-left">
            We'll send a verification code to this number.
          </p>
        </>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-white bg-gray-900 rounded-full p-3" />
          </div>

          <p className="text-sm text-center mb-2 text-gray-600">
            Enter the 6-digit code we sent to your phone
          </p>

          <label
            htmlFor="verification"
            className="block text-sm font-medium text-[#6B1D1D] mb-1 mt-6 text-left"
          >
            Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (otpError) setOtpError("");
            }}
            placeholder="0 0 0 0 0 0"
            className={`w-full px-4 py-2 text-center text-sm border rounded-xl focus:outline-none focus:ring-2 mb-1 ${
              otpError
                ? "border-red-500 focus:ring-red-800"
                : "border-transparent focus:ring-red-800"
            }`}
          />

          {otpError && (
            <p className="text-xs text-left text-red-600 mb-4">{otpError}</p>
          )}

          <button
            className="text-sm px-8 py-2 rounded-xl bg-transparent text-[#6B1D1D] hover:bg-gray-200 transition mb-4"
            onClick={() => setStep(1)}
          >
            Change phone number
          </button>
        </>
      )}

      <div className="flex justify-between mt-10 text-sm">
        <button
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-transparent text-[#6B1D1D] hover:bg-gray-200 transition"
          onClick={handleBack}
        >
          <ArrowLeft />
          Back
        </button>

        {step === 1 ? (
          <button
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-[#6B1D1D] text-white hover:bg-red-900 transition min-w-[180px] disabled:opacity-60"
            onClick={validateAndSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                Send Code <Shield className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-[#6B1D1D] text-white hover:bg-red-900 transition min-w-[180px] disabled:opacity-60"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue <Check size={18} className="ml-1" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUpStep;
