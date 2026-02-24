export interface ServerCredentials {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface StoredCredentialsV1 {
  baseUrl: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface StoredCredentialsV2 {
  version: 2
  activeBaseUrl: string | null
  servers: Record<string, ServerCredentials>
}

// Backward-compatible alias for legacy callers.
export type StoredCredentials = StoredCredentialsV1

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string | null
  }
}
