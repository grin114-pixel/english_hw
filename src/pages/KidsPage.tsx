import { useState, useEffect, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Card } from '../types'
import KidsHomeworkCard from '../components/KidsHomeworkCard'

export default function KidsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('type', 'homework')

    if (cardError) { console.error(cardError); setLoading(false); return }

    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('*')
      .order('order_index', { ascending: true })

    if (itemError) { console.error(itemError); setLoading(false); return }

    const combined: Card[] = (cardData || []).map((card) => ({
      ...card,
      items: (itemData || []).filter((item) => item.card_id === card.id),
    }))

    setCards(combined)
    setLoading(false)
  }, [])

  useEffect(() => {
    const manifestEl = document.querySelector<HTMLLinkElement>('#pwa-manifest')
    const prevHref = manifestEl?.getAttribute('href') ?? null
    if (manifestEl) manifestEl.setAttribute('href', '/manifest-kids.webmanifest')

    fetchCards()

    const channel = supabase
      .channel('kids-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchCards()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
        fetchCards()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (manifestEl && prevHref) manifestEl.setAttribute('href', prevHref)
      if (manifestEl && prevHref === null) manifestEl.removeAttribute('href')
    }
  }, [fetchCards])

  const handleToggleItem = async (cardId: string, itemId: string, checked: boolean) => {
    const card = cards.find((c) => c.id === cardId)
    const item = card?.items.find((i) => i.id === itemId)
    const sourceItemId = item?.source_item_id ?? null

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, is_checked: checked } : i)) }
        }
        return c
      })
    )

    await supabase.from('items').update({ is_checked: checked }).eq('id', itemId)
    if (sourceItemId) {
      await supabase.from('items').update({ is_checked: checked }).eq('id', sourceItemId)
    }
  }

  const homeworkCards = [...cards].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0fdf8' }}>
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #ccfbf1 0%, #fef9c3 100%)',
          borderBottom: '1px solid #99f6e4',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #f4d06f)' }}
        >
          <BookOpen size={16} color="white" />
        </div>
        <div>
          <span className="text-base font-bold block leading-tight" style={{ color: '#0f766e' }}>
            연서의 숙제
          </span>
          <span className="text-xs" style={{ color: '#5eead4' }}>
            오늘도 잘할 수 있어요! 💪
          </span>
        </div>
      </header>

      <main className="px-4 py-4 pb-16 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#14b8a6', borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: '#5eead4' }}>불러오는 중...</p>
          </div>
        ) : homeworkCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#ccfbf1' }}
            >
              <BookOpen size={28} style={{ color: '#5eead4' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ color: '#0f766e' }}>
                아직 숙제가 없어요
              </p>
              <p className="text-xs" style={{ color: '#5eead4' }}>
                엄마가 숙제를 추가하면 여기에 보여요!
              </p>
            </div>
          </div>
        ) : (
          homeworkCards.map((card) => (
            <KidsHomeworkCard
              key={card.id}
              card={card}
              onToggleItem={handleToggleItem}
            />
          ))
        )}
      </main>
    </div>
  )
}
