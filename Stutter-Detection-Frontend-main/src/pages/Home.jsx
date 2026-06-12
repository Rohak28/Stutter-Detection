"use client"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ConsentPage from "./ConsentPage"
import {
  Mic,
  BarChart2,
  FileAudio,
  ArrowRight,
  Zap,
  Award,
  Users,
  Shield,
  Sparkles,
  Play,
  ChevronRight,
  Star,
  CheckCircle2,
  Brain,
  LineChart,
  Clock,
  Globe,
  Headphones
} from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// 3D Feature Card
const FeatureCard = ({ icon: Icon, title, description, delay, gradient }) => {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateX((y - centerY) / 10)
    setRotateY((centerX - x) / 10)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className="perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div
        className="relative p-8 rounded-3xl glass border border-white/10 dark:border-white/5 overflow-hidden group cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-3xl bg-primary/20" />
        
        {/* Content */}
        <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className={`inline-flex p-4 rounded-2xl ${gradient} mb-6`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Testimonial Card
const TestimonialCard = ({ quote, author, role, rating, image, delay }) => (
  <motion.div
    className="glass p-6 rounded-2xl border border-white/10 dark:border-white/5"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
  >
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-muted-foreground mb-6 italic">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
        {author[0]}
      </div>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  </motion.div>
)

// How It Works Step
const HowItWorksStep = ({ number, title, description, icon: Icon, delay }) => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
          {number}
        </div>
        <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent mt-4" />
      </div>
      <div className="pb-12">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold font-display">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </motion.div>
)

// Floating Particles Background
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}

function Home() {
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const { isPatient } = useAuth()
  const [showConsent, setShowConsent] = useState(false)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  const [appConfigs, setAppConfigs] = useState({
    stat_detection_accuracy: "98.5%",
    stat_analysis_performed: "10,000+",
    stat_healthcare_providers: "500+",
    stat_response_time: "50ms"
  })

  useEffect(() => {
    const handleConfigUpdate = (e) => {
      const detail = e.detail || {}
      setAppConfigs(prev => ({
        ...prev,
        stat_detection_accuracy: detail.stat_detection_accuracy || "98.5%",
        stat_analysis_performed: detail.stat_analysis_performed || "10,000+",
        stat_healthcare_providers: detail.stat_healthcare_providers || "500+",
        stat_response_time: detail.stat_response_time || "50ms"
      }))
    }
    const stored = localStorage.getItem("_app_config")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAppConfigs(prev => ({
          ...prev,
          stat_detection_accuracy: parsed.stat_detection_accuracy || "98.5%",
          stat_analysis_performed: parsed.stat_analysis_performed || "10,000+",
          stat_healthcare_providers: parsed.stat_healthcare_providers || "500+",
          stat_response_time: parsed.stat_response_time || "50ms"
        }))
      } catch (e) {
        console.error(e)
      }
    }
    window.addEventListener("app_config_update", handleConfigUpdate)
    return () => window.removeEventListener("app_config_update", handleConfigUpdate)
  }, [])

  const parseStatString = (str) => {
    if (!str) return { value: 0, suffix: "" }
    const numMatch = str.match(/[\d,.]+/)
    if (!numMatch) return { value: 0, suffix: str }
    const numStr = numMatch[0]
    const val = parseFloat(numStr.replace(/,/g, ""))
    const suffix = str.replace(numStr, "")
    return { value: isNaN(val) ? 0 : val, suffix }
  }

  const statAccuracyParsed = parseStatString(appConfigs.stat_detection_accuracy)
  const statAnalysisParsed = parseStatString(appConfigs.stat_analysis_performed)
  const statProvidersParsed = parseStatString(appConfigs.stat_healthcare_providers)
  const statResponseParsed = parseStatString(appConfigs.stat_response_time)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms using OpenAI Whisper for accurate speech pattern recognition and stutter detection.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: LineChart,
      title: "Progress Tracking",
      description: "Monitor improvement over time with historical data, trend analysis, and personalized insights for therapy.",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      icon: BarChart2,
      title: "Real-Time Analytics",
      description: "Instant visual feedback with comprehensive charts showing fluency scores, disfluency patterns, and progress over time.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Support for English, Hindi, and Marathi with culturally appropriate reading passages for each language.",
      gradient: "bg-gradient-to-br from-rose-500 to-red-500",
    },
    {
      icon: FileAudio,
      title: "Precise Transcription",
      description: "Accurate speech-to-text with highlighted stuttering indicators, enabling detailed analysis of speech patterns.",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    
  ]

  const stats = [
    { value: statAccuracyParsed.value, suffix: statAccuracyParsed.suffix, label: "Detection Accuracy" },
    { value: statAnalysisParsed.value, suffix: statAnalysisParsed.suffix, label: "Analyses Performed" },
    { value: statProvidersParsed.value, suffix: statProvidersParsed.suffix, label: "Healthcare Providers" },
    { value: statResponseParsed.value, suffix: statResponseParsed.suffix, label: "Response Time" },
  ]

  const testimonials = [
    {
      quote: "StutterSense has transformed how we track patient progress. The AI-powered analysis provides insights we couldn't get before.",
      author: "Dr. Namita Joshi",
      role: "Speech-Language Pathologist",
      rating: 5,
    },
    {
      quote: "The real-time feedback helps my patients understand their speech patterns immediately. It's an invaluable therapy tool.",
      author: "Dr. Priya Sharma",
      role: "Clinical Therapist",
      rating: 5,
    },
    {
      quote: "As a parent, seeing my child's progress visualized has been incredibly encouraging. The reports are easy to understand.",
      author: "Rahul Mehta",
      role: "Parent",
      rating: 5,
    },
  ]

  const howItWorks = [
    {
      icon: Mic,
      title: "Record or Upload",
      description: "Record your speech directly in the app or upload an existing audio/video file. We support multiple formats.",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our advanced AI engine processes your speech, detecting stuttering patterns with high precision.",
    },
    {
      icon: BarChart2,
      title: "Get Insights",
      description: "Receive detailed reports with fluency scores, disfluency breakdown, and actionable recommendations.",
    },
    {
      icon: LineChart,
      title: "Track Progress",
      description: "Monitor your improvement over time with historical comparisons and trend analysis.",
    },
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
        <ParticleBackground />
        
        {/* Animated Background Blobs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.div style={{ y, opacity }} className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Speech Analysis Platform</span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Transform Your{" "}
                <span className="gradient-text">Speech Journey</span>{" "}
                with AI
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Harness cutting-edge artificial intelligence to analyze speech patterns, 
                detect stuttering with {appConfigs.stat_detection_accuracy} accuracy, and unlock personalized insights 
                for transformative speech therapy outcomes.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="btn-premium text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/25"
                  onClick={() => {
                    if (isPatient) {
                      setShowConsent(true);
                    } else {
                      navigate("/analyze");
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    Start Free Analysis
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {/*
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>HIPAA Compliant</span>
                </div>
                */}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-success" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-5 w-5 text-success" />
                  <span>Real-time Analysis</span>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Hero Visual */}
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main Image Container */}
                <motion.div
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 dark:border-white/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="/Images/therapy-1.jpg"
                    alt="Speech Therapy Session"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>

{/*
<Floating Stats Card />
<motion.div
  className="absolute -bottom-6 -right-6 glass p-5 rounded-2xl shadow-xl border border-white/20"
  animate={{ y: [0, -10, 0] }}
  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
>
  <div className="flex items-center gap-4">
    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
      <Award className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Accuracy Rate
      </p>
      <p className="text-2xl font-bold gradient-text">{appConfigs.stat_detection_accuracy}</p>
    </div>
  </div>
</motion.div>
*/}

                {/* Floating Users Card */}
                <motion.div
                  className="absolute -top-4 -left-4 glass p-4 rounded-2xl shadow-xl border border-white/20 hidden md:block"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white flex items-center justify-center text-white text-xs">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">10K+ Users</p>
                      <p className="text-xs text-muted-foreground">Active this month</p>
                    </div>
                  </div>
                </motion.div>

                {/* Background Decorations */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-3xl" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Everything You Need for{" "}
              <span className="gradient-text">Speech Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools healthcare providers and patients need for effective stutter detection and therapy.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <FeatureCard {...feature} delay={index * 0.1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                  Simple Process
                </span>
                <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
                  How It <span className="gradient-text">Works</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get started with StutterSense in minutes. Our intuitive platform makes speech analysis accessible to everyone.
                </p>
              </motion.div>

              <div>
                {howItWorks.map((step, index) => (
                  <HowItWorksStep
                    key={step.title}
                    number={index + 1}
                    {...step}
                    delay={index * 0.15}
                  />
                ))}
              </div>
            </div>

            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="glass rounded-3xl p-8 border border-white/10">
                  <img
                    src="/Images/slp-pro.jpg"
                    alt="Professional Using StutterSense"
                    className="rounded-2xl w-full h-auto shadow-lg"
                  />
                </div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Trusted by <span className="gradient-text">Healthcare Professionals</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what speech-language pathologists and therapists are saying about StutterSense.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold font-display mb-2">
              Our <span className="gradient-text">Collaborations</span>
            </h3>
            <p className="text-muted-foreground">
              Trusted partnerships driving innovation in speech technology
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.img
              src="/Images/viit-logo.png"
              alt="VIIT"
              className="h-16 w-auto opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              whileHover={{ scale: 1.1 }}
            />
            <motion.img
              src="/Images/dassault-logo.png"
              alt="Dassault Systèmes"
              className="h-16 w-auto opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              whileHover={{ scale: 1.1 }}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90" />
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">
              Ready to Transform Speech Therapy?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals using StutterSense for accurate stutter detection and personalized therapy insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-2xl shadow-lg"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  Get Started Free
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
//                variant="outline"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-2xl shadow-lg"
              >
                <Link to="/contact" className="flex items-center gap-2">
                  Contact Sales
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Patient Consent Modal */}
      {showConsent && (
        <ConsentPage
          onAccept={() => {
            setShowConsent(false);
            navigate("/analyze", { state: { consentAccepted: true } });
          }}
          onCancel={() => setShowConsent(false)}
        />
      )}
    </div>
  )
}

export default Home


