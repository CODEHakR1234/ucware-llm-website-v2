'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link, FileText, Archive, X } from 'lucide-react'
import Spinner from '../common/Spinner'
import FollowUpCard from './FollowUpCard'
import FeedbackModal from './FeedbackModal'
import MarkdownPreview from '../common/MarkdownPreview'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useArchive } from '@/contexts/ArchiveContext'

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

export type Lang = 'KO' | 'EN' | 'CN' | 'JP'
const LANG_OPTIONS = [
  { value: 'KO', label: '한국어' },
  { value: 'EN', label: 'English' },
  { value: 'CN', label: '中文' },
  { value: 'JP', label: '日本語' },
] as const

type Phase = 'input' | 'summary'
type InputType = 'url' | 'file'

interface PdfSummaryFormProps {
  isDeepResearchMode?: boolean
}

export default function PdfSummaryForm({ isDeepResearchMode = false }: PdfSummaryFormProps) {
  /* ── 상태 ── */
  const [phase, setPhase] = useState<Phase>('input')
  const [inputType, setInputType] = useState<InputType>('url')
  const [status, setStatus] = useState<
    'idle' | 'loading-summary' | 'loading-followup' | 'submitting-feedback'
  >('idle')
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [lang, setLang] = useState<Lang>('KO')
  const [summary, setSummary] = useState('')
  const [followupLog, setFollowupLog] = useState<string[]>([])

  /* ── 평가 모달 ── */
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [thanks, setThanks] = useState(false)

  /* ── 전체보기 모달 ── */
  const [showFullView, setShowFullView] = useState(false)

  /* ── 파일 업로드 관련 ── */
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── 아카이브 관련 ── */
  const { addToArchive } = useArchive()

  const handleArchive = () => {
    if (!summary) return

    const title = isDeepResearchMode 
      ? `딥리서치 분석 - ${pdfUrl || uploadedFile?.name || 'PDF 문서'}`
      : `PDF 요약 - ${pdfUrl || uploadedFile?.name || 'PDF 문서'}`

    addToArchive({
      title,
      content: summary,
      pdfUrl: pdfUrl || undefined,
      language: lang,
      isDeepResearch: isDeepResearchMode,
    })

    alert('아카이브에 저장되었습니다!')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      setUploadedFile(file)
      setPdfUrl('') // URL 입력 초기화
    }
  }

  const handleFileRemove = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputTypeChange = (type: InputType) => {
    setInputType(type)
    if (type === 'url') {
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      setPdfUrl('')
    }
  }

  /* ── 파일 ID 유틸 ── */
  const fileIdRef = useRef<string | null>(null)
  const hash32 = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h.toString(16)
  }
  const genId = (url: string) => {
    const norm = url.trim().toLowerCase()
    const base = norm.split('/').pop()?.replace(/\W/g, '_') || 'file'
    return `fid_${hash32(norm)}_${base}`
  }

  /* ── 쿠키 유틸 함수 ── */
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || '';
    }
    return '';
  }

  /* ── API 호출 래퍼 ── */
  const callApi = useCallback(
    async (query: string, follow = false) => {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
      if (!fileIdRef.current) return

      setStatus(follow ? 'loading-followup' : 'loading-summary')
      setError('')

      try {
        const approxyPermit = getCookie('approxy_permit') || process.env.NEXT_PUBLIC_APPROXY_PERMIT || '';
        
        console.log('🔍 API 호출 시작:', {
          url: `${API}/api/summary`,
          pdfUrl,
          lang,
          fileId: fileIdRef.current,
          approxyPermit: approxyPermit ? '있음' : '없음'
        });
        
        const res = await fetch(`${API}/api/summary`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'cookie': approxyPermit ? `approxy_permit=${approxyPermit}` : ''
          },
          body: JSON.stringify({
            file_id: fileIdRef.current,
            pdf_url: pdfUrl,
            query,
            lang,
          })
        })
        
        console.log('📡 API 응답 상태:', {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        });
        
        if (!res.ok) {
          let errorMessage = ''
          switch (res.status) {
            case 404:
              errorMessage = 'PDF를 찾을 수 없습니다.'
              break
            case 401:
              errorMessage = '인증이 필요합니다. 쿠키를 확인해주세요.'
              break
            case 403:
              errorMessage = '접근 권한이 없습니다.'
              break
            case 500:
              errorMessage = '서버 내부 오류가 발생했습니다.'
              break
            case 503:
              errorMessage = '서버가 일시적으로 사용할 수 없습니다.'
              break
            default:
              errorMessage = `서버 오류 (${res.status})`
          }
          throw new Error(errorMessage)
        }

        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const answer = data.answer ?? data.summary ?? JSON.stringify(data)
        if (follow) {
          setFollowupLog(prev => [`Q: ${query}\nA: ${answer}`, ...prev])
        } else {
          setSummary(answer)
          setFollowupLog([])
          setPhase('summary')
        }
      } catch (e: unknown) {
      	if (e instanceof Error) {
          // 네트워크 오류 구분
          if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
            setError('❗ 네트워크 연결을 확인해주세요. 서버가 실행 중인지 확인해주세요.')
          } else if (e.message.includes('JSON')) {
            setError('❗ 서버 응답을 처리할 수 없습니다.')
          } else {
            setError(`❗ ${e.message}`)
          }
        } else {
          setError('❗ 예기치 못한 오류가 발생했습니다.')
        }
      } finally {
        setStatus('idle')
      }
    },
    [pdfUrl, lang],
  )

  /* ── 핸들러 ── */
  const handleSummary = () => {
    fileIdRef.current = genId(pdfUrl)
    callApi('SUMMARY_ALL')
  }
  const handleAsk = (q: string) => callApi(q, true)

  const submitFeedback = async () => {
    /* ── 기본 검증 ── */
    if (!rating) {
      alert('별점을 선택하세요!')
      return
    }
    if (!fileIdRef.current) {
      alert('먼저 요약을 생성해 주세요!')
      return
    }
    if (!pdfUrl.trim()) {
      alert('PDF URL이 필요합니다!')
      return
    }

    setStatus('submitting-feedback')
    const ctrl = new AbortController()

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

      const payload = {
        file_id: fileIdRef.current,
        pdf_url: pdfUrl,
        lang,
        rating,
        comment: comment.trim().slice(0, 500),
        usage_log: followupLog.slice(0, 10),
      }

      console.log('📝 피드백 요청 데이터:', payload);

      const approxyPermit = getCookie('approxy_permit') || process.env.NEXT_PUBLIC_APPROXY_PERMIT || '';
      
      const res = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'cookie': approxyPermit ? `approxy_permit=${approxyPermit}` : ''
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })

      if (!res.ok) throw new Error(`서버 오류 (${res.status})`)

      const { ok } = await res.json()
      if (!ok) throw new Error('저장 실패')

      /* ── 성공 UI: 모달 내부에 “감사합니다!” 메시지 표시 ── */
      setThanks(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        alert((err as Error).message)
      }
    } finally {
      setStatus('idle')
    }
  }


  /* ── 렌더 ── */
  return (
    <>
      {/* 컨테이너: summary 단계에만 2-열 그리드, layout prop으로 폭 전환 애니메이션 */}
      <motion.section
        layout
        className={`mx-auto ${
          phase === 'summary'
            ? 'grid max-w-5xl gap-6 md:grid-cols-2'
            : 'max-w-xl'
        }`}
      >
        {/* ── 왼쪽 카드: 입력 + (요약) ── */}
        <motion.section
          layout
          className={`flex h-full flex-col space-y-6 rounded-3xl border p-8 shadow-xl backdrop-blur-sm transition-all duration-500 ${
            isDeepResearchMode
              ? 'border-green-200 bg-green-50/80 dark:border-green-700 dark:bg-green-900/30'
              : 'border-gray-200 bg-white/80 dark:border-neutral-700 dark:bg-neutral-900/70'
          }`}
        >
          {/* 제목 */}
          <h1 className={`flex items-center gap-2 text-2xl font-extrabold transition-colors duration-500 ${
            isDeepResearchMode
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {isDeepResearchMode ? '딥리서치 PDF 분석' : 'PDF 요약'}
          </h1>

          {/* 입력 방식 선택 탭 */}
          <div className="space-y-4">
            <div className={`flex rounded-lg p-1 transition-colors duration-500 ${
              isDeepResearchMode
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-neutral-800'
            }`}>
              <button
                type="button"
                onClick={() => handleInputTypeChange('url')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  inputType === 'url'
                    ? isDeepResearchMode
                      ? 'bg-white text-green-600 shadow-sm dark:bg-green-800 dark:text-green-300'
                      : 'bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                <Link className="h-4 w-4" />
                URL 입력
              </button>
              <button
                type="button"
                onClick={() => handleInputTypeChange('file')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  inputType === 'file'
                    ? isDeepResearchMode
                      ? 'bg-white text-green-600 shadow-sm dark:bg-green-800 dark:text-green-300'
                      : 'bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                <Upload className="h-4 w-4" />
                파일 업로드
              </button>
            </div>

            {/* URL 입력 */}
            {inputType === 'url' && (
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  PDF URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={pdfUrl}
                  onChange={e => setPdfUrl(e.target.value)}
                  placeholder="https://arxiv.org/pdf/xxxx.pdf"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                             shadow-sm focus:border-blue-500 focus:outline-none
                             focus:ring focus:ring-blue-200 dark:border-neutral-700
                             dark:bg-neutral-800 dark:text-gray-100"
                />
              </div>
            )}

            {/* 파일 업로드 */}
            {inputType === 'file' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  PDF 파일 업로드
                </label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {!uploadedFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 hover:bg-blue-50 dark:border-neutral-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          PDF 파일을 선택하거나 드래그하세요
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          최대 10MB, PDF 형식만 지원
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleFileRemove}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 언어 선택 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor="lang" className="text-sm font-medium">
              응답 언어
            </label>
            <select
              id="lang"
              value={lang}
              onChange={e => setLang(e.target.value as Lang)}
              className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm
                         shadow-sm focus:border-blue-500 focus:outline-none
                         focus:ring focus:ring-blue-200 dark:border-neutral-700
                         dark:bg-neutral-800 dark:text-gray-100"
            >
              {LANG_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 요약 버튼 */}
          <button
            onClick={handleSummary}
            disabled={status === 'loading-summary' || (inputType === 'url' ? !pdfUrl : !uploadedFile)}
            className={`relative flex w-full items-center justify-center gap-2 rounded-lg py-2 font-semibold text-white shadow-lg transition-colors disabled:opacity-60 ${
              isDeepResearchMode
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading-summary' && <Spinner />}
            <span>
              {phase === 'input' 
                ? (isDeepResearchMode ? '딥리서치 분석 시작' : '요약 만들기')
                : '요약'
              }
            </span>
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* 요약 결과 */}
          {phase === 'summary' && (
            <div className="flex flex-col space-y-4">
              <MarkdownPreview
                content={summary}
                title=""
                isDeepResearchMode={isDeepResearchMode}
                showFullView={true}
                onFullView={() => setShowFullView(true)}
              />
            </div>
          )}
        </motion.section>

        {/* ── 오른쪽: FollowUpCard (AnimatePresence로 부드럽게 등장) ── */}
        <AnimatePresence mode="wait">
          {phase === 'summary' && (
            <FollowUpCard
              key="followup"
              busy={status === 'loading-followup'}
              followupLog={followupLog}
              onAsk={handleAsk}
              onOpenFeedback={() => {
                setShowFeedback(true)
                setThanks(false)
              }}
              isDeepResearchMode={isDeepResearchMode}
            />
          )}
        </AnimatePresence>
      </motion.section>

      {/* 전체보기 모달 */}
      {showFullView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
                {(() => {
                  const extractedTitle = extractTitle(summary)
                  return extractedTitle || (isDeepResearchMode ? '딥리서치 분석 결과' : '요약 결과')
                })()} - 전체보기
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleArchive}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isDeepResearchMode
                      ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                >
                  <Archive className="h-4 w-4" />
                  아카이브에 저장
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
                isDeepResearchMode
                  ? 'prose-green dark:prose-green'
                  : 'prose-gray dark:prose-gray'
              }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 평가 모달 */}
      {showFeedback && (
        <FeedbackModal
          rating={rating}
          comment={comment}
          onRating={setRating}
          onComment={setComment}
          busy={status === 'submitting-feedback'}
          thanks={thanks}
          onSubmit={submitFeedback}
          onClose={() => {
            setShowFeedback(false)
            setRating(0)
            setComment('')
            setThanks(false)
          }}
        />
      )}
    </>
  )
}

