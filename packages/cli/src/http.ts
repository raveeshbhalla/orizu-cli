import { loadCredentials, saveCredentials } from './credentials.js'
import { LoginResponse, StoredCredentials } from './types.js'

export function getBaseUrl(): string {
  return process.env.ORIZU_BASE_URL || 'https://orizu.ai'
}

function isExpired(expiresAt: number): boolean {
  const nowUnix = Math.floor(Date.now() / 1000)
  return expiresAt <= nowUnix + 30
}

async function refreshCredentials(credentials: StoredCredentials): Promise<StoredCredentials> {
  const response = await fetch(`${credentials.baseUrl}/api/cli/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: credentials.refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Session expired. Run `orizu login` again.')
  }

  const data = await response.json() as LoginResponse
  const refreshed = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    baseUrl: credentials.baseUrl,
  }
  saveCredentials(refreshed)
  return refreshed
}

export async function authedFetch(path: string, init: RequestInit = {}) {
  const credentials = loadCredentials()
  if (!credentials) {
    throw new Error('Not logged in. Run `orizu login` first.')
  }

  let activeCredentials = credentials
  if (isExpired(activeCredentials.expiresAt)) {
    activeCredentials = await refreshCredentials(activeCredentials)
  }

  let response = await fetch(`${activeCredentials.baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${activeCredentials.accessToken}`,
    },
  })

  if (response.status === 401) {
    activeCredentials = await refreshCredentials(activeCredentials)
    response = await fetch(`${activeCredentials.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${activeCredentials.accessToken}`,
      },
    })
  }

  return response
}
