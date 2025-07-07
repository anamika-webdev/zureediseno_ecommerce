// src/hooks/use-system-theme.ts - Custom hook for system theme detection
"use client"

import { useState, useEffect } from 'react'

export function useSystemTheme() {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    setIsLoading(false)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
      // Update document class immediately
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return { isDark, isLoading }
}

// Alternative hook that works with next-themes
export function useSystemThemeOnly() {
  const [mounted, setMounted] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    
    const updateTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setSystemTheme(isDark ? 'dark' : 'light')
    }

    // Set initial theme
    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)

    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [])

  return {
    theme: systemTheme,
    mounted,
    isDark: systemTheme === 'dark'
  }
}