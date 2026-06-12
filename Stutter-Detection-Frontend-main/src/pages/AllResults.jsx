"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import VideoPlayerModal from "../components/VideoPlayerModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  User,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Video,
  FileAudio,
  BarChart2,
  Mic,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

// Video Thumbnail Component - captures first frame
const VideoThumbnail = ({ videoUrl, size = "md" }) => {
  const [thumbnail, setThumbnail] = useState(null)

  useEffect(() => {
    if (!videoUrl) return

    const video = document.createElement("video")
    video.crossOrigin = "anonymous"
    video.muted = true
    video.preload = "metadata"

    video.src = `${API_BASE_URL}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0.5
    })

    video.addEventListener("seeked", () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        const ctx = canvas.getContext("2d")
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setThumbnail(canvas.toDataURL("image/jpeg", 0.7))
      } catch (err) {
        console.warn("Thumbnail generation failed:", err)
      }
    })

    const timeout = setTimeout(() => {}, 5000)
    return () => clearTimeout(timeout)
  }, [videoUrl])

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-12 w-12"

  if (thumbnail) {
    return <img src={thumbnail} alt="Recording" className="absolute inset-0 w-full h-full object-cover" />
  }

  return <Video className={`${sizeClass} text-muted-foreground/50`} />
}

export default function AllResults() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [viewMode, setViewMode] = useState("cards") // "cards" or "table"
  const [selectedTask, setSelectedTask] = useState(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [currentUser, page, statusFilter])

  const fetchResults = async () => {
    if (!currentUser?.id) return

    setLoading(true)
    try {
      let url = `${API_BASE_URL}/api/all_results/${currentUser.id}?page=${page}&per_page=12`
      if (statusFilter) {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setTotalPages(data.total_pages || 1)
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error("Error fetching results:", err)
      setError("Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatShortDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500/90"
    if (score >= 60) return "bg-amber-500/90"
    return "bg-red-500/90"
  }

  const getLanguageLabel = (lang) => {
    if (lang === "hi") return "🇮🇳 Hindi"
    if (lang === "mr") return "🇮🇳 Marathi"
    return "🇬🇧 English"
  }

  const filteredResults = results.filter(result =>
    (result.patient_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (result.task_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                All <span className="gradient-text">Analyses</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {total} total recording{total !== 1 ? "s" : ""} analyzed
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "cards" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  Table
                </button>
              </div>
              <Button className="btn-premium text-white rounded-xl" onClick={() => navigate("/analyze")}>
                <Mic className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or task ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-muted-foreground">Loading your analyses...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 text-lg">{error}</p>
              <Button className="mt-4" onClick={fetchResults}>Try Again</Button>
            </div>
          ) : filteredResults.length === 0 ? (
            <Card className="glass border-white/10 dark:border-white/5">
              <CardContent className="py-16 text-center">
                <FileAudio className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Analyses Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter
                    ? "No results match your filters. Try adjusting your search."
                    : "You haven't done any analyses yet. Start your first one!"}
                </p>
                {!searchTerm && !statusFilter && (
                  <Button className="btn-premium text-white rounded-xl" onClick={() => navigate("/analyze")}>
                    <Mic className="h-4 w-4 mr-2" />
                    Start First Analysis
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "cards" ? (
            /* =================== CARD VIEW =================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((result, index) => (
                <motion.div
                  key={result.task_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="glass border-white/10 dark:border-white/5 overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                    onClick={() => {
                      if (result.status === "completed") {
                        navigate(`/results?taskId=${result.task_id}`)
                      }
                    }}
                  >
                    {/* Video Thumbnail */}
                    {result.video_url && (
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                        <VideoThumbnail videoUrl={result.video_url} />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-2.5 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="h-5 w-5 text-white fill-white" />
                          </motion.div>
                        </div>
                        {/* Score badge */}
                        {result.status === "completed" && (
                          <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white ${getScoreBg(result.fluency_score)}`}>
                            {result.fluency_score?.toFixed(0) || 0}%
                          </div>
                        )}
                        {/* Status badge for non-completed */}
                        {result.status !== "completed" && (
                          <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                            result.status === "processing" ? "bg-amber-500/90 text-white" : "bg-red-500/90 text-white"
                          }`}>
                            {result.status === "processing" ? "Processing..." : "Failed"}
                          </div>
                        )}
                        {/* Language badge */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                          {getLanguageLabel(result.language)}
                        </div>
                      </div>
                    )}

                    {/* No video fallback */}
                    {!result.video_url && (
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                        <FileAudio className="h-12 w-12 text-muted-foreground/30" />
                        {result.status === "completed" && (
                          <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white ${getScoreBg(result.fluency_score)}`}>
                            {result.fluency_score?.toFixed(0) || 0}%
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Details */}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {result.patient_name || "Speech Analysis"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatShortDate(result.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(result.status)}
                          <span className="capitalize text-xs text-muted-foreground">{result.status}</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      {result.status === "completed" && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {result.duration?.toFixed(0) || 0}s
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            result.severity === "Mild" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            result.severity === "Moderate" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            result.severity === "Severe" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {result.severity || "N/A"}
                          </span>
                          <div className="ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (result.video_url) {
                                  setSelectedTask(result)
                                  setIsVideoModalOpen(true)
                                }
                              }}
                            >
                              {result.video_url ? (
                                <><Play className="h-3 w-3 mr-1" /> Play</>
                              ) : (
                                <><Eye className="h-3 w-3 mr-1" /> View</>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* =================== TABLE VIEW =================== */
            <Card className="glass border-white/10 dark:border-white/5 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Patient
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Fluency Score
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Severity
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Duration
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredResults.map((result, index) => (
                        <motion.tr
                          key={result.task_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => {
                            if (result.status === "completed") {
                              navigate(`/results?taskId=${result.task_id}`)
                            }
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {result.video_url && (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted relative flex-shrink-0">
                                  <VideoThumbnail videoUrl={result.video_url} size="sm" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm">{result.patient_name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{getLanguageLabel(result.language)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDate(result.timestamp)}
                          </td>
                          <td className="px-6 py-4">
                            {result.status === "completed" ? (
                              <span className={`font-bold text-lg ${getScoreColor(result.fluency_score)}`}>
                                {result.fluency_score?.toFixed(1) || "N/A"}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <span className="capitalize text-sm">{result.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${result.severity === "Mild" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                result.severity === "Moderate" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                  result.severity === "Severe" ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                                    "bg-muted text-muted-foreground"}`}
                            >
                              {result.severity || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {result.duration ? `${result.duration.toFixed(0)}s` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {result.video_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedTask(result)
                                    setIsVideoModalOpen(true)
                                  }}
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" />
                                  Play
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/results?taskId=${result.task_id}`)
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === pageNum
                        ? "bg-primary text-white shadow-md"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false)
          setSelectedTask(null)
        }}
        videoUrl={selectedTask?.video_url}
        taskId={selectedTask?.task_id}
      />
    </div>
  )
}
