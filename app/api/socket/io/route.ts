import { NextResponse } from "next/server"

// This is a placeholder route for Socket.io
// The actual Socket.io server is initialized in server.ts
export async function GET() {
  return NextResponse.json({
    status: "Socket.io endpoint",
    message: "Socket.io is handled by the custom server in server.ts",
  })
}

