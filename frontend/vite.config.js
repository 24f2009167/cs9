import process from 'node:process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000'
const configDir = path.dirname(fileURLToPath(import.meta.url))

// Single source of truth for project metadata lives in ../project.yml.
// Parsed here (simple flat `key: "value"` file) and exposed to the app as
// build-time globals so components don't hardcode the project name.
function readProjectConfig() {
  const config = {}
  try {
    const raw = readFileSync(path.resolve(configDir, '../project.yml'), 'utf8')
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/)
      if (match) {
        config[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    // project.yml is optional; components fall back to their default label.
  }
  return config
}

const projectConfig = readProjectConfig()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __PROJECT_NAME__: JSON.stringify(projectConfig.project_name || ''),
    __PROJECT_TAGLINE__: JSON.stringify(projectConfig.tagline || ''),
    __PROJECT_OWNER__: JSON.stringify(projectConfig.owner || ''),
  },
  resolve: {
    alias: {
      '@': path.resolve(configDir, './src'),
    },
  },
  server: {
    proxy: {
      '/api': apiProxyTarget,
    },
  },
})
