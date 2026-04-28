import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: [
      '**/dev-dist/**',
      '**/dist/**',
      '**/dist-electron/**',
      '**/src/interface/Barbo/index.tsx',
      '**/src/interface/Zodiac/FictivePoints/index.tsx'
    ]
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        browser: true,
        es2021: true
      }
    },
    plugins: {
      react,
      '@typescript-eslint': tseslint
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off'
    }
  }
]
