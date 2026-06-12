"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Camera,
  Save,
  Award,
  MapPin,
  GraduationCap,
  Stethoscope,
  Mail,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other"
]

const ISSUING_AUTHORITIES = [
  "RCI (Rehabilitation Council of India)",
  "ASHA (American Speech-Language-Hearing Association)",
  "State Speech & Hearing Board",
  "RCSLT (Royal College of Speech and Language Therapists)",
  "Speech Pathology Australia",
  "Other"
]

const SPECIALIZATIONS = [
  "Fluency Disorders / Stuttering",
  "Voice Disorders",
  "Articulation and Phonology",
  "Language Disorders",
  "Swallowing Disorders (Dysphagia)",
  "Pediatric Speech Therapy",
  "Adult Neurological Disorders",
  "Autism Spectrum Disorders",
  "Multiple Specializations"
]

const QUALIFICATIONS = [
  "MSc SLP (Speech-Language Pathology)",
  "MA SLP",
  "BASLP (Bachelor in Audiology and Speech-Language Pathology)",
  "PhD in Speech-Language Pathology",
  "M.Phil in Speech-Language Pathology",
  "Other"
]

export default function SLPProfile() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const [profile, setProfile] = useState({
    full_name: "",
    dob: "",
    professional_title: "Speech-Language Pathologist (SLP)",
    registration_number: "",
    issuing_authority: "",
    country: "",
    state: "",
    highest_qualification: "",
    years_of_experience: "",
    specialization: "",
    professional_email: "",
    clinic_name: "",
    clinic_address: "",
    bio: "",
    profile_picture: ""
  })

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    fetchProfile()
  }, [currentUser])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slp/profile/${currentUser.id}`)

      if (response.ok) {
        const data = await response.json()
        if (data.profile_exists && data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }))
          setProfileComplete(data.profile.profile_completed || false)
          setIsVerified(data.profile.is_verified || false)
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${API_BASE_URL}/api/slp/profile/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        const data = await response.json()
        setProfileComplete(data.profile_completed)
        setSuccess("Profile saved successfully!")

        if (data.profile_completed && !isVerified) {
          setSuccess("Profile saved! Pending admin verification to appear in patient directory.")
        }
      } else {
        throw new Error("Failed to save profile")
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingPicture(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/api/slp/profile/picture/${currentUser.id}`, {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({ ...prev, profile_picture: data.picture_url }))
        setSuccess("Profile picture uploaded!")
      } else {
        throw new Error("Failed to upload picture")
      }
    } catch (err) {
      console.error("Error uploading picture:", err)
      setError("Failed to upload picture. Please try again.")
    } finally {
      setIsUploadingPicture(false)
    }
  }

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            SLP <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your professional profile to be visible to patients
          </p>

          {/* Status badges */}
          <div className="flex gap-2 mt-4">
            {profileComplete ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Profile Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                Profile Incomplete
              </span>
            )}

            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Award className="h-4 w-4" />
                Verified
              </span>
            ) : profileComplete && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <AlertCircle className="h-4 w-4" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
                    {profile.profile_picture ? (
                      <img
                        src={`${API_BASE_URL}${profile.profile_picture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  {isUploadingPicture && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPicture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                As it appears on your license/certificate
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profile.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="professional_title">Professional Title</Label>
                <Input
                  id="professional_title"
                  value={profile.professional_title}
                  onChange={(e) => handleChange("professional_title", e.target.value)}
                  placeholder="Speech-Language Pathologist (SLP)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Credentials */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Professional Credentials
              </CardTitle>
              <CardDescription>
                Your registration and licensing information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration/License Number *</Label>
                <Input
                  id="registration_number"
                  value={profile.registration_number}
                  onChange={(e) => handleChange("registration_number", e.target.value)}
                  placeholder="RCI/ASHA/State License Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuing_authority">Issuing Authority *</Label>
                <Select
                  value={profile.issuing_authority}
                  onValueChange={(value) => handleChange("issuing_authority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select authority" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUING_AUTHORITIES.map((auth) => (
                      <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country of Practice *</Label>
                <Select
                  value={profile.country}
                  onValueChange={(value) => handleChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g., Maharashtra, California"
                />
              </div>
            </CardContent>
          </Card>

          {/* Qualifications & Experience */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Qualifications & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highest_qualification">Highest Qualification</Label>
                <Select
                  value={profile.highest_qualification}
                  onValueChange={(value) => handleChange("highest_qualification", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATIONS.map((qual) => (
                      <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  value={profile.years_of_experience}
                  onChange={(e) => handleChange("years_of_experience", parseInt(e.target.value) || 0)}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={profile.specialization}
                  onValueChange={(value) => handleChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Clinic */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Contact & Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="professional_email">Professional Email</Label>
                <Input
                  id="professional_email"
                  type="email"
                  value={profile.professional_email}
                  onChange={(e) => handleChange("professional_email", e.target.value)}
                  placeholder="professional@clinic.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic/Hospital Name</Label>
                <Input
                  id="clinic_name"
                  value={profile.clinic_name}
                  onChange={(e) => handleChange("clinic_name", e.target.value)}
                  placeholder="Speech Therapy Center"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Textarea
                  id="clinic_address"
                  value={profile.clinic_address}
                  onChange={(e) => handleChange("clinic_address", e.target.value)}
                  placeholder="Full clinic address with city and postal code"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio">Bio / About</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Brief introduction about yourself and your practice..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-premium text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
