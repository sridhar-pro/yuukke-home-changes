"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import {
  ArrowLeft,
  Mail,
  Phone,
  UserPlus,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [currentFlow, setCurrentFlow] = useState("initial");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const handleSendOTP = () => {
    setOtpSent(true);
    setCurrentFlow("otp");
  };

  const renderInitialScreen = () => (
    <motion.div
      key="initial"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-[#A00300] bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
          </motion.div>
          <CardDescription className="text-gray-600 mt-2">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={() => setCurrentFlow("mobile")}
              className="w-full h-12 bg-gradient-to-r from-black to-gray-900 text-white font-medium rounded-xl shadow-lg border-0"
            >
              <Phone className="mr-2 h-5 w-5" />
              Sign in with Mobile Number
            </Button>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={() => setCurrentFlow("email")}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-medium rounded-xl"
            >
              <Mail className="mr-2 h-5 w-5" />
              Sign in with Email
            </Button>
          </motion.div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={() => setCurrentFlow("register")}
              variant="ghost"
              className="w-full h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-xl"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              New user? Register
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMobileScreen = () => (
    <motion.div
      key="mobile"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sign in with Mobile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your mobile number to receive an OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm font-medium text-gray-700"
            >
              Mobile Number
            </Label>
            <div className="relative">
              <Input
                id="mobile"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="h-12 pl-4 pr-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
              />
            </div>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleSendOTP}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg border-0"
            >
              <Send className="mr-2 h-4 w-4" />
              Send OTP
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderOTPScreen = () => (
    <motion.div
      key="otp"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("mobile")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Enter OTP
          </CardTitle>
          <CardDescription className="text-gray-600">
            {"We've sent a 6-digit code to " + mobileNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              maxLength={6}
              className="h-12 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg border-0">
              Verify & Sign In
            </Button>
          </motion.div>

          <div className="text-center">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
            >
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEmailScreen = () => (
    <motion.div
      key="email"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sign in with Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-right">
            <Button
              variant="ghost"
              className="text-sm text-blue-600 hover:text-blue-700 p-0"
            >
              Forgot password?
            </Button>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg border-0">
              Sign In
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderRegisterScreen = () => (
    <motion.div
      key="register"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerEmail"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </Label>
            <Input
              id="registerEmail"
              type="email"
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerMobile"
              className="text-sm font-medium text-gray-700"
            >
              Mobile Number
            </Label>
            <Input
              id="registerMobile"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl input-focus"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button className="w-full h-12 bg-gradient-to-r from-black to-gray-900 text-white font-medium rounded-xl shadow-lg border-0">
              Create Account
            </Button>
          </motion.div>

          <p className="text-xs text-gray-500 text-center">
            {"By creating an account, you agree to our "}
            <Button
              variant="ghost"
              className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
            >
              Terms of Service
            </Button>
            {" and "}
            <Button
              variant="ghost"
              className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
            >
              Privacy Policy
            </Button>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="h-[43rem] md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=800')] opacity-5"></div>

      <AnimatePresence mode="wait">
        {currentFlow === "initial" && renderInitialScreen()}
        {currentFlow === "mobile" && renderMobileScreen()}
        {currentFlow === "otp" && renderOTPScreen()}
        {currentFlow === "email" && renderEmailScreen()}
        {currentFlow === "register" && renderRegisterScreen()}
      </AnimatePresence>
    </div>
  );
}
