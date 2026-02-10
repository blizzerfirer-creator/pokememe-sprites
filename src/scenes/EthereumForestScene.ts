import { BaseMapScene } from './BaseMapScene';
import * as utils from '../utils';
import {
  ETHEREUM_FOREST_ENCOUNTERS,
  type WildEncounterEntry,
  type MapExitZone,
  type NPCData
} from '../data/encounterData';

export class EthereumForestScene extends BaseMapScene {
  constructor() {
    super({ key: 'EthereumForestScene' });
  }

  getMapId(): string { return 'ethereum_forest'; }
  getMapWidthTiles(): number { return 40; }
  getMapHeightTiles(): number { return 30; }
  getMusicKey(): string { return 'satoshi_town_theme'; } // Fallback until forest theme exists
  getWildEncounters(): WildEncounterEntry[] { return ETHEREUM_FOREST_ENCOUNTERS; }
  getGrassTileIndices(): number[] { return [0]; }
  getEncounterChance(): number { return 0.12; }
  getBattleBackgroundKey(): string { return 'battle_background_grass'; }

  getDefaultStartPosition(): { x: number; y: number } {
    return { x: 20 * 64, y: 15 * 64 };
  }

  getExitZones(): MapExitZone[] {
    return [
      // South → Satoshi Town
      {
        x: 19 * 64,
        y: 29 * 64,
        width: 2 * 64,
        height: 64,
        targetScene: 'SatoshiTownScene',
        targetSpawnX: 14 * 64,
        targetSpawnY: 2 * 64
      },
      // North → Solana Caves
      {
        x: 19 * 64,
        y: 0,
        width: 2 * 64,
        height: 64,
        targetScene: 'SolanaCavesScene',
        targetSpawnX: 17 * 64,
        targetSpawnY: 33 * 64
      }
    ];
  }

  getNPCData(): NPCData[] {
    return [
      {
        id: 'forest_healer',
        name: 'Nurse Joy',
        x: 20 * 64,
        y: 14 * 64,
        textureKey: 'npc_nurse',
        type: 'healer',
        dialogLines: [
          'Welcome to the Ethereum Forest rest stop!',
          'Let me heal your PokeMemes.'
        ]
      },
      {
        id: 'forest_guide',
        name: 'Ranger Eth',
        x: 22 * 64,
        y: 24 * 64,
        textureKey: 'npc_ranger',
        type: 'dialog',
        dialogLines: [
          'The Ethereum Forest is full of Bug and Poison type PokeMemes.',
          'Be careful of Coffinbat - it\'s quite strong!',
          'Head north to reach the Solana Caves.'
        ]
      }
    ];
  }

  createTileMap(): void {
    const w = this.getMapWidthTiles();
    const h = this.getMapHeightTiles();

    // Generate procedural tile texture
    if (!this.textures.exists('forest_ground_tile')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0x1a4a1a); // Dark forest green
      gfx.fillRect(0, 0, 64, 64);
      // Add some grass variation
      gfx.fillStyle(0x226622, 0.6);
      gfx.fillRect(5, 10, 8, 6);
      gfx.fillRect(30, 5, 6, 8);
      gfx.fillRect(45, 35, 10, 6);
      gfx.fillRect(15, 45, 7, 7);
      gfx.fillRect(50, 50, 8, 5);
      gfx.generateTexture('forest_ground_tile', 64, 64);
      gfx.destroy();
    }

    // Create data array (all tiles = 0 = grass)
    const data: number[][] = [];
    for (let y = 0; y < h; y++) {
      data[y] = new Array(w).fill(0);
    }

    this.map = this.make.tilemap({ data, tileWidth: 64, tileHeight: 64 });
    const tileset = this.map.addTilesetImage('forest_ground_tile');
    if (tileset) {
      this.groundLayer = this.map.createLayer(0, tileset, 0, 0)!;
      this.groundLayer.setDepth(-10);
    }
  }

  createDecorations(): void {
    // Dense tree placement for forest atmosphere
    const treePositions = [
      // Left edge trees
      { x: 1 * 64, y: 3 * 64 }, { x: 2 * 64, y: 8 * 64 }, { x: 1 * 64, y: 14 * 64 },
      { x: 2 * 64, y: 20 * 64 }, { x: 1 * 64, y: 26 * 64 },
      // Right edge trees
      { x: 38 * 64, y: 4 * 64 }, { x: 37 * 64, y: 10 * 64 }, { x: 38 * 64, y: 16 * 64 },
      { x: 37 * 64, y: 22 * 64 }, { x: 38 * 64, y: 27 * 64 },
      // Interior trees (scattered)
      { x: 6 * 64, y: 5 * 64 }, { x: 12 * 64, y: 3 * 64 }, { x: 28 * 64, y: 4 * 64 },
      { x: 33 * 64, y: 7 * 64 }, { x: 8 * 64, y: 12 * 64 }, { x: 15 * 64, y: 10 * 64 },
      { x: 30 * 64, y: 12 * 64 }, { x: 5 * 64, y: 19 * 64 }, { x: 14 * 64, y: 20 * 64 },
      { x: 26 * 64, y: 18 * 64 }, { x: 34 * 64, y: 20 * 64 }, { x: 10 * 64, y: 26 * 64 },
      { x: 25 * 64, y: 25 * 64 }, { x: 32 * 64, y: 27 * 64 },
    ];

    treePositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_tree_variant_${variant}`, pos.x, pos.y, 160);
    });

    // Bushes scattered throughout
    const bushPositions = [
      { x: 4 * 64, y: 7 * 64 }, { x: 10 * 64, y: 6 * 64 },
      { x: 24 * 64, y: 8 * 64 }, { x: 35 * 64, y: 9 * 64 },
      { x: 7 * 64, y: 16 * 64 }, { x: 18 * 64, y: 17 * 64 },
      { x: 30 * 64, y: 15 * 64 }, { x: 12 * 64, y: 23 * 64 },
      { x: 28 * 64, y: 22 * 64 },
    ];

    bushPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_bush_variant_${variant}`, pos.x, pos.y, 48);
    });

    // Flowers near the healer area
    const flowerPositions = [
      { x: 18 * 64, y: 13 * 64 }, { x: 22 * 64, y: 13 * 64 },
      { x: 19 * 64, y: 15 * 64 }, { x: 21 * 64, y: 15 * 64 },
    ];

    flowerPositions.forEach((pos, i) => {
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_flower_variant_${variant}`, pos.x, pos.y, 32);
    });

    // Sign posts at exits
    utils.createDecoration(this, this.decorations, 'town_sign_variant_1', 18 * 64, 28 * 64, 64);
    utils.createDecoration(this, this.decorations, 'town_sign_variant_2', 18 * 64, 2 * 64, 64);
  }
}
