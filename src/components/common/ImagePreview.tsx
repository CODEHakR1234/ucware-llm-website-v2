'use client'

import { useEffect, useState } from 'react'
import { X, ZoomIn, ExternalLink } from 'lucide-react'

interface ImagePreviewProps {
  src: string | Blob
  alt?: string
  className?: string
  thumbnail?: boolean
  enableModal?: boolean
}

export default function ImagePreview({ src, alt = '이미지', className = '', thumbnail = true, enableModal = true }: ImagePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageClick = () => {
    setIsExpanded(true)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // Blob을 URL로 변환하거나 원본 src 사용
  const imageSrc = src instanceof Blob ? URL.createObjectURL(src) : src
  const isInstantScheme = typeof imageSrc === 'string' && (imageSrc.startsWith('data:') || imageSrc.startsWith('blob:') || imageSrc.startsWith('file://'))
  const isEmptySrc = !src || (typeof src === 'string' && (src.trim() === '' || src === 'undefined' || src === 'null'))

  // data:/blob:/file:// 은 네트워크 로딩이 없어 로딩 오버레이를 즉시 제거
  useEffect(() => {
    if (isInstantScheme) {
      setImageLoading(false)
      setImageError(false)
    } else {
      setImageLoading(true)
      setImageError(false)
    }
  }, [imageSrc, isInstantScheme])

  // 빈 src 처리 (base64와 외부 URL은 제외)
  if (isEmptySrc) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 p-4 text-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <div className="mb-2 text-sm">이미지 URL이 없습니다</div>
        </div>
      </div>
    )
  }

  // URI 타입에 따른 외부 링크 표시 여부 결정
  const canOpenExternally = typeof src === 'string' && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('file://')

  if (imageError) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 p-4 text-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <div className="mb-2 text-sm">이미지를 불러올 수 없습니다</div>
          {canOpenExternally && (
            <a 
              href={typeof src === 'string' ? src : '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="h-3 w-3" />
              원본 링크 열기
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 이미지 썸네일 */}
      <div
        className={`relative ${enableModal ? 'cursor-pointer' : ''} overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 ${thumbnail ? 'h-48 md:h-64' : ''} ${className}`}
        {...(enableModal
          ? {
              onClick: handleImageClick,
              role: 'button' as const,
              tabIndex: 0,
              onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleImageClick()
                }
              },
            }
          : {})}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-neutral-800">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          loading={isInstantScheme ? 'eager' : 'lazy'}
          className={`${thumbnail ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain'} transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* 확대 아이콘 */}
        {enableModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/20">
            <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity hover:opacity-100" />
          </div>
        )}
      </div>

      {/* 확대 모달 */}
      {enableModal && isExpanded && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80 p-4">
          <div className="relative max-h-full max-w-full">
            <img
              src={imageSrc}
              alt={alt}
              className="max-h-full max-w-full rounded-lg shadow-2xl"
            />
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-70"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* 외부 링크 버튼 (조건부 표시) */}
            {canOpenExternally && (
              <a
                href={typeof src === 'string' ? src : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 top-16 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-70"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
