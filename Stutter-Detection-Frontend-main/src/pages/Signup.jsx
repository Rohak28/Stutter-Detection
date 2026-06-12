"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { GoogleLogin } from '@react-oauth/google'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  User,
  UserCog,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Mic,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Shield,
  Check
} from "lucide-react"

export default function Signup() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState("patient")
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { signup, googleLogin } = useAuth()
  const navigate = useNavigate()

  const passwordStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    try {
      setError("")
      setLoading(true)
      await signup(name, email, password, userType)
      // Redirect SLPs to profile page, patients to login
      if (userType === "slp") {
        navigate("/slp-profile")
      } else {
        navigate("/login")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !userType) {
      setError("Please select a user type")
      return
    }
    if (step === 2 && (!name || !email)) {
      setError("Please fill in all fields")
      return
    }
    setError("")
    setStep(step + 1)
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
  }

  const steps = [
    { number: 1, title: "Account Type" },
    { number: 2, title: "Personal Info" },
    { number: 3, title: "Security" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Steps & Illustration */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-secondary/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary mb-6">
              <Mic className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-display mb-4">
              Join <span className="gradient-text">StutterSense</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Start your journey to better speech analysis with AI-powered insights.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="glass rounded-2xl p-8 w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-6">
              {steps.map((s, index) => (
                <motion.div
                  key={s.number}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step > s.number
                        ? "bg-success text-white"
                        : step === s.number
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                  </div>
                  <div>
                    <p className={`font-medium ${step >= s.number ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </p>
                    {step === s.number && (
                      <motion.p
                        className="text-sm text-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Current step
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {["Free to Start", "No Credit Card", "Cancel Anytime"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-display gradient-text">StutterSense</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold font-display mb-2">Create Account</h2>
            <p className="text-muted-foreground mb-8">
              Step {step} of {steps.length}: {steps[step - 1].title}
            </p>
          </motion.div>

          {/* Mobile Progress */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s) => (
                <div
                  key={s.number}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.number
                      ? "bg-success text-white"
                      : step === s.number
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Label className="text-base font-medium mb-4 block">Select your account type</Label>
                  <div className="grid gap-4">
                    <motion.button
                      type="button"
                      onClick={() => setUserType("patient")}
                      className={`flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                        userType === "patient"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-3 rounded-xl ${userType === "patient" ? "bg-primary text-white" : "bg-muted"}`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Patient</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Track your speech progress, view analysis results, and connect with therapists.
                        </p>
                      </div>
                      {userType === "patient" && (
                        <CheckCircle2 className="h-6 w-6 text-primary ml-auto flex-shrink-0" />
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => setUserType("slp")}
                      className={`flex items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                        userType === "slp"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-3 rounded-xl ${userType === "slp" ? "bg-primary text-white" : "bg-muted"}`}>
                        <UserCog className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Speech-Language Pathologist</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Access detailed analysis, manage patients, and provide professional feedback.
                        </p>
                      </div>
                      {userType === "slp" && (
                        <CheckCircle2 className="h-6 w-6 text-primary ml-auto flex-shrink-0" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Security */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {/* Password Strength */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: {passwordStrength() > 0 ? strengthLabels[passwordStrength() - 1] : "Enter password"}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12 rounded-xl border-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-12 rounded-xl btn-premium text-white"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl btn-premium text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Create Account
                    </span>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or sign up with</span>
            </div>
          </div>

          <motion.div
            className="flex justify-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setError("")
                  setLoading(true)
                  const user = await googleLogin(credentialResponse.credential, userType || 'patient')
                  if (user.userType === "slp") {
                    navigate("/slp-profile")
                  } else {
                    navigate("/login")
                  }
                } catch (error) {
                  setError(error.message || "Google Signup failed")
                } finally {
                  setLoading(false)
                }
              }}
              onError={() => setError("Google Signup Failed")}
              useOneTap
            />
          </motion.div>

          {/* Login Link */}
          <motion.p
            className="mt-8 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
              <ArrowRight className="inline h-4 w-4 ml-1" />
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
