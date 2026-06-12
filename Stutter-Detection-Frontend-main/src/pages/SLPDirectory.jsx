"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  MapPin,
  GraduationCap,
  Award,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  Stethoscope,
  Building2,
  Filter,
  UserPlus,
  Heart,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const SPECIALIZATIONS = [
  "All Specializations",
  "Fluency Disorders / Stuttering",
  "Voice Disorders",
  "Articulation and Phonology",
  "Language Disorders",
  "Swallowing Disorders (Dysphagia)",
  "Pediatric Speech Therapy",
  "Adult Neurological Disorders",
  "Autism Spectrum Disorders",
]

export default function SLPDirectory() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [slps, setSlps] = useState([])
  const [filteredSlps, setFilteredSlps] = useState([])
  const [mySlps, setMySlps] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("All Specializations")
  const [selectedSlp, setSelectedSlp] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    fetchSlpDirectory()
    fetchMySlps()
  }, [currentUser])

  useEffect(() => {
    // Filter SLPs based on search and specialization
    let filtered = slps

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(slp =>
        slp.full_name?.toLowerCase().includes(query) ||
        slp.clinic_name?.toLowerCase().includes(query) ||
        slp.clinic_address?.toLowerCase().includes(query) ||
        slp.country?.toLowerCase().includes(query) ||
        slp.state?.toLowerCase().includes(query)
      )
    }

    if (specializationFilter && specializationFilter !== "All Specializations") {
      filtered = filtered.filter(slp => slp.specialization === specializationFilter)
    }

    setFilteredSlps(filtered)
  }, [slps, searchQuery, specializationFilter])

  const fetchSlpDirectory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slp/directory`)

      if (response.ok) {
        const data = await response.json()
        setSlps(data.slps || [])
        setFilteredSlps(data.slps || [])
      }
    } catch (err) {
      console.error("Error fetching SLP directory:", err)
      setError("Failed to load SLP directory")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMySlps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patient/my-slps/${currentUser.id}`)

      if (response.ok) {
        const data = await response.json()
        setMySlps(data.slps?.map(slp => slp.user_id) || [])
      }
    } catch (err) {
      console.error("Error fetching my SLPs:", err)
    }
  }

  const handleChooseSlp = (slp) => {
    setSelectedSlp(slp)
    setShowConfirmDialog(true)
  }

  const confirmChooseSlp = async () => {
    if (!selectedSlp) return

    try {
      setIsAssigning(true)

      const response = await fetch(`${API_BASE_URL}/api/patient/choose-slp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: currentUser.id,
          slp_id: selectedSlp.user_id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccessMessage(`Successfully assigned to ${selectedSlp.full_name}!`)
        setMySlps(prev => [...prev, selectedSlp.user_id])
        setShowConfirmDialog(false)

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        throw new Error("Failed to assign SLP")
      }
    } catch (err) {
      console.error("Error assigning SLP:", err)
      setError("Failed to assign SLP. Please try again.")
    } finally {
      setIsAssigning(false)
    }
  }

  const isAlreadyAssigned = (slpId) => {
    return mySlps.includes(slpId)
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            Find Your <span className="gradient-text">Speech Therapist</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse verified Speech-Language Pathologists and choose the right one for your treatment
          </p>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <Card className="glass border-white/10 mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={specializationFilter}
                  onValueChange={setSpecializationFilter}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredSlps.length} verified Speech-Language Pathologist{filteredSlps.length !== 1 ? 's' : ''}
        </p>

        {/* SLP Grid */}
        {filteredSlps.length === 0 ? (
          <Card className="glass border-white/10">
            <CardContent className="py-12 text-center">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No SLPs Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || specializationFilter !== "All Specializations"
                  ? "Try adjusting your search or filter criteria"
                  : "No verified SLPs are available at the moment. Please check back later."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlps.map((slp, index) => (
              <motion.div
                key={slp.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass border-white/10 h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                        {slp.profile_picture ? (
                          <img
                            src={`${API_BASE_URL}${slp.profile_picture}`}
                            alt={slp.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{slp.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{slp.professional_title || "SLP"}</p>
                        <div className="flex items-center gap-1 text-xs text-primary mt-1">
                          <Award className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {slp.specialization && (
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          <span className="truncate">{slp.specialization}</span>
                        </div>
                      )}
                      {slp.highest_qualification && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="truncate">{slp.highest_qualification}</span>
                        </div>
                      )}
                      {slp.years_of_experience > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{slp.years_of_experience} years experience</span>
                        </div>
                      )}
                      {(slp.country || slp.state) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">
                            {[slp.state, slp.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {slp.clinic_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="truncate">{slp.clinic_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio snippet */}
                    {slp.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {slp.bio}
                      </p>
                    )}

                    {/* Action Button */}
                    {isAlreadyAssigned(slp.user_id) ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        <Heart className="h-4 w-4 mr-2 fill-primary text-primary" />
                        Already Your SLP
                      </Button>
                    ) : (
                      <Button
                        className="w-full btn-premium text-white"
                        onClick={() => handleChooseSlp(slp)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Choose This SLP
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm SLP Selection</DialogTitle>
              <DialogDescription>
                Are you sure you want to choose {selectedSlp?.full_name} as your Speech-Language Pathologist?
              </DialogDescription>
            </DialogHeader>

            {selectedSlp && (
              <div className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-primary/20">
                    {selectedSlp.profile_picture ? (
                      <img
                        src={`${API_BASE_URL}${selectedSlp.profile_picture}`}
                        alt={selectedSlp.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedSlp.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedSlp.specialization}</p>
                    <p className="text-sm text-muted-foreground">
                      {[selectedSlp.state, selectedSlp.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmChooseSlp}
                disabled={isAssigning}
                className="btn-premium text-white"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  )
}
