'use client'

import { useState } from 'react'
import { FileText, Search, Filter, ArrowLeft, Calendar, Download, Trash2, X } from 'lucide-react'
import { useArchive } from '@/contexts/ArchiveContext'
import MarkdownPreview from '../common/MarkdownPreview'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// 마크다운에서 첫 번째 대제목(h1) 추출하는 함수
const extractTitle = (content: string): string => {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim()
    }
  }
  return ''
}

interface ArchivePageProps {
  onBack: () => void
}

export default function ArchivePage({ onBack }: ArchivePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [showFullView, setShowFullView] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const { archiveItems, removeFromArchive } = useArchive()

  const filteredItems = archiveItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || item.language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  const handleDelete = (id: string) => {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      removeFromArchive(id)
    }
  }

  const handleDownload = (item: any) => {
    // 마크다운 파일로 다운로드
    const blob = new Blob([item.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFullView = (item: any) => {
    setSelectedItem(item)
    setShowFullView(true)
  }

  return (
    <div className="min-h-screen bg-white/95 backdrop-blur-sm dark:bg-neutral-900/95">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            아카이브
          </h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-100"
              >
                <option value="all">모든 언어</option>
                <option value="KO">한국어</option>
                <option value="EN">영어</option>
              </select>
            </div>
          </div>
        </div>

        {/* 아카이브 목록 */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-neutral-800">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                {searchTerm || filterLanguage !== 'all' 
                  ? '검색 결과가 없습니다.' 
                  : '아직 저장된 요약이 없습니다.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{item.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`rounded px-2 py-1 text-xs font-medium ${
                          item.isDeepResearch
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {item.isDeepResearch ? '딥리서치' : '일반'} - {item.language}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                      title="다운로드"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* 마크다운 미리보기 */}
                <MarkdownPreview
                  content={item.content}
                  title=""
                  isDeepResearchMode={item.isDeepResearch}
                  showFullView={true}
                  onFullView={() => handleFullView(item)}
                />
              </div>
            ))
          )}
        </div>
      </main>

      {/* 전체보기 모달 */}
      {showFullView && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="flex h-full w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl dark:bg-neutral-800">
            {/* 모달 헤더 */}
            <div className={`flex items-center justify-between border-b p-4 ${
              selectedItem.isDeepResearch
                ? 'border-green-200 dark:border-green-700'
                : 'border-gray-200 dark:border-neutral-700'
            }`}>
              <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                selectedItem.isDeepResearch
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {(() => {
                  const extractedTitle = extractTitle(selectedItem.content)
                  return extractedTitle || selectedItem.title || (selectedItem.isDeepResearch ? '딥리서치 분석 결과' : '요약 결과')
                })()} - 전체보기
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedItem)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </button>
                <button
                  onClick={() => setShowFullView(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className={`prose prose-lg max-w-none transition-colors duration-500 ${
                selectedItem.isDeepResearch
                  ? 'prose-green dark:prose-green'
                  : 'prose-gray dark:prose-gray'
              }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {selectedItem.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
