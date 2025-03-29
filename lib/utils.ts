import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a secure and unique access code
export function generateSecureAccessCode(length = 6): string {
  try {
    // Use crypto for better randomness
    const randomBytesBuffer = crypto.randomBytes(length)

    // Convert to alphanumeric characters (A-Z, 0-9)
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""

    for (let i = 0; i < length; i++) {
      // Use modulo to get a value within the range of our characters
      const index = randomBytesBuffer[i] % characters.length
      result += characters[index]
    }

    // Ensure we never return an empty string
    if (!result) {
      return (
        "RANDOM" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")
      )
    }

    return result
  } catch (error) {
    // Fallback in case crypto is not available
    console.error("Error generating secure access code, using fallback:", error)
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return (
      result ||
      "RANDOM" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")
    )
  }
}

// Keep the old function for backward compatibility
export function generateId(length: number): string {
  return generateSecureAccessCode(length)
}

