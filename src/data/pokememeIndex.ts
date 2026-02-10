// PokeMeme Type definitions
export type PokeMemeType = 
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

export interface PokeMemeMove {
  name: string;
  type: PokeMemeType;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
  isSignature?: boolean;
}

export interface PokeMemeData {
  id: number;
  name: string;
  originalName: string;
  memeToken: string;
  types: PokeMemeType[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  evolutionLevel?: number;
  evolvesTo?: number;
  signatureMove: PokeMemeMove;
  learnableMoves: string[];
  description: string;
  spriteKey: string;
}

// Type effectiveness chart - simplified to avoid type issues
export const typeChart: { [key: string]: { [key: string]: number } } = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5, Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Dragon: 1, Dark: 1, Fairy: 1 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2, Normal: 1, Electric: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Ghost: 1, Dark: 1, Fairy: 1 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5, Normal: 1, Electric: 1, Ice: 1, Fighting: 1, Poison: 1, Flying: 1, Psychic: 1, Bug: 1, Ghost: 1, Dark: 1, Steel: 1, Fairy: 1 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5, Normal: 1, Fire: 1, Ice: 1, Fighting: 1, Poison: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dark: 1, Steel: 1, Fairy: 1 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5, Normal: 1, Electric: 1, Ice: 1, Fighting: 1, Psychic: 1, Ghost: 1, Dark: 1, Fairy: 1 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Normal: 1, Electric: 1, Fighting: 1, Poison: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dark: 1, Fairy: 1 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ground: 1, Dragon: 1 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2, Normal: 1, Fire: 1, Water: 1, Electric: 1, Ice: 1, Fighting: 1, Flying: 1, Psychic: 1, Bug: 1, Dragon: 1, Dark: 1 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2, Normal: 1, Water: 1, Ice: 1, Fighting: 1, Ground: 1, Psychic: 1, Ghost: 1, Dragon: 1, Dark: 1, Fairy: 1 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5, Normal: 1, Fire: 1, Water: 1, Ice: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Ghost: 1, Dragon: 1, Dark: 1, Fairy: 1 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5, Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Ground: 1, Flying: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 1, Fairy: 1 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5, Normal: 1, Water: 1, Electric: 1, Ice: 1, Ground: 1, Rock: 1, Dragon: 1 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5, Normal: 1, Water: 1, Electric: 1, Grass: 1, Poison: 1, Psychic: 1, Ghost: 1, Dragon: 1, Dark: 1, Fairy: 1 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5, Steel: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Bug: 1, Rock: 1, Dragon: 1, Fairy: 1 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0, Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dark: 1 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5, Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Poison: 1, Ground: 1, Flying: 1, Bug: 1, Rock: 1, Dragon: 1, Steel: 1 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2, Normal: 1, Grass: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Ghost: 1, Dragon: 1, Dark: 1 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5, Normal: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Fairy: 1 }
};

// Import data from split files
import { pokememeData1 } from './pokememeData1';
import { pokememeData2 } from './pokememeData2';
import { pokememeData3 } from './pokememeData3';

// Combine all PokeMemes into one database
export const pokememeDatabase: PokeMemeData[] = [
  ...pokememeData1,
  ...pokememeData2,
  ...pokememeData3
];

// Helper function to get PokeMeme by ID
export function getPokeMemeById(id: number): PokeMemeData | undefined {
  return pokememeDatabase.find(p => p.id === id);
}

// Helper function to get starter PokeMemes
export function getStarters(): PokeMemeData[] {
  return pokememeDatabase.filter(p => [1, 4, 7].includes(p.id));
}

// Calculate type effectiveness
export function getTypeEffectiveness(attackType: PokeMemeType, defenderTypes: PokeMemeType[]): number {
  let multiplier = 1;
  for (const defType of defenderTypes) {
    multiplier *= typeChart[attackType][defType] || 1;
  }
  return multiplier;
}

// Calculate damage
export function calculateDamage(
  attacker: { level: number; attack: number; spAttack: number },
  defender: { defense: number; spDefense: number; types: PokeMemeType[] },
  move: PokeMemeMove,
  isSpecial: boolean = false
): { damage: number; effectiveness: number; isCritical: boolean } {
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  const isCritical = Math.random() < 0.0625; // 6.25% crit chance
  
  const attackStat = isSpecial ? attacker.spAttack : attacker.attack;
  const defenseStat = isSpecial ? defender.spDefense : defender.defense;
  
  const levelFactor = ((2 * attacker.level) / 5) + 2;
  const baseDamage = (levelFactor * move.power * (attackStat / defenseStat)) / 50 + 2;
  const critMultiplier = isCritical ? 1.5 : 1;
  const randomFactor = (Math.random() * 0.15) + 0.85; // 0.85 to 1.0
  
  const finalDamage = Math.floor(baseDamage * effectiveness * critMultiplier * randomFactor);
  
  return { damage: finalDamage, effectiveness, isCritical };
}

// Items data
export const itemsDatabase = {
  cryptosphere: {
    id: 'cryptosphere',
    name: 'CryptoSphere',
    description: 'A special ball for catching wild PokeMemes',
    catchRate: 1.0,
    price: 200
  },
  goldSphere: {
    id: 'gold_sphere',
    name: 'Gold Sphere',
    description: 'A premium ball with higher catch rate',
    catchRate: 1.5,
    price: 600
  },
  diamondSphere: {
    id: 'diamond_sphere',
    name: 'Diamond Sphere',
    description: 'The best ball money can buy',
    catchRate: 2.0,
    price: 1200
  },
  potion: {
    id: 'potion',
    name: 'Potion',
    description: 'Restores 20 HP',
    healAmount: 20,
    price: 100
  },
  superPotion: {
    id: 'super_potion',
    name: 'Super Potion',
    description: 'Restores 50 HP',
    healAmount: 50,
    price: 300
  },
  hyperPotion: {
    id: 'hyper_potion',
    name: 'Hyper Potion',
    description: 'Restores 200 HP',
    healAmount: 200,
    price: 600
  },
  revive: {
    id: 'revive',
    name: 'Revive',
    description: 'Revives fainted PokeMeme with half HP',
    revivePercent: 0.5,
    price: 500
  }
};

// Re-export types for convenience
export type { PokeMemeType as Type, PokeMemeMove as Move, PokeMemeData as Data };
