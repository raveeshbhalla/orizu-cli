export interface StoredCredentials {
  accessToken: string
  refreshToken: string
  expiresAt: number
  baseUrl: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string | null
  }
}
