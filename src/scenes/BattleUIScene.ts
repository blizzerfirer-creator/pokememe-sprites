import Phaser from 'phaser';
import * as utils from '../utils';
import { GameManager } from '../game/GameManager';
import type { PokeMemeMove } from '../data/pokememeData';

export interface BattlePokeMemeUI {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  moves: PokeMemeMove[];
}

export class BattleUIScene extends Phaser.Scene {
  private uiContainer!: Phaser.GameObjects.DOMElement;
  private gameManager!: GameManager;
  
  // Battle data passed from BattleScene
  public playerPokeMeme!: BattlePokeMemeUI;
  public enemyPokeMeme!: BattlePokeMemeUI;
  public isWildBattle: boolean = true;
  
  // Pump meter
  public pumpMeter: number = 0;
  public maxPumpMeter: number = 100;
  
  // XP bar
  public currentXP: number = 0;
  public xpToNextLevel: number = 100;
  
  constructor() {
    super({ key: 'BattleUIScene' });
  }
  
  init(data: {
    playerPokeMeme: BattlePokeMemeUI;
    enemyPokeMeme: BattlePokeMemeUI;
    isWildBattle: boolean;
    pumpMeter?: number;
    currentXP?: number;
    xpToNextLevel?: number;
  }): void {
    this.playerPokeMeme = data.playerPokeMeme;
    this.enemyPokeMeme = data.enemyPokeMeme;
    this.isWildBattle = data.isWildBattle;
    this.pumpMeter = data.pumpMeter || 0;
    this.currentXP = data.currentXP || 0;
    this.xpToNextLevel = data.xpToNextLevel || 100;
  }
  
  create(): void {
    this.gameManager = GameManager.getInstance();
    this.createUI();
  }
  
  private createUI(): void {
    const uiHTML = `
      <div id="battle-ui" class="fixed inset-0 pointer-events-none z-[1000]" style="font-family: 'RetroPixel', monospace;">
        
        <!-- Enemy Info Box -->
        <div class="absolute top-8 left-8 game-pixel-container-gray-800 p-3 w-[280px]">
          <div class="flex justify-between items-center mb-2">
            <span id="enemy-name" class="text-white font-bold">${this.enemyPokeMeme.name}</span>
            <span id="enemy-level" class="text-gray-300 text-sm">Lv.${this.enemyPokeMeme.level}</span>
          </div>
          <div class="game-pixel-container-slot-gray-700 p-1 relative">
            <div id="enemy-hp-bar" class="game-pixel-container-progress-fill-green-500 h-4 transition-all duration-500" style="width: 100%;"></div>
          </div>
          <p id="enemy-hp-text" class="text-right text-gray-300 text-xs mt-1">${this.enemyPokeMeme.currentHp}/${this.enemyPokeMeme.maxHp}</p>
        </div>
        
        <!-- Player Info Box -->
        <div class="absolute bottom-[200px] right-8 game-pixel-container-gray-800 p-3 w-[280px]">
          <div class="flex justify-between items-center mb-2">
            <span id="player-name" class="text-white font-bold">${this.playerPokeMeme.name}</span>
            <span id="player-level" class="text-gray-300 text-sm">Lv.${this.playerPokeMeme.level}</span>
          </div>
          <div class="game-pixel-container-slot-gray-700 p-1 relative mb-2">
            <div id="player-hp-bar" class="game-pixel-container-progress-fill-green-500 h-4 transition-all duration-500" style="width: 100%;"></div>
          </div>
          <p id="player-hp-text" class="text-right text-gray-300 text-xs">${this.playerPokeMeme.currentHp}/${this.playerPokeMeme.maxHp}</p>
          
          <!-- XP Bar -->
          <div class="mt-2">
            <p class="text-blue-400 text-xs mb-1">EXP</p>
            <div class="game-pixel-container-slot-gray-700 p-1">
              <div id="xp-bar" class="game-pixel-container-progress-fill-blue-500 h-2 transition-all duration-1000" style="width: ${(this.currentXP / this.xpToNextLevel) * 100}%;"></div>
            </div>
          </div>
          
          <!-- Pump Meter -->
          <div class="mt-2">
            <div class="flex justify-between items-center mb-1">
              <p class="text-yellow-400 text-xs">PUMP METER</p>
              <span id="pump-meter-text" class="text-yellow-300 text-xs">${this.pumpMeter}%</span>
            </div>
            <div class="game-pixel-container-slot-gray-700 p-1">
              <div id="pump-meter" class="game-pixel-container-progress-fill-yellow-500 h-3 transition-all duration-300" style="width: ${this.pumpMeter}%;"></div>
            </div>
          </div>
        </div>
        
        <!-- Battle Message Box -->
        <div id="battle-message-box" class="absolute bottom-4 left-4 right-4 game-pixel-container-gray-800 p-4 h-[160px]">
          <p id="battle-message" class="text-white text-lg mb-4"></p>
          
          <!-- Action Menu (Hidden by default) -->
          <div id="action-menu" class="hidden grid grid-cols-2 gap-2 pointer-events-auto">
            <button id="btn-fight" class="game-pixel-container-clickable-red-500 py-3 text-white font-bold text-lg hover:brightness-110">
              ⚔️ FIGHT
            </button>
            <button id="btn-bag" class="game-pixel-container-clickable-yellow-500 py-3 text-black font-bold text-lg hover:brightness-110">
              🎒 BAG
            </button>
            <button id="btn-pokememe" class="game-pixel-container-clickable-green-500 py-3 text-white font-bold text-lg hover:brightness-110">
              🔄 SWITCH
            </button>
            <button id="btn-run" class="game-pixel-container-clickable-blue-500 py-3 text-white font-bold text-lg hover:brightness-110">
              🏃 RUN
            </button>
          </div>
          
          <!-- Move Menu (Hidden by default) -->
          <div id="move-menu" class="hidden grid grid-cols-2 gap-2 pointer-events-auto">
            ${this.playerPokeMeme.moves.slice(0, 4).map((move, i) => `
              <button class="move-btn game-pixel-container-clickable-gray-600 py-2 text-white font-bold hover:brightness-110" data-move-index="${i}">
                ${move.name}<br><span class="text-xs text-gray-300">${move.type} - ${move.power || 0} PWR</span>
              </button>
            `).join('')}
            ${this.playerPokeMeme.moves.length < 4 ? `
              ${Array(4 - this.playerPokeMeme.moves.length).fill(0).map(() => `
                <div class="game-pixel-container-slot-gray-700 py-2 text-gray-500 text-center">-</div>
              `).join('')}
            ` : ''}
          </div>
          
          <!-- Back button for move menu -->
          <div id="back-container" class="hidden mt-2 pointer-events-auto">
            <button id="btn-back" class="game-pixel-container-clickable-gray-700 py-2 px-4 text-white font-bold hover:brightness-110 w-full">
              ← BACK
            </button>
          </div>
          
          <!-- Bag Menu (Hidden by default) -->
          <div id="bag-menu" class="hidden grid grid-cols-2 gap-2 pointer-events-auto">
            <button id="btn-cryptosphere" class="item-btn game-pixel-container-clickable-purple-600 py-2 text-white font-bold hover:brightness-110" data-item="cryptosphere">
              🔮 CryptoSphere<br><span class="text-xs" id="cryptosphere-count">x0</span>
            </button>
            <button id="btn-potion" class="item-btn game-pixel-container-clickable-pink-500 py-2 text-white font-bold hover:brightness-110" data-item="potion">
              🧪 Potion<br><span class="text-xs" id="potion-count">x0</span>
            </button>
          </div>
        </div>
        
        <!-- Critical Hit Flash -->
        <div id="critical-flash" class="hidden fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 pointer-events-none z-[2000]">
          <p class="text-5xl font-bold text-yellow-400 animate-bounce" style="text-shadow: 4px 4px 0 #000, -2px -2px 0 #000;">TO THE MOON! 🚀</p>
        </div>
        
        <!-- Super Effective Flash -->
        <div id="super-effective-flash" class="hidden fixed inset-0 flex items-center justify-center pointer-events-none z-[2000]">
          <p class="text-4xl font-bold text-red-500" style="text-shadow: 3px 3px 0 #000;">SUPER EFFECTIVE!</p>
        </div>
        
        <!-- Level Up Notification -->
        <div id="level-up-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 pointer-events-auto z-[3000]">
          <div class="game-pixel-container-yellow-500 p-6 w-[350px] text-center">
            <h2 class="text-2xl font-bold text-black mb-4">🎉 LEVEL UP! 🎉</h2>
            <p id="level-up-name" class="text-xl text-black mb-2"></p>
            <p id="level-up-level" class="text-3xl font-bold text-black mb-4"></p>
            <div id="stat-increases" class="text-left text-black text-sm mb-4 space-y-1"></div>
            <button id="level-up-ok" class="game-pixel-container-clickable-green-500 px-8 py-2 text-white font-bold">
              AWESOME!
            </button>
          </div>
        </div>
        
        <!-- Catch Animation -->
        <div id="catch-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none z-[2500]">
          <div class="text-center">
            <div id="cryptosphere-anim" class="text-8xl mb-4">🔮</div>
            <p id="catch-text" class="text-2xl text-white font-bold" style="text-shadow: 2px 2px 0 #000;"></p>
          </div>
        </div>
        
        <!-- Battle Start Flash (for transition) -->
        <div id="battle-flash" class="hidden fixed inset-0 bg-white pointer-events-none z-[4000]"></div>
        
      </div>
    `;
    
    this.uiContainer = utils.initUIDom(this, uiHTML);
    this.setupUIListeners();
    this.updateInventoryCounts();
  }
  
  private setupUIListeners(): void {
    // Fight button
    document.getElementById('btn-fight')?.addEventListener('click', () => {
      this.showMoveMenu();
    });
    
    // Back button
    document.getElementById('btn-back')?.addEventListener('click', () => {
      this.showActionMenu();
    });
    
    // Move buttons
    document.querySelectorAll('.move-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const moveIndex = parseInt((e.currentTarget as HTMLElement).dataset.moveIndex || '0');
        this.events.emit('move-selected', moveIndex);
        this.hideAllMenus();
      });
    });
    
    // Run button
    document.getElementById('btn-run')?.addEventListener('click', () => {
      this.events.emit('run-selected');
      this.hideAllMenus();
    });
    
    // Bag button
    document.getElementById('btn-bag')?.addEventListener('click', () => {
      this.showBagMenu();
    });
    
    // Item buttons
    document.getElementById('btn-cryptosphere')?.addEventListener('click', () => {
      this.events.emit('item-selected', 'cryptosphere');
      this.hideAllMenus();
    });
    
    document.getElementById('btn-potion')?.addEventListener('click', () => {
      this.events.emit('item-selected', 'potion');
      this.hideAllMenus();
    });
    
    // PokeMeme switch button
    document.getElementById('btn-pokememe')?.addEventListener('click', () => {
      this.events.emit('switch-selected');
    });
    
    // Level up OK button
    document.getElementById('level-up-ok')?.addEventListener('click', () => {
      this.hideLevelUpModal();
      this.events.emit('level-up-dismissed');
    });
  }
  
  private async updateInventoryCounts(): Promise<void> {
    const inventory = await this.gameManager.getInventoryUniversal();
    
    const cryptosphereItem = inventory.find(i => i.item_id === 'cryptosphere');
    const potionItem = inventory.find(i => i.item_id === 'potion');
    
    const cryptosphereCount = document.getElementById('cryptosphere-count');
    const potionCount = document.getElementById('potion-count');
    
    if (cryptosphereCount) cryptosphereCount.textContent = `x${cryptosphereItem?.quantity || 0}`;
    if (potionCount) potionCount.textContent = `x${potionItem?.quantity || 0}`;
  }
  
  // Public methods to control UI from BattleScene
  public showMessage(text: string): void {
    const messageEl = document.getElementById('battle-message');
    if (messageEl) {
      messageEl.textContent = text;
    }
  }
  
  public showActionMenu(): void {
    this.hideAllMenus();
    document.getElementById('action-menu')?.classList.remove('hidden');
  }
  
  public showMoveMenu(): void {
    this.hideAllMenus();
    document.getElementById('move-menu')?.classList.remove('hidden');
    document.getElementById('back-container')?.classList.remove('hidden');
  }
  
  public showBagMenu(): void {
    this.hideAllMenus();
    document.getElementById('bag-menu')?.classList.remove('hidden');
    document.getElementById('back-container')?.classList.remove('hidden');
    this.updateInventoryCounts();
  }
  
  public hideAllMenus(): void {
    document.getElementById('action-menu')?.classList.add('hidden');
    document.getElementById('move-menu')?.classList.add('hidden');
    document.getElementById('bag-menu')?.classList.add('hidden');
    document.getElementById('back-container')?.classList.add('hidden');
  }
  
  public updateHPBar(target: 'player' | 'enemy', current: number, max: number): void {
    const percentage = Math.max(0, (current / max) * 100);
    const barEl = document.getElementById(`${target}-hp-bar`);
    const textEl = document.getElementById(`${target}-hp-text`);
    
    if (barEl) {
      barEl.style.width = `${percentage}%`;
      
      // Change color based on HP
      barEl.classList.remove(
        'game-pixel-container-progress-fill-green-500',
        'game-pixel-container-progress-fill-yellow-500',
        'game-pixel-container-progress-fill-red-500'
      );
      
      if (percentage > 50) {
        barEl.classList.add('game-pixel-container-progress-fill-green-500');
      } else if (percentage > 20) {
        barEl.classList.add('game-pixel-container-progress-fill-yellow-500');
      } else {
        barEl.classList.add('game-pixel-container-progress-fill-red-500');
      }
    }
    
    if (textEl) {
      textEl.textContent = `${Math.max(0, current)}/${max}`;
    }
  }
  
  public updatePumpMeter(value: number): void {
    this.pumpMeter = value;
    const meterEl = document.getElementById('pump-meter');
    const textEl = document.getElementById('pump-meter-text');
    if (meterEl) {
      meterEl.style.width = `${value}%`;
    }
    if (textEl) {
      textEl.textContent = `${Math.floor(value)}%`;
    }
  }
  
  public updateXPBar(current: number, max: number): void {
    const xpBar = document.getElementById('xp-bar');
    if (xpBar) {
      const percentage = (current / max) * 100;
      xpBar.style.width = `${percentage}%`;
    }
  }
  
  public animateXPGain(startXP: number, endXP: number, xpToLevel: number, callback?: () => void): void {
    const xpBar = document.getElementById('xp-bar');
    if (!xpBar) return;
    
    // Animate XP bar fill
    const startPercent = (startXP / xpToLevel) * 100;
    const endPercent = Math.min((endXP / xpToLevel) * 100, 100);
    
    xpBar.style.transition = 'width 1.5s ease-out';
    xpBar.style.width = `${endPercent}%`;
    
    if (callback) {
      setTimeout(callback, 1600);
    }
  }
  
  public showCriticalFlash(): void {
    const flash = document.getElementById('critical-flash');
    flash?.classList.remove('hidden');
    
    this.time.delayedCall(1000, () => {
      flash?.classList.add('hidden');
    });
  }
  
  public showSuperEffectiveFlash(): void {
    const flash = document.getElementById('super-effective-flash');
    flash?.classList.remove('hidden');
    
    this.time.delayedCall(800, () => {
      flash?.classList.add('hidden');
    });
  }
  
  public showLevelUpModal(name: string, newLevel: number, statIncreases: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  }): void {
    const modal = document.getElementById('level-up-modal');
    const nameEl = document.getElementById('level-up-name');
    const levelEl = document.getElementById('level-up-level');
    const statsEl = document.getElementById('stat-increases');
    
    if (nameEl) nameEl.textContent = name;
    if (levelEl) levelEl.textContent = `Level ${newLevel}`;
    if (statsEl) {
      statsEl.innerHTML = `
        <p>HP: +${statIncreases.hp}</p>
        <p>Attack: +${statIncreases.attack}</p>
        <p>Defense: +${statIncreases.defense}</p>
        <p>Sp. Attack: +${statIncreases.spAttack}</p>
        <p>Sp. Defense: +${statIncreases.spDefense}</p>
        <p>Speed: +${statIncreases.speed}</p>
      `;
    }
    
    modal?.classList.remove('hidden');
    
    // Play level up sound
    const levelUpSound = this.sound.add('level_up', { volume: 0.5 });
    levelUpSound.play();
  }
  
  public hideLevelUpModal(): void {
    document.getElementById('level-up-modal')?.classList.add('hidden');
  }
  
  public showCatchAnimation(success: boolean, pokemeName: string): Promise<void> {
    return new Promise((resolve) => {
      const modal = document.getElementById('catch-modal');
      const sphere = document.getElementById('cryptosphere-anim');
      const text = document.getElementById('catch-text');
      
      modal?.classList.remove('hidden');
      
      // Shake animation
      if (sphere) {
        let shakes = 0;
        const maxShakes = success ? 3 : Phaser.Math.Between(1, 2);
        
        const shake = () => {
          sphere.style.transform = 'rotate(-15deg)';
          setTimeout(() => {
            sphere.style.transform = 'rotate(15deg)';
            setTimeout(() => {
              sphere.style.transform = 'rotate(0deg)';
              shakes++;
              
              if (text) {
                text.textContent = '...';
              }
              
              if (shakes < maxShakes) {
                setTimeout(shake, 800);
              } else {
                // Result
                setTimeout(() => {
                  if (success) {
                    if (text) text.textContent = `Gotcha! ${pokemeName} was caught!`;
                    sphere.textContent = '✨';
                    
                    const catchSound = this.sound.add('catch_success', { volume: 0.5 });
                    catchSound.play();
                  } else {
                    if (text) text.textContent = `Oh no! ${pokemeName} broke free!`;
                    sphere.textContent = '💨';
                  }
                  
                  setTimeout(() => {
                    modal?.classList.add('hidden');
                    if (sphere) sphere.textContent = '🔮';
                    resolve();
                  }, 2000);
                }, 500);
              }
            }, 200);
          }, 200);
        };
        
        setTimeout(shake, 500);
      }
    });
  }
  
  public showBattleFlash(): Promise<void> {
    return new Promise((resolve) => {
      const flash = document.getElementById('battle-flash');
      if (flash) {
        flash.classList.remove('hidden');
        flash.style.opacity = '1';
        
        // Flash sequence
        this.tweens.add({
          targets: { opacity: 1 },
          opacity: 0,
          duration: 100,
          repeat: 3,
          yoyo: true,
          onUpdate: (tween) => {
            flash.style.opacity = tween.getValue().toString();
          },
          onComplete: () => {
            flash.classList.add('hidden');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
  
  public updatePlayerInfo(name: string, level: number): void {
    const nameEl = document.getElementById('player-name');
    const levelEl = document.getElementById('player-level');
    if (nameEl) nameEl.textContent = name;
    if (levelEl) levelEl.textContent = `Lv.${level}`;
  }
  
  public updateEnemyInfo(name: string, level: number): void {
    const nameEl = document.getElementById('enemy-name');
    const levelEl = document.getElementById('enemy-level');
    if (nameEl) nameEl.textContent = name;
    if (levelEl) levelEl.textContent = `Lv.${level}`;
  }
}
