import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { X, Check, Star, Plus } from 'lucide-react'
import type { Card, CardItem } from '../types'
import { v4 as uuidv4 } from '../lib/uuid'

interface HomeworkSelectorModalProps {
  alarmCards: Card[]
  onClose: () => void
  onCreateHomework: (selectedItems: { source_item_id: string | null; content: string }[]) => void
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy. MM. dd (EEE)', { locale: ko })
  } catch {
    return dateStr
  }
}

export default function HomeworkSelectorModal({
  alarmCards,
  onClose,
  onCreateHomework,
}: HomeworkSelectorModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [customIds, setCustomIds] = useState<string[]>([])
  const [focusCustomId, setFocusCustomId] = useState<string | null>(null)

  const sortedCards = [...alarmCards].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const allItems: { card: Card; item: CardItem }[] = sortedCards.flatMap((card) =>
    [...card.items]
      .sort((a, b) => a.order_index - b.order_index)
      .map((item) => ({ card, item }))
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setDraft((d) => {
          if (!(id in d)) return d
          const { [id]: _, ...rest } = d
          return rest
        })
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedList = useMemo(() => {
    const fromCards = allItems
      .filter(({ item }) => selected.has(item.id))
      .map(({ item }) => {
        const content = (draft[item.id] ?? item.content).trimEnd()
        const isModified = draft[item.id] !== undefined && draft[item.id].trimEnd() !== item.content.trimEnd()
        return {
          source_item_id: isModified ? null : item.id,
          content,
        }
      })

    const custom = customIds.map((id) => ({
      source_item_id: null,
      content: (draft[id] ?? '').trimEnd(),
    }))

    return [...fromCards, ...custom].filter((i) => i.content.trim() !== '')
  }, [allItems, selected, draft, customIds])

  const handleCreate = () => {
    if (selectedList.length === 0) return
    onCreateHomework(selectedList)
  }

  const addCustomItem = () => {
    const id = `custom:${uuidv4()}`
    setCustomIds((prev) => [...prev, id])
    setDraft((prev) => ({ ...prev, [id]: '' }))
    setFocusCustomId(id)
  }

  const removeCustomItem = (id: string) => {
    setCustomIds((prev) => prev.filter((x) => x !== id))
    setDraft((d) => {
      if (!(id in d)) return d
      const { [id]: _, ...rest } = d
      return rest
    })
    setFocusCustomId((prev) => (prev === id ? null : prev))
  }

  const hasSelection = selected.size > 0 || customIds.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#faf8ff' }}
    >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-4"
        style={{
          background: 'linear-gradient(135deg, #e8d8f8 0%, #d8eeff 100%)',
          borderBottom: '1px solid #e0d0f4',
        }}
      >
        <div className="flex items-center gap-2">
          <Star size={16} fill="#c7b8ea" style={{ color: '#c7b8ea' }} />
          <h2 className="text-base font-bold" style={{ color: '#4a4063' }}>
            오늘의 숙제 만들기
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:opacity-60 transition-opacity"
          style={{ backgroundColor: '#ede4f8' }}
        >
          <X size={16} style={{ color: '#a99cd4' }} />
        </button>
      </div>

      {/* 전체 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-6">
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
            <p className="text-sm" style={{ color: '#a99cd4' }}>
              알림장이 없습니다.
            </p>
          </div>
        ) : (
          <>


            {/* 알림장 목록 */}
            {sortedCards.map((card) => {
              const cardItems = [...card.items]
                .filter((item) => !item.is_checked)
                .sort((a, b) => a.order_index - b.order_index)
              if (cardItems.length === 0) return null
              return (
                <div key={card.id} className="mb-4">
                  <div
                    className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: '#a99cd4' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c7b8ea' }} />
                    {formatDate(card.date)}
                  </div>
                  <div
                    className="rounded-2xl overflow-hidden border"
                    style={{ borderColor: '#e8e0f7' }}
                  >
                    {cardItems.map((item) => {
                      const isSelected = selected.has(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggle(item.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 border-b last:border-b-0"
                          style={{
                            backgroundColor: isSelected ? '#f0e8ff' : '#ffffff',
                            borderColor: '#f0ecf8',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                            style={{
                              borderColor: isSelected ? '#a99cd4' : '#d4c9ed',
                              backgroundColor: isSelected ? '#c7b8ea' : 'transparent',
                            }}
                          >
                            {isSelected && (
                              <Check size={10} style={{ color: '#ffffff' }} strokeWidth={3} />
                            )}
                          </div>
                          <span
                            className="flex-1 text-sm"
                            style={{
                              color: item.is_checked ? '#c8c2d8' : '#4a4063',
                              textDecoration: item.is_checked ? 'line-through' : 'none',
                            }}
                          >
                            {item.content}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* 선택한 항목 — 목록 아래에 바로 이어짐 */}
        {hasSelection && (
          <div
            className="mt-2 pt-4 pb-2"
            style={{ borderTop: '1px solid #e8e0f7' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: '#a99cd4' }}>
                선택한 항목
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="text-xs hover:opacity-70 transition-opacity inline-flex items-center gap-1"
                  style={{ color: '#a99cd4' }}
                >
                  <Plus size={12} />
                  직접 추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set())
                    setCustomIds([])
                    setDraft({})
                    setFocusCustomId(null)
                  }}
                  className="text-xs hover:opacity-70 transition-opacity"
                  style={{ color: '#a99cd4' }}
                >
                  전체 해제
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl border overflow-hidden mb-4"
              style={{ borderColor: '#e8e0f7', backgroundColor: '#ffffff' }}
            >
              {allItems
                .filter(({ item }) => selected.has(item.id))
                .map(({ card, item }) => {
                  const key = item.id
                  const value = draft[key] ?? item.content
                  return (
                    <div
                      key={key}
                      className="px-4 py-3 border-b last:border-b-0"
                      style={{ borderColor: '#f0ecf8' }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: '#a99cd4' }}>
                          {formatDate(card.date)}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className="text-[11px] hover:opacity-70 transition-opacity"
                          style={{ color: '#a99cd4' }}
                        >
                          선택 해제
                        </button>
                      </div>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder="숙제에 넣을 문장을 수정할 수 있어요"
                        className="w-full bg-transparent outline-none text-sm"
                        style={{ color: '#4a4063' }}
                        autoFocus={false}
                      />
                    </div>
                  )
                })}

              {customIds.map((id) => {
                const value = draft[id] ?? ''
                return (
                  <div
                    key={id}
                    className="px-4 py-3 border-b last:border-b-0"
                    style={{ borderColor: '#f0ecf8' }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: '#a99cd4' }}>
                        직접 추가
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomItem(id)}
                        className="text-[11px] hover:opacity-70 transition-opacity"
                        style={{ color: '#a99cd4' }}
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem()
                        }
                      }}
                      placeholder="직접 숙제 항목을 입력하세요"
                      className="w-full bg-transparent outline-none text-sm"
                      style={{ color: '#4a4063' }}
                      autoFocus={focusCustomId === id}
                    />
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #c7b8ea, #a99cd4)',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(169, 156, 212, 0.4)',
              }}
            >
              <Star size={14} fill="white" />
              {selectedList.length}개로 오늘의 숙제 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
