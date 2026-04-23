-- 영문학당 데이터베이스 스키마
-- Supabase SQL Editor에 붙여넣고 실행하세요

-- 카드 테이블 (알림장 & 오늘의 숙제)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'alarm' CHECK (type IN ('alarm', 'homework')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 항목 테이블
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  source_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_items_card_id ON items(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_date ON cards(date);

-- Row Level Security (RLS) - 공개 접근 허용 (필요시 인증 추가)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for cards" ON cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for items" ON items FOR ALL USING (true) WITH CHECK (true);
