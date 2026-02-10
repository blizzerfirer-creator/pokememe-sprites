import Phaser from 'phaser';
import * as utils from '../utils';
import * as localStore from '../lib/localStorage';
import { GameManager } from './GameManager';
import type { NPCData } from '../data/encounterData';

export class NPC extends Phaser.GameObjects.Sprite {
  public npcId: string;
  public npcName: string;
  public npcType: 'healer' | 'shop' | 'dialog';
  public dialogLines: string[];
  public shopItems: { itemId: string; name: string; price: number }[];
  private nameTag: Phaser.GameObjects.Text;
  private interactionIcon: Phaser.GameObjects.Text;
  private isInteracting: boolean = false;

  constructor(scene: Phaser.Scene, data: NPCData) {
    // Use trainer sprite as fallback if NPC texture doesn't exist
    const textureKey = scene.textures.exists(data.textureKey)
      ? data.textureKey
      : 'meme_trainer_idle_front_frame1';

    super(scene, data.x, data.y, textureKey);

    this.npcId = data.id;
    this.npcName = data.name;
    this.npcType = data.type;
    this.dialogLines = data.dialogLines;
    this.shopItems = data.shopItems || [];

    // Add to scene
    scene.add.existing(this);

    // Scale NPC sprite
    utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, 80, 0.4, 0.6);

    // Create name tag
    this.nameTag = scene.add.text(data.x, data.y - this.displayHeight - 10, data.name, {
      fontFamily: 'RetroPixel',
      fontSize: '12px',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 1);

    // Create interaction icon (hidden by default)
    this.interactionIcon = scene.add.text(data.x, data.y - this.displayHeight - 25, '!', {
      fontFamily: 'RetroPixel',
      fontSize: '18px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 1).setVisible(false);

    // Set depth based on Y
    this.setDepth(data.y);
    this.nameTag.setDepth(data.y + 1);
    this.interactionIcon.setDepth(data.y + 2);
  }

  public isPlayerInRange(playerX: number, playerY: number, range: number): boolean {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const inRange = distance < range;

    // Show/hide interaction icon
    this.interactionIcon.setVisible(inRange);

    return inRange;
  }

  public interact(scene: Phaser.Scene): void {
    if (this.isInteracting) return;
    this.isInteracting = true;

    switch (this.npcType) {
      case 'healer':
        this.showHealerDialog(scene);
        break;
      case 'shop':
        this.showShopDialog(scene);
        break;
      case 'dialog':
        this.showDialog(scene);
        break;
    }
  }

  private showHealerDialog(scene: Phaser.Scene): void {
    const overlay = this.createDialogOverlay([
      ...this.dialogLines,
      'Your PokeMemes have been fully healed!'
    ], () => {
      // Heal all party PokeMemes
      localStore.healAllParty();
      this.isInteracting = false;
    });
    document.body.appendChild(overlay);

    // Play confirm sound
    try {
      const sound = scene.sound.add('ui_confirm', { volume: 0.5 });
      sound.play();
    } catch { /* sound may not exist */ }
  }

  private showShopDialog(scene: Phaser.Scene): void {
    const gameManager = GameManager.getInstance();
    const currentCoins = gameManager.playerData?.meme_coins || 0;

    const overlay = document.createElement('div');
    overlay.id = 'npc-shop-overlay';
    overlay.className = 'fixed inset-0 z-[2000] flex items-center justify-center';
    overlay.style.cssText = 'background: rgba(0,0,0,0.7); font-family: RetroPixel, monospace;';

    let shopHTML = `
      <div class="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-yellow-400 text-xl font-bold text-center mb-2">${this.npcName}'s Shop</h2>
        <p class="text-gray-400 text-sm text-center mb-4">Your coins: <span class="text-yellow-300" id="shop-coins">${currentCoins}</span> MC</p>
        <div class="space-y-2 mb-4">
    `;

    for (const item of this.shopItems) {
      shopHTML += `
        <div class="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700">
          <span class="text-white text-sm">${item.name}</span>
          <div class="flex items-center gap-2">
            <span class="text-yellow-300 text-sm">${item.price} MC</span>
            <button class="shop-buy-btn bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded" data-item-id="${item.itemId}" data-price="${item.price}">
              Buy
            </button>
          </div>
        </div>
      `;
    }

    shopHTML += `
        </div>
        <button id="shop-close-btn" class="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded text-sm">Close</button>
      </div>
    `;

    overlay.innerHTML = shopHTML;
    document.body.appendChild(overlay);

    // Buy button handlers
    overlay.querySelectorAll('.shop-buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const itemId = target.dataset.itemId!;
        const price = parseInt(target.dataset.price!);
        const coins = gameManager.playerData?.meme_coins || 0;

        if (coins >= price) {
          // Deduct coins
          if (gameManager.playerData) {
            gameManager.playerData.meme_coins -= price;
          }
          localStore.updateLocalPlayerData({ meme_coins: coins - price });
          localStore.updateLocalInventoryItem(gameManager.playerId || '', itemId, 1);

          // Update display
          const coinsEl = document.getElementById('shop-coins');
          if (coinsEl) coinsEl.textContent = (coins - price).toString();

          // Flash green
          target.textContent = 'Bought!';
          target.classList.replace('bg-green-600', 'bg-blue-600');
          setTimeout(() => {
            target.textContent = 'Buy';
            target.classList.replace('bg-blue-600', 'bg-green-600');
          }, 500);

          try {
            scene.sound.add('ui_confirm', { volume: 0.3 }).play();
          } catch { /* */ }
        } else {
          target.textContent = 'No coins!';
          target.classList.replace('bg-green-600', 'bg-red-800');
          setTimeout(() => {
            target.textContent = 'Buy';
            target.classList.replace('bg-red-800', 'bg-green-600');
          }, 800);
        }
      });
    });

    // Close handler
    document.getElementById('shop-close-btn')?.addEventListener('click', () => {
      overlay.remove();
      this.isInteracting = false;
    });
  }

  private showDialog(scene: Phaser.Scene): void {
    const overlay = this.createDialogOverlay(this.dialogLines, () => {
      this.isInteracting = false;
    });
    document.body.appendChild(overlay);
  }

  private createDialogOverlay(lines: string[], onClose: () => void): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.id = 'npc-dialog-overlay';
    overlay.className = 'fixed inset-0 z-[2000] flex items-end justify-center pb-8';
    overlay.style.cssText = 'background: rgba(0,0,0,0.3); font-family: RetroPixel, monospace;';

    const dialogHTML = `
      <div class="bg-gray-900 border-2 border-white rounded-lg p-4 max-w-lg w-full mx-4">
        <p class="text-green-400 text-sm font-bold mb-2">${this.npcName}</p>
        <p class="text-white text-sm mb-3">${lines.join(' ')}</p>
        <p class="text-gray-500 text-xs text-center">Click to close</p>
      </div>
    `;

    overlay.innerHTML = dialogHTML;

    overlay.addEventListener('click', () => {
      overlay.remove();
      onClose();
    });

    return overlay;
  }

  public destroy(fromScene?: boolean): void {
    this.nameTag?.destroy();
    this.interactionIcon?.destroy();
    super.destroy(fromScene);
  }
}
