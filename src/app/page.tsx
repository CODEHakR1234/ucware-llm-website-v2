'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import {
  FileText,
  Sparkles,
  MessageSquare,
  Star,
  Github,
  Menu,
  Search,
  Brain,
  Zap,
  Target,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthButtons, LoginModal, RegisterModal } from '@/components/auth'
import { Sidebar } from '@/components/layout'
import { ProfilePage, ArchivePage } from '@/components/pages'

/* ❷  클라이언트 전용 PdfSummaryForm – ssr: false */
const PdfSummaryFormNoSSR = dynamic(
  () => import('@/components/PdfSummaryForm'),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-sm text-gray-500">폼 로딩 중…</p>
    ),
  },
)

/* ❸  빌드 시 연도 한 번만 계산 */
import { cache } from 'react'
const buildYear = cache(() => new Date().getFullYear())

export default function HomePage() {
  const { isLoggedIn, showLoginModal, showRegisterModal, setShowLoginModal, setShowRegisterModal, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'archive'>('home')
  const [isDeepResearchMode, setIsDeepResearchMode] = useState(false)

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'home' | 'profile' | 'archive')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  return (
    <main className={`flex min-h-screen flex-col transition-all duration-500 ${
      isLoggedIn && isDeepResearchMode
        ? 'bg-gradient-to-b from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/50'
        : 'bg-gradient-to-b from-sky-50 to-white dark:from-neutral-900 dark:to-neutral-950'
    }`}>
      {/* 헤더 */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* 햄버거 버튼 */}
          {isLoggedIn && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-2 transition-colors duration-500 ${
                isLoggedIn && isDeepResearchMode
                  ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-700'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          
          {/* 로고 */}
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Sparkles className={`h-6 w-6 transition-colors duration-500 ${
              isLoggedIn && isDeepResearchMode
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
            }`} />
            <span className={`bg-clip-text text-transparent transition-all duration-500 ${
              isLoggedIn && isDeepResearchMode
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-400'
                : 'bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400'
            }`}>
              PDF Genie
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <AuthButtons />
          <a
            href="https://github.com/CODEHakR1234/ucware-llm-website"
            target="_blank"
            className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16 text-center">
        {isLoggedIn ? (
          // 로그인 상태 - 딥리서치 기능 소개
          <>
            <h2
              className="mx-auto max-w-2xl bg-gradient-to-r from-blue-600 to-green-500
                         bg-clip-text text-transparent text-4xl font-extrabold tracking-tight
                         sm:text-5xl break-keep"
            >
              안녕하세요, {user?.username}님! 👋
            </h2>
            
            <p className="mx-auto mt-6 max-w-2xl text-gray-600 dark:text-gray-300 break-keep">
              <span className="font-semibold text-blue-600 dark:text-blue-400">딥리서치 모드</span>로 
              더욱 정교하고 전문적인 PDF 분석을 경험해보세요.
            </p>

            {/* 딥리서치 특징 아이콘 */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { icon: Brain, label: 'AI 심층 분석', desc: '고급 AI가 문서를 깊이 있게 분석' },
                { icon: Search, label: '정밀 검색', desc: '핵심 내용을 정확하게 추출' },
                { icon: Target, label: '맞춤형 요약', desc: '사용자 목적에 맞는 맞춤 요약' },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-lg border border-green-200 dark:bg-green-900/30 dark:border-green-700"
                >
                  <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {desc}
                  </span>
                </div>
              ))}
            </div>

            {/* 딥리서치 모드 전환 버튼 */}
            <div className="mt-12">
              <button
                onClick={() => setIsDeepResearchMode(!isDeepResearchMode)}
                className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-200 ${
                  isDeepResearchMode
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                <Zap className="h-6 w-6" />
                {isDeepResearchMode ? '딥리서치 모드 활성화됨' : '딥리서치 모드로 전환'}
              </button>
              {isDeepResearchMode && (
                <p className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
                  ✨ 딥리서치 모드가 활성화되었습니다. 더 정교한 분석을 시작하세요!
                </p>
              )}
            </div>
          </>
        ) : (
          // 비로그인 상태 - 기존 소개
          <>
            <h2
              className="mx-auto max-w-2xl bg-gradient-to-r from-blue-600 to-green-500
                         bg-clip-text text-transparent text-4xl font-extrabold tracking-tight
                         sm:text-5xl break-keep"
            >
              긴&nbsp;PDF를<wbr /> 손쉽게<wbr /> 요약
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-gray-600 dark:text-gray-300 break-keep">
              LLM 기반 인공지능으로 논문·보고서 등 대용량 PDF를 정확하게
              요약하고,
              <br className="hidden sm:block" />
              <span className="font-medium">추가 질문</span>도 바로 가능해요.
            </p>

            {/* 특징 아이콘 */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { icon: FileText, label: 'URL 하나면 끝' },
                { icon: MessageSquare, label: '대화형 질문' },
                { icon: Star, label: '별점 & 피드백' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-md dark:bg-neutral-800"
                >
                  <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 요약 폼 (클라이언트 전용) */}
          <section className="mx-auto mb-24 w-full max-w-5xl px-6">
            <PdfSummaryFormNoSSR isDeepResearchMode={isLoggedIn && isDeepResearchMode} />
          </section>

          {/* 풋터 */}
          <footer className={`mt-auto py-6 text-center text-xs transition-all duration-500 ${
            isLoggedIn && isDeepResearchMode
              ? 'border-t border-green-200 text-green-600 dark:border-green-700 dark:text-green-400'
              : 'border-t border-gray-200 text-gray-500 dark:border-neutral-700 dark:text-gray-400'
          }`}>
            © {buildYear()} PDF Genie & UCWORKS. 모든 권리 보유.
          </footer>
        </div>
      </div>

      {/* 모바일 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      {/* 회원가입 모달 */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />

      {/* 오버레이 페이지들 */}
      {currentPage === 'profile' && (
        <div className="fixed inset-0 z-50">
          <ProfilePage onBack={handleBackToHome} />
        </div>
      )}

      {currentPage === 'archive' && (
        <div className="fixed inset-0 z-50">
          <ArchivePage onBack={handleBackToHome} />
        </div>
      )}
    </main>
  )
}

