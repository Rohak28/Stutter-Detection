"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Calendar,
  BookOpen,
  Globe,
  Clock,
  FileAudio,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Loader2,
  Play,
  X,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

// SSI-4 severity from total score
const getSSI4Severity = (totalScore) => {
  if (totalScore >= 46) return { label: "Very Severe", color: "text-red-500" }
  if (totalScore >= 36) return { label: "Severe", color: "text-orange-500" }
  if (totalScore >= 28) return { label: "Moderate", color: "text-yellow-500" }
  if (totalScore >= 18) return { label: "Mild", color: "text-green-500" }
  return { label: "Very Mild", color: "text-blue-500" }
}

export default function SLPPatientDetail() {
  const { currentUser, isSLP } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const patientEmail = searchParams.get("email")
  const patientName = searchParams.get("name")

  // Data
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [patientInfo, setPatientInfo] = useState(null)

  // Expanded recording
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Active inline view per recording: null | "recording" | "ssi4"
  const [activeView, setActiveView] = useState({}) // { [taskId]: "recording" | "ssi4" | null }

  // SSI-4 data cache
  const [assessments, setAssessments] = useState({}) // { [taskId]: assessment | null }
  const [assessmentLoading, setAssessmentLoading] = useState({})

  // Video URL cache
  const [videoUrls, setVideoUrls] = useState({}) // { [taskId]: url }
  const [videoLoading, setVideoLoading] = useState({})

  // Fetch all tasks for this SLP
  const fetchTasks = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks?slp_id=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === "success") {
          const patientTasks = data.tasks.filter(t => {
            if (!t.patient) return false
            return t.patient.email === patientEmail || t.patient.name === patientName
          })
          setTasks(patientTasks)

          // Pre-cache video URLs from task data
          const urls = {}
          patientTasks.forEach(t => {
            if (t.video_url) urls[t.task_id] = t.video_url
          })
          setVideoUrls(urls)

          if (patientTasks.length > 0) {
            const sorted = [...patientTasks].sort((a, b) =>
              new Date(b.timestamp) - new Date(a.timestamp)
            )
            setPatientInfo(sorted[0].patient)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [currentUser, patientEmail, patientName])

  useEffect(() => {
    if (!isSLP) { navigate("/"); return }
    if (!patientEmail && !patientName) { navigate("/slp-dashboard"); return }
    fetchTasks()
  }, [isSLP, navigate, patientEmail, patientName, fetchTasks])

  const handleExpandRecording = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
      setActiveView(prev => ({ ...prev, [taskId]: null }))
    } else {
      setExpandedTaskId(taskId)
    }
  }

  // Fetch video URL if not cached
  const handleViewRecording = async (taskId) => {
    // Toggle off if already showing
    if (activeView[taskId] === "recording") {
      setActiveView(prev => ({ ...prev, [taskId]: null }))
      return
    }
    setActiveView(prev => ({ ...prev, [taskId]: "recording" }))

    if (!videoUrls[taskId]) {
      setVideoLoading(prev => ({ ...prev, [taskId]: true }))
      try {
        const response = await fetch(`${API_BASE_URL}/api/task_status/${taskId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.video_url) {
            setVideoUrls(prev => ({ ...prev, [taskId]: data.video_url }))
          }
        }
      } catch (err) {
        console.error("Error fetching video URL:", err)
      } finally {
        setVideoLoading(prev => ({ ...prev, [taskId]: false }))
      }
    }
  }

  // Fetch SSI-4 assessment if not cached
  const handleViewSSI4 = async (taskId) => {
    // Toggle off if already showing
    if (activeView[taskId] === "ssi4") {
      setActiveView(prev => ({ ...prev, [taskId]: null }))
      return
    }
    setActiveView(prev => ({ ...prev, [taskId]: "ssi4" }))

    if (assessments[taskId] === undefined) {
      setAssessmentLoading(prev => ({ ...prev, [taskId]: true }))
      try {
        const response = await fetch(`${API_BASE_URL}/api/get_slp_assessment/${taskId}`)
        if (response.ok) {
          const data = await response.json()
          setAssessments(prev => ({ ...prev, [taskId]: data.assessment || null }))
        } else {
          setAssessments(prev => ({ ...prev, [taskId]: null }))
        }
      } catch (err) {
        console.warn("Could not load SLP assessment:", err)
        setAssessments(prev => ({ ...prev, [taskId]: null }))
      } finally {
        setAssessmentLoading(prev => ({ ...prev, [taskId]: false }))
      }
    }
  }

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const getMotherTongueDisplay = (patient) => {
    if (!patient) return "N/A"
    if (patient.motherTongue === "other" && patient.motherTongueOther) return patient.motherTongueOther
    const tongueMap = { english: "English", hindi: "Hindi (हिंदी)", marathi: "Marathi (मराठी)" }
    return tongueMap[patient.motherTongue] || patient.motherTongue || "N/A"
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const completedCount = tasks.filter(t => t.status === "completed").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Back + Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/slp-dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold font-display">
            <span className="gradient-text">{patientInfo?.name || patientName || "Patient"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Patient Details & Recordings</p>
        </motion.div>

        {/* ── Patient Details Card ── */}
        {patientInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{patientInfo.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm break-all">{patientInfo.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-medium">{patientInfo.age ? `${patientInfo.age} years` : "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{patientInfo.gender || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{formatDate(patientInfo.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Class / Grade</p>
                      <p className="font-medium">{patientInfo.classGrade || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Mother Tongue</p>
                      <p className="font-medium">{getMotherTongueDisplay(patientInfo)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileAudio className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Recordings</p>
                      <p className="font-medium">{tasks.length} ({completedCount} analyzed)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Recordings List ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-primary" />
                Recordings & Reports
              </CardTitle>
              <CardDescription>
                Expand a recording to view report, video, or SSI-4 assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task, index) => {
                    const isExpanded = expandedTaskId === task.task_id
                    const currentView = activeView[task.task_id]

                    return (
                      <div key={task.task_id} className="rounded-xl border border-white/10 overflow-hidden">
                        {/* Recording Row */}
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            isExpanded ? "bg-primary/5" : "hover:bg-muted/30"
                          }`}
                          onClick={() => handleExpandRecording(task.task_id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileAudio className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Recording #{tasks.length - index}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Sent: {formatDateTime(task.timestamp)}
                                </span>
                                {task.status === "completed" && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    Analyzed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : task.status === "failed"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}>
                              {task.status}
                            </span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t border-white/5">

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-3 pt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/results?task_id=${task.task_id}`)
                                    }}
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Report
                                  </Button>
                                  <Button
                                    variant={currentView === "recording" ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewRecording(task.task_id)
                                    }}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    View Recording
                                  </Button>
                                  <Button
                                    variant={currentView === "ssi4" ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewSSI4(task.task_id)
                                    }}
                                  >
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    View SSI-4 Form
                                  </Button>
                                </div>

                                {/* ── Inline: View Recording ── */}
                                <AnimatePresence>
                                  {currentView === "recording" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-4"
                                    >
                                      <div className="glass rounded-xl p-4 border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="font-semibold flex items-center gap-2">
                                            <Play className="h-4 w-4 text-primary" />
                                            Patient Recording
                                          </h4>
                                          <Button variant="ghost" size="sm" onClick={() => setActiveView(prev => ({ ...prev, [task.task_id]: null }))}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        {videoLoading[task.task_id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="ml-3 text-sm text-muted-foreground">Loading recording...</span>
                                          </div>
                                        ) : videoUrls[task.task_id] ? (
                                          <div className="rounded-lg overflow-hidden bg-black">
                                            <video
                                              src={videoUrls[task.task_id]?.startsWith('http') ? videoUrls[task.task_id] : `${API_BASE_URL}${videoUrls[task.task_id]}`}
                                              controls
                                              className="w-full max-h-[400px]"
                                              preload="metadata"
                                            >
                                              Your browser does not support the video tag.
                                            </video>
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 text-muted-foreground">
                                            <FileAudio className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">No recording video available for this task.</p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* ── Inline: View SSI-4 Form ── */}
                                <AnimatePresence>
                                  {currentView === "ssi4" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-4"
                                    >
                                      <div className="glass rounded-xl p-4 border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="font-semibold flex items-center gap-2">
                                            <ClipboardCheck className="h-4 w-4 text-primary" />
                                            SSI-4 Assessment
                                          </h4>
                                          <Button variant="ghost" size="sm" onClick={() => setActiveView(prev => ({ ...prev, [task.task_id]: null }))}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        {assessmentLoading[task.task_id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="ml-3 text-sm text-muted-foreground">Loading assessment...</span>
                                          </div>
                                        ) : assessments[task.task_id] ? (
                                          <div className="space-y-4">
                                            {/* Frequency / Duration / Physical */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              <div className="glass rounded-lg p-3 border-white/10">
                                                <p className="text-xs text-muted-foreground mb-1">Frequency Score</p>
                                                <p className="text-xl font-bold">{assessments[task.task_id].frequency_score ?? "N/A"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Reading: {assessments[task.task_id].raw_inputs?.reading_percent_ss || "N/A"}% SS &bull;
                                                  Speaking: {assessments[task.task_id].raw_inputs?.speaking_percent_ss || "N/A"}% SS
                                                </p>
                                              </div>
                                              <div className="glass rounded-lg p-3 border-white/10">
                                                <p className="text-xs text-muted-foreground mb-1">Duration Score</p>
                                                <p className="text-xl font-bold">{assessments[task.task_id].duration_score ?? "N/A"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Avg: {assessments[task.task_id].raw_inputs?.duration_avg || "N/A"}s
                                                </p>
                                              </div>
                                              <div className="glass rounded-lg p-3 border-white/10">
                                                <p className="text-xs text-muted-foreground mb-1">Physical Concomitants</p>
                                                <p className="text-xl font-bold">{assessments[task.task_id].physical_score ?? "N/A"}</p>
                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                  <p>Sounds: {assessments[task.task_id].physical_concomitants?.distracting_sounds ?? 0}/5</p>
                                                  <p>Grimaces: {assessments[task.task_id].physical_concomitants?.facial_grimaces ?? 0}/5</p>
                                                  <p>Head mvt: {assessments[task.task_id].physical_concomitants?.head_movements ?? 0}/5</p>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Total + Severity */}
                                            <div className="flex items-center justify-between glass rounded-lg p-3 border-white/10">
                                              <div>
                                                <p className="text-sm text-muted-foreground">SSI-4 Total Score</p>
                                                <p className="text-2xl font-bold">{assessments[task.task_id].total_score ?? "N/A"}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Severity Rating</p>
                                                <p className={`text-lg font-bold ${getSSI4Severity(assessments[task.task_id].total_score || 0).color}`}>
                                                  {assessments[task.task_id].severity_rating || getSSI4Severity(assessments[task.task_id].total_score || 0).label}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Clinical Notes */}
                                            {assessments[task.task_id].clinical_notes && (
                                              <div>
                                                <p className="text-sm font-medium mb-1">Clinical Notes</p>
                                                <div className="glass rounded-lg p-3 border-white/10">
                                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assessments[task.task_id].clinical_notes}</p>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-center py-6 text-muted-foreground">
                                            <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">No SSI-4 assessment has been submitted for this recording yet.</p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="mt-3"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/results?task_id=${task.task_id}`, { state: { activeTab: "slp-assessment" } })
                                              }}
                                            >
                                              <ClipboardCheck className="h-4 w-4 mr-2" />
                                              Fill SSI-4 Assessment
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileAudio className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Recordings</h3>
                  <p className="text-muted-foreground">This patient hasn't sent any recordings yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
