import Phaser from 'phaser';
import * as utils from '../utils';
import { GameManager } from '../game/GameManager';
import { LevelManager } from '../LevelManager';

interface ChatMessage {
  playerId: string;
  username: string;
  message: string;
  timestamp: string;
}

export class WorldUIScene extends Phaser.Scene {
  private uiContainer!: Phaser.GameObjects.DOMElement;
  private gameManager!: GameManager;
  private gameSceneKey: string = '';

  private chatMessages: ChatMessage[] = [];
  private maxChatMessages: number = 50;

  // UI state
  private isMenuOpen: boolean = false;
  private isChatFocused: boolean = false;

  // Event handler references for cleanup
  private globalKeydownHandler?: (e: KeyboardEvent) => void;
  private pauseHandler?: () => void;
  private resumeHandler?: () => void;
  
  constructor() {
    super({ key: 'WorldUIScene' });
  }
  
  init(data: { gameSceneKey: string }): void {
    this.gameSceneKey = data.gameSceneKey;
    
    // Listen for battle scene events to hide/show UI
    this.events.on('wake', this.onWake, this);
    this.events.on('sleep', this.onSleep, this);
  }
  
  // Called when scene wakes from pause
  private onWake(): void {
    const container = document.getElementById('world-ui-container');
    if (container) {
      container.style.display = 'block';
    }
  }
  
  // Called when scene goes to sleep
  private onSleep(): void {
    const container = document.getElementById('world-ui-container');
    if (container) {
      container.style.display = 'none';
    }
  }
  
  create(): void {
    this.gameManager = GameManager.getInstance();
    this.createUI();
    this.setupEventListeners();

    // Listen for chat messages from game scene
    const gameScene = this.scene.get(this.gameSceneKey);
    gameScene.events.on('chat-message', this.addChatMessage, this);
    gameScene.events.on('show-player-interaction', this.showPlayerInteraction, this);

    // Listen for scene pause/resume to hide/show UI during battles
    this.pauseHandler = () => {
      const container = document.getElementById('world-ui-container');
      if (container) container.style.display = 'none';
    };
    this.resumeHandler = () => {
      const container = document.getElementById('world-ui-container');
      if (container) container.style.display = 'block';
    };
    gameScene.events.on('pause', this.pauseHandler);
    gameScene.events.on('resume', this.resumeHandler);

    // Handle offline mode UI adjustments
    if (this.gameManager.isOfflineMode) {
      this.setupOfflineModeUI();
    }

    // Cleanup event listeners on shutdown
    this.events.once('shutdown', () => {
      gameScene.events.off('chat-message', this.addChatMessage, this);
      gameScene.events.off('show-player-interaction', this.showPlayerInteraction, this);
      if (this.pauseHandler) gameScene.events.off('pause', this.pauseHandler);
      if (this.resumeHandler) gameScene.events.off('resume', this.resumeHandler);
      if (this.globalKeydownHandler) {
        document.removeEventListener('keydown', this.globalKeydownHandler);
      }
    });
  }
  
  private createUI(): void {
    const username = this.gameManager.username;
    const memeCoins = this.gameManager.playerData?.meme_coins || 0;
    
    const uiHTML = `
      <div id="world-ui-container" class="fixed inset-0 pointer-events-none z-[1000]" style="font-family: 'RetroPixel', monospace;">
        
        <!-- Top HUD Bar -->
        <div class="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          
          <!-- Player Info -->
          <div class="game-pixel-container-gray-800 p-3 flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-lg">👤</div>
            <div>
              <p class="text-white text-sm font-bold">${username}</p>
              <p class="text-yellow-300 text-xs flex items-center gap-1">
                <span>💰</span> ${memeCoins.toLocaleString()} MC
              </p>
            </div>
          </div>
          
          <!-- Party Icons -->
          <div id="party-hud" class="game-pixel-container-gray-800 p-2 flex gap-1">
            <div class="w-10 h-10 game-pixel-container-slot-gray-700 flex items-center justify-center">
              <div class="w-8 h-8 bg-green-400 rounded-full"></div>
            </div>
            <div class="w-10 h-10 game-pixel-container-slot-gray-700"></div>
            <div class="w-10 h-10 game-pixel-container-slot-gray-700"></div>
            <div class="w-10 h-10 game-pixel-container-slot-gray-700"></div>
            <div class="w-10 h-10 game-pixel-container-slot-gray-700"></div>
            <div class="w-10 h-10 game-pixel-container-slot-gray-700"></div>
          </div>
          
          <!-- Menu Button -->
          <button id="menu-btn" class="game-pixel-container-clickable-gray-700 p-3 hover:brightness-110">
            <span class="text-white text-xl">☰</span>
          </button>
        </div>
        
        <!-- Online Players Count / Offline Badge -->
        <div id="online-badge" class="absolute top-4 right-20 game-pixel-container-green-600 px-3 py-2 pointer-events-auto">
          <span class="text-white text-xs">🌐 <span id="online-count">1</span> Online</span>
        </div>
        <div id="offline-badge" class="hidden absolute top-4 right-20 game-pixel-container-purple-600 px-3 py-2 pointer-events-auto">
          <span class="text-white text-xs">🎮 Offline Mode</span>
        </div>
        
        <!-- Chat Box -->
        <div id="chat-container" class="absolute bottom-4 left-4 w-[350px] pointer-events-auto">
          <div class="game-pixel-container-gray-800 p-2">
            <!-- Chat Messages -->
            <div id="chat-messages" class="h-[150px] overflow-y-auto mb-2 space-y-1 text-xs">
              <p class="text-gray-400">[System] Welcome to ${LevelManager.getMapInfo(this.gameSceneKey).name}!</p>
            </div>
            
            <!-- Chat Input -->
            <div class="flex gap-2">
              <input type="text" id="chat-input" placeholder="Press Enter to chat..." 
                     class="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              <button id="chat-send-btn" class="game-pixel-container-clickable-yellow-500 px-3 py-2 text-black text-sm font-bold">
                Send
              </button>
            </div>
          </div>
        </div>
        
        <!-- Control Hints -->
        <div class="absolute bottom-4 right-4 game-pixel-container-gray-800 p-3 pointer-events-auto">
          <p class="text-gray-300 text-xs mb-1">Controls:</p>
          <p class="text-gray-400 text-xs">↑↓←→ Move</p>
          <p class="text-gray-400 text-xs">SPACE Interact</p>
          <p class="text-gray-400 text-xs">ENTER Chat</p>
        </div>
        
        <!-- Menu Panel (Hidden by default) -->
        <div id="menu-panel" class="hidden absolute top-20 right-4 game-pixel-container-gray-800 p-4 w-[200px] pointer-events-auto">
          <h3 class="text-white font-bold text-center mb-4">MENU</h3>
          <div class="space-y-2">
            <button id="menu-party-btn" class="game-pixel-container-clickable-blue-500 w-full py-2 text-white text-sm hover:brightness-110">
              PokeMemes
            </button>
            <button id="menu-bag-btn" class="game-pixel-container-clickable-green-500 w-full py-2 text-white text-sm hover:brightness-110">
              Bag
            </button>
            <button id="menu-memedex-btn" class="game-pixel-container-clickable-red-500 w-full py-2 text-white text-sm hover:brightness-110">
              MemeDex
            </button>
            <button id="menu-leaderboard-btn" class="game-pixel-container-clickable-yellow-500 w-full py-2 text-black text-sm hover:brightness-110">
              Leaderboard
            </button>
            <button id="menu-settings-btn" class="game-pixel-container-clickable-gray-600 w-full py-2 text-white text-sm hover:brightness-110">
              Settings
            </button>
            <button id="menu-logout-btn" class="game-pixel-container-clickable-red-700 w-full py-2 text-white text-sm hover:brightness-110">
              Log Out
            </button>
          </div>
        </div>
        
        <!-- Player Interaction Popup (Hidden by default) -->
        <div id="player-interaction" class="hidden absolute game-pixel-container-gray-800 p-4 pointer-events-auto" style="transform: translate(-50%, -100%);">
          <h4 id="interaction-username" class="text-white font-bold text-center mb-3"></h4>
          <div class="space-y-2">
            <button id="battle-request-btn" class="game-pixel-container-clickable-red-500 w-full py-2 text-white text-sm">
              ⚔️ Battle
            </button>
            <button id="trade-request-btn" class="game-pixel-container-clickable-blue-500 w-full py-2 text-white text-sm">
              🔄 Trade
            </button>
            <button id="view-profile-btn" class="game-pixel-container-clickable-gray-600 w-full py-2 text-white text-sm">
              👤 Profile
            </button>
            <button id="close-interaction-btn" class="text-gray-400 text-xs w-full text-center mt-2 hover:text-white">
              Close
            </button>
          </div>
        </div>
        
      </div>
    `;
    
    this.uiContainer = utils.initUIDom(this, uiHTML);
  }
  
  private setupEventListeners(): void {
    // Menu toggle
    document.getElementById('menu-btn')?.addEventListener('click', () => this.toggleMenu());
    
    // Menu buttons
    document.getElementById('menu-party-btn')?.addEventListener('click', () => this.openPartyScreen());
    document.getElementById('menu-bag-btn')?.addEventListener('click', () => this.openBagScreen());
    document.getElementById('menu-memedex-btn')?.addEventListener('click', () => this.openMemeDex());
    document.getElementById('menu-leaderboard-btn')?.addEventListener('click', () => this.openLeaderboard());
    document.getElementById('menu-logout-btn')?.addEventListener('click', () => this.logout());
    
    // Chat
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    chatInput?.addEventListener('focus', () => { this.isChatFocused = true; });
    chatInput?.addEventListener('blur', () => { this.isChatFocused = false; });
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendChatMessage();
      }
    });
    document.getElementById('chat-send-btn')?.addEventListener('click', () => this.sendChatMessage());
    
    // Global Enter key for chat focus
    this.globalKeydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !this.isChatFocused) {
        chatInput?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', this.globalKeydownHandler);
    
    // Player interaction
    document.getElementById('battle-request-btn')?.addEventListener('click', () => this.sendBattleRequest());
    document.getElementById('trade-request-btn')?.addEventListener('click', () => this.sendTradeRequest());
    document.getElementById('close-interaction-btn')?.addEventListener('click', () => this.hidePlayerInteraction());
  }
  
  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const menuPanel = document.getElementById('menu-panel');
    if (this.isMenuOpen) {
      menuPanel?.classList.remove('hidden');
    } else {
      menuPanel?.classList.add('hidden');
    }
  }
  
  private addChatMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
    if (this.chatMessages.length > this.maxChatMessages) {
      this.chatMessages.shift();
    }
    
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      const isOwnMessage = message.playerId === this.gameManager.playerId;
      const colorClass = isOwnMessage ? 'text-yellow-300' : 'text-white';
      
      const messageEl = document.createElement('p');
      messageEl.className = colorClass;
      messageEl.innerHTML = `<span class="text-gray-400">[${message.username}]</span> ${message.message}`;
      messagesContainer.appendChild(messageEl);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  private async sendChatMessage(): Promise<void> {
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const message = chatInput?.value.trim();
    
    if (!message) return;
    
    await this.gameManager.sendChatMessage(message);
    
    // Add own message locally
    this.addChatMessage({
      playerId: this.gameManager.playerId || '',
      username: this.gameManager.username,
      message,
      timestamp: new Date().toISOString()
    });
    
    // Clear input
    chatInput.value = '';
    chatInput.blur();
  }
  
  private showPlayerInteraction(data: { playerId: string; username: string; x: number; y: number }): void {
    const popup = document.getElementById('player-interaction');
    const usernameEl = document.getElementById('interaction-username');
    
    if (popup && usernameEl) {
      usernameEl.textContent = data.username;
      popup.classList.remove('hidden');
      popup.dataset.playerId = data.playerId;
      
      // Position popup (approximate screen position)
      const camera = this.cameras.main;
      const screenX = data.x - camera.scrollX;
      const screenY = data.y - camera.scrollY - 50;
      
      popup.style.left = `${Math.max(100, Math.min(screenX, window.innerWidth - 200))}px`;
      popup.style.top = `${Math.max(100, screenY)}px`;
    }
  }
  
  private hidePlayerInteraction(): void {
    document.getElementById('player-interaction')?.classList.add('hidden');
  }
  
  private async sendBattleRequest(): Promise<void> {
    const popup = document.getElementById('player-interaction');
    const targetId = popup?.dataset.playerId;
    
    if (targetId) {
      const success = await this.gameManager.sendBattleRequest(targetId);
      if (success) {
        this.addChatMessage({
          playerId: 'system',
          username: 'System',
          message: 'Battle request sent!',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    this.hidePlayerInteraction();
  }
  
  private async sendTradeRequest(): Promise<void> {
    const popup = document.getElementById('player-interaction');
    const targetId = popup?.dataset.playerId;
    
    if (targetId) {
      const success = await this.gameManager.sendTradeRequest(targetId);
      if (success) {
        this.addChatMessage({
          playerId: 'system',
          username: 'System',
          message: 'Trade request sent!',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    this.hidePlayerInteraction();
  }
  
  private openPartyScreen(): void {
    this.toggleMenu();
    this.showComingSoonToast('Party screen');
  }

  private openBagScreen(): void {
    this.toggleMenu();
    this.showComingSoonToast('Bag');
  }

  private openMemeDex(): void {
    this.toggleMenu();
    // Navigate to PokedexGalleryScene
    const gameScene = this.scene.get(this.gameSceneKey) as any;
    if (gameScene?.backgroundMusic?.isPlaying) {
      gameScene.backgroundMusic.stop();
    }
    this.scene.stop(this.gameSceneKey);
    this.scene.stop();
    this.scene.start('PokedexGalleryScene');
  }

  private openLeaderboard(): void {
    this.toggleMenu();
    this.showComingSoonToast('Leaderboard');
  }

  private showComingSoonToast(feature: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000] px-6 py-3 rounded-lg text-white text-sm font-bold pointer-events-none';
    toast.style.cssText = 'background: rgba(0,0,0,0.85); font-family: RetroPixel, monospace; border: 2px solid #fbbf24;';
    toast.textContent = `${feature} - Coming soon!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  }
  
  private async logout(): Promise<void> {
    this.toggleMenu();
    
    // Clear guest data if in offline mode
    if (this.gameManager.isOfflineMode) {
      this.gameManager.clearGuestData();
    }
    
    await this.gameManager.cleanup();
    
    // Stop all scenes and go to auth
    this.scene.stop(this.gameSceneKey);
    this.scene.stop();
    this.scene.start('AuthScene');
  }
  
  // Setup UI for offline mode
  private setupOfflineModeUI(): void {
    // Show offline badge, hide online badge
    document.getElementById('online-badge')?.classList.add('hidden');
    document.getElementById('offline-badge')?.classList.remove('hidden');
    
    // Update chat system message
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.innerHTML = '<p class="text-purple-400">[System] Playing in Offline Mode</p><p class="text-gray-400">[System] Chat is disabled - Connect to play with others!</p>';
    }
    
    // Disable chat input
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    if (chatInput) {
      chatInput.disabled = true;
      chatInput.placeholder = 'Chat disabled in offline mode';
      chatInput.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    const chatSendBtn = document.getElementById('chat-send-btn');
    if (chatSendBtn) {
      chatSendBtn.classList.add('opacity-50', 'cursor-not-allowed');
      (chatSendBtn as HTMLButtonElement).disabled = true;
    }
  }
  
  update(time: number, delta: number): void {
    // Skip online count update if in offline mode
    if (this.gameManager.isOfflineMode) return;
    
    // Update online count
    const onlineCount = this.gameManager.otherPlayers.size + 1;
    const countEl = document.getElementById('online-count');
    if (countEl) {
      countEl.textContent = onlineCount.toString();
    }
  }
}
