"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"

interface UseUserReturn {
  userId: string
  userName: string
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (userId: string, name?: string) => Promise<boolean>
  logout: () => Promise<boolean>
}

export function useUser(): UseUserReturn {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const initFromLocalStorage = () => {
      try {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          // Check if user ID exists in localStorage
          let storedUserId = localStorage.getItem("userId")
          let storedUserName = localStorage.getItem("userName")

          if (!storedUserId) {
            // Generate a random user ID
            storedUserId = Math.random().toString(36).substring(2, 15)
            localStorage.setItem("userId", storedUserId)
          }

          if (!storedUserName) {
            // Generate a random user name
            const names = ["User", "Guest", "Visitor", "Presenter", "Collaborator"]
            storedUserName = `${names[Math.floor(Math.random() * names.length)]}${Math.floor(Math.random() * 1000)}`
            localStorage.setItem("userName", storedUserName)
          }

          // Set state
          setUserId(storedUserId)
          setUserName(storedUserName)
          console.log("Using localStorage for user:", storedUserId, storedUserName)

          // Create a user object
          setUser({
            id: "local-" + storedUserId,
            userId: storedUserId,
            name: storedUserName,
            email: "",
            avatar: "",
            role: "user",
          })

          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error initializing user from localStorage:", error)
        // Set default values in case of error
        setUserId("default-user-id")
        setUserName("Default User")
      } finally {
        setIsLoading(false)
      }
    }

    initFromLocalStorage()
  }, [])

  // Login function - simplified to just use localStorage
  const login = async (userId: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId)
        if (name) localStorage.setItem("userName", name)
      }

      setUserId(userId)
      setUserName(name || "Anonymous User")

      // Create a user object
      setUser({
        id: "local-" + userId,
        userId: userId,
        name: name || "Anonymous User",
        email: "",
        avatar: "",
        role: "user",
      })

      setIsAuthenticated(true)
      console.log("User logged in locally:", userId)

      return true
    } catch (error) {
      console.error("Error during login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function - simplified to just clear localStorage
  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Clear user state
      setUserId("")
      setUserName("")
      setUser(null)
      setIsAuthenticated(false)

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("userId")
        localStorage.removeItem("userName")
      }

      // Redirect to home page
      router.push("/")
      return true
    } catch (error) {
      console.error("Error during logout:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    userId,
    userName,
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}

