"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Users,
  User,
  FileAudio,
  Eye,
  ArrowUpDown,
  RefreshCw,
  BarChart3,
  Brain,
} from "lucide-react"

const API_BASE_URL = ""

export default function SLPDashboard() {
  const { currentUser, isSLP } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("az")

  // Fetch tasks
  const fetchTasks = useCallback(async (showRefreshSpinner = false) => {
    if (!currentUser?.id) return
    if (showRefreshSpinner) setRefreshing(true)
    else setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks?slp_id=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === "success") {
          setTasks(data.tasks)
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!isSLP) { navigate("/"); return }
    fetchTasks()
  }, [currentUser, isSLP, navigate, fetchTasks])

  // Derive unique patients
  const getUniquePatients = () => {
    const patientMap = new Map()
    tasks.forEach(task => {
      if (task.patient) {
        const key = task.patient.email || task.patient.name
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            ...task.patient,
            tasks: [task],
            latestTask: task,
            earliestTask: task,
          })
        } else {
          const existing = patientMap.get(key)
          existing.tasks.push(task)
          if (new Date(task.timestamp) > new Date(existing.latestTask.timestamp)) {
            existing.latestTask = task
            Object.assign(existing, task.patient)
          }
          if (new Date(task.timestamp) < new Date(existing.earliestTask.timestamp)) {
            existing.earliestTask = task
          }
        }
      }
    })
    return Array.from(patientMap.values())
  }

  const patients = getUniquePatients()
  const totalAnalyses = tasks.filter(t => t.status === "completed").length

  // Filter + sort
  const filteredPatients = patients
    .filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = (a.name || "").toLowerCase()
      const nameB = (b.name || "").toLowerCase()
      return sortOrder === "az" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    })

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  const handleRefresh = () => fetchTasks(true)
  const toggleSort = () => setSortOrder(prev => prev === "az" ? "za" : "az")

  const handleViewPatient = (patient) => {
    const params = new URLSearchParams()
    if (patient.email) params.set("email", patient.email)
    if (patient.name) params.set("name", patient.name)
    navigate(`/slp-patient-detail?${params.toString()}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3"
              >
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">SLP Dashboard</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-1">Overview of your patients & analyses</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={toggleSort} title={`Sort ${sortOrder === "az" ? "Z→A" : "A→Z"}`}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">{patients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Analysis</p>
                    <p className="text-2xl font-bold">{totalAnalyses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <FileAudio className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Analysis Left</p>
                    <p className="text-2xl font-bold">{tasks.length - totalAnalyses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient List
              </CardTitle>
              <CardDescription>
                Sorted: {sortOrder === "az" ? "A → Z" : "Z → A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatients.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Recordings</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient, index) => (
                        <TableRow key={patient.email || index} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewPatient(patient)}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p>{patient.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{patient.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{patient.age ? `${patient.age} yrs` : "N/A"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {patient.tasks?.length || 0}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(patient.earliestTask?.timestamp)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewPatient(patient)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Patients Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No patients match your search criteria"
                      : "You don't have any patients assigned yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
