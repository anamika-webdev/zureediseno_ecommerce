// src/providers/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string | string[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  nonce?: string
  scriptProps?: Record<string, any>
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}