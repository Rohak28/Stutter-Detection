"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Save, Loader } from "lucide-react"

export default function UserProfile() {
  const { currentUser, updateProfile, error: authError } = useAuth()

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    try {
      setError("")
      setSuccess("")
      setLoading(true)

      await updateProfile(profileData)
      setSuccess("Profile updated successfully")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center gradient-text">Your Profile</CardTitle>
          <CardDescription className="text-center">Manage your account information</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {(error || authError) && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error || authError}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md flex items-center mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={profileData.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={profileData.email}
                onChange={handleProfileChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

