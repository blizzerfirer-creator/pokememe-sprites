import { BaseMapScene } from './BaseMapScene';
import * as utils from '../utils';
import {
  PUMP_BEACH_ENCOUNTERS,
  type WildEncounterEntry,
  type MapExitZone,
  type NPCData
} from '../data/encounterData';

export class PumpBeachScene extends BaseMapScene {
  constructor() {
    super({ key: 'PumpBeachScene' });
  }

  getMapId(): string { return 'pump_beach'; }
  getMapWidthTiles(): number { return 45; }
  getMapHeightTiles(): number { return 25; }
  getMusicKey(): string { return 'satoshi_town_theme'; } // Fallback until beach theme exists
  getWildEncounters(): WildEncounterEntry[] { return PUMP_BEACH_ENCOUNTERS; }
  getGrassTileIndices(): number[] { return [0]; }
  getEncounterChance(): number { return 0.1; }
  getBattleBackgroundKey(): string { return 'battle_background_grass'; }

  getDefaultStartPosition(): { x: number; y: number } {
    return { x: 22 * 64, y: 12 * 64 };
  }

  getExitZones(): MapExitZone[] {
    return [
      // West → Solana Caves
      {
        x: 0,
        y: 11 * 64,
        width: 64,
        height: 2 * 64,
        targetScene: 'SolanaCavesScene',
        targetSpawnX: 33 * 64,
        targetSpawnY: 17 * 64
      }
    ];
  }

  getNPCData(): NPCData[] {
    return [
      {
        id: 'beach_shopkeeper',
        name: 'Trader Pump',
        x: 22 * 64,
        y: 8 * 64,
        textureKey: 'npc_shopkeeper',
        type: 'shop',
        dialogLines: [
          'Welcome to the Pump Beach Shop!',
          'Stock up before heading out!'
        ],
        shopItems: [
          { itemId: 'cryptosphere', name: 'CryptoSphere', price: 200 },
          { itemId: 'potion', name: 'Potion', price: 100 }
        ]
      },
      {
        id: 'beach_surfer',
        name: 'Surfer Wave',
        x: 30 * 64,
        y: 18 * 64,
        textureKey: 'npc_surfer',
        type: 'dialog',
        dialogLines: [
          'Dude! The Water types here are gnarly!',
          'Glowkarp may look weak, but keep training it...',
          'Something amazing might happen at level 20!'
        ]
      }
    ];
  }

  createTileMap(): void {
    const w = this.getMapWidthTiles();
    const h = this.getMapHeightTiles();

    // Generate sandy beach tile texture
    if (!this.textures.exists('beach_ground_tile')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0xc2a645); // Sandy color
      gfx.fillRect(0, 0, 64, 64);
      // Add sand grain variation
      gfx.fillStyle(0xd4b84f, 0.5);
      gfx.fillRect(10, 8, 6, 4);
      gfx.fillRect(40, 15, 8, 5);
      gfx.fillRect(20, 42, 10, 6);
      gfx.fillRect(50, 48, 5, 5);
      gfx.fillStyle(0xb09030, 0.3);
      gfx.fillRect(5, 30, 7, 4);
      gfx.fillRect(35, 50, 6, 6);
      gfx.generateTexture('beach_ground_tile', 64, 64);
      gfx.destroy();
    }

    const data: number[][] = [];
    for (let y = 0; y < h; y++) {
      data[y] = new Array(w).fill(0);
    }

    this.map = this.make.tilemap({ data, tileWidth: 64, tileHeight: 64 });
    const tileset = this.map.addTilesetImage('beach_ground_tile');
    if (tileset) {
      this.groundLayer = this.map.createLayer(0, tileset, 0, 0)!;
      this.groundLayer.setDepth(-10);
    }
  }

  createDecorations(): void {
    // Palm trees along the beach
    const palmPositions = [
      { x: 5 * 64, y: 4 * 64 }, { x: 12 * 64, y: 3 * 64 },
      { x: 20 * 64, y: 4 * 64 }, { x: 30 * 64, y: 3 * 64 },
      { x: 38 * 64, y: 4 * 64 }, { x: 42 * 64, y: 5 * 64 },
      { x: 8 * 64, y: 20 * 64 }, { x: 16 * 64, y: 21 * 64 },
      { x: 35 * 64, y: 20 * 64 }, { x: 40 * 64, y: 21 * 64 },
    ];

    palmPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_tree_variant_${variant}`, pos.x, pos.y, 160);
    });

    // Bushes/vegetation
    const bushPositions = [
      { x: 3 * 64, y: 8 * 64 }, { x: 10 * 64, y: 10 * 64 },
      { x: 25 * 64, y: 6 * 64 }, { x: 34 * 64, y: 8 * 64 },
      { x: 43 * 64, y: 10 * 64 },
    ];

    bushPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_bush_variant_${variant}`, pos.x, pos.y, 48);
    });

    // Flowers scattered on the beach
    const flowerPositions = [
      { x: 15 * 64, y: 7 * 64 }, { x: 28 * 64, y: 9 * 64 },
      { x: 36 * 64, y: 14 * 64 }, { x: 10 * 64, y: 16 * 64 },
    ];

    flowerPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_flower_variant_${variant}`, pos.x, pos.y, 32);
    });

    // Signs
    utils.createDecoration(this, this.decorations, 'town_sign_variant_1', 2 * 64, 12 * 64, 64);
    utils.createDecoration(this, this.decorations, 'town_sign_variant_3', 21 * 64, 7 * 64, 64);
  }
}
