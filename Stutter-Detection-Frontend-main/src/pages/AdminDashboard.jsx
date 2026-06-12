"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users, UserCheck, Activity, TrendingUp, Shield,
  Search, MoreVertical, CheckCircle2, XCircle, Ban,
  AlertCircle, Clock, Trash2, RefreshCw, Loader2,
  BarChart3
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [actionDialog, setActionDialog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data state
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSLPs: 0,
    totalAnalyses: 0,
    pendingPatients: 0,
    pendingSLPs: 0,
    registrations: []
  })
  const [slps, setSlps] = useState([])
  const [patients, setPatients] = useState([])
  const [activities, setActivities] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch all data
  const fetchAllData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const [statsRes, slpRes, patientRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`),
        fetch(`${API_BASE_URL}/api/admin/users?type=slp`),
        fetch(`${API_BASE_URL}/api/admin/users?type=patient`),
        fetch(`${API_BASE_URL}/api/admin/activity`),
      ])

      const [statsData, slpData, patientData, activityData] = await Promise.all([
        statsRes.json(),
        slpRes.json(),
        patientRes.json(),
        activityRes.json(),
      ])

      if (statsData.status === "success") setStats(statsData)
      if (slpData.status === "success") setSlps(slpData.users || [])
      if (patientData.status === "success") setPatients(patientData.users || [])
      if (activityData.status === "success") setActivities(activityData.activities || [])
    } catch (err) {
      console.error("Failed to fetch admin data:", err)
      setError("Failed to load dashboard data. Please check the backend connection.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Handle admin actions (verify, ban, remove)
  const confirmAction = async () => {
    if (!actionDialog) return
    const { userId, action } = actionDialog

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Refresh all data after action
        await fetchAllData(true)
      } else {
        const errData = await response.json()
        alert(errData.error || "Action failed")
      }
    } catch (err) {
      console.error("Action failed:", err)
      alert("Action failed. Please try again.")
    } finally {
      setActionDialog(null)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      verified: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
      pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Clock },
      banned: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: Ban },
    }
    const s = status || "pending"
    const { bg, text, icon: Icon } = config[s] || config.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3.5 w-3.5" />
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    )
  }

  // Action dropdown for user management
  const UserActions = ({ user }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.status !== "verified" && (
          <DropdownMenuItem onClick={() => setActionDialog({ userId: user.id, action: "verify", name: user.name })}>
            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
            Verify User
          </DropdownMenuItem>
        )}
        {user.status !== "banned" && (
          <DropdownMenuItem onClick={() => setActionDialog({ userId: user.id, action: "ban", name: user.name })}>
            <Ban className="h-4 w-4 mr-2 text-amber-500" />
            Ban User
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => setActionDialog({ userId: user.id, action: "remove", name: user.name })}
          className="text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Filter helpers
  const filteredSLPs = slps.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <p className="text-red-500 font-medium">{error}</p>
          <Button onClick={() => fetchAllData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Platform management and analytics</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchAllData(true)}
          disabled={isRefreshing}
          className="mt-4 md:mt-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total SLPs",
            value: stats.totalSLPs,
            pending: stats.pendingSLPs,
            icon: UserCheck,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Total Patients",
            value: stats.totalPatients,
            pending: stats.pendingPatients,
            icon: Users,
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Total Analyses",
            value: stats.totalAnalyses,
            icon: Activity,
            color: "from-emerald-500 to-green-500",
          },
          {
            label: "Total Users",
            value: stats.totalSLPs + stats.totalPatients,
            icon: TrendingUp,
            color: "from-amber-500 to-orange-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass border-white/10 dark:border-white/5 overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.pending > 0 && (
                      <p className="text-xs text-amber-500">{stat.pending} pending</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "slps", label: `SLPs (${slps.length})`, icon: UserCheck },
          { id: "patients", label: `Patients (${patients.length})`, icon: Users },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl ${activeTab === tab.id ? "btn-premium text-white" : ""}`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Registration Chart */}
            <Card className="lg:col-span-2 glass border-white/10 dark:border-white/5">
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
                <CardDescription>Monthly new user registrations (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.registrations && stats.registrations.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.registrations}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="slps" name="SLPs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="patients" name="Patients" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No registration data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass border-white/10 dark:border-white/5">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[350px] overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity, i) => (
                      <div key={activity.activity_id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <span className="text-lg">{activity.icon || "👤"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.type === "verify" && `Verified ${activity.user_name}`}
                            {activity.type === "ban" && `Banned ${activity.user_name}`}
                            {activity.type === "remove" && `Removed ${activity.user_name}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.user_role} • {activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No admin actions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SLPs Tab */}
        {activeTab === "slps" && (
          <motion.div
            key="slps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass border-white/10 dark:border-white/5">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>SLP Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search SLPs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl border bg-background text-sm w-full md:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Patients</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Specialization</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSLPs.length > 0 ? (
                        filteredSLPs.map((slp) => (
                          <tr key={slp.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium">{slp.name}</td>
                            <td className="p-3 text-sm text-muted-foreground">{slp.email}</td>
                            <td className="p-3"><StatusBadge status={slp.status} /></td>
                            <td className="p-3 text-sm">{slp.patients || 0}</td>
                            <td className="p-3 text-sm">{slp.specialization || "General"}</td>
                            <td className="p-3 text-right"><UserActions user={slp} /></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            {searchTerm ? "No SLPs match your search" : "No SLPs registered yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <motion.div
            key="patients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass border-white/10 dark:border-white/5">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Patient Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl border bg-background text-sm w-full md:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Analyses</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Assigned SLP</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <tr key={patient.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium">{patient.name}</td>
                            <td className="p-3 text-sm text-muted-foreground">{patient.email}</td>
                            <td className="p-3"><StatusBadge status={patient.status} /></td>
                            <td className="p-3 text-sm">{patient.analyses || 0}</td>
                            <td className="p-3 text-sm">{patient.slp || "Unassigned"}</td>
                            <td className="p-3 text-right"><UserActions user={patient} /></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            {searchTerm ? "No patients match your search" : "No patients registered yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Dialog */}
      <AnimatePresence>
        {actionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActionDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                {actionDialog.action === "verify" && <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-3" />}
                {actionDialog.action === "ban" && <Ban className="h-12 w-12 mx-auto text-amber-500 mb-3" />}
                {actionDialog.action === "remove" && <XCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />}
                <h3 className="text-lg font-semibold">
                  {actionDialog.action === "verify" && "Verify User"}
                  {actionDialog.action === "ban" && "Ban User"}
                  {actionDialog.action === "remove" && "Remove User"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to {actionDialog.action} <strong>{actionDialog.name}</strong>?
                  {actionDialog.action === "remove" && " This action cannot be undone."}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setActionDialog(null)}>
                  Cancel
                </Button>
                <Button
                  className={`flex-1 rounded-xl ${
                    actionDialog.action === "remove" ? "bg-red-500 hover:bg-red-600" :
                    actionDialog.action === "ban" ? "bg-amber-500 hover:bg-amber-600" :
                    "bg-emerald-500 hover:bg-emerald-600"
                  } text-white`}
                  onClick={confirmAction}
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
