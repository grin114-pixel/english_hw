import { useEffect, useRef, useState } from 'react'
import { isValid, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'

function splitIso(value: string): { y: string; m: string; d: string } {
  const head = value && value.length >= 10 ? value.slice(0, 10) : ''
  if (!head || !/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return { y: '', m: '', d: '' }
  }
  const [y, m, d] = head.split('-')
  return { y: y ?? '', m: m ?? '', d: d ?? '' }
}

function joinIso(y: string, m: string, d: string): string | null {
  const yd = y.padStart(4, '0').slice(-4)
  const md = m.padStart(2, '0').slice(-2)
  const dd = d.padStart(2, '0').slice(-2)
  if (yd.length !== 4 || md.length !== 2 || dd.length !== 2) return null
  const iso = `${yd}-${md}-${dd}`
  return isValid(parseISO(iso)) ? iso : null
}

function validIsoFromProp(value: string): string {
  const head = value && value.length >= 10 ? value.slice(0, 10) : ''
  if (!head || !/^\d{4}-\d{2}-\d{2}$/.test(head)) return ''
  return isValid(parseISO(head)) ? head : ''
}

interface SlashDateInputProps {
  value: string
  onChange: (isoDate: string) => void
  onBlur?: () => void
  className?: string
  autoFocus?: boolean
  /** true면 바깥 카드/박스에 테두리가 있을 때 안쪽 테두리 생략 */
  embedded?: boolean
}

export default function SlashDateInput({
  value,
  onChange,
  onBlur,
  className = '',
  autoFocus = false,
  embedded = false,
}: SlashDateInputProps) {
  const { y: vy, m: vm, d: vd } = splitIso(value)
  const [y, setY] = useState(vy)
  const [m, setM] = useState(vm)
  const [d, setD] = useState(vd)
  const yRef = useRef<HTMLInputElement>(null)
  const nativeDateRef = useRef<HTMLInputElement>(null)
  const calendarOpenRef = useRef(false)

  const pickerValue = joinIso(y, m, d) ?? validIsoFromProp(value)

  const openNativeCalendar = () => {
    const el = nativeDateRef.current
    if (!el) return
    calendarOpenRef.current = true
    el.focus()
    const withPicker = el as HTMLInputElement & { showPicker?: () => void }
    try {
      if (typeof withPicker.showPicker === 'function') withPicker.showPicker()
      else el.click()
    } catch {
      el.click()
    }
    window.setTimeout(() => {
      calendarOpenRef.current = false
    }, 500)
  }

  useEffect(() => {
    if (autoFocus) yRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    const s = splitIso(value)
    setY(s.y)
    setM(s.m)
    setD(s.d)
  }, [value])

  const tryCommit = (ny: string, nm: string, nd: string) => {
    const iso = joinIso(ny, nm, nd)
    if (iso) onChange(iso)
  }

  const handleBlur = () => {
    if (calendarOpenRef.current) return
    const iso = joinIso(y, m, d)
    if (iso) {
      const s = splitIso(iso)
      setY(s.y)
      setM(s.m)
      setD(s.d)
    } else {
      const s = splitIso(value)
      setY(s.y)
      setM(s.m)
      setD(s.d)
    }
    onBlur?.()
  }

  const inputCls =
    'w-full min-w-0 bg-transparent outline-none text-sm font-semibold text-center tabular-nums'

  return (
    <div
      className={`relative flex items-center gap-1 ${embedded ? 'px-1 py-0.5' : 'rounded-lg px-2 py-1 border'} ${className}`}
      style={embedded ? { color: '#4a4063' } : { borderColor: '#c7b8ea', color: '#4a4063' }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) handleBlur()
      }}
    >
      <input
        ref={yRef}
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={y}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4)
          setY(v)
          tryCommit(v, m, d)
        }}
        className={inputCls}
        style={{ maxWidth: '4.25rem' }}
        aria-label="연도"
      />
      <span className="text-xs font-medium shrink-0" style={{ color: '#a99cd4' }}>
        /
      </span>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={m}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
          setM(v)
          tryCommit(y, v, d)
        }}
        className={inputCls}
        style={{ maxWidth: '2.25rem' }}
        aria-label="월"
      />
      <span className="text-xs font-medium shrink-0" style={{ color: '#a99cd4' }}>
        /
      </span>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={d}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
          setD(v)
          tryCommit(y, m, v)
        }}
        className={inputCls}
        style={{ maxWidth: '2.25rem' }}
        aria-label="일"
      />

      <input
        ref={nativeDateRef}
        type="date"
        value={pickerValue}
        onChange={(e) => {
          const v = e.target.value
          if (!v) return
          calendarOpenRef.current = false
          onChange(v)
          const s = splitIso(v)
          setY(s.y)
          setM(s.m)
          setD(s.d)
        }}
        onBlur={() => {
          window.setTimeout(() => {
            calendarOpenRef.current = false
          }, 100)
        }}
        tabIndex={-1}
        className="fixed left-0 top-0 w-px h-px p-0 m-0 opacity-0 overflow-hidden border-0"
        style={{ clipPath: 'inset(50%)' }}
        aria-hidden
      />

      <button
        type="button"
        onClick={openNativeCalendar}
        onMouseDown={(e) => e.preventDefault()}
        className="shrink-0 p-1 rounded-lg hover:opacity-70 transition-opacity ml-0.5"
        style={{ color: '#a99cd4' }}
        aria-label="달력에서 날짜 선택"
      >
        <Calendar size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
