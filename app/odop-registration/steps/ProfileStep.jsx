import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const STORAGE_KEY = "businessInfo";

const ProfileStep = ({ nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    pincode: "",
    state: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  // Load stored data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored form data", e);
      }
    }
  }, []);

  // Update localStorage on change
  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleContinue = () => {
    const newErrors = {};

    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be 6 digits.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});

      // ✅ Console the data before saving
      console.log("📦 Form Data to be stored:", formData);

      // ✅ Save to localStorage
      localStorage.setItem("businessInfo", JSON.stringify(formData));

      nextStep();
    }
  };

  return (
    <div className="font-odop w-full max-w-xl mx-auto mt-10 px-4 py-8 bg-white rounded-xl -translate-y-28">
      <div className="text-left mb-8">
        <h1 className="text-2xl font-bold text-[#6B1D1D] mb-1">
          Business Information
        </h1>
        <p className="text-sm text-gray-500">
          Tell us about your sustainable business
        </p>
      </div>

      {/* Form Fields */}
      {[
        { label: "Business Name", key: "businessName" },
        { label: "Address", key: "address" },
        { label: "Pincode", key: "pincode", type: "number" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
      ].map(({ label, key, type = "text" }) => (
        <div key={key} className="mb-4 text-left">
          <label
            htmlFor={key}
            className="block text-sm font-medium text-[#6B1D1D] mb-1"
          >
            {label}
          </label>
          <input
            type={type}
            id={key}
            value={formData[key]}
            onChange={(e) => {
              const value = e.target.value;
              if (key === "pincode") {
                if (/^\d{0,6}$/.test(value)) {
                  handleChange(key, value);
                }
              } else {
                handleChange(key, value);
              }
            }}
            placeholder={
              key === "businessName"
                ? "e.g., Eco Threads Co."
                : key === "address"
                ? "123 Green Street, Near Eco Park"
                : key === "pincode"
                ? "Enter 6-digit pincode"
                : key === "city"
                ? "e.g., Bengaluru"
                : key === "state"
                ? "e.g., Karnataka"
                : ""
            }
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              errors[key]
                ? "border-red-500 focus:ring-red-500"
                : "border-transparent"
            }`}
          />
          {errors[key] && (
            <p className="text-sm text-red-600 mt-1">{errors[key]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent text-[#6B1D1D] hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B1D1D] text-white hover:bg-red-900 transition"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;
