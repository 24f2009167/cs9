import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_DIR = join(__dirname, '../..', 'logs')
const LOG_FILE = join(LOG_DIR, 'feature.log')

/**
 * Appends a feature-log entry as a single newline-delimited JSON line.
 * Creates the logs/ directory automatically if it doesn't exist.
 */
export function appendFeatureLog(data) {
  try {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true })
    }
    appendFileSync(LOG_FILE, JSON.stringify(data) + '\n')
  } catch (err) {
    console.error('[FeatureLog] Failed to write to feature.log:', err.message)
  }
}
