import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['node_modules', 'logs', 'dist']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Args/vars prefixed with `_` are intentionally unused — the codebase uses
      // the (`_req`, `res`, `_next`) Express signature convention throughout.
      // Unused `catch` bindings are tolerated (many handlers rethrow via next()).
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      // The only hits are escapes inside character classes in validation regexes
      // (password / name). They're harmless, not auto-fixable here, and editing
      // security regexes for a stylistic rule isn't worth the risk.
      'no-useless-escape': 'off',
    },
  },
  {
    // One-off operational scripts (seed / migration / diagnostics). Unused
    // scaffolding vars are common here, so surface them as warnings rather than
    // failing the lint — app code stays strict.
    files: ['src/scripts/**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
])
