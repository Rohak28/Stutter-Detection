"use client"

import { useState, useEffect } from "react"
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
  ChevronRight,
  Search,
  Users,
  User,
  Calendar,
  BookOpen,
  Globe,
  Clock,
  Activity,
  FileAudio,
  Eye,
  ArrowLeft,
} from "lucide-react"

const API_BASE_URL = "";

export default function SLPPatients() {
  const { currentUser, isSLP } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    if (!isSLP) {
      navigate("/dashboard")
      return
    }

    const fetchTasks = async () => {
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
      }
    }

    fetchTasks()
  }, [currentUser, isSLP, navigate])

  // Get unique patients from tasks
  const getUniquePatients = () => {
    const patientMap = new Map()
    
    tasks.forEach(task => {
      if (task.patient) {
        const patientKey = task.patient.email || task.patient.name
        if (!patientMap.has(patientKey)) {
          patientMap.set(patientKey, {
            ...task.patient,
            tasks: [task],
            latestTask: task,
          })
        } else {
          const existingPatient = patientMap.get(patientKey)
          existingPatient.tasks.push(task)
          // Keep the latest task
          if (new Date(task.timestamp) > new Date(existingPatient.latestTask.timestamp)) {
            existingPatient.latestTask = task
            // Update patient details with latest info
            Object.assign(existingPatient, task.patient)
          }
        }
      }
    })
    
    return Array.from(patientMap.values())
  }

  const patients = getUniquePatients()

  // Filter patients by search term
  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Get day name from date
  const getDayName = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  // Get mother tongue display
  const getMotherTongueDisplay = (patient) => {
    if (patient.motherTongue === "other" && patient.motherTongueOther) {
      return patient.motherTongueOther
    }
    const tongueMap = {
      "english": "English",
      "hindi": "Hindi (हिंदी)",
      "marathi": "Marathi (मराठी)"
    }
    return tongueMap[patient.motherTongue] || patient.motherTongue || "N/A"
  }

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                <span className="gradient-text">My Patients</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage your patient recordings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                    <FileAudio className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Recordings</p>
                    <p className="text-2xl font-bold">{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">
                      {tasks.filter(t => t.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient Details Modal/Card */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="glass border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Patient Details
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedPatient.name || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">@</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedPatient.email || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">⚧</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="font-medium capitalize">{selectedPatient.gender || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Language */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Academic & Language</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Class / Grade</p>
                          <p className="font-medium">{selectedPatient.classGrade || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Mother Tongue</p>
                          <p className="font-medium">{getMotherTongueDisplay(selectedPatient)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Date Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">🎂</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="font-medium">{selectedPatient.age ? `${selectedPatient.age} years` : "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Last Recording</p>
                          <p className="font-medium">
                            {formatDate(selectedPatient.dateOfRecording)}
                            {selectedPatient.dateOfRecording && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({getDayName(selectedPatient.dateOfRecording)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient's Recordings */}
                <div className="mt-6">
                  <h3 className="font-semibold text-lg border-b pb-2 mb-4">Recordings ({selectedPatient.tasks?.length || 0})</h3>
                  <div className="space-y-2">
                    {selectedPatient.tasks?.map((task, index) => (
                      <div 
                        key={task.task_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/results?task_id=${task.task_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <FileAudio className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Recording #{index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(task.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === "completed" 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {task.status}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient List
              </CardTitle>
              <CardDescription>
                Click on a patient to view detailed information
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
                        <TableHead>Class</TableHead>
                        <TableHead>Mother Tongue</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Last Recording</TableHead>
                        <TableHead>Recordings</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient, index) => (
                        <TableRow 
                          key={patient.email || index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedPatient(patient)}
                        >
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
                          <TableCell>{patient.classGrade || "N/A"}</TableCell>
                          <TableCell>{getMotherTongueDisplay(patient)}</TableCell>
                          <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                          <TableCell>
                            <div>
                              <p>{formatDate(patient.dateOfRecording)}</p>
                              {patient.dateOfRecording && (
                                <p className="text-xs text-muted-foreground">
                                  {getDayName(patient.dateOfRecording)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {patient.tasks?.length || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPatient(patient)
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
                      : "You don't have any patients assigned yet"
                    }
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
