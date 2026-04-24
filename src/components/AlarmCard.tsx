import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trash2, Calendar, Pencil } from 'lucide-react'
import type { Card, CardItem } from '../types'
import CheckboxItem from './CheckboxItem'
import EditAlarmModal from './EditAlarmModal'
import SlashDateInput from './SlashDateInput'

interface AlarmCardProps {
  card: Card
  onDelete: (id: string) => void
  onToggleItem: (cardId: string, itemId: string, checked: boolean) => void
  onUpdateDate: (cardId: string, date: string) => void
  onUpdateCard: (cardId: string, date: string, items: { id: string; content: string }[]) => void
}

function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    return format(d, 'yyyy. MM. dd (EEE)', { locale: ko })
  } catch {
    return dateStr
  }
}

export default function AlarmCard({
  card,
  onDelete,
  onToggleItem,
  onUpdateDate,
  onUpdateCard,
}: AlarmCardProps) {
  const [editingDate, setEditingDate] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSlashDateChange = (iso: string) => {
    onUpdateDate(card.id, iso)
  }

  const sortedItems = [...card.items].sort((a, b) => a.order_index - b.order_index)

  return (
    <div
      className="rounded-2xl shadow-sm border px-4 pb-4 mb-6 transition-all duration-200 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f3eaff 0%, #eaf4ff 42%, #ffeaf5 100%)',
        border: '2px solid #d8b4fe',
        boxShadow:
          '0 8px 28px rgba(139, 92, 246, 0.16), 0 0 0 1px rgba(255,255,255,0.6) inset',
      }}
    >
      <div
        className="flex items-center justify-between -mx-4 px-4 py-2 mb-3"
        style={{ backgroundColor: 'rgba(216, 180, 254, 0.35)' }}
      >
        <div className="flex items-center gap-2">
          {editingDate ? (
            <SlashDateInput
              value={card.date}
              onChange={handleSlashDateChange}
              onBlur={() => setEditingDate(false)}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingDate(true)}
              className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
              style={{ color: '#4a4063' }}
            >
              <Calendar size={13} style={{ color: '#a99cd4' }} />
              {formatDate(card.date)}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="hover:opacity-60 transition-opacity p-1 rounded-lg"
            style={{ color: '#c8c2d8' }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="hover:opacity-60 transition-opacity p-1 rounded-lg"
            style={{ color: '#c8c2d8' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-0.5">
        {sortedItems.map((item: CardItem) => (
          <CheckboxItem
            key={item.id}
            item={item}
            onToggle={(itemId, checked) => onToggleItem(card.id, itemId, checked)}
            editable={false}
          />
        ))}
      </div>

      {showEditModal && (
        <EditAlarmModal
          card={card}
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
            aria-labelledby="delete-alarm-title"
          >
            <h3 id="delete-alarm-title" className="text-base font-bold mb-1" style={{ color: '#4a4063' }}>
              알림장 삭제
            </h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: '#8b7faa' }}>
              이 알림장을 삭제할까요?
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
