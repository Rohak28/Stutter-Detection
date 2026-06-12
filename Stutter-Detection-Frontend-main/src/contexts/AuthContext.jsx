"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"

// Create the authentication context
const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || ""

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      }
    } catch (err) {
      console.error("Error loading user from localStorage:", err)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = async (name, email, password, userType) => {
    try {
      setError(null)
      
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      const newUser = {
        id: data.userId || Date.now().toString(),
        email,
        name,
        userType,
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("token", data.token || "dummy-token")
      setCurrentUser(newUser)

      return newUser
    } catch (err) {
      const errorMessage = err.message || "Signup failed"
      setError(errorMessage)
      throw err
    }
  }

  const login = async (email, password, userType) => {
    try {
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in")
      }

      const user = {
        id: data.userId || Date.now().toString(),
        email,
        name: data.name || email.split("@")[0],
        userType: data.userType || userType,
      }

      // Store user and token
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", data.token || "dummy-token")

      setCurrentUser(user)

      return user
    } catch (err) {
      const errorMessage = err.message || "Login failed"
      setError(errorMessage)
      throw err
    }
  }

  const googleLogin = async (token, userType) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/google_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userType }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to log in with Google")
      }

      const user = {
        id: data.userId || Date.now().toString(),
        email: data.email || "google@example.com",
        name: data.name || "Google User",
        userType: data.userType || userType,
      }

      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", data.token || "dummy-token")
      setCurrentUser(user)

      return user
    } catch (err) {
      const errorMessage = err.message || "Google Login failed"
      setError(errorMessage)
      throw err
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setCurrentUser(null)
      setError(null)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      return Promise.resolve()
    } catch (err) {
      console.error("Logout error:", err)
      return Promise.reject(err)
    }
  }

  const value = {
    currentUser,
    userType: currentUser?.userType,
    isPatient: currentUser?.userType === "patient",
    isSLP: currentUser?.userType === "slp",
    isAdmin: currentUser?.userType === "admin",
    isLoggedIn: !!currentUser,
    abVariants,
    signup,
    login,
    googleLogin,
    logout,
    error,
    setError,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
