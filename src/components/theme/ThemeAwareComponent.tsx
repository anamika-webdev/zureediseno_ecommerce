// components/theme/ThemeAwareComponent.tsx - Example component with theme awareness
"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeAwareComponentProps {
  children: React.ReactNode
  className?: string
}

export function ThemeAwareComponent({ children, className }: ThemeAwareComponentProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div 
      className={`
        ${className} 
        ${isDark ? 'dark-theme-specific-styles' : 'light-theme-specific-styles'}
        transition-all duration-200
      `}
      data-theme={resolvedTheme}
    >
      {children}
    </div>
  )
}
