"use client"

import { GoogleLogin } from '@react-oauth/google';

import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  AlertCircle, 
  LogIn, 
  User, 
  UserCog, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Mic,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState("patient")
  const [showPassword, setShowPassword] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/"

  const [accuracy, setAccuracy] = useState("98.5%")

  useEffect(() => {
    const handleConfigUpdate = (e) => {
      const detail = e.detail || {}
      setAccuracy(detail.stat_detection_accuracy || "98.5%")
    }
    const stored = localStorage.getItem("_app_config")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAccuracy(parsed.stat_detection_accuracy || "98.5%")
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener("app_config_update", handleConfigUpdate)
    return () => window.removeEventListener("app_config_update", handleConfigUpdate)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setError("")
      setLoading(true)
      const user = await login(email, password, userType)
      if (user.userType === "admin") {
        navigate("/admin", { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary mb-6">
              <Mic className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-display mb-4">
              Welcome Back to{" "}
              <span className="gradient-text">StutterSense</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Continue your speech analysis journey with AI-powered insights and progress tracking.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-3xl p-8 max-w-sm"
          >
            <img 
              src="/Images/therapy-1.jpg" 
              alt="Speech Therapy" 
              className="rounded-2xl w-full h-auto shadow-lg"
            />
          </motion.div>

          {/* Features List */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[`${accuracy} Accuracy`, "Real-time Analysis", "Progress Tracking"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-3xl font-bold font-display mb-2">Sign In</h2>
            <p className="text-muted-foreground mb-8">
              Enter your credentials to access your account
            </p>
          </motion.div>

          {/* User Type Toggle */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="text-sm font-medium mb-3 block">I am a</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserType("patient")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === "patient"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType("slp")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === "slp"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                <UserCog className="h-5 w-5" />
                <span className="font-medium">Therapist (SLP)</span>
              </button>
            </div>
          </motion.div>

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

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
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
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl btn-premium text-white text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
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
                  const user = await googleLogin(credentialResponse.credential, userType)
                  navigate(from, { replace: true })
                } catch (error) {
                  setError(error.message || "Google Login failed")
                } finally {
                  setLoading(false)
                }
              }}
              onError={() => setError("Google Login Failed")}
              useOneTap
            />
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            className="mt-8 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create account
              <ArrowRight className="inline h-4 w-4 ml-1" />
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
