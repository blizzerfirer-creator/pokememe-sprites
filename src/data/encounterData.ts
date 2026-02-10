// Centralized encounter pools for all maps
import Phaser from 'phaser';

export interface WildEncounterEntry {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  rarity: number; // Weight for probability selection
}

export interface MapExitZone {
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  targetSpawnX: number;
  targetSpawnY: number;
}

export interface NPCData {
  id: string;
  name: string;
  x: number;
  y: number;
  textureKey: string;
  type: 'healer' | 'shop' | 'dialog';
  dialogLines: string[];
  shopItems?: { itemId: string; name: string; price: number }[];
}

// Satoshi Town - Starter area (Lv 2-5)
export const SATOSHI_TOWN_ENCOUNTERS: WildEncounterEntry[] = [
  { id: 1, name: 'Pepasaur', minLevel: 2, maxLevel: 5, rarity: 20 },
  { id: 4, name: 'Bonkander', minLevel: 2, maxLevel: 5, rarity: 20 },
  { id: 7, name: 'Dogetle', minLevel: 2, maxLevel: 5, rarity: 20 },
  { id: 39, name: 'Bongopuff', minLevel: 2, maxLevel: 4, rarity: 25 },
  { id: 129, name: 'Glowkarp', minLevel: 2, maxLevel: 5, rarity: 15 },
];

// Ethereum Forest - Bug/Poison forest (Lv 3-9)
export const ETHEREUM_FOREST_ENCOUNTERS: WildEncounterEntry[] = [
  { id: 10, name: 'Trollpie', minLevel: 3, maxLevel: 7, rarity: 20 },
  { id: 43, name: 'Fartish', minLevel: 4, maxLevel: 8, rarity: 20 },
  { id: 41, name: 'Coffinbat', minLevel: 5, maxLevel: 9, rarity: 15 },
  { id: 48, name: 'NPCnat', minLevel: 4, maxLevel: 7, rarity: 25 },
  { id: 46, name: 'Coparas', minLevel: 3, maxLevel: 6, rarity: 20 },
];

// Solana Caves - Rock/Ground cave (Lv 7-14)
export const SOLANA_CAVES_ENCOUNTERS: WildEncounterEntry[] = [
  { id: 74, name: 'Diamondude', minLevel: 8, maxLevel: 12, rarity: 20 },
  { id: 50, name: 'Moglett', minLevel: 7, maxLevel: 10, rarity: 25 },
  { id: 104, name: 'Soybone', minLevel: 8, maxLevel: 11, rarity: 20 },
  { id: 89, name: 'Sussymuk', minLevel: 9, maxLevel: 13, rarity: 15 },
  { id: 95, name: 'Longonix', minLevel: 10, maxLevel: 14, rarity: 10 },
];

// Pump Beach - Water/coastal area (Lv 5-20)
export const PUMP_BEACH_ENCOUNTERS: WildEncounterEntry[] = [
  { id: 72, name: 'Brettacool', minLevel: 10, maxLevel: 15, rarity: 20 },
  { id: 116, name: 'Slerfea', minLevel: 11, maxLevel: 14, rarity: 20 },
  { id: 98, name: 'Ravebby', minLevel: 9, maxLevel: 13, rarity: 20 },
  { id: 129, name: 'Glowkarp', minLevel: 5, maxLevel: 20, rarity: 25 },
  { id: 86, name: 'Pudgyseel', minLevel: 12, maxLevel: 15, rarity: 15 },
];

// Weighted random selection from an encounter pool
export function selectRandomEncounter(pool: WildEncounterEntry[]): { pokememeId: number; level: number } {
  const totalRarity = pool.reduce((sum, p) => sum + p.rarity, 0);
  let random = Phaser.Math.Between(1, totalRarity);

  let selected = pool[0];
  for (const entry of pool) {
    random -= entry.rarity;
    if (random <= 0) {
      selected = entry;
      break;
    }
  }

  return {
    pokememeId: selected.id,
    level: Phaser.Math.Between(selected.minLevel, selected.maxLevel),
  };
}
