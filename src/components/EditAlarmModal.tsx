import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import SlashDateInput from './SlashDateInput'
import { v4 as uuidv4 } from '../lib/uuid'
import type { Card } from '../types'

interface EditAlarmModalProps {
  card: Card
  onClose: () => void
  onSave: (cardId: string, date: string, items: { id: string; content: string }[]) => void
  /** 기본: 알림장 수정 */
  title?: string
}

export default function EditAlarmModal({ card, onClose, onSave, title = '알림장 수정' }: EditAlarmModalProps) {
  const [date, setDate] = useState(card.date)
  const [items, setItems] = useState<{ id: string; content: string }[]>(
    [...card.items]
      .sort((a, b) => a.order_index - b.order_index)
      .map((i) => ({ id: i.id, content: i.content }))
  )
  const [focusId, setFocusId] = useState<string | null>(null)

  const addItem = (afterIndex: number) => {
    const newId = uuidv4()
    const newItems = [...items]
    newItems.splice(afterIndex + 1, 0, { id: newId, content: '' })
    setItems(newItems)
    setFocusId(newId)
  }

  const updateItem = (id: string, content: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, content } : i)))
  }

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== id)
      return filtered.length === 0 ? [{ id: uuidv4(), content: '' }] : filtered
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem(index)
    }
    if (e.key === 'Backspace' && items[index].content === '' && items.length > 1) {
      e.preventDefault()
      deleteItem(id)
    }
  }

  const handleSave = () => {
    if (!date) return
    onSave(card.id, date, items.filter((i) => i.content.trim() !== ''))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(74, 64, 99, 0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-8 sm:pb-6"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 -8px 40px rgba(167, 154, 212, 0.25)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#4a4063' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:opacity-60 transition-opacity"
            style={{ backgroundColor: '#f0ebfa' }}
          >
            <X size={16} style={{ color: '#a99cd4' }} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#a99cd4' }}>
            날짜
          </label>
          <div
            className="w-full rounded-xl px-3 py-2.5 border focus-within:border-[#c7b8ea] transition-colors flex items-center justify-center"
            style={{ backgroundColor: '#faf8ff', borderColor: '#e8e0f7' }}
          >
            <SlashDateInput value={date} onChange={setDate} embedded className="w-full justify-center" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#a99cd4' }}>
            내용
          </label>
          <div
            className="rounded-xl px-3 py-2 border"
            style={{ backgroundColor: '#faf8ff', borderColor: '#e8e0f7', minHeight: '120px' }}
          >
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 py-1">
                <div
                  className="flex-shrink-0 w-4 h-4 rounded-full border-2"
                  style={{ borderColor: '#c7b8ea' }}
                />
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, item.id)}
                  autoFocus={focusId === item.id}
                  placeholder="항목 입력 후 Enter로 추가"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#4a4063' }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addItem(items.length - 1)}
            className="mt-2 flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
            style={{ color: '#a99cd4' }}
          >
            <Plus size={12} />
            항목 추가
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #c7b8ea, #a99cd4)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(169, 156, 212, 0.4)',
          }}
        >
          저장
        </button>
      </div>
    </div>
  )
}
