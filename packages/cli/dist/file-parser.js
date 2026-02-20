import { readFileSync } from 'fs';
import { extname } from 'path';
import { parseCSVToObjects } from './csv.js';
export function parseDatasetFile(filePath) {
    const extension = extname(filePath).toLowerCase();
    let content;
    try {
        content = readFileSync(filePath, 'utf-8');
    }
    catch (error) {
        const maybeError = error;
        if (maybeError.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}. Check the path and filename, then retry.`);
        }
        if (maybeError.code === 'EPERM' || maybeError.code === 'EACCES') {
            throw new Error(`Cannot read file: ${filePath}. macOS may be blocking access to this folder (for example Downloads). Grant folder permission to your terminal app and retry.`);
        }
        throw new Error(`Failed to read file ${filePath}: ${maybeError.message}`);
    }
    if (extension === '.csv') {
        const rows = parseCSVToObjects(content);
        return {
            rows: ensureObjectRows(rows),
            sourceType: 'csv',
        };
    }
    if (extension === '.json') {
        const data = JSON.parse(content);
        if (!Array.isArray(data)) {
            throw new Error('JSON file must contain a top-level array');
        }
        return {
            rows: ensureObjectRows(data),
            sourceType: 'json',
        };
    }
    if (extension === '.jsonl') {
        const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const parsed = lines.map((line, index) => {
            try {
                return JSON.parse(line);
            }
            catch {
                throw new Error(`Invalid JSONL at line ${index + 1}`);
            }
        });
        return {
            rows: ensureObjectRows(parsed),
            sourceType: 'jsonl',
        };
    }
    throw new Error('Unsupported file type. Use .csv, .json, or .jsonl');
}
function ensureObjectRows(rows) {
    if (rows.length === 0) {
        throw new Error('Dataset file contains no rows');
    }
    return rows.map((row, index) => {
        if (!row || Array.isArray(row) || typeof row !== 'object') {
            throw new Error(`Row ${index + 1} must be a JSON object`);
        }
        return row;
    });
}
