-- PokeMeme MMO Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  avatar VARCHAR(50) DEFAULT 'default',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  meme_coins INTEGER DEFAULT 1000,
  position_x FLOAT DEFAULT 960,
  position_y FLOAT DEFAULT 960,
  current_map VARCHAR(50) DEFAULT 'satoshi_town',
  facing_direction VARCHAR(10) DEFAULT 'down',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PokeMemes owned by players
CREATE TABLE IF NOT EXISTS pokememes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  pokememe_id INTEGER NOT NULL,
  nickname VARCHAR(50),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  sp_attack INTEGER NOT NULL,
  sp_defense INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  move1 VARCHAR(50) NOT NULL,
  move2 VARCHAR(50),
  move3 VARCHAR(50),
  move4 VARCHAR(50),
  is_in_party BOOLEAN DEFAULT false,
  party_slot INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MemeDex (Pokedex equivalent)
CREATE TABLE IF NOT EXISTS memedex (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  pokememe_id INTEGER NOT NULL,
  caught BOOLEAN DEFAULT false,
  seen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, pokememe_id)
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  item_id VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, item_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  username VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  map_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle requests
CREATE TABLE IF NOT EXISTS battle_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  defender_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade requests
CREATE TABLE IF NOT EXISTS trade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  sender_pokememe_id UUID REFERENCES pokememes(id),
  receiver_pokememe_id UUID REFERENCES pokememes(id),
  sender_confirmed BOOLEAN DEFAULT false,
  receiver_confirmed BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_current_map ON players(current_map);
CREATE INDEX IF NOT EXISTS idx_pokememes_player_id ON pokememes(player_id);
CREATE INDEX IF NOT EXISTS idx_pokememes_is_in_party ON pokememes(is_in_party);
CREATE INDEX IF NOT EXISTS idx_memedex_player_id ON memedex(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player_id ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_map_id ON chat_messages(map_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_requests_defender_id ON battle_requests(defender_id);
CREATE INDEX IF NOT EXISTS idx_trade_requests_receiver_id ON trade_requests(receiver_id);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokememes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memedex ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own player" ON players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player" ON players
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for pokememes
CREATE POLICY "Pokememes are viewable by owner" ON pokememes
  FOR SELECT USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own pokememes" ON pokememes
  FOR INSERT WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own pokememes" ON pokememes
  FOR UPDATE USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- RLS Policies for memedex
CREATE POLICY "Memedex viewable by owner" ON memedex
  FOR SELECT USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own memedex" ON memedex
  FOR INSERT WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own memedex" ON memedex
  FOR UPDATE USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- RLS Policies for inventory
CREATE POLICY "Inventory viewable by owner" ON inventory
  FOR SELECT USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own inventory" ON inventory
  FOR INSERT WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own inventory" ON inventory
  FOR UPDATE USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- RLS Policies for chat messages
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- RLS Policies for battle requests
CREATE POLICY "Battle requests viewable by participants" ON battle_requests
  FOR SELECT USING (
    challenger_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    defender_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create battle requests" ON battle_requests
  FOR INSERT WITH CHECK (challenger_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Defenders can update battle requests" ON battle_requests
  FOR UPDATE USING (defender_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- RLS Policies for trade requests
CREATE POLICY "Trade requests viewable by participants" ON trade_requests
  FOR SELECT USING (
    sender_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create trade requests" ON trade_requests
  FOR INSERT WITH CHECK (sender_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Participants can update trade requests" ON trade_requests
  FOR UPDATE USING (
    sender_id IN (SELECT id FROM players WHERE user_id = auth.uid()) OR
    receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for players
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE trade_requests;
