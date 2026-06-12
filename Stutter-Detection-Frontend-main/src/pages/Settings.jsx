"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  SlidersHorizontal,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Trash2,
  LogOut,
  Lock,
  Globe,
  GraduationCap,
  Heart,
  Phone,
  Building2,
  Award,
  FileText,
  Eye,
  Stethoscope,
} from "lucide-react"

// Helper: load settings from localStorage
const loadSettings = (key, defaults) => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error("Error loading settings:", e)
  }
  return defaults
}

// Helper: save settings to localStorage
const saveSettings = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error("Error saving settings:", e)
    return false
  }
}

// ==========================================
// PATIENT SETTINGS DEFAULTS
// ==========================================
const patientDefaults = {
  fullName: "",
  email: "",
  dob: "",
  gender: "",
  motherTongue: "",
  preferredLanguage: "en",
  grade: "",
  notifyAnalysisComplete: true,
  notifyReportReady: true,
}

// ==========================================
// SLP SETTINGS DEFAULTS
// ==========================================
const slpDefaults = {
  fullName: "",
  email: "",
  qualification: "",
  specialization: "",
  clinic: "",
  contactNumber: "",
  defaultReportFormat: "on-screen",
  autoIncludeSSI4: true,
  severityScale: "ssi4",
  notifyNewPatient: true,
  notifyAnalysisReady: true,
  notifyPatientActivity: true,
}

// ==========================================
// SAVE SUCCESS TOAST
// ==========================================
function SaveToast({ show, onClose }) {
  if (!show) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 shadow-xl backdrop-blur-xl"
    >
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium text-sm">Settings saved successfully</span>
    </motion.div>
  )
}

// ==========================================
// SECTION CARD WRAPPER
// ==========================================
function SettingsSection({ icon: Icon, title, description, children, iconColor = "text-primary" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted/30">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-0.5">{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==========================================
// FIELD ROW
// ==========================================
function FieldRow({ label, htmlFor, children, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ==========================================
// TOGGLE ROW
// ==========================================
function ToggleRow({ label, description, checked, onCheckedChange, id }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 pr-4">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// ==========================================
// MAIN SETTINGS PAGE
// ==========================================
export default function Settings() {
  const { currentUser, isPatient, isSLP, logout } = useAuth()
  const navigate = useNavigate()

  const settingsKey = isPatient ? "stuttersense_patient_settings" : "stuttersense_slp_settings"
  const defaults = isPatient ? patientDefaults : slpDefaults

  const [settings, setSettings] = useState(() => {
    const loaded = loadSettings(settingsKey, defaults)
    // Prefill from auth context
    return {
      ...loaded,
      fullName: loaded.fullName || currentUser?.name || "",
      email: loaded.email || currentUser?.email || "",
    }
  })

  const [showSaveToast, setShowSaveToast] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [passwordSection, setPasswordSection] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Update a setting field
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Save handler
  const handleSave = () => {
    const success = saveSettings(settingsKey, settings)
    if (success) {
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // Guard
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 p-4 md:p-8"
      >
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {isPatient ? "Patient" : "SLP"} Settings
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display">
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, preferences, and account
            </p>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">

            {/* ====== PROFILE SECTION ====== */}
            <SettingsSection
              icon={User}
              title="Profile"
              description="Your personal information"
            >
              <FieldRow label="Full Name" htmlFor="fullName">
                <Input
                  id="fullName"
                  value={settings.fullName}
                  onChange={(e) => updateSetting("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="glass border-white/10"
                />
              </FieldRow>

              <FieldRow label="Email" htmlFor="email" description="Cannot be changed">
                <Input
                  id="email"
                  value={settings.email}
                  disabled
                  className="glass border-white/10 opacity-60 cursor-not-allowed"
                />
              </FieldRow>

              {isPatient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Date of Birth" htmlFor="dob">
                      <Input
                        id="dob"
                        type="date"
                        value={settings.dob}
                        onChange={(e) => updateSetting("dob", e.target.value)}
                        className="glass border-white/10"
                      />
                    </FieldRow>
                    <FieldRow label="Gender" htmlFor="gender">
                      <Select value={settings.gender} onValueChange={(v) => updateSetting("gender", v)}>
                        <SelectTrigger className="glass border-white/10">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>

                  <FieldRow label="Mother Tongue" htmlFor="motherTongue">
                    <Select value={settings.motherTongue} onValueChange={(v) => updateSetting("motherTongue", v)}>
                      <SelectTrigger className="glass border-white/10">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="marathi">Marathi</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                        <SelectItem value="kannada">Kannada</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </>
              )}

              {isSLP && (
                <>
                  <FieldRow label="Qualification" htmlFor="qualification">
                    <Input
                      id="qualification"
                      value={settings.qualification}
                      onChange={(e) => updateSetting("qualification", e.target.value)}
                      placeholder="e.g., M.Sc. Speech-Language Pathology"
                      className="glass border-white/10"
                    />
                  </FieldRow>

                  <FieldRow label="Specialization" htmlFor="specialization">
                    <Input
                      id="specialization"
                      value={settings.specialization}
                      onChange={(e) => updateSetting("specialization", e.target.value)}
                      placeholder="e.g., Fluency Disorders, Pediatric Speech"
                      className="glass border-white/10"
                    />
                  </FieldRow>

                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Clinic / Organization" htmlFor="clinic">
                      <Input
                        id="clinic"
                        value={settings.clinic}
                        onChange={(e) => updateSetting("clinic", e.target.value)}
                        placeholder="e.g., City Speech Center"
                        className="glass border-white/10"
                      />
                    </FieldRow>
                    <FieldRow label="Contact Number" htmlFor="contactNumber">
                      <Input
                        id="contactNumber"
                        value={settings.contactNumber}
                        onChange={(e) => updateSetting("contactNumber", e.target.value)}
                        placeholder="+91 98XXX XXXXX"
                        className="glass border-white/10"
                      />
                    </FieldRow>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button onClick={handleSave} className="btn-premium text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </SettingsSection>

            {/* ====== PREFERENCES SECTION ====== */}
            <SettingsSection
              icon={SlidersHorizontal}
              title={isPatient ? "Analysis Preferences" : "Report Preferences"}
              description={isPatient ? "Customize your recording and analysis experience" : "Customize how reports are generated"}
              iconColor="text-blue-400"
            >
              {isPatient && (
                <>
                  <FieldRow label="Preferred Language" htmlFor="preferredLanguage">
                    <Select value={settings.preferredLanguage} onValueChange={(v) => updateSetting("preferredLanguage", v)}>
                      <SelectTrigger className="glass border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="Grade / Class" htmlFor="grade">
                    <Select value={settings.grade} onValueChange={(v) => updateSetting("grade", v)}>
                      <SelectTrigger className="glass border-white/10">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Grade</SelectItem>
                        <SelectItem value="2nd">2nd Grade</SelectItem>
                        <SelectItem value="3rd">3rd Grade</SelectItem>
                        <SelectItem value="4th">4th Grade</SelectItem>
                        <SelectItem value="5th">5th Grade</SelectItem>
                        <SelectItem value="6th">6th Grade</SelectItem>
                        <SelectItem value="7th">7th Grade</SelectItem>
                        <SelectItem value="8th">8th Grade</SelectItem>
                        <SelectItem value="9th">9th Grade</SelectItem>
                        <SelectItem value="10th">10th Grade</SelectItem>
                        <SelectItem value="11th">11th Grade</SelectItem>
                        <SelectItem value="12th">12th Grade</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="adult">Adult</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </>
              )}

              {isSLP && (
                <>
                  <FieldRow label="Default Report Format" htmlFor="defaultReportFormat">
                    <Select value={settings.defaultReportFormat} onValueChange={(v) => updateSetting("defaultReportFormat", v)}>
                      <SelectTrigger className="glass border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-screen">On-Screen View</SelectItem>
                        <SelectItem value="pdf">PDF Download</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <Separator className="bg-white/5" />

                  <ToggleRow
                    id="autoIncludeSSI4"
                    label="Auto-include SSI-4 in Reports"
                    description="Automatically append SSI-4 assessment data to all generated reports"
                    checked={settings.autoIncludeSSI4}
                    onCheckedChange={(v) => updateSetting("autoIncludeSSI4", v)}
                  />

                  <FieldRow label="Severity Scale" htmlFor="severityScale">
                    <Select value={settings.severityScale} onValueChange={(v) => updateSetting("severityScale", v)}>
                      <SelectTrigger className="glass border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ssi4">SSI-4 (Standard)</SelectItem>
                        <SelectItem value="custom">Custom Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </>
              )}

              <div className="pt-2">
                <Button onClick={handleSave} className="btn-premium text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </SettingsSection>

            {/* ====== NOTIFICATIONS SECTION ====== */}
            <SettingsSection
              icon={Bell}
              title="Notifications"
              description="Control what alerts you receive"
              iconColor="text-amber-400"
            >
              {isPatient && (
                <>
                  <ToggleRow
                    id="notifyAnalysisComplete"
                    label="Analysis Complete"
                    description="Get notified when your speech analysis is finished"
                    checked={settings.notifyAnalysisComplete}
                    onCheckedChange={(v) => updateSetting("notifyAnalysisComplete", v)}
                  />
                  <Separator className="bg-white/5" />
                  <ToggleRow
                    id="notifyReportReady"
                    label="Report Ready"
                    description="Get notified when your SLP has reviewed your report"
                    checked={settings.notifyReportReady}
                    onCheckedChange={(v) => updateSetting("notifyReportReady", v)}
                  />
                </>
              )}

              {isSLP && (
                <>
                  <ToggleRow
                    id="notifyNewPatient"
                    label="New Patient Assignment"
                    description="Get alerted when a new patient is assigned to you"
                    checked={settings.notifyNewPatient}
                    onCheckedChange={(v) => updateSetting("notifyNewPatient", v)}
                  />
                  <Separator className="bg-white/5" />
                  <ToggleRow
                    id="notifyAnalysisReady"
                    label="Analysis Ready"
                    description="Get notified when AI analysis is complete for a patient"
                    checked={settings.notifyAnalysisReady}
                    onCheckedChange={(v) => updateSetting("notifyAnalysisReady", v)}
                  />
                  <Separator className="bg-white/5" />
                  <ToggleRow
                    id="notifyPatientActivity"
                    label="Patient Activity Updates"
                    description="Get notified when your patients submit new recordings"
                    checked={settings.notifyPatientActivity}
                    onCheckedChange={(v) => updateSetting("notifyPatientActivity", v)}
                  />
                </>
              )}

              <div className="pt-2">
                <Button onClick={handleSave} className="btn-premium text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notifications
                </Button>
              </div>
            </SettingsSection>

            {/* ====== ACCOUNT & SECURITY SECTION ====== */}
            <SettingsSection
              icon={Shield}
              title="Account & Security"
              description="Manage your password and account"
              iconColor="text-red-400"
            >
              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Change Password
                </h4>

                <FieldRow label="Current Password" htmlFor="currentPassword">
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordSection.current}
                    onChange={(e) => setPasswordSection(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Enter current password"
                    className="glass border-white/10"
                  />
                </FieldRow>

                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="New Password" htmlFor="newPassword">
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordSection.new}
                      onChange={(e) => setPasswordSection(prev => ({ ...prev, new: e.target.value }))}
                      placeholder="Enter new password"
                      className="glass border-white/10"
                    />
                  </FieldRow>
                  <FieldRow label="Confirm Password" htmlFor="confirmPassword">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordSection.confirm}
                      onChange={(e) => setPasswordSection(prev => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="glass border-white/10"
                    />
                  </FieldRow>
                </div>

                <Button
                  variant="outline"
                  className="glass border-white/10"
                  onClick={() => {
                    // Frontend-only — just clear the fields and show toast
                    setPasswordSection({ current: "", new: "", confirm: "" })
                    setShowSaveToast(true)
                    setTimeout(() => setShowSaveToast(false), 3000)
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>

              <Separator className="bg-white/5" />

              {/* Log Out All Devices */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Log Out of All Devices</p>
                  <p className="text-xs text-muted-foreground">End all active sessions except this one</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out All
                </Button>
              </div>

              <Separator className="bg-white/5" />

              {/* Danger Zone — Delete Account */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0 ml-4"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                          // Frontend-only — just log out
                          handleLogout()
                        }}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SettingsSection>
          </div>

          {/* Bottom spacer */}
          <div className="h-12" />
        </div>
      </motion.div>

      {/* Save Toast */}
      <SaveToast show={showSaveToast} onClose={() => setShowSaveToast(false)} />
    </div>
  )
}
