import { BaseMapScene } from './BaseMapScene';
import * as utils from '../utils';
import {
  SOLANA_CAVES_ENCOUNTERS,
  type WildEncounterEntry,
  type MapExitZone,
  type NPCData
} from '../data/encounterData';

export class SolanaCavesScene extends BaseMapScene {
  constructor() {
    super({ key: 'SolanaCavesScene' });
  }

  getMapId(): string { return 'solana_caves'; }
  getMapWidthTiles(): number { return 35; }
  getMapHeightTiles(): number { return 35; }
  getMusicKey(): string { return 'satoshi_town_theme'; } // Fallback until cave theme exists
  getWildEncounters(): WildEncounterEntry[] { return SOLANA_CAVES_ENCOUNTERS; }
  getGrassTileIndices(): number[] { return [0]; }
  getEncounterChance(): number { return 0.15; }
  getBattleBackgroundKey(): string { return 'battle_background_grass'; }

  getDefaultStartPosition(): { x: number; y: number } {
    return { x: 17 * 64, y: 17 * 64 };
  }

  getExitZones(): MapExitZone[] {
    return [
      // South → Ethereum Forest
      {
        x: 16 * 64,
        y: 34 * 64,
        width: 2 * 64,
        height: 64,
        targetScene: 'EthereumForestScene',
        targetSpawnX: 19 * 64,
        targetSpawnY: 2 * 64
      },
      // East → Pump Beach
      {
        x: 34 * 64,
        y: 16 * 64,
        width: 64,
        height: 2 * 64,
        targetScene: 'PumpBeachScene',
        targetSpawnX: 2 * 64,
        targetSpawnY: 12 * 64
      }
    ];
  }

  getNPCData(): NPCData[] {
    return [
      {
        id: 'cave_miner',
        name: 'Miner Sol',
        x: 17 * 64,
        y: 10 * 64,
        textureKey: 'npc_miner',
        type: 'dialog',
        dialogLines: [
          'These caves are rich with rare Rock and Ground type PokeMemes!',
          'Watch out for Longonix - it\'s the rarest one here.',
          'The exit to the east leads to Pump Beach.'
        ]
      }
    ];
  }

  createTileMap(): void {
    const w = this.getMapWidthTiles();
    const h = this.getMapHeightTiles();

    // Generate cave floor texture
    if (!this.textures.exists('cave_ground_tile')) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0x3a3a3a); // Dark gray cave floor
      gfx.fillRect(0, 0, 64, 64);
      // Add rocky variation
      gfx.fillStyle(0x4a4a4a, 0.5);
      gfx.fillRect(8, 12, 10, 6);
      gfx.fillRect(35, 8, 8, 10);
      gfx.fillRect(20, 40, 12, 8);
      gfx.fillRect(48, 45, 6, 7);
      gfx.fillStyle(0x2a2a2a, 0.4);
      gfx.fillRect(25, 15, 5, 5);
      gfx.fillRect(10, 50, 7, 4);
      gfx.generateTexture('cave_ground_tile', 64, 64);
      gfx.destroy();
    }

    const data: number[][] = [];
    for (let y = 0; y < h; y++) {
      data[y] = new Array(w).fill(0);
    }

    this.map = this.make.tilemap({ data, tileWidth: 64, tileHeight: 64 });
    const tileset = this.map.addTilesetImage('cave_ground_tile');
    if (tileset) {
      this.groundLayer = this.map.createLayer(0, tileset, 0, 0)!;
      this.groundLayer.setDepth(-10);
    }
  }

  createDecorations(): void {
    // Rocky formations along cave walls
    const rockPositions = [
      // Top wall
      { x: 3 * 64, y: 2 * 64 }, { x: 8 * 64, y: 1 * 64 }, { x: 14 * 64, y: 2 * 64 },
      { x: 22 * 64, y: 1 * 64 }, { x: 28 * 64, y: 2 * 64 }, { x: 33 * 64, y: 1 * 64 },
      // Bottom wall
      { x: 5 * 64, y: 32 * 64 }, { x: 12 * 64, y: 33 * 64 }, { x: 20 * 64, y: 32 * 64 },
      { x: 27 * 64, y: 33 * 64 },
      // Left wall
      { x: 1 * 64, y: 6 * 64 }, { x: 2 * 64, y: 14 * 64 }, { x: 1 * 64, y: 22 * 64 },
      { x: 2 * 64, y: 28 * 64 },
      // Right wall
      { x: 33 * 64, y: 8 * 64 }, { x: 32 * 64, y: 20 * 64 }, { x: 33 * 64, y: 28 * 64 },
      // Interior boulders
      { x: 10 * 64, y: 8 * 64 }, { x: 24 * 64, y: 6 * 64 },
      { x: 8 * 64, y: 18 * 64 }, { x: 26 * 64, y: 15 * 64 },
      { x: 12 * 64, y: 25 * 64 }, { x: 22 * 64, y: 24 * 64 },
    ];

    rockPositions.forEach((pos, i) => {
      // Use tree variants as "rock" placeholders (same sprite system)
      const variant = (i % 5) + 1;
      utils.createDecoration(this, this.decorations, `town_bush_variant_${variant}`, pos.x, pos.y, 64);
    });

    // Lamp posts for cave lighting
    const lampPositions = [
      { x: 10 * 64, y: 12 * 64 }, { x: 24 * 64, y: 12 * 64 },
      { x: 17 * 64, y: 20 * 64 },
      { x: 8 * 64, y: 28 * 64 }, { x: 26 * 64, y: 28 * 64 },
    ];

    lampPositions.forEach((pos, i) => {
      const variant = (i % 3) + 2;
      utils.createDecoration(this, this.decorations, `town_lamp_variant_${variant}`, pos.x, pos.y, 96);
    });

    // Signs near exits
    utils.createDecoration(this, this.decorations, 'town_sign_variant_1', 15 * 64, 33 * 64, 64);
    utils.createDecoration(this, this.decorations, 'town_sign_variant_2', 33 * 64, 15 * 64, 64);
  }
}
