declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      NEXT_PUBLIC_SOCKET_URL: string
      NEXT_PUBLIC_APP_URL: string
      PORT: string
      NODE_ENV: "development" | "production" | "test"
      JWT_SECRET: string
      COOKIE_NAME: string
      COOKIE_SECRET: string
      DEBUG_MODE: string
    }
  }
}

