"use client"

import { render, screen } from "@testing-library/react"
import Home from "@/app/page"

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    }
  },
}))

describe("Home Page", () => {
  it("renders the hero section", () => {
    render(<Home />)

    // Check if the main heading is rendered
    expect(screen.getByText(/Create Stunning Presentations Together/i)).toBeInTheDocument()

    // Check if the subheading is rendered
    expect(
      screen.getByText(/Collaborate in real-time, use markdown for rich content, and present with confidence./i),
    ).toBeInTheDocument()

    // Check if the create presentation button is rendered
    expect(screen.getByText(/Create Presentation/i)).toBeInTheDocument()
  })

  it("renders the features section", () => {
    render(<Home />)

    // Check if the features heading is rendered
    expect(screen.getByText(/Everything you need for powerful presentations/i)).toBeInTheDocument()

    // Check if the features are rendered
    expect(screen.getByText(/Real-time Collaboration/i)).toBeInTheDocument()
    expect(screen.getByText(/Drawing Tools/i)).toBeInTheDocument()
    expect(screen.getByText(/Live Presentation Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Markdown Support/i)).toBeInTheDocument()
    expect(screen.getByText(/Role-based Permissions/i)).toBeInTheDocument()
  })
})

