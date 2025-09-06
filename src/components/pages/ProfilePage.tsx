'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Save, ArrowLeft, Camera } from 'lucide-react'

interface ProfilePageProps {
  onBack: () => void
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profileImage: user?.profileImage || '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 임시 저장 로직 (실제 API 연결 전)
    setTimeout(() => {
      if (user) {
        login({
          ...user,
          username: formData.username,
          email: formData.email,
          profileImage: formData.profileImage,
        })
      }
      setIsLoading(false)
      alert('프로필이 업데이트되었습니다.')
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white/95 backdrop-blur-sm dark:bg-neutral-900/95">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            계정 정보 수정
          </h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-700">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="프로필"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  프로필 사진
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  프로필 사진을 업로드하세요
                </p>
              </div>
            </div>

            {/* 사용자명 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-100"
                placeholder="사용자명을 입력하세요"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-100"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 프로필 이미지 URL */}
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                프로필 이미지 URL
              </label>
              <input
                type="url"
                id="profileImage"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-100"
                placeholder="이미지 URL을 입력하세요"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Save className="h-4 w-4" />
                {isLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
