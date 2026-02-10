import Phaser from 'phaser';
import * as utils from '../utils';
import { pokememeDatabase } from '../data/pokememeIndex';
import type { PokeMemeType } from '../data/pokememeIndex';

// Type color mapping for visual display
const typeColors: { [key in PokeMemeType]: string } = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC'
};

export class PokedexGalleryScene extends Phaser.Scene {
  // UI elements
  uiContainer!: Phaser.GameObjects.DOMElement;
  
  // Input handlers
  keydownHandler?: (event: KeyboardEvent) => void;
  
  constructor() {
    super({
      key: 'PokedexGalleryScene'
    });
  }

  create(): void {
    // Create DOM UI
    this.createDOMUI();
    
    // Setup input handlers
    this.setupInputs();
    
    // Listen for scene shutdown
    this.events.once('shutdown', () => {
      this.cleanupEventListeners();
    });
  }

  createDOMUI(): void {
    // Generate all PokeMeme cards HTML
    const pokememeCardsHTML = pokememeDatabase.map(pokememe => {
      const primaryType = pokememe.types[0];
      const primaryColor = typeColors[primaryType];
      const secondaryType = pokememe.types[1];
      const secondaryColor = secondaryType ? typeColors[secondaryType] : null;
      
      // Generate type badges
      const typeBadges = pokememe.types.map(type => 
        `<span class="px-2 py-0.5 rounded text-xs font-bold text-white" 
               style="background-color: ${typeColors[type]}; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);">
          ${type}
        </span>`
      ).join(' ');
      
      // Create gradient if dual type
      const bgGradient = secondaryColor 
        ? `linear-gradient(135deg, ${primaryColor}40 0%, ${secondaryColor}40 100%)`
        : `${primaryColor}30`;
      
      // Truncate description if too long
      const shortDesc = pokememe.description.length > 100 
        ? pokememe.description.substring(0, 97) + '...'
        : pokememe.description;

      return `
        <div class="pokememe-card game-pixel-container-gray-800 p-3 flex flex-col items-center transition-all duration-200 hover:scale-105 cursor-pointer"
             style="min-width: 180px; max-width: 180px; background: ${bgGradient}; border: 2px solid ${primaryColor};">
          
          <!-- PokeDex Number -->
          <div class="w-full flex justify-between items-center mb-1">
            <span class="text-xs text-gray-400 font-bold">#${String(pokememe.id).padStart(3, '0')}</span>
            <span class="text-xs text-yellow-400" title="Meme Token">${pokememe.memeToken}</span>
          </div>
          
          <!-- Sprite Image -->
          <div class="w-20 h-20 flex items-center justify-center mb-2 rounded overflow-hidden"
               style="background: ${primaryColor}20; border: 2px solid ${primaryColor};">
            <img src="assets/pokememe_sprites/${String(pokememe.id).padStart(3, '0')}_${pokememe.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png"
                 alt="${pokememe.name}"
                 class="w-full h-full object-contain"
                 style="image-rendering: pixelated;"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-2xl font-bold text-white\\' style=\\'text-shadow: 2px 2px 0 rgba(0,0,0,0.5)\\'>${pokememe.name.charAt(0)}</span>';" />
          </div>
          
          <!-- Name -->
          <h3 class="text-sm font-bold text-white text-center mb-1 truncate w-full" 
              style="text-shadow: 1px 1px 0 #000;">
            ${pokememe.name}
          </h3>
          
          <!-- Original Name -->
          <p class="text-xs text-gray-400 mb-2 truncate w-full text-center">
            (${pokememe.originalName})
          </p>
          
          <!-- Types -->
          <div class="flex gap-1 mb-2 flex-wrap justify-center">
            ${typeBadges}
          </div>
          
          <!-- Stats Summary -->
          <div class="w-full grid grid-cols-3 gap-1 text-xs mb-2">
            <div class="text-center">
              <span class="text-red-400">HP</span>
              <span class="text-white block">${pokememe.baseStats.hp}</span>
            </div>
            <div class="text-center">
              <span class="text-orange-400">ATK</span>
              <span class="text-white block">${pokememe.baseStats.attack}</span>
            </div>
            <div class="text-center">
              <span class="text-blue-400">SPD</span>
              <span class="text-white block">${pokememe.baseStats.speed}</span>
            </div>
          </div>
          
          <!-- Signature Move -->
          <div class="w-full bg-black bg-opacity-40 rounded p-1 mb-2">
            <p class="text-xs text-yellow-300 font-bold truncate" title="${pokememe.signatureMove.name}">
              ⚡ ${pokememe.signatureMove.name}
            </p>
            <p class="text-xs text-gray-300">
              PWR: ${pokememe.signatureMove.power} | ACC: ${pokememe.signatureMove.accuracy}%
            </p>
          </div>
          
          <!-- Meme Lore Description -->
          <div class="w-full flex-grow">
            <p class="text-xs text-gray-300 leading-tight" style="font-size: 10px;">
              ${shortDesc}
            </p>
          </div>
          
          <!-- Evolution Info -->
          ${pokememe.evolutionLevel ? `
            <div class="w-full mt-2 pt-1 border-t border-gray-600">
              <p class="text-xs text-green-400">
                Evolves Lv.${pokememe.evolutionLevel} → #${String(pokememe.evolvesTo).padStart(3, '0')}
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const uiHTML = `
      <div id="pokedex-gallery-container" class="fixed top-0 left-0 w-full h-full z-[1000] font-retro flex flex-col"
           style="background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);">
        
        <!-- Header -->
        <div class="flex-shrink-0 p-4 border-b-4 border-red-600" 
             style="background: linear-gradient(90deg, #e94560, #ff6b6b);">
          <div class="flex items-center justify-between max-w-screen-xl mx-auto">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center border-4 border-gray-800">
                <span class="text-2xl">📖</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white" style="text-shadow: 3px 3px 0 #000;">
                  POKEMEME DEX
                </h1>
                <p class="text-sm text-yellow-200">All 151 Crypto Meme Creatures</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-white text-sm">Total Discovered</p>
                <p class="text-2xl font-bold text-yellow-300" style="text-shadow: 2px 2px 0 #000;">151/151</p>
              </div>
              <button id="close-btn" 
                      class="game-pixel-container-clickable-gray-700 px-4 py-2 text-white font-bold hover:bg-gray-600 transition-colors pointer-events-auto"
                      style="font-size: 14px;">
                ✕ CLOSE (ESC)
              </button>
            </div>
          </div>
        </div>
        
        <!-- Type Filter Bar -->
        <div class="flex-shrink-0 p-3 bg-gray-900 border-b-2 border-gray-700 overflow-x-auto">
          <div class="flex gap-2 justify-center flex-wrap max-w-screen-xl mx-auto">
            <button class="type-filter-btn px-3 py-1 rounded text-xs font-bold text-white bg-gray-600 hover:bg-gray-500 transition-colors pointer-events-auto active" 
                    data-type="all">
              ALL
            </button>
            ${Object.entries(typeColors).map(([type, color]) => `
              <button class="type-filter-btn px-3 py-1 rounded text-xs font-bold text-white hover:opacity-80 transition-all pointer-events-auto"
                      data-type="${type}"
                      style="background-color: ${color}; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);">
                ${type}
              </button>
            `).join('')}
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="flex-shrink-0 p-3 bg-gray-800">
          <div class="max-w-md mx-auto flex gap-2">
            <input type="text" 
                   id="search-input"
                   placeholder="Search by name, number, or meme token..."
                   class="flex-grow px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border-2 border-gray-600 focus:border-yellow-400 outline-none pointer-events-auto"
                   style="font-size: 14px;">
            <button id="clear-search-btn"
                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors pointer-events-auto">
              Clear
            </button>
          </div>
        </div>
        
        <!-- Stats Summary Bar -->
        <div class="flex-shrink-0 p-2 bg-gray-850 border-b border-gray-700">
          <div class="max-w-screen-xl mx-auto flex justify-center gap-6 text-sm">
            <span class="text-gray-400">
              <span class="text-green-400 font-bold" id="showing-count">151</span> showing
            </span>
            <span class="text-gray-400">
              🔥 Fire: <span class="text-orange-400 font-bold">12</span>
            </span>
            <span class="text-gray-400">
              💧 Water: <span class="text-blue-400 font-bold">32</span>
            </span>
            <span class="text-gray-400">
              ⚡ Electric: <span class="text-yellow-400 font-bold">9</span>
            </span>
            <span class="text-gray-400">
              🌿 Grass: <span class="text-green-400 font-bold">14</span>
            </span>
          </div>
        </div>
        
        <!-- Scrollable Gallery Grid -->
        <div id="gallery-scroll-container" 
             class="flex-grow overflow-y-auto p-4 pointer-events-auto"
             style="scrollbar-width: thin; scrollbar-color: #e94560 #1a1a2e;">
          <div id="pokememe-grid" 
               class="grid gap-4 max-w-screen-xl mx-auto justify-items-center"
               style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
            ${pokememeCardsHTML}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex-shrink-0 p-2 bg-gray-900 border-t-2 border-gray-700 text-center">
          <p class="text-xs text-gray-500">
            Scroll to explore • Click cards for details • Press ESC to close
          </p>
        </div>
        
        <!-- Custom scrollbar styles -->
        <style>
          #gallery-scroll-container::-webkit-scrollbar {
            width: 12px;
          }
          #gallery-scroll-container::-webkit-scrollbar-track {
            background: #1a1a2e;
          }
          #gallery-scroll-container::-webkit-scrollbar-thumb {
            background: #e94560;
            border-radius: 6px;
            border: 2px solid #1a1a2e;
          }
          #gallery-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #ff6b6b;
          }
          
          .pokememe-card {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .pokememe-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 8px 20px rgba(233, 69, 96, 0.3);
          }
          
          .type-filter-btn.active {
            ring: 2px solid white;
            transform: scale(1.1);
          }
          
          .hidden-card {
            display: none !important;
          }
        </style>
      </div>
    `;

    this.uiContainer = utils.initUIDom(this, uiHTML);
    
    // Setup interactive elements after DOM is created
    this.time.delayedCall(100, () => {
      this.setupInteractiveElements();
    });
  }

  setupInteractiveElements(): void {
    // Close button
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeGallery();
      });
    }
    
    // Type filter buttons
    const filterBtns = document.querySelectorAll('.type-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.dataset.type;
        
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        
        // Filter cards
        this.filterByType(type || 'all');
      });
    });
    
    // Search input
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.filterBySearch(target.value);
      });
    }
    
    // Clear search button
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.value = '';
          this.filterBySearch('');
        }
      });
    }
  }

  filterByType(type: string): void {
    const cards = document.querySelectorAll('.pokememe-card');
    let showCount = 0;
    
    cards.forEach((card, index) => {
      const pokememe = pokememeDatabase[index];
      const shouldShow = type === 'all' || pokememe.types.includes(type as PokeMemeType);
      
      if (shouldShow) {
        card.classList.remove('hidden-card');
        showCount++;
      } else {
        card.classList.add('hidden-card');
      }
    });
    
    // Update showing count
    const showingCount = document.getElementById('showing-count');
    if (showingCount) {
      showingCount.textContent = String(showCount);
    }
  }

  filterBySearch(query: string): void {
    const cards = document.querySelectorAll('.pokememe-card');
    const lowerQuery = query.toLowerCase().trim();
    let showCount = 0;
    
    cards.forEach((card, index) => {
      const pokememe = pokememeDatabase[index];
      const matchesName = pokememe.name.toLowerCase().includes(lowerQuery);
      const matchesOriginal = pokememe.originalName.toLowerCase().includes(lowerQuery);
      const matchesToken = pokememe.memeToken.toLowerCase().includes(lowerQuery);
      const matchesNumber = String(pokememe.id).padStart(3, '0').includes(lowerQuery) || 
                           String(pokememe.id) === lowerQuery;
      const matchesType = pokememe.types.some(t => t.toLowerCase().includes(lowerQuery));
      
      const shouldShow = lowerQuery === '' || matchesName || matchesOriginal || matchesToken || matchesNumber || matchesType;
      
      if (shouldShow) {
        card.classList.remove('hidden-card');
        showCount++;
      } else {
        card.classList.add('hidden-card');
      }
    });
    
    // Update showing count
    const showingCount = document.getElementById('showing-count');
    if (showingCount) {
      showingCount.textContent = String(showCount);
    }
    
    // Reset type filter buttons
    const filterBtns = document.querySelectorAll('.type-filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('.type-filter-btn[data-type="all"]');
    if (allBtn) {
      allBtn.classList.add('active');
    }
  }

  setupInputs(): void {
    // Handle ESC key to close
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        this.closeGallery();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    this.keydownHandler = handleKeyDown;
  }

  closeGallery(): void {
    // Play close sound if available
    if (this.sound.get('ui_click')) {
      this.sound.play('ui_click', { volume: 0.3 });
    }
    
    // Clean up
    this.cleanupEventListeners();
    
    // Fade out and return to title
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('TitleScreen');
    });
  }

  cleanupEventListeners(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

  update(): void {
    // No update needed for static gallery
  }
}
