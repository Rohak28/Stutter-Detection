"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import {
  FileAudio,
  Download,
  Eye,
  Mic,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  History,
  SearchX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

function getFluencyColor(score) {
  if (score >= 80) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "bg-amber-500/15 text-amber-600 dark:text-amber-400"
  return "bg-red-500/15 text-red-600 dark:text-red-400"
}

function getLanguageLabel(lang) {
  if (lang === "hi") return "🇮🇳 Hindi"
  if (lang === "mr") return "🇮🇳 Marathi"
  return "🇬🇧 English"
}

function formatDate(ts) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PatientHistory() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState("timestamp")
  const [sortDir, setSortDir] = useState("desc")

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/dashboard/${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === "success" && Array.isArray(data.recentTasks)) {
            setTasks(data.recentTasks)
          }
        }
      } catch (err) {
        console.error("History fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [currentUser])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...tasks].sort((a, b) => {
    let av, bv
    if (sortKey === "timestamp") {
      av = new Date(a.timestamp).getTime()
      bv = new Date(b.timestamp).getTime()
    } else if (sortKey === "fluency") {
      av = a.results?.fluency_score ?? 0
      bv = b.results?.fluency_score ?? 0
    } else {
      av = 0; bv = 0
    }
    return sortDir === "asc" ? av - bv : bv - av
  })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
    return sortDir === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 ml-1 text-primary" />
      : <ChevronDown className="h-3.5 w-3.5 ml-1 text-primary" />
  }

  const handleDownload = (task) => {
    if (!task.video_url) return
    const fullUrl = `${API_BASE_URL}${task.video_url.startsWith("/") ? "" : "/"}${task.video_url}`
    const a = document.createElement("a")
    a.href = fullUrl
    a.download = `recording-${task.task_id?.slice(0, 8) || "file"}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <History className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display gradient-text">My History</h1>
          </div>
          {/*<p className="text-muted-foreground ml-14">
            All your previous speech recordings and analysis reports
          </p>*/}
        </motion.div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10 dark:border-white/5 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recordings &amp; Reports</CardTitle>
                  <CardDescription>
                    {tasks.length} session{tasks.length !== 1 ? "s" : ""} recorded
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <SearchX className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <p className="text-lg font-medium text-muted-foreground">No recordings yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">
                    Complete your first speech analysis to see your history here.
                  </p>
                  <Button onClick={() => navigate("/analyze")} className="btn-premium text-white">
                    Start First Analysis
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-b-xl">
                  <table className="w-full text-sm border-collapse table-fixed">
                    <colgroup>
                      <col style={{ width: "44px" }} />
                      <col style={{ width: "190px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "170px" }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b-2 border-border/70 bg-muted/50">
                        <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                        <th
                          className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort("timestamp")}
                        >
                          <span className="inline-flex items-center gap-1">
                            Date &amp; Time <SortIcon col="timestamp" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Language
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort("fluency")}
                        >
                          <span className="inline-flex items-center gap-1">
                            Fluency <SortIcon col="fluency" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Recording
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          View Report
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Download
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((task, index) => {
                        const fluency = task.results?.fluency_score ?? null
                        const lang = task.results?.analysis_details?.language
                        const hasVideo = Boolean(task.video_url)

                        return (
                          <motion.tr
                            key={task.task_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.04 * index }}
                            className="border-b border-border/30 hover:bg-muted/25 transition-colors"
                          >
                            {/* Row Number */}
                            <td className="px-3 py-3.5 text-muted-foreground font-mono text-xs text-center">
                              {index + 1}
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-foreground font-medium text-sm">
                              {formatDate(task.timestamp)}
                            </td>

                            {/* Language */}
                            <td className="px-4 py-3.5 text-foreground text-sm">
                              {getLanguageLabel(lang)}
                            </td>

                            {/* Fluency Score */}
                            <td className="px-4 py-3.5">
                              {fluency !== null ? (
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getFluencyColor(fluency)}`}
                                >
                                  {fluency}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>

                            {/* Recording indicator */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <FileAudio
                                  className={`h-4 w-4 flex-shrink-0 ${hasVideo ? "text-primary" : "text-muted-foreground/40"}`}
                                />
                                <span className={`text-xs ${hasVideo ? "text-foreground" : "text-muted-foreground"}`}>
                                  {hasVideo ? "Available" : "Audio only"}
                                </span>
                              </div>
                            </td>

                            {/* View Report — always present, always in same column */}
                            <td className="px-4 py-3.5 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs rounded-lg border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 whitespace-nowrap"
                                onClick={() => navigate(`/results?task_id=${task.task_id}`)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View Report
                              </Button>
                            </td>

                            {/* Download Recording — only when video exists, always in same column */}
                            <td className="px-4 py-3.5 text-center">
                              {hasVideo && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs rounded-lg border-border/60 hover:border-emerald-500/40 hover:text-emerald-600 hover:bg-emerald-500/5 whitespace-nowrap"
                                  onClick={() => handleDownload(task)}
                                >
                                  <Download className="h-3.5 w-3.5 mr-1.5" />
                                  Download
                                </Button>
                              )}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
