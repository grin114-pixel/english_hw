import { useState, useEffect, useCallback } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 } from './lib/uuid'
import type { Card, CardItem } from './types'
import AlarmCard from './components/AlarmCard'
import HomeworkCard from './components/HomeworkCard'
import NewAlarmModal from './components/NewAlarmModal'
import HomeworkSelectorModal from './components/HomeworkSelectorModal'

export default function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAlarm, setShowNewAlarm] = useState(false)
  const [showHomeworkSelector, setShowHomeworkSelector] = useState(false)

  const fetchCards = useCallback(async () => {
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .order('date', { ascending: true })

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

  useEffect(() => { fetchCards() }, [fetchCards])

  const alarmCards = cards
    .filter((c) => c.type === 'alarm')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const homeworkCards = cards
    .filter((c) => c.type === 'homework')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleCreateAlarm = async (
    date: string,
    items: Omit<CardItem, 'id' | 'card_id' | 'created_at'>[]
  ) => {
    const cardId = uuidv4()
    const now = new Date().toISOString()

    const newCard: Card = {
      id: cardId,
      type: 'alarm',
      date,
      created_at: now,
      items: items.map((item, idx) => ({
        id: uuidv4(),
        card_id: cardId,
        created_at: now,
        ...item,
        order_index: idx,
      })),
    }

    setCards((prev) => [...prev, newCard])
    setShowNewAlarm(false)

    const { error: cardError } = await supabase
      .from('cards')
      .insert({ id: cardId, type: 'alarm', date, created_at: now })
    if (cardError) { console.error(cardError); return }

    if (newCard.items.length > 0) {
      const { error: itemError } = await supabase.from('items').insert(
        newCard.items.map((i) => ({
          id: i.id,
          card_id: cardId,
          content: i.content,
          is_checked: i.is_checked,
          order_index: i.order_index,
          source_item_id: null,
          created_at: now,
        }))
      )
      if (itemError) console.error(itemError)
    }
  }

  const handleCreateHomework = async (selectedItems: { source_item_id: string | null; content: string }[]) => {
    const selected = selectedItems.filter((i) => i.content.trim() !== '')

    const cardId = uuidv4()
    const now = new Date().toISOString()
    const today = format(new Date(), 'yyyy-MM-dd')

    const newCard: Card = {
      id: cardId,
      type: 'homework',
      date: today,
      created_at: now,
      items: selected.map((item, idx) => ({
        id: uuidv4(),
        card_id: cardId,
        content: item.content,
        is_checked: false,
        order_index: idx,
        source_item_id: item.source_item_id,
        created_at: now,
      })),
    }

    setCards((prev) => [...prev, newCard])
    setShowHomeworkSelector(false)

    const { error: cardError } = await supabase
      .from('cards')
      .insert({ id: cardId, type: 'homework', date: today, created_at: now })
    if (cardError) { console.error(cardError); return }

    const { error: itemError } = await supabase.from('items').insert(
      newCard.items.map((i) => ({
        id: i.id,
        card_id: cardId,
        content: i.content,
        is_checked: false,
        order_index: i.order_index,
        source_item_id: i.source_item_id,
        created_at: now,
      }))
    )
    if (itemError) console.error(itemError)
  }

  const handleDeleteCard = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    await supabase.from('cards').delete().eq('id', id)
  }

  const handleToggleItem = async (cardId: string, itemId: string, checked: boolean) => {
    const card = cards.find((c) => c.id === cardId)
    const item = card?.items.find((i) => i.id === itemId)
    const sourceItemId = card?.type === 'homework' ? (item?.source_item_id ?? null) : null

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, is_checked: checked } : i)) }
        }
        if (sourceItemId && c.type === 'alarm') {
          const hasSource = c.items.some((i) => i.id === sourceItemId)
          if (hasSource) {
            return { ...c, items: c.items.map((i) => (i.id === sourceItemId ? { ...i, is_checked: checked } : i)) }
          }
        }
        return c
      })
    )

    await supabase.from('items').update({ is_checked: checked }).eq('id', itemId)
    if (sourceItemId) {
      await supabase.from('items').update({ is_checked: checked }).eq('id', sourceItemId)
    }
  }

  const handleUpdateDate = async (cardId: string, date: string) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, date } : c)))
    await supabase.from('cards').update({ date }).eq('id', cardId)
  }

  const handleAddItem = async (cardId: string, content: string, afterIndex: number) => {
    const card = cards.find((c) => c.id === cardId)
    if (!card) return

    const sortedItems = [...card.items].sort((a, b) => a.order_index - b.order_index)
    const newIndex = afterIndex + 1
    const now = new Date().toISOString()

    const reindexed = sortedItems.map((item, idx) => ({
      ...item,
      order_index: idx >= newIndex ? idx + 1 : idx,
    }))

    const newItem: CardItem = {
      id: uuidv4(),
      card_id: cardId,
      content,
      is_checked: false,
      order_index: newIndex,
      source_item_id: null,
      created_at: now,
    }

    const updatedItems = [...reindexed.slice(0, newIndex), newItem, ...reindexed.slice(newIndex)]

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, items: updatedItems } : c))
    )

    await supabase.from('items').insert({
      id: newItem.id,
      card_id: cardId,
      content,
      is_checked: false,
      order_index: newIndex,
      source_item_id: null,
      created_at: now,
    })

    for (const item of reindexed.filter((_, idx) => idx >= newIndex)) {
      await supabase.from('items').update({ order_index: item.order_index }).eq('id', item.id)
    }
  }

  const handleDeleteItem = async (cardId: string, itemId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    )
    await supabase.from('items').delete().eq('id', itemId)
  }

  const handleUpdateItem = async (cardId: string, itemId: string, content: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, content } : i)) }
          : c
      )
    )
    await supabase.from('items').update({ content }).eq('id', itemId)
  }

  const handleUpdateCard = async (
    cardId: string,
    date: string,
    newItems: { id: string; content: string }[]
  ) => {
    const now = new Date().toISOString()
    const prevCard = cards.find((c) => c.id === cardId)
    const updatedItems: CardItem[] = newItems.map((item, idx) => {
      const prevItem = prevCard?.items.find((i) => i.id === item.id)
      return {
        id: item.id,
        card_id: cardId,
        content: item.content,
        is_checked: prevItem?.is_checked ?? false,
        order_index: idx,
        source_item_id: prevItem?.source_item_id ?? null,
        created_at: prevItem?.created_at ?? now,
      }
    })

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, date, items: updatedItems } : c))
    )

    await supabase.from('cards').update({ date }).eq('id', cardId)
    await supabase.from('items').delete().eq('card_id', cardId)
    if (updatedItems.length > 0) {
      await supabase.from('items').insert(
        updatedItems.map((i) => ({
          id: i.id,
          card_id: cardId,
          content: i.content,
          is_checked: i.is_checked,
          order_index: i.order_index,
          source_item_id: i.source_item_id,
          created_at: i.created_at,
        }))
      )
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8ff' }}>
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #f0e8ff 0%, #e4f0ff 100%)',
          borderBottom: '1px solid #e0d4f4',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c7b8ea, #a99cd4)' }}
          >
            <BookOpen size={16} color="white" />
          </div>
          <span className="text-base font-bold" style={{ color: '#4a4063' }}>
            영문학당
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowHomeworkSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #d4b8f0, #b8c8f0)',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(169, 156, 212, 0.35)',
          }}
        >
          <Plus size={13} strokeWidth={2.5} />
          오늘의 숙제
        </button>
      </header>

      <main className="px-4 py-4 pb-28 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#c7b8ea', borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: '#a99cd4' }}>불러오는 중...</p>
          </div>
        ) : (
          <>
            {homeworkCards.map((card) => (
              <HomeworkCard
                key={card.id}
                card={card}
                onToggleItem={handleToggleItem}
                onDelete={handleDeleteCard}
                onUpdateCard={handleUpdateCard}
                onAddItem={handleAddItem}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
              />
            ))}

            {alarmCards.length === 0 && homeworkCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#f0e8ff' }}
                >
                  <BookOpen size={28} style={{ color: '#c7b8ea' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#4a4063' }}>
                    아직 알림장이 없어요
                  </p>
                  <p className="text-xs" style={{ color: '#a99cd4' }}>
                    아래 + 버튼을 눌러 첫 알림장을 만들어보세요!
                  </p>
                </div>
              </div>
            ) : (
              alarmCards.map((card) => (
                <AlarmCard
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteCard}
                  onToggleItem={handleToggleItem}
                  onUpdateDate={handleUpdateDate}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                  onUpdateItem={handleUpdateItem}
                  onUpdateCard={handleUpdateCard}
                />
              ))
            )}
          </>
        )}
      </main>

      <button
        type="button"
        onClick={() => setShowNewAlarm(true)}
        className="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #c7b8ea, #a99cd4)',
          boxShadow: '0 6px 24px rgba(167, 154, 212, 0.5)',
        }}
        aria-label="새 알림장 만들기"
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </button>

      {showNewAlarm && (
        <NewAlarmModal
          onClose={() => setShowNewAlarm(false)}
          onSave={handleCreateAlarm}
        />
      )}

      {showHomeworkSelector && (
        <HomeworkSelectorModal
          alarmCards={alarmCards}
          onClose={() => setShowHomeworkSelector(false)}
          onCreateHomework={handleCreateHomework}
        />
      )}
    </div>
  )
}
