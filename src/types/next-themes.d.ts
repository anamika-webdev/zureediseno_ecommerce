declare module 'next-themes' {
  export interface ThemeProviderProps {
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
  
  export const ThemeProvider: React.ComponentType<ThemeProviderProps>
  export const useTheme: () => {
    theme: string | undefined
    setTheme: (theme: string) => void
    forcedTheme?: string
    resolvedTheme?: string
    themes: string[]
    systemTheme?: string
  }
}