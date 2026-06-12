"use client"
import Header from "./Header"
import HeaderMinimal from "./HeaderMinimal"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Mic, Mail, Heart } from "lucide-react"
import { useState, useEffect } from "react"

function Layout({ children }) {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()
  const location = useLocation()

  const [headerStyle, setHeaderStyle] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem("_app_config") || "{}")
      return (c.header_style === true || c.header_style === "true") ? "minimal" : "default"
    } catch { return "default" }
  })

  useEffect(() => {
    const onCfg = (e) => {
      const c = e.detail || {}
      setHeaderStyle((c.header_style === true || c.header_style === "true") ? "minimal" : "default")
    }
    window.addEventListener("app_config_update", onCfg)
    return () => window.removeEventListener("app_config_update", onCfg)
  }, [])

  const footerLinks = {
    product: [
      { label: "Features", href: "/#features", isHash: true },
      { label: "Analyze", href: "/analyze" },
      { label: "Documentation", href: "/documentation" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  }

  // Handle scrolling to the #features section on the home page
  const handleFeaturesClick = (e) => {
    e.preventDefault()
    if (location.pathname === "/") {
      // Already on home page, just scroll to the features section
      const featuresSection = document.getElementById("features")
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // Navigate to home page first, then poll for the element to appear
      navigate("/")
      // Poll every 100ms for up to 2s until the features section is rendered
      let attempts = 0
      const maxAttempts = 20
      const scrollInterval = setInterval(() => {
        attempts++
        const featuresSection = document.getElementById("features")
        if (featuresSection) {
          clearInterval(scrollInterval)
          featuresSection.scrollIntoView({ behavior: "smooth" })
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval)
        }
      }, 100)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {headerStyle === "minimal" ? <HeaderMinimal /> : <Header />}
      <main className="flex-1 relative">{children}</main>

      {/* Premium Footer */}
      <footer className="relative border-t bg-muted/30">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold font-display gradient-text">StutterSense</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered speech analysis platform for accurate stutter detection and personalized therapy insights.
              </p>
              <div className="flex gap-3">
                <motion.a
                  href="mailto:contact@stuttersense.com"
                  className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </motion.a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    {link.isHash ? (
                      <a
                        href={link.href}
                        onClick={handleFeaturesClick}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {currentYear} StutterSense. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by the StutterSense Team
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
