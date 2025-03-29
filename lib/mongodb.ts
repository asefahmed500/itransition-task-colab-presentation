import mongoose from "mongoose"

// Use the provided MongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://slidesync:A9vYzmr5WBbaRPXI@cluster0.8vksczm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Connection options
const options = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000, // Increased timeout to 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      ...options,
    }

    mongoose.set("strictQuery", true)

    console.log("Connecting to MongoDB...")

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("Error connecting to MongoDB:", e)
    throw e
  }

  return cached.conn
}

