declare namespace NodeJS {
  interface ProcessEnv {
    // MongoDB connection string
    MONGODB_URI: string

    // Socket.io URL
    NEXT_PUBLIC_SOCKET_URL: string

    // App URL
    NEXT_PUBLIC_APP_URL: string

    // Server port
    PORT: string

    // JWT Secret for authentication
    JWT_SECRET: string

    // Cookie settings
    COOKIE_NAME: string
    COOKIE_SECRET: string

    // Debug mode
    DEBUG_MODE: string
  }
}

