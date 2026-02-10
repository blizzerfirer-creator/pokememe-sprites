// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          avatar: string;
          wins: number;
          losses: number;
          rank: number;
          meme_coins: number;
          position_x: number;
          position_y: number;
          current_map: string;
          facing_direction: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          avatar?: string;
          wins?: number;
          losses?: number;
          rank?: number;
          meme_coins?: number;
          position_x?: number;
          position_y?: number;
          current_map?: string;
          facing_direction?: string;
        };
        Update: {
          username?: string;
          avatar?: string;
          wins?: number;
          losses?: number;
          rank?: number;
          meme_coins?: number;
          position_x?: number;
          position_y?: number;
          current_map?: string;
          facing_direction?: string;
        };
      };
      pokememes: {
        Row: {
          id: string;
          player_id: string;
          pokememe_id: number;
          nickname: string | null;
          level: number;
          experience: number;
          hp: number;
          current_hp: number;
          attack: number;
          defense: number;
          sp_attack: number;
          sp_defense: number;
          speed: number;
          move1: string;
          move2: string | null;
          move3: string | null;
          move4: string | null;
          is_in_party: boolean;
          party_slot: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          pokememe_id: number;
          nickname?: string | null;
          level?: number;
          experience?: number;
          hp?: number;
          current_hp?: number;
          attack?: number;
          defense?: number;
          sp_attack?: number;
          sp_defense?: number;
          speed?: number;
          move1: string;
          move2?: string | null;
          move3?: string | null;
          move4?: string | null;
          is_in_party?: boolean;
          party_slot?: number | null;
        };
        Update: {
          nickname?: string | null;
          level?: number;
          experience?: number;
          hp?: number;
          current_hp?: number;
          attack?: number;
          defense?: number;
          sp_attack?: number;
          sp_defense?: number;
          speed?: number;
          move1?: string;
          move2?: string | null;
          move3?: string | null;
          move4?: string | null;
          is_in_party?: boolean;
          party_slot?: number | null;
        };
      };
      memedex: {
        Row: {
          id: string;
          player_id: string;
          pokememe_id: number;
          caught: boolean;
          seen: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          pokememe_id: number;
          caught?: boolean;
          seen?: boolean;
        };
        Update: {
          caught?: boolean;
          seen?: boolean;
        };
      };
      inventory: {
        Row: {
          id: string;
          player_id: string;
          item_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          item_id: string;
          quantity?: number;
        };
        Update: {
          quantity?: number;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          player_id: string;
          username: string;
          message: string;
          map_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          username: string;
          message: string;
          map_id: string;
        };
        Update: never;
      };
      battle_requests: {
        Row: {
          id: string;
          challenger_id: string;
          defender_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenger_id: string;
          defender_id: string;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
      trade_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          sender_pokememe_id: string | null;
          receiver_pokememe_id: string | null;
          sender_confirmed: boolean;
          receiver_confirmed: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          sender_pokememe_id?: string | null;
          receiver_pokememe_id?: string | null;
          sender_confirmed?: boolean;
          receiver_confirmed?: boolean;
          status?: string;
        };
        Update: {
          sender_pokememe_id?: string | null;
          receiver_pokememe_id?: string | null;
          sender_confirmed?: boolean;
          receiver_confirmed?: boolean;
          status?: string;
        };
      };
    };
  };
}

// Player presence for real-time sync
export interface PlayerPresence {
  id: string;
  username: string;
  x: number;
  y: number;
  facingDirection: string;
  currentMap: string;
  isMoving: boolean;
  avatar: string;
}

// Battle state for PvP
export interface BattleState {
  battleId: string;
  player1: {
    id: string;
    username: string;
    activePokememe: number;
    party: any[];
    selectedMove: string | null;
  };
  player2: {
    id: string;
    username: string;
    activePokememe: number;
    party: any[];
    selectedMove: string | null;
  };
  turn: number;
  phase: 'selecting' | 'executing' | 'finished';
  winner: string | null;
  turnTimer: number;
}
