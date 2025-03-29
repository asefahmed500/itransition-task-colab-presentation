import type { Presentation, Slide, Collaborator } from "./presentation"
import type { User } from "./user"

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean
  error?: string
  message?: string
  [key: string]: any
}

// Authentication API types
export interface LoginRequest {
  userId: string
  nickname?: string
  email?: string
}

export interface AuthResponse extends ApiResponse {
  user?: User
  token?: string
}

// Presentation API types
export interface CreatePresentationRequest {
  title: string
  description?: string
  creatorId: string
  creatorNickname: string
}

export interface CreatePresentationResponse extends ApiResponse {
  presentationId?: string
  accessCode?: string
}

export interface GetPresentationResponse extends ApiResponse {
  presentation?: Presentation
}

export interface UpdatePresentationRequest {
  title?: string
  description?: string
  userId: string
  slides?: Slide[]
}

export interface UpdatePresentationResponse extends ApiResponse {
  presentation?: {
    id: string
    title: string
    description: string
    updatedAt: string
  }
}

// Slide API types
export interface AddSlideRequest {
  content?: string
  notes?: string
  template?: string
  userId: string
}

export interface AddSlideResponse extends ApiResponse {
  slideIndex?: number
  slide?: Slide
}

export interface UpdateSlideRequest {
  content?: string
  notes?: string
  drawings?: any[]
  userId: string
}

export interface UpdateSlideResponse extends ApiResponse {
  slide?: Slide
}

// Collaborator API types
export interface AddCollaboratorRequest {
  userId: string
  nickname: string
  role: string
  invitedBy: string
}

export interface AddCollaboratorResponse extends ApiResponse {
  collaborators?: Collaborator[]
}

export interface JoinPresentationRequest {
  accessCode: string
  userId: string
  nickname: string
}

export interface JoinPresentationResponse extends ApiResponse {
  presentationId?: string
  role?: string
}

// User API types
export interface CreateUserRequest {
  userId: string
  nickname: string
  email?: string
  avatar?: string
}

export interface UserResponse extends ApiResponse {
  user?: User
}

