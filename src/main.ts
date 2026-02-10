import Phaser from "phaser";
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json";
import "./styles/tailwind.css";
import { Preloader } from "./scenes/Preloader";
import { TitleScreen } from "./scenes/TitleScreen";
import { AuthScene } from "./scenes/AuthScene";
import { SatoshiTownScene } from "./scenes/SatoshiTownScene";
import { EthereumForestScene } from "./scenes/EthereumForestScene";
import { SolanaCavesScene } from "./scenes/SolanaCavesScene";
import { PumpBeachScene } from "./scenes/PumpBeachScene";
import { BattleScene } from "./scenes/BattleScene";
import { WorldUIScene } from "./scenes/WorldUIScene";
import { VictoryUIScene } from "./scenes/VictoryUIScene";
import { GameCompleteUIScene } from "./scenes/GameCompleteUIScene";
import { GameOverUIScene } from "./scenes/GameOverUIScene";
import { BattleUIScene } from "./scenes/BattleUIScene";
import { PokedexGalleryScene } from "./scenes/PokedexGalleryScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: screenSize.width.value,
  height: screenSize.height.value,
  backgroundColor: "#1a1a2e",
  parent: 'game-container',
  dom: {
    createContainer: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debug.value,
      debugShowStaticBody: debugConfig.debug.value,
      debugShowVelocity: debugConfig.debug.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
};

const game = new Phaser.Game(config);

// Strictly add scenes in the following order: Preloader, TitleScreen, Auth, level scenes, UI-related scenes

// Preloader: Load all game resources
game.scene.add("Preloader", Preloader, true);

// TitleScreen
game.scene.add("TitleScreen", TitleScreen);

// Auth Scene
game.scene.add("AuthScene", AuthScene);

// World/Level scenes
game.scene.add("SatoshiTownScene", SatoshiTownScene);
game.scene.add("EthereumForestScene", EthereumForestScene);
game.scene.add("SolanaCavesScene", SolanaCavesScene);
game.scene.add("PumpBeachScene", PumpBeachScene);

// Battle scene
game.scene.add("BattleScene", BattleScene);

// UI-related scenes
game.scene.add("WorldUIScene", WorldUIScene);
game.scene.add("BattleUIScene", BattleUIScene);
game.scene.add("VictoryUIScene", VictoryUIScene);
game.scene.add("GameCompleteUIScene", GameCompleteUIScene);
game.scene.add("GameOverUIScene", GameOverUIScene);
game.scene.add("PokedexGalleryScene", PokedexGalleryScene);
