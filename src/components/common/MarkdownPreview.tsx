'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Eye, X } from 'lucide-react'
import { useState, isValidElement } from 'react'
import { convertUrlsToImages } from '@/utils/imageUtils'
import ImagePreview from './ImagePreview'

interface MarkdownPreviewProps {
  content: string
  title?: string
  isDeepResearchMode?: boolean
  showFullView?: boolean
  onFullView?: () => void
}

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

// ReactNode에서 순수 텍스트만 안전하게 추출
const extractText = (node: React.ReactNode): string => {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return extractText(el.props?.children)
  }
  return ''
}

export default function MarkdownPreview({ 
  content, 
  title = "분석 결과", 
  isDeepResearchMode = false,
  showFullView = false,
  onFullView
}: MarkdownPreviewProps) {
  const [showFullModal, setShowFullModal] = useState(false)
  
  // base64(data:), blob:, file:// 등 특수 스킴을 보존
  const allowAllUrls = (url: string) => url
  
  // 마크다운에서 제목 추출 (title이 없거나 빈 문자열일 때만)
  const extractedTitle = !title || title === "분석 결과" ? extractTitle(content) : title
  const displayTitle = extractedTitle || title || (isDeepResearchMode ? '딥리서치 분석 결과' : '요약 결과')
  
  // 이미지 URL을 마크다운 이미지 문법으로 변환
  const processedContent = convertUrlsToImages(content)

  return (
    <>
      {/* 미리보기 카드 */}
      <div className={`rounded-xl border p-4 transition-all duration-500 ${
        isDeepResearchMode
          ? 'border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20'
          : 'border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800/50'
      }`}>
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-lg font-semibold transition-colors duration-500 ${
            isDeepResearchMode
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {displayTitle}
          </h3>
          <div className="flex items-center gap-2">
            {showFullView && onFullView && (
              <button
                onClick={onFullView}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isDeepResearchMode
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
                }`}
              >
                <Eye className="h-4 w-4" />
                전체보기
              </button>
            )}
          </div>
        </div>

        {/* 미리보기 내용 (처음 몇 줄만) */}
        <div className={`prose prose-sm max-w-none transition-colors duration-500 ${
          isDeepResearchMode
            ? 'prose-green dark:prose-green'
            : 'prose-gray dark:prose-gray'
        }`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            urlTransform={allowAllUrls}
            components={{
              // 미리보기에서는 h1만 제거하고 h2부터 표시
              h1: () => null,
              // 이미지 컴포넌트 커스터마이징
              img: ({ src, alt, ...props }) => {
                if (!src) {
                  return null
                }
                return (
                  <ImagePreview 
                    src={src} 
                    alt={alt || '이미지'} 
                    className="my-4 max-w-full"
                    thumbnail={true}
                  />
                )
              },
              // 모든 텍스트 요소를 1줄로 제한
              p: ({ children, ...props }) => {
                const hasElementChild = Array.isArray(children)
                  ? children.some(c => isValidElement(c))
                  : isValidElement(children)
                if (hasElementChild) {
                  return <div {...props}>{children}</div>
                }
                const text = extractText(children)
                if (!text) return <div {...props}>{children}</div>
                const lines = text.split('\n')
                const first = lines[0]
                const truncated = lines.length > 1
                return (
                  <div {...props}>
                    {first}
                    {truncated && (
                      <span className="text-gray-500 dark:text-gray-400">...</span>
                    )}
                  </div>
                )
              },
              // 제목도 1줄로 제한
              h2: ({ children, ...props }) => {
                const text = extractText(children)
                return <div {...props} className="text-lg font-semibold">{text || children}</div>
              },
              h3: ({ children, ...props }) => {
                const text = extractText(children)
                return <div {...props} className="text-base font-semibold">{text || children}</div>
              },
              h4: ({ children, ...props }) => {
                const text = extractText(children)
                return <div {...props} className="text-sm font-semibold">{text || children}</div>
              },
              // 목록 완전히 제거 (미리보기에서는 목록 숨김)
              ul: () => null,
              ol: () => null,
              li: () => null,
              // 코드 블록 숨기기
              pre: () => null,
              code: () => null,
              // 테이블 숨기기
              table: () => null
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* 전체보기 모달 */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80 p-4">
          <div className="flex h-full w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl dark:bg-neutral-800">
            {/* 모달 헤더 */}
            <div className={`flex items-center justify-between border-b p-4 ${
              isDeepResearchMode
                ? 'border-green-200 dark:border-green-700'
                : 'border-gray-200 dark:border-neutral-700'
            }`}>
              <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                isDeepResearchMode
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {displayTitle} - 전체보기
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullModal(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className={`prose prose-lg max-w-none transition-colors duration-500 ${
                isDeepResearchMode
                  ? 'prose-green dark:prose-green'
                  : 'prose-gray dark:prose-gray'
              }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  urlTransform={allowAllUrls}
                  components={{
                    // 이미지 컴포넌트 커스터마이징
                    img: ({ src, alt, ...props }) => (
                      <ImagePreview 
                        src={src || ''} 
                        alt={alt || '이미지'} 
                        className="my-6"
                        thumbnail={false}
                      />
                    ),
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
