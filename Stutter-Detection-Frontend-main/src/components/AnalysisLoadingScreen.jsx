"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, Loader2, BrainCircuit } from "lucide-react"

const AnalysisLoadingScreen = ({ error }) => {
  const [loadingText, setLoadingText] = useState("Initializing analysis...")
  const [progress, setProgress] = useState(0)

  // Simulate progress for visual feedback
  useEffect(() => {
    const steps = [
      { text: "Initializing analysis...", time: 0 },
      { text: "Processing audio data...", time: 2000 },
      { text: "Detecting speech patterns...", time: 5000 },
      { text: "Analyzing fluency...", time: 8000 },
      { text: "Generating insights...", time: 11000 },
      { text: "Finalizing results...", time: 14000 },
    ]

    // Update loading text based on time
    steps.forEach((step) => {
      const timer = setTimeout(() => {
        setLoadingText(step.text)
      }, step.time)
      return () => clearTimeout(timer)
    })

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95 // Cap at 95% to indicate we're still waiting for server
        }
        return prev + (95 - prev) * 0.05
      })
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Audio wave animation
  const waveVariants = {
    animate: {
      y: [0, -10, 0, 10, 0],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
      <div className="max-w-md w-full bg-white/50 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-primary/20">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="relative bg-primary text-white p-4 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <BrainCircuit size={40} />
            </motion.div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">{loadingText}</h2>
        <p className="text-center text-muted-foreground mb-6">Our AI is carefully analyzing your speech patterns</p>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "5%" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>

        {/* Audio wave visualization */}
        <div className="flex justify-center items-center space-x-1 mb-6">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-primary rounded-full"
              style={{ height: `${Math.max(15, Math.min(40, 15 + Math.sin(i / 2) * 25))}px` }}
              variants={waveVariants}
              animate="animate"
              custom={i}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>

        {/* Tips carousel */}
        <motion.div
          className="bg-primary/10 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h3 className="font-medium text-primary mb-1 flex items-center">
            <Mic className="w-4 h-4 mr-2" /> Did you know?
          </h3>
          <p className="text-sm text-muted-foreground">
            Regular speech practice with feedback can significantly improve fluency over time.
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-destructive/10 text-destructive p-4 rounded-lg mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1">We're retrying automatically...</p>
          </motion.div>
        )}

        <div className="flex items-center justify-center mt-6">
          <Loader2 className="w-5 h-5 text-primary mr-2 animate-spin" />
          <span className="text-sm text-muted-foreground">Processing may take up to a minute</span>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AnalysisLoadingScreen

