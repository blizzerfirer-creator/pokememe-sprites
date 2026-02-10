import Phaser from 'phaser';
import * as utils from '../utils';
import { GameManager } from '../game/GameManager';
import { getPokeMemeById, calculateDamage, pokememeDatabase } from '../data/pokememeData';
import type { PokeMemeData, PokeMemeMove } from '../data/pokememeData';
import { BattleUIScene } from './BattleUIScene';
import * as localStore from '../lib/localStorage';
import { SATOSHI_TOWN_ENCOUNTERS, selectRandomEncounter } from '../data/encounterData';

interface BattlePokeMeme {
  id: string; // Database/local ID for saving
  data: PokeMemeData;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  moves: PokeMemeMove[];
  experience: number;
}

export class BattleScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private battleUI!: BattleUIScene;
  
  // Battle state
  private isWildBattle: boolean = true;
  private isPvP: boolean = false;
  
  // PokeMemes
  private playerPokeMeme!: BattlePokeMeme;
  private enemyPokeMeme!: BattlePokeMeme;
  
  // Battle state
  private battlePhase: 'intro' | 'action' | 'executing' | 'victory' | 'defeat' | 'caught' = 'intro';
  private pumpMeter: number = 0;
  private maxPumpMeter: number = 100;
  
  // Sprites
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private battleBackground!: Phaser.GameObjects.Image;
  
  // Audio
  private battleMusic!: Phaser.Sound.BaseSound;
  
  // Return scene
  private returnSceneKey: string = 'SatoshiTownScene';

  // Enemy data passed from world
  private wildPokememeId?: number;
  private wildLevel?: number;

  // Battle background key
  private battleBgKey: string = 'battle_background_grass';
  
  constructor() {
    super({ key: 'BattleScene' });
  }
  
  init(data: {
    isWild?: boolean;
    isPvP?: boolean;
    enemyPokememeId?: number;
    enemyLevel?: number;
    returnScene?: string;
    opponentId?: string;
    battleBackground?: string;
  }): void {
    this.isWildBattle = data.isWild ?? true;
    this.isPvP = data.isPvP ?? false;
    this.returnSceneKey = data.returnScene || 'SatoshiTownScene';
    this.wildPokememeId = data.enemyPokememeId;
    this.wildLevel = data.enemyLevel;
    this.battleBgKey = data.battleBackground || 'battle_background_grass';
    this.pumpMeter = 0;
    this.battlePhase = 'intro';
  }
  
  async create(): Promise<void> {
    this.gameManager = GameManager.getInstance();
    
    // Setup battle background
    this.createBattleBackground();
    
    // Load player's party (first PokeMeme)
    await this.loadPlayerPokeMeme();
    
    // Generate or load enemy PokeMeme
    this.loadEnemyPokeMeme();
    
    // Create sprites
    this.createBattleSprites();
    
    // Launch Battle UI Scene
    this.scene.launch('BattleUIScene', {
      playerPokeMeme: {
        name: this.playerPokeMeme.data.name,
        level: this.playerPokeMeme.level,
        currentHp: this.playerPokeMeme.currentHp,
        maxHp: this.playerPokeMeme.maxHp,
        moves: this.playerPokeMeme.moves,
      },
      enemyPokeMeme: {
        name: this.enemyPokeMeme.data.name,
        level: this.enemyPokeMeme.level,
        currentHp: this.enemyPokeMeme.currentHp,
        maxHp: this.enemyPokeMeme.maxHp,
        moves: this.enemyPokeMeme.moves,
      },
      isWildBattle: this.isWildBattle,
      pumpMeter: this.pumpMeter,
      currentXP: this.playerPokeMeme.experience,
      xpToNextLevel: localStore.getXPForLevel(this.playerPokeMeme.level),
    });
    
    // Get reference to UI scene
    this.battleUI = this.scene.get('BattleUIScene') as BattleUIScene;
    
    // Setup UI event listeners
    this.setupUIEvents();
    
    // Play battle music
    this.playBattleMusic();
    
    // Start battle intro
    this.startBattleIntro();
  }
  
  private createBattleBackground(): void {
    // Use the battle background passed from the map (or default)
    const bgKey = this.textures.exists(this.battleBgKey) ? this.battleBgKey : 'battle_background_grass';
    this.battleBackground = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      bgKey
    );
    utils.initScale(this.battleBackground, { x: 0.5, y: 0.5 }, this.scale.width, this.scale.height);
    this.battleBackground.setDepth(-100);
    
    // Add platform graphics on top
    const graphics = this.add.graphics();
    graphics.setDepth(-50);
    
    // Player platform (bottom left)
    graphics.fillStyle(0x654321, 0.8);
    graphics.fillEllipse(280, this.scale.height * 0.78, 280, 60);
    
    // Enemy platform (top right)
    graphics.fillStyle(0x654321, 0.8);
    graphics.fillEllipse(this.scale.width - 280, this.scale.height * 0.42, 240, 50);
  }
  
  private async loadPlayerPokeMeme(): Promise<void> {
    const party = await this.gameManager.getPartyUniversal();
    
    if (party.length > 0) {
      const firstPokememe = party[0];
      const pokememeData = getPokeMemeById(firstPokememe.pokememe_id);
      
      if (pokememeData) {
        // Build moves list
        const moves: PokeMemeMove[] = [pokememeData.signatureMove];
        
        // Add basic move if available
        if (firstPokememe.move1) {
          moves.push({
            name: firstPokememe.move1,
            type: pokememeData.types[0],
            power: 40,
            accuracy: 100,
            pp: 35,
            description: 'A basic attack'
          });
        }
        
        this.playerPokeMeme = {
          id: firstPokememe.id,
          data: pokememeData,
          level: firstPokememe.level,
          currentHp: firstPokememe.current_hp,
          maxHp: firstPokememe.hp,
          attack: firstPokememe.attack,
          defense: firstPokememe.defense,
          spAttack: firstPokememe.sp_attack,
          spDefense: firstPokememe.sp_defense,
          speed: firstPokememe.speed,
          moves,
          experience: firstPokememe.experience || 0
        };
        return;
      }
    }
    
    // Fallback starter
    const starterData = getPokeMemeById(1)!;
    this.playerPokeMeme = {
      id: 'fallback',
      data: starterData,
      level: 5,
      currentHp: 25,
      maxHp: 25,
      attack: 25,
      defense: 25,
      spAttack: 32,
      spDefense: 32,
      speed: 22,
      moves: [starterData.signatureMove],
      experience: 0
    };
  }
  
  private loadEnemyPokeMeme(): void {
    let pokememeData: PokeMemeData;
    let level: number;
    
    if (this.wildPokememeId) {
      // Use the specific wild PokeMeme passed in
      pokememeData = getPokeMemeById(this.wildPokememeId) || getPokeMemeById(1)!;
      level = this.wildLevel || Phaser.Math.Between(2, 5);
    } else {
      // Fallback: generate random wild PokeMeme from Satoshi Town pool
      const encounter = selectRandomEncounter(SATOSHI_TOWN_ENCOUNTERS);
      pokememeData = getPokeMemeById(encounter.pokememeId) || getPokeMemeById(1)!;
      level = encounter.level;
    }
    
    // Calculate stats based on level
    const baseMultiplier = 1 + (level - 1) * 0.1;
    
    this.enemyPokeMeme = {
      id: 'wild_' + Date.now(),
      data: pokememeData,
      level,
      currentHp: Math.floor(pokememeData.baseStats.hp * baseMultiplier),
      maxHp: Math.floor(pokememeData.baseStats.hp * baseMultiplier),
      attack: Math.floor(pokememeData.baseStats.attack * baseMultiplier),
      defense: Math.floor(pokememeData.baseStats.defense * baseMultiplier),
      spAttack: Math.floor(pokememeData.baseStats.spAttack * baseMultiplier),
      spDefense: Math.floor(pokememeData.baseStats.spDefense * baseMultiplier),
      speed: Math.floor(pokememeData.baseStats.speed * baseMultiplier),
      moves: [pokememeData.signatureMove],
      experience: 0
    };
    
    // Mark as seen in MemeDex
    if (this.gameManager.isOfflineMode) {
      localStore.updateLocalMemeDexEntry(
        this.gameManager.playerId || '',
        pokememeData.id,
        false,
        true
      );
    }
  }
  
  private createBattleSprites(): void {
    // Get sprite key for player's PokeMeme
    const playerSpriteKey = this.playerPokeMeme.data.spriteKey;
    const enemySpriteKey = this.enemyPokeMeme.data.spriteKey;
    
    // Player PokeMeme sprite (back/left side)
    this.playerSprite = this.add.sprite(280, this.scale.height * 0.68, playerSpriteKey);
    utils.initScale(this.playerSprite, { x: 0.5, y: 1.0 }, undefined, 180);
    this.playerSprite.setAlpha(0);
    this.playerSprite.setDepth(10);
    
    // Enemy PokeMeme sprite (front/right side)
    this.enemySprite = this.add.sprite(this.scale.width - 280, this.scale.height * 0.32, enemySpriteKey);
    utils.initScale(this.enemySprite, { x: 0.5, y: 1.0 }, undefined, 140);
    this.enemySprite.setAlpha(0);
    this.enemySprite.setDepth(10);
  }
  
  private setupUIEvents(): void {
    const uiScene = this.scene.get('BattleUIScene');
    
    // Move selected
    uiScene.events.on('move-selected', (moveIndex: number) => {
      this.executePlayerMove(moveIndex);
    });
    
    // Run selected
    uiScene.events.on('run-selected', () => {
      this.attemptRun();
    });
    
    // Item selected
    uiScene.events.on('item-selected', (itemId: string) => {
      this.useItem(itemId);
    });
    
    // Level up dismissed
    uiScene.events.on('level-up-dismissed', () => {
      this.checkBattleEnd();
    });
  }
  
  private playBattleMusic(): void {
    const musicKey = this.isPvP ? 'pvp_battle_theme' : 'wild_battle_theme';
    this.battleMusic = this.sound.add(musicKey, {
      volume: 0.6,
      loop: true
    });
    this.battleMusic.play();
    
    // Play battle start sound
    const startSound = this.sound.add('battle_start', { volume: 0.5 });
    startSound.play();
  }
  
  private async startBattleIntro(): Promise<void> {
    this.battlePhase = 'intro';
    
    // Show battle flash transition
    await this.battleUI.showBattleFlash();
    
    // Animate enemy appearance (slide in from right)
    this.enemySprite.x = this.scale.width + 100;
    this.enemySprite.setAlpha(1);
    
    this.tweens.add({
      targets: this.enemySprite,
      x: this.scale.width - 280,
      duration: 600,
      ease: 'Power2'
    });
    
    this.battleUI.showMessage(`A wild ${this.enemyPokeMeme.data.name} appeared!`);
    
    // Animate player PokeMeme appearance
    this.time.delayedCall(1200, () => {
      this.playerSprite.x = -100;
      this.playerSprite.setAlpha(1);
      
      this.tweens.add({
        targets: this.playerSprite,
        x: 280,
        duration: 500,
        ease: 'Power2'
      });
      
      this.battleUI.showMessage(`Go, ${this.playerPokeMeme.data.name}!`);
      
      // Show action menu
      this.time.delayedCall(1000, () => {
        this.battlePhase = 'action';
        this.battleUI.showActionMenu();
        this.battleUI.showMessage('What will you do?');
      });
    });
  }
  
  private async executePlayerMove(moveIndex: number): Promise<void> {
    if (this.battlePhase !== 'action') return;
    
    this.battlePhase = 'executing';
    
    const move = this.playerPokeMeme.moves[moveIndex];
    if (!move) return;
    
    // Determine turn order based on speed
    const playerFirst = this.playerPokeMeme.speed >= this.enemyPokeMeme.speed;
    
    if (playerFirst) {
      await this.executeAttack(true, move);
      if (this.enemyPokeMeme.currentHp > 0 && this.playerPokeMeme.currentHp > 0) {
        await this.executeEnemyTurn();
      }
    } else {
      await this.executeEnemyTurn();
      if (this.playerPokeMeme.currentHp > 0 && this.enemyPokeMeme.currentHp > 0) {
        await this.executeAttack(true, move);
      }
    }
    
    // Check battle end conditions
    if (this.battlePhase === 'executing') {
      this.checkBattleEnd();
    }
  }
  
  private async executeAttack(isPlayer: boolean, move: PokeMemeMove): Promise<void> {
    return new Promise((resolve) => {
      const attacker = isPlayer ? this.playerPokeMeme : this.enemyPokeMeme;
      const defender = isPlayer ? this.enemyPokeMeme : this.playerPokeMeme;
      const attackerSprite = isPlayer ? this.playerSprite : this.enemySprite;
      const defenderSprite = isPlayer ? this.enemySprite : this.playerSprite;
      
      this.battleUI.showMessage(`${attacker.data.name} used ${move.name}!`);
      
      // Attack animation - lunge forward
      const originalX = attackerSprite.x;
      const targetX = isPlayer ? originalX + 80 : originalX - 80;
      
      this.tweens.add({
        targets: attackerSprite,
        x: targetX,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          // Calculate damage
          const isSpecial = ['Grass', 'Fire', 'Water', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy'].includes(move.type);
          const result = calculateDamage(
            { level: attacker.level, attack: attacker.attack, spAttack: attacker.spAttack },
            { defense: defender.defense, spDefense: defender.spDefense, types: defender.data.types },
            move,
            isSpecial
          );
          
          // Apply damage
          defender.currentHp = Math.max(0, defender.currentHp - result.damage);
          
          // Flash effect on hit
          this.tweens.add({
            targets: defenderSprite,
            alpha: 0.2,
            duration: 80,
            repeat: 3,
            yoyo: true
          });
          
          // Play hit sound
          const hitSound = this.sound.add(result.isCritical ? 'critical_hit' : 'hit_damage', { volume: 0.4 });
          hitSound.play();
          
          // Critical hit flash
          if (result.isCritical) {
            this.battleUI.showCriticalFlash();
          }
          
          // Super effective flash
          if (result.effectiveness > 1) {
            this.time.delayedCall(300, () => {
              this.battleUI.showSuperEffectiveFlash();
            });
          }
          
          // Update HP bar
          this.battleUI.updateHPBar(
            isPlayer ? 'enemy' : 'player',
            defender.currentHp,
            defender.maxHp
          );
          
          // Show effectiveness message
          this.time.delayedCall(600, () => {
            if (result.effectiveness > 1) {
              this.battleUI.showMessage("It's super effective!");
            } else if (result.effectiveness < 1 && result.effectiveness > 0) {
              this.battleUI.showMessage("It's not very effective...");
            } else if (result.effectiveness === 0) {
              this.battleUI.showMessage("It had no effect!");
            }
            
            // Increase pump meter for player attacks
            if (isPlayer) {
              this.pumpMeter = Math.min(this.maxPumpMeter, this.pumpMeter + 15);
              this.battleUI.updatePumpMeter(this.pumpMeter);
            }
            
            this.time.delayedCall(700, resolve);
          });
        }
      });
    });
  }
  
  private async executeEnemyTurn(): Promise<void> {
    // Simple AI: use random move
    const move = Phaser.Math.RND.pick(this.enemyPokeMeme.moves);
    await this.executeAttack(false, move);
  }
  
  private checkBattleEnd(): void {
    if (this.enemyPokeMeme.currentHp <= 0) {
      this.handleVictory();
    } else if (this.playerPokeMeme.currentHp <= 0) {
      this.handleDefeat();
    } else {
      this.battlePhase = 'action';
      this.battleUI.showActionMenu();
      this.battleUI.showMessage('What will you do?');
    }
  }
  
  private async handleVictory(): Promise<void> {
    this.battlePhase = 'victory';
    
    // Faint animation
    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y + 100,
      alpha: 0,
      duration: 600
    });
    
    this.battleUI.showMessage(`Wild ${this.enemyPokeMeme.data.name} fainted!`);
    
    // Calculate XP
    const baseXP = this.enemyPokeMeme.data.baseStats.hp + this.enemyPokeMeme.data.baseStats.attack;
    const xpGained = Math.floor(baseXP * this.enemyPokeMeme.level * 0.5);
    
    this.time.delayedCall(1500, () => {
      this.battleUI.showMessage(`${this.playerPokeMeme.data.name} gained ${xpGained} EXP!`);
      
      // Add XP and check for level up
      const oldXP = this.playerPokeMeme.experience;
      const xpToLevel = localStore.getXPForLevel(this.playerPokeMeme.level);
      
      // Animate XP bar
      this.battleUI.animateXPGain(oldXP, oldXP + xpGained, xpToLevel, () => {
        // Save XP and check level up
        if (this.gameManager.isOfflineMode && this.playerPokeMeme.id !== 'fallback') {
          const result = localStore.addXPToPokememe(this.playerPokeMeme.id, xpGained);
          
          if (result.leveledUp && result.statIncreases) {
            // Show level up modal
            this.battleUI.showLevelUpModal(
              this.playerPokeMeme.data.name,
              result.newLevel,
              result.statIncreases
            );
            
            // Update player PokeMeme stats
            this.playerPokeMeme.level = result.newLevel;
            this.playerPokeMeme.maxHp += result.statIncreases.hp;
            this.playerPokeMeme.currentHp += result.statIncreases.hp;
            
            // Don't end battle yet - wait for level up modal to close
            return;
          }
        }
        
        // Save current HP
        this.savePlayerHP();
        
        // End battle after delay
        this.time.delayedCall(1500, () => {
          this.endBattle(true);
        });
      });
    });
  }
  
  private handleDefeat(): void {
    this.battlePhase = 'defeat';
    
    // Faint animation
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y + 100,
      alpha: 0,
      duration: 600
    });
    
    this.battleUI.showMessage(`${this.playerPokeMeme.data.name} fainted!`);
    
    // Save 0 HP
    this.savePlayerHP();
    
    this.time.delayedCall(2000, () => {
      this.endBattle(false);
    });
  }
  
  private attemptRun(): void {
    if (!this.isWildBattle) {
      this.battleUI.showMessage("Can't run from a trainer battle!");
      this.time.delayedCall(1000, () => {
        this.battleUI.showActionMenu();
      });
      return;
    }
    
    this.battlePhase = 'executing';
    
    // Calculate escape chance based on speed
    const escapeChance = (this.playerPokeMeme.speed / this.enemyPokeMeme.speed) * 0.5 + 0.3;
    const escaped = Math.random() < escapeChance;
    
    if (escaped) {
      this.battleUI.showMessage("Got away safely!");
      this.time.delayedCall(1000, () => {
        this.endBattle(false);
      });
    } else {
      this.battleUI.showMessage("Couldn't get away!");
      this.time.delayedCall(1000, async () => {
        await this.executeEnemyTurn();
        this.checkBattleEnd();
      });
    }
  }
  
  private async useItem(itemId: string): Promise<void> {
    this.battlePhase = 'executing';
    
    const inventory = await this.gameManager.getInventoryUniversal();
    const item = inventory.find(i => i.item_id === itemId);
    
    if (!item || item.quantity <= 0) {
      this.battleUI.showMessage("You don't have any!");
      this.time.delayedCall(1000, () => {
        this.battlePhase = 'action';
        this.battleUI.showActionMenu();
      });
      return;
    }
    
    if (itemId === 'cryptosphere') {
      await this.attemptCatch();
    } else if (itemId === 'potion') {
      await this.usePotion();
    }
  }
  
  private async attemptCatch(): Promise<void> {
    if (!this.isWildBattle) {
      this.battleUI.showMessage("You can't catch a trainer's PokeMeme!");
      this.time.delayedCall(1000, () => {
        this.battlePhase = 'action';
        this.battleUI.showActionMenu();
      });
      return;
    }
    
    this.battleUI.showMessage(`You threw a CryptoSphere!`);
    
    // Use item from inventory
    if (this.gameManager.isOfflineMode) {
      localStore.updateLocalInventoryItem(
        this.gameManager.playerId || '',
        'cryptosphere',
        -1
      );
    }
    
    // Calculate catch rate
    // Base rate modified by HP percentage (lower HP = easier to catch)
    const hpPercent = this.enemyPokeMeme.currentHp / this.enemyPokeMeme.maxHp;
    const baseCatchRate = 0.3;
    const hpModifier = (1 - hpPercent) * 0.5; // Up to 50% bonus at 0 HP
    const levelModifier = Math.max(0, (10 - this.enemyPokeMeme.level) * 0.02); // Easier for lower levels
    
    const catchRate = Math.min(0.9, baseCatchRate + hpModifier + levelModifier);
    const caught = Math.random() < catchRate;
    
    // Show catch animation
    await this.battleUI.showCatchAnimation(caught, this.enemyPokeMeme.data.name);
    
    if (caught) {
      this.battlePhase = 'caught';
      
      // Add to party/PC
      if (this.gameManager.isOfflineMode) {
        const pokememes = localStore.getLocalPokememes();
        const partyCount = pokememes.filter(p => p.is_in_party).length;
        
        localStore.addLocalPokememe({
          player_id: this.gameManager.playerId || '',
          pokememe_id: this.enemyPokeMeme.data.id,
          nickname: null,
          level: this.enemyPokeMeme.level,
          experience: 0,
          hp: this.enemyPokeMeme.maxHp,
          current_hp: this.enemyPokeMeme.currentHp,
          attack: this.enemyPokeMeme.attack,
          defense: this.enemyPokeMeme.defense,
          sp_attack: this.enemyPokeMeme.spAttack,
          sp_defense: this.enemyPokeMeme.spDefense,
          speed: this.enemyPokeMeme.speed,
          move1: this.enemyPokeMeme.data.signatureMove.name,
          move2: null,
          move3: null,
          move4: null,
          is_in_party: partyCount < 6,
          party_slot: partyCount < 6 ? partyCount : null
        });
        
        // Mark as caught in MemeDex
        localStore.updateLocalMemeDexEntry(
          this.gameManager.playerId || '',
          this.enemyPokeMeme.data.id,
          true,
          true
        );
      }
      
      this.battleUI.showMessage(`${this.enemyPokeMeme.data.name} was added to your team!`);
      
      this.time.delayedCall(2000, () => {
        this.endBattle(true);
      });
    } else {
      // Enemy attacks after failed catch
      this.time.delayedCall(500, async () => {
        await this.executeEnemyTurn();
        this.checkBattleEnd();
      });
    }
  }
  
  private async usePotion(): Promise<void> {
    const healAmount = 20;
    const oldHp = this.playerPokeMeme.currentHp;
    this.playerPokeMeme.currentHp = Math.min(
      this.playerPokeMeme.maxHp,
      this.playerPokeMeme.currentHp + healAmount
    );
    
    // Use item from inventory
    if (this.gameManager.isOfflineMode) {
      localStore.updateLocalInventoryItem(
        this.gameManager.playerId || '',
        'potion',
        -1
      );
    }
    
    this.battleUI.showMessage(`${this.playerPokeMeme.data.name} recovered ${this.playerPokeMeme.currentHp - oldHp} HP!`);
    
    // Play heal sound
    const healSound = this.sound.add('heal_sound', { volume: 0.5 });
    healSound.play();
    
    // Update HP bar
    this.battleUI.updateHPBar('player', this.playerPokeMeme.currentHp, this.playerPokeMeme.maxHp);
    
    // Enemy attacks after using item
    this.time.delayedCall(1000, async () => {
      await this.executeEnemyTurn();
      this.checkBattleEnd();
    });
  }
  
  private savePlayerHP(): void {
    if (this.gameManager.isOfflineMode && this.playerPokeMeme.id !== 'fallback') {
      localStore.updatePokememeHP(this.playerPokeMeme.id, this.playerPokeMeme.currentHp);
    }
  }
  
  private endBattle(won: boolean): void {
    // Stop music
    if (this.battleMusic) {
      this.battleMusic.stop();
    }
    
    // Stop UI scene
    this.scene.stop('BattleUIScene');
    
    // Return to world
    this.scene.stop();
    this.scene.resume(this.returnSceneKey);
    
    // Emit battle end event to the return scene
    const returnScene = this.scene.get(this.returnSceneKey);
    if (returnScene) {
      returnScene.events.emit('battle-ended', { won });
    }
  }
  
  update(time: number, delta: number): void {
    // Battle animations and logic handled by tweens and events
  }
}
