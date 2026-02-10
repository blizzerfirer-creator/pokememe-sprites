import { BaseMapScene } from './BaseMapScene';
import * as utils from '../utils';
import {
  SATOSHI_TOWN_ENCOUNTERS,
  type WildEncounterEntry,
  type MapExitZone,
  type NPCData
} from '../data/encounterData';

export class SatoshiTownScene extends BaseMapScene {
  constructor() {
    super({ key: 'SatoshiTownScene' });
  }

  // --- Abstract method implementations ---

  getMapId(): string { return 'satoshi_town'; }
  getMapWidthTiles(): number { return 30; }
  getMapHeightTiles(): number { return 25; }
  getMusicKey(): string { return 'satoshi_town_theme'; }
  getWildEncounters(): WildEncounterEntry[] { return SATOSHI_TOWN_ENCOUNTERS; }
  getGrassTileIndices(): number[] { return []; } // Uses fallback range (0-10)
  getEncounterChance(): number { return 0.1; }
  getBattleBackgroundKey(): string { return 'battle_background_grass'; }

  getDefaultStartPosition(): { x: number; y: number } {
    return { x: 15 * 64, y: 15 * 64 };
  }

  getExitZones(): MapExitZone[] {
    return [
      {
        x: 14 * 64,
        y: 0,
        width: 2 * 64,
        height: 64,
        targetScene: 'EthereumForestScene',
        targetSpawnX: 20 * 64,
        targetSpawnY: 28 * 64
      }
    ];
  }

  getNPCData(): NPCData[] {
    return [
      {
        id: 'professor_vitalik',
        name: 'Prof. Vitalik',
        x: 15 * 64,
        y: 10 * 64,
        textureKey: 'npc_professor',
        type: 'dialog',
        dialogLines: [
          'Welcome to Satoshi Town!',
          'This is the world of PokeMemes, where crypto meets adventure!',
          'Take your first PokeMeme and explore the land!'
        ]
      }
    ];
  }

  createTileMap(): void {
    // Create tilemap from Tiled JSON (loaded via CDN in asset-pack.json)
    this.map = this.make.tilemap({ key: 'satoshi_town_map' });

    const groundTileset = this.map.addTilesetImage('satoshi_town_ground', 'satoshi_town_ground');
    const overlayTileset = this.map.addTilesetImage('satoshi_town_overlay', 'satoshi_town_overlay');

    if (!groundTileset || !overlayTileset) {
      console.error('Failed to load tilesets for Satoshi Town');
      return;
    }

    this.groundLayer = this.map.createLayer('ground', groundTileset, 0, 0)!;
    this.pathsLayer = this.map.createLayer('paths', overlayTileset, 0, 0)!;

    this.groundLayer.setDepth(-10);
    this.pathsLayer.setDepth(-5);
  }

  createDecorations(): void {
    // Trees
    const treePositions = [
      { x: 3 * 64, y: 5 * 64 },
      { x: 8 * 64, y: 3 * 64 },
      { x: 22 * 64, y: 4 * 64 },
      { x: 27 * 64, y: 6 * 64 },
      { x: 2 * 64, y: 18 * 64 },
      { x: 10 * 64, y: 20 * 64 },
      { x: 20 * 64, y: 22 * 64 },
      { x: 28 * 64, y: 18 * 64 },
    ];

    treePositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_tree_variant_${variant}`, pos.x, pos.y, 160);
    });

    // Bushes
    const bushPositions = [
      { x: 5 * 64, y: 10 * 64 },
      { x: 12 * 64, y: 8 * 64 },
      { x: 18 * 64, y: 10 * 64 },
      { x: 25 * 64, y: 8 * 64 },
      { x: 7 * 64, y: 16 * 64 },
      { x: 21 * 64, y: 16 * 64 },
    ];

    bushPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_bush_variant_${variant}`, pos.x, pos.y, 48);
    });

    // Flowers
    const flowerPositions = [
      { x: 4 * 64, y: 7 * 64 },
      { x: 9 * 64, y: 5 * 64 },
      { x: 17 * 64, y: 7 * 64 },
      { x: 24 * 64, y: 5 * 64 },
      { x: 6 * 64, y: 19 * 64 },
      { x: 16 * 64, y: 21 * 64 },
    ];

    flowerPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_flower_variant_${variant}`, pos.x, pos.y, 32);
    });

    // Sign posts
    const signPositions = [
      { x: 13 * 64, y: 11 * 64 },
      { x: 3 * 64, y: 14 * 64 },
    ];

    signPositions.forEach((pos, i) => {
      const variant = (i % 3) + 1;
      utils.createDecoration(this, this.decorations, `town_sign_variant_${variant}`, pos.x, pos.y, 64);
    });

    // Street lamps
    const lampPositions = [
      { x: 10 * 64, y: 13 * 64 },
      { x: 20 * 64, y: 13 * 64 },
    ];

    lampPositions.forEach((pos, i) => {
      const variant = (i % 3) + 2;
      utils.createDecoration(this, this.decorations, `town_lamp_variant_${variant}`, pos.x, pos.y, 96);
    });
  }
}
