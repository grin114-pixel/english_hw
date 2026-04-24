import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Star } from 'lucide-react'
import type { Card, CardItem } from '../types'

interface KidsHomeworkCardProps {
  card: Card
  onToggleItem: (cardId: string, itemId: string, checked: boolean) => void
}

function formatDateNoYear(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    return format(d, 'MM. dd (EEE)', { locale: ko })
  } catch {
    return dateStr
  }
}

export default function KidsHomeworkCard({ card, onToggleItem }: KidsHomeworkCardProps) {
  const sortedItems = [...card.items].sort((a, b) => a.order_index - b.order_index)
  const doneCount = sortedItems.filter((i) => i.is_checked).length
  const totalCount = sortedItems.length
  const allDone = totalCount > 0 && doneCount === totalCount

  return (
    <div
      className="rounded-2xl p-4 mb-6 transition-all duration-200"
      style={{
        background: allDone
          ? 'linear-gradient(135deg, #d1fae5 0%, #fef9c3 100%)'
          : 'linear-gradient(135deg, #ddf4ee 0%, #fdf6d3 100%)',
        border: `2px solid ${allDone ? '#6ee7b7' : '#7dd3c7'}`,
        boxShadow: '0 8px 32px rgba(15, 118, 110, 0.18), 0 0 0 1px rgba(255,255,255,0.55) inset',
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
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#0f766e' }}
        >
          {doneCount}/{totalCount}
        </span>
      </div>

      {totalCount > 0 && (
        <div
          className="w-full rounded-full h-2.5 mb-3 overflow-hidden"
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

      <div className="space-y-1">
        {sortedItems.map((item: CardItem) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggleItem(card.id, item.id, !item.is_checked)}
            className="flex items-center gap-3 w-full text-left py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-[0.98]"
          >
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
              style={{
                borderColor: item.is_checked ? '#14b8a6' : '#7dd3c7',
                backgroundColor: item.is_checked ? '#14b8a6' : 'transparent',
              }}
            >
              {item.is_checked && (
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span
              className="flex-1 text-sm leading-relaxed transition-all duration-200"
              style={{
                color: item.is_checked ? '#86efac' : '#0f766e',
                textDecoration: item.is_checked ? 'line-through' : 'none',
                fontWeight: item.is_checked ? 400 : 500,
              }}
            >
              {item.content}
            </span>
          </button>
        ))}
      </div>

      {allDone && (
        <div
          className="mt-3 text-center text-xs font-semibold py-1.5 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: '#0f766e' }}
        >
          🎉 숙제 완료! 잘했어요!
        </div>
      )}
    </div>
  )
}
