'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  role: string
  imageUrl?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isSeller: boolean
  isGuest: boolean
  loginAsGuest: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        const userData = {
          ...data.user,
          name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
        }
        setUser(userData)
        setIsGuest(false)
      } else {
        setUser(null)
        setIsGuest(false)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setIsGuest(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    const userData = {
      ...data.user,
      name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
    }
    setUser(userData)
    setIsGuest(false)
    
    if (data.user.role === 'ADMIN') {
      router.push('/dashboard/admin')
    } else if (data.user.role === 'SELLER') {
      router.push('/dashboard/seller')
    } else {
      router.push('/')
    }
    
    router.refresh()
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    const userData = {
      ...data.user,
      name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
    }
    setUser(userData)
    setIsGuest(false)
    router.push('/')
    router.refresh()
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
    setIsGuest(false)
    router.push('/')
    router.refresh()
  }

  const loginAsGuest = () => {
    setIsGuest(true)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSeller: user?.role === 'SELLER',
    isGuest,
    loginAsGuest,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}