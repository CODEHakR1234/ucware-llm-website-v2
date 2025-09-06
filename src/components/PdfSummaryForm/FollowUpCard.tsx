'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Spinner from '../common/Spinner'

type Props = {
  busy: boolean
  followupLog: string[]
  onAsk: (q: string) => void
  onOpenFeedback: () => void
  isDeepResearchMode?: boolean
}

export default function FollowUpCard({
  busy,
  followupLog,
  onAsk,
  onOpenFeedback,
  isDeepResearchMode = false,
}: Props) {
  const [q, setQ] = useState('')
  const ask = () => {
    if (!q.trim()) return
    onAsk(q)
    setQ('')
  }

  return (
    <motion.section
      /* 슬라이드-인 + 페이드-인 */
      initial={{ opacity: 0, x: 64 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 64 }}
      transition={{ duration: 0.35 }}
      className={`flex h-full flex-col rounded-3xl border p-8 shadow-xl transition-all duration-500 ${
        isDeepResearchMode
          ? 'border-green-200 bg-green-50/80 dark:border-green-700 dark:bg-green-900/30'
          : 'border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
      }`}
    >
      {/* ── 입력 ── */}
      <div className="space-y-2">
        <h2 className={`flex items-center gap-2 text-lg font-bold transition-colors duration-500 ${
          isDeepResearchMode
            ? 'text-green-700 dark:text-green-300'
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {isDeepResearchMode ? '딥리서치 질문' : '추가 질문'}
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="xxx가 뭐야?"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm
                       shadow-sm focus:border-green-600 focus:outline-none
                       focus:ring focus:ring-green-200 dark:border-neutral-700
                       dark:bg-neutral-800 dark:text-gray-100"
          />
          <button
            onClick={ask}
            disabled={busy || !q}
            className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isDeepResearchMode
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {busy && <Spinner />}
            <span>
              {busy 
                ? (isDeepResearchMode ? '분석 중…' : '답변 중…')
                : (isDeepResearchMode ? '딥리서치 질문' : '질문하기')
              }
            </span>
          </button>
        </div>
      </div>

      {/* ── 로그 (내부 스크롤) ── */}
      {followupLog.length > 0 && (
        <details
          open
          className={`flex-grow rounded-xl px-6 py-4 transition-colors duration-500 ${
            isDeepResearchMode
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-gray-50 dark:bg-neutral-800/50'
          }`}
        >
          <summary className="cursor-pointer text-sm font-medium">
            추가 질문 기록
          </summary>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
            <ul className="space-y-4 text-sm">
              {followupLog.map((item, i) => (
                <li
                  key={i}
                  className="whitespace-pre-wrap rounded-lg border border-gray-200
                             bg-white p-4 shadow-sm dark:border-neutral-700
                             dark:bg-neutral-900/40"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {/* ── 평가 버튼 ── */}
      <button
        onClick={onOpenFeedback}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2 font-semibold
                   text-white shadow-lg hover:bg-blue-700"
      >
        서비스 평가하기 ⭐
      </button>
    </motion.section>
  )
}

