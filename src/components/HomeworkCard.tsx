import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Star, Pencil, Trash2, Check } from 'lucide-react'
import type { Card, CardItem } from '../types'
import CheckboxItem from './CheckboxItem'
import EditAlarmModal from './EditAlarmModal'

interface HomeworkCardProps {
  card: Card
  onToggleItem: (cardId: string, itemId: string, checked: boolean) => void
  onDelete: (id: string) => void
  onUpdateCard: (cardId: string, date: string, items: { id: string; content: string }[]) => void
  onAddItem: (cardId: string, content: string, afterIndex: number) => void
  onDeleteItem: (cardId: string, itemId: string) => void
  onUpdateItem: (cardId: string, itemId: string, content: string) => void
}

function formatDateNoYear(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    return format(d, 'MM. dd (EEE)', { locale: ko })
  } catch {
    return dateStr
  }
}

export default function HomeworkCard({
  card,
  onToggleItem,
  onDelete,
  onUpdateCard,
  onDeleteItem,
  onUpdateItem,
}: HomeworkCardProps) {
  const sortedItems = [...card.items].sort((a, b) => a.order_index - b.order_index)
  const doneCount = sortedItems.filter((i) => i.is_checked).length
  const totalCount = sortedItems.length
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div
      className="rounded-2xl p-4 mb-6 transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, #ddf4ee 0%, #fdf6d3 100%)',
        border: '2px solid #7dd3c7',
        boxShadow:
          '0 8px 32px rgba(15, 118, 110, 0.22), 0 0 0 1px rgba(255,255,255,0.55) inset',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5">
            <Star size={14} fill="#14b8a6" style={{ color: '#0f766e' }} />
            <span className="text-sm font-bold" style={{ color: '#0f766e' }}>
              오늘의 숙제
            </span>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#0f766e' }}
          >
            {formatDateNoYear(card.date)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="hover:opacity-60 transition-opacity p-1 rounded-lg"
            style={{ color: '#c8c2d8' }}
            aria-label="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="hover:opacity-60 transition-opacity p-1 rounded-lg"
            style={{ color: '#c8c2d8' }}
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div
          className="w-full rounded-full h-2 mb-3 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(doneCount / totalCount) * 100}%`,
              background: 'linear-gradient(90deg, #14b8a6, #f4d06f)',
            }}
          />
        </div>
      )}

      <div className="space-y-0.5">
        {sortedItems.map((item: CardItem) => (
          <CheckboxItem
            key={item.id}
            item={item}
            onToggle={(itemId, checked) => onToggleItem(card.id, itemId, checked)}
            editable={false}
            tag={
              item.source_item_id
                ? undefined
                : (
                    <Check size={12} strokeWidth={3} className="block" />
                  )
            }
          />
        ))}
      </div>

      {showEditModal && (
        <EditAlarmModal
          card={card}
          title="오늘의 숙제 수정"
          onClose={() => setShowEditModal(false)}
          onSave={(cardId, date, items) => {
            onUpdateCard(cardId, date, items)
            setShowEditModal(false)
          }}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(74, 64, 99, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-lg"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e8e0f7' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-homework-title"
          >
            <h3 id="delete-homework-title" className="text-base font-bold mb-1" style={{ color: '#4a4063' }}>
              오늘의 숙제 삭제
            </h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: '#8b7faa' }}>
              이 숙제 카드를 삭제할까요?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#f0ebfa', color: '#6b5b8a' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(card.id)
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#e8d4e8', color: '#8b5a7a' }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
