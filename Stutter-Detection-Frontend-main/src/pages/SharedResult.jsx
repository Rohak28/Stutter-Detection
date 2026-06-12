"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Calendar,
  User,
  Clock,
  BarChart2,
  AlertCircle,
  Loader2,
  Home,
  Volume2,
  TrendingUp,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export default function SharedResult() {
  const { token } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSharedResult()
  }, [token])

  const fetchSharedResult = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shared/${token}`)
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to load shared result")
      }
    } catch (err) {
      setError("Failed to load shared result")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared result...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Result</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Shared Analysis Result</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Speech Analysis Report
            </h1>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>StutterSense</p>
            <p>AI-Powered Speech Analysis</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-medium text-lg">{result.patient_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-medium text-lg">{result.patient_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Analysis Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(result.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {result.results?.duration?.toFixed(1) || "N/A"} seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fluency Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Fluency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(result.results?.fluency_score || 0)}`}>
                    {result.results?.fluency_score?.toFixed(1) || "N/A"}%
                  </div>
                  <p className="text-muted-foreground mt-2">Fluency Score</p>
                </div>
              </div>
              
              {result.results?.stuttering_events && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.results.stuttering_events.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Stutter Events</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.results.stutter_rate?.toFixed(1) || "N/A"}%
                    </div>
                    <p className="text-sm text-muted-foreground">Stutter Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.results.words_per_minute?.toFixed(0) || "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground">Words/Min</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SLP Assessment Card (if available) */}
        {result.slp_assessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  SLP Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.slp_assessment.severity_rating && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Severity Rating</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${result.slp_assessment.severity_rating === "Mild" ? "bg-green-500/20 text-green-600" :
                          result.slp_assessment.severity_rating === "Moderate" ? "bg-yellow-500/20 text-yellow-600" :
                          result.slp_assessment.severity_rating === "Severe" ? "bg-red-500/20 text-red-600" :
                          "bg-gray-500/20 text-gray-600"}`}
                      >
                        {result.slp_assessment.severity_rating}
                      </span>
                    </div>
                  )}
                  
                  {result.slp_assessment.clinical_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">
                        {result.slp_assessment.clinical_notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8 text-sm text-muted-foreground"
        >
          <p>This is a shared analysis report from StutterSense</p>
          <Link to="/" className="text-primary hover:underline">
            Learn more about StutterSense →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
