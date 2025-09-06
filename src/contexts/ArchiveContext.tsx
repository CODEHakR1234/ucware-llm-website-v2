'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ArchiveItem {
  id: string
  title: string
  content: string
  pdfUrl?: string
  createdAt: string
  language: string
  isDeepResearch: boolean
}

interface ArchiveContextType {
  archiveItems: ArchiveItem[]
  addToArchive: (item: Omit<ArchiveItem, 'id' | 'createdAt'>) => void
  removeFromArchive: (id: string) => void
  getArchiveItem: (id: string) => ArchiveItem | undefined
}

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined)

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([])

  // 로컬 스토리지에서 아카이브 데이터 로드
  useEffect(() => {
    const savedArchive = localStorage.getItem('pdf-archive')
    if (savedArchive) {
      try {
        setArchiveItems(JSON.parse(savedArchive))
      } catch (error) {
        console.error('Failed to load archive from localStorage:', error)
      }
    }
  }, [])

  // 아카이브 데이터가 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('pdf-archive', JSON.stringify(archiveItems))
  }, [archiveItems])

  const addToArchive = (item: Omit<ArchiveItem, 'id' | 'createdAt'>) => {
    const newItem: ArchiveItem = {
      ...item,
      id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
    }
    
    setArchiveItems(prev => [newItem, ...prev])
    return newItem.id
  }

  const removeFromArchive = (id: string) => {
    setArchiveItems(prev => prev.filter(item => item.id !== id))
  }

  const getArchiveItem = (id: string) => {
    return archiveItems.find(item => item.id === id)
  }

  return (
    <ArchiveContext.Provider
      value={{
        archiveItems,
        addToArchive,
        removeFromArchive,
        getArchiveItem,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  )
}

export function useArchive() {
  const context = useContext(ArchiveContext)
  if (context === undefined) {
    throw new Error('useArchive must be used within an ArchiveProvider')
  }
  return context
}
