import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Health check endpoint to verify MongoDB connection
export async function GET() {
  try {
    await connectToDatabase()

    // Check MongoDB connection status
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    return NextResponse.json({
      status: "ok",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: "Failed to connect to database: " + (error instanceof Error ? error.message : String(error)),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

