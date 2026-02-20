import { mkdirSync, readFileSync, rmSync, writeFileSync, chmodSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
function getConfigDir() {
    return join(homedir(), '.config', 'orizu');
}
function getCredentialsPath() {
    return join(getConfigDir(), 'credentials.json');
}
export function saveCredentials(credentials) {
    const dir = getConfigDir();
    mkdirSync(dir, { recursive: true });
    const path = getCredentialsPath();
    writeFileSync(path, JSON.stringify(credentials, null, 2), 'utf-8');
    chmodSync(path, 0o600);
}
export function loadCredentials() {
    const path = getCredentialsPath();
    if (!existsSync(path)) {
        return null;
    }
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
}
export function clearCredentials() {
    const path = getCredentialsPath();
    if (existsSync(path)) {
        rmSync(path);
    }
}
