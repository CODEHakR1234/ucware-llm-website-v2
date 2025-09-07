'use client'

import { useAuth } from '@/contexts/AuthContext'
import { User, Settings, Archive, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const { user } = useAuth()

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none' }}
      />
      
      {/* 사이드바 */}
      <div className={`fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-2xl dark:bg-neutral-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ display: isOpen ? 'block' : 'none' }}>
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              메뉴
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 프로필 섹션 */}
          <div className="border-b border-gray-200 p-4 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="프로필"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user?.username || '사용자'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* 메뉴 아이템들 */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onNavigate('profile')
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                  <Settings className="h-5 w-5" />
                  <span>계정 정보 수정</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('archive')
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                  <Archive className="h-5 w-5" />
                  <span>아카이브</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
