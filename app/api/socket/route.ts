import { NextResponse } from "next/server"

// This is a dummy API route to handle socket.io connections
// The actual socket.io server is initialized in server.ts
export async function GET() {
  return NextResponse.json({ status: "Socket server is running" })
}

