import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"

const tourSteps = [
  {
    target: "home",
    title: "Welcome",
    content: "Welcome to StutterSense! This is your dashboard for powerful speech analysis.",
    position: "bottom",
  },
  {
    target: "analyze",
    title: "Analyze",
    content: "Upload or record speech samples here for in-depth AI analysis.",
    position: "right",
  },
  {
    target: "results",
    title: "Results",
    content: "View detailed results and insights about your speech patterns.",
    position: "left",
  },
  {
    target: "documentation",
    title: "Documentation",
    content: "Explore our comprehensive documentation to learn more.",
    position: "top",
  },
]

function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTourActive, setIsTourActive] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isTourActive) {
      const targetElement = document.getElementById(tourSteps[currentStep].target)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setPosition(getPosition(rect, tourSteps[currentStep].position))
      }
    }
  }, [currentStep, isTourActive])

  const getPosition = (rect, position) => {
    switch (position) {
      case "top":
        return { top: rect.top - 10, left: rect.left + rect.width / 2 }
      case "bottom":
        return { top: rect.bottom + 10, left: rect.left + rect.width / 2 }
      case "left":
        return { top: rect.top + rect.height / 2, left: rect.left - 10 }
      case "right":
        return { top: rect.top + rect.height / 2, left: rect.right + 10 }
      default:
        return { top: rect.bottom + 10, left: rect.left + rect.width / 2 }
    }
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsTourActive(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setIsTourActive(false)
  }

  const startTour = () => {
    setCurrentStep(0)
    setIsTourActive(true)
  }

  if (!isTourActive) {
    return (
      <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50" onClick={startTour}>
        <HelpCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          transform: "translate(-50%, -50%)",
        }}
        className="bg-white text-foreground p-6 rounded-lg shadow-2xl z-50 max-w-sm w-full border border-primary/20"
      >
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleSkip}>
          <X className="h-4 w-4" />
        </Button>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-2xl font-semibold mb-2 gradient-text">{tourSteps[currentStep].title}</h3>
          <p className="mb-4 text-muted-foreground">{tourSteps[currentStep].content}</p>
        </motion.div>
        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {tourSteps.length}
          </span>
          <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GuidedTour

