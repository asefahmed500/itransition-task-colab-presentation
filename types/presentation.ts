export interface Point {
  x: number
  y: number
}

export interface Drawing {
  tool: string
  color: string
  width: number
  points: Point[]
}

export interface Slide {
  content?: string
  notes?: string
  drawings?: Drawing[]
}

export interface Collaborator {
  userId: string
  nickname: string // Changed from name to nickname
  role: string
  lastEdited?: Date
}

export interface Presentation {
  id: string
  title: string
  description: string
  slides: Slide[]
  collaborators: Collaborator[]
  accessCode: string
  createdAt?: string
  updatedAt?: string
  lastEditedBy?: string // Store the userId of the last editor
}

