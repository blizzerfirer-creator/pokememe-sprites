// Local Storage Manager for offline/guest play
// Stores player data, PokeMemes, inventory, etc. in browser localStorage
import { getPokeMemeById } from '../data/pokememeData';

const STORAGE_KEYS = {
  PLAYER_DATA: 'pokememe_player_data',
  POKEMEMES: 'pokememe_pokememes',
  INVENTORY: 'pokememe_inventory',
  MEMEDEX: 'pokememe_memedex',
  IS_GUEST: 'pokememe_is_guest'
};

export interface LocalPlayerData {
  id: string;
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
}

export interface LocalPokememe {
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
}

export interface LocalInventoryItem {
  id: string;
  player_id: string;
  item_id: string;
  quantity: number;
  created_at: string;
}

export interface LocalMemeDexEntry {
  id: string;
  player_id: string;
  pokememe_id: number;
  caught: boolean;
  seen: boolean;
  created_at: string;
}

// Generate a random UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate a random guest username
export const generateGuestUsername = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Guest${randomNum}`;
};

// Check if player is a guest
export const isGuestPlayer = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_GUEST) === 'true';
};

// Set guest status
export const setGuestStatus = (isGuest: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_GUEST, isGuest.toString());
};

// Get local player data
export const getLocalPlayerData = (): LocalPlayerData | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
  return data ? JSON.parse(data) : null;
};

// Save local player data
export const saveLocalPlayerData = (playerData: LocalPlayerData): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
};

// Update specific fields in player data
export const updateLocalPlayerData = (updates: Partial<LocalPlayerData>): LocalPlayerData | null => {
  const currentData = getLocalPlayerData();
  if (!currentData) return null;
  
  const updatedData = {
    ...currentData,
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  saveLocalPlayerData(updatedData);
  return updatedData;
};

// Get local PokeMemes
export const getLocalPokememes = (): LocalPokememe[] => {
  const data = localStorage.getItem(STORAGE_KEYS.POKEMEMES);
  return data ? JSON.parse(data) : [];
};

// Save local PokeMemes
export const saveLocalPokememes = (pokememes: LocalPokememe[]): void => {
  localStorage.setItem(STORAGE_KEYS.POKEMEMES, JSON.stringify(pokememes));
};

// Add a new PokeMeme
export const addLocalPokememe = (pokememe: Omit<LocalPokememe, 'id' | 'created_at'>): LocalPokememe => {
  const pokememes = getLocalPokememes();
  const newPokememe: LocalPokememe = {
    ...pokememe,
    id: generateUUID(),
    created_at: new Date().toISOString()
  };
  pokememes.push(newPokememe);
  saveLocalPokememes(pokememes);
  return newPokememe;
};

// Get party PokeMemes
export const getLocalParty = (): LocalPokememe[] => {
  const pokememes = getLocalPokememes();
  return pokememes
    .filter(p => p.is_in_party)
    .sort((a, b) => (a.party_slot || 0) - (b.party_slot || 0));
};

// Get local inventory
export const getLocalInventory = (): LocalInventoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  return data ? JSON.parse(data) : [];
};

// Save local inventory
export const saveLocalInventory = (inventory: LocalInventoryItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
};

// Add or update inventory item
export const updateLocalInventoryItem = (playerId: string, itemId: string, quantityDelta: number): void => {
  const inventory = getLocalInventory();
  const existingIndex = inventory.findIndex(i => i.item_id === itemId);
  
  if (existingIndex >= 0) {
    inventory[existingIndex].quantity += quantityDelta;
    if (inventory[existingIndex].quantity <= 0) {
      inventory.splice(existingIndex, 1);
    }
  } else if (quantityDelta > 0) {
    inventory.push({
      id: generateUUID(),
      player_id: playerId,
      item_id: itemId,
      quantity: quantityDelta,
      created_at: new Date().toISOString()
    });
  }
  
  saveLocalInventory(inventory);
};

// Get local MemeDex
export const getLocalMemeDex = (): LocalMemeDexEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEMEDEX);
  return data ? JSON.parse(data) : [];
};

// Save local MemeDex
export const saveLocalMemeDex = (memedex: LocalMemeDexEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.MEMEDEX, JSON.stringify(memedex));
};

// Add or update MemeDex entry
export const updateLocalMemeDexEntry = (playerId: string, pokememeId: number, caught: boolean, seen: boolean): void => {
  const memedex = getLocalMemeDex();
  const existingIndex = memedex.findIndex(e => e.pokememe_id === pokememeId);
  
  if (existingIndex >= 0) {
    memedex[existingIndex].caught = memedex[existingIndex].caught || caught;
    memedex[existingIndex].seen = memedex[existingIndex].seen || seen;
  } else {
    memedex.push({
      id: generateUUID(),
      player_id: playerId,
      pokememe_id: pokememeId,
      caught,
      seen,
      created_at: new Date().toISOString()
    });
  }
  
  saveLocalMemeDex(memedex);
};

// Create a new guest player profile
export const createGuestProfile = (username: string, starterPokememeId: number): LocalPlayerData => {
  const playerId = generateUUID();
  const now = new Date().toISOString();
  
  // Create player data
  const playerData: LocalPlayerData = {
    id: playerId,
    username,
    avatar: 'default',
    wins: 0,
    losses: 0,
    rank: 0,
    meme_coins: 1000,
    position_x: 15 * 64, // Starting position in Satoshi Town
    position_y: 15 * 64,
    current_map: 'satoshi_town',
    facing_direction: 'down',
    created_at: now,
    updated_at: now
  };
  
  // Save player data
  saveLocalPlayerData(playerData);
  setGuestStatus(true);
  
  // Create starter PokeMeme stats
  const starterStats = getStarterStats(starterPokememeId);
  
  // Add starter PokeMeme
  addLocalPokememe({
    player_id: playerId,
    pokememe_id: starterPokememeId,
    nickname: null,
    level: 5,
    experience: 0,
    hp: starterStats.hp,
    current_hp: starterStats.hp,
    attack: starterStats.attack,
    defense: starterStats.defense,
    sp_attack: starterStats.spAttack,
    sp_defense: starterStats.spDefense,
    speed: starterStats.speed,
    move1: starterStats.move1,
    move2: null,
    move3: null,
    move4: null,
    is_in_party: true,
    party_slot: 0
  });
  
  // Add starter to MemeDex
  updateLocalMemeDexEntry(playerId, starterPokememeId, true, true);
  
  // Give starting items
  const startingItems = [
    { item_id: 'cryptosphere', quantity: 10 },
    { item_id: 'potion', quantity: 5 }
  ];
  
  for (const item of startingItems) {
    updateLocalInventoryItem(playerId, item.item_id, item.quantity);
  }
  
  return playerData;
};

// Get starter stats helper - calculates from actual pokememeData base stats at level 5
const getStarterStats = (pokememeId: number) => {
  const pokememe = getPokeMemeById(pokememeId);
  if (!pokememe) {
    // Fallback to Pepasaur if invalid ID
    return getStarterStats(1);
  }

  const level = 5;
  const baseMultiplier = 1 + (level - 1) * 0.1; // Same formula as BattleScene

  return {
    hp: Math.floor(pokememe.baseStats.hp * baseMultiplier),
    attack: Math.floor(pokememe.baseStats.attack * baseMultiplier),
    defense: Math.floor(pokememe.baseStats.defense * baseMultiplier),
    spAttack: Math.floor(pokememe.baseStats.spAttack * baseMultiplier),
    spDefense: Math.floor(pokememe.baseStats.spDefense * baseMultiplier),
    speed: Math.floor(pokememe.baseStats.speed * baseMultiplier),
    move1: pokememe.signatureMove.name
  };
};

// Clear all local data (for logout or reset)
export const clearLocalData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
  localStorage.removeItem(STORAGE_KEYS.POKEMEMES);
  localStorage.removeItem(STORAGE_KEYS.INVENTORY);
  localStorage.removeItem(STORAGE_KEYS.MEMEDEX);
  localStorage.removeItem(STORAGE_KEYS.IS_GUEST);
};

// Check if there's existing guest data
export const hasExistingGuestData = (): boolean => {
  return isGuestPlayer() && getLocalPlayerData() !== null;
};

// Calculate XP needed for next level
export const getXPForLevel = (level: number): number => {
  return Math.floor(Math.pow(level, 3) * 0.8);
};

// Calculate total XP needed to reach a level from level 1
export const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

// Add XP to a PokeMeme and handle level ups
export const addXPToPokememe = (pokememeId: string, xpGained: number): { 
  leveledUp: boolean; 
  newLevel: number; 
  statIncreases: { hp: number; attack: number; defense: number; spAttack: number; spDefense: number; speed: number } | null;
} => {
  const pokememes = getLocalPokememes();
  const index = pokememes.findIndex(p => p.id === pokememeId);
  
  if (index === -1) {
    return { leveledUp: false, newLevel: 0, statIncreases: null };
  }
  
  const pokememe = pokememes[index];
  const oldLevel = pokememe.level;
  pokememe.experience += xpGained;
  
  // Check for level up
  let newLevel = oldLevel;
  while (pokememe.experience >= getXPForLevel(newLevel)) {
    pokememe.experience -= getXPForLevel(newLevel);
    newLevel++;
    if (newLevel >= 100) {
      newLevel = 100;
      pokememe.experience = 0;
      break;
    }
  }
  
  let statIncreases = null;
  if (newLevel > oldLevel) {
    // Calculate stat increases (roughly 2-4 per level per stat)
    const levelsGained = newLevel - oldLevel;
    statIncreases = {
      hp: Math.floor(levelsGained * (2 + Math.random() * 2)),
      attack: Math.floor(levelsGained * (1 + Math.random() * 2)),
      defense: Math.floor(levelsGained * (1 + Math.random() * 2)),
      spAttack: Math.floor(levelsGained * (1 + Math.random() * 2)),
      spDefense: Math.floor(levelsGained * (1 + Math.random() * 2)),
      speed: Math.floor(levelsGained * (1 + Math.random() * 2))
    };
    
    pokememe.level = newLevel;
    pokememe.hp += statIncreases.hp;
    pokememe.current_hp += statIncreases.hp; // Heal on level up
    pokememe.attack += statIncreases.attack;
    pokememe.defense += statIncreases.defense;
    pokememe.sp_attack += statIncreases.spAttack;
    pokememe.sp_defense += statIncreases.spDefense;
    pokememe.speed += statIncreases.speed;
  }
  
  pokememes[index] = pokememe;
  saveLocalPokememes(pokememes);
  
  return { leveledUp: newLevel > oldLevel, newLevel, statIncreases };
};

// Update PokeMeme's current HP after battle
export const updatePokememeHP = (pokememeId: string, newCurrentHp: number): void => {
  const pokememes = getLocalPokememes();
  const index = pokememes.findIndex(p => p.id === pokememeId);
  
  if (index !== -1) {
    pokememes[index].current_hp = Math.max(0, Math.min(newCurrentHp, pokememes[index].hp));
    saveLocalPokememes(pokememes);
  }
};

// Heal all PokeMemes in party
export const healAllParty = (): void => {
  const pokememes = getLocalPokememes();
  pokememes.forEach(p => {
    if (p.is_in_party) {
      p.current_hp = p.hp;
    }
  });
  saveLocalPokememes(pokememes);
};
