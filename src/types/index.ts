export type CardType = 'alarm' | 'homework'

export interface CardItem {
  id: string
  card_id: string
  content: string
  is_checked: boolean
  order_index: number
  source_item_id: string | null
  created_at: string
}

export interface Card {
  id: string
  type: CardType
  date: string
  created_at: string
  items: CardItem[]
}
