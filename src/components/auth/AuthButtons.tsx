'use client'

import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut } from 'lucide-react'

export default function AuthButtons() {
  const { isLoggedIn, user, setShowLoginModal, setShowRegisterModal, logout } = useAuth()

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <User className="h-4 w-4" />
          <span>{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowLoginModal(true)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
      >
        로그인
      </button>
      <button
        onClick={() => setShowRegisterModal(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        회원가입
      </button>
    </div>
  )
}
