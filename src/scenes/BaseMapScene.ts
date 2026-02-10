import Phaser from 'phaser';
import * as utils from '../utils';
import { Player, OtherPlayer } from '../game/Player';
import { GameManager } from '../game/GameManager';
import { NPC } from '../game/NPC';
import type { PlayerPresence } from '../types/database';
import type { WildEncounterEntry, MapExitZone, NPCData } from '../data/encounterData';
import { selectRandomEncounter } from '../data/encounterData';

export abstract class BaseMapScene extends Phaser.Scene {
  // Map properties
  public mapWidth: number = 0;
  public mapHeight: number = 0;

  // Tilemap
  public map!: Phaser.Tilemaps.Tilemap;
  public groundLayer!: Phaser.Tilemaps.TilemapLayer;
  public pathsLayer!: Phaser.Tilemaps.TilemapLayer;

  // Player
  public player!: Player;
  public otherPlayers: Map<string, OtherPlayer> = new Map();

  // Decorations & NPCs
  public decorations!: Phaser.GameObjects.Group;
  public npcs: NPC[] = [];

  // Input
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Game manager
  protected gameManager!: GameManager;

  // Audio
  public backgroundMusic!: Phaser.Sound.BaseSound;

  // Position sync
  private positionSyncTimer: number = 0;
  private positionSyncInterval: number = 100;

  // Wild encounter system
  private stepCounter: number = 0;
  private lastTileX: number = -1;
  private lastTileY: number = -1;
  protected isInBattle: boolean = false;
  protected isTransitioning: boolean = false;

  // Exit zones
  private exitZoneGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Spawn position override (from map transition)
  private spawnX?: number;
  private spawnY?: number;

  // --- Abstract methods each subclass must implement ---
  abstract getMapId(): string;
  abstract getMapWidthTiles(): number;
  abstract getMapHeightTiles(): number;
  abstract getMusicKey(): string;
  abstract getWildEncounters(): WildEncounterEntry[];
  abstract getGrassTileIndices(): number[];
  abstract getExitZones(): MapExitZone[];
  abstract getNPCData(): NPCData[];
  abstract createTileMap(): void;
  abstract createDecorations(): void;

  // --- Overridable methods ---
  protected getEncounterChance(): number { return 0.1; }
  protected getDefaultStartPosition(): { x: number; y: number } {
    return { x: this.mapWidth / 2, y: this.mapHeight / 2 };
  }
  protected getBattleBackgroundKey(): string { return 'battle_background_grass'; }

  // --- Lifecycle ---

  init(data?: { spawnX?: number; spawnY?: number }): void {
    this.spawnX = data?.spawnX;
    this.spawnY = data?.spawnY;
    this.isInBattle = false;
    this.isTransitioning = false;
    this.stepCounter = 0;
    this.lastTileX = -1;
    this.lastTileY = -1;
    this.otherPlayers = new Map();
    this.npcs = [];
  }

  async create(): Promise<void> {
    // Set dimensions
    this.mapWidth = this.getMapWidthTiles() * 64;
    this.mapHeight = this.getMapHeightTiles() * 64;

    // Get game manager
    this.gameManager = GameManager.getInstance();

    // Create tilemap
    this.createTileMap();

    // Create decorations
    this.decorations = this.add.group();
    this.createDecorations();

    // Create player
    this.createPlayer();

    // Create NPCs
    this.createNPCs();

    // Create exit zones
    this.createExitZones();

    // Setup camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Setup world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Join multiplayer
    await this.setupMultiplayer();

    // Launch UI scene
    this.scene.launch('WorldUIScene', { gameSceneKey: this.scene.key });

    // Play background music
    this.playBackgroundMusic();

    // Setup battle end listener
    this.events.on('battle-ended', this.onBattleEnded, this);
  }

  private createPlayer(): void {
    const defaultPos = this.getDefaultStartPosition();
    const startX = this.spawnX ?? this.gameManager.playerData?.position_x ?? defaultPos.x;
    const startY = this.spawnY ?? this.gameManager.playerData?.position_y ?? defaultPos.y;

    this.player = new Player(
      this,
      startX,
      startY,
      this.gameManager.username,
      this.gameManager.playerId || ''
    );

    this.player.setCollideWorldBounds(true);

    this.player.onPositionChange = () => {
      // Real-time sync handled in update
    };

    this.player.onInteract = () => {
      this.handleInteraction();
    };
  }

  private createNPCs(): void {
    for (const npcData of this.getNPCData()) {
      const npc = new NPC(this, npcData);
      this.npcs.push(npc);
    }
  }

  private createExitZones(): void {
    this.exitZoneGroup = this.physics.add.staticGroup();

    for (const exit of this.getExitZones()) {
      const zone = this.add.zone(exit.x + exit.width / 2, exit.y + exit.height / 2, exit.width, exit.height);
      this.physics.add.existing(zone, true); // static body
      (zone as any).exitData = exit;
      this.exitZoneGroup.add(zone);
    }

    this.physics.add.overlap(this.player, this.exitZoneGroup, (_player, zone) => {
      const exitData = (zone as any).exitData as MapExitZone;
      this.transitionToMap(exitData);
    });
  }

  private transitionToMap(exit: MapExitZone): void {
    if (this.isTransitioning || this.isInBattle) return;
    this.isTransitioning = true;

    // Stop player movement
    this.player.setVelocity(0, 0);

    // Screen fade
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cleanupScene();
      this.scene.start(exit.targetScene, {
        spawnX: exit.targetSpawnX,
        spawnY: exit.targetSpawnY
      });
    });
  }

  private async setupMultiplayer(): Promise<void> {
    if (this.gameManager.isOfflineMode) return;

    await this.gameManager.joinMap(this.getMapId());

    this.gameManager.setOnPlayerJoin((player) => {
      this.addOtherPlayer(player);
    });

    this.gameManager.setOnPlayerLeave((playerId) => {
      this.removeOtherPlayer(playerId);
    });

    this.gameManager.otherPlayers.forEach((player) => {
      this.addOtherPlayer(player);
    });

    this.gameManager.setOnChatMessage((message) => {
      this.events.emit('chat-message', message);
    });
  }

  private addOtherPlayer(playerData: PlayerPresence): void {
    if (this.otherPlayers.has(playerData.id)) return;

    const otherPlayer = new OtherPlayer(
      this,
      playerData.x,
      playerData.y,
      playerData.id,
      playerData.username
    );

    this.otherPlayers.set(playerData.id, otherPlayer);
  }

  private removeOtherPlayer(playerId: string): void {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  private handleInteraction(): void {
    // Check NPCs first
    const interactionRange = 80;
    for (const npc of this.npcs) {
      if (npc.isPlayerInRange(this.player.x, this.player.y, interactionRange)) {
        npc.interact(this);
        return;
      }
    }

    // Check for nearby players
    const playerRange = 100;
    this.otherPlayers.forEach((otherPlayer, id) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        otherPlayer.x, otherPlayer.y
      );

      if (distance < playerRange) {
        this.events.emit('show-player-interaction', {
          playerId: id,
          username: otherPlayer.username,
          x: otherPlayer.x,
          y: otherPlayer.y
        });
      }
    });
  }

  protected playBackgroundMusic(): void {
    const musicKey = this.getMusicKey();
    if (this.sound.get(musicKey)) {
      this.backgroundMusic = this.sound.get(musicKey)!;
    } else {
      // Try to add it, fall back to satoshi_town_theme if not loaded
      try {
        this.backgroundMusic = this.sound.add(musicKey, {
          volume: 0.6,
          loop: true
        });
      } catch {
        if (musicKey !== 'satoshi_town_theme') {
          this.backgroundMusic = this.sound.add('satoshi_town_theme', {
            volume: 0.6,
            loop: true
          });
        }
      }
    }

    if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
  }

  // --- Wild encounters ---

  private checkWildEncounter(): void {
    if (!this.player || !this.groundLayer) return;

    const tileX = this.groundLayer.worldToTileX(this.player.x);
    const tileY = this.groundLayer.worldToTileY(this.player.y);

    if (tileX === this.lastTileX && tileY === this.lastTileY) return;

    this.lastTileX = tileX!;
    this.lastTileY = tileY!;

    const tile = this.groundLayer.getTileAt(tileX!, tileY!);
    if (!tile) return;

    const grassIndices = this.getGrassTileIndices();
    const isGrassTile = grassIndices.includes(tile.index) || (grassIndices.length === 0 && tile.index >= 0 && tile.index <= 10);

    if (!isGrassTile) return;

    this.stepCounter++;

    if (Math.random() < this.getEncounterChance()) {
      this.triggerWildEncounter();
    }
  }

  private triggerWildEncounter(): void {
    if (this.isInBattle || this.isTransitioning) return;

    this.isInBattle = true;
    this.stepCounter = 0;

    this.player.setVelocity(0, 0);

    this.cameras.main.flash(300, 255, 255, 255);

    const encounterSound = this.sound.add('battle_start', { volume: 0.3 });
    encounterSound.play();

    if (this.backgroundMusic?.isPlaying) {
      this.backgroundMusic.stop();
    }

    // Select random encounter from this map's pool
    const encounter = selectRandomEncounter(this.getWildEncounters());

    this.time.delayedCall(400, () => {
      this.scene.pause();
      this.scene.launch('BattleScene', {
        isWild: true,
        returnScene: this.scene.key,
        enemyPokememeId: encounter.pokememeId,
        enemyLevel: encounter.level,
        battleBackground: this.getBattleBackgroundKey()
      });
    });
  }

  private onBattleEnded(): void {
    this.isInBattle = false;
    this.playBackgroundMusic();
    this.stepCounter = 0;
  }

  // --- Update loop ---

  update(time: number, delta: number): void {
    if (this.isInBattle || this.isTransitioning) return;

    this.player.update(time, delta, this.cursors);

    this.checkWildEncounter();

    this.otherPlayers.forEach((player) => {
      player.update(time, delta);

      const serverData = this.gameManager.otherPlayers.get(player.playerId);
      if (serverData) {
        player.updateFromServer(
          serverData.x,
          serverData.y,
          serverData.facingDirection,
          serverData.isMoving
        );
      }
    });

    // Sync position
    this.positionSyncTimer += delta;
    if (this.positionSyncTimer >= this.positionSyncInterval) {
      this.positionSyncTimer = 0;

      if (this.gameManager.isOfflineMode) {
        this.gameManager.savePositionLocally(
          this.player.x,
          this.player.y,
          this.player.facingDirection
        );
      } else {
        this.gameManager.updatePosition(
          this.player.x,
          this.player.y,
          this.player.facingDirection,
          this.player.isMoving
        );
      }
    }

    this.sortObjectsByY();
  }

  private sortObjectsByY(): void {
    const sortableObjects: Phaser.GameObjects.GameObject[] = [
      this.player,
      ...Array.from(this.otherPlayers.values()),
      ...this.decorations.getChildren(),
      ...this.npcs
    ];

    sortableObjects.forEach((obj: any) => {
      if (obj.y !== undefined) {
        obj.setDepth(obj.y);
      }
    });
  }

  // --- Cleanup ---

  private cleanupScene(): void {
    this.gameManager.savePositionUniversal(
      this.player.x,
      this.player.y,
      this.player.facingDirection
    );

    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    if (!this.gameManager.isOfflineMode) {
      this.gameManager.leaveCurrentMap();
    }

    // Stop WorldUIScene
    this.scene.stop('WorldUIScene');
  }

  shutdown(): void {
    this.cleanupScene();
  }
}
