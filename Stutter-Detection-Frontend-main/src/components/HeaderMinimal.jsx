"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Mic, FileText, LogOut, User, Moon, Sun, Menu, X,
  ChevronDown, Home, History, Settings, Stethoscope,
  UserCog, ShieldCheck, LayoutDashboard,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import NotificationBell from "./NotificationBell"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import "./HeaderMinimal.css"

function HeaderMinimal() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, userType, isAdmin } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const doLogout = async () => {
    try { await logout(); navigate("/login") }
    catch (e) { console.error(e) }
  }

  const links = [
    { to: "/", label: "Home" },
    ...(currentUser && userType === "slp" ? [{ to: "/slp-dashboard", label: "Dashboard", auth: true }] : []),
    { to: "/analyze", label: "Analyze", auth: true },
    ...(currentUser && userType === "patient" ? [{ to: "/find-slp", label: "Find SLP", auth: true }] : []),
    ...(currentUser && isAdmin ? [{ to: "/admin", label: "Admin", auth: true }] : []),
    { to: "/documentation", label: "Docs" },
  ]

  const iconMap = { "/": Home, "/slp-dashboard": LayoutDashboard, "/analyze": Mic, "/find-slp": Stethoscope, "/admin": ShieldCheck, "/documentation": FileText }

  return (
    <>
      <div className="hm-dock">
        <motion.div
          className={`hm-bar${scrolled ? " scrolled" : ""}`}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
        >
          {/* Logo */}
          <Link to="/" className="hm-logo">
            <div className="hm-logo-icon"><Mic size={17} /></div>
            <span className="hm-logo-text">StutterSense</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hm-nav">
            {links.map(l => (
              (!l.auth || currentUser) && (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`hm-link${location.pathname === l.to ? " active" : ""}`}
                >
                  {l.label}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="hm-actions">
            {/* Theme */}
            <button className="hm-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? "d" : "l"}
                  initial={{ y: -14, opacity: 0, rotate: -60 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 14, opacity: 0, rotate: 60 }}
                  transition={{ duration: 0.18 }}
                >
                  {isDark ? <Sun size={17} className="text-yellow-500" /> : <Moon size={17} className="text-slate-600" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notifications */}
            {currentUser && <NotificationBell />}

            {/* Auth */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hm-user-pill">
                    <div className="hm-avatar">
                      {currentUser.name?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hm-user-name hidden md:inline">
                      {currentUser.name?.split(" ")[0] || "User"}
                    </span>
                    <ChevronDown size={12} className="hm-chevron hidden md:inline" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-foreground">
                        {currentUser.name || currentUser.email}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit">
                        {userType === "admin" ? "🛡️ Admin" : userType === "slp" ? "🩺 Therapist" : "👤 Patient"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userType === "slp" && (
                    <DropdownMenuItem onClick={() => navigate("/slp-profile")}>
                      <UserCog className="mr-2 h-4 w-4" /> My Profile
                    </DropdownMenuItem>
                  )}
                  {userType === "slp" && (
                    <DropdownMenuItem onClick={() => navigate("/slp-dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <ShieldCheck className="mr-2 h-4 w-4 text-violet-500" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  {userType === "patient" && (
                    <DropdownMenuItem onClick={() => navigate("/history")}>
                      <History className="mr-2 h-4 w-4" /> History
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={doLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hm-auth">
                <Link to="/login" className="hm-auth-login">Log in</Link>
                <Link to="/signup" className="hm-auth-signup">Get Started</Link>
              </div>
            )}

            {/* Mobile Burger */}
            <button className="hm-icon-btn hm-burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? "x" : "m"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="hm-mobile-overlay" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="hm-mobile-sheet"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {links.map(l => {
                if (l.auth && !currentUser) return null
                const Icon = iconMap[l.to] || FileText
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`hm-mobile-link${location.pathname === l.to ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    {l.label}
                  </Link>
                )
              })}
              {!currentUser && (
                <>
                  <div className="hm-mobile-divider" />
                  <div className="hm-mobile-auth">
                    <Link to="/login" className="hm-mobile-auth-login" onClick={() => setMobileOpen(false)}>Log in</Link>
                    <Link to="/signup" className="hm-mobile-auth-signup" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default HeaderMinimal
