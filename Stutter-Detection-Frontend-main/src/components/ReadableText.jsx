"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import sentencesData from "@/data/sentences.json"

const ReadableText = ({ gradeLevel, language = "english", sentences: propSentences }) => {
  const [currentText, setCurrentText] = useState("")
  const [sentences, setSentences] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Use sentences from props if provided, otherwise load from data
    if (propSentences && propSentences.length > 0) {
      setSentences(propSentences)
    } else if (sentencesData[language] && sentencesData[language][gradeLevel]) {
      setSentences(sentencesData[language][gradeLevel])
    } else {
      setSentences([])
    }
    setCurrentIndex(0)
  }, [gradeLevel, language, propSentences])

  useEffect(() => {
    if (sentences.length > 0) {
      setCurrentText(sentences[currentIndex])
    }
  }, [sentences, currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sentences.length) % sentences.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sentences.length)
  }

  const getLanguageName = () => {
    const names = {
      english: "English",
      hindi: "हिंदी (Hindi)",
      marathi: "मराठी (Marathi)"
    }
    return names[language] || "English"
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-primary/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Read the following text:</h3>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {getLanguageName()}
        </span>
      </div>
      <div className="min-h-[120px] flex items-center justify-center mb-6 p-4 bg-muted/30 rounded-lg">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-medium text-foreground text-center leading-relaxed"
          >
            {currentText}
          </motion.p>
        </AnimatePresence>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {sentences.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-primary w-6" : "bg-muted w-2"
            }`}
            animate={{ width: index === currentIndex ? 24 : 8 }}
          />
        ))}
      </div>

      <div className="flex justify-between gap-2">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="flex items-center transition-all duration-300 hover:scale-105"
          disabled={sentences.length === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="flex items-center text-sm text-muted-foreground font-medium">
          {sentences.length > 0 ? `${currentIndex + 1} / ${sentences.length}` : "No sentences"}
        </span>
        <Button
          onClick={handleNext}
          variant="outline"
          className="flex items-center transition-all duration-300 hover:scale-105"
          disabled={sentences.length === 0}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ReadableText
