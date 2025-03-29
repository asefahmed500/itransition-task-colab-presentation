import mongoose, { Schema, type Document } from "mongoose"
import { generateSecureAccessCode } from "@/lib/utils"

// Point interface for drawings
interface Point {
  x: number
  y: number
}

// Drawing interface
interface Drawing {
  tool: string
  color: string
  width: number
  points: Point[]
}

// Slide interface
interface Slide {
  content?: string
  notes?: string
  drawings?: Drawing[]
}

// Collaborator interface
interface Collaborator {
  userId: string
  nickname: string
  role: string
  lastEdited?: Date
}

// Presentation interface
export interface PresentationDocument extends Document {
  title: string
  description: string
  slides: Slide[]
  collaborators: Collaborator[]
  accessCode: string
  code?: string // Add this to handle the existing field in the database
  lastEditedBy?: string
  createdAt: Date
  updatedAt: Date
}

// Point schema
const PointSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
})

// Drawing schema
const DrawingSchema = new Schema({
  tool: { type: String, required: true, default: "pen" },
  color: { type: String, required: true, default: "#000000" },
  width: { type: Number, required: true, default: 3 },
  points: [PointSchema],
})

// Slide schema
const SlideSchema = new Schema({
  content: { type: String, default: "" },
  notes: { type: String, default: "" },
  drawings: [DrawingSchema],
})

// Collaborator schema
const CollaboratorSchema = new Schema({
  userId: { type: String, required: true },
  nickname: { type: String, required: true },
  role: { type: String, required: true, enum: ["creator", "editor", "viewer"], default: "viewer" },
  lastEdited: { type: Date },
})

// Presentation schema
const PresentationSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    slides: [SlideSchema],
    collaborators: [CollaboratorSchema],
    // Define both fields to handle the existing database structure
    accessCode: {
      type: String,
      required: true,
      unique: true,
      default: () => generateSecureAccessCode(6), // Always provide a default
    },
    // This is the field causing the error in the database
    code: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values (important for migration)
    },
    lastEditedBy: { type: String },
  },
  { timestamps: true },
)

// Add a pre-save hook to ensure access code is set and code field is synchronized
PresentationSchema.pre("save", async function (next) {
  try {
    // Generate a unique access code if not set
    if (!this.accessCode) {
      let isUnique = false
      let attempts = 0
      const maxAttempts = 10

      while (!isUnique && attempts < maxAttempts) {
        const newCode = generateSecureAccessCode(6)

        // Check if this code already exists in either field
        const existingPresentation = await mongoose.models.Presentation.findOne({
          $or: [{ accessCode: newCode }, { code: newCode }],
          _id: { $ne: this._id }, // Exclude current document
        })

        if (!existingPresentation) {
          this.accessCode = newCode
          // Also set the code field to maintain compatibility
          this.code = newCode
          isUnique = true
        } else {
          attempts++
        }
      }

      if (!isUnique) {
        return next(new Error("Failed to generate a unique access code after multiple attempts"))
      }
    } else {
      // Make sure code field is synchronized with accessCode
      this.code = this.accessCode
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

// Create or get the model
export const Presentation =
  mongoose.models.Presentation || mongoose.model<PresentationDocument>("Presentation", PresentationSchema)

