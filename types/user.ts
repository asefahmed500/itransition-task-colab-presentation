export type UserRole = "owner" | "editor" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
}

