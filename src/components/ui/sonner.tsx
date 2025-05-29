// src/components/ui/sonner.tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      expand={true}
      duration={4000}
      visibleToasts={5}
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        className: 'group toast',
        descriptionClassName: 'group-[.toast]:text-muted-foreground',
        actionButtonStyle: {
          marginLeft: '0.5rem',
        },
        cancelButtonStyle: {
          marginLeft: '0.5rem',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-text": "hsl(355.7 100% 97.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-text": "hsl(210 20% 98%)",
          "--warning-bg": "hsl(38 92% 50%)",
          "--warning-text": "hsl(48 96% 89%)",
          "--info-bg": "hsl(217.2 91.2% 59.8%)",
          "--info-text": "hsl(210 20% 98%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }