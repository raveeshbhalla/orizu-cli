import { mkdirSync, readFileSync, rmSync, writeFileSync, chmodSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { StoredCredentials } from './types.js'

function getConfigDir(): string {
  return join(homedir(), '.config', 'orizu')
}

function getCredentialsPath(): string {
  return join(getConfigDir(), 'credentials.json')
}

export function saveCredentials(credentials: StoredCredentials) {
  const dir = getConfigDir()
  mkdirSync(dir, { recursive: true })
  const path = getCredentialsPath()
  writeFileSync(path, JSON.stringify(credentials, null, 2), 'utf-8')
  chmodSync(path, 0o600)
}

export function loadCredentials(): StoredCredentials | null {
  const path = getCredentialsPath()
  if (!existsSync(path)) {
    return null
  }

  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as StoredCredentials
}

export function clearCredentials() {
  const path = getCredentialsPath()
  if (existsSync(path)) {
    rmSync(path)
  }
}
