'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  profileImage?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  showLoginModal: boolean
  showRegisterModal: boolean
  setShowLoginModal: (show: boolean) => void
  setShowRegisterModal: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const isLoggedIn = !!user

  const login = (userData: User) => {
    setUser(userData)
    setShowLoginModal(false)
    setShowRegisterModal(false)
  }

  const logout = () => {
    setUser(null)
  }

  // 페이지 로드 시 로그인 상태 확인 (로컬 스토리지에서)
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // 사용자 정보가 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        showLoginModal,
        showRegisterModal,
        setShowLoginModal,
        setShowRegisterModal,
      }}
    >
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
