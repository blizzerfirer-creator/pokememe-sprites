import Phaser from 'phaser';
import * as utils from '../utils';

export class TitleScreen extends Phaser.Scene {
  // UI elements
  uiContainer!: Phaser.GameObjects.DOMElement;
  
  // Input controls - HTML event handlers
  keydownHandler?: (event: KeyboardEvent) => void;
  clickHandler?: (event: Event) => void;
  pokedexClickHandler?: (event: Event) => void;
  
  // Audio
  backgroundMusic!: Phaser.Sound.BaseSound;
  
  // State flags
  isStarting: boolean = false;

  constructor() {
    super({
      key: "TitleScreen",
    });
    this.isStarting = false;
  }

  init(): void {
    // Reset start flag
    this.isStarting = false;
  }

  create(): void {
    // Initialize sounds first
    this.initializeSounds();
    
    // Create DOM UI (includes background)
    this.createDOMUI();

    // Set up input controls
    this.setupInputs();

    // Play background music
    this.playBackgroundMusic();
    
    // Listen for scene shutdown to cleanup event listeners
    this.events.once('shutdown', () => {
      this.cleanupEventListeners();
    });
  }

  createDOMUI(): void {
    let uiHTML = `
      <div id="title-screen-container" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[1000] font-retro flex flex-col items-center"
           style="image-rendering: pixelated; background: radial-gradient(ellipse at 50% 20%, #1e2a4a 0%, #0d1117 50%, #000000 100%);">

        <!-- Animated stars background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="star" style="top: 3%; left: 8%; width: 3px; height: 3px; animation-delay: 0s;"></div>
          <div class="star" style="top: 7%; left: 22%; width: 2px; height: 2px; animation-delay: 0.5s;"></div>
          <div class="star" style="top: 12%; left: 42%; width: 3px; height: 3px; animation-delay: 1.2s;"></div>
          <div class="star" style="top: 5%; left: 65%; width: 2px; height: 2px; animation-delay: 0.3s;"></div>
          <div class="star" style="top: 15%; left: 80%; width: 3px; height: 3px; animation-delay: 0.8s;"></div>
          <div class="star" style="top: 20%; left: 15%; width: 2px; height: 2px; animation-delay: 1.5s;"></div>
          <div class="star" style="top: 9%; left: 55%; width: 2px; height: 2px; animation-delay: 0.7s;"></div>
          <div class="star" style="top: 25%; left: 90%; width: 3px; height: 3px; animation-delay: 1.0s;"></div>
          <div class="star" style="top: 18%; left: 35%; width: 2px; height: 2px; animation-delay: 0.2s;"></div>
          <div class="star" style="top: 2%; left: 75%; width: 3px; height: 3px; animation-delay: 1.8s;"></div>
          <div class="star" style="top: 30%; left: 5%; width: 2px; height: 2px; animation-delay: 0.9s;"></div>
          <div class="star" style="top: 22%; left: 48%; width: 2px; height: 2px; animation-delay: 1.3s;"></div>
        </div>

        <!-- Main Content -->
        <div class="flex flex-col items-center justify-between w-full text-center pointer-events-auto h-full" style="padding: 5% 0 3% 0;">

          <!-- Title Section -->
          <div class="flex flex-col items-center flex-shrink-0">
            <h1 id="game-title" class="font-supercell" style="
              font-size: clamp(48px, 10vw, 80px);
              font-weight: 900;
              letter-spacing: 4px;
              background: linear-gradient(180deg, #FFE259 0%, #FFA751 40%, #FF6B35 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              filter: drop-shadow(0 0 20px rgba(255,165,0,0.4)) drop-shadow(3px 3px 0 rgba(0,0,0,0.9));
              line-height: 1.1;
            ">POKEMEME</h1>
            <div style="
              width: 60%;
              height: 3px;
              background: linear-gradient(90deg, transparent, #FFE259, #FFA751, #FFE259, transparent);
              margin: 8px auto;
              border-radius: 2px;
            "></div>
            <p class="font-retro" style="
              font-size: clamp(14px, 3vw, 20px);
              color: #7dd3fc;
              text-shadow: 0 0 10px rgba(125,211,252,0.5), 2px 2px 0 #000;
              letter-spacing: 2px;
            ">GOTTA MEME 'EM ALL!</p>
          </div>

          <!-- Starters Showcase -->
          <div class="flex items-end justify-center gap-4 flex-shrink-0" style="margin: 4% 0;">
            <!-- Pepasaur (PEPE) -->
            <div class="starter-card" style="animation-delay: 0s;">
              <div class="starter-glow" style="background: radial-gradient(circle, rgba(76,175,80,0.3) 0%, transparent 70%);"></div>
              <img src="/assets/pokememe_sprites/001_pepasaur.png" alt="Pepasaur" class="starter-sprite" style="image-rendering: pixelated;" />
              <span class="starter-label" style="color: #66BB6A;">PEPE</span>
            </div>

            <!-- Bonkander (BONK) - center, slightly larger -->
            <div class="starter-card center-starter" style="animation-delay: 0.15s;">
              <div class="starter-glow" style="background: radial-gradient(circle, rgba(255,152,0,0.3) 0%, transparent 70%);"></div>
              <img src="/assets/pokememe_sprites/004_bonkander.png" alt="Bonkander" class="starter-sprite starter-sprite-center" style="image-rendering: pixelated;" />
              <span class="starter-label" style="color: #FFA726;">BONK</span>
            </div>

            <!-- Dogetle (DOGE) -->
            <div class="starter-card" style="animation-delay: 0.3s;">
              <div class="starter-glow" style="background: radial-gradient(circle, rgba(66,165,245,0.3) 0%, transparent 70%);"></div>
              <img src="/assets/pokememe_sprites/007_dogetle.png" alt="Dogetle" class="starter-sprite" style="image-rendering: pixelated;" />
              <span class="starter-label" style="color: #42A5F5;">DOGE</span>
            </div>
          </div>

          <!-- Press Enter -->
          <div class="flex flex-col items-center flex-shrink-0">
            <div id="press-enter-text" class="font-retro" style="
              font-size: clamp(20px, 5vw, 36px);
              color: #fff;
              text-shadow: 0 0 15px rgba(255,255,255,0.3), 3px 3px 0 #000;
              animation: titleBlink 1.2s ease-in-out infinite alternate;
              letter-spacing: 3px;
            ">PRESS ENTER</div>
            <span class="font-retro" style="
              font-size: clamp(10px, 2.5vw, 16px);
              color: #94a3b8;
              margin-top: 6px;
            ">or Click Anywhere</span>
          </div>

          <!-- Pokedex Button -->
          <button id="pokedex-btn" class="font-retro pointer-events-auto" style="
            font-size: clamp(12px, 2.5vw, 16px);
            padding: 10px 24px;
            background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
            color: #fff;
            border: 3px solid #7f1d1d;
            border-radius: 8px;
            text-shadow: 1px 1px 0 #000;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 0 #7f1d1d, 0 6px 12px rgba(0,0,0,0.4);
            letter-spacing: 1px;
          ">VIEW POKEDEX (151 PokeMemes)</button>

          <!-- Footer -->
          <div class="flex flex-col items-center flex-shrink-0" style="gap: 2px;">
            <p class="font-retro" style="font-size: 11px; color: #475569;">Meme Edition v1.0 &bull; 151 PokeMemes</p>
            <p class="font-retro" style="font-size: 9px; color: #334155;">A Parody Game &bull; Not affiliated with Nintendo</p>
          </div>
        </div>

        <!-- Styles -->
        <style>
          @keyframes titleBlink {
            from { opacity: 0.3; }
            to { opacity: 1; }
          }

          @keyframes starTwinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          @keyframes floatStarter {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          #game-title {
            animation: fadeSlideUp 0.8s ease-out both;
          }

          .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: starTwinkle 2s ease-in-out infinite;
          }

          .starter-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            animation: fadeSlideUp 0.6s ease-out both, floatStarter 3s ease-in-out infinite;
          }

          .starter-glow {
            position: absolute;
            width: 140%;
            height: 140%;
            top: -20%;
            left: -20%;
            pointer-events: none;
          }

          .starter-sprite {
            width: clamp(80px, 18vw, 130px);
            height: clamp(80px, 18vw, 130px);
            object-fit: contain;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
            pointer-events: none;
          }

          .starter-sprite-center {
            width: clamp(96px, 22vw, 150px);
            height: clamp(96px, 22vw, 150px);
          }

          .starter-label {
            font-family: 'RetroPixel', monospace;
            font-size: clamp(11px, 2.5vw, 16px);
            font-weight: bold;
            text-shadow: 1px 1px 0 #000, 0 0 8px currentColor;
            margin-top: 4px;
            letter-spacing: 2px;
          }

          #pokedex-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 #7f1d1d, 0 8px 16px rgba(0,0,0,0.5);
            filter: brightness(1.1);
          }

          #pokedex-btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #7f1d1d, 0 3px 6px rgba(0,0,0,0.3);
          }
        </style>
      </div>
    `;

    // Add DOM element to the scene
    this.uiContainer = utils.initUIDom(this, uiHTML);
  }

  setupInputs(): void {
    // Add HTML event listeners for keyboard and mouse events
    const handleStart = (event: Event) => {
      event.preventDefault();
      this.startGame();
    };

    // Listen for Enter and Space key events on the document
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        this.startGame();
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Add click event to the UI container
    if (this.uiContainer && this.uiContainer.node) {
      this.uiContainer.node.addEventListener('click', handleStart);
    }

    // Store event listeners for cleanup
    this.keydownHandler = handleKeyDown;
    this.clickHandler = handleStart;
    
    // Add PokeDex button handler after a small delay to ensure DOM is ready
    this.time.delayedCall(100, () => {
      const pokedexBtn = document.getElementById('pokedex-btn');
      if (pokedexBtn) {
        const pokedexHandler = (event: Event) => {
          event.stopPropagation(); // Prevent triggering the container click
          this.openPokedexGallery();
        };
        pokedexBtn.addEventListener('click', pokedexHandler);
        this.pokedexClickHandler = pokedexHandler;
      }
    });
  }

  initializeSounds(): void {
    // Initialize background music
    this.backgroundMusic = this.sound.add("satoshi_town_theme", {
      volume: 0.4,
      loop: true
    });
  }

  playBackgroundMusic(): void {
    // Play the initialized background music
    if (this.backgroundMusic) {
      this.backgroundMusic.play();
    }
  }

  startGame(): void {
    // Prevent multiple triggers
    if (this.isStarting) return;
    this.isStarting = true;

    // Play UI sound
    const clickSound = this.sound.add('ui_confirm', { volume: 0.5 });
    clickSound.play();

    // Clean up event listeners
    this.cleanupEventListeners();

    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    // Add transition effect
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    // Start auth scene after delay
    this.time.delayedCall(500, () => {
      this.scene.start('AuthScene');
    });
  }

  cleanupEventListeners(): void {
    // Remove HTML event listeners
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    
    if (this.clickHandler && this.uiContainer && this.uiContainer.node) {
      this.uiContainer.node.removeEventListener('click', this.clickHandler);
    }
    
    // Remove PokeDex button handler
    const pokedexBtn = document.getElementById('pokedex-btn');
    if (this.pokedexClickHandler && pokedexBtn) {
      pokedexBtn.removeEventListener('click', this.pokedexClickHandler);
    }
  }

  openPokedexGallery(): void {
    // Prevent if already starting something
    if (this.isStarting) return;
    this.isStarting = true;

    // Play UI sound
    const clickSound = this.sound.add('ui_confirm', { volume: 0.5 });
    clickSound.play();

    // Clean up event listeners
    this.cleanupEventListeners();

    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    // Add transition effect
    this.cameras.main.fadeOut(300, 0, 0, 0);
    
    // Start PokeDex Gallery scene
    this.time.delayedCall(300, () => {
      this.scene.start('PokedexGalleryScene');
    });
  }

  update(): void {
    // Title screen doesn't need special update logic
  }
}
