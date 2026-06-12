import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { motion } from "framer-motion"
import { FileText, HelpCircle, Settings, Shield, Zap, Book, Lightbulb } from "lucide-react"

function Documentation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 py-8"
    >
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        Documentation
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Upload an audio or video file</li>
                <li>Record a new video directly in the app</li>
                <li>Review the analysis results</li>
                <li>Understand your speech patterns</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Customize analysis parameters</li>
                <li>Export results in various formats</li>
                <li>Track progress over time</li>
                <li>Integrate with speech therapy tools</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the stutter detection work?</AccordionTrigger>
                <AccordionContent>
                  Our AI-powered tool analyzes audio input to detect speech patterns associated with stuttering. It uses
                  advanced audio processing techniques and machine learning models to identify repetitions,
                  prolongations, and blocks in speech.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What file formats are supported?</AccordionTrigger>
                <AccordionContent>
                  We support various audio and video formats, including .wav, .mp3, .mp4, .avi, and .mov. You can also
                  record audio or video directly through our interface, which will be automatically converted to the
                  correct format for analysis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How accurate is the stutter detection?</AccordionTrigger>
                <AccordionContent>
                  Our stutter detection algorithm has been trained on a large dataset of speech samples and has shown
                  high accuracy in clinical trials. However, as with any AI tool, there may be occasional errors or
                  misclassifications. We continuously work on improving our models for better accuracy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How is my data handled?</AccordionTrigger>
                <AccordionContent>
                  We take data privacy very seriously. All uploaded audio files and recordings are processed securely
                  and are not stored permanently on our servers. Analysis results are anonymized and may be used to
                  improve our detection algorithms. You can request deletion of your data at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I use this tool for medical diagnosis?</AccordionTrigger>
                <AccordionContent>
                  While our tool provides valuable insights into speech patterns, it is not intended to replace
                  professional medical advice or diagnosis. Always consult with a qualified speech-language pathologist
                  or medical professional for clinical evaluation and treatment of speech disorders.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              Tips for Effective Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use a high-quality microphone for best results</li>
              <li>Record in a quiet environment to minimize background noise</li>
              <li>Speak naturally and at your normal pace</li>
              <li>Try analyzing different types of speech (e.g., reading, conversation)</li>
              <li>Use the results as a guide for targeted speech therapy exercises</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Documentation

