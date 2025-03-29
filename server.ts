import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { initSocketServer } from "./server/socket"
import { connectToDatabase } from "./lib/mongodb"
import mongoose from "mongoose"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = Number.parseInt(process.env.PORT || "3000", 10)

console.log("Starting server in", dev ? "development" : "production", "mode")
console.log("Using MongoDB URI:", process.env.MONGODB_URI || "mongodb://localhost:27017/slidesync")

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log("MongoDB connected successfully")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1) // Exit if MongoDB connection fails
  })

// Create the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("Error occurred handling", req.url, err)
        res.statusCode = 500
        res.end("Internal Server Error")
      }
    })

    // Initialize Socket.io server
    const io = initSocketServer(server)

    // Start listening
    server.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log("Received shutdown signal, closing connections...")

      // Close HTTP server
      server.close(() => {
        console.log("HTTP server closed")
      })

      // Close Socket.io connections
      io.close(() => {
        console.log("Socket.io connections closed")
      })

      // Close MongoDB connection
      try {
        await mongoose.connection.close()
        console.log("MongoDB connection closed")
        process.exit(0)
      } catch (err) {
        console.error("Error closing MongoDB connection:", err)
        process.exit(1)
      }
    }

    // Listen for termination signals
    process.on("SIGTERM", gracefulShutdown)
    process.on("SIGINT", gracefulShutdown)
  })
  .catch((err) => {
    console.error("Error starting server:", err)
    process.exit(1)
  })

