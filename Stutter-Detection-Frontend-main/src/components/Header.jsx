"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { 
  Mic, 
  FileText, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X,
  ChevronDown,
  Home,
  History,
  Settings,
  Stethoscope,
  UserCog,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { useTheme } from "../contexts/ThemeContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NotificationBell from "./NotificationBell"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, userType, isAdmin } = useAuth()
  const { language, setLanguage } = useLanguage()
  const { theme, toggleTheme, isDark } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    // For SLPs only - Dashboard (between Home and Analyze)
    ...(currentUser && userType === "slp" ? [
      { path: "/slp-dashboard", label: "Dashboard", icon: LayoutDashboard, protected: true }
    ] : []),
    { path: "/analyze", label: "Analyze", icon: Mic, protected: true },
    // For patients only - Find SLP
    ...(currentUser && userType === "patient" ? [
      { path: "/find-slp", label: "Find SLP", icon: Stethoscope, protected: true }
    ] : []),
    // Admin Panel - visible only to admin users
    ...(currentUser && isAdmin ? [
      { path: "/admin", label: "Admin Panel", icon: ShieldCheck, protected: true }
    ] : []),
    { path: "/documentation", label: "Docs", icon: FileText },
  ]

  const NavLink = ({ path, label, icon: Icon }) => {
    const isActive = location.pathname === path
    return (
      <Link
        to={path}
        className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
          isActive 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
          isActive ? "w-1/2" : "w-0 group-hover:w-1/4"
        }`} />
      </Link>
    )
  }

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled 
            ? "glass border-b shadow-lg shadow-black/5" 
            : "bg-background/80 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-6">
              {/* Partner Logos - Desktop */}
              <div className="hidden lg:flex items-center gap-4">
                <motion.img 
                  src="/Images/viit-logo.png" 
                  alt="VIIT Logo" 
                  className="h-9 w-auto opacity-80 hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                />
                <motion.img 
                  src="/Images/dassault-logo.png" 
                  alt="Dassault Logo" 
                  className="h-9 w-auto opacity-80 hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                />
              </div>

              {/* Main Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  className="relative p-2 rounded-xl bg-gradient-to-br from-primary to-secondary"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="h-5 w-5 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold font-display gradient-text">
                    StutterSense
                  </span>
                  <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
                    AI-Powered Speech Analysis
                  </span>
                </div>
              </Link>
            </div>

            {/* Center - Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                (!link.protected || currentUser) && (
                  <NavLink key={link.path} {...link} />
                )
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Language Selector — only on Privacy & Policy page */}
              {location.pathname === "/privacy" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hidden sm:flex items-center gap-1 text-sm"
                    >
                      <span className="text-lg">
                        {language === "en" ? "🇺🇸" : language === "hi" ? "🇮🇳" : "🇮🇳"}
                      </span>
                      <span className="hidden md:inline">
                        {language === "en" ? "EN" : language === "hi" ? "हि" : "म"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
                    <DropdownMenuItem onClick={() => setLanguage("en")}>
                      <span className="mr-2">🇺🇸</span> English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("hi")}>
                      <span className="mr-2">🇮🇳</span> हिंदी
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("mr")}>
                      <span className="mr-2">🇮🇳</span> मराठी
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="relative p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-slate-700" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Notification Bell - for logged in users */}
              {currentUser && <NotificationBell />}

              {/* Auth Buttons / User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all border border-primary/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                        {currentUser.name?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium hidden md:block">
                        {currentUser.name?.split(" ")[0] || "User"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </motion.button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 glass">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">
                          {currentUser.name || currentUser.email}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit">
                          {userType === 'admin' ? "🛡️ Admin" : userType === 'slp' ? "🩺 Therapist (SLP)" : "👤 Patient"}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userType === "slp" && (
                      <DropdownMenuItem onClick={() => navigate("/slp-profile")}>
                        <UserCog className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                    )}
                    {userType === "slp" && (
                      <DropdownMenuItem onClick={() => navigate("/slp-dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-violet-500" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    {userType === "patient" && (
                      <DropdownMenuItem onClick={() => navigate("/history")}>
                        <History className="mr-2 h-4 w-4" />
                        History
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className="font-medium"
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm"
                    className="btn-premium text-white font-medium"
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isMobileMenuOpen ? "close" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 glass border-b overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                (!link.protected || currentUser) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              ))}
              
              {!currentUser && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 btn-premium text-white">
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
