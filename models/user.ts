import mongoose, { Schema, type Document } from "mongoose"

export interface UserDocument extends Document {
  userId: string
  name: string
  email?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    avatar: { type: String },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema)

