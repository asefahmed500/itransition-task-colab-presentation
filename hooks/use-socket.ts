"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

export function useSocket(url: string, options: any = {}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const socketInstance = io(url, options)

    socketInstance.on("connect", () => {
      setIsConnected(true)
      setError(null)
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      setError(err)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [url, options])

  return { socket, isConnected, error }
}

