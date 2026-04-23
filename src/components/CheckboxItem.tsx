import type { CardItem } from '../types'

interface CheckboxItemProps {
  item: CardItem
  onToggle: (id: string, checked: boolean) => void
  onContentChange?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onAddNext?: () => void
  editable?: boolean
  autoFocus?: boolean
  tag?: React.ReactNode
}

export default function CheckboxItem({
  item,
  onToggle,
  onContentChange,
  onDelete,
  onAddNext,
  editable = false,
  autoFocus = false,
  tag,
}: CheckboxItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddNext?.()
    }
    if (e.key === 'Backspace' && item.content === '') {
      e.preventDefault()
      onDelete?.(item.id)
    }
  }

  return (
    <div className="flex items-center gap-2 py-1 group">
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.is_checked)}
        className="flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] transition-all duration-200 flex items-center justify-center"
        style={{
          borderColor: item.is_checked ? '#c8c2d8' : '#a99cd4',
          backgroundColor: item.is_checked ? '#c8c2d8' : 'transparent',
        }}
        aria-label={item.is_checked ? '체크 해제' : '체크'}
      >
        {item.is_checked && (
          <svg width="7" height="6" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        {editable ? (
          <input
            type="text"
            value={item.content}
            onChange={(e) => onContentChange?.(item.id, e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder="항목을 입력하세요"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm py-0.5 transition-all duration-200"
            style={{
              color: item.is_checked ? '#c8c2d8' : '#4a4063',
              textDecoration: item.is_checked ? 'line-through' : 'none',
            }}
          />
        ) : (
          <span
            className="flex-1 min-w-0 text-sm leading-relaxed transition-all duration-200"
            style={{
              color: item.is_checked ? '#c8c2d8' : '#4a4063',
              textDecoration: item.is_checked ? 'line-through' : 'none',
            }}
          >
            {item.content}
          </span>
        )}

        {tag && (
          <span
            className="shrink-0 inline-flex items-center justify-center text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
            style={{ backgroundColor: '#f0ebfa', color: '#a99cd4' }}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  )
}
