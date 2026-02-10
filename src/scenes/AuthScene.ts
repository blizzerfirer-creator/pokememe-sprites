import Phaser from 'phaser';
import * as utils from '../utils';
import { signIn, signUp, signInWithGoogle, getCurrentUser } from '../lib/supabase';
import { GameManager } from '../game/GameManager';
import { generateGuestUsername } from '../lib/localStorage';

export class AuthScene extends Phaser.Scene {
  private uiContainer!: Phaser.GameObjects.DOMElement;
  private isLoading: boolean = false;
  private currentView: 'login' | 'signup' | 'profile' | 'guest-profile' = 'login';
  private isGuestMode: boolean = false;
  
  constructor() {
    super({ key: 'AuthScene' });
  }
  
  async create(): Promise<void> {
    const gameManager = GameManager.getInstance();
    
    // First check for existing guest session
    if (gameManager.checkExistingGuestData()) {
      const restored = gameManager.restoreGuestSession();
      if (restored && gameManager.playerData) {
        this.scene.start('SatoshiTownScene');
        return;
      }
    }
    
    // Check if already logged in with Supabase
    const user = await getCurrentUser();
    if (user) {
      // Try to initialize game manager
      const initialized = await gameManager.initialize();
      
      if (initialized && gameManager.playerData) {
        // Player exists, go to game
        this.scene.start('SatoshiTownScene');
        return;
      } else if (initialized) {
        // User exists but no player profile, show profile creation
        this.currentView = 'profile';
      }
    }
    
    this.createUI();
  }
  
  private createUI(): void {
    const uiHTML = `
      <div id="auth-container" class="fixed inset-0 flex items-center justify-center z-[1000]" 
           style="background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); font-family: 'RetroPixel', monospace;">
        
        <!-- Animated background elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-50 animate-pulse" style="top: 10%; left: 15%;"></div>
          <div class="absolute w-3 h-3 bg-blue-400 rounded-full opacity-50 animate-pulse" style="top: 30%; left: 80%; animation-delay: 0.5s;"></div>
          <div class="absolute w-5 h-5 bg-green-400 rounded-full opacity-50 animate-pulse" style="top: 60%; left: 25%; animation-delay: 1s;"></div>
          <div class="absolute w-4 h-4 bg-red-400 rounded-full opacity-50 animate-pulse" style="top: 80%; left: 70%; animation-delay: 1.5s;"></div>
        </div>
        
        <!-- Main auth card -->
        <div class="game-pixel-container-gray-800 p-8 w-[400px] max-w-[90%] pointer-events-auto">
          <!-- Logo -->
          <div class="text-center mb-6">
            <img src="https://cdn-game-mcp.gambo.ai/718b0228-dc2d-4b8c-9065-922c2ede5344/images/pokememe_title.png" 
                 alt="PokeMeme" 
                 class="max-h-[100px] mx-auto object-contain"
                 style="image-rendering: pixelated;" />
          </div>
          
          <!-- Login Form (default) -->
          <div id="login-form" class="${this.currentView === 'login' ? '' : 'hidden'}">
            <h2 class="text-xl text-white text-center mb-4" style="text-shadow: 2px 2px 0 #000;">TRAINER LOGIN</h2>
            
            <div class="space-y-4">
              <input type="email" id="login-email" placeholder="Email" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <input type="password" id="login-password" placeholder="Password" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <button id="login-btn" 
                      class="game-pixel-container-clickable-yellow-500 w-full py-3 text-black font-bold hover:brightness-110 transition">
                LOGIN
              </button>
              
              <div class="flex items-center my-4">
                <div class="flex-1 h-px bg-gray-600"></div>
                <span class="px-3 text-gray-400 text-sm">OR</span>
                <div class="flex-1 h-px bg-gray-600"></div>
              </div>
              
              <button id="google-login-btn" 
                      class="game-pixel-container-clickable-white w-full py-3 text-black font-bold hover:brightness-110 transition flex items-center justify-center gap-2">
                <span>🌐</span> SIGN IN WITH GOOGLE
              </button>
              
              <div class="flex items-center my-4">
                <div class="flex-1 h-px bg-gray-600"></div>
                <span class="px-3 text-gray-400 text-sm">OR</span>
                <div class="flex-1 h-px bg-gray-600"></div>
              </div>
              
              <button id="play-offline-btn" 
                      class="game-pixel-container-clickable-purple-600 w-full py-3 text-white font-bold hover:brightness-110 transition flex items-center justify-center gap-2">
                <span>🎮</span> PLAY OFFLINE / SKIP LOGIN
              </button>
              
              <p class="text-center text-gray-400 text-xs mt-2">
                Progress saves locally in your browser
              </p>
              
              <p class="text-center text-gray-400 text-sm mt-4">
                New trainer? <button id="show-signup" class="text-yellow-400 hover:underline">Create Account</button>
              </p>
            </div>
            
            <p id="login-error" class="text-red-400 text-center text-sm mt-4 hidden"></p>
          </div>
          
          <!-- Signup Form -->
          <div id="signup-form" class="${this.currentView === 'signup' ? '' : 'hidden'}">
            <h2 class="text-xl text-white text-center mb-4" style="text-shadow: 2px 2px 0 #000;">BECOME A TRAINER</h2>
            
            <div class="space-y-4">
              <input type="email" id="signup-email" placeholder="Email" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <input type="password" id="signup-password" placeholder="Password (min 6 chars)" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <input type="text" id="signup-username" placeholder="Trainer Name" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <button id="signup-btn" 
                      class="game-pixel-container-clickable-green-500 w-full py-3 text-black font-bold hover:brightness-110 transition">
                CREATE ACCOUNT
              </button>
              
              <p class="text-center text-gray-400 text-sm mt-4">
                Already a trainer? <button id="show-login" class="text-yellow-400 hover:underline">Login</button>
              </p>
            </div>
            
            <p id="signup-error" class="text-red-400 text-center text-sm mt-4 hidden"></p>
          </div>
          
          <!-- Profile Creation Form (for online users) -->
          <div id="profile-form" class="${this.currentView === 'profile' ? '' : 'hidden'}">
            <h2 class="text-xl text-white text-center mb-4" style="text-shadow: 2px 2px 0 #000;">CHOOSE YOUR STARTER</h2>
            
            <div class="space-y-4">
              <input type="text" id="profile-username" placeholder="Trainer Name" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <p class="text-gray-300 text-center text-sm">Select your first PokeMeme:</p>
              
              <div class="grid grid-cols-3 gap-2">
                <button id="starter-1" class="starter-btn game-pixel-container-slot-green-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="1">
                  <div class="w-12 h-12 bg-green-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Pepasaur</span>
                  <span class="text-xs text-green-300">Grass</span>
                </button>
                
                <button id="starter-4" class="starter-btn game-pixel-container-slot-orange-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="4">
                  <div class="w-12 h-12 bg-orange-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Bonkander</span>
                  <span class="text-xs text-orange-300">Fire</span>
                </button>
                
                <button id="starter-7" class="starter-btn game-pixel-container-slot-blue-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="7">
                  <div class="w-12 h-12 bg-blue-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Dogetle</span>
                  <span class="text-xs text-blue-300">Water</span>
                </button>
              </div>
              
              <input type="hidden" id="selected-starter" value="" />
              
              <button id="start-journey-btn" 
                      class="game-pixel-container-clickable-yellow-500 w-full py-3 text-black font-bold hover:brightness-110 transition">
                START YOUR JOURNEY!
              </button>
            </div>
            
            <p id="profile-error" class="text-red-400 text-center text-sm mt-4 hidden"></p>
          </div>
          
          <!-- Guest Profile Creation Form (for offline play) -->
          <div id="guest-profile-form" class="${this.currentView === 'guest-profile' ? '' : 'hidden'}">
            <h2 class="text-xl text-white text-center mb-4" style="text-shadow: 2px 2px 0 #000;">OFFLINE MODE</h2>
            <p class="text-gray-400 text-center text-xs mb-4">Progress saves locally in your browser</p>
            
            <div class="space-y-4">
              <input type="text" id="guest-username" placeholder="Trainer Name" 
                     class="w-full px-4 py-3 bg-gray-700 text-white rounded border-2 border-gray-600 focus:border-yellow-400 outline-none"
                     style="font-family: inherit;" />
              
              <p class="text-gray-300 text-center text-sm">Select your first PokeMeme:</p>
              
              <div class="grid grid-cols-3 gap-2">
                <button id="guest-starter-1" class="guest-starter-btn game-pixel-container-slot-green-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="1">
                  <div class="w-12 h-12 bg-green-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Pepasaur</span>
                  <span class="text-xs text-green-300">Grass</span>
                </button>
                
                <button id="guest-starter-4" class="guest-starter-btn game-pixel-container-slot-orange-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="4">
                  <div class="w-12 h-12 bg-orange-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Bonkander</span>
                  <span class="text-xs text-orange-300">Fire</span>
                </button>
                
                <button id="guest-starter-7" class="guest-starter-btn game-pixel-container-slot-blue-600 p-2 flex flex-col items-center hover:brightness-110"
                        data-starter="7">
                  <div class="w-12 h-12 bg-blue-400 rounded-full mb-1"></div>
                  <span class="text-xs text-white">Dogetle</span>
                  <span class="text-xs text-blue-300">Water</span>
                </button>
              </div>
              
              <input type="hidden" id="guest-selected-starter" value="" />
              
              <button id="guest-start-journey-btn" 
                      class="game-pixel-container-clickable-purple-600 w-full py-3 text-white font-bold hover:brightness-110 transition">
                START OFFLINE ADVENTURE!
              </button>
              
              <p class="text-center text-gray-400 text-sm mt-2">
                <button id="back-to-login" class="text-yellow-400 hover:underline">← Back to Login</button>
              </p>
            </div>
            
            <p id="guest-profile-error" class="text-red-400 text-center text-sm mt-4 hidden"></p>
          </div>
          
          <!-- Loading overlay -->
          <div id="loading-overlay" class="hidden absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="text-white text-center">
              <div class="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
        
        <style>
          .starter-btn.selected,
          .guest-starter-btn.selected {
            border: 3px solid #facc15 !important;
            box-shadow: 0 0 10px #facc15;
          }
        </style>
      </div>
    `;
    
    this.uiContainer = utils.initUIDom(this, uiHTML);
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Toggle between login and signup
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    showSignup?.addEventListener('click', () => {
      document.getElementById('login-form')?.classList.add('hidden');
      document.getElementById('signup-form')?.classList.remove('hidden');
    });
    
    showLogin?.addEventListener('click', () => {
      document.getElementById('signup-form')?.classList.add('hidden');
      document.getElementById('login-form')?.classList.remove('hidden');
    });
    
    // Login
    document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());
    document.getElementById('google-login-btn')?.addEventListener('click', () => this.handleGoogleLogin());
    
    // Signup
    document.getElementById('signup-btn')?.addEventListener('click', () => this.handleSignup());
    
    // Starter selection (online mode)
    document.querySelectorAll('.starter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.starter-btn').forEach(b => b.classList.remove('selected'));
        (e.currentTarget as HTMLElement).classList.add('selected');
        const starterId = (e.currentTarget as HTMLElement).dataset.starter;
        (document.getElementById('selected-starter') as HTMLInputElement).value = starterId || '';
      });
    });
    
    // Start journey (online mode)
    document.getElementById('start-journey-btn')?.addEventListener('click', () => this.handleStartJourney());
    
    // Play Offline button
    document.getElementById('play-offline-btn')?.addEventListener('click', () => this.showGuestProfileForm());
    
    // Guest starter selection
    document.querySelectorAll('.guest-starter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.guest-starter-btn').forEach(b => b.classList.remove('selected'));
        (e.currentTarget as HTMLElement).classList.add('selected');
        const starterId = (e.currentTarget as HTMLElement).dataset.starter;
        (document.getElementById('guest-selected-starter') as HTMLInputElement).value = starterId || '';
      });
    });
    
    // Start guest journey
    document.getElementById('guest-start-journey-btn')?.addEventListener('click', () => this.handleGuestStartJourney());
    
    // Back to login from guest form
    document.getElementById('back-to-login')?.addEventListener('click', () => {
      document.getElementById('guest-profile-form')?.classList.add('hidden');
      document.getElementById('login-form')?.classList.remove('hidden');
      this.isGuestMode = false;
    });
    
    // Enter key for forms
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
    
    document.getElementById('signup-username')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSignup();
    });
    
    document.getElementById('guest-username')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleGuestStartJourney();
    });
  }
  
  private showError(formId: string, message: string): void {
    const errorEl = document.getElementById(`${formId}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }
  
  private hideError(formId: string): void {
    const errorEl = document.getElementById(`${formId}-error`);
    errorEl?.classList.add('hidden');
  }
  
  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    const overlay = document.getElementById('loading-overlay');
    if (loading) {
      overlay?.classList.remove('hidden');
    } else {
      overlay?.classList.add('hidden');
    }
  }
  
  private async handleLogin(): Promise<void> {
    if (this.isLoading) return;
    
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('login-password') as HTMLInputElement)?.value;
    
    if (!email || !password) {
      this.showError('login', 'Please fill in all fields');
      return;
    }
    
    this.setLoading(true);
    this.hideError('login');
    
    const { data, error } = await signIn(email, password);
    
    this.setLoading(false);
    
    if (error) {
      this.showError('login', error.message);
      return;
    }
    
    // Initialize game manager and check for player profile
    const gameManager = GameManager.getInstance();
    await gameManager.initialize();
    
    if (gameManager.playerData) {
      this.scene.start('SatoshiTownScene');
    } else {
      // Show profile creation
      document.getElementById('login-form')?.classList.add('hidden');
      document.getElementById('profile-form')?.classList.remove('hidden');
    }
  }
  
  private async handleGoogleLogin(): Promise<void> {
    if (this.isLoading) return;
    
    this.setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      this.setLoading(false);
      this.showError('login', error.message);
    }
    // OAuth will redirect, so no need to handle success here
  }
  
  private async handleSignup(): Promise<void> {
    if (this.isLoading) return;
    
    const email = (document.getElementById('signup-email') as HTMLInputElement)?.value;
    const password = (document.getElementById('signup-password') as HTMLInputElement)?.value;
    const username = (document.getElementById('signup-username') as HTMLInputElement)?.value;
    
    if (!email || !password || !username) {
      this.showError('signup', 'Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      this.showError('signup', 'Password must be at least 6 characters');
      return;
    }
    
    this.setLoading(true);
    this.hideError('signup');
    
    const { data, error } = await signUp(email, password, username);
    
    this.setLoading(false);
    
    if (error) {
      this.showError('signup', error.message);
      return;
    }
    
    // Show profile creation to select starter
    document.getElementById('signup-form')?.classList.add('hidden');
    document.getElementById('profile-form')?.classList.remove('hidden');
    
    // Pre-fill username
    (document.getElementById('profile-username') as HTMLInputElement).value = username;
  }
  
  private async handleStartJourney(): Promise<void> {
    if (this.isLoading) return;
    
    const username = (document.getElementById('profile-username') as HTMLInputElement)?.value;
    const starterId = (document.getElementById('selected-starter') as HTMLInputElement)?.value;
    
    if (!username) {
      this.showError('profile', 'Please enter a trainer name');
      return;
    }
    
    if (!starterId) {
      this.showError('profile', 'Please select a starter PokeMeme');
      return;
    }
    
    this.setLoading(true);
    this.hideError('profile');
    
    const gameManager = GameManager.getInstance();
    await gameManager.initialize();
    
    const success = await gameManager.createPlayerProfile(username, parseInt(starterId));
    
    this.setLoading(false);
    
    if (!success) {
      this.showError('profile', 'Failed to create profile. Username may be taken.');
      return;
    }
    
    // Start the game!
    this.scene.start('SatoshiTownScene');
  }
  
  // Show guest profile form
  private showGuestProfileForm(): void {
    this.isGuestMode = true;
    
    // Hide all other forms
    document.getElementById('login-form')?.classList.add('hidden');
    document.getElementById('signup-form')?.classList.add('hidden');
    document.getElementById('profile-form')?.classList.add('hidden');
    
    // Show guest profile form
    document.getElementById('guest-profile-form')?.classList.remove('hidden');
    
    // Pre-fill with random guest username
    const guestUsername = generateGuestUsername();
    (document.getElementById('guest-username') as HTMLInputElement).value = guestUsername;
  }
  
  // Handle guest start journey (offline mode)
  private handleGuestStartJourney(): void {
    if (this.isLoading) return;
    
    const username = (document.getElementById('guest-username') as HTMLInputElement)?.value;
    const starterId = (document.getElementById('guest-selected-starter') as HTMLInputElement)?.value;
    
    if (!username) {
      this.showError('guest-profile', 'Please enter a trainer name');
      return;
    }
    
    if (!starterId) {
      this.showError('guest-profile', 'Please select a starter PokeMeme');
      return;
    }
    
    this.setLoading(true);
    this.hideError('guest-profile');
    
    const gameManager = GameManager.getInstance();
    const success = gameManager.createGuestProfile(username, parseInt(starterId));
    
    this.setLoading(false);
    
    if (!success) {
      this.showError('guest-profile', 'Failed to create guest profile. Please try again.');
      return;
    }
    
    // Start the game in offline mode!
    this.scene.start('SatoshiTownScene');
  }
}
